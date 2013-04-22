using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using Sage.Platform;
using Sage.Entity.Interfaces;
using Sage.Platform.Application.UI;
using Sage.Platform.Diagnostics;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Security;
using Sage.Platform.Application;
using System.Text;

public partial class CopyUser : EntityBoundSmartPartInfoProvider
{
    protected override void OnFormBound()
    {
        base.OnFormBound();
        ClientBindingMgr.RegisterDialogCancelButton(btnCancel);
        RegisterValidationScript();
    }
    /// <summary>
    /// Derived components should override this method to wire up event handlers.
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        btnCopy.Click += new EventHandler(btnCopy_Click);
        btnCancel.Click += DialogService.CloseEventHappened;
        base.OnWireEventHandlers();
    }

    void btnCopy_Click(object sender, EventArgs e)
    {
        try
        {
            btnCopy.Enabled = false;
            btnCancel.Enabled = false;

            IList<string> ids = new List<string>();
            if (DialogService.DialogParameters.ContainsKey("selectedIds"))
                ids = DialogService.DialogParameters["selectedIds"] as IList<string>;

            CopySelectedUsers(ids);
        }
        finally
        {
            btnCopy.Enabled = true;
            btnCancel.Enabled = true;
        }
    }
    private void RegisterValidationScript()
    {
        StringBuilder script = new StringBuilder();

        script.Append("$('.slxbutton').attr('disabled', 'disabled'); ");
        script.AppendFormat("__doPostBack('{0}','Click');", btnCopy.UniqueID);
        script.Append("return false; ");
        btnCopy.Attributes.Add("onclick", script.ToString());
    }
    private void CopySelectedUsers(IList<string> targetUserIds)
    {
        var ums = ApplicationContext.Current.Services.Get<IUserManagementService>();
        IList<IUser> newUserList = new List<IUser>();

        var userManagementSvc = ApplicationContext.Current.Services.Get<IUserManagementService>();

        try
        {

            foreach (string id in targetUserIds)
            {
                IUser existingUser = EntityFactory.GetById<IUser>(id);
                if (existingUser != null && existingUser.UserInfo != null)
                {
                    if (existingUser.Type == UserType.Retired)
                        throw new Sage.Platform.Application.ValidationException(GetLocalResourceObject("ErrorCannotCopyRetiredUser").ToString());

                    AddUserOptions options = SetAddUserOptions(existingUser);

                    // create the new user with default data
                    IUser newUser = ums.AddUser("", options);

                    // sometimes the copy of... name is too long for the data type
                    string nameFormat = " {0}, {1}";
                    if (string.IsNullOrEmpty(existingUser.UserInfo.FirstName))
                        nameFormat = " {0}{1}";
                    string fullNameFormat = string.Concat("(", GetLocalResourceObject("CopyOfNameTemplate").ToString(), nameFormat, ")");
                    string newName = string.Format(fullNameFormat, existingUser.UserInfo.LastName, existingUser.UserInfo.FirstName);

                    /* the following could be used to improve the user experience, but it doesn't match the lan product */
                    //string copyOfTemplate = GetLocalResourceObject("CopyOfNameTemplate").ToString();
                    //string fullNameFormat = string.Concat("<", copyOfTemplate, nameFormat, ">");
                    //string newLastName = existingUser.UserInfo.LastName;
                    //if (newLastName.Contains(string.Concat("<", copyOfTemplate)))
                    //{
                    //    Match match = Regex.Match(newLastName, string.Concat("<", copyOfTemplate, "(.*)", ">"), RegexOptions.IgnoreCase);
                    //    if (match.Groups.Count > 0)
                    //        newLastName = match.Groups[1].Value;
                    //}
                    //string newName = string.Format(fullNameFormat, newLastName, existingUser.UserInfo.FirstName);

                    newUser.UserInfo.LastName = newName.Length > 32 ? newName.Substring(0, 32) : newName;
                    newUser.UserInfo.UserName = newName.Length > 64 ? newName.Substring(0, 64) : newName;

                    string userTemplate = existingUser.UserInfo.UserName;
                    newUser.UserTemplate = userTemplate.Length > 30 ? userTemplate.Substring(0, 30) : userTemplate;

                    newUser.Save();

                    if (newUser != null)
                        newUserList.Add(newUser);

                }

                if (newUserList.Count > 0)
                {
                    LinkHandler linkHandler = new LinkHandler(Page);
                    linkHandler.RedirectToNewGroupDetail(newUserList);
                }

            }

        }
        catch (ValidationException)
        {
            throw;
        }
        catch (Exception exp)
        {
            string sSlxErrorId = null;
            var sMsg = ErrorHelper.GetClientErrorHtmlMessage(exp, ref sSlxErrorId);
            if (!string.IsNullOrEmpty(sSlxErrorId))
            {
                log.Error(ErrorHelper.AppendSlxErrorId("The call to CopySelectedUsers() failed", sSlxErrorId), exp);
            }
            DialogService.ShowHtmlMessage(sMsg, GetLocalResourceObject("ErrorMessageTitle").ToString(),
                                          ErrorHelper.IsDevelopmentContext() ? 600 : -1,
                                          ErrorHelper.IsDevelopmentContext() ? 800 : -1);
        }
    }

    private AddUserOptions SetAddUserOptions(IUser existingUser)
    {
        AddUserOptions options = new AddUserOptions();
        options.TemplateID = existingUser.Id.ToString();
        options.Quantity = 1;
        options.CreateFromProfile = true;
        options.UseCalendarProfile = true;
        options.UseClientOptionsProfile = true;
        options.UseCustomProfile = true;
        options.UseEmployeeProfile = true;
        options.UseFunctionSecurityProfile = true;
        options.UseGeneralProfile = true;
        options.UseSecurityProfile = true;
        options.UserType = existingUser.Type;
        options.UseSecurityProfile = true;
        options.UseTeamsProfile = true;
        options.UseSyncProfile = true;
        options.UseSupportProfile = true;
        return options;
    }


    public override Type EntityType
    {
        get { return typeof(IUser); }
    }

    protected override void OnAddEntityBindings()
    {

    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();

        foreach (Control c in AddUsers_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;

    }
}
