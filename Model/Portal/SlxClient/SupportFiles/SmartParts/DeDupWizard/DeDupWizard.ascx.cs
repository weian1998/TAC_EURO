using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.Application.UI;
using Sage.Entity.Interfaces;
using Sage.SalesLogix.Services.PotentialMatch;
using Sage.Platform.WebPortal.Services;
using Telerik.Web.UI;

public partial class DeDupWizard : EntityBoundSmartPartInfoProvider
{
    #region Public Methods

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(IDeDupJob); }
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in this.pnlDeDup_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    #endregion

    /// <summary>
    /// Adds the DialogService for each of the wizards steps.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void AddDialogServiceToPage(object sender, EventArgs e)
    {
        frmSelectSource.DialogService = DialogService;
        frmSelectSource.DialogService.onDialogClosing += OnStepClosing;
        frmManageDuplicates.DialogService = DialogService;
        frmManageDuplicates.DialogService.onDialogClosing += OnStepClosing;
        frmManageDuplicates.Job = GetJob();
        frmReview.DialogService = DialogService;
        frmReview.DialogService.onDialogClosing += OnStepClosing;
        frmReview.Job = GetJob();
        frmProcessRequest.DialogService = DialogService;
        frmProcessRequest.DialogService.onDialogClosing += OnStepClosing;
    }

    public void OnStepClosing(object from, WebDialogClosingEventArgs e)
    {
        IPanelRefreshService refresher = PageWorkItem.Services.Get<IPanelRefreshService>();
        if (refresher != null)
        {
            refresher.RefreshAll();
        }
    }

    /// <summary>
    /// Raises the <see cref="E:PreRender"/> event.
    /// </summary>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        foreach (WizardStep step in wzdDeDup.WizardSteps)
        {
            SetStep(step);
        }
        RadProgressContext jobProgress = RadProgressContext.Current;
        jobProgress["OperationComplete"] = "True";
        jobProgress["ProcessCompleted"] = "True";
    }

    /// <summary>
    /// Handles the Click event of the startButton control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void startButton_Click(object sender, EventArgs e)
    {
    }

    /// <summary>
    /// Override this method to add bindings to the currrently bound smart part
    /// </summary>
    protected override void OnAddEntityBindings()
    {
    }

    /// <summary>
    /// Called when the dialog is closing.
    /// </summary>
    protected override void OnClosing()
    {
        if (DialogService.DialogParameters.ContainsKey("IsDuDupWizard"))
            DialogService.DialogParameters.Remove("IsDeDupWizard");
        base.OnClosing();
    }

    /// <summary>
    /// Handles the NextButtonClick event of the wzdImportLeads control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.WizardNavigationEventArgs"/> instance containing the event data.</param>
    protected void wzdDeDup_NextButtonClick(object sender, WizardNavigationEventArgs e)
    {
        switch (wzdDeDup.ActiveStepIndex)
        {
            case 0:
                PerformSelectSourceActions();
                break;
            case 1:
                PerformManageDuplicatesActions();
                break;
            case 2:
                PerformPreviewActions();
                break;
        }
    }

    protected void wzdDeDup_PreviousButtonClick(object sender, WizardNavigationEventArgs e)
    {
        switch (wzdDeDup.ActiveStepIndex)
        {
            case 0:
                break;
            case 1:
                PreviousManageDuplicatesActions();
                break;
            case 2:
                break;
            case 3:
                break;
        }
    }

    /// <summary>
    /// Handles the CancelButtonClick event of the wzdImportLeads control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void wzdDeDup_CancelButtonClick(object sender, EventArgs e)
    {
    }

    /// <summary>
    /// Handles the FinishButtonClick event of the wzdImportLeads control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.WizardNavigationEventArgs"/> instance containing the event data.</param>
    protected void wzdDeDup_FinishButtonClick(object sender, WizardNavigationEventArgs e)
    {
        frmManageDuplicates.SetMatchOptions();
    }

    /// <summary>
    /// Handles the ActiveStepChanged event of the wzdImportLeads control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void wzdDeDup_ActiveStepChanged(object sender, EventArgs e)
    {
        if (!frmSelectSource.ValidateRequiredFields())
            wzdDeDup.ActiveStepIndex = 0;
    }

    /// <summary>
    /// Sets the step.
    /// </summary>
    /// <param name="step">The step.</param>
    protected void SetStep(WizardStep step)
    {
        if (step == null) return;
        switch (step.ID)
        {
            case "cmdSelectSource":
                SetStepControls(lblStep1Name, divStep1, step, !string.IsNullOrEmpty(visitedStep1.Value));
                break;
            case "cmdManageDuplicates":
                SetStepControls(lblStep2Name, divStep2, step, !string.IsNullOrEmpty(visitedStep2.Value));
                break;
            case "cmdReview":
                SetStepControls(lblStep3Name, divStep3, step, !string.IsNullOrEmpty(visitedStep3.Value));
                break;
            case "cmdProcess":
                SetStepControls(lblStep4Name, divStep4, step, !string.IsNullOrEmpty(visitedStep4.Value));
                break;
        }
    }

    #region Private Methods

    /// <summary>
    /// Performs the select file actions.
    /// </summary>
    private void PerformSelectSourceActions()
    {
        visitedStep1.Value = "True";
        visitedStep2.Value = "True";
        frmSelectSource.SetSourceOptions();
    }
   
    /// <summary>
    /// Performs the manage duplicates actions.
    /// </summary>
    private void PerformManageDuplicatesActions()
    {
        visitedStep3.Value = "True";
        frmManageDuplicates.Job = GetJob();
        frmManageDuplicates.SetMatchOptions();
    }

    /// <summary>
    /// Previouses the manage duplicates actions.
    /// </summary>
    private void PreviousManageDuplicatesActions()
    {
        frmManageDuplicates.Job = GetJob();
        frmManageDuplicates.SetMatchOptions();
    }
   
    /// <summary>
    /// Performs the preview actions.
    /// </summary>
    private void PerformPreviewActions()
    {
        visitedStep4.Value = "True";
    }

    /// <summary>
    /// Sets the step contorls.
    /// </summary>
    /// <param name="lblStepName">Name of the LBL step.</param>
    /// <param name="divStep">The div step.</param>
    /// <param name="step">The step.</param>
    /// <param name="visited">if set to <c>true</c> [visited].</param>
    private void SetStepControls(Label lblStepName, HtmlControl divStep, WizardStep step, bool visited)
    {
        if (lblStepName != null)
        {
            lblStepName.Text = step.Title;
            if (wzdDeDup.ActiveStep.ID == step.ID)
            {
                lblStepName.CssClass = "lblWizardActive";
                lblStepName.Enabled = true;
            }
            else
            {
                if (visited)
                {
                    lblStepName.CssClass = "lblWizardVisited";
                    lblStepName.Enabled = true;
                }
                else
                {
                    lblStepName.CssClass = "lblWizardNotVisited";
                    lblStepName.Enabled = false;
                }
            }
        }

        if (divStep != null)
        {
            if (wzdDeDup.ActiveStep.ID == step.ID)
                divStep.Attributes.Add("class", "wizardActive");
            else
            {
                divStep.Attributes.Add("class", visited ? "wizardVisited" : "wizardNotVisited");
            }
        }
    }

    /// <summary>
    /// Gets the process id.
    /// </summary>
    /// <returns></returns>
    public string GetProcessId()
    {
        object processId = Page.Session["DeDupProcessId"];
        return processId != null ? processId.ToString() : string.Empty;
    }

    /// <summary>
    /// Gets the job.
    /// </summary>
    /// <returns></returns>
    public IDeDupJobProcess GetJob()
    {
        IDeDupJobProcess job = Page.Session["DeDupJob"] as IDeDupJobProcess;
        return job;
    }

    /// <summary>
    /// Sets the process id.
    /// </summary>
    /// <param name="processId">The process id.</param>
    public void SetProcessId(string processId)
    {
        Page.Session["DeDupProcessId"] = processId;
    }

    /// <summary>
    /// Sets the job.
    /// </summary>
    /// <param name="job">The job.</param>
    public void SetJob(IDeDupJobProcess job)
    {
        Page.Session["DeDupJob"] = job;
    }
    #endregion
}