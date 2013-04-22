/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="20a2a4bc-a0f1-4853-acb2-e8a6431fb2c3">
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
    public static partial class OpportunityDetailsEventHandlers
    {
        public static void SetupIntegrationContractStep(IOpportunityDetails form,  EventArgs args)
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
                    form.luePriceList.Enabled = (form.lueERPApplication.LookupResultValue != null);
                }			
			}
			else
			{
				form.clIntegrationContract.Visible = false;
			}			
        }
    }
}
