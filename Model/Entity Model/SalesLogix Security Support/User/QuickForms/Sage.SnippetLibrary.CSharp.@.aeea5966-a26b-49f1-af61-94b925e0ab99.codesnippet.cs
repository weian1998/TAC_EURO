/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="aeea5966-a26b-49f1-af61-94b925e0ab99">
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
using Sage.SalesLogix.API;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class UserAccessToOthersCalEventHandlers
    {
        public static void lueAddUser_OnChangeStep( IUserAccessToOthersCal form,  EventArgs args)
        {
            IUser userwantingaccess = form.CurrentEntity as IUser;
			IUser user = form.lueAddUser.LookupResultValue as IUser;
			
			if(!user.UserCalendarExists(userwantingaccess))
			{
				user.AddUserCalendar(userwantingaccess);
				
				Sage.Platform.WebPortal.Services.IWebDialogService dialogService = form.Services.Get<Sage.Platform.WebPortal.Services.IWebDialogService>();
				dialogService.SetSpecs(235, 420, "EditCalPermissions");
				dialogService.EntityType = typeof(Sage.Entity.Interfaces.IUserCalendar);
				dialogService.CompositeKeyNames = "UserId, CalUserId";
				dialogService.EntityID = string.Format("{0},{1}", userwantingaccess.Id, user.Id);
				dialogService.ShowDialog();
			}
			//else
			//	throw new Sage.Platform.Application.ValidationException(form.GetResource("Error_CalendarAccessAlreadyExists").ToString());
        }
    }
}
