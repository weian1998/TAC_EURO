using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.Application;
using Sage.Platform.WebPortal.Services;
using Sage.SalesLogix.Services.PotentialMatch;

public partial class StepManageDuplicates : UserControl
{
    #region Public Properties

    public string JobId { get; set; }

    private IDeDupJobProcess _job;
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
    /// Gets or sets an instance of the Dialog Service.
    /// </summary>
    /// <value>The dialog service.</value>
    [ServiceDependency]
    public IWebDialogService DialogService { get; set; }

    #endregion

    #region Public Methods

    /// <summary>
    /// Assigns the match filters.
    /// </summary>
    public void SetMatchOptions()
    {
        if (Job == null) return;
        if (Job.MatchDuplicateProvider != null)
        {
            foreach (ListItem item in chklstFilters.Items)
            {
                MatchPropertyFilterMap propertyFilter = Job.MatchDuplicateProvider.GetPropertyFilter(item.Value);
                if (propertyFilter.Required || (item.Selected && item.Enabled))
                {
                    Job.MatchDuplicateProvider.SetActiveFilter(item.Value, true);
                }
                else
                {
                    Job.MatchDuplicateProvider.SetActiveFilter(item.Value, false);
                }

            }

            foreach (ListItem item in chkListMatchTypes.Items)
            {
                Job.MatchDuplicateProvider.SetTargetActive(Type.GetType(item.Value), item.Selected);
            }
            Page.Session["duplicateProvider"] = Job.MatchDuplicateProvider;
        }
    }

    #endregion

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"></see> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"></see> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        base.OnPreRender(e);
        LoadView();
    }

    /// <summary>
    /// Handles the Click event of the cmdMatchOptions control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdMatchOptions_Click(object sender, EventArgs e)
    {
        if (DialogService != null)
        {
            SetMatchOptions();
            DialogService.SetSpecs(200, 200, 400, 500, "MatchOptions", "", true);
            DialogService.ShowDialog();
        }
    }

    private void LoadView()
    {
        if (Job == null) return;
        if (Job.MatchDuplicateProvider == null) return;
        if (Page.Session["DeDupJobInit"] == null)
        {
            Mode.Value = "Initialized";
            Page.Session["DeDupJobInit"] = true;
            LoadMatchType(Job, true);
            LoadFilter(Job, true);
        }
        else 
        {
            LoadMatchType(Job, false);
            LoadFilter(Job, false);
        }
    }

    private void LoadMatchType(IDeDupJobProcess job, bool initialize)
    {
        if (job.MatchDuplicateProvider == null) return;
        if ((chkListMatchTypes.Items.Count <= 0) || initialize)
        {
            chkListMatchTypes.Items.Clear();
            foreach (MatchSearchTarget target in job.MatchDuplicateProvider.GetSearchTargets())
            {
                ListItem item = new ListItem();
                //If resource does not exist then use the Xml value. Item is prefixed with "Filter" to better identify resource items
                object resource = GetLocalResourceObject("Target." + target.TargetType.Name);
                if (resource != null)
                {
                    item.Text = resource.ToString();
                }
                else
                {
                    string typeName = target.TargetType.Name;
                    // Remove the qualifying Interface prefix on the type
                    typeName = typeName.Substring(1);
                    item.Text = typeName;
                }
                item.Value = target.TargetType.AssemblyQualifiedName;
                item.Selected = target.IsActive;
                item.Enabled = true;
                chkListMatchTypes.Items.Add(item);
            }
        }
    }

    private void LoadFilter(IDeDupJobProcess job, bool initialize)
    {
        if (job.MatchDuplicateProvider == null) return;
        if ((chklstFilters.Items.Count <= 0) || initialize)
        {
            chklstFilters.Items.Clear();
            foreach (MatchPropertyFilterMap propertyFilter in job.MatchDuplicateProvider.GetFilters())
            {
                ListItem item = new ListItem();
                // If resource does not exist then use the XML value. Item is prefixed with "Filter" to better identify resource items
                object resourceValue = GetLocalResourceObject("Filter." + propertyFilter.PropertyName);
                item.Text = resourceValue != null && resourceValue.ToString() != ""
                                ? resourceValue.ToString()
                                : propertyFilter.DisplayName;

                if (propertyFilter.Required)
                {
                    // Required folders are selected and disabled by default
                    item.Value = propertyFilter.PropertyName;
                    item.Selected = true;
                    item.Enabled = false;
                }
                else
                {
                    item.Value = propertyFilter.PropertyName;
                    item.Selected = propertyFilter.Enabled;
                    item.Enabled = true;
                }
                chklstFilters.Items.Add(item);
            }
        }
        else
        {
            foreach (ListItem item in chklstFilters.Items)
            {
                MatchPropertyFilterMap propertyFilter = job.MatchDuplicateProvider.GetPropertyFilter(item.Value);
                item.Enabled = true;
                if (propertyFilter == null) continue;
                if (propertyFilter.Required)
                {
                    item.Selected = true;
                    item.Enabled = false;

                }
                else if ((!item.Enabled) || (!propertyFilter.Enabled))
                {
                    item.Selected = false;
                }
            }
        }
    }

    private IDeDupJobProcess GetJob()
    {
        return Page.Session["DeDupJob"] as IDeDupJobProcess;
    }
}