/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="a208a60c-1b62-4026-9b4e-8cdb57973919">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>OnLoad1Step</name>
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
   <assemblyName>Sage.SalesLogix.dll</assemblyName>
  </reference>
  <reference>
   <assemblyName>Sage.SalesLogix.HighLevelTypes.dll</assemblyName>
  </reference>
 </references>
</snippetHeader>
*/


#region Usings
using System;
using System.Collections.Generic;
using Sage.Entity.Interfaces;
using Sage.Form.Interfaces;
using Sage.SalesLogix.API;
using Sage.SalesLogix.SelectionService;
using Sage.Platform.Application;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class InsertSalesOrderEventHandlers
    {
        public static void OnLoad1Step(IInsertSalesOrder form, EventArgs args)
        {
            ISalesOrder so = form.CurrentEntity as ISalesOrder;
            if (so == null) return;
            if (String.IsNullOrEmpty(form.rdgSOType.SelectedValue))
            {
                form.rdgSOType.SelectedValue = "SalesOrder";
            }
            Sage.Platform.SData.IAppIdMappingService oMappingService = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.SData.IAppIdMappingService>(false);
            if (oMappingService != null && oMappingService.IsIntegrationEnabled())
			{
				if (!so.CanChangeOperatingCompany())
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

            ISelectionService srv = ApplicationContext.Current.Services.Get<ISelectionService>(true);
            if (srv != null)
            {
                ISelectionContext sc = srv.GetSelectionContext("QuickInsertAccountContact");
                if (sc != null)
                {
                    List<string> sels = sc.GetSelectedIds();
                    if (sels.Count > 0)
                    {
                        string newContactId = sels[0];
                        IContact newContact = Sage.Platform.EntityFactory.GetById<IContact>(newContactId);
                        IAccount newAccount = newContact.Account;
                        so.Account = newAccount;
                        so.AccountManager = newAccount.AccountManager;
                        so.BillingContact = newContact;
                        so.ShippingContact = newContact;
                        so.BillToName = newContact.NameLF;
                        so.ShipToName = newContact.NameLF;

                        if (so.BillingAddress == null)
                        {
                            ISalesOrderAddress billAddr = Sage.Platform.EntityFactory.Create<ISalesOrderAddress>();
                            so.BillingAddress = billAddr;
                        }
                        so.SetSalesOrderBillingAddress(newContact.Address);

                        if (so.ShippingAddress == null)
                        {
                            ISalesOrderAddress shipAddr = Sage.Platform.EntityFactory.Create<ISalesOrderAddress>();
                            so.ShippingAddress = shipAddr;
                        }
                        so.SetSalesOrderShippingAddress(newContact.Address);
                        srv.SetSelectionContext("QuickInsertAccountContact", null);
                    }
                }
            }
        }
    }
}
