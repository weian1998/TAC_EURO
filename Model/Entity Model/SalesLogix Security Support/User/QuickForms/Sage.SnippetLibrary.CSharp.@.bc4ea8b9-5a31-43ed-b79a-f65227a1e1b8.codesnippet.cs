/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="bc4ea8b9-5a31-43ed-b79a-f65227a1e1b8">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>grdOthersAccessToUserCal_OnRowSelectedStep</name>
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
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class OthersAccessToUserCalEventHandlers
    {
        public static void grdOthersAccessToUserCal_OnRowSelectedStep( IOthersAccessToUserCal form,  EventArgs args)
        {
            IUserCalendar userCalendar = form.dsOthersAccessToUserCal.Current as IUserCalendar;
			IUser user = form.CurrentEntity as IUser;
			
			user.UserAccessToOtherCal.Remove(userCalendar);
			userCalendar.Delete();

            form.grdOthersAccessToUserCal.SelectedIndex = -1;
        }
    }
}