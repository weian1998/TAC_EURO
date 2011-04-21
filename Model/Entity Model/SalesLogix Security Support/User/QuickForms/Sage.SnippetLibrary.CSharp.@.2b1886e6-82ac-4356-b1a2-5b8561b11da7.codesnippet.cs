/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="2b1886e6-82ac-4356-b1a2-5b8561b11da7">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>dgUserAccessToOthersCal_OnRowSelectedStep</name>
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
    public static partial class UserAccessToOthersCalEventHandlers
    {
        public static void dgUserAccessToOthersCal_OnRowSelectedStep( IUserAccessToOthersCal form,  EventArgs args)
        {
            IUserCalendar userCalendar = form.dsUserAccessToOthersCal.Current as IUserCalendar;
			IUser user = form.CurrentEntity as IUser;
			
			user.OthersAccessToUserCal.Remove(userCalendar);
			userCalendar.Delete();

            form.dgUserAccessToOthersCal.SelectedIndex = -1;
        }
    }
}