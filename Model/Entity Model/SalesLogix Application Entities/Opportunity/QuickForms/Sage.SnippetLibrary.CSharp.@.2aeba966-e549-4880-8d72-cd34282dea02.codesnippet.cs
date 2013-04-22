/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="2aeba966-e549-4880-8d72-cd34282dea02">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>chkbxOverrideSalesPotential_OnChangeStep</name>
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
    public static partial class EditSalesPotentialEventHandlers
    {
        public static void chkbxOverrideSalesPotential_OnChangeStep( IEditSalesPotential form,  EventArgs args)
        {
            if (!form.chkbxOverrideSalesPotential.Checked)
			{
				form.curSalesPotential.IsReadOnly = true;
				IOpportunity opportunity = form.CurrentEntity as IOpportunity;
				opportunity.CalculateSalesPotential();
			}
			else
			{
				form.curSalesPotential.IsReadOnly = true;
			}
        
        }
    }
}
