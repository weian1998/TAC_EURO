/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="b79c6b1f-5ac5-44c6-a876-b392ea160796">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>SaveDepartmentStep</name>
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
using Sage.Platform.Security;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class DepartmentDetailsEventHandlers
    {
        public static void SaveDepartmentStep( IDepartmentDetails form,  EventArgs args)
        {
			IDepartment department = form.CurrentEntity as IDepartment;
			department.Save();

			// do this extra save since team is a view representing owner
			department.Owner.Save();
			
			IOwnerSecurityProfile profile = form.securityProfileLookup.LookupResultValue as IOwnerSecurityProfile;
			department.Owner.UpdateOwnerSecurityProfile(department.Owner, profile);
        }
    }
}
