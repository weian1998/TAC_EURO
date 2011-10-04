/*
 * SagePlatform
 * Copyright(c) 2009, Sage Software.
 */


Sage.IntegrationContractService=function(){this.isIntegrationEnabled=false;this.localAppId="";var data=document.getElementById("__IntegrationContractService");if(typeof data!=="undefined"&&data!=null){var obj=dojo.fromJson(data.value);this.isIntegrationEnabled=obj.IsIntegrationEnabled;this.localAppId=obj.LocalAppId;this.isMultiCurrencyEnabled=obj.IsMultiCurrencyEnabled;}}
Sage.IntegrationContractService.prototype.getCurrentOperatingCompanyId=function(){var service=Sage.Services.getService("ClientEntityContext");if(typeof service!=="undefined"&&service!=null){var context=service.getContext();var dtNow=new Date();var sUrl=dojo.replace("slxdata.ashx/slx/crm/-/context/getcurrentoperatingcompanyid?time={0}&entityType={1}&entityId={2}",[encodeURIComponent(dtNow.getTime().toString()),encodeURIComponent(context.EntityType),encodeURIComponent(context.EntityId)]);var response=$.ajax({async:false,url:sUrl,dataType:'json',error:function(error){Ext.Msg.show({title:"Sage SalesLogix",msg:error.StatusText,buttons:Ext.Msg.OK,icon:Ext.MessageBox.ERROR});return"";}});var obj=dojo.fromJson(response.responseText);return obj.id;}
return"";}
function isIntegrationContractEnabled(){var service=Sage.Services.getService("IntegrationContractService");if(service!=null&&typeof service!=="undefined"){return service.isIntegrationEnabled;}
return false;}
function isMultiCurrencyEnabled(){var service=Sage.Services.getService("IntegrationContractService");if(service!=null&&typeof service!=="undefined"){return service.isMultiCurrencyEnabled;}
return false;}