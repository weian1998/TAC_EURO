/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define, sessionStorage */
define([
        'dojo/_base/declare',
        'Sage/_Templated',
        'dijit/_Widget',
        'Sage/Utility',
        'Sage/Utility/Activity',
        'dojo/string',
        'dojox/storage/LocalStorageProvider',
        'dojo/date',
        'dijit/form/ComboButton',
        'dojo/_base/event',
        'dojo/_base/lang',
        'dojo/dom-class',
        'Sage/Data/SDataServiceRegistry',
        'Sage/UI/Alarms/AlarmPopup',
        'Sage/UI/ImageButton',
        'Sage/Services/UserOptions'
],
function (
    declare,
    _Templated,
    _Widget,
    utility,
    activityUtility,
    dString,
    LocalStorageProvider,
    ddate,
    ComboButton,
    event,
    lang,
    domClass,
    sDataServiceRegistry) {
    var alarmButton = declare('Sage.UI.Alarms.AlarmButton', [_Widget, _Templated], {
        pastDueToolTipFmt: ' You have ${0} activities that are past due.',
        pastDueButtonIconClass: 'icon_alertIcon_16x16',
        widgetsInTemplate: true,
        options: {
            displayPastDueInToolbar: true,
            displayAlertsInToolbar: true,
            promptAlerts: true,
            includeAlarms: true,
            includeConfirmations: true,
            defaultSnooze: '5'
        },
        pollInterval: 1,
        _localStore: null,
        _alertCountKey: 'AlertsCount',
        _pastDueCountKey: 'PastDueCount',
        _started: false,
        _pastDueVisible: false,
        _alertBtnVisible: false,
        widgetTemplate: new Simplate([
            '<span class="alarm-button-container">',
                '<button data-dojo-type="Sage.UI.ImageButton" id="pastDueButton" imageClass="{%= $.pastDueButtonIconClass %}" class="past-due-button display-none" data-dojo-attach-point="_pastDueBtn" data-dojo-attach-event="onClick:_pastDueClick" >',
                '</button>',
                '<span id="alertButton" data-dojo-attach-point="_alertButton" class="alarm-button-container alarm-button display-none">', // displaynone
                    '<button data-dojo-type="dijit.form.ComboButton" data-dojo-attach-point="_button" data-dojo-attach-event="onClick:_cboClick" class="" >',
                        '<div data-dojo-type="Sage.UI.Alarms.AlarmPopup" id="alarmPopup" data-dojo-attach-point="_popup" data-dojo-attach-event="onClose:_popupClosed"></div>',
                    '</button>',
                '</span>',
            '</span>'
        ]),
        _setPollIntervalAttr: function (val) {
            this.pollInterval = val;
        },
        _getPollIntervalAttr: function () {
            return this.pollInterval;
        },
        startup: function () {
            if (this._started) {
                return;
            }
            this.inherited(arguments);
            this.connect(this._popup, 'onAlertChanged', this._alarmChanged);

            var optionsSvc = Sage.Services.getService('UserOptions');
            if (optionsSvc) {
                optionsSvc.getByCategory('ActivityAlarm', this._receivedOptions, this);
            }
            this._localStore = new LocalStorageProvider();
            this._localStore.initialize();

            //The ComboButton click causes a weird postback in IE8 in our environment
            // stopping the event in the button's valueNode stops that...
            if (this._button.valueNode) {
                this.connect(this._button.valueNode, 'click', function (e) {
                    event.stop(e);
                });
            }
        },
        _receivedOptions: function (options) {
            this._sortOptions(options['$resources'] || options);
            this._popup.set('options', this.options);
            //setting pollInterval to 0 will turn off the alarms for everybody regardless of the user options
            if ((this.options.displayPastDueInToolbar || this.options.displayAlertsInToolbar)
                && (this.pollInterval > 0)) {
                var self = this;
                window.setTimeout(function () {
                    self._poll();
                },
                15000);
                this._initializeButton();
            }
            this._started = true;
        },
        _sortOptions: function (options) {
            var evaluateBool = function (strVal) {
                return ((strVal === 'T') || (strVal === 'Y') || (strVal === '1'));
            };
            for (var i = 0; i < options.length; i++) {
                var option = options[i];
                switch (option.name) {
                    case 'DisplayPastDueInToolbar':
                        this.options.displayPastDueInToolbar = evaluateBool(option.value);
                        break;
                    case 'DisplayAlertsInToolbar':
                        this.options.displayAlertsInToolbar = evaluateBool(option.value);
                        break;
                    case 'PromptAlerts':
                        this.options.promptAlerts = evaluateBool(option.value);
                        break;
                    case 'DisplayAlertAlarms':
                        this.options.includeAlarms = evaluateBool(option.value);
                        break;
                    case 'DisplayAlertConfirmations':
                        this.options.includeConfirmations = evaluateBool(option.value);
                        break;
                    case 'DefaultSnooze':
                        this.options.defaultSnooze = option.value;
                        break;
                }
            }
            if (!this.options.includeAlarms && !this.options.includeConfirmations) {
                //no sense prompting anything if there is nothing to show...
                this.options.promptAlerts = false;
            }
        },
        _poll: function () {
            var req = new Sage.SData.Client.SDataNamedQueryRequest(sDataServiceRegistry.getSDataService('mashups'))
                .setApplicationName('$app')
                .setResourceKind('mashups')
                .setQueryName('execute')
                .setQueryArg('_resultName', 'GetCounts')
                .setQueryArg('_beforeDate', utility.Convert.toIsoStringFromDate(new Date()))
                .setQueryArg('_timelessBeforeDate', activityUtility.formatTimelessEndDate(new Date(), 'day', -1))
                .setQueryArg('_userId', utility.getClientContextByKey('userID'));
            req.uri.setCollectionPredicate("'RemindersAndAlarms'");
            req.read({
                success: lang.hitch(this, this._onReceiveCounts),
                failure: lang.hitch(this, this._countsFailed)
            });
        },
        _onReceiveCounts: function (data) {
            var resources = data['$resources'];
            if (resources && resources.length > 0) {
                var counts = resources[0];
                var alarms = (this.options.includeAlarms) ? counts['ringingAlarms'] : 0;
                var confs = (this.options.includeConfirmations) ? counts['notifications'] : 0;
                var pastDues = counts['pastDue'];

                this._handlePastDueCount(pastDues);
                this._handleAlertCount(alarms, confs);
            }
            var self = this;
            window.setTimeout(function () {
                self._poll();
            },
            this.pollInterval * 60000);
        },
        _countsFailed: function (req) {
            console.warn('could not acquire notification counts... %o', req);
        },
        /* Past Due button handling...   */
        _handlePastDueCount: function (pastDues) {
            if (pastDues > 0 && this.options.displayPastDueInToolbar) {
                this._showPastDue();
                var savedPastDues = this._getFromSessionStorage(this._pastDueCountKey) || 0;
                if (pastDues != savedPastDues) {
                    this._pastDueBtn.set('title', dString.substitute(this.pastDueToolTipFmt, [pastDues]));
                    this._pastDueBtn.set('label', pastDues);
                    this._saveToSessionStorage(this._pastDueCountKey, pastDues);
                }
            } else {
                this._hidePastDue();
            }
        },
        _showPastDue: function () {
            if (!this._pastDueVisible) {
                domClass.remove(this._pastDueBtn.domNode, 'display-none');
                this._pastDueVisible = true;
            }
        },
        _hidePastDue: function () {
            if (this._pastDueVisible) {
                domClass.add(this._pastDueBtn.domNode, 'display-none');
                this._pastDueVisible = false;
                this._pastDueBtn.set('title', '');
                this._pastDueBtn.set('label', '');
            }
        },
        _pastDueClick: function () {
            Sage.Link.toActivityListView('pastdue');
        },
        /* Alert handling...   */
        _initializeButton: function () {
            var savedPastDues = this._getFromSessionStorage(this._pastDueCountKey) || 0;
            if (this.options.displayPastDueInToolbar && (savedPastDues) > 0) {
                this._showPastDue();
                this._pastDueBtn.set('title', dString.substitute(this.pastDueToolTipFmt, [savedPastDues]));
                this._pastDueBtn.set('label', savedPastDues);
            }
            var savedAlertCount = this._getFromSessionStorage(this._alertCountKey) || 0;
            if (this.options.displayAlertsInToolbar && (savedAlertCount) > 0) {
                this._button.set('label', ' ' + savedAlertCount + ' ');
                this._showAlertButton();
            }
        },
        _handleAlertCount: function (alarms, confs) {
            if (this.options.displayAlertsInToolbar) {
                if (alarms > 0 || confs > 0) {
                    var countChanged = false;
                    var savedAlertCount = this._getFromSessionStorage(this._alertCountKey) || 0;
                    if ((savedAlertCount * 1) !== (alarms + confs)) {
                        countChanged = true;
                    }
                    savedAlertCount = alarms + confs;
                    this._saveToSessionStorage(this._alertCountKey, savedAlertCount);
                    this._button.set('label', ' ' + savedAlertCount + ' ');
                    this._showAlertButton();
                    this._checkShowPopup(countChanged, savedAlertCount);
                } else {
                    this._hideAlertButton();
                }
            }
        },
        _showAlertButton: function () {
            if (!this._alertBtnVisible) {
                domClass.remove(this._alertButton, 'display-none');
                this._alertBtnVisible = true;
            }
        },
        _hideAlertButton: function () {
            if (this._alertBtnVisible) {
                domClass.add(this._alertButton, 'display-none');
                this._alertBtnVisible = false;
            }
        },
        _checkShowPopup: function (countChanged, newCount) {
            if (!this.options.promptAlerts) {
                return;
            }
            if (countChanged) {
                this._popup._dataRequested = false;
            }
            //Removed the check "_haveWaitedLongEnough" to avoid the popup opening every 5 minutes
            if (!this._popup.isOpen && newCount > 0 && countChanged) {
                this._button.openDropDown();
            }
        },
        _cboClick: function (e) {
            (this._popup.isOpen) ? this._button.closeDropDown() : this._button.openDropDown();
            return false;
        },
        _popupClosed: function () {

        },
        _alarmChanged: function () {
            var items = this._popup.getAlertCount();
            if (items === 0) {
                dijit.popup.hide(this._popup);
                this._hideAlertButton();
            } else { 
                this._showAlertButton();
            }
            this._button.set('label', ' ' + items + ' ');
            this._saveToSessionStorage(this._alertCountKey, items);
        },
        _saveToSessionStorage: function (key, value) {
            sessionStorage.setItem(key, value);
        },
        _getFromSessionStorage: function (key) {
            return sessionStorage.getItem(key);
        }
    });

    return alarmButton;
});

