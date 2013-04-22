Sage.IntegrationContractService = function () {
    this.isIntegrationEnabled = false;
    this.localAppId = "";
    var data = dojo.byId("__IntegrationContractService");
    if (data) {
        var obj = dojo.fromJson(data.value);
        this.isIntegrationEnabled = obj.IsIntegrationEnabled;
        this.localAppId = obj.LocalAppId;
        this.isMultiCurrencyEnabled = obj.IsMultiCurrencyEnabled;
        this.accountingSystemHandlesSO = obj.AccountingSystemHandlesSO;
    }
}

Sage.IntegrationContractService.prototype.getCurrentOperatingCompanyId = function () {
    var service = Sage.Services.getService("ClientEntityContext");
    if (typeof service !== "undefined" && service != null) {
        var context = service.getContext();
        var dtNow = new Date();
        var sUrl = dojo.replace("slxdata.ashx/slx/crm/-/context/getcurrentoperatingcompanyid?time={0}&entityType={1}&entityId={2}",
            [encodeURIComponent(dtNow.getTime().toString()), encodeURIComponent(context.EntityType), encodeURIComponent(context.EntityId)]);
        var response = dojo.xhrGet({
            url: sUrl,
            handleAs: 'json',
            error: function (error) {
                console.error(error);
                return "";
            }
        });
        var obj = dojo.fromJson(response.responseText);
        return obj.id;
    }
    return "";
}

function isIntegrationContractEnabled() {
    var service = Sage.Services.getService("IntegrationContractService");
    if (service != null && typeof service !== "undefined") {
        return service.isIntegrationEnabled;
    }
    return false;
}

function isMultiCurrencyEnabled() {
    var service = Sage.Services.getService("IntegrationContractService");
    if (service != null && typeof service !== "undefined") {
        return service.isMultiCurrencyEnabled;
    }
    return false;
}

function accountingSystemHandlesSO() {
    var service = Sage.Services.getService("IntegrationContractService");
    if (service != null && typeof service !== "undefined") {
        return service.accountingSystemHandlesSO;
    }
    return false;
}