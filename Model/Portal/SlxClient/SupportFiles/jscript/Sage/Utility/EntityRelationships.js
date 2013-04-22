/*globals define, Sage, window, dojo */
define([
    'Sage/Data/SingleEntrySDataStore',
    'Sage/Data/SDataServiceRegistry',
    'Sage/UI/Dialogs',
    'dojo/_base/lang',
    'dojo/string',
    'Sage/Utility'
    //'dojo/i18n',
    //'dojo/i18n!./nls/EntityRelationShips'
],
    function (
        SingleEntrySDataStore,
        SDataServiceRegistry,
        dialogs,
        dLang,
        dString,
        Utility
        //i18n
        ) {
        Sage.namespace('Utility.EntityRelationships');
        Sage.Utility.EntityRelationships = {
            _store: false,
            getRelationships: function (entityContext, callback, scope) {
                               
                     var retobj = {};               
                    if (entityContext.EntityId !== "") {
                        var id = entityContext.EntityId ;
                          var parts = entityContext.EntityType.split('.');
                          var entityType = parts[parts.length - 1];
                        switch (entityType) {
                            case 'IAccount':
                                this._getAccountRelationships(id, callback, scope);
                                return;
                            case 'IContact':
                                this._getContactRelationships(id, callback, scope);
                                return;
                            case 'IOpportunity':
                                this._getOpportunityRelationships(id, callback, scope);
                                return;
                            case 'ITicket':
                                this._getTicketRelationships(id, callback, scope);
                                return;
                            case 'ISalesOrder':
                                this._getSalesOrderRelationships(id, callback, scope);
                                return;
                            case 'IActivity':
                                this._getActivityRelationships(id, callback, scope);
                                return;
                            case 'IHistory':
                                this._getHistoryRelationships(id, callback, scope);
                                return;
                            case 'IContract':
                                this._getContractRelationships(id, callback, scope);
                                return;
                            case 'IReturn':
                                this._getReturnRelationships(id, callback, scope);
                                return;
                        }
                        var propname = entityContext.EntityTableName.toLowerCase() + 'Id';
                        retobj[propname] = id;
                        callback.call(scope || this, retobj);
                        return;
                    } 
                
                callback.call(scope || this, {});
            },
            _getRequest: function (resourceKind, id) {
                var req = new Sage.SData.Client.SDataSingleResourceRequest(SDataServiceRegistry.getSDataService('dynamic'));
                req.setResourceKind(resourceKind);
                req.setResourceSelector('"' + id + '"');
                req.setQueryArg('precedence', '0');
                return req;
            },
            _getAccountRelationships: function (id, callback, scope) {
                var req = this._getRequest('accounts', id);
                req.setQueryArg('include', 'Contacts,$descriptors');
                req.setQueryArg('select', 'Contacts/IsPrimary');
                req.read({
                    success: function (acc) {
                        var obj = {
                            AccountId: Utility.getValue(acc, '$key'),
                            AccountName: Utility.getValue(acc, '$descriptor')                          
                        };
                        var contactId = '';
                        var contactName = '';
                        var contacts = acc.Contacts.$resources;
                        if (contacts.length > 0) {
                            contactId = contacts[0].$key;
                        }
                        for (var i = 0; i < contacts.length; i++) {
                            if (contacts[i].IsPrimary) {
                                contactId = contacts[i].$key;
                                contactName =  Utility.getValue(contacts[i], '$descriptor');
                            }
                        }
                        obj['ContactId'] = contactId;
                        obj['ContactName'] =  contactName;
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'AccountId': id });
                    },
                    scope: this
                });
            },
            _getContactRelationships: function (id, callback, scope) {
                var req = this._getRequest('contacts', id);
                req.setQueryArg('include', 'Account,$descriptors');
                 req.setQueryArg('select', 'Account');
                req.read({
                    success: function (contact) {
                        var obj = {
                            AccountId: Utility.getValue(contact, 'Account.$key'),
                            AccountName: Utility.getValue(contact, 'Account.$descriptor'),
                            ContactId: contact.$key,
                            ContactName: Utility.getValue(contact, '$descriptor')
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'ContactId': id });
                    },
                    scope: this
                });
            },
            _getOpportunityRelationships: function (id, callback, scope) {
                var req = this._getRequest('opportunities', id);
                req.setQueryArg('include', 'Account,Contacts,$descriptors');
                req.setQueryArg('select', 'Account,Contacts/IsPrimary');
                req.read({
                    success: function (opp) {
                        var obj = {
                            AccountId: Utility.getValue(opp, 'Account.$key'),
                            AccountName: Utility.getValue(opp, 'Account.$descriptor'),
                            OpportunityId: opp.$key,
                            OpportunityName: Utility.getValue(opp, '$descriptor')
                        };
                        var contactId = '';
                        var contactName = '';
                        var contacts = opp.Contacts.$resources;
                        if (contacts.length > 0) {
                            contactId = contacts[0].$key;
                        }
                        for (var i = 0; i < contacts.length; i++) {
                            if (contacts[i].IsPrimary) {
                                contactId = contacts[i].$key;
                                contactName =  Utility.getValue(contacts[i], '$descriptor');
                            }
                        }
                        obj['ContactId'] = contactId;
                        obj['ContactName'] =  contactName;
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'OpportunityId': id });
                    },
                    scope: this
                });
            },
            _getSalesOrderRelationships: function (id, callback, scope) {
                var req = this._getRequest('salesorders', id);
                req.setQueryArg('include', 'Account,$descriptors');
                req.read({
                    success: function (so) {
                        //console.dir(so);
                        var obj = {
                            AccountId: Utility.getValue(so, 'Account.$key'),
                            SalesOrderId: so.$key
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'SalesOrderId': id });
                    },
                    scope: this
                });
            },
            _getTicketRelationships: function (id, callback, scope) {
                var req = this._getRequest('tickets', id);
                req.setQueryArg('include', 'Account,Contact,$descriptors');
                req.read({
                    success: function (ticket) {
                        var obj = {
                            AccountId: Utility.getValue(ticket, 'Account.$key'),
                            AccountName: Utility.getValue(ticket, 'Account.$descriptor'),
                            ContactId: Utility.getValue(ticket, 'Contact.$key'),
                            ContactName: Utility.getValue(ticket, 'Contact.$descriptor'),
                            TicketId: ticket.$key,
                            TicketNumber: Utility.getValue(ticket, '$descriptor')
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'ticketId': id });
                    },
                    scope: this
                });
            },
            _getReturnRelationships: function (id, callback, scope) {
                var req = this._getRequest('returns', id);
                req.setQueryArg('include', 'Account,ReturnedBy,Ticket,$descriptors');
                req.read({
                    success: function (rma) {
                        var obj = {
                            ReturnId: rma.$key,
                            ReturnNumber: Utility.getValue(rma, '$descriptor'),
                            AccountId: Utility.getValue(rma, 'Account.$key'),
                            AccountName: Utility.getValue(rma, 'Account.$descriptor'),
                            TicketId: Utility.getValue(rma, 'Ticket.$key'),
                            TicketNumber: Utility.getValue(rma, 'Ticket.$descriptor'),
                            ContactId: Utility.getValue(rma, 'ReturnedBy.$key'),
                            ContactName: Utility.getValue(rma, 'ReturnedBy.$descriptor')
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { returnId: id });
                    },
                    scope: this
                });
            },
            _getActivityRelationships: function (id, callback, scope) {
                var req = this._getRequest('activities', id);
                req.setQueryArg('select', 'AccountId,ContactId,LeadId,OpportunityId,TicketId');
                req.read({
                    success: function (activity) {
                        //console.dir(activity);
                        var obj = {
                            AccountId: Utility.getValue(activity, 'AccountId'),
                            ActivityId: activity.$key,
                            ContactId: Utility.getValue(activity, 'ContactId'),
                            LeadId: Utility.getValue(activity, 'LeadId'),
                            OpportunityId: Utility.getValue(activity, 'OpportunityId'),
                            TicketId: Utility.getValue(activity, 'TicketId')
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'ActivityId': id });
                    },
                    scope: this
                });
            },
           _getHistoryRelationships: function (id, callback, scope) {
                var req = this._getRequest('history', id);
                req.setQueryArg('select', 'AccountId,ContactId,LeadId,OpportunityId,TicketId');
                req.read({
                    success: function (history) {
                        //console.dir(history);
                        var obj = {
                            AccountId: Utility.getValue(history, 'AccountId'),
                            HistoryId: history.$key,
                            ContactId: Utility.getValue(history, 'ContactId'),
                            LeadId: Utility.getValue(history, 'LeadId'),
                            OpportunityId: Utility.getValue(history, 'OpportunityId'),
                            TicketId: Utility.getValue(history, 'TicketId')
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'HistoryId': id });
                    },
                    scope: this
                });
            },
            _getContractRelationships: function (id, callback, scope) {
                var req = this._getRequest('contracts', id);
                req.setQueryArg('include','Account,Contact,$descriptors');
                req.read({
                    success: function (contract) {
                        var obj = {
                            AccountId: Utility.getValue(contract, 'Account.$key'),
                            AccountName: Utility.getValue(contract, 'Account.$descriptor'),
                            ContractId: contract.$key,
                            ContractNumber: Utility.getValue(contract, '.$descriptor'),
                            ContactId: Utility.getValue(contract, 'Contact.$key'),
                            ContactName: Utility.getValue(contract, 'Contact.$descriptor')
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'ContractId': id });
                    },
                    scope: this
                });
            }
        };
        return Sage.Utility.EntityRelationships;
    });