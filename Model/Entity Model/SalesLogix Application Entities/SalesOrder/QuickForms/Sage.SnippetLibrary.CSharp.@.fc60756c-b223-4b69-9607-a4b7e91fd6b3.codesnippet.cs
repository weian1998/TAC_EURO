/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="fc60756c-b223-4b69-9607-a4b7e91fd6b3">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>btnSaveSalesOrder_OnClickStep</name>
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
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
	/// <summary>
	/// This method is invoked when selecting the toolbar button to 'Save' the Sales Order.
	/// </summary>
    public static partial class SalesOrderDetailsEventHandlers
    {
		/// <summary>
		/// Assigns the Sales Order type.
		/// </summary>
		/// <param name="form">The Sales Order details form.</param>
		/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void btnSaveSalesOrder_OnClickStep(ISalesOrderDetails form, EventArgs args)
        {
			ISalesOrder salesOrder = form.CurrentEntity as ISalesOrder;
			if (salesOrder != null && !form.rdgSOType.IsReadOnly)
			{
                salesOrder.IsQuote = !String.IsNullOrEmpty(form.rdgSOType.SelectedValue) && Convert.ToBoolean(form.rdgSOType.SelectedValue);
				salesOrder.Save();
			}
        }
    }
}