using System;
using System.Web.UI;
using Sage.Platform.Application;
using Sage.Platform.Data;
using Sage.SalesLogix.WebUserOptions;
using Sage.Platform.Application.UI;
using Sage.Entity.Interfaces;

public partial class ChangePasswordOptionsPage : System.Web.UI.UserControl, ISmartPartInfoProvider
{
    private string curUser;

    protected void Page_Load(object sender, EventArgs e)
    {
        //if (!IsPostBack)
        //{
        ChangePasswordOptions options = ChangePasswordOptions.CreateNew();

        // this check necessary to allow creation of new instance every postback (known bug), 
        // but allowing UI changes
        if (string.IsNullOrEmpty(_newPassword.Text))
        {
            _newPassword.Text = options.NewPassword;  // default is empty
            _confirmPassword.Text = options.NewPassword;  // default is empty
        }
        //}
        var userService = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>(true);
        curUser = userService.UserId;

             if (curUser.ToString().Trim() != "ADMIN")
             {
                 lblUser.Visible = false;
                 this.User.Visible = false;
                 PrefsPasswordHelpLink.NavigateUrl = "prefspass.aspx";
             }
             else
             {
                 PrefsPasswordHelpLink.NavigateUrl = "prefspassadmin.aspx";
                 lblCurrentPassword.Visible = false;
                 _currentPassword.Visible = false;
                 if (this.User.LookupResultValue == null)
                 {
                     this.User.LookupResultValue = curUser;
                     
                 }
             }
  }

    protected void _changePassword_Click(object sender, EventArgs e)
    {
        // ***  10.06.11   kw    Moving the logic for validating the password to the User.Rules business rule 
        // ***
        var optionSvc = ApplicationContext.Current.Services.Get<Sage.SalesLogix.Services.ISystemOptionsService>(true);

        // get the new password 
        string newPassword = _newPassword.Text;
     
        // if the value in the new password textbox and the confirm textbox match, attempt to save
        if (newPassword == _confirmPassword.Text)
        {
            // set up the change pwd options
            ChangePasswordOptions options = ChangePasswordOptions.CreateNew();

            // Check to see if the current user is ADMIN or just normal user
            var slxUserService = (Sage.SalesLogix.Security.ISlxUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>(true);
            var currentUser = slxUserService.GetUser();
            if (currentUser.UserName.ToString().Trim().ToUpper() == "ADMIN")
            {
                // Get the user name of the person selected from the lookup to change their password
                Sage.Entity.Interfaces.IUser us = User.LookupResultValue as IUser;
                if (us == null) us = currentUser;
                // validate the new password against all system pwd options
                try
                {
                    us.ValidateUserPassword(newPassword);
                }
                catch (ValidationException ex)
                {
                    lblMessage.Text = ex.Message;
                    return;
                }

                // passed validation, assign new pwd
                options.NewPassword = newPassword;
                options.UserId = us.Id.ToString();
                options.Save();
                // If Admin is changing their password then re-authenticate
                if (us.UserName == currentUser.UserName)
                {
                    var data = (Sage.SalesLogix.SLXDataService) ApplicationContext.Current.Services.Get<IDataService>(true);
                    var auth = (Sage.SalesLogix.Web.SLXWebAuthenticationProvider) data.AuthenticationProvider;
                    auth.AuthenticateWithContext(currentUser.UserName, newPassword);
                }
            }
            else
            {
                // regular user attempting to change their own password
                if (!currentUser.ValidateCurrentPassword(_currentPassword.Text)) 
                {
                    lblMessage.Text = this.GetLocalResourceObject("currentPasswordValidationFailure").ToString();
                    return;
                }
                // validate the new password against all system pwd options
                try
                {
                    currentUser.ValidateUserPassword(newPassword);
                }
                catch (ValidationException ex)
                {
                    lblMessage.Text = ex.Message;
                    return;
                }

                // passed validation, assign new pwd
                options.NewPassword = newPassword;
                options.UserId = currentUser.Id.ToString();
                options.Save();
                //re-authenticate user with new password
                var data = (Sage.SalesLogix.SLXDataService)ApplicationContext.Current.Services.Get<IDataService>(true);
                var auth = (Sage.SalesLogix.Web.SLXWebAuthenticationProvider)data.AuthenticationProvider;
                auth.AuthenticateWithContext(currentUser.UserName, newPassword);

            }

            lblMessage.Text = this.GetLocalResourceObject("passwordChangeSuccess").ToString();
            if (string.IsNullOrEmpty(newPassword))
            {
                lblMessage.Text = this.GetLocalResourceObject("PasswordBlank").ToString();
            }

        }
        else
        {
            _newPassword.Text = string.Empty;
            lblMessage.Text = this.GetLocalResourceObject("PasswordNotMatch").ToString();
        }
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo tinfo = new Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo();
        tinfo.Description = GetLocalResourceObject("lblChangePasswordResource1.Text").ToString(); // "Change Password";
        tinfo.Title = GetLocalResourceObject("lblChangePasswordResource1.Text").ToString(); // "Change Password";
        foreach (Control c in this.LitRequest_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }

        //tinfo.ImagePath = Page.ResolveClientUrl("~/images/icons/Schdedule_To_Do_24x24.gif");
        return tinfo;
    }




}
