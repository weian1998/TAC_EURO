/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="03ece52b-ed84-472f-acc0-1c9e6f421871">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>OnLoadHandlerStep</name>
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
    public static partial class SalesOrderProductsEventHandlers
    {
        public static void OnLoadHandlerStep(ISalesOrderProducts form, EventArgs args)
        {		    
			Sage.Entity.Interfaces.ISalesOrder salesOrder = form.CurrentEntity as Sage.Entity.Interfaces.ISalesOrder;
			if (salesOrder != null)
			{
				bool bInsertMode = ((salesOrder.PersistentState | Sage.Platform.Orm.Interfaces.PersistentState.New) == salesOrder.PersistentState);
				form.btnAddCustomProduct.Visible = !bInsertMode;
			}
        }
    }
}