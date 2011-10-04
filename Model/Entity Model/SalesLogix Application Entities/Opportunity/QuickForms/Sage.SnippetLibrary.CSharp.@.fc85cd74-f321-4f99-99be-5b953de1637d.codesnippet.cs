/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="fc85cd74-f321-4f99-99be-5b953de1637d">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>SetupIntegrationContractStep</name>
 <references>
  <reference>
   <assemblyName>Sage.Entity.Interfaces.dll</assemblyName>
   <hintPath>%BASEBUILDPATH%\interfaces\bin\Sage.Entity.Interfaces.dll</hintPath>
  </reference>
  <reference>
   <assemblyName>Sage.Form.Interfaces.dll</assemblyName>
   <hintPath>%BASEBUILDPATH%\formInterfaces\bin\Sage.Form.Interfaces.dll</hintPath>
  </reference>
  <reference>
   <assemblyName>Sage.Platform.dll</assemblyName>
   <hintPath>%BASEBUILDPATH%\assemblies\Sage.Platform.dll</hintPath>
  </reference>
  <reference>
   <assemblyName>Sage.SalesLogix.API.dll</assemblyName>
  </reference>
  <reference>
   <assemblyName>Sage.Platform.Application.dll</assemblyName>
  </reference>
  <reference>
   <assemblyName>Sage.Platform.WebPortal.dll</assemblyName>
  </reference>
 </references>
</snippetHeader>
*/


#region Usings
using System;
using Sage.Entity.Interfaces;
using Sage.Form.Interfaces;
using Sage.SalesLogix.API;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class InsertOpportunityEventHandlers
    {
        public static void SetupIntegrationContractStep( IInsertOpportunity form,  EventArgs args)
        {
			IOpportunity opportunity = form.CurrentEntity as IOpportunity;
			if (opportunity == null)
			{
				return;
			}
    		Sage.Platform.SData.IAppIdMappingService oMappingService = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.SData.IAppIdMappingService>(false);			
			if (oMappingService != null && oMappingService.IsIntegrationEnabled())
			{
				if (!opportunity.CanChangeOperatingCompany())
				{
					form.lueERPApplication.Enabled = false;
					form.luePriceList.Enabled = false;
				}
				else 
				{
					form.lueERPApplication.Enabled = true;
					object oValue = form.lueERPApplication.LookupResultValue;
					string sValue = string.Empty;
					if (oValue != null)
					{
						sValue = oValue.ToString();
					}
					if (string.IsNullOrEmpty(sValue))
					{
						form.luePriceList.Text = string.Empty;
						form.luePriceList.LookupResultValue = null;
						form.luePriceList.Enabled = false;
					}
					else
					{
						form.luePriceList.Enabled = true;
					}
					SalesLogix.HighLevelTypes.LookupPreFilter filterAppId = new SalesLogix.HighLevelTypes.LookupPreFilter();
					filterAppId.LookupEntityName = "Sage.Entity.Interfaces.IAppIdMapping";
					filterAppId.PropertyName = "Id";
					filterAppId.OperatorCode = "!=";
					filterAppId.FilterValue = oMappingService.LocalAppId;
					filterAppId.PropertyType = "System.String";
					form.lueERPApplication.LookupPreFilters.Add(filterAppId);
				}
			}
			else
			{
				form.clIntegrationContract.Visible = false;
			}		
        }
    }
}
