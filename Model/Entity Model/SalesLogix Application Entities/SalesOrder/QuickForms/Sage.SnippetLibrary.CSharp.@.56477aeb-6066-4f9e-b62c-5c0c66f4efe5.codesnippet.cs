/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="56477aeb-6066-4f9e-b62c-5c0c66f4efe5">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>btnSaveNew_OnClickStep</name>
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
using System.Web;
using Sage.Entity.Interfaces;
using Sage.Form.Interfaces;
using Sage.SalesLogix.API;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
	/// <summary>
	/// This method is invoked when selecting the toolbar button to add  'SaveNew' the Sales Order.
	/// </summary>
    public static partial class InsertSalesOrderEventHandlers
    {
		/// <summary>
		/// Assigns the Sales Order type.
		/// </summary>
		/// <param name="form">The Insert Sales Order form.</param>
		/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void btnSaveNew_OnClickStep(IInsertSalesOrder form, EventArgs args)
        {
            ISalesOrder salesOrder = form.CurrentEntity as ISalesOrder;
			if (salesOrder != null)
            {
				string selectedValue = form.rdgSOType.SelectedValue;
				if (selectedValue.Equals("SalesOrder"))
				{
					salesOrder.IsQuote = false;
				}
				else if (selectedValue.Equals("Quote"))
				{
					salesOrder.IsQuote = true;
				}
				salesOrder.Save();
                HttpContext.Current.Response.Redirect(string.Format("InsertSalesOrder.aspx?modeid=Insert&entityId={0}", salesOrder.Id.ToString()), false);
			}
        }
    }
}
