/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="10ae2348-4347-427e-9e4d-fd326816da76">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>lueAddDepartmentMember_OnChangeStep</name>
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
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class DepartmentMembersEventHandlers
    {
        public static void lueAddDepartmentMember_OnChangeStep( IDepartmentMembers form,  EventArgs args)
        {
			IUser member = form.lueAddDepartmentMember.LookupResultValue as IUser;
			// get security profile for member
			IDepartment department = form.CurrentEntity as IDepartment;
			department.AddMember(member.DefaultOwner);
			
			
			var panelRefresh = form.Services.Get<IPanelRefreshService>();
			panelRefresh.RefreshTabWorkspace();			
        }	
    }
}
