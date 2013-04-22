using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Client.GroupBuilder;
using Sage.SalesLogix.Services.PotentialMatch;
using Sage.SalesLogix.Services.PotentialMatch.Configuration;

/// <summary>
/// Summary description for Lead Imports Select a File step.
/// </summary>
public partial class StepSelectSource : UserControl, ISmartPartInfoProvider
{
    private string _selectedEntitySourceName = String.Empty;

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

    IDeDupService _deDupService;
    /// <summary>
    /// Gets or sets the <see cref="IDeDupService"></see>.
    /// </summary>
    /// <value>The de dup service.</value>
    public IDeDupService DeDupService
    {
        set
        {
            _deDupService = value;
        }
        get { return _deDupService ?? (_deDupService = ApplicationContext.Current.Services.Get<IDeDupService>()); }
    }

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
        return true;
    }

    /// <summary>
    /// Holds the state of the current import processes ID.
    /// </summary>
    /// <param name="processId">The process id.</param>
    public void SetProcessIDStatex(string processId)
    {
        jobProcessId.Value = processId;
    }

    /// <summary>
    /// Gets the process ID statex.
    /// </summary>
    /// <returns></returns>
    public string GetProcessIDStatex()
    {
        return jobProcessId.Value;
    }

    /// <summary>
    /// Sets the source options.
    /// </summary>
    public void SetSourceOptions()
    {
        IDeDupJobProcess job = GetJob();
        DeDupGroupDataSource ds = new DeDupGroupDataSource(String.Empty)
        {
            GroupId = lbxAddHocGroups.SelectedValue,
            GroupName = lbxAddHocGroups.SelectedItem.Text,
            EntityType = job.EntitySourceType
        };

        job.DataSource = ds;
        Page.Session["DeDupJobInit"] = true;
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

    #region Protected Methods

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"></see> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"></see> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        LoadView();
        base.OnPreRender(e);
    }

    /// <summary>
    /// Loads the view with the defaulted data.
    /// </summary>
    protected void LoadView()
    {
        if (ddlJobs.Items.Count <= 0)
        {
            IList<DeDupJobConfig> jobs = DeDupService.Configurations.DeDupJobs;
            foreach (DeDupJobConfig job in jobs)
            {
                ddlJobs.Items.Add(new ListItem { Text = GetJobDisplayName(job), Value = job.Name });
            }
            ddlJobs.SelectedIndex = 0;
            Page.Session.Remove("DeDupJob");
        }

        IDeDupJobProcess savedJob = Page.Session["DeDupJob"] as IDeDupJobProcess;
        string selectedAdHocId = string.Empty;

        if (savedJob == null)
        {
            DeDupJobConfig jobConfig = GetConfig(ddlJobs.SelectedValue);
            _selectedEntitySourceName = jobConfig != null ? jobConfig.EntitySourceName : ddlJobs.SelectedValue;
        }
        else
        {
            _selectedEntitySourceName = savedJob.EntitySourceName;
            DeDupGroupDataSource ds = savedJob.DataSource as DeDupGroupDataSource;
            selectedAdHocId = ds.GroupId;
        }

        LoadAddHocGroups(_selectedEntitySourceName, selectedAdHocId);
    }

    private DeDupJobConfig GetConfig(string JobName)
    {
        IList<DeDupJobConfig> jobs = DeDupService.Configurations.DeDupJobs;
        return jobs.FirstOrDefault(jobConfig => String.Equals(JobName, jobConfig.Name, StringComparison.InvariantCultureIgnoreCase));
    }

    protected void ddlJobs_SelectedIndexChanged(object sender, EventArgs e)
    {
        Page.Session["DeDupJob"] = null;
    }

    #endregion

    #region Private Methods

    /// <summary>
    /// Loads the ad hoc groups.
    /// </summary>
    private void LoadAddHocGroups(string entityName, string groupId)
    {
        lbxAddHocGroups.Items.Clear();
        IList addHocGroups = GroupInfo.GetGroupList(entityName);
        foreach (GroupInfo group in addHocGroups)
        {
            ListItem item = new ListItem();
            item.Text = group.DisplayName;
            item.Value = group.GroupID;

            if (group.GroupID == groupId)
            {
                item.Selected = true;
            }
            lbxAddHocGroups.Items.Add(item);
        }
    }

    private IDeDupJobProcess GetJob()
    {
        IDeDupJobProcess job = Page.Session["DeDupJob"] as IDeDupJobProcess;
        if (job == null)
        {
            job = CreateJobInstance();
            jobProcessId.Value = job.JobId;
            job.MatchDuplicateProvider.SetTargetActive(job.EntitySourceType, true);
            Page.Session["DeDupJobInit"] = null;
            SetJob(job);
        }
        return job;
    }

    private IDeDupJobProcess CreateJobInstance()
    {
        IDeDupJobProcess job = DeDupService.CreateJobInstance(ddlJobs.SelectedItem.Value);
        job.JobDisplayName = ddlJobs.SelectedItem.Text;
        return job;
    }

    private string GetJobDisplayName(DeDupJobConfig jobConfig)
    {
        object resource = GetLocalResourceObject("Job." + jobConfig.Name);
        string displayName = resource != null ? resource.ToString() : jobConfig.DisplayName;
        return displayName;
    }
    #endregion
}