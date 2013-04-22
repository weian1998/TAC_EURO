using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using NHibernate;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using Sage.Platform.Application.UI;
using Sage.Platform.Diagnostics;
using Sage.Platform.Orm;
using Sage.Platform.Security;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.BusinessRules;
using Sage.SalesLogix.Client.GroupBuilder;
using Sage.SalesLogix.Client.Reports;
using Sage.SalesLogix.PickLists;
using Sage.SalesLogix.SelectionService;
using Sage.SalesLogix.Services;
using Sage.SalesLogix.Web.Controls;
using Sage.SalesLogix.Web.SelectionService;
using log4net;

public partial class SmartParts_TaskPane_CommonTasks_CommonTasksTasklet : UserControl, ISmartPartInfoProvider
{
    private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

    #region Initialize Items

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

    private LinkHandler _LinkHandler;
    private LinkHandler Link
    {
        get
        {
            if (_LinkHandler == null)
                _LinkHandler = new LinkHandler(Page);
            return _LinkHandler;
        }
    }

    bool _reportingEnabled;
    bool _currentIsAdHoc;
    bool _contextHasAdHoc;

    /// <summary>
    ///
    /// </summary>
    public class TaskItem
    {
        private string _id;
        private string _name;
        private string _action;
        private string _postbackFull;

        public TaskItem(string id, string name, string action, string postbackFull)
        {
            Id = id;
            Name = name;
            Action = action;
            PostbackFull = postbackFull;
        }

        /// <summary>
        /// Gets or sets the id.
        /// </summary>
        /// <value>The id.</value>
        public string Id
        {
            get { return _id; }
            set { _id = value; }
        }

        /// <summary>
        /// Gets or sets the name.
        /// </summary>
        /// <value>The name.</value>
        public string Name
        {
            get { return _name; }
            set { _name = value; }
        }

        /// <summary>
        /// Gets or sets the action.
        /// </summary>
        /// <value>The action.</value>
        public string Action
        {
            get { return _action; }
            set { _action = value; }
        }

        /// <summary>
        /// Gets or sets the postback full.
        /// </summary>
        /// <value>The postback full.</value>
        public string PostbackFull
        {
            get { return _postbackFull; }
            set { _postbackFull = value; }
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="TaskItem"/> class.
        /// </summary>
        public TaskItem()
        {
        }
    }

    #endregion

    #region Define Dictionaries

    private IDictionary<string, Array> _tasksByEntity;
    private IDictionary<string, Array> tasksByEntity
    {
        get
        {
            if (_tasksByEntity == null)
            {
                _tasksByEntity = new Dictionary<string, Array>();
            }
            return _tasksByEntity;
        }
        set { _tasksByEntity = value; }
    }

    private IDictionary<string, Array> _tasksByEntityList;
    private IDictionary<string, Array> tasksByEntityList
    {
        get
        {
            if (_tasksByEntityList == null)
            {
                _tasksByEntityList = new Dictionary<string, Array>();
            }
            return _tasksByEntityList;
        }
        set { _tasksByEntityList = value; }
    }

    private IDictionary<string, string> _tasksSecurityMap;
    private IDictionary<string, string> tasksSecurityMap
    {
        get
        {
            if (_tasksSecurityMap == null)
            {
                _tasksSecurityMap = GetTaskSecurityMap();
            }
            return _tasksSecurityMap;
        }
        set { _tasksSecurityMap = value; }
    }

    #endregion

    /// <summary>
    /// Handles the Load event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Load(object sender, EventArgs e)
    {
        tskExportToExcel.Command += tskExportToExcel_Command;
        ScriptManager.GetCurrent(Page).RegisterPostBackControl(FindControl("tskExportToExcel"));
    }

    void tskExportToExcel_Command(object sender, CommandEventArgs e)
    {
        ExportToFile();
    }

    protected override void OnPreRender(EventArgs e)
    {
        base.OnPreRender(e);

        EntityPage entityPage = Page as EntityPage;

        if (Page != null)
        {
            string entityType = EntityService.EntityType.Name;
            string displayMode = entityPage.ModeId;

            // Is reporting enabled?
            _reportingEnabled = (!string.IsNullOrEmpty(ReportingUtil.GetReportingUrl()));

            if (!_reportingEnabled)
            {
                var systemInfo = ApplicationContext.Current.Services.Get<ISystemOptionsService>();
                const int dbRemote = 2;
                if (systemInfo != null && systemInfo.DbType.Equals(dbRemote))
                {
                    var userOptions = ApplicationContext.Current.Services.Get<IUserOptionsService>(true);
                    var sUseActiveReporting = userOptions.GetCommonOption("UseActiveReporting", "Reporting");
                    if (!string.IsNullOrEmpty(sUseActiveReporting) && sUseActiveReporting.ToUpperInvariant().StartsWith("T"))
                    {
                        _reportingEnabled = true;
                    }
                }
            }

            // If the current group is an AdHoc group, then we need to display further AdHoc options.  We use GroupContext to determine this.
            DetermineAdHocStatus();

            List<TaskItem> tasks = new List<TaskItem>();
            if (displayMode == "Detail")
            {
                FillDetailPageDictionaries();
                tasks = CreateDetailViewTasks(entityType);
            }
            else
            {
                FillListViewDictionaries();
                tasks = CreateListViewTasks(entityType);
            }

            items.DataSource = tasks;
            items.DataBind();

            selectionText.Text = GetLocalResourceObject("SelectionText_DisplayCaption").ToString();
            clearText.Text = GetLocalResourceObject("ClearText_DisplayCaption").ToString();
            SAG.Update();
        }
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public virtual ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        return new ToolsSmartPartInfo();
    }

    /// <summary>
    /// Shows the response view.
    /// </summary>
    /// <param name="targetResponse">The target response.</param>
    private void ShowResponseView(ITargetResponse targetResponse)
    {
        //TODO: Can these dialog calls be placed in the Link Handler?
        if (DialogService != null)
        {
            string caption = GetLocalResourceObject("AddResponse_DialogCaption").ToString();
            DialogService.SetSpecs(200, 200, 550, 800, "AddEditTargetResponse", caption, true);
            DialogService.EntityType = typeof(ITargetResponse);
            if (targetResponse != null && targetResponse.Id != null)
                DialogService.EntityID = targetResponse.Id.ToString();
            DialogService.DialogParameters.Add("ResponseDataSource", targetResponse);
            DialogService.ShowDialog();
        }
    }

    private void ShowReplaceOwner()
    {
        if (DialogService != null)
        {
            string caption = GetLocalResourceObject("ReplaceOwner_DialogCaption").ToString();
            DialogService.SetSpecs(200, 200, 150, 650, "ReplaceOwner", caption, true);
            DialogService.ShowDialog();
        }
    }

    private List<TaskItem> CreateListViewTasks(string currentEntity)
    {
        List<TaskItem> items = new List<TaskItem>();

        int length = 0;
        if (tasksByEntityList.ContainsKey(currentEntity)) length = tasksByEntityList[currentEntity].GetLength(0);
        for (int i = 0; i < length; i++)
        {
            var taskKey = tasksByEntityList[currentEntity].GetValue(i, 0).ToString();
            //Menu display conditions based on current Group and Context
            if (taskKey == "tskRemoveFromGroup" && !_currentIsAdHoc)
            {
            }
            else if (taskKey == "tskAddToGroup" && !_contextHasAdHoc)
            {
            }
            else
            {
                // make sure the current user has access to this item's secured action
                var showItem = true;
                showItem = ShowTask(currentEntity, taskKey);
                if (showItem)
                {
                    TaskItem item = new TaskItem();
                    item.Id = taskKey;
                    item.Name = tasksByEntityList[currentEntity].GetValue(i, 1).ToString();
                    item.Action = tasksByEntityList[currentEntity].GetValue(i, 2).ToString();
                    item.PostbackFull = tasksByEntityList[currentEntity].GetValue(i, 3).ToString();
                    items.Add(item);
                }
            }
        }

        return items;
    }

    private List<TaskItem> CreateDetailViewTasks(string currentEntity)
    {
        var items = new List<TaskItem>();

        string lastUserId = string.Empty;
        IUser user = null;
        if (currentEntity == "IUser")
        {
            lastUserId = GetLastEntityId();
            user = EntityFactory.GetById<IUser>(lastUserId);
        }
        selectionDisplay.Visible = false;
        int length = 0;
        if (tasksByEntity.ContainsKey(currentEntity)) length = tasksByEntity[currentEntity].GetLength(0);
        for (int i = 0; i < length; i++)
        {
            var taskKey = tasksByEntity[currentEntity].GetValue(i, 0).ToString();
            //Menu display conditions based on current Group, Context, and UserOptions
            if (taskKey == "tskRemoveFromGroup" && !_currentIsAdHoc) { }
            // do not display
            else if (taskKey == "tskAddToGroup" && !_contextHasAdHoc) { }
            // do not display
            else if (taskKey == "tskSOEmail" && !CanShowReportOrEmail()) { }
            // do not display
            else if (taskKey == "tskDetailReport" && (!_reportingEnabled || !CanShowReportOrEmail())) { }
            //only want to add the sales order item if the accounting system does not handle sales orders)
            else if (taskKey == "tskAddSalesOrder" && (BusinessRuleHelper.AccountingSystemHandlesSO())) { }
            // do not display
            else if (lastUserId.Trim() == "ADMIN" && (taskKey == "tskCopyUser" ||
                                               taskKey == "tskCopyUserProfile" ||
                                               taskKey == "tskReplaceTeamMember")) { }
            // do not display
            else if (user != null && user.Type == UserType.Retired &&
                     (taskKey == "tskCopyUser" ||
                      taskKey == "tskCopyUserProfile" ||
                      taskKey == "tskReplaceTeamMember")) { }
            // do not display
            else if (user != null && user.Type == UserType.Template && taskKey == "tskReplaceTeamMember") { }
            // do not display
            else
            {
                // make sure the current user has access to this item's secured action
                var showItem = true;
                showItem = ShowTask(currentEntity, taskKey);
                if (showItem)
                {
                    var item = new TaskItem
                    {
                        Id = taskKey,
                        Name = tasksByEntity[currentEntity].GetValue(i, 1).ToString(),
                        Action = tasksByEntity[currentEntity].GetValue(i, 2).ToString(),
                        PostbackFull = tasksByEntity[currentEntity].GetValue(i, 3).ToString()
                    };
                    items.Add(item);
                }
            }
        }
        // remove the last separator if there is nothing after it.
        if (items.Count > 0 && items[items.Count - 1].Name == "Item_Separator")
            items.RemoveAt(items.Count - 1);

        return items;
    }

    private bool ShowTask(string entityName, string taskKey)
    {
        bool showTask = true;
        string securedActionKey;
        var key = entityName + taskKey;
        if (!tasksSecurityMap.ContainsKey(key))
        {
            key = taskKey;
        }
        if (tasksSecurityMap.TryGetValue(key, out securedActionKey))
        {
            var srv = ApplicationContext.Current.Services.Get<IRoleSecurityService>(true);
            if (srv != null)
            {
                showTask = srv.HasAccess(securedActionKey);
            }
        }

        return showTask;
    }

    private void DetermineAdHocStatus()
    {
        GroupContext groupContext = GroupContext.GetGroupContext();
        string currentGroupID = groupContext.CurrentGroupID;

        if (groupContext.CurrentGroupInfo != null)
        {
            foreach (GroupInfo gi in groupContext.CurrentGroupInfo.GroupsList)
            {
                if (gi.GroupID == currentGroupID)
                {
                    if (gi.IsAdHoc)
                    {
                        _currentIsAdHoc = true;
                    }
                }
                else
                {
                    if (gi.IsAdHoc)
                    {
                        _contextHasAdHoc = true;
                    }
                }
            }
        }
    }

    /// <summary>
    /// Creates the Click event of the Repeater control.
    /// </summary>
    protected void items_ItemDataBound(object sender, RepeaterItemEventArgs e)
    {
        if (e.Item.ItemType == ListItemType.Header)
        {
            if (((IList<TaskItem>)items.DataSource).Count == 0)
            {
                e.Item.FindControl("headerLine").Visible = false;
            }
        }
        else if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
        {
            string resourceName = ((TaskItem)e.Item.DataItem).Name;
            if (resourceName == "Item_Separator")
            {
                e.Item.Controls.Clear();
                Literal sep = new Literal();
                sep.Text = GetLocalResourceObject(resourceName).ToString();
                e.Item.Controls.Add(sep);
            }
            else
            {
                LinkButton itemsLinkButton = (LinkButton)e.Item.FindControl("Action");
                itemsLinkButton.CommandName = ((TaskItem)e.Item.DataItem).Id;
                itemsLinkButton.OnClientClick = ((TaskItem)e.Item.DataItem).Action;
                itemsLinkButton.Text = GetLocalResourceObject(resourceName).ToString();
            }

            if (((TaskItem)e.Item.DataItem).PostbackFull == "true")
            {
                ScriptManager.GetCurrent(Page).RegisterPostBackControl(e.Item.FindControl("Action"));
            }
        }
    }

    /// <summary>
    /// Handles the ItemCommand event of the items control.
    /// </summary>
    /// <param name="source">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.RepeaterCommandEventArgs"/> instance containing the event data.</param>
    protected void items_ItemCommand(object source, RepeaterCommandEventArgs e)
    {
        switch (e.CommandName)
        {
            case "tskAddResponse":
                ITargetResponse targetResponse = EntityFactory.Create<ITargetResponse>();
                ShowResponseView(targetResponse);
                break;
            case "tskReplaceUser":
            case "tskReplaceDepartment":
            case "tskReplaceTeam":
                ShowReplaceOwner();
                break;
            case "tskAddNewPickList":
                AddNewPickList();
                break;
            case "tskCopyUser":
                CopyUser();
                break;
            case "tskCopyUserProfile":
                CopyUserProfile();
                break;
            case "tskAddUserToTeam":
                AddUserToTeam();
                break;
            case "tskRemoveUserFromTeam":
                RemoveUserFromTeam();
                break;
            case "tskRemoveFromAllTeams":
                RemoveFromAllTeams();
                break;
            case "tskExportPickList":
                ExportPickList();
                break;
            case "tskDeleteTeam":
                DeleteTeam();
                break;
            case "tskDeleteDepartment":
                DeleteDepartment();
                break;
            case "tskReplaceTeamMember":
                ReplaceTeamMember();
                break;
            case "tskCopyTeam":
                CopyTeam();
                break;
            case "tskCopyDepartment":
                CopyDepartment();
                break;
        }
    }

    private void DeleteTeam()
    {
        string lastId = GetLastEntityId();

        if (!string.IsNullOrEmpty(lastId))
            Link.DeleteTeam(new List<string> { lastId });
    }

    private void DeleteDepartment()
    {
        string lastId = GetLastEntityId();

        if (!string.IsNullOrEmpty(lastId))
            Link.DeleteDepartment(new List<string> { lastId });
    }

    /// <summary>
    /// copies a user with no user interaction.  Assumes source user's profile.
    /// </summary>
    private void CopyUser()
    {
        string lastId = GetLastEntityId();

        if (!string.IsNullOrEmpty(lastId))
            Link.CopyUser(new List<string> { lastId });
    }

    private string GetLastEntityId()
    {
        return EntityService.EntityID.ToString();
    }

    private void CopyUserProfile()
    {
        string lastId = GetLastEntityId();

        if (!string.IsNullOrEmpty(lastId))
            Link.CopyUserProfile(new List<string> { lastId });
    }

    private void ReplaceTeamMember()
    {
        // string lastId = GetLastEntityId();
        Link.ReplaceTeamMember(null);
    }

    private void CopyTeam()
    {
        IEntityHistoryService ehs = ApplicationContext.Current.Services.Get<IEntityHistoryService>();
        object lastId = ehs.GetLastIdForType<ITeam>();

        if (lastId != null)
        {
            Link.CopyTeam(new List<string> { lastId.ToString() });
        }
    }

    private void CopyDepartment()
    {
        IEntityHistoryService ehs = ApplicationContext.Current.Services.Get<IEntityHistoryService>();
        object lastId = ehs.GetLastIdForType<IDepartment>();

        if (lastId != null)
        {
            Link.CopyDepartment(new List<string> { lastId.ToString() });
        }
    }

    /// <summary>
    ///
    /// </summary>
    private void RemoveUserFromTeam()
    {
        string lastId = GetLastEntityId();

        if (!string.IsNullOrEmpty(lastId))
        {
            // Link.RemoveUsersFromTeam(new List<string>() { lastId });
        }
    }

    private void RemoveFromAllTeams()
    {
        string lastId = GetLastEntityId();

        if (!string.IsNullOrEmpty(lastId))
            Link.RemoveFromAllTeams(new List<string> { lastId });
    }

    private void AddUserToTeam()
    {
        string lastId = GetLastEntityId();

        if (!string.IsNullOrEmpty(lastId))
            Link.AddToTeam(new List<string> { lastId });
    }

    private void AddNewPickList()
    {
        if (DialogService != null)
        {
            DialogService.SetSpecs(0, 0, 200, 600, "AddPickList", "", true);
            DialogService.ShowDialog();
        }
    }

    private void ExportPickList()
    {
        IEntityHistoryService ehs = ApplicationContext.Current.Services.Get<IEntityHistoryService>();
        object lastId = ehs.GetLastIdForType<IPickListView>();
        IList<string> selections = new List<string>();
        selections.Add(lastId.ToString());
        ExportPickListData(selections, "csv");
    }

    private void ExportToFile()
    {
        GroupContextService groupContextService = ApplicationContext.Current.Services.Get<IGroupContextService>() as GroupContextService;
        CachedGroup currentGroup = groupContextService.GetGroupContext().CurrentGroupInfo.CurrentGroup;
        GroupInfo gInfo = currentGroup.GroupInformation;
        gInfo.ApplyFiltersFromConfiguration();

        HttpCookie cFormat = Request.Cookies["format"];

        try
        {
            string passedArgument = hfSelections.Value;

            DataTable GroupTableAll = gInfo.GetGroupDataTable();
            using (DataTable GroupTableSelections = GroupTableAll.Copy())
            {
                IDictionary<string, Layout> layout = new Dictionary<string, Layout>();
                foreach (GroupLayoutItem gl in gInfo.GetGroupLayout().Items)
                {
                    Layout item = new Layout();
                    item.ColumnName = gl.Format.Equals("Owner") || gl.Format.Equals("User")
                                          ? gl.Alias + "NAME"
                                          : gl.Alias;
                    item.ColumnCaption = gl.Caption;
                    item.Visible = (gl.Visible ?? false) && (gl.Width != 0);

                    item.FormatType = gl.Format;
                    item.FormatString = gl.FormatString;
                    item.Width = Convert.ToInt32(gl.Width);

                    if (!layout.ContainsKey(item.ColumnName))
                    {
                        layout.Add(item.ColumnName, item);
                    }                   
                }

                if (passedArgument != "cancel")
                {
                    if (gInfo.TableName == "PICKLISTVIEW")
                    {
                        ISelectionService srv = SelectionServiceRequest.GetSelectionService();
                        ISelectionContext selectionContext = srv.GetSelectionContext(passedArgument);
                        IList<string> selections = null;
                        if (selectionContext != null)
                        {
                            selections = selectionContext.GetSelectedIds();
                        }

                        ExportPickListData(selections, cFormat.Value);

                        return;
                    }

                    if (passedArgument != "selectAll")
                    {
                        //Get the selection service and remove un selected records.
                        //the passArgument has is the selection key.
                        ISelectionService srv = SelectionServiceRequest.GetSelectionService();
                        ISelectionContext selectionContext = srv.GetSelectionContext(passedArgument);
                        RemoveUnSelectedRows(selectionContext, GroupTableSelections);
                    }
                    //remove hidden columns
                    SetLayout(GroupTableSelections, layout);
                    RemoveHiddenColumnsFromLayouts(layout);

                    if (cFormat != null)
                    {
                        switch (cFormat.Value)
                        {
                            case "csv":
                                ToCSV(GroupTableSelections, layout);
                                break;
                            case "tab":
                                ToTab(GroupTableSelections, layout);
                                break;
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            string sSlxErrorId = null;
            var sMsg = ErrorHelper.GetClientErrorHtmlMessage(ex, ref sSlxErrorId);
            if (!string.IsNullOrEmpty(sSlxErrorId))
            {
                log.Error(
                    ErrorHelper.AppendSlxErrorId(
                        "The call to SmartParts_TaskPane_CommonTasks_CommonTasksTasklet.ExportToFile() failed",
                        sSlxErrorId), ex);
            }
            DialogService.ShowHtmlMessage(sMsg, ErrorHelper.IsDevelopmentContext() ? 600 : -1,
                                          ErrorHelper.IsDevelopmentContext() ? 800 : -1);
        }
    }

    private void ExportPickListData(IList<string> selections, string format)
    {
        if (selections == null)
        {
            using (ISession session = new SessionScopeWrapper())
            {
                selections = session.QueryOver<PickList>()
                    .Where(x => x.PickListId == "PICKLISTLIST")
                    .OrderBy(x => x.Text).Asc
                    .Select(x => x.ItemId)
                    .Cacheable()
                    .List<string>();
            }
        }

        DataTable dt = new DataTable("PickLists");
        DataColumn dc = dt.Columns.Add();
        dc.ColumnName = "PickListName";
        dc.DataType = typeof(string);
        dc.AllowDBNull = true;

        dc = dt.Columns.Add();
        dc.ColumnName = "Text";
        dc.DataType = typeof(string);
        dc.AllowDBNull = true;

        dc = dt.Columns.Add();
        dc.ColumnName = "Code";
        dc.DataType = typeof(string);
        dc.AllowDBNull = true;

        dc = dt.Columns.Add();
        dc.ColumnName = "Order";
        dc.DataType = typeof(int);
        dc.AllowDBNull = true;

        dc = dt.Columns.Add();
        dc.ColumnName = "IsDefault";
        dc.DataType = typeof(bool);
        dc.AllowDBNull = true;

        dc = dt.Columns.Add();
        dc.ColumnName = "PickListId";
        dc.DataType = typeof(string);
        dc.AllowDBNull = true;

        dc = dt.Columns.Add();
        dc.ColumnName = "ItemId";
        dc.DataType = typeof(string);
        dc.AllowDBNull = true;

        IDictionary<string, Layout> layout = new Dictionary<string, Layout>();

        Layout item = new Layout();
        item = new Layout();
        item.ColumnName = "PickListName";
        item.ColumnCaption = "PickListName";
        item.Visible = true;
        item.FormatType = string.Empty;
        item.FormatString = string.Empty;
        item.Width = 64;
        layout.Add(item.ColumnName, item);

        item = new Layout();
        item.ColumnName = "Text";
        item.ColumnCaption = "Text";
        item.Visible = true;
        item.FormatType = string.Empty;
        item.FormatString = string.Empty;
        item.Width = 64;
        layout.Add(item.ColumnName, item);

        item = new Layout();
        item.ColumnName = "Code";
        item.ColumnCaption = "Code";
        item.Visible = true;
        item.FormatType = string.Empty;
        item.FormatString = string.Empty;
        item.Width = 64;
        layout.Add(item.ColumnName, item);

        item = new Layout();
        item.ColumnName = "Order";
        item.ColumnCaption = "Order";
        item.Visible = true;
        item.FormatType = string.Empty;
        item.FormatString = string.Empty;
        item.Width = 64;
        layout.Add(item.ColumnName, item);

        item = new Layout();
        item.ColumnName = "IsDefault";
        item.ColumnCaption = "IsDefault";
        item.Visible = true;
        item.FormatType = string.Empty;
        item.FormatString = string.Empty;
        item.Width = 64;
        layout.Add(item.ColumnName, item);

        item = new Layout();
        item.ColumnName = "PickListId";
        item.ColumnCaption = "PickListId";
        item.Visible = true;
        item.FormatType = string.Empty;
        item.FormatString = string.Empty;
        item.Width = 64;
        layout.Add(item.ColumnName, item);

        item = new Layout();
        item.ColumnName = "ItemId";
        item.ColumnCaption = "ItemId";
        item.Visible = true;
        item.FormatType = string.Empty;
        item.FormatString = string.Empty;
        item.Width = 64;
        layout.Add(item.ColumnName, item);

        foreach (string pickListId in selections)
        {
            PickList pl = PickList.GetPickListById(pickListId);
            if (pl != null)
            {
                PickList defaultItem = PickList.GetDefaultItem(pickListId);
                IList<PickList> Items = PickList.GetPickListItems(pickListId, false);
                if ((items != null) || (Items.Count > 0))
                {
                    foreach (PickList pitem in Items)
                    {
                        DataRow row = dt.NewRow();
                        row["PickListId"] = pickListId;
                        row["ItemId"] = pitem.ItemId;
                        row["PickListName"] = pl.Text;
                        row["Text"] = pitem.Text;
                        row["Code"] = pitem.Shorttext;
                        row["Order"] = pitem.Id;
                        if ((defaultItem != null) && (defaultItem.ItemId == pitem.ItemId))
                        {
                            row["IsDefault"] = true;
                        }
                        else
                        {
                            row["IsDefault"] = false;
                        }
                        dt.Rows.Add(row);
                    }
                }
                else
                {
                    DataRow row = dt.NewRow();
                    row["PickListId"] = pickListId;
                    row["ItemId"] = "NOITEMS";
                    row["PickListName"] = pl.Text;
                    row["Text"] = "";
                    row["Code"] = "";
                    row["Order"] = -1;
                    row["IsDefault"] = false;
                    dt.Rows.Add(row);
                }
            }
        }

        switch (format)
        {
            case "csv":
                ToCSV(dt, layout);
                break;
            case "tab":
                ToTab(dt, layout);
                break;
        }
    }

    private void SetLayout(DataTable dataTable, IDictionary<string, Layout> layouts)
    {
        for (int i = dataTable.Columns.Count - 1; i >= 0; i--)
        {
            DataColumn col = dataTable.Columns[i];
            Layout layout;
            layouts.TryGetValue(col.ColumnName, out layout);
            if (layout != null)
            {
                if (layout.Visible)
                {                   
                    col.Caption = layout.ColumnCaption;
                }
                else
                {
                    dataTable.Columns.Remove(col);
                }
            }
            else
            {
                dataTable.Columns.Remove(col);
            }
        }

        dataTable.AcceptChanges();        
    }

    private static void RemoveHiddenColumnsFromLayouts(IDictionary<string, Layout> layouts)
    {
        var hidden = (from layout in layouts.Values where layout.Visible == false select layout.ColumnName).ToList();

        foreach (var hiddenLayout in hidden)
        {
            Layout layout;
            if (layouts.TryGetValue(hiddenLayout, out layout))
            {
                layouts.Remove(hiddenLayout);
            }
        }
    }

    private static void RemoveUnSelectedRows(ISelectionContext selectionContext, DataTable table)
    {
        if (selectionContext == null || selectionContext.SelectionInfo.Mode == "selectAll")
            return;

        // Clean up the table to include only our client side selections
        bool keep;

        IList<string> selections = selectionContext.GetSelectedIds();

        int i = 1;
        foreach (DataRow row in table.Rows)
        {
            keep = false;
            foreach (string id in selections)
            {
                if (row[0].ToString() == id)
                {
                    keep = true;
                    continue;
                }
            }
            if (!keep)
            {
                row.Delete();
            }
            i++;
        }
        table.AcceptChanges();
    }

    private void ToTab(DataTable table, IDictionary<string, Layout> layout)
    {
        Response.Clear();
        Response.Cache.SetMaxAge(TimeSpan.Zero);
        Response.Cache.SetRevalidation(HttpCacheRevalidation.AllCaches);
        Response.AppendHeader("Content-Disposition",
                              String.Format("attachment;filename={0:yyyyMMddhhmmss}{1}.csv",
                              DateTime.Now,
                              Server.UrlEncode(GetLocalResourceObject("ExportToFile_FileName").ToString())));
        Response.ContentType = "application/csv";
        Response.ContentEncoding = Encoding.UTF8;
        Response.Flush();
        using (StreamWriter writer = new StreamWriter(Response.OutputStream, Encoding.UTF8))
        {
            WriteTabFormat(table, writer, layout);
            writer.Flush();
            Response.Flush();
        }
        Response.End();
    }

    private void ToCSV(DataTable table, IDictionary<string, Layout> layout)
    {
        Response.Clear();
        Response.Cache.SetMaxAge(TimeSpan.Zero);
        Response.Cache.SetRevalidation(HttpCacheRevalidation.AllCaches);
        Response.AppendHeader("Content-Disposition",
                              String.Format("attachment;filename={0:yyyyMMddhhmmss}{1}.csv",
                              DateTime.Now,
                              Server.UrlEncode(GetLocalResourceObject("ExportToFile_FileName").ToString())));
        Response.ContentType = "application/csv";
        Response.ContentEncoding = Encoding.UTF8;
        Response.Flush();
        using (StreamWriter writer = new StreamWriter(Response.OutputStream, Encoding.UTF8))
        {
            WriteCsvFormat(table, writer, layout);
            writer.Flush();
            Response.Flush();
        }
        Response.End();
    }

    private string EncodeTabValue(string value)
    {
        if (String.IsNullOrEmpty(value))
            return String.Empty;
        return value.Replace("\t", " ").Replace("\r\n", " ").Replace("\n", " ");
    }

    private string EncodeCsvValue(string value)
    {
        const string DOUBLE_QUOTE = "\"";
        const string PAIRED_DOUBLE_QUOTE = DOUBLE_QUOTE + DOUBLE_QUOTE;

        /* Always surround the value with double quotes and double up any existing double quotes. */

        if (string.IsNullOrEmpty(value))
            return PAIRED_DOUBLE_QUOTE;
        value = string.Concat(DOUBLE_QUOTE, value.Replace(DOUBLE_QUOTE, PAIRED_DOUBLE_QUOTE), DOUBLE_QUOTE);

        return value;
    }

    private void WriteTabFormat(DataTable table, TextWriter writer, IDictionary<string, Layout> layouts)
    {
        if (table.Columns.Count == 0) return;

        bool added = false;

        foreach (Layout layout in layouts.Values)
        {
            DataColumn col = table.Columns[layout.ColumnName];
            if (col == null)
            {
                continue;
            }
            if (added) writer.Write("\t");

            added = true;

            writer.Write(EncodeTabValue(layout.ColumnCaption));
        }

        writer.WriteLine();

        foreach (DataRow row in table.Rows)
        {
            added = false;
            foreach (Layout layout in layouts.Values)
            {
                if (added) writer.Write("\t");
                {
                    added = true;
                }

                DataColumn col = table.Columns[layout.ColumnName];
                if (col == null)
                {
                    continue;
                }
                string value = string.Empty;
                if (!row.IsNull(col))
                {
                    value = row[col].ToString();
                    writer.Write(EncodeCsvValue(FormatValue(value, layout)));
                }
            }
            writer.WriteLine();
        }
    }

    private void WriteCsvFormat(DataTable table, TextWriter writer, IDictionary<string, Layout> layouts)
    {
        if (table.Columns.Count != 0)
        {
            string delimiter = Thread.CurrentThread.CurrentCulture.TextInfo.ListSeparator;
            bool first = true;
            foreach (Layout layout in layouts.Values)
            {
                DataColumn col = table.Columns[layout.ColumnName];
                if (col == null)
                {
                    continue;
                }
                if (!first)
                {
                    writer.Write(delimiter);
                }
                writer.Write(EncodeCsvValue(layout.ColumnCaption));
                first = false;
            }

            writer.WriteLine();

            foreach (DataRow row in table.Rows)
            {
                first = true;
                foreach (Layout layout in layouts.Values)
                {
                    if (!first)
                    {
                        writer.Write(delimiter);
                    }

                    DataColumn col = table.Columns[layout.ColumnName];
                    if (col == null)
                    {
                        continue;
                    }
                    string value = string.Empty;
                    if (!row.IsNull(col))
                    {
                        value = row[col].ToString();
                        writer.Write(EncodeCsvValue(FormatValue(value, layout)));
                    }
                    first = false;
                }
                writer.WriteLine();
            }
        }
    }

    private string FormatValue(string value, Layout layout)
    {
        if (layout.FormatType.ToUpper() == "PHONE")
        {
            return Phone.FormatPhoneNumber(value);
        }
        if (layout.FormatType.ToUpper() == "BOOLEAN")
        {
            return FormatBooleanValue(value, layout);
        }
        return value;
    }

    private string FormatBooleanValue(string value, Layout layout)
    {
        if (string.IsNullOrEmpty(value))
        {
            return value;
        }
        string boolValue = (value.ToUpper() == "T") || (value.ToUpper() == "Y") || (value.ToUpper() == "1") ||
                           (value.ToUpper() == "+")
                               ? (string.IsNullOrEmpty(layout.FormatString)
                                      ? (GetLocalResourceObject("ExportToFile_BoolenYes") != null
                                             ? GetLocalResourceObject("ExportToFile_BoolenYes").ToString()
                                             : "Yes")
                                      : layout.FormatString.Split('/')[0])
                               : (string.IsNullOrEmpty(layout.FormatString)
                                      ? (GetLocalResourceObject("ExportToFile_BoolenNo") != null
                                             ? GetLocalResourceObject("ExportToFile_BoolenNo").ToString()
                                             : "No")
                                      : layout.FormatString.Split('/')[1]);
        return boolValue;
    }

    private bool CanShowReportOrEmail()
    {
        if (IsSalesOrder() && BusinessRuleHelper.IsIntegrationContractEnabled())
        {
            ISalesOrder salesOrder = CurrentSalesOrder();
            // Check if the Sales Order has been submitted.
            if (salesOrder != null &&
                salesOrder.GlobalSyncId.HasValue &&
                (salesOrder.ERPSalesOrder != null) &&
                (!string.IsNullOrEmpty(salesOrder.ERPSalesOrder.ERPStatus)))
            {
                // Yes, the Sales Order has been submitted.
                return true;
            }
            return false;
        }
        return true;
    }

    private ISalesOrder CurrentSalesOrder()
    {
        EntityPage page = Page as EntityPage;
        if (page != null && page.EntityContext != null)
        {
            if (page.EntityContext.EntityType.Equals(typeof(ISalesOrder)))
            {
                return EntityFactory.GetRepository<ISalesOrder>().Get(page.EntityContext.EntityID);
            }
        }
        return null;
    }

    private bool IsSalesOrder()
    {
        EntityPage page = Page as EntityPage;
        if (page != null && page.EntityContext != null)
        {
            return page.EntityContext.EntityType.Equals(typeof(ISalesOrder));
        }
        return false;
    }

    #region Fill Dictionaries

    private void FillListViewDictionaries()
    {
        string[,] accountListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:Sage.Utility.Dashboard.promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IAccount", accountListTasks);

        string[,] contactListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:Sage.Utility.Dashboard.promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" },
             {"tskWriteEmailToGroupSelection", "TaskText_WriteEmailToGroupSelection", "javascript:commonTaskActions.writeEmailToGroupSelection();", "false" }
            };
        tasksByEntityList.Add("IContact", contactListTasks);

        string[,] activitiesListTasks = { { "Mail Merge", "mailMerge" } };
        tasksByEntityList.Add("Activities", activitiesListTasks);

        string[,] opportunitiesListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:Sage.Utility.Dashboard.promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IOpportunity", opportunitiesListTasks);

        string[,] leadsListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:Sage.Utility.Dashboard.promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false"},
             {"tskWriteEmailToGroupSelection", "TaskText_WriteEmailToGroupSelection", "javascript:commonTaskActions.writeEmailToGroupSelection();", "false" }
            };
        tasksByEntityList.Add("ILead", leadsListTasks);

        string[,] campaignsListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:Sage.Utility.Dashboard.promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("ICampaign", campaignsListTasks);

        string[,] ticketsListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:Sage.Utility.Dashboard.promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("ITicket", ticketsListTasks);

        string[,] defectsListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdocList(event);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:Sage.Utility.Dashboard.promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IDefect", defectsListTasks);

        string[,] returnsListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:Sage.Utility.Dashboard.promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IReturn", returnsListTasks);

        string[,] contractsTasksList =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:Sage.Utility.Dashboard.promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IContract", contractsTasksList);

        string[,] salesOrderListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:Sage.Utility.Dashboard.promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("ISalesOrder", salesOrderListTasks);

        string[,] codePickListTasksLists = { { "tskAddNewPickList", "TaskText_AddNewPickList", "", "false" } };
        tasksByEntityList.Add("IDBCodePickList", codePickListTasksLists);

        string[,] userListTasks =
            {
                {"tskAddToTeam", "AddToTeamCaption", "javascript:commonTaskActions.prepareSelectedRecords(commonTaskActions.addToTeam); return false;", "false" },
                {"tskRemoveFromAllTeams", "RemoveFromAllTeamsCaption",
                    string.Format("javascript:if(confirm('{0}')) commonTaskActions.prepareSelectedRecords(commonTaskActions.removeFromAllTeams); return false;",
                    PortalUtil.JavaScriptEncode(GetLocalResourceObject("ConfirmRemoveFromAllTeamsMsg").ToString())), "false" },
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IUser", userListTasks);

        string[,] teamListTasks =
            {
                {"tskAddToTeam", "AddToTeamCaption", "javascript:commonTaskActions.prepareSelectedRecords(commonTaskActions.addToTeam); return false;", "false" },
                {"tskRemoveFromAllTeams", "RemoveFromAllTeamsCaption",
                    string.Format("javascript:if(confirm('{0}')) commonTaskActions.prepareSelectedRecords(commonTaskActions.removeFromAllTeams); return false;",
                    PortalUtil.JavaScriptEncode(GetLocalResourceObject("ConfirmRemoveFromAllTeamsMsg").ToString())), "false" },
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("ITeam", teamListTasks);

        string[,] departmentListTasks =
            {

                {"tskAddToTeam", "AddToTeamCaption", "javascript:commonTaskActions.prepareSelectedRecords(commonTaskActions.addToTeam); return false;", "false" },
                {"tskRemoveFromAllTeams", "RemoveFromAllTeamsCaption",
                    string.Format("javascript:if(confirm('{0}')) commonTaskActions.prepareSelectedRecords(commonTaskActions.removeFromAllTeams); return false;",
                    PortalUtil.JavaScriptEncode(GetLocalResourceObject("ConfirmRemoveFromAllTeamsMsg").ToString())), "false" },
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IDepartment", departmentListTasks);

        string[,] productListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IProduct", productListTasks);

        string[,] packageListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IPackage", packageListTasks);

        string[,] competitorListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("ICompetitor", competitorListTasks);

        string[,] leadsourceListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("ILeadSource", leadsourceListTasks);

        string[,] pickListTasks =
            {
                {"tskAddNewPickList", "TaskPickList_AddPickList", "", "false"},
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IPickListView", pickListTasks);
        string[,] roleListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IRole", roleListTasks);

        string[,] litItemListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("ILiteratureItem", litItemListTasks);

        string[,] litRequestListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("ILitRequest", litRequestListTasks);

        string[,] Resources =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IResourceList", Resources);

        string[,] Qualifications =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("IQualificationCategory", Qualifications);

        string[,] SecuredActions =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("ISecuredAction", SecuredActions);

        string[,] StandardProblems =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("ITicketProblemType", StandardProblems);

        string[,] StandardResolutions =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:commonTaskActions.saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:commonTaskActions.exportToExcel();", "false" }
            };
        tasksByEntityList.Add("ITicketSolutionType", StandardResolutions);
    }

    private void FillDetailPageDictionaries()
    {
        string[,] accountDetailTasks =
            {{"tskDetailReport","TaskText_DetailReport","javascript:commonTaskActions.showDetailReport();","false"},
             {"tskEmail","TaskText_Email","javascript:commonTaskActions.emailSend();","false"},
            {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"},
             {"tskAddResponse","TaskText_ResponseToCampaign","","false"},
             {"tskInsertNote","TaskText_AddNote","javascript:Sage.Link.newNote();","false"},
             {"tskNewMeeting","TaskText_Meeting","javascript:Sage.Link.scheduleActivity('Meeting');","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","javascript:Sage.Link.scheduleActivity('PhoneCall');","false"},
             {"tskNewToDo","TaskText_ToDo","javascript:Sage.Link.scheduleActivity('ToDo');","false"}};
        tasksByEntity.Add("IAccount", accountDetailTasks);

        string[,] contactDetailTasks =
            {{"tskDetailReport","TaskText_DetailReport","javascript:commonTaskActions.showDetailReport();","false"},
             {"tskEmail","TaskText_Email","javascript:commonTaskActions.emailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"},
             {"tskAddResponse","TaskText_ResponseToCampaign","","false"},
             {"tskInsertNote","TaskText_AddNote","javascript:Sage.Link.newNote();","false"},
             {"tskNewMeeting","TaskText_Meeting","javascript:Sage.Link.scheduleActivity('Meeting');","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","javascript:Sage.Link.scheduleActivity('PhoneCall');","false"},
             {"tskNewToDo","TaskText_ToDo","javascript:Sage.Link.scheduleActivity('ToDo');","false"}};
        tasksByEntity.Add("IContact", contactDetailTasks);

        string[,] opportunityDetailTasks =
            {{"tskDetailReport","TaskText_DetailReport","javascript:commonTaskActions.showDetailReport();","false"},
             {"tskEmail","TaskText_Email","javascript:commonTaskActions.emailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"},
             {"tskInsertNote","TaskText_AddNote","javascript:Sage.Link.newNote();","false"},
             {"tskNewMeeting","TaskText_Meeting","javascript:Sage.Link.scheduleActivity('Meeting');","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","javascript:Sage.Link.scheduleActivity('PhoneCall');","false"},
             {"tskNewToDo","TaskText_ToDo","javascript:Sage.Link.scheduleActivity('ToDo');","false"},
             {"tskAddSalesOrder","TaskText_SalesOrder","javascript:window.location='InsertSalesOrder.aspx?modeid=Insert&opp=yes';","false"}};
        tasksByEntity.Add("IOpportunity", opportunityDetailTasks);

        string[,] activityDetailTasks =
            {{"tskEmail","TaskText_Email","email","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskNewMeeting","TaskText_Meeting","","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","","false"},
             {"tskNewToDo","TaskText_ToDo","","false"}};
        tasksByEntity.Add("IActivty", activityDetailTasks);

        string[,] leadDetailTasks =
            {{"tskEmail","TaskText_Email","javascript:commonTaskActions.emailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"},
             {"tskInsertNote","TaskText_AddNote","javascript:Sage.Link.newNote();","false"},
             {"tskNewMeeting","TaskText_Meeting","javascript:Sage.Link.scheduleActivity('Meeting');","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","javascript:Sage.Link.scheduleActivity('PhoneCall');","false"},
             {"tskNewToDo","TaskText_ToDo","javascript:Sage.Link.scheduleActivity('ToDo');","false"}};
        tasksByEntity.Add("ILead", leadDetailTasks);

        string[,] campaignDetailTasks =
            {{"tskEmail","TaskText_Email","javascript:commonTaskActions.emailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"},
      {"tskInsertNote","TaskText_AddNote","javascript:Sage.Link.newNote();","false"},
             {"tskNewMeeting","TaskText_Meeting","javascript:Sage.Link.scheduleActivity('Meeting');","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","javascript:Sage.Link.scheduleActivity('PhoneCall');","false"},
             {"tskNewToDo","TaskText_ToDo","javascript:Sage.Link.scheduleActivity('ToDo');","false"}};
        tasksByEntity.Add("ICampaign", campaignDetailTasks);

        string[,] ticketDetailTasks =
            {{"tskDetailReport","TaskText_DetailReport","javascript:commonTaskActions.showDetailReport();","false"},
             {"tskEmail","TaskText_Email","javascript:commonTaskActions.emailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"},
      {"tskInsertNote","TaskText_AddNote","javascript:Sage.Link.newNote();","false"},
             {"tskNewMeeting","TaskText_Meeting","javascript:Sage.Link.scheduleActivity('Meeting');","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","javascript:Sage.Link.scheduleActivity('PhoneCall');","false"},
             {"tskNewToDo","TaskText_ToDo","javascript:Sage.Link.scheduleActivity('ToDo');","false"}};
        tasksByEntity.Add("ITicket", ticketDetailTasks);

        string[,] defectDetailTasks =
            {{"tskDetailReport","TaskText_DetailReport","javascript:commonTaskActions.showDetailReport();","false"},
             {"tskEmail","TaskText_Email","javascript:commonTaskActions.emailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"},
             {"tskInsertNote","TaskText_AddNote","javascript:Sage.Link.newNote();","false"},
             {"tskNewMeeting","TaskText_Meeting","javascript:Sage.Link.scheduleActivity('Meeting');","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","javascript:Sage.Link.scheduleActivity('PhoneCall');","false"},
             {"tskNewToDo","TaskText_ToDo","javascript:Sage.Link.scheduleActivity('ToDo');","false"}};
        tasksByEntity.Add("IDefect", defectDetailTasks);

        string[,] returnDetailTasks =
            {{"tskEmail","TaskText_Email","javascript:commonTaskActions.emailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"},
      {"tskInsertNote","TaskText_AddNote","javascript:Sage.Link.newNote();","false"},
             {"tskNewMeeting","TaskText_Meeting","javascript:Sage.Link.scheduleActivity('Meeting');","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","javascript:Sage.Link.scheduleActivity('PhoneCall');","false"},
             {"tskNewToDo","TaskText_ToDo","javascript:Sage.Link.scheduleActivity('ToDo');","false"}};
        tasksByEntity.Add("IReturn", returnDetailTasks);

        string[,] contractDetailTasks =
            {{"tskEmail","TaskText_Email","javascript:commonTaskActions.emailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"},
             {"tskInsertNote","TaskText_AddNote","javascript:Sage.Link.newNote();","false"},
             {"tskNewMeeting","TaskText_Meeting","javascript:Sage.Link.scheduleActivity('Meeting');","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","javascript:Sage.Link.scheduleActivity('PhoneCall');","false"},
             {"tskNewToDo","TaskText_ToDo","javascript:Sage.Link.scheduleActivity('ToDo');","false"}};
        tasksByEntity.Add("IContract", contractDetailTasks);

        string[,] salesOrderDetailTasks =
            {{"tskDetailReport","TaskText_DetailReport","javascript:commonTaskActions.showDetailReport();","false"},
             {"tskSOEmail","TaskText_Email","javascript:commonTaskActions.emailSend();","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"},
             {"tskInsertNote","TaskText_AddNote","javascript:Sage.Link.newNote();","false"},
             {"tskNewMeeting","TaskText_Meeting","javascript:Sage.Link.scheduleActivity('Meeting');","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","javascript:Sage.Link.scheduleActivity('PhoneCall');","false"},
             {"tskNewToDo","TaskText_ToDo","javascript:Sage.Link.scheduleActivity('ToDo');","false"}};
        tasksByEntity.Add("ISalesOrder", salesOrderDetailTasks);

        string[,] codePickListTasks = { { "tskAddNewPickList", "TaskText_AddNewPickList", "", "false" } };
        tasksByEntity.Add("IDBCodePickList", codePickListTasks);

        string[,] userDetailTasks =
            {
                {"tskCopyUser", "CopyUserCaption", "", "false" },
                {"tskCopyUserProfile", "CopyProfileCaption", "", "false" },
                {"tskReplaceTeamMember", "ReplaceOnAllTeamsCaption", "", "false" },
                //AdHoc group Management
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"}
            };
        tasksByEntity.Add("IUser", userDetailTasks);

        string[,] teamDetailTasks =
            {
                {"tskCopyTeam", "CopyTeamCaption",
                    string.Format("javascript:if(!confirm('{0}')) return false; else __doPostBack('{1}','');",
                    PortalUtil.JavaScriptEncode( GetLocalResourceObject("ConfirmCopyTeamMessage").ToString()), UniqueID + "$ctl01$Action"), "false" },
                {"tskReplaceTeamMember", "ReplaceOnAllTeamsCaption", "", "false" },
                //AdHoc group Management
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"}
            };
        tasksByEntity.Add("ITeam", teamDetailTasks);

        string[,] departmentDetailTasks =
            {
                {"tskCopyDepartment", "CopyDepartmentCaption",
                    string.Format("javascript:if(!confirm('{0}')) return false; else __doPostBack('{1}','');",
                    PortalUtil.JavaScriptEncode(GetLocalResourceObject("ConfirmCopyDepartmentMessage").ToString()), UniqueID + "$ctl01$Action"), "false" },
                {"tskReplaceTeamMember", "ReplaceOnAllTeamsCaption", "", "false" },
                //AdHoc group Management
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"}
            };
        tasksByEntity.Add("IDepartment", departmentDetailTasks);

        string[,] roleDetailTasks =
            {
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"}
            };
        tasksByEntity.Add("IRole", roleDetailTasks);

        string[,] competitorDetailTasks =
            {
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"}
            };
        tasksByEntity.Add("ICompetitor", competitorDetailTasks);

        string[,] leadSourceDetailTasks =
            {
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"}
            };
        tasksByEntity.Add("ILeadSource", leadSourceDetailTasks);

        string[,] productDetailTasks =
            {
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"}
            };
        tasksByEntity.Add("IProduct", productDetailTasks);

        string[,] packageDetailTasks =
            {
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"}
            };
        tasksByEntity.Add("IPackage", packageDetailTasks);

        string[,] litItemDetailTasks =
            {
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"}
            };
        tasksByEntity.Add("ILiteratureItem", litItemDetailTasks);

        string[,] pickListDetailTasks =
            {
                {"tskAddNewPickList", "TaskPickList_AddPickList", "", "false"},
                //AdHoc group Management
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"}
            };
        tasksByEntity.Add("IPickListView", pickListDetailTasks);

        string[,] litRequestDetailTasks =
            {
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:commonTaskActions.showAdHocList(event);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:commonTaskActions.removeCurrentFromGroup();","false"}
            };
        tasksByEntity.Add("ILitRequest", litRequestDetailTasks);
    }

    private IDictionary<string, string> GetTaskSecurityMap()
    {
        //To-Do break out according to Entity;
        IDictionary<string, string> maps = new Dictionary<string, string>();
        maps.Add("tskExportToExcel", "Entities/Group/ExportToFile");
        maps.Add("tskAddSalesOrder", "Entities/SalesOrder/Add");
        maps.Add("tskAddResponse", "Entities/Campaign/Edit");
        //maps.Add("tskAddToGroup", "Entities/Group/AddToGroup");
        //maps.Add("tskRemoveFromGroup", "Entities/Group/RemoveFromGroup");
        //maps.Add("tskSaveAsNewGroup", "Entities/Group/SaveAsNew");
        //maps.Add("tskPromote", "Entities/Group/Promote");
        //maps.Add("tskEmail", "Entities/Group/Email");
        //maps.Add("tskWriteEmailToGroupSelection", "Entities/Group/Email");
        //maps.Add("tskMailMerge", "Entities/Group/MailMerge");
        //maps.Add("IAccounttskDetailReport", "Entities/Account/Report");
        //maps.Add("IContacttskDetailReport", "Entities/Contact/Report");
        //maps.Add("IOpportunitytskDetailReport", "Entities/Opportunity/Report");
        //maps.Add("ITickettskDetailReport", "Entities/Ticket/Report");
        //maps.Add("IDefecttskDetailReport", "Entities/Defect/Report");
        //maps.Add("ISalesOrdertskDetailReport", "Entities/SalesOrder/Report");
        return maps;
    }

    #endregion

    internal class Layout
    {
        public string ColumnName;
        private string _caption = string.Empty;

        public string ColumnCaption
        {
            get
            {
                if (string.IsNullOrEmpty(_caption))
                {
                    return ColumnName;
                }
                return _caption;
            }
            set { _caption = value; }
        }

        public string FormatType;
        public string FormatString;
        public bool Visible;
        public int Width;
    }
}