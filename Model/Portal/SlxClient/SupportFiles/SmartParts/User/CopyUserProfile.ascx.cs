using System;
using System.Collections.Generic;
using System.Web.UI;
using Sage.Platform;
using Sage.Entity.Interfaces;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Security;
using System.Web.UI.WebControls;
using System.Text;
using Sage.SalesLogix.HighLevelTypes;

public partial class CopyUserProfile : EntityBoundSmartPartInfoProvider
{
    private IList<IUser> _selUsers = new List<IUser>();

    void Page_Load(object sender, EventArgs e)
    {
        if (_selUsers.Count == 0)
        {
            IList<string> ids = new List<string>();
            if (DialogService.DialogParameters.ContainsKey("selectedIds"))
                ids = DialogService.DialogParameters["selectedIds"] as IList<string>;

            _selUsers = GetSelectedUsers(ids);
        }
        GenerateScript();
        lblTargetUser.Text = Server.HtmlEncode(_selUsers[0].UserInfo.UserName);
    }

    private void GenerateScript()
    {
        StringBuilder script = new StringBuilder();
        script.AppendLine("function SwitchLookup(showUser) {");
        script.AppendLine("var usr = document.getElementById('DialogWorkspace_CopyUserProfile_copyProfileParameter_userListContainer');");
        script.AppendLine("var templ = document.getElementById('DialogWorkspace_CopyUserProfile_copyProfileParameter_templateListContainer');");
        script.AppendLine("showUser ? templ.style.display = 'none' : templ.style.display = 'inline';");
        script.AppendLine("showUser ? usr.style.display = 'inline' : usr.style.display = 'none';");
        script.AppendLine("}");

        ScriptManager.RegisterStartupScript(Page, GetType(), ClientID, script.ToString(), true);
    }
    /// <summary>
    /// 
    /// </summary>
    /// <param name="ids"></param>
    /// <returns></returns>
    private IList<IUser> GetSelectedUsers(IList<string> ids)
    {
        IList<IUser> users = new List<IUser>();

        foreach (string id in ids)
        {
            users.Add(EntityFactory.GetById<IUser>(id));
        }

        return users;
    }

    protected override void OnFormBound()
    {
        base.OnFormBound();

		foreach (IUser selUser in _selUsers)
		{
			LookupPreFilter pf = new LookupPreFilter();
			pf.PropertyName = "Id";
			pf.OperatorCode = "!=";
			pf.FilterValue = string.Format("'{0}'", selUser.Id.ToString());
			copyProfileParameter.UserLookupControl.LookupPreFilters.Add(pf);
		}

        ClientBindingMgr.RegisterDialogCancelButton(btnCancel);
        RegisterValidationScript();
    }

    private void RegisterValidationScript()
    {
        StringBuilder script = new StringBuilder();

        script.AppendFormat("javascript:if($('#{0}_LookupText').val() == '' && $('#{1}_LookupText').val() == '') ", copyProfileParameter.UserLookupControl.ClientID, copyProfileParameter.TemplateLookupControl.ClientID);
        script.Append("{");
        script.AppendFormat("$('#{0}').css('display', 'inline'); ", copyProfileParameter.ValidationLabel.ClientID);
        script.Append("return false; ");
        script.Append("} ");
        script.Append("else ");
        script.Append("{");
        script.AppendFormat("if(confirm('{0}')) ", GetLocalResourceObject("confirmCopyProfile").ToString());
        script.Append("{ ");
        script.Append("$('.slxbutton').attr('disabled', 'disabled'); ");
        script.AppendFormat("__doPostBack('{0}','Click');", btnOk.UniqueID);
        script.Append("return false; ");
        script.Append("} ");
        script.Append("else ");
        script.Append("return false; ");
        script.Append("} ");
        btnOk.Attributes.Add("onclick", script.ToString());
    }

    /// <summary>
    /// Derived components should override this method to wire up event handlers.
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        btnOk.Click += new EventHandler(btnOk_Click);
        btnCancel.Click += DialogService.CloseEventHappened;
        base.OnWireEventHandlers();

    }

    protected void btnOk_Click(object sender, EventArgs e)
    {
        if (copyProfileParameter.SelectedUserId.Trim().Length == 0)
        {
            copyProfileParameter.IsValid = false;
            return;
        }

        CopyProfileToSelectedUsers();

        LinkHandler linkHandler = new LinkHandler(Page);
        linkHandler.RedirectToNewGroupDetail(_selUsers);

        this.OnClosing();

    }
    private void CopyProfileToSelectedUsers()
    {
        try
        {
            AddUserOptions options = copyProfileParameter.UserOptions;
            options.TemplateID = copyProfileParameter.SelectedUserId;

            foreach (var targetUser in _selUsers)
            {
                IUser sourceUser = EntityFactory.GetById<IUser>(options.TemplateID);
                sourceUser.UpdateWithExistingProfile(targetUser, options);
                targetUser.Save();
            }
        }
        finally
        {
            btnOk.Enabled = true;
            btnCancel.Enabled = true;
        }

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
