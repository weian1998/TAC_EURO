using System;
using System.Web.UI;
using Sage.Entity.Interfaces;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix;
using Sage.SalesLogix.Security;
using System.Text;

// ReSharper disable InconsistentNaming

/// <summary>
/// Summary description for UserClientSystem page.
/// </summary>
// ReSharper disable CheckNamespace
public partial class UserClientSystem : EntityBoundSmartPartInfoProvider
// ReSharper restore CheckNamespace
{

    private UserOptionsService _userOptionService;
    /// <summary>
    /// Called when [form bound].
    /// </summary>
    protected override void OnFormBound()
    {
        LoadView();
    }

    protected override void OnPreRender(EventArgs e)
    {
       base.OnPreRender(e);
       var scriptManager = ScriptManager.GetCurrent(Page);
        if(scriptManager != null)
        {
            var sClientId = cboTemplateType.ClientID;
            var script = new StringBuilder();
            script.AppendLine("var MailMergeTemplates = null;");
            script.AppendLine("function getTemplate(mode) {");
            script.AppendLine(" dojo.require(\"Sage.MailMerge.Templates\");");
            script.AppendLine(" dojo.require(\"Sage.UI.Dialogs\");");
            script.AppendLine(" var fnOnSelect = function (item) {");
            script.AppendLine("     if (dojo.config.isDebug) {");
            script.AppendLine("         console.debug(\"Template: family=%o; name=%o; id=%o; maintable=%o; template=%o\",");
            script.AppendLine("         item.family, item.name, item.id, item.maintable, item.template);");
            script.AppendLine("     }");
            script.AppendLine("     try {");
            script.AppendLine("         var inputs = document.getElementsByTagName(\"input\");");
           script.AppendLine("          for (var i = 0; i < inputs.length; i++) {");
            script.AppendLine("             if (inputs[i].id.indexOf('txt' + mode + 'BaseTemplateId') > -1) {");
            script.AppendLine("                 inputs[i].value = item.id;");
            script.AppendLine("             }");
            script.AppendLine("             else {");
            script.AppendLine("                 if (inputs[i].id.indexOf('txt' + mode + 'BaseTemplate') > -1) {");
            script.AppendLine("                     inputs[i].value = item.name;");
            script.AppendLine("                 }");
           script.AppendLine("              }");
            script.AppendLine("         }");
            script.AppendLine("     }");
            script.AppendLine("     catch (err) {");
            script.AppendLine("         var sError = (typeof err.toMessage === \"function\") ? err.toMessage(Sage.MailMerge.Helper.DesktopErrors().UnexpectedError, Sage.MailMerge.Helper.MailMergeInfoStore().ShowJavaScriptStack) : err.message;");
            script.AppendLine("         Sage.UI.Dialogs.showError(sError);");
            script.AppendLine("     }");
            script.AppendLine(" };");
            script.AppendLine(" var sMainTable = \"CONTACT\";");
            script.AppendLine(" var oTemplateCombo = dijit.byId('" + sClientId + "');");
            script.AppendLine(" if (oTemplateCombo) {");
            script.AppendLine("     sMainTable = oTemplateCombo.attr('value');");
            script.AppendLine(" }");
            script.AppendLine(" if (MailMergeTemplates == null) {");
            script.AppendLine("     MailMergeTemplates = new Sage.MailMerge.Templates();");
            script.AppendLine(" }");
            script.AppendLine(" MailMergeTemplates.select(sMainTable, { onSelect: fnOnSelect });");
            script.AppendLine("}");
            ScriptManager.RegisterClientScriptBlock(Page, GetType(), ClientID, script.ToString(), true);
        }
    }

    /// <summary>
    /// Handles the Load event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Load(object sender, EventArgs e)
    {
        Page.Header.Controls.Add(new LiteralControl("<link rel=\"stylesheet\" type=\"text/css\" href=\"css/SlxOptions.css\" />"));
    }

    /// <summary>
    /// Handles the OnClick event of the Save control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Save_OnClick(object sender, EventArgs e)
    {
        var user = (IUser)BindingSource.Current;
        var userId = user.Id.ToString();
        _userOptionService = PageWorkItem.BuildTransientItem<UserOptionsService>();
        _userOptionService.SetUserId(userId);
        _userOptionService.SetCommonOption("InsertSecCodeID", "General", ownAccount.LookupResultValue.ToString(), !chkbxAllowChange.Checked);
        switch (cboTemplateType.SelectedIndex)
        {
            // Contact
            case 0:
                // Contact
                _userOptionService.SetCommonOption("DefaultMemoTemplate", "General", txtEmailBaseTemplate.Text, !chkbxAllowChangeTemplates.Checked);
                _userOptionService.SetCommonOption("DefaultMemoTemplateID", "General", txtEmailBaseTemplateId.Value, !chkbxAllowChangeTemplates.Checked);
                _userOptionService.SetCommonOption("DefaultLetterTemplate", "General", txtLetterBaseTemplate.Text, !chkbxAllowChangeTemplates.Checked);
                _userOptionService.SetCommonOption("DefaultLetterTemplateID", "General", txtLetterBaseTemplateId.Value, !chkbxAllowChangeTemplates.Checked);
                _userOptionService.SetCommonOption("DefaultFaxTemplate", "General", txtFaxBaseTemplate.Text, !chkbxAllowChangeTemplates.Checked);
                _userOptionService.SetCommonOption("DefaultFaxTemplateID", "General", txtFaxBaseTemplateId.Value, !chkbxAllowChangeTemplates.Checked);
                break;
            // Lead
            case 1:
                _userOptionService.SetCommonOption("DefaultLeadMemoTemplate", "General", txtEmailBaseTemplate.Text, !chkbxAllowChangeTemplates.Checked);
                _userOptionService.SetCommonOption("DefaultLeadMemoTemplateID", "General", txtEmailBaseTemplateId.Value, !chkbxAllowChangeTemplates.Checked);
                _userOptionService.SetCommonOption("DefaultLeadLetterTemplate", "General", txtLetterBaseTemplate.Text, !chkbxAllowChangeTemplates.Checked);
                _userOptionService.SetCommonOption("DefaultLeadLetterTemplateID", "General", txtLetterBaseTemplateId.Value, !chkbxAllowChangeTemplates.Checked);
                _userOptionService.SetCommonOption("DefaultLeadFaxTemplate", "General", txtFaxBaseTemplate.Text, !chkbxAllowChangeTemplates.Checked);
                _userOptionService.SetCommonOption("DefaultLeadFaxTemplateID", "General", txtFaxBaseTemplateId.Value, !chkbxAllowChangeTemplates.Checked);
                break;
        }
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
        var tinfo = new ToolsSmartPartInfo();
        foreach (Control c in UserClientSystem_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    #endregion

    /// <summary>
    /// Loads the view.
    /// </summary>
    private void LoadView()
    {
        var user = (IUser)BindingSource.Current;
        var userId = user.Id.ToString();
        if (_userOptionService == null)
            _userOptionService = PageWorkItem.BuildTransientItem<UserOptionsService>();
        _userOptionService.SetUserId(userId);
        ownAccount.LookupResultValue = _userOptionService.GetCommonOption("InsertSecCodeID", "General", false, Owner.SystemEveryone, String.Empty);
        chkbxAllowChange.Checked = !_userOptionService.GetCommonOptionLocked("InsertSecCodeID", "General");
        chkbxAllowChangeTemplates.Checked = !_userOptionService.GetCommonOptionLocked("DefaultMemoTemplate", "General");

        switch (cboTemplateType.SelectedIndex)
        {
            // Contact
            case 0:
                txtEmailBaseTemplate.Text = _userOptionService.GetCommonOption("DefaultMemoTemplate", "General");
                txtEmailBaseTemplateId.Value = _userOptionService.GetCommonOption("DefaultMemoTemplateID", "General");
                txtLetterBaseTemplate.Text = _userOptionService.GetCommonOption("DefaultLetterTemplate", "General");
                txtLetterBaseTemplateId.Value = _userOptionService.GetCommonOption("DefaultLetterTemplateID", "General");
                txtFaxBaseTemplate.Text = _userOptionService.GetCommonOption("DefaultFaxTemplate", "General");
                txtFaxBaseTemplateId.Value = _userOptionService.GetCommonOption("DefaultFaxTemplateID", "General");
                break;
            // Lead
            case 1:
                txtEmailBaseTemplate.Text = _userOptionService.GetCommonOption("DefaultLeadMemoTemplate", "General");
                txtEmailBaseTemplateId.Value = _userOptionService.GetCommonOption("DefaultLeadMemoTemplateID", "General");
                txtLetterBaseTemplate.Text = _userOptionService.GetCommonOption("DefaultLeadLetterTemplate", "General");
                txtLetterBaseTemplateId.Value = _userOptionService.GetCommonOption("DefaultLeadLetterTemplateID", "General");
                txtFaxBaseTemplate.Text = _userOptionService.GetCommonOption("DefaultLeadFaxTemplate", "General");
                txtFaxBaseTemplateId.Value = _userOptionService.GetCommonOption("DefaultLeadFaxTemplateID", "General");
                break;
        }

        if ((user.Type == UserType.WebViewer) || (user.Type == UserType.AddOn))
        {
            txtFaxBaseTemplate.Attributes.Add("DISABLED", "");
            txtFaxBaseTemplate.Attributes["onclick"] = "";

            txtLetterBaseTemplate.Attributes.Add("DISABLED", "");
            txtLetterBaseTemplate.Attributes["onclick"] = "";

            txtEmailBaseTemplate.Attributes.Add("DISABLED", "");
            txtEmailBaseTemplate.Attributes["onclick"] = "";

            chkbxAllowChangeTemplates.Enabled = false;
        }
    }
}