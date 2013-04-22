/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="6bae84d4-d7a1-4e90-8709-f38352d24a8a">
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
using Sage.Entity.Interfaces;
using Sage.Form.Interfaces;
using Sage.SalesLogix.API;
using Sage.Platform.SData;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
	/// <summary>
	/// This method is invoked when the Sales Order Details view is loaded.
	/// </summary>
    public static partial class SalesOrderDetailsEventHandlers
    {
		/// <summary>
		/// Sets the visibility of controls based on the status of the Sales Order. 
		/// </summary>
		/// <param name="form">The Sales Order Details form.</param>
		/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void OnLoad1Step(ISalesOrderDetails form, EventArgs args)
        {
            ISalesOrder salesOrder = form.CurrentEntity as ISalesOrder;
			if (salesOrder != null)
			{
                IAppIdMappingService oMappingService = Sage.Platform.Application.ApplicationContext.Current.Services.Get<IAppIdMappingService>(true);
                bool closed = false;
                if (salesOrder.Status != null)
                {
                    closed =
                        (salesOrder.Status.ToUpper().Equals(
                            form.GetResource("SalesOrderStatus_Closed").ToString().ToUpper()) ||
                         salesOrder.Status.ToUpper().Equals(
                             form.GetResource("SalesOrderStatus_Transmitted").ToString().ToUpper()));
                }
                //if this is a Sales Order that synced from the accounting system or the Sales Order has been submitted then we disable it
                bool isOpen = false;
                if (!String.IsNullOrEmpty(salesOrder.ERPSalesOrder.ERPStatus))
                {
                    isOpen = (salesOrder.ERPSalesOrder.ERPStatus.Equals(
                        form.GetResource("erpStatus_Open").ToString()) ||
                        salesOrder.ERPSalesOrder.ERPStatus.Equals(form.GetResource("erpStatus_Rejected").ToString()));
                }
			    bool erpSalesOrder = (oMappingService.IsIntegrationEnabled() && (salesOrder.GlobalSyncId.HasValue && !isOpen));

			    form.rdgSOType.Enabled = (!closed || !salesOrder.IsQuote.HasValue) && !erpSalesOrder;
                form.lueAccount.IsReadOnly = closed || erpSalesOrder;
                form.usrAccountManager.IsReadOnly = closed || erpSalesOrder;
                form.lueOpportunity.IsReadOnly = closed || erpSalesOrder;
                form.lueRequestedBy.IsReadOnly = closed || erpSalesOrder;
                form.dtpOrderDate.IsReadOnly = closed || erpSalesOrder;
                form.dtpPromisedDate.IsReadOnly = closed || erpSalesOrder;
                form.pklType.IsReadOnly = closed || erpSalesOrder;
			    form.pklType.Enabled = !closed && !erpSalesOrder;
                form.pklStatus.IsReadOnly = closed || erpSalesOrder;
			    form.pklType.Enabled = !closed && !erpSalesOrder;
                form.txtCustPO.IsReadOnly = closed || erpSalesOrder;
                form.btnSaveSalesOrder.Visible = !closed && !erpSalesOrder;
                form.btnReset.Visible = !closed && !erpSalesOrder;
                form.btnDelete.Visible = !closed && !erpSalesOrder;
                form.txtComments.IsReadOnly = closed || erpSalesOrder;
                form.lueERPApplication.Enabled = !closed && !erpSalesOrder;
                form.luePriceList.Enabled = !closed && !erpSalesOrder;
    			
                //if this is a Sales Order synced from the accounting system then no point executing this, as the Sales Order will be disabled.
				if (!erpSalesOrder && oMappingService.IsIntegrationEnabled())
                {
                    if (!salesOrder.CanChangeOperatingCompany())
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
				form.ctrlstERPApplication.Visible = oMappingService.IsIntegrationEnabled();
			}
        }
    }
}
