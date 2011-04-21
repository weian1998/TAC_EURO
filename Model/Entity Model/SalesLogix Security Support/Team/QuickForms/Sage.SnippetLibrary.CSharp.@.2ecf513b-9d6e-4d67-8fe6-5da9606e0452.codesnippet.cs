/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="2ecf513b-9d6e-4d67-8fe6-5da9606e0452">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>AddManagerCheckBox_OnChangeStep</name>
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
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class TeamMembersEventHandlers
    {
        public static void AddManagerCheckBox_OnChangeStep( ITeamMembers form,  EventArgs args)
        {
			ITeam team = Sage.Platform.EntityFactory.Create<ITeam>();
			team.SetAddManagerWithMemberOption(form.AddManagerCheckBox.Checked ? bool.TrueString : bool.FalseString);
        }
    }
}
