/*globals define, dojo, Simplate */
define([
    'dijit/_Widget',
    'Sage/_Templated',
    'dojo/string',
    'dijit/Dialog',
    'Sage/UI/_DialogLoadingMixin',
    'dojo/_base/lang',
    'Sage/Data/SingleEntrySDataStore',
    'Sage/Data/SDataServiceRegistry',
    'Sage/MainView/BindingsManager',
    'Sage/Utility',
    'Sage/Utility/Activity',
    'Sage/UI/Dialogs',
    'dijit/form/RadioButton',
    'dojo/_base/declare',
    'dojo/i18n!./nls/OccurrenceOrSeriesQueryDlg'
],
function (_Widget,
    _Templated,
    dString,
    Dialog,
    _DialogLoadingMixin,
    dojoLang,
    SingleEntrySDataStore,
    sDataServiceRegistry,
    BindingsManager,
    utility,
    activityUtil,
    sageDialogs,
    RadioButton,
    declare,
    occurenceDlgStrings) {
    var qryDlg = declare('Sage.MainView.ActivityMgr.OccurrenceOrSeriesQueryDlg', [_Widget, _Templated], {
        activityId: '',
        activityMemberId: '',
        activity: false,
        store: false,
        mode: 'edit',
        widgetsInTemplate: true,
        disableSeriesOption: '',
        widgetTemplate: new Simplate([
            '<div>',
                '<div dojoType="dijit.Dialog" title="" dojoAttachPoint="_dialog" dojoAttachEvent="onHide:_onDlgHide">',
                    '<div class="recur-activity-dialog">',
                        '<div dojoType="dojox.layout.TableContainer" orientation="horiz" cols="1" labelWidth="160" >',
                            '<div dojoType="dijit.layout.ContentPane" label="{%= $.actDateText %}" dojoAttachPoint="container_actDate"></div>',
                            '<div dojoType="dijit.layout.ContentPane" label="{%= $.accountText %}" dojoAttachPoint="container_account"></div>',
                            '<div dojoType="dijit.layout.ContentPane" label="{%= $.contactText %}" dojoAttachPoint="container_contact"></div>',
                            '<div dojoType="dijit.layout.ContentPane" label="{%= $.opportunityText %}" dojoAttachPoint="container_opportunity"></div>',
                        '</div>',  //tableContainer
                        '<div class="dijitContentPane">&nbsp;</div>', //whitespace
                        '<div class="dijitContentPane">',
                            '<input type="radio" dojoType="dijit.form.RadioButton" name="editType" id="{%= $.id %}_thisOccurrence" checked="true" dojoAttachPoint="_thisOccurRadio" />&nbsp;',
                            '<label for="{%= $.id %}_thisOccurrence">{%= ($.mode === "edit") ? $.editOneText : (($.mode === "delete")? $.deleteOneText : $.completeOneText) %}</label>',
                        '</div><div class="dijitContentPane">',
                            '<input type="radio" dojoType="dijit.form.RadioButton" name="editType" id="{%= $.id %}_Series" dojoAttachPoint="_seriesRadio" {%=$.disableSeriesOption%} />&nbsp;',
                            '<label for="{%= $.id %}_Series">{%= ($.mode === "edit") ? $.editAllText : (($.mode === "delete")? $.deleteAllText : $.completeAllText) %}</label>',
                        '</div>',
                        '<div class="general-dialog-actions">', //buttons
                            '<div dojoType="dijit.form.Button" id="{%= $.id %}_btnContinue" name="_btnContinue" dojoAttachPoint="_btnContinue" dojoAttachEvent="onClick:_continueClick" >{%= $.continueText %}</div>',
                        '</div>', //buttons
                    '</div>', //form
                '</div>', //dialog
            '</div>' //root
        ]),
        constructor: function () {
            dojoLang.mixin(this, occurenceDlgStrings);

        },
        show: function () {
           
            this._dialog.show();
            if (!this._dialog._standby) {
                dojoLang.mixin(this._dialog, new _DialogLoadingMixin());
                if (!this.activity) {
                    this._dialog.showLoading();
                }
            }
            this._thisOccurRadio.set('checked', true);
        },
        _setModeAttr: function (mode) {
            this.mode = mode;
        },
        _getModeAttr: function () {
            return this.mode;
        },
        hide: function () {
            this._dialog.hide();
        },
        _onDlgHide: function () {
            this.activity = false;
            this.activityId = '';
        },
        _setActivityIdAttr: function (activityId) {
            this.activityId = activityId;
            if (this.activityId && this.activityId !== '') {
                this._loadData();
            }
        },
        _getActivityIdAttr: function () {
            return this.activityId;
        },
        _setActivityMemebrIdAttr: function (memberId) {
            this.activityMemberId = memberId;
        },
        _getActivityMemberIdAttr: function () {
            return this.activityMemberId;
        },
        _loadData: function () {
            if (this._dialog._standby) {
                this._dialog.showLoading();
            }
            var select = ['Description', 'AccountName', 'ContactName', 'OpportunityName', 'StartDate', 'Type', 'Timeless', 'Recurring', 'RecurrenceState'];
            if (this.activityId.length > 12) {
                if (!this.store) {
                    this.store = new SingleEntrySDataStore({
                        include: [],
                        select: select, // ['Description', 'AccountName', 'ContactName', 'OpportunityName', 'StartDate', 'Type', 'Timeless', 'Recurring', 'RecurrenceState'],
                        resourceKind: 'activities',
                        service: sDataServiceRegistry.getSDataService('system')
                    });
                }
                if (this.activityId !== '') {
                    this.store.fetch({
                        predicate: '"' + this.activityId + '"',
                        onComplete: this._receiveActivity,
                        onError: this._failLoad,
                        scope: this
                    });
                }
            } else {
                var req = new Sage.SData.Client.SDataResourceCollectionRequest(sDataServiceRegistry.getSDataService('system'))
                .setResourceKind('activities')
                .setQueryArg('select', select.join(','))
                .setQueryArg('where', 'id eq \'' + this.activityId + '\'')
                .setQueryArg('orderby', 'StartDate asc')
                .setQueryArg('count', '1');
                req.read({
                    success: this._receiveActivities,
                    failure: this._failLoad,
                    scope: this
                });
            }
        },
        _receiveActivity: function (activity) {
            //debugger;
            if (this._dialog._standby) {
                this._dialog.hideLoading();
            }
            this.activity = activity;
            this._bind();
        },
        _receiveActivities: function (data) {
            //debugger;
            if (this._dialog._standby) {
                this._dialog.hideLoading();
            }
            var activities = data['$resources'];
            if (activities.length < 1) {
                this._failLoad();
            }
            this.activity = activities[0];
            this.activityId = this.activity['$key']; //reset this because the original one may not have had the occurrence half
            this._bind();
        },

        _bind: function () {
            var act = this.activity;
            var d = act.Description;
            if (d.length > 30) {
                d = d.substring(0, 26) + '...';
            }
            this._dialog.set('title', dString.substitute(this.titleFmt, { type: activityUtil.getActivityTypeName(act.Type), description: d }));

            this.container_actDate.set('content', activityUtil.formatActivityStartDate(utility.Convert.toDateFromString(act.StartDate, act.Timeless)));
            this.container_account.set('content', act.AccountName || '&nbsp;');
            this.container_contact.set('content', act.ContactName || '&nbsp;');
            this.container_opportunity.set('content', act.OpportunityName || '&nbsp;');
        },
        _failLoad: function () {
            if (this._dialog._standby) {
                this._dialog.hideLoading();
            }
            sageDialogs.showWarning(this.failedToLoadMsg);
            this._dialog.hide();
        },
        _continueClick: function (e) {
            this.hide();
            if (this._thisOccurRadio.get('checked')) {
                this.onSelectOccurrence(this.activityId, utility.Convert.toDateFromString(this.activity.StartDate), this.activityMemberId);
            } else {
                this.onSelectSeries(this.activityId, this.activityMemberId);
            }
        },
        onSelectSeries: function (id) { },
        onSelectOccurrence: function (id, startDate) { }
    });
    return qryDlg;
});