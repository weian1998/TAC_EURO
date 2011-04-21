/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="6ac503f6-5360-4842-acea-0110a92fbce0">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>lueAddUser_OnChangeStep</name>
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
using Sage.Platform;
using Sage.Platform.WebPortal.Services;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class UserTeamMembersEventHandlers
    {
        public static void lueAddUser_OnChangeStep( IUserTeamMembers form,  EventArgs args)
        {
            IUser member = form.lueAddUser.LookupResultValue as IUser;
			IUser userTeam = form.CurrentEntity as IUser;
			member.AddToUserTeam(userTeam);
			
			var panelRefresh = form.Services.Get<IPanelRefreshService>();
			panelRefresh.RefreshAll();
        }
    }
}
