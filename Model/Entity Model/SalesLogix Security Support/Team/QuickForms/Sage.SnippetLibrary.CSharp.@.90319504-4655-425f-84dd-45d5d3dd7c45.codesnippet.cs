/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="90319504-4655-425f-84dd-45d5d3dd7c45">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>lueAddTeamMember_OnChangeStep</name>
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
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using Sage.Platform.WebPortal.Services;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class TeamMembersEventHandlers
    {
        public static void lueAddTeamMember_OnChangeStep( ITeamMembers form,  EventArgs args)
        {
			// get security profile for member
			ITeam team = form.CurrentEntity as ITeam;
			
			IOwner member = form.lueAddTeamMember.LookupResultValue as IOwner;
			team.AddMember(member);
			
			var panelRefresh = form.WorkItem.Services.Get<IPanelRefreshService>();
			panelRefresh.RefreshAll();
        }
    }
}
