/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="7c2f1d21-dd64-490c-8c9f-cd6a297d023f">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>OnServiceSupportLoad</name>
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
	/// <summary>
    /// This is called when the service and support form is loaded.
    /// </summary>
    public static partial class UserServiceAndSupportEventHandlers
    {
		/// <summary>
    	/// Sets whether or not the Ticket prefix is displayed to the end user. This is determined
		/// by the user's type.
    	/// </summary>
    	/// <param name="form">The service and support form.</param>
    	/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void OnServiceSupportLoad(IUserServiceAndSupport form, EventArgs args)
        {
			IUser user = (IUser)form.CurrentEntity;
			if (user != null)
			{
            	form.ctrlstTicketPrefix.Visible = user.Type.Equals(UserType.Remote);
				if (user.Type.Equals(UserType.Remote))
				{
					form.txtTicketPrefix.Text = user.GetRemoteUserPrefixKey();
				}
				
				form.chkbxSpeedSearchSubmissions.Enabled = false;
				object useApprovalProcess = MySlx.System.GetBranchOption("UseApprovalProcess");
				if(useApprovalProcess != null)
					form.chkbxSpeedSearchSubmissions.Enabled = Convert.ToBoolean(useApprovalProcess);
				
			}
			
        }
    }
}
