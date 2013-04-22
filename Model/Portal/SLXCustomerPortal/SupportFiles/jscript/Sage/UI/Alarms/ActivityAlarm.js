/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/_Templated',
    'dijit/_Widget',
    'dijit/form/CheckBox',
    'Sage/Utility/Activity',
    'Sage/UI/Alarms/AlarmCountDown',
    'Sage/Link',
    'Sage/UI/Controls/EntityInfoToolTip',
    'dojo/i18n',
    'dojo/i18n!./nls/ActivityAlarm',
    'dojo/_base/declare'
],
function (_Templated, _Widget, CheckBox, activityUtility, AlarmCountDown,
    link, EntityInfoToolTip, i18n, actAlarmStrings, declare) {
    var activityAlarm = declare('Sage.UI.Alarms.ActivityAlarm', [_Widget, _Templated], {
        widgetsInTemplate: true,
        userActivity: null,
        selected: false,
        key: '',
        _tooltips: [],
        widgetTemplate: new Simplate([
            '<div class="alarm-item">',
                '<table style="width:100%" dojoAttachPoint="_item" dojoAttachEvent="onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick">',
                    '<col width="50px" />',
                    '<col width="50%" />',
                    '<col width="50%" />',
                    '<col width="80px" />',
                    '<tr>',
                        '{% var imageClass = Sage.Utility.Activity.getActivityImageClass($.userActivity.Activity.Type, "medium"); %}',
                        '<td class="alarm-icon">',
                            '<div class="dijitIcon dijitMenuItemIcon Global_Images icon24x24 {%= imageClass %}" title="{%= $.cleanText($.userActivity.Activity.Description) %}"></div>',
                            '<input type="checkbox" data-dojo-type="dijit.form.CheckBox" size="30px" dojoAttachPoint="_checkbox" />',
                        '</td>',
                        '<td class="alarm-content">',
                            '{% var desc = $.userActivity.Activity.Description;if (!desc) { desc = Sage.Utility.Activity.getActivityTypeName($.userActivity.Activity.Type); } %}',
                            '<div class="alarm-description">',
                                '{% if ($.userActivity.Activity.Recurring) { %}<div class="Global_Images icon16x16 icon_recurring" title="{%= $.recurringText %}" > </div>&nbsp;&nbsp;{% } %}',
                                '{% if ($.userActivity.Status === "asUnconfirmed") { %}',
                                    '<a href="javascript:Sage.Link.confirmActivityFor(\'{%= $.userActivity.Activity.$key %}\', \'{%= $.userActivity.User.$key %}\')">{%= desc %}</a>',
                                '{% } else { %}',
                                    '<a href="javascript:Sage.Link.editActivity(\'{%= $.userActivity.Activity.$key %}\', {%= $.userActivity.Activity.Recurring %})">{%= desc %}</a>',
                                '{% } %}',
                            '</div>',
                            '<div>{%= Sage.Utility.Activity.formatActivityStartDate($.userActivity.Activity.StartDate) %}</div>',
                            '{% if (($.userActivity.Activity.LeadId) && ($.userActivity.Activity.LeadId.trim() !== "")) { %}',  //Lead...
                                '<div id="{%= $.userActivity.Activity.$key %}_lead" dojoAttachPoint="_leadnode">',
                                    '{%= $.leadText %}: <a href="lead.aspx?entityid={%= $.userActivity.Activity.LeadId %}">{%= $.userActivity.Activity.LeadName %}</a>',
                                '</div>',
                                '{% if ($.userActivity.Activity.AccountName !== "") { %}',
                                    '<div>{%= $.companyText %}: {%= $.userActivity.Activity.AccountName %}</div>',
                                '{% } %}',
                            '{% } else { %}',   // ... or Contact?    
                                '{% if ($.userActivity.Activity.ContactName !== "") { %}',
                                    '<div id="{%= $.userActivity.Activity.$key %}_con" dojoAttachPoint="_connode">',
                                        '{%= $.contactText %}: <a href="Contact.aspx?entityid={%= $.userActivity.Activity.ContactId %}">{%= $.userActivity.Activity.ContactName %}</a>',
                                     '</div>',
                                '{% } %}',
                                '{% if ($.userActivity.Activity.AccountName !== "") { %}',
                                    '<div id="{%= $.userActivity.Activity.$key %}_acc" dojoAttachPoint="_accnode">',
                                        '{%= $.accountText %}: <a href="Account.aspx?entityid={%= $.userActivity.Activity.AccountId %}">{%= $.userActivity.Activity.AccountName %}</a>',
                                    '</div>',
                                '{% } %}',
                            '{% } %}',
                        '</td><td class="alarm-content">',
                            '{% if ($.userActivity.Activity.Location) { %}',
                                '<div id="{%= $.userActivity.Activity.$key %}_Location" dojoAttachPoint="_location">',
                                    '{%= $.locationText %}: {%= $.userActivity.Activity.Location %}&nbsp;',
                                '</div>',
                            '{% } %}',
                            '{% if ($.userActivity.Activity.OpportunityName) { %}',
                                '<div id="{%= $.userActivity.Activity.$key %}_opp" dojoAttachPoint="_oppnode">',
                                    '{%= $.opportunityText %}: <a href="Opportunity.aspx?entityid={%= $.userActivity.Activity.OpportunityId %}">{%= $.userActivity.Activity.OpportunityName %}</a>',
                                '</div>',
                            '{% } %}',
                            '{% if ($.userActivity.Activity.TicketNumber) { %}',
                                '<div id="{%= $.userActivity.Activity.$key %}_tick" dojoAttachPoint="_ticknode">',
                                    '{%= $.ticketText %}: <a href="Ticket.aspx?entityid={%= $.userActivity.Activity.TicketId %}">{%= $.userActivity.Activity.TicketNumber %}</a>',
                                '</div>',
                            '{% } %}',
                        '</td>',
                        '<td class="alarm-countdownContainer">',
                            '<div data-dojo-type="Sage.UI.Alarms.AlarmCountDown" startDate="{%= $.userActivity.Activity.StartDate %}"></div>',
                        '</td>',
                    '</tr>',
                '</table>',
            '</div>'
        ]),
        constructor: function () {
            dojo.mixin(this, actAlarmStrings);
        },
        postCreate: function () {
            this.inherited(arguments);
            this._checkbox.set('checked', this.selected);
            this._setupTooltips();
        },
        _setUserActivityAttr: function (ua) {
            this.userActivity = ua;
            this.key = ua['$key'];
        },
        _setupTooltips: function () {
            if (this.userActivity.Activity.AccountName !== '') {
                this._tooltips.push(new EntityInfoToolTip({
                    connectId: this._accnode,
                    position: ['below'],
                    entityName: 'accounts',
                    entityId: this.userActivity.Activity.AccountId
                }));
            }
            if (this.userActivity.Activity.ContactName !== '') {
                this._tooltips.push(new EntityInfoToolTip({
                    connectId: this._connode,
                    position: ['below'],
                    entityName: 'contacts',
                    entityId: this.userActivity.Activity.ContactId
                }));
            }
            if (this.userActivity.Activity.LeadName !== '') {
                this._tooltips.push(new EntityInfoToolTip({
                    connectId: this._leadnode,
                    position: ['below'],
                    entityName: 'leads',
                    entityId: this.userActivity.Activity.LeadId
                }));
            }
        },
        //once in a while a tooltip gets stuck - but when do you call this?
        closeTooltips: function () {
            for (var i = 0; i < this._tooltips.length; i++) {
                this._tooltips[i].close();
            }
        },
        cleanText: function (str) {
            if (!str) {
                return '';
            }
            var oRegExp = new RegExp('[/:"*?\<\>|\r\n\'\"`]+', "g");
            return str.replace(oRegExp, "");
        },
        _onHover: function () {
            dojo.addClass(this.domNode, 'alarm-item-hover');
        },
        _onUnhover: function () {
            dojo.removeClass(this.domNode, 'alarm-item-hover');
        },
        _onClick: function () {
            this.selected = !this.selected;
            this._checkbox.set('checked', this.selected);
            this._setSelectedStyle();
        },
        _setSelectedAttr: function (selected) {
            this.selected = selected;
            this._checkbox.set('checked', this.selected);
            this._setSelectedStyle();
        },
        _getSelectedAttr: function () {
            return this.selected;
        },
        _setSelectedStyle: function () {
            if (this.selected) {
                dojo.addClass(this.domNode, 'alarm-item-selected');
            } else {
                dojo.removeClass(this.domNode, 'alarm-item-selected');
            }
        }
    });
    return activityAlarm;
});
