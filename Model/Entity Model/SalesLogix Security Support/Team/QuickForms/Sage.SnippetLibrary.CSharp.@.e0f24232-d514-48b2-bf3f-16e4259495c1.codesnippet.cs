/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="e0f24232-d514-48b2-bf3f-16e4259495c1">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>saveButton_OnClickStep</name>
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
    public static partial class TeamDetailsEventHandlers
    {
        public static void saveButton_OnClickStep( ITeamDetails form,  EventArgs args)
        {
            ITeam team = form.CurrentEntity as ITeam;
			team.Save();
			
			// do this extra save since team is a view representing owner
			team.Owner.Save();
			
			IOwnerSecurityProfile profile = form.securityProfileLookup.LookupResultValue as IOwnerSecurityProfile;
			team.Owner.UpdateOwnerSecurityProfile(team.Owner, profile);
			
        }
    }
}
