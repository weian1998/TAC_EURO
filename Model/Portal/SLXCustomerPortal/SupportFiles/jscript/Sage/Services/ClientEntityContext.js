/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define, TabControl, __doPostBack */
define([
    'dojo/_base/declare'
],
function (declare) {
    var widget = declare('Sage.Services.ClientEntityContext', null, {
        hasClearListener: false,
        tempContext: false,
        constructor: function (options) {
            //console.log('ClientEntityContext is starting up...');
            this.inherited(arguments);
            dojo.mixin(this, options);
            this.emptyContext = { "EntityId": "", "EntityType": "", "Description": "", "EntityTableName": "" };
        },
        getContext: function () {
            if (this.tempContext) {
                return this.tempContext;
            }
            if ((Sage.Data) && (Sage.Data.EntityContextStore)) {
                return Sage.Data.EntityContextStore;
            }
            return this.emptyContext;
        },
        setContext: function (obj) {
            Sage.Data.EntityContextStore = dojo.mixin(this.emptyContext, obj);
            this.onEntityContextChanged(Sage.Data.EntityContextStore);
        },
        setTemporaryContext: function (obj) {
            this.tempContext = obj;
        },
        clearTemporaryContext: function () {
            this.tempContext = false;
        },
        navigateSLXGroupEntity: function (toEntityId, previousEntityid, clientPosition) {
            if (Sage.Services) {
                var mgr = Sage.Services.getService("ClientBindingManagerService");
                if ((mgr) && (!mgr.canChangeEntityContext())) {
                    return false;
                }

                var contextservice = Sage.Services.getService("ClientContextService");
                if (contextservice.containsKey("ClientEntityId")) {
                    contextservice.setValue("ClientEntityId", toEntityId);
                } else {
                    contextservice.add("ClientEntityId", toEntityId);
                }
                previousEntityid = (previousEntityid) ? previousEntityid : Sage.Data.EntityContextStore.EntityId;
                if (contextservice.containsKey("PreviousEntityId")) {
                    contextservice.setValue("PreviousEntityId", previousEntityid);
                } else {
                    contextservice.add("PreviousEntityId", previousEntityid);
                }
                if (clientPosition) {
                    if (contextservice.containsKey("ClientEntityPosition")) {
                        contextservice.setValue("ClientEntityPosition", clientPosition);
                    } else {
                        contextservice.add("ClientEntityPosition", clientPosition);
                    }
                }
                //wire up cleanup service...
                if (!this.hasClearListener) {
                    Sys.WebForms.PageRequestManager.getInstance().add_pageLoaded(function () {
                        if (Sage.Services) {
                            var contextservice = Sage.Services.getService("ClientContextService");
                            if (contextservice.containsKey("PreviousEntityId")) {
                                contextservice.remove("PreviousEntityId");
                            }
                        }
                    });
                    this.hasClearListener = true;
                }
                //set current state for things that load earlier in the response than the new full context.
                Sage.Data.EntityContextStore.EntityId = toEntityId;
                Sage.Data.EntityContextStore.Description = '';

            }
            if (window.TabControl) {
                var tState = TabControl.getState();
                if (tState) {
                    tState.clearUpdatedTabs();
                    TabControl.updateStateProxy();
                }
            }
            __doPostBack("MainContent", "");
            return true;
        },
        onEntityContextChanged: function (newContext) {

        }
    });

    if (!Sage.Services.hasService('ClientEntityContext')) {
        Sage.Services.addService('ClientEntityContext', new Sage.Services.ClientEntityContext());
    }

    return widget;
});