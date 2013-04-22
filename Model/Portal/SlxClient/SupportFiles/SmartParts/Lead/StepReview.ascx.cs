using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform;
using Sage.Platform.Application.UI.Web;
using Sage.Platform.Application.UI.Web.Threading;
using Sage.Platform.Orm;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.Application;
using Sage.Entity.Interfaces;
using Sage.SalesLogix.Services.Import;
using Sage.SalesLogix.Services.Import.Actions;
using log4net;

public partial class StepReview : UserControl
{
    private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

    #region Public Methods

    /// <summary>
    /// Gets the dialog.
    /// </summary>
    public IWebDialogService Dialog
    {
        get { return ((ApplicationPage)Page).PageWorkItem.Services.Get<IWebDialogService>(true); }
    }

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

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"></see> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"></see> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        InitializeView();
    }

    private void InitializeView()
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager != null)
        {
            try
            {
                lblImportFileValue.Text = importManager.SourceFileName;
                lblLeadSourceValue.Text = GetLocalResourceObject("DefaultLeadSource_Value").ToString();
                foreach (ImportTargetProperty targetProperty in importManager.TargetPropertyDefaults)
                {
                    if (targetProperty.PropertyId.Equals("Owner"))
                    {
                        lblDefaultOwnerValue.Text =
                            EntityFactory.GetById<IOwner>(targetProperty.DefaultValue).ToString();
                    }
                    if (targetProperty.PropertyId.Equals("LeadSource") &&
                        !String.IsNullOrEmpty(targetProperty.DefaultValue.ToString()))
                    {
                        lblLeadSourceValue.Text =
                            EntityFactory.GetById<ILeadSource>(targetProperty.DefaultValue).ToString();
                    }
                }
                if (importManager.Options.AddToGroup)
                {
                    lblAddToGroupValue.Text = GetLocalResourceObject("lblCheckDuplicatesYes.Caption").ToString();
                    lblLeadsGroupValue.Text = importManager.Options.AddHocGroupName;
                }
                else
                {
                    lblAddToGroupValue.Text = GetLocalResourceObject("lblCheckDuplicatesNo.Caption").ToString();
                    lblLeadsGroupValue.Text = "";
                }

                lblCheckDuplicatesValue.Text = importManager.Options.CheckForDuplicates
                                                   ? GetLocalResourceObject("lblCheckDuplicatesYes.Caption").ToString()
                                                   : GetLocalResourceObject("lblCheckDuplicatesNo.Caption").ToString();
                if (importManager.ActionManager != null)
                {
                    blActions.Items.Clear();
                    foreach (IAction actions in importManager.ActionManager.GetActions())
                    {
                        if (actions.Active)
                        {
                            blActions.Items.Add(new ListItem(actions.DisplayName));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error(ex.Message);
                RemoveJob(importManager);
            }
        }
    }

    /// <summary>
    /// Handles the Click event of the cmdRunTest control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdStartProcess_Click(object sender, EventArgs e)
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager == null) return;

        using (new SessionScopeWrapper(true))
        {
            ThreadPoolHelper.QueueTask(OnStartImportProcess);
        }
        //string sourceFileName = ((ImportCSVReader)importManager.SourceReader).SourceFileName;
        //if (sourceFileName != null)
        //{
        //string targetFileName = String.Format("{0}{1}-{2}.csv", ImportService.GetImportCompletedPath(),
        //                                      importManager.ImportHistory.AlternateKeyPrefix,
        //                                      importManager.ImportHistory.AlternateKeySuffix);
        //    ImportService.MoveToPath(sourceFileName, targetFileName);
        //}
        //RemoveJob(importManager);


        //importManager.Dispose();
        //object objShutDown = Page.Session["SessionShutDown"];
        //if (Convert.ToBoolean(objShutDown))
        //{
        //    if (CanShutDown())
        //    {
        //        ApplicationContext.Shutdown();
        //        Page.Session.Abandon();
        //    }
        //}
    }

    /// <summary>
    /// Starts the import process inside its own thread.
    /// </summary>
    public void StartImportProcess()
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager == null) return;
        try
        {
            SetImportSourceValue();
            AddJob(importManager);
            AddCrossReferenceMananager(importManager);

            WebPortalPage portalPage = Page as WebPortalPage;
            if (portalPage != null)
            {
                IImportHistory importHistory = EntityFactory.Create<IImportHistory>();
                importHistory.Status = GetLocalResourceObject("importStatus_Processing").ToString();
                importHistory.ProcessedCount = 0;
                importHistory.Save();
                lblHeader.Text = GetLocalResourceObject("lblHeader_ProcessStarted.Caption").ToString();
                lblImportNumber.Visible = true;
                lnkImportHistoryCaption.Text = String.Format(" {0}-{1}", importHistory.Alternatekeyprefix, importHistory.Alternatekeysuffix);
                lnkImportHistory.HRef = String.Format("..\\..\\ImportHistory.aspx?entityid='{0}'&modeid=Detail", importHistory.Id);
                lblImportLeadsWizard.Visible = true;
                importManager.ImportHistory = importHistory;
                portalPage.ClientContextService.CurrentContext.Remove("ImportHistoryId");
                portalPage.ClientContextService.CurrentContext.Add("ImportHistoryId", importHistory.Id.ToString());
            }
        }
        catch (Exception ex)
        {
            log.Error("The call to StepProcessRequest.StartImportProcess() failed", ex);
        }
    }

    /// <summary>
    /// Sets the import source value.
    /// </summary>
    private void SetImportSourceValue()
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        ImportTargetProperty prop = importManager.EntityManager.GetEntityProperty("ImportSource");
        if (prop == null) return;
        string importSource = Path.GetFileName(importManager.SourceFileName);
        if (importSource.Length > 24)
            importSource = importSource.Substring(0, 24);
        prop.DefaultValue = importSource;
        importManager.TargetPropertyDefaults.Add(prop);
        Page.Session["importManager"] = importManager;
    }

    private void AddJob(ImportManager importManager)
    {
        IDictionary<string, string> jobs = Page.Session["importJobs"] as Dictionary<string, string> ??
                                           new Dictionary<string, string>();
        if (!jobs.ContainsKey(importManager.ToString()))
        {
            jobs.Add(importManager.ToString(), importManager.SourceFileName);
        }
        Page.Session["importJobs"] = jobs;
    }

    private void AddCrossReferenceMananager(ImportManager importManager)
    {
        IImportTransformationProvider transformationProvider = importManager.TransformationProvider;
        if (transformationProvider.CrossRefManager == null || transformationProvider.CrossRefManager.Sets.Count == 0)
        {
            ImportCrossRefManager crossRefManager = new ImportCrossRefManager();
            ImportCrossRefSet crossRefSet = new ImportCrossRefSet();
            crossRefSet.AddCrossReference("T", true);
            crossRefSet.AddCrossReference("F", false);
            crossRefSet.AddCrossReference("Y", true);
            crossRefSet.AddCrossReference("N", true);
            crossRefSet.AddCrossReference("Yes", true);
            crossRefSet.AddCrossReference("No", false);
            crossRefSet.AddCrossReference("True", true);
            crossRefSet.AddCrossReference("False", false);
            crossRefManager.Sets.Add("TrueFalse_Set", crossRefSet);

            crossRefSet = new ImportCrossRefSet();
            crossRefSet.AddCrossReference("M", "Male");
            crossRefSet.AddCrossReference("F", "Female");
            crossRefSet.AddCrossReference("", "Unknown");
            crossRefSet.AddCrossReference("U", "Unknown");
            crossRefManager.Sets.Add("Gender_Set", crossRefSet);

            transformationProvider.CrossRefManager = crossRefManager;
        }
    }

    private void RemoveJob(ImportManager importManager)
    {
        IDictionary<string, string> jobs = Page.Session["importJobs"] as Dictionary<string, string>;
        if (jobs != null)
        {
            jobs.Remove(importManager.ToString());
        }
        Page.Session["importJobs"] = jobs;
    }

    private bool CanShutDown()
    {
        IDictionary<string, string> jobs = Page.Session["importJobs"] as Dictionary<string, string>;
        return jobs != null && jobs.Count == 0;
    }

    /// <summary>
    /// Starts the test import process.
    /// </summary>
    private void OnStartImportProcess(Object args)
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        importManager.StartImportProcess();
    }
}