/*
* LiteratureRequest.js - support for the schedule literature request form
* 
* Components:
* - LiteratureRequestModel (holds data for the request)
* - LiteratureRequestForm (create the view object and ferry the data to/from the model)
* - ContactSelectionView (used to let the user select contacts)
* - RequestParametersView (most of the rest of the data for the request)
* - ItemSelectionView (selection of literature items)
*   - LiteratureItemLoader (used to load the literature items)
* - RequestSummaryView (display of total # / cost of items)
*/

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Dialog");
dojo.require("dijit.ProgressBar");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojo.currency");
dojo.require("dojo.string");
dojo.require("Sage.MailMerge.Helper");
dojo.require("Sage.UI.Dialogs");
dojo.require("Sage.Utility");
dojo.require("Sage.UI.Columns.Phone");
dojo.require("Sage.UI.Columns.Currency");
dojo.require("Sage.UI.Controls.Currency");

dojo.ready(function () {

    // max # of contacts to be selected from a group
    var MAX_CONTACTS = 2000;


    //////////////////
    // Global sandbox used for events + ajax

    // Events that will be published via dojo.publish
    var EVENTS = {
        // Error.  Parameter = error message.
        Error: "Error",
        // Request submission started.  Parameter: # of contacts to be submitted.
        SubmissionStart: "Submission/Start",
        // Request progress.  Parameter: index of contact being submitted.
        SubmissionProgress: "Submission/Progress",
        // Request completed.
        SubmissionComplete: "Submission/Complete"
    };

    dojo.declare("LitRequest.Sandbox", null, {
        publish: function (event, message) {
            if (!dojo.isArray(message))
                message = [message];
            dojo.publish("LitRequest/" + event, message);
        },

        subscribe: function (event, handler) {
            dojo.subscribe("LitRequest/" + event, handler);
        },

        ajax: function (kwargs) {
            var sb = this;
            var error = function (e) {
                sb.publish(EVENTS.Error, e);
                if (kwargs.error)
                    kwargs.error(e);
            };
            dojo.xhrGet(dojo.mixin({ error: error }, kwargs));
        }
    });

    var sandbox = new LitRequest.Sandbox();


    //////////////////////////////// MODEL

    dojo.declare("LitRequest.LiteratureRequestModel", null, {
        // summary:
        //  Represents the information input by the user for the request.

        Options: 0,
        baseCurrency: 'USD',
        multiCurrencyEnabled: false,

        contacts: null,
        items: null,
        CoverId: null,
        CoverName: null,

        constructor: function (defaults) {
            if (defaults)
                dojo.mixin(this, defaults);
            this.items = {};
            this.contacts = [];
            this.CoverId = "";
            this.CoverName = "";
            this.SendDate = null;
            this.UserId = Sage.Services.getService('ClientContextService').getValue('userID');
        },

        // Public API

        setValue: function (name, value) {
            //            console.log("Set " + name, value);
            if (this[name] !== value) {
                var oldVal = value;
                this[name] = value;
                this.onSet(this, name, oldVal, value);
            }
        },

        setLiteratureItem: function (item) {
            // summary:
            //  Update the selection for the specified item (a literature item object from SData with properties: $key, Cost, etc)
            if (item.Quantity == 0) {
                delete this.items[item.$key];
            } else {
                this.items[item.$key] = item;
            }
            this.onLiteratureItemUpdated(item);
        },

        reduceLiteratureItems: function (f) {
            // summary:
            //  Run a "map/reduce" operation on the literature items.  For each item the function f is called
            //  with 2 parameters: the item, and the result of the invocation of f on the previous item (or null if this is the first item)
            var result = null;
            for (var k in this.items) {
                result = f(this.items[k], result);
            }
            return result;
        },

        countSelected: function () {
            // summary:
            //  Calculate total # of items selected
            return this.reduceLiteratureItems(function (item, acc) {
                return (item.Quantity || 0) + (acc || 0);
            }) || 0;
        },

        getTotalCost: function () {
            return this.reduceLiteratureItems(function (item, acc) {
                return (item.Quantity || 0) * (Number(item.Cost) || 0) + (acc || 0);
            }) || 0;
        },

        clearItemSelection: function () {
            // summary:
            //  Clear the selected literature items
            this.items = {};
            this.onLiteratureItemUpdated(null);
        },

        submitRequest: function () {
            // summary:
            //  Asynchronously submit the request via sdata
            if (!this.validate())
                return;
            var mgr = Sage.Services.getService("ClientBindingManagerService");
            if (mgr) {
                mgr.resetCurrentEntity();
            }
            sandbox.publish(EVENTS.SubmissionStart, this.contacts.length);
            this._submitOneContact(0);
        },

        validate: function () {
            var msg = [];
            if (this.contacts.length == 0)
                msg.push(LitrequestResources.NoContactSelected);
            if (this.countSelected() == 0)
                msg.push(LitrequestResources.NoItemSelected);
            if (!this.Description)
                msg.push(LitrequestResources.DescriptionIsRequired);
            if (this.Options != 2 && !this.CoverId)
                msg.push(LitrequestResources.LitWarning_SelectTemplate);
            if (this.SendDate === null) {
                msg.push(LitrequestResources.SendByDateUndefined);
            }

            if (msg.length > 0) {
                sandbox.publish(EVENTS.Error, msg.join("\n"));
                return false;
            } else {
                return true;
            }
        },

        // Events
        onSet: function (model, name, oldValue, newValue) {
            // summary:
            //  Called when a value is changed
        },

        onLiteratureItemUpdated: function (item) {
            // summary:
            //  Called when a literature item is edited
            // item:
            //  A literature item (object from SData with properties: $key, Cost, etc).  Or null if there was a mass update.            
        },

        onPrepareRequest: function (entity) {
            // summary:
            //  Called before submitting a literature request.  Can be hooked into to customize the request.
            // entity: 
            //  Entity to be submitted to SData
        },

        // Private

        _submitOneContact: function (index) {
            // submit contact at index.
            // This is asynchronous, but upon completion it will trigger the submission of the following contact.
            if (index == this.contacts.length) {
                sandbox.publish(EVENTS.SubmissionComplete);
                return;
            }
            sandbox.publish(EVENTS.SubmissionProgress, index + 1);

            var self = this;

            require(['Sage/MailMerge/Helper', 'Sage/MailMerge/Service'], function (Helper, DesktopService) {
                var sub = new LitRequest.Submission(self);
                var promise = sub.submitRequest(self.contacts[index]);
                if (self.FulfillLocally) {
                    promise = promise.then(dojo.hitch(self, "_fulfillLocalRequest"));
                }
                if (promise) {
                    promise.then(function (reqId) {
                        self._submitOneContact(index + 1);
                    }, function (e) {
                        sandbox.publish(EVENTS.Error, e ? e.toString() : LitrequestResources.ErrorSubmittingRequest);
                    });
                }
            });
        },

        _fulfillLocalRequest: function (reqId) {
            // summary:
            //  Perform local fulfillment for the request.
            //  Return a deferred which will resolve once fulfillment is complete.

            var mmServ = Sage.MailMerge.Helper.GetMailMergeService();
            if (mmServ) {
                var result = mmServ.FulfillLitRequest(reqId);
                var def = new dojo.Deferred();
                if (dojo.isArray(result)) {
                    var success = result[LitReqResult.lrSuccess];
                    if (success) {
                        var service = Sage.Data.SDataServiceRegistry.getSDataService('dynamic');
                        var request = new Sage.SData.Client.SDataServiceOperationRequest(service)
                            .setOperationName("FulfillLitRequest")
                            .setResourceKind("litRequests");
                        var payload = {
                            $name: "FulfillLitRequest",
                            request: {
                                entity: { "$key": reqId }
                            }
                        };
                        request.execute(payload, {
                            success: function (response) {
                                def.resolve(reqId);
                            },
                            failure: function (response) {
                                // there is not much interesting for the end user in the response... 
                                // admins will get some info in the event log
                                def.reject(LitrequestResources.FulfillFailed);
                            }
                        });
                    } else {
                        if (result[LitReqResult.lrCanceled]) {
                            def.reject(LitrequestResources.FulfillCanceled);
                        } else if (result[LitReqResult.lrError]) {
                            def.reject(result[LitReqResult.lrError]);
                        } else {
                            def.reject(LitrequestResources.FulfillFailed);
                        }
                    }
                }
                return def;
            }
            return null;
        }
    });

    dojo.declare("LitRequest.Submission", null, {
        // summary:
        //  Manages the submission process for a single request.
        constructor: function (model) {
            this._model = model;
        },

        submitRequest: function (conid) {
            return this._retrieveContactInfo(conid)
                .then(dojo.hitch(this, "_createRequestForContact"))
                .then(dojo.hitch(this, "_createActivityForRequest"));
        },

        // Private

        _retrieveContactInfo: function (conid) {
            return dojo.xhrGet({
                url: "slxdata.ashx/slx/dynamic/-/contacts('" + conid + "')?format=json",
                handleAs: "json"
            });
        },

        _createRequestForContact: function (contactData) {
            // summary:
            //  Create the literature request itself for the given contact (SData payload)
            //  Return a deferred which will resolve to the SData response
            var litItems = [];
            var k;
            var v;

            for (k in this._model.items) {
                v = this._model.items[k];
                if (typeof v !== 'undefined' && v !== null) {
                    litItems.push({ Qty: v.Quantity, LiteratureItem: { "$key": k} });
                }
            }
            var entity = {
                ContactName: contactData.$descriptor,
                Contact: { "$key": contactData.$key },
                RequestDate: new Date(),
                RequestUser: { "$key": this._model.UserId },
                CoverId: this._model.CoverId,
                CoverName: this._model.CoverName,
                TotalCost: this._model.getTotalCost(),
                LitRequestItems: { "$resources": litItems }
            };
            // populate default properties - any non-complex member property gets added
            // (SData will discard anything that's not actually valid)
            for (k in this._model) {
                v = this._model[k];
                if (typeof v !== 'undefined' && v !== null) {
                    if (typeof v == "string" || typeof v == "number" ||
                        (typeof v == "object" && v instanceof Date))
                        entity[k] = v;
                }
            };
            this._model.onPrepareRequest(entity);

            var def = new dojo.Deferred();

            var service = Sage.Utility.getSDataService('dynamic');
            var request = new Sage.SData.Client.SDataSingleResourceRequest(service);
            request.setResourceKind("litRequests");
            request.create(entity, {
                success: function (response) {
                    def.resolve(response);
                },
                failure: function (response, o) {
                    def.reject(LitrequestResources.SDataRequestFailed);
                }
            });
            return def;
        },

        _createActivityForRequest: function (litRequestEntry) {
            // summary:
            //  Call the "create activity" business rule to create the related activity (this also realigns the request id 
            //  to match)
            //  Returns a deferred which will resolve to the activity id (i.e. the new request id)
            var service = Sage.Data.SDataServiceRegistry.getSDataService('dynamic');
            var request = new Sage.SData.Client.SDataServiceOperationRequest(service)
                .setOperationName("CreateActivity")
                .setResourceKind("litRequests");
            var payload = {
                $name: "CreateActivity",
                request: {
                    entity: { "$key": litRequestEntry.$key }
                }
            };
            var def = new dojo.Deferred();
            request.execute(payload, {
                success: function (response) {
                    var id = response.response.Result;
                    def.resolve(id);
                },
                failure: function (response) {
                    // there is not much interesting for the end user in the response... 
                    // admins will get some info in the event log
                    def.reject(LitrequestResources.SDataRequestFailed);
                }
            });
            return def;
        }
    });

    dojo.declare("LitRequest.LiteratureItemStore", [dojo.data.ItemFileWriteStore], {
        // summary:
        //  Custom store used for literature items.
        totalCount: 0,
        constructor: function () {
            // this will cause the data to be loaded once.  Queries after that will be done against the in-memory data.
            // to reload the data with a different url, call close() then fetch()
            // note this default implementation only returns 1 page of data.   
            // In scenarios where there is a very high number of literature items the performance may not be acceptable.  Also in scenarios where
            // there is a huge number of items (more than 1M) they may not all be returned by the service.  Ideally we should page it but the requirement
            // for it to be editable makes it not very practical.  The limitations should be acceptable in virtually all cases.
            var fields = "Itemname,Itemfamily,Cost,Itemnumber";  // for performance reason we only retrieve some columns
            // if more are desired they should be added here
            this.url = "slxdata.ashx/slx/dynamic/-/literatureitems?format=json&select=" + fields + "&count=999999&orderby=Itemfamily,Itemname";
            this.clearOnClose = true;
        },

        _getItemsFromLoadedData: function (dataObject) {
            // summary:
            //  Override so that we read from $resources
            this.totalCount = dataObject.$totalResults;
            dojo.forEach(dataObject.$resources, function (v) {
                v.Quantity = 0;
                v.Cost = Number(v.Cost) || null;
            });
            dataObject.items = dataObject.$resources;
            dataObject.identifier = "$key";
            return this.inherited(arguments);
        },

        _containsValue: function (item, key, value, rx) {
            // Override "containsValue" to allow for a "wild" query, where we can match on either name, family or number.
            //console.log("Contains Value");
            if (key == "search") {
                var self = this;
                return dojo.some(["Itemname", "Itemnumber", "Itemfamily"], function (attribute) {
                    var possibleValue = self.getValue(item, attribute);
                    if (rx) {
                        return !!possibleValue.toString().match(rx);
                    } else {
                        return possibleValue === value;
                    }
                });
            } else {
                return this.inherited(arguments);
            }
        }

        // optionally _fetchItems could be overridden to change the way that the query is interpreted
    });


    ///////////////////////////// VIEWS

    ///////// Contact Picker
    dojo.declare("LitRequest.ContactSelectionView", null, {
        _model: null,
        _formPrefix: null,

        constructor: function (div, model, formPrefix) {
            this._model = model;
            this._formPrefix = formPrefix;
            this.optRequestForContact = dojo.byId(formPrefix + "optRequestForContact");
            this.optRequestForOpportunity = dojo.byId(formPrefix + "optRequestForOpportunity");
            this.optRequestForGroup = dojo.byId(formPrefix + "optRequestForGroup");
            this.lueContact = this._createContactLookup(formPrefix);
            this.lueOpportunity = this._createOpportunityLookup(formPrefix);

            this.cboGroup = dijit.byId(formPrefix + "ddlContactGroup");
            this.divContactTotal = dojo.query(".contacttotal", div)[0];

            dojo.query("input[type=radio]", div).connect("onclick", this, "_onRblRequestForChange");
            dojo.connect(this.cboGroup, "onChange", this, "_onContactGroupChange");
            dojo.connect(this._model, "onSet", this, "_onModelChange");

            this._onRblRequestForChange();
        },

        _createContactLookup: function (formPrefix) {
            var btn = dojo.byId("lueContactImg");
            var r = this;
            dojo.connect(btn, "onclick", function () {
                var cols = [
                    {
                        name: LitrequestResources.Lookup_NameLF_PropertyHeader || 'Name',
                        field: 'FullName',
                        width: 13
                    }, {
                        name: LitrequestResources.Lookup_Account_PropertyHeader || 'Account',
                        field: 'AccountName',
                        width: 10
                    }, {
                        name: LitrequestResources.Lookup_City_PropertyHeader || 'City',
                        field: 'Address.City'
                    }, {
                        name: LitrequestResources.Lookup_State_PropertyHeader || 'State',
                        field: 'Address.State',
                        width: 5
                    }, {
                        name: LitrequestResources.Lookup_Work_PropertyHeader || 'Phone',
                        field: 'WorkPhone',
                        width: 10,
                        type: Sage.UI.Columns.Phone
                    }
                    ];
                var lue = dijit.byId('contactLookup');

                if (!lue) {
                    lue = new Sage.UI.SDataLookup({
                        id: 'contactLookup',
                        dialogTitle: LitrequestResources.FindContact,
                        dialogButtonText: LitrequestResources.SelectContact,
                        isModal: true,
                        displayMode: 1,  // dialog
                        structure: [{ cells: cols}],
                        storeOptions: {
                            resourceKind: 'contacts',
                            select: ['FullName']
                        },
                        gridOptions: {
                            selectionMode: 'Single',
                            rowsPerPage: 15
                        },
                        doSelected: function (items) {
                            dojo.byId(formPrefix + "lueContact").value = items[0].$descriptor;
                            dojo.byId(formPrefix + "lueContactResult").value = items[0].$key;
                            r._onContactChange();
                            dijit.byId('contactLookup-Dialog').hide();
                        }
                    });
                }

                lue.showLookup();
            });

            return {
                getResultValue: function () {
                    return dojo.byId(formPrefix + "lueContactResult").value;
                },
                disable: function () {
                    btn.style.display = "none";
                },
                enable: function () {
                    btn.style.display = "inline";
                }
            };
        },

        _createOpportunityLookup: function (formPrefix) {
            var btn = dojo.byId("lueOpportunityImg");
            var r = this;
            dojo.connect(btn, "onclick", function () {
                var cols = [
                    {
                        name: LitrequestResources.Lookup_Description_PropertyHeader || 'Description',
                        field: 'Description',
                        width: 13
                    }, {
                        name: LitrequestResources.Lookup_Account_PropertyHeader || 'Account',
                        field: 'Account.AccountName',
                        width: 10
                    }, {
                        name: LitrequestResources.Lookup_City_PropertyHeader || 'City',
                        field: 'Account.Address.City'
                    }
                ];
                var lue = dijit.byId('opportunityLookup');
                if (!lue) {
                    lue = new Sage.UI.SDataLookup({
                        id: 'opportunityLookup',
                        dialogTitle: LitrequestResources.FindOpportunity,
                        dialogButtonText: LitrequestResources.SelectOpportunity,
                        isModal: true,
                        displayMode: 1,  // dialog
                        structure: [{ cells: cols}],
                        storeOptions: {
                            resourceKind: 'opportunities',
                            select: ['Description']
                        },
                        gridOptions: {
                            selectionMode: 'Single',
                            rowsPerPage: 15
                        },
                        doSelected: function (items) {
                            dojo.byId(formPrefix + "lueOpportunity").value = items[0].$descriptor;
                            dojo.byId(formPrefix + "lueOpportunityResult").value = items[0].$key;
                            r._onOpportunityChange();
                            dijit.byId("opportunityLookup-Dialog").hide();
                        }
                    });
                }
                lue.showLookup();
            });

            return {
                getResultValue: function () {
                    return dojo.byId(formPrefix + "lueOpportunityResult").value;
                },
                disable: function () {
                    btn.style.display = "none";
                },
                enable: function () {
                    btn.style.display = "inline";
                }
            };
        },

        // Event handlers
        _onRblRequestForChange: function () {
            // summary:
            //  Enable / disable the lookups associated with the radio buttons

            if (this.optRequestForContact.checked) {
                this.lueContact.enable();
                this._onContactChange();
            } else {
                this.lueContact.disable();
            }
            if (this.optRequestForOpportunity.checked) {
                this.lueOpportunity.enable();
                this._onOpportunityChange();
            } else {
                this.lueOpportunity.disable();
            }
            if (this.optRequestForGroup.checked) {
                this.cboGroup.attr("disabled", false);
                this._onContactGroupChange();
            } else {
                this.cboGroup.attr("disabled", true);
            }
        },

        _onModelChange: function (model, name, oldVal, newVal) {
            // summary:
            //  Update total # of contacts selected.
            if (name === "contacts") {
                var numContacts = newVal ? newVal.length : 0;
                this._showSelectedContacts(numContacts);
            }
        },

        _onContactChange: function () {
            // summary:
            //  Set contact id on the model.
            var id = this.lueContact.getResultValue();
            if (id) {
                this._model.setValue("contacts", [id]);
            } else {
                this._model.setValue("contacts", []);
            }
        },

        _getGroupData: function (gid, callback) {
            var self = this;
            var oSDataService = Sage.Data.SDataServiceRegistry.getSDataService("system");
            var oRequest = new Sage.SData.Client.SDataResourcePropertyRequest(oSDataService);
            oRequest.setResourceKind("groups");
            var sSelector = dojo.string.substitute('"${0}"', [gid]);
            oRequest.setResourceSelector(sSelector);
            oRequest.setQueryArg("select", "ContactId");
            oRequest.setResourceProperty("$queries/execute");
            oRequest.setQueryArg("count", MAX_CONTACTS);
            oRequest.readFeed({
                success: function (data) {
                    var oResources = (typeof data !== "undefined" && data != null) ? data["$resources"] : null;
                    if (typeof callback === "function")
                        callback(oResources);
                },
                failure: function (xhr, sdata) {
                    self.divContactTotal.innerHTML = LitrequestResources.NoContactSelected;
                    Sage.Utility.ErrorHandler.handleHttpError(
                        xhr, sdata,
                        {
                            message: LitrequestResources.GroupDataError
                        });
                }
            });
        },

        _onContactGroupChange: function () {
            // summary:
            //  Display total # of contacts selected.  Set contact ids on the model.
            var gid = this.cboGroup.attr("value");
            if (gid) {
                var model = this._model;
                this._showLoading();
                var callback = function (data) {
                    if (dojo.isObject(data)) {
                        model.setValue("contacts", dojo.map(data, function (record) { return record.CONTACTID; }));
                    }
                };
                this._getGroupData(gid, callback);
            } else {
                this._model.setValue("contacts", []);
            }
        },

        _onOpportunityChange: function () {
            // summary: 
            //  Display total # of contacts selected.  Set contact ids on the model.
            var self = this;
            var oppId = this.lueOpportunity.getResultValue();
            if (oppId) {
                var model = this._model;
                this._showLoading();
                sandbox.ajax({
                    url: "slxdata.ashx/slx/dynamic/-/opportunitycontacts?format=json&select=Contact&count=" + MAX_CONTACTS + "&where=Opportunity.Id eq '" + oppId + "'",
                    handleAs: "json",
                    preventCache: true,
                    load: function (data) {
                        if (data.$totalResults > 0) {
                            model.setValue("contacts", dojo.map(data.$resources, function (v) {
                                return v.Contact.$key;
                            }));
                        } else {
                            model.setValue("contacts", []);
                        }
                    },
                    error: function (e) {
                        self.divContactTotal.innerHTML = LitrequestResources.NoContactSelected;
                        Sage.UI.Dialogs.showError(e);
                    }
                });
            } else {
                this._model.setValue("contacts", []);
            }
        },


        // UI Helpers

        _showLoading: function () {
            this.divContactTotal.innerHTML = LitrequestResources.Loading;
        },

        _showSelectedContacts: function (numContacts) {
            if (numContacts > 0) {
                this.divContactTotal.innerHTML = String.format(LitrequestResources.XContactsSelected, numContacts);
            } else {
                this.divContactTotal.innerHTML = LitrequestResources.NoContactSelected;
            }
        }

    });

    dojo.declare("LitRequest.CoverLetterSelection", null, {
        // summary:
        //  View responsible for picking the cover letter and cover letter option
        constructor: function (model) {
            this._model = model;
            this._templatePicker = new LitRequest.TemplatePicker({}, "Cover");
            this._templatePicker.startup();
            dojo.query("input[type=radio][name$=rblPrintLiteratureList]").connect("onclick", this, "_onRblPrintLiteratureListChange");
            var self = this;
            dojo.connect(this._templatePicker, "onTemplateSelected", function (id, name) {
                self._model.CoverId = id;
                self._model.CoverName = name;
            });
            dojo.connect(this._model, "onSet", this, "_onModelChange");
        },

        _onRblPrintLiteratureListChange: function (e) {
            // summary:
            //  Save cover letter option change to model
            e = e || event;
            var option = e.target.value;
            this._model.setValue("Options", option);
        },

        _onModelChange: function (model, prop, oldVal, newVal) {
            // summary:
            //  Handle change in cover letter options

            if (prop == "Options") {
                if (newVal == "2") {  // attachment list only
                    this._templatePicker.disable();
                } else {
                    this._templatePicker.enable();
                }
            }
        }
    });


    dojo.declare("LitRequest.RequestParametersView", null, {
        // summary:
        //  Handles the "other" parameters on the form (all the plain controls)
        constructor: function (model, formPrefix) {
            this._model = model;
            dojo.connect(dojo.byId(formPrefix + "Description"), "onchange", function () {
                model.setValue("Description", this.value);
            });
            dojo.connect(dijit.byId(formPrefix + "dteDeliverBy"), "onChange", function () {
                model.setValue("SendDate", this.get('value'));
            });
            dojo.connect(dojo.byId("FulfillLocally"), "onchange", function () {
                model.setValue("FulfillLocally", this.checked);
            });
            dojo.connect(dijit.byId(formPrefix + "Priority-SingleSelectPickList-Combo"), "onChange", function () {
                model.setValue("Priority", this.get('value'));
            });
            dojo.connect(dijit.byId(formPrefix + "SendVia-SingleSelectPickList-Combo"), "onChange", function () {
                model.setValue("SendVia", this.get('value'));
            });
        }
    });

    dojo.declare("LitRequest.LiteratureItemSelectionView", null, {
        constructor: function (model, itemsStore, formPrefix) {
            this._model = model;
            this.setupFilter(formPrefix);
            this.setupTree(model, itemsStore);
            this.setupTotal(model);
        },

        setupTree: function (model, itemsStore) {
            var tree = new LitRequest.LiteratureGrid({ model: model, store: itemsStore, filter: this.filter }, "itemsTree");
            tree.startup();
            dojo.connect(tree, "onItemEdited", function (item) {
                model.setLiteratureItem(item);
            });
        },

        setupTotal: function (model) {
            this._totalCost = new Sage.UI.Controls.Currency({
                id: 'totalCostControl',
                constraints: { places: Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalDigits, currency: model.baseCurrency, locale: Sys.CultureInfo.CurrentCulture.name },
                exchangeRateType: 'BaseRate',
                multiCurrency: model.multiCurrencyEnabled,
                disabled: true,
                readonly: "readonly",
                currentCode: model.baseCurrency,
                style: "display:inline-block; white-space: nowrap",
                'class': 'currency',
                value: 0
            });
            dojo.place(this._totalCost.domNode, "lblTotalCost", "replace");
            var valueNode = this._totalCost.focusNode;
            var updateTotal = function () {
                dojo.byId("lblTotalSelected").innerHTML = dojo.number.format(model.countSelected());
                valueNode.set("value", model.getTotalCost());
            };
            dojo.connect(model, "onLiteratureItemUpdated", updateTotal);
            updateTotal();
        },

        setupFilter: function (formPrefix) {
            var filter = this.filter = new LitRequest.ItemFilter({}, "itemsFilter");
            dojo.connect(dojo.byId(formPrefix + "btnItemsFilter"), "onclick", function (evt) {
                filter.toggle();
                evt.preventDefault();
                return false;
            });
        }
    });

    dojo.declare("LitRequest.ErrorModule", null, {
        // summary:
        //  Display error messages.
        constructor: function () {
            sandbox.subscribe(EVENTS.Error, function (e) {
                Sage.UI.Dialogs.showError(e);
            });
        }
    });

    dojo.declare("LitRequest.SubmissionProgressModule", null, {
        // summary:
        //  Progress bar module

        _dlg: null,  // dialog widget
        _progressBar: null,

        constructor: function () {
            sandbox.subscribe(EVENTS.SubmissionStart, dojo.hitch(this, "_initProgress"));
            sandbox.subscribe(EVENTS.SubmissionProgress, dojo.hitch(this, "_updateProgress"));
            sandbox.subscribe(EVENTS.SubmissionComplete, dojo.hitch(this, "_completeProgress"));
            sandbox.subscribe(EVENTS.Error, dojo.hitch(this, "_closeDialog"));
        },

        _initProgress: function (total) {
            // open the progress dialog
            if (!this._dlg) {
                this._dlg = new dijit.Dialog({ title: LitrequestResources.SubmissionInProgress, style: "width: 300px" });
                this._progressBar = new dijit.ProgressBar({ progress: 0 });
                this._dlg.containerNode.appendChild(this._progressBar.domNode);
            }

            this._progressBar.update({ maximum: total, progress: 0 });
            this._dlg.show();
        },

        _updateProgress: function (pos) {
            if (this._progressBar) {
                this._progressBar.update({
                    progress: pos
                });
            }
        },

        _completeProgress: function () {
            this._closeDialog();
            window.location.href = window.location.href;
        },

        _closeDialog: function () {
            if (this._dlg && this._dlg.open)
                this._dlg.hide();
        }
    });

    dojo.declare("LitRequest.ToolbarModule", null, {
        // summary:
        //  Handle button action and make sure they are disabled while request is in progress

        _formPrefix: null,

        constructor: function (model, formPrefix) {
            this._formPrefix = formPrefix;
            sandbox.subscribe(EVENTS.SubmissionStart, dojo.hitch(this, "_disableSubmissionButton"));
            sandbox.subscribe(EVENTS.SubmissionComplete, dojo.hitch(this, "_resetSubmissionButton"));
            sandbox.subscribe(EVENTS.Error, dojo.hitch(this, "_resetSubmissionButton"));
            dojo.connect(dojo.byId(formPrefix + "btnSave"), "onclick", function (evt) {
                model.submitRequest();
                evt.preventDefault();
            });
        },

        _disableSubmissionButton: function () {
            dojo.attr(this._formPrefix + "btnSave", "disabled", "disabled");
        },

        _resetSubmissionButton: function () {
            dojo.removeAttr(this._formPrefix + "btnSave", "disabled");
        }
    });


    dojo.declare("LitRequest.LiteratureRequestForm", null, {
        constructor: function (formPrefix, options) {
            // summary:
            //  Initialize the literature request javascript.
            // formPrefix:
            //  Prefix for the form's control (id of the form from server side code).  Normally 'ctl00_MainContent_LiteratureRequest'.
            var itemsStore = new LitRequest.LiteratureItemStore({});
            var model = new LitRequest.LiteratureRequestModel(options, itemsStore);

            // UI
            var conSel = new LitRequest.ContactSelectionView(dojo.byId("contactselection"), model, formPrefix);
            var coverSel = new LitRequest.CoverLetterSelection(model);
            var litItemSel = new LitRequest.LiteratureItemSelectionView(model, itemsStore, formPrefix);
            new LitRequest.RequestParametersView(model, formPrefix);
            new LitRequest.ToolbarModule(model, formPrefix);

            // helper modules
            new LitRequest.ErrorModule();
            new LitRequest.SubmissionProgressModule();

            // reset focus to description, otherwise this form's initialization removes the focus
            var descriptionField = dijit.byId('MainContent_LiteratureRequest_Description');
            if (descriptionField) { descriptionField.focus(); }
        }
    });

    //////////////////////////////// HELPER WIDGETS

    // (No business logic below this line)


    // Literature Grid
    dojo.declare("LitRequest.LiteratureGrid", [dijit._Widget, dijit._Templated], {
        templateString: "<div><table dojoAttachPoint='grid' dojoType='dojox.grid.DataGrid' selectionMode='single' autoHeight='15' query='{}' noDataMessage='" + LitrequestResources.NoRecordFound + "'>" +
            "<thead><tr>" +
        // other columns may be added here, however, the fields also need to be added to the LiteratureItemsStore to ensure they are getting retrieved from SData
            "<th field='Quantity' editable='true' width='45px'>" + LitrequestResources.Quantity_Header + "</th>" +
            "<th field='Itemfamily' width='120px'>" + LitrequestResources.ItemFamily_Header + "</th>" +
            "<th field='Itemnumber' width='80px'>" + LitrequestResources.ItemNumber_Header + "</th>" +
            "<th field='Itemname' width='160px'>" + LitrequestResources.ItemName_Header + "</th>" +
            "<th cellType='Sage.UI.Columns.Currency' field='Cost' width='45px'>" + LitrequestResources.Cost_Header + "</th>" +
            "</tr></thead></table>" +
            "</div>",
        widgetsInTemplate: true,
        store: null,  // Literature items store
        filter: null,   // filter widget
        // Widget lifecycle
        postCreate: function () {
            this.inherited(arguments);

            // Currency cell
            var cell = this.grid.layout.cells[4];
            cell.exchangeRate = 1;
            cell.exchangeRateType = 'BaseRate';
            cell.displayCurrencyCode = true;
            cell.multiCurrency = this.model.multiCurrencyEnabled;
            cell.currentCode = this.model.baseCurrency;
            cell.constraints = { places: Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalDigits, currency: this.model.baseCurrency, locale: Sys.CultureInfo.CurrentCulture.name };

            var self = this;
            this.store.fetch({
                onComplete: function () {
                    self.grid.setStore(self.store);
                    if (self.store.totalCount > 0) {
                        // The grid must be focused; otherwise, if you tab into the control and arrow down you will get errors.
                        self.grid.focus.setFocusIndex(0, 0);
                        self.grid.focus.setFocusCell(self.grid.focus.cell, 0);
                        // Shift the focus back to the description field.
                        dijit.byId('MainContent_LiteratureRequest_Description').focus();
                    }
                },
                onError: function (error) {
                    Sage.UI.Dialogs.showError(error.message);
                }
            });
            dojo.connect(this.grid, "onApplyCellEdit", this, "_onGridEdited");
            dojo.connect(this.filter, "onFilter", dojo.hitch(this, function (qry) {
                this.grid.setQuery(qry, { ignoreCase: true });
            }));
            dojo.connect(this.grid, "onKeyDown", this, function (e) {
                var key = e.keyCode;
                var isEditing = this.grid.edit.isEditing();
                var amount = (isEditing) ? 1 : 0;
                var dk = dojo.keys;
                switch (key) {
                    case dk.ENTER:
                        if (!e.shiftKey) {
                            dojo.stopEvent(e);
                            this.grid.edit.apply();
                            this.grid.edit.cancel();
                            if (this.grid.focus.rowIndex + 1 != this.grid.store.totalCount) {
                                dojo.stopEvent(e);
                                this.grid.focus.setFocusIndex(this.grid.focus.rowIndex + 1, 0);
                                this.grid.edit.setEditCell(this.grid.focus.cell, this.grid.focus.rowIndex);
                                this.grid.focus.focusGrid();
                            }
                        }
                        break;
                    case dk.F2:
                        dojo.stopEvent(e);
                        this.grid.edit.setEditCell(this.grid.focus.cell, this.grid.focus.rowIndex);
                        break;
                    case dk.UP_ARROW:
                        if (this.grid.focus.rowIndex != 0 && this.grid.focus.rowIndex) {
                            dojo.stopEvent(e);
                            this.grid.focus.setFocusIndex(this.grid.focus.rowIndex - amount, 0);
                            this.grid.edit.setEditCell(this.grid.focus.cell, this.grid.focus.rowIndex);
                            this.grid.focus.focusGrid();
                        }
                        break;
                    case dk.DOWN_ARROW:
                        if (this.grid.focus.rowIndex + 1 != this.grid.store.totalCount) {
                            dojo.stopEvent(e);
                            this.grid.focus.setFocusIndex(this.grid.focus.rowIndex + amount, 0);
                            this.grid.edit.setEditCell(this.grid.focus.cell, this.grid.focus.rowIndex);
                            this.grid.focus.focusGrid();
                        }
                        break;
                }
            });
        },

        // Events

        onItemEdited: function (item) {
            // summary:
            //  Invoked when an item is modified
            // item: 
            //  Item edited (will already have new value)
        },

        // Private Helpers
        _onGridEdited: function (inValue, inRowIndex, inAttrName) {
            var item = this.grid.getItem(inRowIndex);
            var newItem = {};
            var store = this.store;
            // translate from a "store" item into a plain javascript object
            dojo.forEach(store.getAttributes(item), function (name) {
                newItem[name] = store.getValue(item, name);
            });
            this.onItemEdited(newItem);
        }

    });


    /////////// Filter widget

    dojo.declare("LitRequest.ItemFilter", [dijit._Widget, dijit._Templated], {
        templateString: "<div class='itemfilter' style='display: none' dojoAttachPoint='panel'><label class='lbl' for='txtSearchBy'>" + LitrequestResources.SearchBy + "</label>" +
            "<div class='textcontrol'><input id='txtSearchBy' dojoAttachPoint='txtSearchBy' type='text'></div>" +
            "<br/>" +
            "</div>",

        postCreate: function () {
            dojo.connect(this.txtSearchBy, "onkeyup", dojo.hitch(this, function (evt) {
                var f = this.txtSearchBy.value;
                if (f) {
                    // "search" is a "wild" search, implemented by our custom store
                    this.onFilter({ search: "*" + f + "*" });
                } else {
                    this.onFilter({});
                }
            }));
            dojo.connect(this.txtSearchBy, "onfocus", dojo.hitch(this, function (evt) {
                var widget = dijit.byId("itemsTree");
                if (widget && widget.grid) {
                    // IE fix; Firefox applies the eidt correctly when focus leaves the grid.
                    if (widget.grid.edit.isEditing()) {
                        widget.grid.edit.apply();
                    }
                }
            }));
        },

        toggle: function () {
            if (this.panel.style.display == "none") {
                this.panel.style.display = "block";
                this.txtSearchBy.focus();
            } else {
                this.panel.style.display = "none";
            }
        },

        onFilter: function (query) {
            // summary:
            //  Called when filter should be applied
            // query:
            //  Query formatted for dojo.data store
        }
    });


    /////////// Cover Letter Picker

    dojo.declare("LitRequest.TemplatePicker", [dijit._Widget, dijit._Templated], {
        // summary:
        //  widget used for the template selection
        templateString:
            "<div class='twocolumntextcontrol'>" +
            "<span id='CoverPageLookupSpan' class='lookup' slxcompositecontrol='true'>" +
            "<input dojoAttachPoint='txtCoverName' id='CoverPageName' type='text'>" +
            "<a href='#'>" +
            "<img dojoAttachPoint='btnSearch' style='vertical-align:middle;padding-top:2px;cursor:pointer;' src='images/icons/Find_16x16.png' alt='" + LitrequestResources.TemplateFindIcon_AlternateText + "' title='" + LitrequestResources.TemplateFindIcon_AlternateText + "'>" +
            "</a>" +
            "</span>" +
            "</div>",
        widgetsInTemplate: true,
        postMixInProperties: function () {
        },
        postCreate: function () {
            this.inherited(arguments);
            dojo.connect(this.btnSearch, "onclick", this, "_openPopup");
            dojo.connect(this.txtCoverName, "onkeypress", this, function (e) {
                if (e.keyCode != dojo.keys.TAB) {
                    this._openPopup();
                    dojo.stopEvent(e);
                }
            });
        },

        // Public API

        disable: function () {
            this.txtCoverName.disabled = true;
            this.btnSearch.style.display = "none";
        },

        enable: function () {
            this.txtCoverName.disabled = false;
            this.btnSearch.style.display = "inline";
        },

        // Events

        onTemplateSelected: function (id, name) {
            // summary:
            //  Invoked when the user has picked a template.
            this.txtCoverName.value = name;
        },

        // UI Helpers

        _openPopup: function () {
            dojo.require("Sage.MailMerge.Templates");
            var r = this;
            dojo.ready(function () {
                var templates = new Sage.MailMerge.Templates();
                templates.select("CONTACT", {
                    onSelect: function (item) {
                        r.onTemplateSelected(item.id, item.family + ":" + item.name);
                    }
                });
            });
        }

    });
});

if (typeof Sys != "undefined")
    Sys.Application.notifyScriptLoaded();