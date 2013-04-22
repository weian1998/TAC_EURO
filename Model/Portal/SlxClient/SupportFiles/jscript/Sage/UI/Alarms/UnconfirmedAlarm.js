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
    link, EntityInfoToolTip, i18n, alarmStrings, declare) {
    var unconfirmedAlarm = declare('Sage.UI.Alarms.UnconfirmedAlarm', [_Widget, _Templated], {
        widgetsInTemplate: true,
        userNotification: null,
        selected: false,
        key: '',
        _tooltips: [],
        widgetTemplate: new Simplate([
            '<div class="alarm-item">',
                '<table style="width:100%" dojoAttachPoint="_item" dojoAttachEvent="onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick">',
                    '<col width="50px" />',
                    '<col width="50%" />',
                    '<col width="50%" />',
                    '<tr>',
                        '{% var imageClass = Sage.Utility.Activity.getActivityImageClass($.userNotification.Activity.Type, "medium"); %}',
                        '<td class="alarm-icon">',
                            '<div class="dijitIcon dijitMenuItemIcon Global_Images icon24x24 {%= imageClass %}" title="{%= $.cleanText($.userNotification.Activity.Description) %}"></div>',
                            '<input type="checkbox" data-dojo-type="dijit.form.CheckBox" size="30px" dojoAttachPoint="_checkbox" />',
                        '</td>',
                        '<td class="alarm-content">',
                            '{% var desc = $.userNotification.Activity.Description;if (!desc) { desc = Sage.Utility.Activity.getActivityTypeName($.userNotification.Activity.Type); } %}',
                            '<div class="alarm-description">',
                                '{% if ($.userNotification.Activity.Recurring) { %}<div class="Global_Images icon16x16 icon_recurring" title="{%= $.recurringText %}" > </div>&nbsp;&nbsp;{% } %}',
                                '<a href="javascript:Sage.Link.editConfirmation(\'{%= $.userNotification.$key %}\')">{%= desc %}</a>', 
                            '</div>',
                            '<div>{%= Sage.Utility.Activity.formatActivityStartDate($.userNotification.Activity.StartDate) %}</div>',
                            '<div>{%= $.leaderText %}: {%= $.userNotification.Activity.Leader.$descriptor %}</div>',
                            '{% if (($.userNotification.Activity.LeadId) && ($.userNotification.Activity.LeadId.trim() !== "")) { %}',  //Lead...
                                '<div id="{%= $.userNotification.Activity.$key %}_lead" dojoAttachPoint="_leadnode">',
                                    '{%= $.leadText %}: <a href="Lead.aspx?entityid={%= $.userNotification.Activity.LeadId %}">{%= $.userNotification.Activity.LeadName %}</a>',
                                '</div>',
                                '{% if ($.userNotification.Activity.AccountName !== "") { %}',
                                    '<div>{%= $.companyText %}: {%= $.userNotification.Activity.AccountName %}</div>',
                                '{% } %}',
                            '{% } else { %}',   // ... or Contact?    
                                '{% if ($.userNotification.Activity.ContactName !== "") { %}',
                                    '<div id="{%= $.userNotification.Activity.$key %}_con" dojoAttachPoint="_connode">',
                                        '{%= $.contactText %}: <a href="Contact.aspx?entityid={%= $.userNotification.Activity.ContactId %}">{%= $.userNotification.Activity.ContactName %}</a>',
                                    '</div>',
                                '{% } %}',
                                '{% if ($.userNotification.Activity.AccountName !== "") { %}',
                                    '<div id="{%= $.userNotification.Activity.$key %}_acc" dojoAttachPoint="_accnode">',
                                        '{%= $.accountText %}: <a href="Account.aspx?entityid={%= $.userNotification.Activity.AcountId %}">{%= $.userNotification.Activity.AccountName %}</a>',
                                    '</div>',
                                '{% } %}',
                            '{% } %}',
                        '</td><td class="alarm-content">',
                            '{% if ($.userNotification.Activity.Location) { %}',
                                '<div id="{%= $.userNotification.Activity.$key %}_Location" dojoAttachPoint="_location">',
                                    '{%= $.locationText %}: {%= $.userNotification.Activity.Location %}&nbsp;',
                                '</div>',
                            '{% } %}',
                            '{% if ($.userNotification.Activity.OpportunityName) { %}',
                                '<div id="{%= $.userNotification.Activity.$key %}_opp" dojoAttachPoint="_oppnode">',
                                    '{%= $.opportunityText %}: <a href="Opportunity.aspx?entityid={%= $.userNotification.Activity.OpportunityId %}">{%= $.userNotification.Activity.OpportunityName %}</a>',
                                '</div>',
                            '{% } %}',
                            '{% if ($.userNotification.Activity.TicketNumber) { %}',
                                '<div id="{%= $.userNotification.Activity.$key %}_tick" dojoAttachPoint="_ticknode">',
                                    '{%= $.ticketText %}: <a href="Ticket.aspx?entityid={%= $.userNotification.Activity.TicketId %}">{%= $.userNotification.Activity.TicketNumber %}</a>',
                                '</div>',
                            '{% } %}',
                        '</td>',
                    '</tr>',
                '</table>',
            '</div>'
        ]),
        constructor: function () {
            dojo.mixin(this, alarmStrings);
        },
        postCreate: function () {
            this.inherited(arguments);
            this._checkbox.set('checked', this.selected);
            this._setupTooltips();
        },
        _setuserNotificationAttr: function (un) {
            this.userNotification = un;
            this.key = un['$key'];
        },
        _setupTooltips: function () {
            if (this.userNotification.Activity.AccountName !== '') {
                this._tooltips.push(new EntityInfoToolTip({
                    connectId: this._accnode,
                    position: ['below'],
                    entityName: 'accounts',
                    entityId: this.userNotification.Activity.AccountId
                }));
            }
            if (this.userNotification.Activity.ContactName !== '') {
                this._tooltips.push(new EntityInfoToolTip({
                    connectId: this._connode,
                    position: ['below'],
                    entityName: 'contacts',
                    entityId: this.userNotification.Activity.ContactId
                }));
            }
            if (this.userNotification.Activity.LeadName !== '') {
                this._tooltips.push(new EntityInfoToolTip({
                    connectId: this._leadnode,
                    position: ['below'],
                    entityName: 'leads',
                    entityId: this.userNotification.Activity.LeadId
                }));
            }
        },
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
    return unconfirmedAlarm;
});