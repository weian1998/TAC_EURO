/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="c9d41b96-d57d-4dca-aeca-4cc310b56267">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>GetProductInfoStep</name>
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
    public static partial class SalesOrderItemBusinessRules
    {
        public static void GetProductInfoStep( ISalesOrderItem salesorderitem, out System.String result)
        {
            result = salesorderitem.ProductName;
			if(salesorderitem.Product != null)
			{
			  if(string.IsNullOrEmpty(salesorderitem.ProductName))
			  {
			     result = salesorderitem.Product.Name;
			  }		
			}		
        }
    }
}
