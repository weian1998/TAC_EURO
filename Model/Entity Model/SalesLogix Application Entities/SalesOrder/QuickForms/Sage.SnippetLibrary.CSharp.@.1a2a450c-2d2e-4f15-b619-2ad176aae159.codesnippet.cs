/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="1a2a450c-2d2e-4f15-b619-2ad176aae159">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>btnAddCustomProduct_OnClickStep</name>
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
using Sage.Platform.WebPortal.Services;
using Sage.Platform;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
	/// <summary>
	/// This method is invoked when selecting the toolbar button to add a 'Custom Product'.
	/// </summary>
    public static partial class SalesOrderProductsEventHandlers
    {
		/// <summary>
		/// Initializes and invokes the Add Custom Product view.
		/// </summary>
		/// <param name="form">The Sales Order Products form.</param>
		/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void btnAddCustomProduct_OnClickStep(ISalesOrderProducts form, EventArgs args)
        {
            ISalesOrder salesOrder = form.CurrentEntity as ISalesOrder;
            if (salesOrder != null)
            {
                IWebDialogService dialogService = form.Services.Get<IWebDialogService>();
                if (dialogService != null)
                {
                    string dialogCaption = String.Format(form.GetResource("btnAddCustomProduct.Caption").ToString(),
                                                         salesOrder.SalesOrderNumber);
					if (salesOrder.IsContractIntegrationEnabled())
					{
                        dialogService.SetSpecs(20, 20, 390, 700, "ICEditSalesOrderItem", dialogCaption, true);
					}
					else
					{
						dialogService.SetSpecs(20, 20, 325, 700, "EditSalesOrderItem", dialogCaption, true);
					}
                    dialogService.DialogParameters.Add("CustomProductSalesOrder", salesOrder);
                    dialogService.EntityType = typeof(ISalesOrderItem);
                    dialogService.ShowDialog();
                }
            }
        }
    }
}
