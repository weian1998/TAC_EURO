/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="aca3f2e8-db47-4a97-91c6-7b6c94afacca">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>btnToolbarSave_OnClick</name>
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
    /// This is called when the change password toolbar saved button is selected.
    /// </summary>
    public static partial class UserChangePasswordEventHandlers
    {
		/// <summary>
    	/// Performs the password validation rules. If validation fails an exception is raised from the
		/// ValidateUserPassword method. If validation succeeds, but the password was changed
		/// to an empty string that result is returned, which will be displayed to the UI.
    	/// </summary>
    	/// <param name="form">The change password form.</param>
    	/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void btnToolbarSave_OnClick(IUserChangePassword form, EventArgs args)
        {
			string newPassword = form.txtConfirmPassword.Text;
            if (newPassword.Equals(form.txtConfirmPassword.Text))
			{
				IUser user = (IUser)form.usrUser.LookupResultValue;
				if (!user.ValidateUserPassword(newPassword))
				{
					if (user.SavePassword(newPassword))
					{
						form.lblInvalidPassword.Text = newPassword.Length == 0 ? form.GetResource("PasswordBlank").ToString() : String.Empty;
					}
				}
			}
			else
			{
				form.lblInvalidPassword.Text = form.GetResource("Error_PasswordsDontMatch").ToString();
			}
        }
    }
}
