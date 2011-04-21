/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="27e39f3f-0c3c-41d3-9389-edc89cdd4d8c">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>btnSave_OnClickStep</name>
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
    public static partial class UserSecurityEventHandlers
    {
        public static void btnSave_OnClickStep( IUserSecurity form,  EventArgs args)
        {
            IUser user = form.CurrentEntity as IUser;
			IOwnerSecurityProfile securityProfile = form.lupFLSProfile.LookupResultValue as IOwnerSecurityProfile;
			user.UpdateDefaultSecurityProfile(securityProfile);
			
			user.Save();
        }
    }
}