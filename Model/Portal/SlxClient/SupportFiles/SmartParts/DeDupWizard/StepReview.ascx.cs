using System;
using System.Web.UI;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.Application;
using log4net;
using Sage.SalesLogix.Services.PotentialMatch;

public partial class StepReview : UserControl
{
    static readonly ILog log = LogManager.GetLogger(System.Reflection.MethodInfo.GetCurrentMethod().DeclaringType);

    #region Public Methods

    /// <summary>
    /// Gets or sets an instance of the Dialog Service.
    /// </summary>
    /// <value>The dialog service.</value>
    [ServiceDependency]
    public IWebDialogService DialogService { get; set; }

    private IDeDupJobProcess _job;
    /// <summary>
    /// Gets or sets the job id.
    /// </summary>
    /// <value>The job id.</value>
    public string JobId { get; set; }

    /// <summary>
    /// Gets or sets the job.
    /// </summary>
    /// <value>The job.</value>
    public IDeDupJobProcess Job
    {
        get { return _job ?? (_job = GetJob()); }
        set { _job = value; }
    }
   
    #endregion

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"></see> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"></see> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        LoadView();
    }

    private void LoadView()
    {
        if (Job != null)
        {
            lblJobNameValue.Text = Job.JobDisplayName;
            lblEntitySourceValue.Text = GetEntityDisplayName(Job);
            lblGroupValue.Text = Job.DataSource.ToString();
        }
    }

    private IDeDupJobProcess GetJob()
    {
        IDeDupJobProcess job = Page.Session["DeDupJob"] as IDeDupJobProcess;
        return job;
    }

    private string GetEntityDisplayName(IDeDupJobProcess job)
    {
        object resource = GetLocalResourceObject("EntitySourceName." + job.EntitySourceName);
        string displayName = job.EntitySourceName;
        if (resource != null)
        {
            displayName = resource.ToString();
        }
        return displayName;
    }
}