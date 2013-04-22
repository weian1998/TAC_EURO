using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Threading;
using Telerik.Web.UI;
using log4net;
using Sage.Platform.Application;
using Sage.Platform.WebPortal.Services;
using System.Text;
using Sage.SalesLogix.Services.PotentialMatch;
using Sage.Platform.Application.UI.Web.Threading;
using Sage.Platform.Orm;

public partial class StepProcessRequest : UserControl
{
    static readonly ILog log = LogManager.GetLogger(System.Reflection.MethodInfo.GetCurrentMethod().DeclaringType);
    private IDeDupJobProcess _job;
    private IDeDupService _deDupService;

    #region Public Properties

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

    /// <summary>
    /// Gets or sets the de dup service.
    /// </summary>
    /// <value>The de dup service.</value>
    public IDeDupService DeDupService
    {
        get { return _deDupService ?? (_deDupService = ApplicationContext.Current.Services.Get<IDeDupService>()); }
        set { _deDupService = value; }
    }

    /// <summary>
    /// Gets or sets an instance of the Dialog Service.
    /// </summary>
    /// <value>The dialog service.</value>
    [ServiceDependency]
    public IWebDialogService DialogService { get; set; }

    #endregion

    #region Public Methods

    /// <summary>
    /// Starts the import process inside its own thread.
    /// </summary>
    /// <param name="args">The args.</param>
    public void StartJobProcess(Object args)
    {
        string jobId = GetJobId();
        IDeDupJobProcess job = DeDupService.GetJob(jobId);
        if (job != null)
        {
            SetStartProcessInfo();
            try
            {
                SetStartProcessInfo();
                AddJob(job);
                job.OnProgressEvent += JobProgressHandler;
                job.Start();
                SetCompleteProcessInfo();
            }
            catch
            {
            }
            finally 
            {
                SetCompleteProcessInfo();
                RemoveJob(job);
                object objShutDown = Page.Session["SessionShutDown"];
                if (Convert.ToBoolean(objShutDown))
                {
                    if (CanShutDown())
                    {
                        ApplicationContext.Shutdown();
                        Page.Session.Abandon();
                    }
                }
            
            }
                  
        }
    }
    
    #endregion

    #region Private Methods

    private void AddJob(IDeDupJobProcess job)
    {
        IDictionary<string, string> jobs = Page.Session["DeDupJobs"] as Dictionary<string, string> ??
                                           new Dictionary<string, string>();
        if (!jobs.ContainsKey(job.JobId))
        {
            jobs.Add(job.JobId, job.JobName);
        }
        Page.Session["DeDupJobs"] = jobs;
    }

    private void RemoveJob(IDeDupJobProcess job)
    {
        IDictionary<string, string> jobs = Page.Session["DeDupJobs"] as Dictionary<string, string>;
        if (jobs != null)
        {
            jobs.Remove(job.JobId);
        }
        Page.Session["DeDupJobs"] = jobs;
    }

    private bool CanShutDown()
    {
        IDictionary<string, string> jobs = Page.Session["DeDupJobs"] as Dictionary<string, string>;
        return jobs != null && jobs.Count == 0;
    }


    /// <summary>
    /// Handles the Init event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Init(object sender, EventArgs e)
    {
        InitRegisterClientScripts();
    }

    /// <summary>
    /// Inits the register client scripts.
    /// </summary>
    protected void InitRegisterClientScripts()
    {
        string script = GetLocalResourceObject("DeDupProgress_ClientScript").ToString();
        StringBuilder sb = new StringBuilder(script);
        sb.Replace("@cmdCloseCtrlId", cmdCompleted.ClientID);
        ScriptManager.RegisterStartupScript(Page, GetType(), "DeDupProgress_ClientScript", sb.ToString(), false);
    }

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"/> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"/> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        LoadView();
        base.OnPreRender(e);
    }

    private void LoadView()
    {
        if (Job != null)
        {
            if (String.IsNullOrEmpty(Job.JobId))
            {
                using (new SessionScopeWrapper(true))
                {
                    IDeDupJobProcess job = GetJob();
                    if (job != null)
                    {
                        if (string.IsNullOrEmpty(job.JobId))
                        {
                            IDeDupService srv = ApplicationContext.Current.Services.Get<IDeDupService>();
                            string jobId = srv.SubmitJob(job);
                            Page.Session["DeDupJobId"] = jobId;
                        }
                        ThreadPoolHelper.QueueTask(StartJobProcess);
                    }
                }
            }
            try
            {
                lnkJobNumber.Text = String.Format("{0}", Job.ProgressInfo.JobNumber);
                switch (Job.ProcessState)
                {
                    case DeDupJobProcessState.Aborted:
                        break;
                    case DeDupJobProcessState.Completed:
                        {
                            cmdAbort.Visible = false;
                            lblHeader.Text = String.Format(GetLocalResourceObject("CompletedMsg").ToString());
                            Page.Session["DeDupJob"] = null;
                            RadProgressContext jobProgress = RadProgressContext.Current;
                            jobProgress["ProcessCompleted"] = "True";
                            jobProgress["OperationComplete"] = "True";
                        }
                        break;
                    default:
                        cmdAbort.Visible = true;
                        lblHeader.Text = String.Format(GetLocalResourceObject("lblPrimary_Progress.Caption").ToString());
                        lblHeader2.Text = String.Format(GetLocalResourceObject("ProcessingMsg").ToString());
                        break;
                }
            }
            catch (Exception)
            {
            }
        }
        else
        {
            RadProgressContext jobProgress = RadProgressContext.Current;
            jobProgress["OperationComplete"] = "True";
            GoToDeDupManager();
        }
    }

    /// <summary>
    /// Handles the OnClick event of the cmdCompleted control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdCompleted_OnClick(object sender, EventArgs e)
    {
        SetCompleteProcessInfo();
    }

    /// <summary>
    /// Handles the OnClick event of the lnkImportNumber control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void lnkJobNumber_OnClick(object sender, EventArgs e)
    {
        GoToDeDupManager();
    }
   
    protected void GoToDeDupManager()
    {
        Thread.Sleep(1000);
        object jobId = Page.Session["DeDupJobId"];
        if (jobId != null)
        {
            Response.Redirect(string.Format("~/DeDupJob.aspx?entityId={0}", jobId));
        }
    }

    /// <summary>
    /// Gets the arguments from the handler to set the progress indicator.
    /// </summary>
    /// <param name="args">The args.</param>
    private void JobProgressHandler(DeDupJobEventArgs args)
    {
        RadProgressContext jobProgress = RadProgressContext.Current;
        string percent;
        try
        {
            percent = Convert.ToString(args.Job.ProgressInfo.Percent);
        }
        catch (Exception)
        {
            percent = "0";
        }
        if (args.Job != null && args.Job.ProgressInfo.ProcessedCount < 2)
        {
            Page.Session["DeDupJobId"] = args.Job.JobId;
        }

        object processingMessageFormat = GetLocalResourceObject("processingMessage") ??
                                         "Processing record {0} of {1} - ({2}%)";

        jobProgress["PrimaryValue"] = String.Format((string) processingMessageFormat,
                                                    args.Job.ProgressInfo.ProcessedCount,
                                                    args.Job.ProgressInfo.RecordCount, percent);
        jobProgress["SecondaryTotal"] = args.Job.ProgressInfo.DuplicateCount.ToString();
        if (args.Job.ProgressInfo.ErrorCount <= 0)
        {
            jobProgress["ProcessCompleted"] = "False";
        }
    }

    /// <summary>
    /// Sets the complete process info.
    /// </summary>
    private void SetCompleteProcessInfo()
    {
        Page.Session["ProcessRunning"] = null;
        RadProgressContext jobProgress = RadProgressContext.Current;
        jobProgress["ProcessCompleted"] = "True";
    }

    /// <summary>
    /// Sets the start process info.
    /// </summary>
    private void SetStartProcessInfo()
    {
        Page.Session["ProcessRunning"] = true;
        RadProgressContext jobProgress = RadProgressContext.Current;
        jobProgress["PrimaryValue"] = "0";
        jobProgress["SecondaryValue"] = "0";
        jobProgress["SecondaryTotal"] = "0";
        jobProgress["ProcessCompleted"] = "False";
    }

    /// <summary>
    /// Handles the OnClick event of the cmdAbort control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdAbort_OnClick(object sender, EventArgs e)
    {
        string jobId = GetJobId();
        DeDupService.AbortJob(jobId);
        Page.Session["DeDupJob"] = null;

        RadProgressContext jobProgress = RadProgressContext.Current;
        jobProgress["OperationComplete"] = "True";
        GoToDeDupManager();
    }
    
    private IDeDupJobProcess GetJob()
    {
        IDeDupJobProcess job = Page.Session["DeDupJob"] as IDeDupJobProcess;
        return job;
    }

    private string GetJobId()
    {
        object jobId = Page.Session["DeDupJobId"];
        return jobId.ToString();
    }

    #endregion
}