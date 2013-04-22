using System;
using System.Text;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.Application.UI;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.SalesLogix.Security;
using Sage.SalesLogix.Client.GroupBuilder;

public partial class AddUsers : Sage.Platform.WebPortal.SmartParts.SmartPartInfoProvider
{
    private IUserManagementService _ums;
    public IUserManagementService UserManagementService
    {
        get { return _ums ?? (_ums = ApplicationContext.Current.Services.Get<IUserManagementService>(true)); }
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

    /// <summary>
    /// Raises the <see cref="E:PreRender"/> event.
    /// </summary>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        LoadView();
    }

    protected void UserType_OnTextChanged(object sender, EventArgs e)
    {
        if (lbxUserType.SelectedValue == "C")
        {
        }
    }

    /// <summary>
    /// Handles the Click event of the ok button control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void OK_Click(object sender, EventArgs e)
    {
        AddUserOptions options = GetOptions();
        IList<IUser> list = UserManagementService.AddUsers(options);
        if (list.Count > 1)
        {
            StringBuilder sb = new StringBuilder();
            int index = 0;
            int count = list.Count;
            foreach (IUser user in list)
            {
                index++;
                sb.AppendFormat(index == count ? "'{0}'" : "'{0}',", user.Id);
            }

            IGroupContextService srv = ApplicationContext.Current.Services.Get<IGroupContextService>() as GroupContextService;
            if (srv != null)
            {
                string tableName = "USERSECURITY";
                srv.CurrentTable = tableName;

                EntityGroupInfo currentEntityGroupInfo = srv.GetGroupContext().CurrentGroupInfo;
                currentEntityGroupInfo.LookupTempGroup.ClearConditions();
                currentEntityGroupInfo.LookupTempGroup.AddLookupCondition(string.Format("{0}:UserId", tableName), " IN ", string.Format("({0})", sb));
                currentEntityGroupInfo.LookupTempGroup.GroupXML = GroupInfo.RebuildGroupXML(currentEntityGroupInfo.LookupTempGroup.GroupXML);
                srv.CurrentGroupID = GroupContext.LookupResultsGroupID;
            }
            Response.Redirect(string.Format("~/{0}.aspx?", "User"), false);
        }
        else
        {
            Response.Redirect(string.Format("~/{0}.aspx?entityId={1}", "User", list[0].Id), false);
        }
    }

    protected void CANCEL_Click(object sender, EventArgs e)
    {
        Response.Redirect(string.Format("~/{0}.aspx?", "User"), false);
    }

    protected void RefreshLic_Click(object sender, EventArgs e)
    {
        UserManagementService.ClearLicenseCache();
    }

    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        lueAddUser.LookupResultValueChanged += lueAddUser_LookupResultValueChanged;
        btnOk.Click += new EventHandler(OK_Click);
    }

    private void LoadView()
    {
        if (lbxUserType.Items.Count < 1)
        {
            var userTypes = UserTypeInfo.GetUserTypes();

            foreach (UserTypeInfo info in userTypes.Values)
            {
                if ((info.UserType != UserType.Admin) && (info.UserType != UserType.Retired))
                {
                    ListItem item = new ListItem(info.DisplayName, info.Code);
                    lbxUserType.Items.Add(item);
                }
            }
            lbxUserType.SelectedIndex = 0;
            lbxUserType.Focus();
        }

        if (lbxTemplates.Items.Count < 1)
        {
            var templateList = UserManagementService.GetTemplates();
            foreach (IUser temp in templateList)
            {
                var translatedTemplate = GetLocalResourceObject(temp.UserInfo.UserName.Replace(" ", "_"));
                if (translatedTemplate == null) { translatedTemplate = temp.UserInfo.UserName; }
                lbxTemplates.Items.Add(new ListItem(translatedTemplate.ToString(), temp.Id.ToString()));
            }
            if (lbxTemplates.Items.Count > 0)
                lbxTemplates.SelectedIndex = 0;
        }

        if (rdoProfileFrom.SelectedValue == "U")
        {

            div_Templates_lbl.Style.Add("display", "none");
            div_Users_lbl.Style.Add("display", "block");
            div_Templates_Ctrl.Style.Add("display", "none");
            div_Users_Ctrl.Style.Add("display", "block");
        }
        else
        {
            div_Templates_lbl.Style.Add("display", "block");
            div_Users_lbl.Style.Add("display", "none");
            div_Templates_Ctrl.Style.Add("display", "block");
            div_Users_Ctrl.Style.Add("display", "none");
        }

        SetProfileTabs(chkCreateFromProfile.Checked);

        bool canAdd = false;
        if (lbxUserType.SelectedItem != null)
        {
            UserTypeInfo utInfo = UserTypeInfo.GetTypeInfoFromCode(lbxUserType.SelectedItem.Value);
            int addCount = Convert.ToInt32(ddlQuantity.SelectedValue);
            int licCount = UserManagementService.GetLicenseAvailableCount(utInfo.UserType);
            if (UserManagementService.IsLicenseAvailable(utInfo.UserType, addCount))
            {
                canAdd = true;
            }

            if (utInfo.UserType == UserType.Template)
            {
                lblAvailableLic.Text = GetLocalResourceObject("LicNotRequired").ToString();
            }
            else
            {
                if (utInfo.UserType == UserType.Concurrent)
                {
                    lblAvailableLic.Style.Remove("color");
                    lblAvailableLic.Text = string.Format(GetLocalResourceObject("LicAvailable").ToString(), UserManagementService.GetLicenseCount(UserType.Concurrent));
                }
                else
                {
                    if (licCount >= addCount)
                    {
                        lblAvailableLic.Style.Remove("color");
                        lblAvailableLic.Text = string.Format(GetLocalResourceObject("LicAvailable").ToString(), licCount);
                    }
                    else
                    {
                        lblAvailableLic.Style.Add("color", "Red");
                        lblAvailableLic.Text = string.Format(GetLocalResourceObject("LicTooFewAvailable").ToString(), licCount);
                    }
                }
            }
        }

        int addCount2 = Convert.ToInt32(ddlQuantity.SelectedValue);
        string plural = string.Empty;
        if (addCount2 > 1)
        {
            plural = GetLocalResourceObject("plural").ToString();
        }

        string processMsg = string.Format(GetLocalResourceObject("lblProcessing.Text").ToString(), System.Convert.ToInt32(ddlQuantity.SelectedValue), lbxUserType.SelectedItem.Text, plural);
        btnOk.OnClientClick = string.Format("addUser_OkClick('{0}', '{1}','{2}')", divStep1.ClientID, divStep2.ClientID, Sage.Platform.WebPortal.PortalUtil.JavaScriptEncode(processMsg));

        div_Req.Style.Add("display", "none");
        if (chkCreateFromProfile.Checked)
        {
            if (rdoProfileFrom.SelectedValue == "U")
            {
                if (string.IsNullOrEmpty(lueAddUser.LookupResultValue.ToString()))
                {
                    div_Req.Style.Add("display", "block");
                    canAdd = false;
                }
            }
            else
            {
                if (string.IsNullOrEmpty(lbxTemplates.SelectedValue))
                {
                    div_Req.Style.Add("display", "block");
                    canAdd = false;
                }
            }
        }
        btnOk.Enabled = canAdd;
    }

    protected void lueAddUser_LookupResultValueChanged(object sender, EventArgs e)
    {
        string userId = lueAddUser.LookupResultValue.ToString();
        IUser user = EntityFactory.GetById<IUser>(userId);
        if (user != null)
        {
            lueAddUser.Text = user.UserInfo.UserName;
        }
    }

    private void SetProfileTabs(bool enable)
    {
        rdoProfileFrom.Enabled = enable;
        User_lbl.Enabled = enable;
        lbxTemplates_lbl.Enabled = enable;
        lblTabOptions.Enabled = enable;
        chkGeneral.Enabled = enable;
        chkEmployee.Enabled = enable;
        chkCalender.Enabled = enable;
        chkClientOptions.Enabled = enable;
        chkSecurity.Enabled = enable;
        chkServiceAndSupport.Enabled = enable;
        chkTeams.Enabled = enable;
        lbxTemplates.Enabled = enable;
        lueAddUser.Enabled = enable;
    }

    private AddUserOptions GetOptions()
    {
        AddUserOptions options = new AddUserOptions();
        UserTypeInfo info = UserTypeInfo.GetTypeInfoFromCode(lbxUserType.SelectedValue);
        options.UserType = info.UserType;
        options.Quantity = String.IsNullOrEmpty(ddlQuantity.SelectedValue) ? 1 : System.Convert.ToInt32(ddlQuantity.SelectedValue);
        if (chkCreateFromProfile.Checked)
        {
            options.CreateFromProfile = true;
            if (rdoProfileFrom.SelectedValue == "U")
            {
                if (string.IsNullOrEmpty(lueAddUser.LookupResultValue.ToString()))
                {
                    throw new ValidationException(GetLocalResourceObject("lueAddUser.Validate").ToString());
                }
                options.TemplateID = lueAddUser.LookupResultValue.ToString();
            }
            else
            {
                options.TemplateID = lbxTemplates.SelectedValue;
            }
        }
        else
        {
            options.CreateFromProfile = false;
            options.TemplateID = string.Empty;
        }
        options.UseGeneralProfile = chkGeneral.Checked;
        options.UseEmployeeProfile = chkEmployee.Checked;
        options.UseCalendarProfile = chkCalender.Checked;
        options.UseClientOptionsProfile = chkClientOptions.Checked;
        options.UseSecurityProfile = chkSecurity.Checked;
        options.UseSupportProfile = chkServiceAndSupport.Checked;
        options.UseTeamsProfile = chkTeams.Checked;
        return options;
    }
}