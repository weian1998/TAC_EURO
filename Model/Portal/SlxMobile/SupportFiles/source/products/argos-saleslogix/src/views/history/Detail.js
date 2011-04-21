/// <reference path="../../../../../argos-sdk/libraries/ext/ext-core-debug.js"/>
/// <reference path="../../../../../argos-sdk/libraries/sdata/sdata-client-debug"/>
/// <reference path="../../../../../argos-sdk/libraries/Simplate.js"/>
/// <reference path="../../../../../argos-sdk/src/View.js"/>
/// <reference path="../../../../../argos-sdk/src/Detail.js"/>

Ext.namespace("Mobile.SalesLogix.History");

(function() {
    Mobile.SalesLogix.History.Detail = Ext.extend(Mobile.SalesLogix.History.DetailBase, {
        //Localization
        accountText: 'account',
        contactText: 'contact',
        longNotesText: 'notes',
        opportunityText: 'opportunity',
        ticketNumberText: 'ticket',
        //View Properties
        id: 'history_detail',
        querySelect: [
            'AccountId',
            'AccountName',
            'Category',
            'CompletedDate',
            'ContactId',
            'ContactName',
            'Description',
            'Duration',
            'LongNotes',
            'OpportunityId',
            'OpportunityName',
            'Priority',
            'StartDate',
            'TicketId',
            'TicketNumber',
            'Timeless',
            'Type',
            'UserName'
        ],

        createLayout: function() {
            var base = Mobile.SalesLogix.History.Detail.superclass.createLayout;

            return this.layout || (this.layout = base.apply(this, arguments).concat([
                {
                    name: 'ContactName',
                    label: this.contactText
                },
                {
                    name: 'AccountName',
                    label: this.accountText
                },
                {
                    name: 'OpportunityName',
                    label: this.opportunityText
                },
                {
                    name: 'TicketNumber',
                    label: this.ticketNumberText
                },
                {
                    name: 'LongNotes',
                    label: this.longNotesText
                }
            ]));
        }
    });
})();
