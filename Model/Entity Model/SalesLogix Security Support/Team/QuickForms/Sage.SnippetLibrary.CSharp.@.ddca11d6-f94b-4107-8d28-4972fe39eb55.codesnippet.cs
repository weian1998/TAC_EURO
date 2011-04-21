/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="ddca11d6-f94b-4107-8d28-4972fe39eb55">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>addManagerCheckBox_OnChangeStep</name>
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
    public static partial class InsertTeamEventHandlers
    {
        public static void addManagerCheckBox_OnChangeStep( IInsertTeam form,  EventArgs args)
        {
			ITeam team = Sage.Platform.EntityFactory.Create<ITeam>();
			team.SetAddManagerWithMemberOption(form.addManagerCheckBox.Checked ? bool.TrueString : bool.FalseString);
        }
    }
}
