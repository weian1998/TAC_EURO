/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/_Widget',
    'dijit/layout/ContentPane',
    'Sage/Data/WritableSDataStore',
    'Sage/Data/SDataServiceRegistry',
    'Sage/Utility',
    'dojo/string',
    'Sage/UI/Alarms/AlarmPane',
    'Sage/UI/Alarms/UnconfirmedPane',
    'Sage/UI/ImageButton',
    'dojo/i18n',
    'dojo/i18n!./nls/AlarmPopup',
    'dojo/_base/declare'
],
function (_TemplatedMixin,
    _WidgetsInTemplateMixin,
    _Widget,
    contentPane,
    writableSDataStore,
    sDataServiceRegistry,
    utility,
    dstring,
    AlarmPane,
    UnconfirmedPane,
    ImageButton,
    i18n,
    popupStrings,
    declare) {
    var widget = declare('Sage.UI.Alarms.AlarmPopup', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        options: {
            displayPastDueInToolbar: true,
            displayAlertsInToolbar: true,
            promptAlerts: true,
            includeAlarms: true,
            includeConfirmations: true,
            pollInterval: 1,
            defaultSnooze: '5'
        },
        _confirmCount: -1,
        _alarmCount: -1,
        _dataRequested: false,
        widgetsInTemplate: true,
        isOpen: false,
        templateString: [
            '<div class="alarm-popup">',
            '<div class="alarm-title"><span class="alarm-main-title">&nbsp;${title}</span></div>',
            '<div class="alarm-title">',
            '<span class="alarm-tab-head">&nbsp;</span>',
            '<span dojoAttachEvent="onclick:_showAlarmPane" dojoAttachPoint="_alarmBtn" class="alarm-tab alarm-tab-selected">${alarmsText}</span>',
            '<span dojoAttachEvent="click:_showUnconfirmedPane" dojoAttachPoint="_confBtn" class="alarm-tab">${unconfirmedText}</span>',
            '<span class="alarm-tab-tail">&nbsp;</span>',
            '<span class="alarm-title-tools">',
            '<span dojoType="Sage.UI.ImageButton" id="compButton" imageClass="icon_complete_activity_16x16" title="${completeText}" dojoAttachEvent="onClick:_completeClick" dojoAttachPoint="compButton"></span>',
            '<span dojoType="Sage.UI.ImageButton" id="delButton" imageClass="icon_Delete_16x16" title="${deleteText}" dojoAttachEvent="onClick:_deleteClick" dojoAttachPoint="delButton"></span>',
            '<span dojoType="Sage.UI.ImageButton" imageClass="icon_Help_16x16" title="${helpText}" dojoAttachEvent="onClick:_showHelp" ></span>',
            '</span>',
            '</div>', //title area
            '<div data-dojo-type="dijit.layout.StackContainer" dojoAttachPoint="_panelContainer" class="alarm-body" >',
            '<div data-dojo-type="dijit.layout.ContentPane" dojoAttachPoint="_alarmPane" class="alarm-pane" title="alarms" >',
            '<div data-dojo-type="Sage.UI.Alarms.AlarmPane" dojoAttachPoint="_alarms" dojoAttachEvent="onAlertChanged:_alarmchange"></div>',
            '</div>', //alarms pane
            '<div data-dojo-type="dijit.layout.ContentPane" dojoAttachPoint="_confPane" class="alarm-pane" title="Unconfirmed">',
            '<div data-dojo-type="Sage.UI.Alarms.UnconfirmedPane" dojoAttachPoint="_confirms" dojoAttachEvent="onAlertChanged:_confchange"></div>',
            '</div>', //unconfirmed pane,
            '</div>', //- StackContainer
            '</div>' //body
        ].join(''),
        constructor: function () {
            dojo.mixin(this, popupStrings);
        },
        _setOptionsAttr: function (options) {
            this.options = dojo.mixin(this.options, options);
            this._alarms.setDefaultSnooze(this.options.defaultSnooze || '5');
        },
        _getOptionsAttr: function () {
            return this.options;
        },
        drawAlerts: function () {
            this._dataRequested = true;
            if (this.options.includeAlarms) {
                if (!this.alarmStore) {
                    this.alarmStore = new writableSDataStore({
                        service: sDataServiceRegistry.getSDataService('system'),
                        resourceKind: 'useractivities',
                        include: ['Activity', 'User', '$descriptors'],
                        sort: [{ attribute: 'Activity.StartDate', descending: true}]
                    });
                    this._alarms.store = this.alarmStore;
                }
                this._fetchAlarms();
            } else {
                dojo.addClass(this._alarmBtn, 'display-none');
                this._showUnconfirmedPane();
            }
            if (this.options.includeConfirmations) {
                //new notifications...
                if (!this.confirmStore) {
                    this.confirmStore = new writableSDataStore({
                        service: sDataServiceRegistry.getSDataService('dynamic'),
                        resourceKind: 'usernotifications',
                        include: ['Activity', '$descriptors'],
                        select: ['Type', 'Notes', 'FromUserId', 'ToUserId', 'SendDate', 'Activity/AccountName', 'Activity/AccountId', 'Activity/ActivityId', 'Activity/ContactName', 'Activity/ContactId', 'Activity/Description', 'Activity/Duration', 'Activity/LeadId', 'Activity/LeadName', 'Activity/OpportunityName', 'Activity/OpportunityId', 'Activity/Recurring', 'Activity/StartDate', 'Activity/Timeless', 'Activity/Type', 'Activity/Location', 'Activity/Leader', 'Activity/TicketId', 'Activity/TicketNumber'],
                        sort: [{ attribute: 'Activity.StartDate', descending: true}]
                    });
                    this._confirms.store = this.confirmStore;
                }
                this._fetchConfirms();
            } else {
                dojo.addClass(this._confBtn, 'display-none');
                this._showAlarmPane();
            }
        },
        _fetchAlarms: function () {
            if (this.options.includeAlarms && this.alarmStore) {
                var where = dstring.substitute("(User.Id eq '${0}' and Status ne 'asDeclned') and ((Alarm eq true and AlarmTime ne null and AlarmTime lt '${1}') or (Alarm eq null and AlarmTime eq null and Activity.Alarm eq true and Activity.AlarmTime lt '${1}'))", [utility.getClientContextByKey('userID'), utility.Convert.toIsoStringFromDate(new Date())]);
                this.alarmStore.fetch({
                    query: where,
                    count: 80,
                    start: 0,
                    onComplete: this._onAlarmRequestComplete,
                    scope: this
                });
            }
        },
        _fetchConfirms: function () {
            if (this.options.includeConfirmations && this.confirmStore) {
                this.confirmStore.fetch({
                    query: dstring.substitute('ToUserId eq \'${0}\' and Type eq \'New\'', [utility.getClientContextByKey('userID')]),
                    count: 40,
                    start: 0,
                    onComplete: this._onConfirmRequestComplete,
                    scope: this
                });
            }
        },
        _onAlarmRequestComplete: function (data) {
            this._alarms._setAlertItemsAttr(data, this.isOpen);
            this._alarmCount = data.length;
            this._checkWhichVisible();
        },
        _onConfirmRequestComplete: function (data) {
            this._confirms._setAlertItemsAttr(data, this.isOpen);
            this._confirmCount = data.length;
            this._checkWhichVisible();
        },
        _checkWhichVisible: function () {
            if (this._alarmCount > 0 && this.options.includeAlarms) {
                this._showAlarmPane();
            } else if (this._alarmCount === 0 && this._confirmCount > 0 && this.options.includeConfirmations) {
                this._showUnconfirmedPane();
            }
        },
        _alarmchange: function (count) {
            dojo.html.set(this._alarmBtn, this.alarmsText + ' (' + count + ') ');
            this._alarmCount = count;
            if (count < 1) {
                this._checkWhichVisible();
            }
            this.onAlertChanged();
        },
        _confchange: function (count) {
            dojo.html.set(this._confBtn, this.unconfirmedText + ' (' + count + ') ');
            this._confirmCount = count;
            if (count < 1) {
                this._checkWhichVisible();
            }
            this.onAlertChanged();
        },
        onOpen: function () {
            this.isOpen = true;
            //because we live inside a popup, we need to call resize() on the stack container to make it show a child...
            this._panelContainer.resize();

            if (!this._dataRequested) {
                this.drawAlerts();
            } else {
                this._checkWhichVisible();
            }

            //ToDo:  try focusing on something in here and see if the popup will close when the user clicks somewhere outside it
            //  If you click in the popup, then out,  it goes away.

            //            if (this._alarms.getUnhandledAlertCount() > 0) {
            //                this._showAlarmPane();
            //            } else {
            //                this._showUnconfirmedPane();
            //            }

        },
        onClose: function () {
            this.isOpen = false;
            this._alarms.closeTooltips();
            this._confirms.closeTooltips();
        },
        startup: function () {
            this.inherited(arguments);
            dojo.subscribe('/entity/activity/delete', this, this.reloadData);
        },
        reloadData: function () {
            this._fetchAlarms();
            this._fetchConfirms();
        },
        reloadAlarms: function () {
            this._fetchAlarms();
        },
        reloadConfirms: function () {
            this._fetchConfirms();
        },
        _showAlarmPane: function () {
            this._panelContainer.selectChild(this._alarmPane);
            dojo.addClass(this._alarmBtn, 'alarm-tab-selected');
            dojo.removeClass(this._confBtn, 'alarm-tab-selected');

            dojo.removeClass(this.compButton.domNode, 'display-none');
            dojo.removeClass(this.delButton.domNode, 'display-none');

            this._alarms.onShow();
        },
        _showUnconfirmedPane: function () {
            this._panelContainer.selectChild(this._confPane);
            dojo.removeClass(this._alarmBtn, 'alarm-tab-selected');
            dojo.addClass(this._confBtn, 'alarm-tab-selected');

            dojo.addClass(this.compButton.domNode, 'display-none');
            dojo.addClass(this.delButton.domNode, 'display-none');

            this._confirms.onShow();
        },
        _completeClick: function () {
            this._alarms.completeSelected();
        },
        _deleteClick: function () {
            this._alarms.deleteSelected();
        },
        _showHelp: function () {
            utility.openHelp('alerts');
        },
        getAlertCount: function () {
            return this._alarms.getUnhandledAlertCount() + this._confirms.getUnhandledAlertCount();
        },
        onAlertChanged: function () {
        }
    });
    return widget;
});