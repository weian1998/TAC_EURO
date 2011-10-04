/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="4bf06cb0-2f4f-42d9-b023-7b48ba67a5fc">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>OnFormLoadStep</name>
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
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
	/// <summary>
	/// This method is invoked when the EditSalesOrderItem form is loaded.
	/// </summary>
    public static partial class EditSalesOrderItemEventHandlers
    {
		/// <summary>
		/// Initializes the view.
		/// </summary>
		/// <param name="form">The Edit Sales Order Item form.</param>
		/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void OnFormLoadStep(IEditSalesOrderItem form, EventArgs args)
        {
            ISalesOrderItem salesOrderItem = form.CurrentEntity as ISalesOrderItem;
			IWebDialogService dialogService = form.Services.Get<IWebDialogService>();
            if (dialogService != null && dialogService.DialogParameters.ContainsKey("CustomProductSalesOrder"))
            {
				ISalesOrder salesOrder = dialogService.DialogParameters["CustomProductSalesOrder"] as ISalesOrder;
				salesOrderItem.SalesOrder = salesOrder;
				salesOrderItem.Quantity = 1;
				salesOrderItem.CalculatedPrice = 0;
				salesOrderItem.Discount = 0;
				salesOrderItem.ExtendedPrice = 0;
				salesOrderItem.Price = 0;
				dialogService.DialogParameters.Remove("CustomProductSalesOrder");
			}
			if (salesOrderItem.SalesOrder.IsMultiCurrencyEnabled())
			{
                form.curMCCalcPrice.ExchangeRate = salesOrderItem.SalesOrder.ExchangeRate.GetValueOrDefault(1);
                form.curMCCalcPrice.CurrentCode = salesOrderItem.SalesOrder.CurrencyCode;
                form.curMCCalcPrice.ExchangeRateType = Sage.Platform.Controls.ExchangeRateTypeEnum.EntityRate;
                form.curMCCalcPrice.Text = salesOrderItem.CalculatedPrice.ToString();
			}
			else
			{
				form.ctrlstMCPrice.Visible = false;
			}
			
			if (salesOrderItem.Product == null) // AdHocProduct
			{
				salesOrderItem.LineType = "FreeText"; // Use as literal; represents adhoc product.
				form.ctrlstLineNumber.Visible = false;
				form.ctrlstPriceLevel.Visible = false;
				form.curPrice.IsReadOnly = false;
				form.txtSKU.IsReadOnly = false;
				form.pklFamily.IsReadOnly = false;
				form.txtDescription.IsReadOnly = false;
				form.txtProductName.IsReadOnly = false;
			}
			
			bool closed = (salesOrderItem.SalesOrder.Status.ToUpper().Equals(form.GetResource("SalesOrderStatus_Closed").ToString().ToUpper()));
			form.txtDescription.Enabled = !closed;
			form.txtSKU.Enabled = !closed;
			form.pklFamily.Enabled = !closed;
			form.txtDiscount.Enabled = !closed;
			form.curCalculatedPrice.Enabled = !closed;
			form.curMCCalcPrice.Enabled = !closed;
			form.numQuantity.Enabled = !closed;
			form.btnOK.Visible = !closed;
			form.btnCancel.Caption = form.GetResource("Closed_Caption").ToString();
        }
    }
}
