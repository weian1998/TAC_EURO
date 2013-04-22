using System;
using System.Web;
using System.Web.Security;


namespace SlxClient
{
    public partial class ChangePasswordPage : Sage.Platform.WebPortal.WebPortalPage
    {

        #region Page Lifetime Overrides
        protected override void OnLoad(EventArgs e)
        {
            if (!Page.IsPostBack)
            {
                string usrNm;
                if (Request.QueryString["username"] != null)
                {
                    usrNm = Request.QueryString["username"];
                    if (!String.IsNullOrEmpty(usrNm))
                    {
                        lblUserNameText.Text = usrNm;

                    }
                }
                PasswordFailureMsg.Text = HttpContext.Current.Cache.Get("changePasswordError").ToString();
            }
        }

        protected void btnChangePassword_Click(object sender, EventArgs e)
        {
            var userName = lblUserNameText.Text;
            var currentPassword = txtCurrentPassword.Text;
            var newPassword = txtNewPassword.Text;
            var confirmNewPassword = txtReEnterNewPassword.Text;

            if (newPassword != confirmNewPassword)
            {
                PasswordFailureMsg.Text = "Confirmation does not match new password.";
                return;
            }


            var prov = Membership.Provider as Sage.SalesLogix.Web.SLXMembershipProvider;
            if (prov == null)
            {
                PasswordFailureMsg.Text = "Membership Provider is Null.";
                return;
            }
            HttpContext ctx = HttpContext.Current;
            ctx.Items.Add("changingPwd", true);
            if (prov.ChangePassword(userName, currentPassword, newPassword))
            {
                var basePath = Request.Url.AbsoluteUri.Substring(0, Request.Url.AbsoluteUri.LastIndexOf("/"));
                Response.Redirect(basePath + "/login.aspx");
            }
            else
            {
                PasswordFailureMsg.Text = HttpContext.Current.Cache.Get("changePasswordError").ToString();
            }
        }

        #endregion

       
    }
}
