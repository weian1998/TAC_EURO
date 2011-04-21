/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="f336ca38-b4ae-4f6b-98be-f251f51df7d7">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>lueAddMember_OnChangeStep</name>
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
using Sage.Platform;
using Sage.Platform.WebPortal.Services;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class UserTeamMembershipEventHandlers
    {
        public static void lueAddMember_OnChangeStep( IUserTeamMembership form,  EventArgs args)
        {
            IUser teamOwner = form.lueAddMember.LookupResultValue as IUser;
			// get security profile for member
			IUser member = form.CurrentEntity as IUser;			
			member.AddToUserTeam(teamOwner);
			
			var panelRefresh = form.Services.Get<IPanelRefreshService>();
			panelRefresh.RefreshTabWorkspace();
        }
    }
}