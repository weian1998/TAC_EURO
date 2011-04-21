/*  ------------------------------------------------------------------------
                         Sage SalesLogix Mail Merge
                 Sage.MailMergeContextService implementation 
                      Copyright(c) 2010, Sage Software
            
    This service class is used to access the current entity context
    information as related to mail merge.
    ------------------------------------------------------------------------ */

Sage.MailMergeContextService = function() {
    this.__clientContext = null;
    this.__clientEntityContext = null;
    this.__clientGroupContext = null;
    if (Sage.Services.hasService("ClientContextService")) {
        this.__clientContext = Sage.Services.getService("ClientContextService");
    }
    if (Sage.Services.hasService("ClientEntityContext")) {
        this.__clientEntityContext = Sage.Services.getService("ClientEntityContext");
    }
    if (Sage.Services.hasService("ClientGroupContext")) {
        this.__clientGroupContext = Sage.Services.getService("ClientGroupContext");
    }
    this.DetailAccountId = null;
    this.DetailOpportunityId = null;
    this.DetailTicketId = null;
    this.EntityDescription = null;
    this.EntityDisplayName = null;
    this.EntityId = null;
    this.EntityIsAccount = false;
    this.EntityIsContact = false;
    this.EntityIsLead = false;
    this.EntityIsOpportunity = false;
    this.EntityIsTicket = false;
    this.EntityKeyField = null;
    this.EntityTableName = null;
    this.EntityType = null;
    this.GroupCanBeMergedTo = false;
    this.GroupId = null;
    this.GroupName = null;
    this.GroupTableName = null;
    this.IsDetailMode = false;
    this.IsMailMergeRelatedEntity = false;
};

Sage.MailMergeContextService.prototype.GetClientContext = function(key, nocase) {
    if (this.__clientContext != null) {
        if (this.__clientContext.containsKeyEx(key, nocase)) {
            return this.__clientContext.getValueEx(key, nocase);
        }
    }
    return null;
};

Sage.MailMergeContextService.prototype.GetCurrentEntityId = function() {
    /* e.g. "CGHEA0002670" */
    return (this.__clientEntityContext != null) ? this.__clientEntityContext.getContext().EntityId : "";
};

Sage.MailMergeContextService.prototype.GetCurrentEntityType = function() {
    /* e.g. "Sage.Entity.Interfaces.IContact" */
    return (this.__clientEntityContext != null) ? this.__clientEntityContext.getContext().EntityType : "";
};

Sage.MailMergeContextService.prototype.GetCurrentEntityDescription = function() {
    /* e.g. "Abbott, John" */
    return (this.__clientEntityContext != null) ? this.__clientEntityContext.getContext().Description : "";
};

Sage.MailMergeContextService.prototype.GetCurrentEntityDisplayName = function() {
    /* e.g. "Contact" */
    var sType = this.GetCurrentEntityType();
    if (Ext.isString(sType)) {
        return this.GetEntityDisplayName(sType);
    }
    return "";
};

Sage.MailMergeContextService.prototype.GetCurrentEntityTableName = function() {
    /* e.g. "CONTACT" */
    return (this.__clientEntityContext != null) ? this.__clientEntityContext.getContext().EntityTableName : "";
};

Sage.MailMergeContextService.prototype.GetCurrentGroupId = function() {
    /* e.g. "p6UJ9A0002B8" or "LOOKUPRESULTS" */
    var sGroupId = (this.__clientGroupContext != null) ? this.__clientGroupContext.getContext().CurrentGroupID : "";
    if (sGroupId != "LOOKUPRESULTS") {
        return sGroupId;
    }
    return "";
};

Sage.MailMergeContextService.prototype.GetCurrentGroupName = function() {
    /* e.g. "All Contacts" */
    if (this.GetCurrentGroupId() != "") {
        return (this.__clientGroupContext != null) ? this.__clientGroupContext.getContext().CurrentName : "";
    }
    return "";
};

Sage.MailMergeContextService.prototype.GetCurrentGroupTableName = function() {
    /* e.g. "CONTACT" */
    if (this.GetCurrentGroupId() != "") {
        return (this.__clientGroupContext != null) ? this.__clientGroupContext.getContext().CurrentTable : "";
    }
    return "";
};

Sage.MailMergeContextService.prototype.GetEntityDisplayName = function(type) {
    /* e.g. "Contact" */
    if (Ext.isString(type)) {
        switch (type) {
            case "Sage.Entity.Interfaces.IAccount":
                return "Account"; /*DNL*/
            case "Sage.Entity.Interfaces.IContact":
                return "Contact"; /*DNL*/
            case "Sage.Entity.Interfaces.IContract":
                return "Contract"; /*DNL*/
            case "Sage.Entity.Interfaces.ILead":
                return "Lead"; /*DNL*/
            case "Sage.Entity.Interfaces.IOpportunity":
                return "Opportunity"; /*DNL*/
            case "Sage.Entity.Interfaces.IReturn":
                return "RMA"; /*DNL*/
            case "Sage.Entity.Interfaces.ITicket":
                return "Ticket"; /*DNL*/
        }
    }
    return "";
};

Sage.MailMergeContextService.prototype.GetEntityIsAccount = function(entity) {
    return (entity === "Sage.Entity.Interfaces.IAccount") ? true : false;
};

Sage.MailMergeContextService.prototype.GetEntityIsContact = function(entity) {
    return (entity === "Sage.Entity.Interfaces.IContact") ? true : false;
};

Sage.MailMergeContextService.prototype.GetEntityIsLead = function(entity) {
    return (entity === "Sage.Entity.Interfaces.ILead") ? true : false;
};

Sage.MailMergeContextService.prototype.GetEntityIsOpportunity = function(entity) {
    return (entity === "Sage.Entity.Interfaces.IOpportunity") ? true : false;
};

Sage.MailMergeContextService.prototype.GetEntityIsTicket = function(entity) {
    return (entity === "Sage.Entity.Interfaces.ITicket") ? true : false;
};

Sage.MailMergeContextService.prototype.GetEntityTypeForTable = function(tableName) {
    if (Ext.isString(tableName)) {
        switch (tableName.toUpperCase()) {
            case "ACCOUNT":
                return "Sage.Entity.Interfaces.IAccount";
            case "CONTACT":
                return "Sage.Entity.Interfaces.IContact";
            case "CONTRACT":
                return "Sage.Entity.Interfaces.IContract";
            case "LEAD":
                return "Sage.Entity.Interfaces.ILead";
            case "OPPORTUNITY":
                return "Sage.Entity.Interfaces.IOpportunity";
            case "RMA":
                return "Sage.Entity.Interfaces.IReturn";
            case "TICKET":
                return "Sage.Entity.Interfaces.ITicket";
        }
    }
    return "";
};

Sage.MailMergeContextService.prototype.GetGroupCanBeMergedTo = function(groupTableName) {
    if (this.GetCurrentGroupId() == "") return false;
    if (Ext.isString(groupTableName)) {
        switch (groupTableName.toUpperCase()) {
            case "ACCOUNT":
            case "CONTACT":
            case "LEAD":
            case "OPPORTUNITY":
                return true;
        }
    }
    return false;
};

Sage.MailMergeContextService.prototype.GetIsMailMergeRelatedEntity = function(type) {
    if (Ext.isString(type)) {
        switch (type) {
            case "Sage.Entity.Interfaces.IAccount":
            case "Sage.Entity.Interfaces.IContact":
            case "Sage.Entity.Interfaces.IContract":
            case "Sage.Entity.Interfaces.ILead":
            case "Sage.Entity.Interfaces.IOpportunity":
            case "Sage.Entity.Interfaces.IReturn":
            case "Sage.Entity.Interfaces.ITicket":
                return true;
        }
    }
    return false;
};

Sage.MailMergeContextService.prototype.GetKeyField = function(tableName) {
    if (Ext.isString(tableName)) {
        switch (tableName.toUpperCase()) {
            case "ACCOUNT":
                return "ACCOUNTID";
            case "CONTACT":
                return "CONTACTID";
            case "CONTRACT":
                return "CONTRACTID";
            case "LEAD":
                return "LEADID";
            case "OPPORTUNITY":
                return "OPPORTUNITYID";
            case "RMA":
                return "RMAID";
            case "TICKET":
                return "TICKETID";
        }
    }
    return "";
};

Sage.MailMergeContextService.prototype.HasClientContext = function(key, nocase) {
    if (this.__clientContext != null) {
        if (this.__clientContext.containsKeyEx(key, nocase)) {
            return true;
        }
    }
    return false;
};

Sage.MailMergeContextService.prototype.Refresh = function() {
    var oContext = Sage.Services.getService("MailMergeContextService");
    if (oContext) {
        var sEntityType = oContext.GetCurrentEntityType();
        var sEntityTableName = oContext.GetCurrentEntityTableName();
        var sGroupTableName = oContext.GetCurrentGroupTableName();
        oContext.DetailAccountId = oContext.GetEntityIsAccount(sEntityType) ? oContext.EntityId : "";
        oContext.DetailOpportunityId = oContext.GetEntityIsOpportunity(sEntityType) ? oContext.EntityId : "";
        oContext.DetailTicketId = oContext.GetEntityIsTicket(sEntityType) ? oContext.EntityId : "";
        oContext.EntityDescription = oContext.GetCurrentEntityDescription();
        oContext.EntityDisplayName = oContext.GetCurrentEntityDisplayName();
        oContext.EntityId = oContext.GetCurrentEntityId();
        oContext.EntityIsAccount = oContext.GetEntityIsAccount(sEntityType);
        oContext.EntityIsContact = oContext.GetEntityIsContact(sEntityType);
        oContext.EntityIsLead = oContext.GetEntityIsLead(sEntityType);
        oContext.EntityIsOpportunity = oContext.GetEntityIsOpportunity(sEntityType);
        oContext.EntityIsTicket = oContext.GetEntityIsTicket(sEntityType);
        oContext.EntityKeyField = oContext.GetKeyField(sEntityTableName);
        oContext.EntityTableName = sEntityTableName;
        oContext.EntityType = sEntityType;
        oContext.GroupCanBeMergedTo = oContext.GetGroupCanBeMergedTo(sGroupTableName);
        oContext.GroupId = oContext.GetCurrentGroupId();
        oContext.GroupName = oContext.GetCurrentGroupName();
        oContext.GroupTableName = sGroupTableName;
        oContext.IsDetailMode = (oContext.EntityId != null && oContext.EntityId != "");
        oContext.IsMailMergeRelatedEntity = oContext.GetIsMailMergeRelatedEntity(sEntityType);
        return true;
    }
    return false;
};

Sage.MailMergeContextService.prototype.SetClientContext = function(key, value) {
    if (this.__clientContext != null) {
        if (this.__clientContext.containsKey(key)) {
            this.__clientContext.setValue(key, value);
        }
        else {
            this.__clientContext.add(key, value);
        }
        return true;
    }
    return false;
};

Sage.MailMergeContextService.prototype.SetDetailContext = function(
  entityId, entityTableName, entityDescription, accountId, opportunityId, ticketId) {
    var oContext = Sage.Services.getService("MailMergeContextService");
    if (oContext) {
        switch (entityTableName.toUpperCase()) {
            case "CONTACT":
            case "LEAD":
                break;
            default:
                throw new Error(DesktopErrors().SetDetailContextError);
                break;
        }
        var sEntityType = oContext.GetEntityTypeForTable(entityTableName);
        var sGroupTableName = oContext.GetCurrentGroupTableName();
        oContext.DetailAccountId = accountId;
        oContext.DetailOpportunityId = opportunityId;
        oContext.DetailTicketId = ticketId;
        oContext.EntityDescription = entityDescription;
        oContext.EntityDisplayName = oContext.GetEntityDisplayName(sEntityType);
        oContext.EntityId = entityId;
        oContext.EntityIsAccount = false;
        oContext.EntityIsContact = oContext.GetEntityIsContact(sEntityType);
        oContext.EntityIsLead = oContext.GetEntityIsLead(sEntityType);
        oContext.EntityIsOpportunity = false;
        oContext.EntityIsTicket = false;
        oContext.EntityKeyField = oContext.GetKeyField(entityTableName);
        oContext.EntityTableName = entityTableName;
        oContext.EntityType = sEntityType;
        oContext.GroupCanBeMergedTo = oContext.GetGroupCanBeMergedTo(sGroupTableName);
        oContext.GroupId = oContext.GetCurrentGroupId();
        oContext.GroupName = oContext.GetCurrentGroupName();
        oContext.GroupTableName = sGroupTableName;
        // We are mimicking detail mode when calling SetDetailContext()
        oContext.IsDetailMode = true;
        oContext.IsMailMergeRelatedEntity = true;
        return true;
    }
    return false;
};

Sage.MailMergeContextService.prototype.ToJson = function() {
    return Ext.util.JSON.encode(this);
};

function InitMailMergeContextService() {
    if (Ext.isWindows && Sage && Sage.Services) {
        if (!Sage.Services.hasService("MailMergeContextService")) {
            Sage.Services.addService("MailMergeContextService", new Sage.MailMergeContextService());
        }
    }
}

InitMailMergeContextService();
