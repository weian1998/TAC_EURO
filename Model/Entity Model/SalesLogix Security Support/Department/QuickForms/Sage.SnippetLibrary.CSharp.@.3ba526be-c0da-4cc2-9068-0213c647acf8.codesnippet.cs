/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="3ba526be-c0da-4cc2-9068-0213c647acf8">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>lueTeams_OnChangeStep</name>
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
    public static partial class DepartmentTeamsEventHandlers
    {
        public static void lueTeams_OnChangeStep( IDepartmentTeams form,  EventArgs args)
        {
			ITeam team = form.lueTeams.LookupResultValue as ITeam;
			IDepartment department = form.CurrentEntity as IDepartment;
            department.AddToTeam(team);
						
			
			var panelRefresh = form.Services.Get<IPanelRefreshService>();
			panelRefresh.RefreshTabWorkspace();
        }
    }
}
