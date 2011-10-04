using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
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
using Sage.SalesLogix.Activity;
using Sage.SalesLogix.SelectionService;
using Sage.SalesLogix.Web.SelectionService;

public partial class SmartParts_TaskPane_LiteratureManagementTasks : UserControl, ISmartPartInfoProvider
{
    #region Initialize Items

    [ServiceDependency]
    public IRoleSecurityService RoleSecurityService { get; set; }

    /// <summary>
    /// Gets or sets the dialog service.
    /// </summary>
    /// <value>The dialog service.</value>
    [ServiceDependency]
    public IWebDialogService DialogService { get; set; }

    #endregion

    protected void Page_Load(object sender, EventArgs e)
    {
        ScriptManager.GetCurrent(Page).Scripts.Add(new ScriptReference("~/jscript/ShowReportUtil.js"));
        ScriptManager.GetCurrent(Page).Scripts.Add(new ScriptReference("~/SmartParts/TaskPane/LiteratureManagement/LiteratureManagementTasks.js"));
        if (!IsPostBack)
        {
            LoadLabelDropdown();
        }
    }

    protected void btnFulfill_Click(object sender, EventArgs e)
    {
        StringBuilder labelIds = new StringBuilder();
        string key = hfSelections.Value;
        ISelectionService srv = SelectionServiceRequest.GetSelectionService();
        ISelectionContext selectionContext = srv.GetSelectionContext(key);
        List<string> ids = selectionContext.GetSelectedIds();
        foreach (string id in ids)
        {
            if (hfLastFulfilledIds.Value.Contains(id))
            {
                var lit = EntityFactory.GetById<ILitRequest>(id);
                if (lit != null)
                {
                    labelIds.Append(string.Format("{0},", lit.Contact.Id));
                    lit.FulfillLitRequest();
                }
            }
        }
        if (LabelsDropdown.SelectedIndex > 0)
        {
            string sPluginId = LabelsDropdown.SelectedValue;
            if (labelIds.ToString().EndsWith(",")) labelIds = labelIds.Remove(labelIds.Length - 1, 1);
            ScriptManager.RegisterStartupScript(this, typeof(SmartParts_TaskPane_LiteratureManagementTasks), "printLabels", string.Format("PrintLabels('{0}', '{1}');", sPluginId, labelIds), true);
        }
        // this has to occur after the fulfillment is completed.  The status needs to be updated before refresh is called.
        ScriptManager.RegisterStartupScript(this, typeof(SmartParts_TaskPane_LiteratureManagementTasks), "refreshList", "RefreshList();", true);
    }

    protected void btnComplete_Click(object sender, EventArgs e)
    {
        string key = hfSelections.Value;
        bool completeAll = true;
        ISelectionService srv = SelectionServiceRequest.GetSelectionService();
        ISelectionContext selectionContext = srv.GetSelectionContext(key);
        List<string> ids = selectionContext.GetSelectedIds();
        foreach (string id in ids)
        {
            ILitRequest lit = EntityFactory.GetById<ILitRequest>(id);

            if (UserCalendar.CurrentUserCanEdit(lit.CreateUser))
                lit.CompleteLitRequest();
            else
                completeAll = false;
        }
        // this has to occur after the fulfillment is completed.  The status needs to be updated before refresh is called.
        ScriptManager.RegisterStartupScript(this, typeof(SmartParts_TaskPane_LiteratureManagementTasks), "refreshList", "RefreshList();", true);

        if (!completeAll)
            DialogService.ShowMessage(GetLocalResourceObject("Err_Complete").ToString(), 70, 400);
    }

    protected void btnReject_Click(object sender, EventArgs e)
    {
        string key = hfSelections.Value;
        bool completeAll = true;
        ISelectionService srv = SelectionServiceRequest.GetSelectionService();
        ISelectionContext selectionContext = srv.GetSelectionContext(key);
        List<string> ids = selectionContext.GetSelectedIds();
        foreach (string id in ids)
        {
            ILitRequest lit = EntityFactory.GetById<ILitRequest>(id);

            if (UserCalendar.CurrentUserCanEdit(lit.CreateUser))
                lit.RejectLitRequest();
            else
                completeAll = false;
        }
        // this has to occur after the fulfillment is completed.  The status needs to be updated before refresh is called.
        ScriptManager.RegisterStartupScript(this, typeof (SmartParts_TaskPane_LiteratureManagementTasks), "refreshList", "RefreshList();", true);

        if (!completeAll)
            DialogService.ShowMessage(GetLocalResourceObject("Err_Reject").ToString(), 70, 400);
    }

    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        return tinfo;
    }

    private void LoadLabelDropdown()
    {
        StringBuilder hql = new StringBuilder();
        hql.Append("SELECT PLUGINID, NAME, FAMILY, TYPE, USERID, CREATEDATE, LOCKED, LOCKEDID, DATA, VERSION, SYSTEM, ISPUBLIC, DESCRIPTION, DATACODE, BASEDON, ");
        hql.Append("TEMPLATE, AUTHOR, COMPANY, COMPANYVERSION, BASEDONCOMPANY, BASEDONCOMPANYVERSION, RELEASED, DEV, READONLY, INSTALLATIONDATE, ");
        hql.Append("RELEASEDDATE, DISPLAYNAME, MODIFYDATE, MODIFYUSER, CREATEUSER FROM sysdba.PLUGIN WHERE (TYPE = 19) AND (UPPER(FAMILY) = 'LABELS') AND (UPPER(DATACODE) = 'CONTACT') ");
        hql.Append("ORDER BY NAME ASC");

        using (new SparseQueryScope())
        {
            // Load up all of the adhoc groups
            IDataService _dataService = ApplicationContext.Current.Services.Get<IDataService>();

            using (var conn = _dataService.GetOpenConnection())
            {
                var adapter = new OleDbDataAdapter(hql.ToString(), conn as OleDbConnection);
                DataTable _table = new DataTable();
                adapter.Fill(_table);

                LabelsDropdown.Items.Add(new ListItem(GetLocalResourceObject("LitTask_NoLabels").ToString(), ""));
                foreach (DataRow row in _table.Rows)
                {
                    LabelsDropdown.Items.Add(new ListItem(row["NAME"].ToString(), row["PLUGINID"].ToString()));
                }
            }
        }
    }
}