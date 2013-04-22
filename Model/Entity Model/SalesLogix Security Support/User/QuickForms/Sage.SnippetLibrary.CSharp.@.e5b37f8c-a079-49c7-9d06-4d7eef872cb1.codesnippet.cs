/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="e5b37f8c-a079-49c7-9d06-4d7eef872cb1">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>lueAddTeam_OnChangeStep</name>
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
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using Sage.Platform;
using Sage.Platform.WebPortal.Services;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class TeamMembershipEventHandlers
    {
        public static void lueAddTeam_OnChangeStep( ITeamMembership form,  EventArgs args)
        {
            ITeam teamOwner = form.lueAddTeam.LookupResultValue as ITeam;
			// get security profile for member
			IUser member = form.CurrentEntity as IUser;			
			teamOwner.AddMember(member.DefaultOwner);
			
			var panelRefresh = form.Services.Get<IPanelRefreshService>();
			panelRefresh.RefreshTabWorkspace();
        }
    }
}
