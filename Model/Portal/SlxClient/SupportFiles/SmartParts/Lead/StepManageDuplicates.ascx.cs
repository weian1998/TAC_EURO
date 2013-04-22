using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Collections.Generic;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.UI.Web;
using Sage.Platform.Application.UI.Web.Threading;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.Services;
using Sage.Entity.Interfaces;
using Sage.SalesLogix.Services.Import;
using Sage.SalesLogix.Services.PotentialMatch;
using Sage.Platform.Orm;

public partial class StepManageDuplicates : UserControl
{
    #region Public Properties

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

    #region Public Methods

    /// <summary>
    /// Assigns the match filters.
    /// </summary>
    public void AssignMatchFilters()
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager == null) return;
        if (Mode.Value == "")
        {
            Mode.Value = "Initialized";
            chkFindDupsInFile.Checked = importManager.Configuration.AdvancedOptions.IndexAfterInsert;
        }
        else 
        {
            importManager.Configuration.AdvancedOptions.IndexAfterInsert = chkFindDupsInFile.Checked;            
        }
            
        if (importManager.DuplicateProvider == null)
            importManager.DuplicateProvider = new LeadDuplicateProvider();
        LeadDuplicateProvider duplicateProvider = (LeadDuplicateProvider) importManager.DuplicateProvider;

        foreach (ListItem item in chklstFilters.Items)
        {
            if ((item.Selected) && (item.Enabled))
            {
                duplicateProvider.SetActiveFilter(item.Value, true);
            }
            else
            {
                duplicateProvider.SetActiveFilter(item.Value, false);
            }
        }
        duplicateProvider.AdvancedOptions.AutoMerge = chkAutoMergeDups.Checked;
        duplicateProvider.SearchAccount = false;
        duplicateProvider.SearchContact = chkContacts.Checked;
        duplicateProvider.SearchLead = chkLeads.Checked;

        importManager.MergeProvider.RecordOverwrite = lbxConflicts.SelectedIndex == 0 ? MergeOverwrite.targetWins : MergeOverwrite.sourceWins;
        importManager.DuplicateProvider = duplicateProvider;
        importManager.Options.CheckForDuplicates = chkCheckForDups.Checked;
           
        Page.Session["importManager"] = importManager;
    }

    #endregion

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"></see> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"></see> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        cmdRunTest.Attributes.Add("onclick", String.Format("javascript: importLeadsWizard.showTestImportProcess('{0}')", cmdStartTestProcess.ClientID));
        InitializeView();
    }

    private void InitializeView()
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager == null) return;
        importManager.Options.CheckForDuplicates = chkCheckForDups.Checked;
        if (Mode.Value == "")
        {
            Mode.Value = "Initialized";
            chkFindDupsInFile.Checked = importManager.Configuration.AdvancedOptions.IndexAfterInsert;
        }
        else
        {
            importManager.Configuration.AdvancedOptions.IndexAfterInsert = chkFindDupsInFile.Checked;
        }

        if (chklstFilters.Items.Count <= 0)
        {
            if (importManager.DuplicateProvider == null)
                importManager.DuplicateProvider = new LeadDuplicateProvider();
            LeadDuplicateProvider duplicateProvider = (LeadDuplicateProvider)importManager.DuplicateProvider;
            foreach (MatchPropertyFilterMap propertyFilter in duplicateProvider.GetFilters())
            {
                ListItem item = new ListItem();
                //If resource does not exist then use the xml value. Item is prefixed with "Filter" to better identify resource items
                item.Text = GetLocalResourceObject("Filter." + propertyFilter.PropertyName) != null &&
                            GetLocalResourceObject("Filter." + propertyFilter.PropertyName).ToString() != ""
                                ? GetLocalResourceObject("Filter." + propertyFilter.PropertyName).ToString()
                                : propertyFilter.DisplayName;

                item.Value = propertyFilter.PropertyName;
                item.Selected = propertyFilter.Enabled;
                item.Enabled = IsFilterMapped(importManager, propertyFilter.PropertyName);
                chklstFilters.Items.Add(item);
            }
        }
        else
        {
            LeadDuplicateProvider duplicateProvider = (LeadDuplicateProvider)importManager.DuplicateProvider;
            if (duplicateProvider != null)
            {
                foreach (ListItem item in chklstFilters.Items)
                {
                    item.Enabled = IsFilterMapped(importManager, item.Value);
                    MatchPropertyFilterMap propertyFilter = duplicateProvider.GetPropertyFilter(item.Value);
                    if (propertyFilter != null && ((!item.Enabled) || (!propertyFilter.Enabled)))
                    {
                        item.Selected = false;
                    }
                }
            }
            else
            {
                foreach (ListItem item in chklstFilters.Items)
                {
                    item.Enabled = false;
                }
            }
        }
    }

    /// <summary>
    /// Determines whether a match filter is mapped.
    /// </summary>
    /// <param name="importManager">The import manager.</param>
    /// <param name="matchFilter">The match filter.</param>
    /// <returns>
    /// 	<c>true</c> if [is filter mapped] [the specified import manager]; otherwise, <c>false</c>.
    /// </returns>
    private Boolean IsFilterMapped(ImportManager importManager, string matchFilter)
    {
        IList<ImportMap> importMaps = importManager.ImportMaps;
        return importMaps.Any(map => matchFilter.Equals(map.TargetProperty.PropertyId));
    }

    /// <summary>
    /// Handles the Click event of the cmdMatchOptions control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdMatchOptions_Click(object sender, EventArgs e)
    {
        AssignMatchFilters();
        DialogService.SetSpecs(200, 200, 410, 500, "MatchOptions", "", true);
        DialogService.DialogParameters.Add("IsImportWizard", true);
        DialogService.EntityType = typeof (ILead);
        DialogService.ShowDialog();
    }

    /// <summary>
    /// Handles the Click event of the cmdRunTest control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdRunTest_Click(object sender, EventArgs e)
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager == null) return;
        AssignMatchFilters();
        using (new SessionScopeWrapper(true))
        {
            ThreadPoolHelper.QueueTask(StartTestImport);
        }
    }

    /// <summary>
    /// Handles the Click event of the cmdAssignImportHistory control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdAssignImportHistory_Click(object sender, EventArgs e)
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager == null) return;
        WebPortalPage portalPage = Page as WebPortalPage;
        if (portalPage != null)
        {
            IImportHistory importHistory = EntityFactory.Create<IImportHistory>();
            importHistory.Status = GetLocalResourceObject("importStatus_Processing").ToString();
            importHistory.ProcessedCount = 0;
            importHistory.Save();
            importManager.ImportHistory = importHistory;
            portalPage.ClientContextService.CurrentContext.Remove("ImportHistoryId");
            portalPage.ClientContextService.CurrentContext.Add("ImportHistoryId", importHistory.Id.ToString());
        }
    }

    /// <summary>
    /// Starts the test import process.
    /// </summary>
    private void StartTestImport(Object args)
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        importManager.StartImportTest(100);
    }
}