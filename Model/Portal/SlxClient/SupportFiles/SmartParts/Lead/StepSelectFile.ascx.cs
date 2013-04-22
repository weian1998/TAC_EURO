using System;
using System.Collections;
using System.Reflection;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.Diagnostics;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Services.Import;
using Sage.SalesLogix.Services.Import.Actions;
using Telerik.Web.UI;
using log4net;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.SalesLogix.Client.GroupBuilder;
using Sage.SalesLogix.Services.PotentialMatch;

/// <summary>
/// Summary description for Lead Imports Select a File step.
/// </summary>
public partial class StepSelectFile : UserControl
{
    private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

    #region Public Properties

    /// <summary>
    /// Gets or sets an instance of the Dialog Service.
    /// </summary>
    /// <value>The dialog service.</value>
    [ServiceDependency]
    public IWebDialogService DialogService { get; set; }

    /// <summary>
    /// Gets or sets the entity context.
    /// </summary>
    /// <value>The entity context.</value>
    /// <returns>The specified <see cref="T:System.Web.HttpContext"></see> object associated with the current request.</returns>
    [ServiceDependency]
    public IContextService ContextService { get; set; }

    #endregion

    #region Public Methods

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        return tinfo;
    }

    /// <summary>
    /// Validates the required fields.
    /// </summary>
    /// <returns></returns>
    public Boolean ValidateRequiredFields()
    {
        lblFileRequired.Visible = false;
        lblRequiredMsg.Visible = false;
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager != null)
        {
            if (String.IsNullOrEmpty(importManager.SourceFileName))
            {
                lblFileRequired.Visible = true;
                lblRequiredMsg.Visible = true;
                return false;
            }
        }
        return true;
    }

    /// <summary>
    /// Sets the step select file options.
    /// </summary>
    public void SetStepSelectFileOptions()
    {
        ImportManager importManager = GetImportManager();
        importManager.Options.AddToGroup = chkAddToGroup.Checked;
        importManager.Options.CreateAddHocGroup = rdbCreateGroup.Checked;
        importManager.Options.AddToAddHocGroup = rdbAddToAddHocGroup.Checked;
        if (rdbCreateGroup.Checked)
            importManager.Options.AddHocGroupName = txtCreateGroupName.Text;
        else if (rdbAddToAddHocGroup.Checked)
        {
            if (lbxAddHocGroups.SelectedValue != null)
                importManager.Options.AddHocGroupId = lbxAddHocGroups.SelectedValue;
            if (lbxAddHocGroups.SelectedItem != null)
                importManager.Options.AddHocGroupName = lbxAddHocGroups.SelectedItem.Text;
        }
        txtCurrentFile.Text = importManager.SourceFileName;
        Page.Session["importManager"] = importManager;
    }

    /// <summary>
    /// Uploads the file.
    /// </summary>
    public void UploadFile()
    {
        if (uplFile.UploadedFiles.Count == 0)
            return;

        lblFileRequired.Visible = false;
        lblRequiredMsg.Visible = false;
        try
        {
            switch (txtConfirmUpload.Value)
            {
                case "F":
                    uplFile.UploadedFiles.Clear();
                    break;
                case "O":
                    //elected to overwrite existing uploaded file
                    ImportManager importManager = GetImportManager();
                    importManager.SourceFileName = uplFile.UploadedFiles[0].FileName;
                    importManager.ImportMaps.Clear();
                    ImportOptions options = new ImportOptions();
                    importManager.Options = options;
                    Page.Session["importManager"] = importManager;
                    txtConfirmUpload.Value = "T";
                    UploadFileEx();
                    break;
                case "T":
                    UploadFileEx();
                    break;
            }
        }
        catch (Exception ex)
        {
            string sSlxErrorId = null;
            var sMsg = ErrorHelper.GetClientErrorHtmlMessage(ex, ref sSlxErrorId);
            if (!string.IsNullOrEmpty(sSlxErrorId))
            {
                log.Error(ErrorHelper.AppendSlxErrorId("The call to StepSelectFile.UploadFile() failed", sSlxErrorId),
                          ex);
            }
            DialogService.ShowHtmlMessage(sMsg, ErrorHelper.IsDevelopmentContext() ? 600 : -1,
                                          ErrorHelper.IsDevelopmentContext() ? 800 : -1);
        }
    }

    /// <summary>
    /// Holds the state of the current import processes ID.
    /// </summary>
    /// <param name="processId">The process id.</param>
    public void SetProcessIDState(string processId)
    {
        importProcessId.Value = processId;
    }

    #endregion

    #region Protected Methods

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"></see> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"></see> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        LoadView();
        var script = new StringBuilder();
        script.AppendLine(" javascript: function onUploadImportFile() { ");
        script.AppendLine("     var workSpace = window.importLeadsWizard.workSpace;");
        script.AppendLine(String.Format("   var file = dojo.byId('{0}');", txtImportFile.ClientID));
        script.AppendLine("     if (file !== null) {");
        script.AppendLine(String.Format("         var confirmUpload = dojo.byId('{0}');", txtConfirmUpload.ClientID));
        script.AppendLine("             confirmUpload.value = 'T';");
        script.AppendLine("             if (file.value !== '') {");
        script.AppendLine("                 Sage.UI.Dialogs.raiseQueryDialog(");
        script.AppendLine("                     'SalesLogix',");
        script.AppendLine("                     importLeadsWizard.confirmOverwriteFileMsg,");
        script.AppendLine("                     function(result) {");
        script.AppendLine("                         if (result) {");
        script.AppendLine("                             confirmUpload.value = 'O';");
        script.AppendLine("                             file.value = '';");
        script.AppendLine("                         } else {");
        script.AppendLine("                             confirmUpload.value = 'F';");
        script.AppendLine("                         }");
        script.AppendLine("                     },");
        script.AppendLine("                     window.importLeadsWizard.yesText,");
        script.AppendLine("                     window.importLeadsWizard.noText");
        script.AppendLine("                 );");
        script.AppendLine("             }");
        script.AppendLine("     }");
        script.AppendLine(" };");

        ScriptManager.RegisterClientScriptBlock(Page, GetType(), ClientID, script.ToString(), true);

        chkAddToGroup.Attributes.Add("onclick",
                                     String.Format(
                                         "javascript:importLeadsWizard.onAddHocGroupChecked('{0}', '{1}');",
                                         groupOptions.ClientID, chkAddToGroup.ClientID));
        base.OnPreRender(e);
    }

    /// <summary>
    /// Loads the view with the defaulted data.
    /// </summary>
    protected void LoadView()
    {
        ImportManager importManager = GetImportManager();
        if (importManager != null)
        {
            if (importManager.SourceFileName != null)
            {
                txtImportFile.Value = importManager.SourceFileName;
            }
            chkAddToGroup.Checked = importManager.Options.AddToGroup;
            if (chkAddToGroup.Checked)
            {
                groupOptions.Style.Add("display", String.Empty);
            }
            SetDefaultTargetProperties(importManager);
            LoadAddHocGroups();
            Page.Session["importManager"] = importManager;
        }
        IsImportPathValid();
    }

    /// <summary>
    /// Handles the LookupResultValueChanged event of the ownDefaultOwner control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void ownDefaultOwner_LookupResultValueChanged(object sender, EventArgs e)
    {
        string ownerId;
        ownerId = ownDefaultOwner.LookupResultValue == null ? string.Empty : ownDefaultOwner.LookupResultValue.ToString();
        SetDefaultTargetPropertyValue("Owner", ownerId);
    }

    /// <summary>
    /// Handles the LookupResultValueChanged event of the lueLeadSource control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void lueLeadSource_LookupResultValueChanged(object sender, EventArgs e)
    {
        string leadSource = (lueLeadSource.LookupResultValue == null) ? String.Empty : lueLeadSource.LookupResultValue.ToString();
        SetDefaultTargetPropertyValue("LeadSource", leadSource);
    }

    #endregion

    #region Private Methods
    private void UploadFileEx()
    {
        UploadedFile file = uplFile.UploadedFiles[0];
        if (file != null)
        {
            ImportManager importManager = Page.Session["importManager"] as ImportManager;
            importManager.SourceFileName = file.FileName;
            importManager.SourceReader = GetCSVReader(file, importManager.ToString());
            Page.Session["importManager"] = importManager;
        }
    }

    /// <summary>
    /// Gets and Sets the default target properties.
    /// </summary>
    /// <param name="importManager">The import manager.</param>
    private void SetDefaultTargetProperties(ImportManager importManager)
    {
        if (importManager.TargetPropertyDefaults == null || importManager.TargetPropertyDefaults.Count == 0)
        {
            ImportTargetProperty tpOwner = importManager.EntityManager.GetEntityProperty("Owner");
            ImportTargetProperty tpLeadSource = importManager.EntityManager.GetEntityProperty("LeadSource");
            if (tpOwner != null)
            {
                string ownwerId = "SYST00000001";
                IOwner owner = ImportRules.GetDefaultOwner();
                if (owner != null)
                {
                    ownwerId = owner.Id.ToString();
                }

                tpOwner.DefaultValue = ownwerId;
                importManager.TargetPropertyDefaults.Add(tpOwner);
                ownDefaultOwner.LookupResultValue = ownwerId;
            }
            if (tpLeadSource != null)
            {
                tpLeadSource.DefaultValue = String.Empty;
                importManager.TargetPropertyDefaults.Add(tpLeadSource);
            }
        }
        else
        {
            foreach (ImportTargetProperty tp in importManager.TargetPropertyDefaults)
            {
                if (tp.PropertyId.Equals("Owner"))
                    ownDefaultOwner.LookupResultValue = EntityFactory.GetById<IOwner>(tp.DefaultValue);
                if (tp.PropertyId.Equals("LeadSource"))
                    lueLeadSource.LookupResultValue = tp.DefaultValue.ToString();
            }
        }
    }

    /// <summary>
    /// Sets the default value for the EntityProperty specified.
    /// </summary>
    /// <param name="property">The property.</param>
    /// <param name="value">The value.</param>
    private void SetDefaultTargetPropertyValue(string property, string value)
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        ImportTargetProperty prop = importManager.EntityManager.GetEntityProperty(property);
        if (prop != null)
        {
            prop.DefaultValue = value;
            Page.Session["importManager"] = importManager;
        }
    }

    /// <summary>
    /// Gets the import manager.
    /// </summary>we
    /// <returns></returns>
    private ImportManager GetImportManager()
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager != null)
        {
            if (importProcessId.Value != importManager.ToString() && String.IsNullOrEmpty(txtImportFile.Value))
            {
                lblFileRequired.Visible = false;
                lblRequiredMsg.Visible = false;
                importManager = null;
            }
        }
        if (importManager == null)
        {
            try
            {
                LeadDuplicateProvider duplicateProvider = new LeadDuplicateProvider();
                txtCreateGroupName.Text = DateTime.Now.ToString();
                ImportService importService = new ImportService();
                importManager = importService.CreateImportManager(typeof(ILead));
                importProcessId.Value = importManager.ToString();
                importManager.DuplicateProvider = duplicateProvider;
                importManager.MergeProvider = new ImportLeadMergeProvider();
                importManager.ActionManager = GetActionManager();
            }
            catch (Exception ex)
            {
                string sSlxErrorId = null;
                var sMsg = ErrorHelper.GetClientErrorHtmlMessage(ex, ref sSlxErrorId);
                if (!string.IsNullOrEmpty(sSlxErrorId))
                {
                    log.Error(
                        ErrorHelper.AppendSlxErrorId("The call to StepSelectFile.GetImportManager() failed", sSlxErrorId),
                        ex);
                }
                divError.Style.Add(HtmlTextWriterStyle.Display, "inline");
                divMainContent.Style.Add(HtmlTextWriterStyle.Display, "none");
                lblError.Text = sMsg;
                (Parent.Parent.FindControl("StartNavigationTemplateContainerID").FindControl("cmdStartButton")).Visible = false;
            }
        }
        return importManager;
    }

    /// <summary>
    /// Streams the data from the posted file into a new FileStream, which is then saved to the attachments folder
    /// specified in BranchOptions.
    /// </summary>
    /// <param name="file">The uploaded file.</param>
    /// <returns>The data stream.</returns>
    private byte[] GetData(UploadedFile file)
    {
        int fileLen = file.ContentLength;
        byte[] Data = new byte[fileLen];
        file.InputStream.Read(Data, 0, fileLen);
        return Data;
    }

    /// <summary>
    /// Gets the CSV reader.
    /// </summary>
    /// <param name="file">The file.</param>
    /// <param name="importId">The import id.</param>
    /// <returns></returns>
    private ImportCSVReader GetCSVReader(UploadedFile file, string importId)
    {
        try
        {
            string fileName = importId + ".csv";
            string path = ImportService.GetImportProcessPath() + fileName;
            ImportService.DeleteImportFile(path);
            //file.MoveTo(path);
            file.SaveAs(path);
            ImportCSVReader reader = new ImportCSVReader(path);
            return reader;
        }
        catch (Exception ex)
        {
            log.Error("The call to StepSelectFile.GetCSVReader() failed", ex);
            lblError.Text = GetLocalResourceObject("error_InvalidImportPath").ToString();
            divError.Style.Add(HtmlTextWriterStyle.Display, "inline");
            divMainContent.Style.Add(HtmlTextWriterStyle.Display, "none");
            (Parent.Parent.FindControl("StartNavigationTemplateContainerID").FindControl("cmdStartButton")).Visible = false;
            throw new UserObservableApplicationException(GetLocalResourceObject("error_InvalidImportPath").ToString(), ex);
        }
    }

    private bool IsImportPathValid()
    {
        try
        {
            string fileName = importProcessId.Value + "_.test";
            byte[] data = new byte[10];
            data[0] = 0;
            ImportService.WriteImportFile(fileName, data);
        }
        catch (Exception ex)
        {
            log.Error("The call to StepSelectFile.IsImportPathValid() failed", ex);
            lblError.Text = GetLocalResourceObject("error_InvalidImportPath").ToString();
            divError.Style.Add(HtmlTextWriterStyle.Display, "inline");
            divMainContent.Style.Add(HtmlTextWriterStyle.Display, "none");
            (Parent.Parent.FindControl("StartNavigationTemplateContainerID").FindControl("cmdStartButton")).Visible = false;
        }

        return false;
    }

    /// <summary>
    /// Loads the ad hoc groups.
    /// </summary>
    private void LoadAddHocGroups()
    {
        if (lbxAddHocGroups.Items.Count <= 0)
        {
            lbxAddHocGroups.Items.Clear();
            IList addHocGroups = GroupInfo.GetGroupList("LEAD");
            foreach (GroupInfo group in addHocGroups)
            {
                if (group.IsAdHoc)
                {
                    ListItem item = new ListItem();
                    item.Text = group.DisplayName;
                    item.Value = group.GroupID;
                    lbxAddHocGroups.Items.Add(item);
                }
            }
        }
        //if we don't have any ad hoc groups disable the option
        if (lbxAddHocGroups.Items.Count <= 0)
        {
            rdbAddToAddHocGroup.Enabled = false;
        }
    }

    /// <summary>
    /// Gets the action manager.
    /// </summary>
    /// <returns></returns>
    private IActionManager GetActionManager()
    {
        return null;
    }

    #endregion
}