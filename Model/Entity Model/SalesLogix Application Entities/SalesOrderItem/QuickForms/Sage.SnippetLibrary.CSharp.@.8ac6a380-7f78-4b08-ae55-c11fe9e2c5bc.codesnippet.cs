/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="8ac6a380-7f78-4b08-ae55-c11fe9e2c5bc">
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
 </references>
</snippetHeader>
*/

#region Usings
using System;
using Sage.Entity.Interfaces;
using Sage.Form.Interfaces;
using Sage.SalesLogix.API;
using Sage.Platform.SData;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.Security;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    /// <summary>
    /// This method is invoked when the form is loaded.
    /// </summary>
    public static partial class ICEditSalesOrderItemEventHandlers
    {
        /// <summary>
        /// Sets view state of the Add Custom Product view based on a set of rules.
        /// </summary>
        /// <param name="form">The Edit Sales Order Item form.</param>
        /// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void OnLoad1Step(IICEditSalesOrderItem form, EventArgs args)
        {
            ISalesOrderItem salesOrderItem = form.CurrentEntity as ISalesOrderItem;
            ISalesOrder salesOrder = salesOrderItem.SalesOrder;
            IWebDialogService dialogService = form.Services.Get<IWebDialogService>();

            if (dialogService != null && dialogService.DialogParameters.ContainsKey("CustomProductSalesOrder"))
            {
                salesOrder = dialogService.DialogParameters["CustomProductSalesOrder"] as ISalesOrder;
                salesOrderItem.SalesOrder = salesOrder;
                salesOrderItem.Quantity = 1;
                salesOrderItem.CalculatedPrice = 0;
                salesOrderItem.Discount = 0;
                salesOrderItem.ExtendedPrice = 0;
                salesOrderItem.Price = 0;
                dialogService.DialogParameters.Remove("CustomProductSalesOrder");
            }

            if (salesOrder != null && salesOrder.IsMultiCurrencyEnabled())
            {
                form.curMCCalcPrice.ExchangeRate = salesOrder.ExchangeRate.GetValueOrDefault(1);
                form.curMCCalcPrice.CurrentCode = salesOrder.CurrencyCode;
                form.curMCCalcPrice.ExchangeRateType = Sage.Platform.Controls.ExchangeRateTypeEnum.EntityRate;
                form.curMCCalcPrice.Text = salesOrderItem.CalculatedPrice.ToString();
            }
            else
            {
                form.ctrlstMCPrice.Visible = false;
            }

            form.ctrlstLineNumber.Visible = (salesOrderItem.Id != null);

            if (salesOrderItem.Product == null) // AdHocProduct
            {
                if (String.IsNullOrEmpty(salesOrderItem.LineType))
                {
                    salesOrderItem.LineType = "FreeText"; // Use as literal; represents adhoc product.
                }
                form.curPrice.IsReadOnly = false;
                form.txtSKU.IsReadOnly = false;
                form.txtFamily.IsReadOnly = false;
                form.txtDescription.IsReadOnly = false;
                form.txtProduct.IsReadOnly = false;
                form.ctrlstWarehouse.Visible = false;
                form.ctrlstWarehouses.Visible = false;
            }
            IAppIdMappingService mappingService = Sage.Platform.Application.ApplicationContext.Current.Services.Get<IAppIdMappingService>(true);
            //if this is a Sales Order that synced from the accounting system or the Sales Order has been submitted then we disable it
            bool isOpen = false;
            if (!String.IsNullOrEmpty(salesOrder.ERPSalesOrder.ERPStatus))
            {
                isOpen = (salesOrder.ERPSalesOrder.ERPStatus.Equals(
                    form.GetResource("erpStatus_Open").ToString()) ||
                    salesOrder.ERPSalesOrder.ERPStatus.Equals(form.GetResource("erpStatus_Rejected").ToString()));
            }
            bool erpSalesOrder = (mappingService.IsIntegrationEnabled() && (salesOrder.GlobalSyncId.HasValue && !isOpen));
            form.txtDescription.Enabled = !erpSalesOrder;
            form.txtFamily.Enabled = !erpSalesOrder;
            form.lueLocation.Enabled = !erpSalesOrder;
            form.numDiscount.Enabled = !erpSalesOrder;
            form.currCalculatedPrice.Enabled = !erpSalesOrder;
            form.numQuantity.Enabled = !erpSalesOrder;
            form.lueUnitOfMeasure.Enabled = !erpSalesOrder;
            form.chkPriceLocked.Enabled = !erpSalesOrder;
            form.btnOk.Visible = !erpSalesOrder;
            form.txtComments.Enabled = !erpSalesOrder;
            form.btnCancel.Caption = form.GetResource("Closed_Caption").ToString();

            IRoleSecurityService roleSecurityService = form.Services.Get<IRoleSecurityService>(true);
            form.chkPriceLocked.Enabled = roleSecurityService.HasAccess("IntegrationContract/LockPricing");
        }
    }
}
