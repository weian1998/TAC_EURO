using System;
using System.Web.UI;
using System.Xml;
using Sage.Entity.Interfaces;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.BusinessRules;
using Sage.SalesLogix.Security;
using Sage.SalesLogix.Web;

/// <summary>
/// Summary description for UserClientSystem page.
/// </summary>
public partial class UserClientSystem : EntityBoundSmartPartInfoProvider
{
    private string _userId;

    protected override void OnFormBound()
    {
        LoadView();
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        IUser user = (IUser)BindingSource.Current;
        _userId = user.Id.ToString();
        PopulateTree();
        if (!Page.ClientScript.IsClientScriptIncludeRegistered("XMLSupport"))
            Page.ClientScript.RegisterClientScriptInclude("XMLSupport", "jscript/XMLSupport.js");
        EmailTemplateFindIcon.Attributes["onclick"] = String.Format("ShowMailMergeTemplates('{0}', '{1}', '{2}')",
                                                                    txtEmailTemplateName.ClientID,
                                                                    txtEmailTemplateId.ClientID,
                                                                    templateXml.ClientID);
        LetterTemplateFindIcon.Attributes["onclick"] = String.Format("ShowMailMergeTemplates('{0}', '{1}', '{2}')",
                                                                     txtLetterTemplateName.ClientID,
                                                                     txtLetterTemplateId.ClientID,
                                                                     templateXml.ClientID);
        FaxTemplateFindIcon.Attributes["onclick"] = String.Format("ShowMailMergeTemplates('{0}', '{1}', '{2}')",
                                                                  txtFaxTemplateName.ClientID,
                                                                  txtFaxTemplateId.ClientID,
                                                                  templateXml.ClientID);
        txtEmailTemplateName.Attributes["onclick"] = String.Format("ShowMailMergeTemplates('{0}', '{1}', '{2}')",
                                                            txtEmailTemplateName.ClientID,
                                                            txtEmailTemplateId.ClientID,
                                                            templateXml.ClientID);
        txtLetterTemplateName.Attributes["onclick"] = String.Format("ShowMailMergeTemplates('{0}', '{1}', '{2}')",
                                                                     txtLetterTemplateName.ClientID,
                                                                     txtLetterTemplateId.ClientID,
                                                                     templateXml.ClientID);
        txtFaxTemplateName.Attributes["onclick"] = String.Format("ShowMailMergeTemplates('{0}', '{1}', '{2}')",
                                                                  txtFaxTemplateName.ClientID,
                                                                  txtFaxTemplateId.ClientID,
                                                                  templateXml.ClientID);
    }

    private void PopulateTree()
    {
        //ToDo: Refactor: Use Plugin manager to do this
        XmlDocument xmlTemplates = BusinessRuleHelper.GetMailMergeTemplates(_userId);
        if (xmlTemplates != null)
        {
            //Todo: Refactor: Remove inline storage of template list.
            templateXml.Text = xmlTemplates.OuterXml;
        }
    }

    protected void Save_OnClick(object sender, EventArgs e)
    {
        IUser user = (IUser)BindingSource.Current;
        _userId = user.Id.ToString();
        WebUserOptionsService userOptions = new WebUserOptionsService(_userId); // ApplicationContext.Current.Services.Get<IUserOptionsService>(true);
        userOptions.SetCommonOption("InsertSecCodeID", "General", ownAccount.LookupResultValue.ToString(), !chkbxAllowChange.Checked);
        userOptions.SetCommonOption("DefaultMemoTemplate", "General", txtEmailTemplateName.Value, !chkbxAllowChangeTemplates.Checked);
        userOptions.SetCommonOption("DefaultMemoTemplateID", "General", txtEmailTemplateId.Value, !chkbxAllowChangeTemplates.Checked);
        userOptions.SetCommonOption("DefaultLetterTemplate", "General", txtLetterTemplateName.Value, !chkbxAllowChangeTemplates.Checked);
        userOptions.SetCommonOption("DefaultLetterTemplateId", "General", txtLetterTemplateId.Value, !chkbxAllowChangeTemplates.Checked);
        userOptions.SetCommonOption("DefaultFaxTemplate", "General", txtFaxTemplateName.Value, !chkbxAllowChangeTemplates.Checked);
        userOptions.SetCommonOption("DefaultFaxTemplateId", "General", txtFaxTemplateId.Value, !chkbxAllowChangeTemplates.Checked);
    }

    #region ISmartPartInfoProvider Members

    /// <summary>
    /// Override this method to add bindings to the currently bound smart part
    /// </summary>
    protected override void OnAddEntityBindings()
    {
    }

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(IUser); }
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in UserClientSystem_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    #endregion

    private void LoadView()
    {
        WebUserOptionsService userOptions = new WebUserOptionsService(_userId); // ApplicationContext.Current.Services.Get<IUserOptionsService>();
        ownAccount.LookupResultValue = userOptions.GetCommonOption("InsertSecCodeID", "General", false, Owner.SystemEveryone, String.Empty);
        chkbxAllowChange.Checked = !userOptions.GetCommonOptionLocked("InsertSecCodeID", "General");
        txtEmailTemplateName.Value = userOptions.GetCommonOption("DefaultMemoTemplate", "General");
        txtEmailTemplateId.Value = userOptions.GetCommonOption("DefaultMemoTemplateId", "General");
        txtLetterTemplateName.Value = userOptions.GetCommonOption("DefaultLetterTemplate", "General");
        txtLetterTemplateId.Value = userOptions.GetCommonOption("DefaultLetterTemplateId", "General");
        txtFaxTemplateName.Value = userOptions.GetCommonOption("DefaultFaxTemplate", "General");
        txtFaxTemplateId.Value = userOptions.GetCommonOption("DefaultFaxTemplateId", "General");
        chkbxAllowChangeTemplates.Checked = !userOptions.GetCommonOptionLocked("DefaultMemoTemplate", "General");

        IUser user = (IUser)BindingSource.Current;
        if ((user.Type == UserType.WebViewer) || (user.Type == UserType.AddOn))
        {
            txtFaxTemplateName.Attributes.Add("DISABLED", "");
            txtFaxTemplateName.Attributes["onclick"] = "";
            FaxTemplateFindIcon.Attributes["onclick"] = "";

            txtLetterTemplateName.Attributes.Add("DISABLED", "");
            txtLetterTemplateName.Attributes["onclick"] = "";
            LetterTemplateFindIcon.Attributes["onclick"] = "";

            txtEmailTemplateName.Attributes.Add("DISABLED", "");
            txtEmailTemplateName.Attributes["onclick"] = "";
            EmailTemplateFindIcon.Attributes["onclick"] = "";

            chkbxAllowChangeTemplates.Enabled = false;
        }
    }
}