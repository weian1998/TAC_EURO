
Sage.ClientEntityContextService = function () {
    this.emptyContext = { "EntityId": "", "EntityType": "", "Description": "", "EntityTableName": "" };
    this._context = false;
    this.hasClearListener = false;
}

Sage.ClientEntityContextService.prototype.getContext = function () {
    if ((Sage.Data) && (Sage.Data.EntityContextStore)) {
        return Sage.Data.EntityContextStore;
    }
    return this.emptyContext;
}

Sage.ClientEntityContextService.prototype.setContext = function (obj) {
    if (typeof dojo !== 'undefined') {
        Sage.Data.EntityContextStore = dojo.mixin(this.emptyContext, obj);
    } else {
        Sage.Data.EntityContextStore.EntityId = obj.EntityId || '';
        Sage.Data.EntityContextStore.EntityType = obj.EntityType || '';
        Sage.Data.EntityContextStore.Description = obj.Description || '';
        Sage.Data.EntityContextStore.EntityTableName = obj.EntityTableName || '';
    }
}

//function setCurentEntityContext(entityid, previousEntityid, clientPosition) {
Sage.ClientEntityContextService.prototype.navigateSLXGroupEntity = function (toEntityId, previousEntityid, clientPosition) {
    if (Sage.Services) {
        var mgr = Sage.Services.getService("ClientBindingManagerService");
        if ((mgr) && (!mgr.canChangeEntityContext())) { return false; }

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
    return true;
}

Sage.Services.addService("ClientEntityContext", new Sage.ClientEntityContextService());