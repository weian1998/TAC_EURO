using System;
using System.Collections.Generic;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.Data;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.SelectionService;
using Sage.SalesLogix.Web.SelectionService;

// ReSharper disable CheckNamespace
// ReSharper disable InconsistentNaming
public partial class SmartParts_TaskPane_LiteratureManagementTasks : UserControl, ISmartPartInfoProvider
// ReSharper restore InconsistentNaming
// ReSharper restore CheckNamespace
{
    private static readonly log4net.ILog Log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

    #region Initialize Items

    // ReSharper disable UnusedMember.Global
    // ReSharper disable MemberCanBePrivate.Global
    // ReSharper disable UnusedAutoPropertyAccessor.Global

    [ServiceDependency]
    public IRoleSecurityService RoleSecurityService { get; set; }

    /// <summary>
    /// Gets or sets the dialog service.
    /// </summary>
    /// <value>The dialog service.</value>
    [ServiceDependency]
    public IWebDialogService DialogService { get; set; }

    /// <summary>
    /// Gets or sets the entity service.
    /// </summary>
    /// <value>The entity service.</value>
    [ServiceDependency]
    public IEntityContextService EntityService { get; set; }

    // ReSharper restore UnusedMember.Global
    // ReSharper restore UnusedAutoPropertyAccessor.Global
    // ReSharper restore MemberCanBePrivate.Global

    #endregion

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            LoadLabelDropdown();
        }
    }

    protected void btnFulfill_Click(object sender, EventArgs e)
    {
        var oEntityIds = new StringBuilder();
        IEnumerable<string> ids = GetSelectedIds();
        if (ids == null) return;
        foreach (string id in ids)
        {
            if (hfLastFulfilledIds.Value.Contains(id))
            {
                var lit = EntityFactory.GetById<ILitRequest>(id);
                if (lit != null)
                {
                    oEntityIds.AppendFormat("{0},", lit.Contact.Id);
                    lit.FulfillLitRequest();
                }
            }
        }
        var sEntityIds = oEntityIds.ToString().TrimEnd(',');
        if (!string.IsNullOrEmpty(sEntityIds) && LabelsDropdown.SelectedIndex > 0)
        {
            string sReportPluginId = LabelsDropdown.SelectedValue;
            if (!string.IsNullOrEmpty(sReportPluginId))
            {
                ScriptManager.RegisterClientScriptBlock(SAG, GetType(), "printLabels",
                                                        string.Format(
                                                            "literatureManagementActions.printLabels('{0}', '{1}');",
                                                            sReportPluginId, sEntityIds), true);
            }
            else
            {
                Log.Warn("The report plugin Id was invalid in the call to btnFulfill_Click().");
            }
        }

        // this has to occur after the fulfillment is completed.  The status needs to be updated before refresh is called.
        ScriptManager.RegisterClientScriptBlock(SAG, GetType(), "refreshList",
                                                "literatureManagementActions.refreshList();", true);
    }

    protected void btnComplete_Click(object sender, EventArgs e)
    {
        bool completeAll = true;
        IEnumerable<string> ids = GetSelectedIds();
        if (ids == null) return;
        foreach (string id in ids)
        {
            try
            {                
                var lit = EntityFactory.GetById<ILitRequest>(id);
                if (lit == null)
                {
                    completeAll = false;
                    continue;
                }
                lit.CompleteLitRequest();
            }
            catch (Exception exception)
            {
                Log.Error("Exception completing literature request.", exception); //DNL
                completeAll = false;
            }
        }
        // this has to occur after the fulfillment is completed.  The status needs to be updated before refresh is called.
        ScriptManager.RegisterClientScriptBlock(SAG, GetType(), "refreshList",
                                                "literatureManagementActions.refreshList();", true);

        if (!completeAll)
        {
            ShowMessage("Err_Complete");
        }
    }

    protected void btnReject_Click(object sender, EventArgs e)
    {
        bool completeAll = true;
        IEnumerable<string> ids = GetSelectedIds();
        if (ids == null) return;
        foreach (string id in ids)
        {
            try
            {
                var lit = EntityFactory.GetById<ILitRequest>(id);
                if (lit == null)
                {
                    completeAll = false;
                    continue;                    
                }
                lit.RejectLitRequest();
            }
            catch (Exception exception)
            {
                Log.Error("Exception rejecting literature request.", exception); //DNL
                completeAll = false;
            }
        }

        // this has to occur after the fulfillment is completed.  The status needs to be updated before refresh is called.
        ScriptManager.RegisterClientScriptBlock(SAG, GetType(), "refreshList",
                                                "literatureManagementActions.refreshList();", true);
        if (!completeAll)
        {
            ShowMessage("Err_Reject");
        }
    }

    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        var tinfo = new ToolsSmartPartInfo();
        return tinfo;
    }

    private IEnumerable<string> GetSelectedIds()
    {
        ISelectionService oSelectionService = SelectionServiceRequest.GetSelectionService();
        if (oSelectionService == null)
        {
            ShowMessage("Err_SelectionService");
            return null;
        }
        ISelectionContext oSelectionContext = oSelectionService.GetSelectionContext(hfSelections.Value);
        if (oSelectionContext == null)
        {
            ShowMessage("Err_SelectionContext");
            return null;
        }
        var ids = oSelectionContext.GetSelectedIds();
        if (ids.Count == 0)
        {
            ShowMessage("Err_Selection");
            return null;
        }
        return ids;
    }

    private void ShowMessage(string resourceKey)
    {
        var localResourceObject = GetLocalResourceObject(resourceKey);
        if (localResourceObject != null)
        {
            DialogService.ShowMessage(localResourceObject.ToString());
        }
    }

    private void LoadLabelDropdown()
    {
        using (new SparseQueryScope())
        {
            // Load up all of the adhoc groups
            var oDataService = ApplicationContext.Current.Services.Get<IDataService>();
            using (var conn = oDataService.GetOpenConnection())
            using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText = "SELECT PLUGINID, NAME " +
                                  "FROM PLUGIN " +
                                  "WHERE TYPE = 19 AND UPPER(FAMILY) = 'LABELS' AND UPPER(DATACODE) = 'CONTACT' " +
                                  "ORDER BY NAME ASC";
                using (var reader = cmd.ExecuteReader())
                {
                    var localResourceObject = GetLocalResourceObject("LitTask_NoLabels");
                    if (localResourceObject != null)
                        LabelsDropdown.Items.Add(new ListItem(localResourceObject.ToString(), ""));
                    while (reader.Read())
                    {
                        LabelsDropdown.Items.Add(new ListItem(reader[1].ToString(), reader[0].ToString()));
                    }
                }
            }
        }
    }

    protected void LabelsDropdown_SelectedIndexChanged(object sender, EventArgs e)
    {
    }
}