/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="c5794a9a-99ad-4b2d-8250-e5a889fd9530">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>lueAddDepartment_OnChangeStep</name>
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
using Sage.Platform.Application.Services;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class DepartmentMembershipEventHandlers
    {
        public static void lueAddDepartment_OnChangeStep( IDepartmentMembership form,  EventArgs args)
        {
            IDepartment department = form.lueAddDepartment.LookupResultValue as IDepartment;
            if (department == null) { throw new Sage.Platform.Security.UserObservableApplicationException("Lookup Result does not have a value."); }
			// get security profile for member
			IUser member = form.CurrentEntity as IUser;			
			department.AddMember(member.DefaultOwner);
			
			var panelRefresh = form.Services.Get<IPanelRefreshService>();
			panelRefresh.RefreshTabWorkspace();
        }
    }
}
