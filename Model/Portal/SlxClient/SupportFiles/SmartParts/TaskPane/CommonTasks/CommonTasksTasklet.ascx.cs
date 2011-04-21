using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.Services;
using Sage.SalesLogix.Client.GroupBuilder;
using Sage.SalesLogix.Client.Reports;
using Sage.SalesLogix.Security;
using Sage.SalesLogix.Web.SelectionService;
using Sage.SalesLogix.SelectionService;
using Sage.SalesLogix.PickLists;
using NHibernate;
using Sage.Platform.Orm;
using Sage.Platform.Security;

public partial class SmartParts_TaskPane_CommonTasks_CommonTasksTasklet : UserControl, ISmartPartInfoProvider
{
	#region Initialize Items

	private IRoleSecurityService _roleSecurityService;

	[ServiceDependency]
	public IRoleSecurityService RoleSecurityService
	{
		get { return _roleSecurityService; }
		set { _roleSecurityService = value; }
	}
	private IWebDialogService _WebDialogService;
	/// <summary>
	/// Gets or sets the dialog service.
	/// </summary>
	/// <value>The dialog service.</value>
	[ServiceDependency]
	public IWebDialogService DialogService
	{
		get { return _WebDialogService; }
		set { _WebDialogService = value; }
	}

	private IEntityContextService _entityService;
	/// <summary>
	/// Gets or sets the entity service.
	/// </summary>
	/// <value>The entity service.</value>
	[ServiceDependency]
	public IEntityContextService EntityService
	{
		get { return _entityService; }
		set { _entityService = value; }
	}

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

	bool _reportingEnabled = false;
	bool _currentIsAdHoc = false;
	bool _contextHasAdHoc = false;

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
		{ }
	}
	#endregion

	#region Define Dictionaries
	//IDictionary<string, Array> tasksByEntity= new Dictionary<string, Array>();
	private IDictionary<string, Array> _tasksByEntity;
	private IDictionary<string, Array> tasksByEntity
	{
		get
		{
			if (_tasksByEntity == null)
			{ _tasksByEntity = new Dictionary<string, Array>(); }
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
			{ _tasksByEntityList = new Dictionary<string, Array>(); }
			return _tasksByEntityList;
		}
		set { _tasksByEntityList = value; }
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
		if (!IsPostBack)
		{
			GroupContext groupContext = GroupContext.GetGroupContext();
			if ((groupContext != null) && (groupContext.CurrentGroupInfo != null))
				divLeadAssignOwner.Visible = (groupContext.CurrentGroupInfo.TableName.ToUpper().Equals("LEAD"));
		}
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
			string entityType = EntityService.EntityType.Name.ToString();
			string displayMode = entityPage.ModeId.ToString();

			// Is reporting enabled?
			_reportingEnabled = (!string.IsNullOrEmpty(ReportingUtil.GetReportingUrl()));

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
		Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo tinfo = new Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo();
		return tinfo;
	}
	/// <summary>
	/// Shows the response view.
	/// </summary>
	/// <param name="targetResponse">The target response.</param>
	private void ShowResponseView(ITargetResponse targetResponse)
	{
		//TODO: Can these dilaog calls be placed in the Link Handler?
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
			//Menu display conditions based on current Group and Context  
			if (tasksByEntityList[currentEntity].GetValue(i, 0).ToString() == "tskRemoveFromGroup" && !_currentIsAdHoc)
			{ }
			else if (tasksByEntityList[currentEntity].GetValue(i, 0).ToString() == "tskAddToGroup" && !_contextHasAdHoc)
			{ }
			else
			{
				// make sure the current user has access to this item's secured action
				bool showItem = true;
				if (tasksByEntityList[currentEntity].GetLength(1) == 5 && !string.IsNullOrEmpty(tasksByEntityList[currentEntity].GetValue(i, 4).ToString()) && !HasAccess(tasksByEntityList[currentEntity].GetValue(i, 4).ToString()))
					showItem = false;

				if (showItem)
				{
					TaskItem item = new TaskItem();
					item.Id = tasksByEntityList[currentEntity].GetValue(i, 0).ToString();
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
		List<TaskItem> items = new List<TaskItem>();

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
			//Menu display conditions based on current Group, Context, and UserOptions
			if (tasksByEntity[currentEntity].GetValue(i, 0).ToString() == "tskRemoveFromGroup" && !_currentIsAdHoc) { }
			// do not display
			else if (tasksByEntity[currentEntity].GetValue(i, 0).ToString() == "tskAddToGroup" && !_contextHasAdHoc) { }
			// do not display
			else if (tasksByEntity[currentEntity].GetValue(i, 0).ToString() == "tskDetailReport" && !_reportingEnabled) { }
			// do not display
			else if (lastUserId == "ADMIN" && (tasksByEntity[currentEntity].GetValue(i, 0).ToString() == "tskCopyUser" ||
											   tasksByEntity[currentEntity].GetValue(i, 0).ToString() == "tskCopyUserProfile" ||
											   tasksByEntity[currentEntity].GetValue(i, 0).ToString() == "tskReplaceTeamMember")) { }
			// do not display
			else if (user != null && user.Type == UserType.Retired &&
					 (tasksByEntity[currentEntity].GetValue(i, 0).ToString() == "tskCopyUser" ||
					  tasksByEntity[currentEntity].GetValue(i, 0).ToString() == "tskCopyUserProfile" ||
					  tasksByEntity[currentEntity].GetValue(i, 0).ToString() == "tskReplaceTeamMember")) { }
			// do not display
			else if (user != null && user.Type == UserType.Template && tasksByEntity[currentEntity].GetValue(i, 0).ToString() == "tskReplaceTeamMember") { }
			// do not display
			else
			{
				// make sure the current user has access to this item's secured action
				bool showItem = true;
				if (tasksByEntity[currentEntity].GetLength(1) == 5 && !string.IsNullOrEmpty(tasksByEntity[currentEntity].GetValue(i, 4).ToString()) && !HasAccess(tasksByEntity[currentEntity].GetValue(i, 4).ToString()))
					showItem = false;

				if (showItem)
				{
					TaskItem item = new TaskItem();
					item.Id = tasksByEntity[currentEntity].GetValue(i, 0).ToString();
					item.Name = tasksByEntity[currentEntity].GetValue(i, 1).ToString();
					item.Action = tasksByEntity[currentEntity].GetValue(i, 2).ToString();
					item.PostbackFull = tasksByEntity[currentEntity].GetValue(i, 3).ToString();
					items.Add(item);
				}
			}
		}
		// remove the last separator if there is nothing after it.
		if (items.Count > 0 && items[items.Count - 1].Name == "Item_Separator")
			items.RemoveAt(items.Count - 1);

		return items;
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
                    if ((gi.IsAdHoc) ?? false)
                    { _currentIsAdHoc = true; }
                }
                if ((gi.IsAdHoc) ?? false)
                { _contextHasAdHoc = true; }
                break;
            }
        }
	}

	private bool HasAccess(string appliedSecurity)
	{
		bool result = false;
		if (!string.IsNullOrEmpty(appliedSecurity) && RoleSecurityService != null)
			result = RoleSecurityService.HasAccess(appliedSecurity);

		return result;
	}
	private Dictionary<string, string> ParseAttributes(string attributes)
	{
		Dictionary<string, string> attributeList = new Dictionary<string, string>();

		return attributeList;
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
			case "tskInsertNote":
				Link.NewNote();
				break;
			case "tskNewMeeting":
				Link.ScheduleMeeting();
				break;
			case "tskNewPhoneCall":
				Link.SchedulePhoneCall();
				break;
			case "tskNewToDo":
				Link.ScheduleToDo();
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
			Link.DeleteTeam(new List<string>() { lastId });
	}

	private void DeleteDepartment()
	{
		string lastId = GetLastEntityId();

		if (!string.IsNullOrEmpty(lastId))
			Link.DeleteDepartment(new List<string>() { lastId });
	}

	/// <summary>
	/// copies a user with no user interaction.  Assumes source user's profile.
	/// </summary>
	private void CopyUser()
	{
		string lastId = GetLastEntityId();

		if (!string.IsNullOrEmpty(lastId))
			Link.CopyUser(new List<string>() { lastId });
	}

	private string GetLastEntityId()
	{
        return _entityService.EntityID.ToString();
	}

	private void CopyUserProfile()
	{
		string lastId = GetLastEntityId();

		if (!string.IsNullOrEmpty(lastId))
			Link.CopyUserProfile(new List<string>() { lastId });
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
			Link.CopyTeam(new List<string>() { lastId.ToString() });
		}
	}

	private void CopyDepartment()
	{

		IEntityHistoryService ehs = ApplicationContext.Current.Services.Get<IEntityHistoryService>();
		object lastId = ehs.GetLastIdForType<IDepartment>();

		if (lastId != null)
		{
			Link.CopyDepartment(new List<string>() { lastId.ToString() });
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
			Link.RemoveFromAllTeams(new List<string>() { lastId });
	}

	private void AddUserToTeam()
	{
		string lastId = GetLastEntityId();

		if (!string.IsNullOrEmpty(lastId))
			Link.AddToTeam(new List<string>() { lastId });
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
					if (gl.Format.Equals("Owner") || gl.Format.Equals("User"))
					{
						item.ColumnName = gl.Alias + "NAME";
					}
					else
					{
						item.ColumnName = gl.Alias;
					}

					item.ColumnCaption = gl.Caption;

					if ((gl.Visible == "T") && (gl.Width != "0"))
					{
						item.Visible = true;
					}
					else
					{
						item.Visible = false;
					}

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

					if (passedArgument == "selectAll")
					{

					}
					else
					{
						//Get the selection service and remove un selected records.
						//the passArgument has is the selection key.
						ISelectionService srv = SelectionServiceRequest.GetSelectionService();
						ISelectionContext selectionContext = srv.GetSelectionContext(passedArgument);

						RemoveUnSelectedRows(selectionContext, GroupTableSelections);
					}
					//remove hidden columns
					SetLayout(GroupTableSelections, layout);

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
			DialogService.ShowMessage(ex.Message);
		}
	}

	private void ExportPickListData(IList<string> selections, string format)
	{
		if (selections == null)
		{
			using (ISession session = new SessionScopeWrapper())
			{
				IQuery query = session.CreateQuery("select P.ItemId from PickList P where P.PickListId = :id order by P.Text");
				query
					.SetAnsiString("id", "PICKLISTLIST")
					.SetCacheable(true);
				selections = query.List<string>();
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

	private void SetLayout(DataTable dataTable, IDictionary<string, Layout> layout)
	{

		for (int i = dataTable.Columns.Count - 1; i >= 0; i--)
		{
			DataColumn col = dataTable.Columns[i];
			Layout item = null;
			layout.TryGetValue(col.ColumnName, out item);
			if (item != null)
			{
				if (item.Visible)
				{
					col.Caption = item.ColumnCaption;
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

	private static void RemoveUnSelectedRows(ISelectionContext selectionContext, DataTable table)
	{
		if (selectionContext == null)
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
			{ row.Delete(); }
			i++;
		}
		table.AcceptChanges();
	}

	private void RemoveUnSelectedRowsById(string selections, DataTable table)
	{
		// Clean up the table to include only our client side selections
		bool keep;
		string[] arraySelections = selections.Split(',');

		foreach (DataRow row in table.Rows)
		{
			keep = false;
			foreach (string sel in arraySelections)
			{
				string[] s = sel.Split(':');
				if (row[0].ToString() == s[1])
				{ keep = true; }
			}
			if (!keep)
			{ row.Delete(); }
		}
		table.AcceptChanges();
	}

	private void RemoveUnSelectedRowsByNumber(string selections, DataTable table)
	{
		// Clean up the table to include only our client side selections
		bool keep;
		string[] arraySelections = selections.Split(',');

		int i = 1;
		foreach (DataRow row in table.Rows)
		{
			keep = false;
			foreach (string sel in arraySelections)
			{
				string[] s = sel.Split(':');
				if (i.ToString() == s[0])
				{
					keep = true;
					continue;
				}
			}
			if (!keep)
			{ row.Delete(); }
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
							  String.Format("attachment;filename={0:yyyyMMddhhmmss}_slx_exported_selections.csv",
							  DateTime.Now));
		Response.ContentType = "application/csv";
		Response.ContentEncoding = Encoding.Unicode;
		Response.Flush();
		using (StreamWriter writer = new StreamWriter(Response.OutputStream, Encoding.Unicode))
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
							  String.Format("attachment;filename={0:yyyyMMddhhmmss}_slx_exported_selections.csv",
							  DateTime.Now));
		Response.ContentType = "application/csv";
		Response.ContentEncoding = Encoding.GetEncoding(1252);
		Response.Flush();
		using (StreamWriter writer = new StreamWriter(Response.OutputStream, Encoding.GetEncoding(1252)))
		{
			WriteCsvFormat(table, writer, layout);
			writer.Flush();
			Response.Flush();
		}
		Response.End();
	}

	protected int GetSelectionCount()
	{
		int count = 0;
		ISelectionService ss = SelectionServiceRequest.GetSelectionService(); //ApplicationContext.Current.Services.Get<Sage.SalesLogix.SelectionService.ISelectionService>();
		if (ss != null)
		{
			ISelectionContext sc = ss.GetSelectionContext("Test");
			if (sc != null)
			{
				return sc.GetSelectionCount();
			}
		}
		return count;
	}

	private static string EncodeTabValue(string value)
	{
		if (String.IsNullOrEmpty(value))
			return String.Empty;
		return value.Replace("\t", " ").Replace("\r\n", "").Replace("\n", "");
	}

	private static string EncodeCsvValue(string value)
	{
		const string DOUBLE_QUOTE = "\"";
		const string PAIRED_DOUBLE_QUOTE = DOUBLE_QUOTE + DOUBLE_QUOTE;

		/* Always surround the value with double quotes and double up any existing double quotes. */

		if (string.IsNullOrEmpty(value))
			return PAIRED_DOUBLE_QUOTE;
		value = string.Concat(DOUBLE_QUOTE, value.Replace(DOUBLE_QUOTE, PAIRED_DOUBLE_QUOTE), DOUBLE_QUOTE);

		return value;
	}

	private static void WriteTabFormat(DataTable table, TextWriter writer, IDictionary<string, Layout> layouts)
	{
		if (table.Columns.Count == 0) return;

		bool added = false;
		foreach (DataColumn column in table.Columns)
		{
			if (added) writer.Write("\t");

			added = true;

			writer.Write(EncodeTabValue(column.Caption));
		}

		writer.WriteLine();

		foreach (DataRow row in table.Rows)
		{
			added = false;
			foreach (DataColumn column in table.Columns)
			{
				if (added) writer.Write("\t");

				added = true;

				if (row.IsNull(column))
					continue;

				Layout layout = null;
				layouts.TryGetValue(column.ColumnName, out layout);
				if (layout != null)
				{
					writer.Write(EncodeCsvValue(FormatValue(row[column].ToString(), layout)));
				}
				else
				{
					writer.Write(EncodeCsvValue(row[column].ToString()));
				}
			}
			writer.WriteLine();
		}
	}

	private static void WriteCsvFormat(DataTable table, System.IO.TextWriter writer, IDictionary<string, Layout> layouts)
	{
		if (table.Columns.Count != 0)
		{
			string delimiter = System.Threading.Thread.CurrentThread.CurrentCulture.TextInfo.ListSeparator;
			bool first = true;
			foreach (DataColumn col in table.Columns)
			{
				if (!first)
					writer.Write(delimiter);

				writer.Write(EncodeCsvValue(col.Caption));
				first = false;
			}

			writer.WriteLine();

			foreach (DataRow row in table.Rows)
			{
				first = true;
				foreach (DataColumn col in table.Columns)
				{
					if (!first)
						writer.Write(delimiter);
					if (row.IsNull(col))
					{
						writer.Write(EncodeCsvValue(string.Empty));
					}
					else
					{
						Layout layout = null;
						layouts.TryGetValue(col.ColumnName, out layout);
						if (layout != null)
						{
							writer.Write(EncodeCsvValue(FormatValue(row[col].ToString(), layout)));
						}
						else
						{
							writer.Write(EncodeCsvValue(row[col].ToString()));
						}
					}
					first = false;
				}
				writer.WriteLine();
			}
		}
	}
	private static string FormatValue(string value, Layout layout)
	{
		if (layout.FormatType.ToUpper() == "PHONE")
		{
			return Sage.SalesLogix.Web.Controls.Phone.FormatPhoneNumber(value);
		}
		return value;
	}

	#region Fill Dictionaries

	private void FillListViewDictionaries()
	{
		string[,] accountListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("IAccount", accountListTasks);

		string[,] contactListTasks =   
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("IContact", contactListTasks);

		string[,] activitiesListTasks = { { "Mail Merge", "mailMerge" } };
		tasksByEntityList.Add("Activities", activitiesListTasks);

		string[,] opportunitiesListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("IOpportunity", opportunitiesListTasks);

		string[,] leadsListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false"},
             //{"tskAssignOwner", "TaskText_AssignOwner", "javascript:leadAssignOwner();", "true"},
             //{"tskDeleteLeads", "TaskText_DeleteLeads", "javascript:leadDeleteRecords();", "true" }
            };
		tasksByEntityList.Add("ILead", leadsListTasks);

		string[,] campaignsListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("ICampaign", campaignsListTasks);

		string[,] ticketsListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("ITicket", ticketsListTasks);

		string[,] defectsListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdocList(Ext.EventObject);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("IDefect", defectsListTasks);

		string[,] returnsListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("IReturn", returnsListTasks);

		string[,] contractsTasksList =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("IContract", contractsTasksList);

		string[,] salesOrderListTasks =
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
             {"tskPromote", "TaskText_Promote", "javascript:promoteGroupToDashboard();", "false"},
             {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("ISalesOrder", salesOrderListTasks);

		string[,] codePickListTasksLists = { { "tskAddNewPickList", "TaskText_AddNewPickList", "", "false" } };
		tasksByEntityList.Add("IDBCodePickList", codePickListTasksLists);

		string[,] userListTasks = 
            {
                {"tskAddToTeam", "AddToTeamCaption", "javascript:PrepareSelectedRecords(AddToTeam); return false;", "false" },
                {"tskRemoveFromAllTeams", "RemoveFromAllTeamsCaption", 
					string.Format("javascript:if(confirm('{0}')) PrepareSelectedRecords(RemoveFromAllTeams); return false;", 
					PortalUtil.JavaScriptEncode(GetLocalResourceObject("ConfirmRemoveFromAllTeamsMsg").ToString())), "false" },
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("IUser", userListTasks);

		string[,] teamListTasks = 
            {
                {"tskAddToTeam", "AddToTeamCaption", "javascript:PrepareSelectedRecords(AddToTeam); return false;", "false" },
                {"tskRemoveFromAllTeams", "RemoveFromAllTeamsCaption", 
					string.Format("javascript:if(confirm('{0}')) PrepareSelectedRecords(RemoveFromAllTeams); return false;", 
					PortalUtil.JavaScriptEncode(GetLocalResourceObject("ConfirmRemoveFromAllTeamsMsg").ToString())), "false" },
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("ITeam", teamListTasks);

		string[,] departmentListTasks = 
            {
                
                {"tskAddToTeam", "AddToTeamCaption", "javascript:PrepareSelectedRecords(AddToTeam); return false;", "false" },
                {"tskRemoveFromAllTeams", "RemoveFromAllTeamsCaption", 
					string.Format("javascript:if(confirm('{0}')) PrepareSelectedRecords(RemoveFromAllTeams); return false;", 
					PortalUtil.JavaScriptEncode(GetLocalResourceObject("ConfirmRemoveFromAllTeamsMsg").ToString())), "false" },
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("IDepartment", departmentListTasks);

		string[,] productListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("IProduct", productListTasks);

		string[,] packageListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("IPackage", packageListTasks);

		string[,] competitorListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("ICompetitor", competitorListTasks);

		string[,] leadsourceListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("ILeadSource", leadsourceListTasks);

		string[,] pickListTasks = 
            {
                {"tskAddNewPickList", "TaskPickList_AddPickList", "", "false"},
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("IPickListView", pickListTasks);
		string[,] roleListTasks =
            {
                {"", "TaskText_SetUsersToStandardRole", 
                    string.Format("javascript:if(confirm('{0}')) Link.setUsersToStandardRole(); return false;", 
                    PortalUtil.JavaScriptEncode(GetLocalResourceObject("TaskText_SetUsersToStandardRole_Warning").ToString())),
                    "false"},
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("IRole", roleListTasks);

		string[,] litItemListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
		tasksByEntityList.Add("ILiteratureItem", litItemListTasks);

        string[,] litRequestListTasks =
            {
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskSaveAsNewGroup","TaskText_SaveAsNew","javascript:saveSelectionsAsNewGroup();","false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeSelectionsFromGroup();","false"},
                {"tskExportToExcel", "TaskText_Export", "javascript:exportToExcel();", "false" }
            };
        tasksByEntityList.Add("ILitRequest", litRequestListTasks);

	}

	private void FillDetailPageDictionaries()
	{
		string[,] accountDetailTasks = 
            {{"tskDetailReport","TaskText_DetailReport","javascript:ShowDefaultReport();","false"},
             {"","TaskText_Email","javascript:EmailSend();","false"},                 
            {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"},
             {"tskAddResponse","TaskText_ResponseToCampaign","","false"},
             {"tskInsertNote","TaskText_AddNote","","false"},
             {"tskNewMeeting","TaskText_Meeting","","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","","false"},
             {"tskNewToDo","TaskText_ToDo","","false"}};
		tasksByEntity.Add("IAccount", accountDetailTasks);

		string[,] contactDetailTasks = 
            {{"tskDetailReport","TaskText_DetailReport","javascript:ShowDefaultReport();","false"},
             {"","TaskText_Email","javascript:EmailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"},
             {"tskAddResponse","TaskText_ResponseToCampaign","","false"},
             {"tskInsertNote","TaskText_AddNote","","false"},
             {"tskNewMeeting","TaskText_Meeting","","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","","false"},
             {"tskNewToDo","TaskText_ToDo","","false"}};
		tasksByEntity.Add("IContact", contactDetailTasks);

		string[,] opportunityDetailTasks = 
            {{"tskDetailReport","TaskText_DetailReport","javascript:ShowDefaultReport();","false"},
             {"","TaskText_Email","javascript:EmailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"},
             //PENDING {"tskAddResponse","TaskText_ResponseToCampaign",""},
             {"tskInsertNote","TaskText_AddNote","","false"},
             {"tskNewMeeting","TaskText_Meeting","","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","","false"},
             {"tskNewToDo","TaskText_ToDo","","false"},
             {"tskAddSalesOrder","TaskText_SalesOrder","javascript:window.location='InsertSalesOrder.aspx?modeid=Insert&opp=yes';","false"}};
		tasksByEntity.Add("IOpportunity", opportunityDetailTasks);

		string[,] activityDetailTasks = 
            {{"","TaskText_Email","email","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},             
             {"tskNewMeeting","TaskText_Meeting","","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","","false"},
             {"tskNewToDo","TaskText_ToDo","","false"}};
		tasksByEntity.Add("IActivty", activityDetailTasks);

		string[,] leadDetailTasks = 
            {{"","TaskText_Email","javascript:EmailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"}, 
             //{"TaskText_ResponseToCampaign","addResponseToCampaign"},
             {"tskInsertNote","TaskText_AddNote","","false"},
             {"tskNewMeeting","TaskText_Meeting","","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","","false"},
             {"tskNewToDo","TaskText_ToDo","","false"}};
		tasksByEntity.Add("ILead", leadDetailTasks);

		string[,] campaignDetailTasks = 
            {{"Email","TaskText_Email","javascript:EmailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"},
             {"tskInsertNote","TaskText_AddNote","","false"},
             {"tskNewMeeting","TaskText_Meeting","","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","","false"},
             {"tskNewToDo","TaskText_ToDo","","false"}};
		tasksByEntity.Add("ICampaign", campaignDetailTasks);

		string[,] ticketDetailTasks = 
            {{"tskDetailReport","TaskText_DetailReport","javascript:ShowDefaultReport();","false"},
             {"cmdEmail","TaskText_Email","javascript:EmailSend();","false"},       
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"},
             {"tskInsertNote","TaskText_AddNote","","false"},
             {"tskNewMeeting","TaskText_Meeting","","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","","false"},
             {"tskNewToDo","TaskText_ToDo","","false"}};
		tasksByEntity.Add("ITicket", ticketDetailTasks);

		string[,] defectDetailTasks = 
            {{"tskDetailReport","TaskText_DetailReport","javascript:ShowDefaultReport();","false"},
             {"","TaskText_Email","javascript:EmailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"},
             {"tskInsertNote","TaskText_AddNote","","false"},
             {"tskNewMeeting","TaskText_Meeting","","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","","false"},
             {"tskNewToDo","TaskText_ToDo","","false"}};
		tasksByEntity.Add("IDefect", defectDetailTasks);

		string[,] returnDetailTasks = 
            {{"","TaskText_Email","javascript:EmailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"},
             {"tskInsertNote","TaskText_AddNote","","false"},
             {"tskNewMeeting","TaskText_Meeting","","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","","false"},
             {"tskNewToDo","TaskText_ToDo","","false"}};
		tasksByEntity.Add("IReturn", returnDetailTasks);

		string[,] contractDetailTasks = 
            {{"","TaskText_Email","javascript:EmailSend();","false"},
             {"tskMailMerge","TaskText_MailMerge","javascript:ExecuteWriteAction(WriteAction.waWriteMailMerge, null);","false"},
             {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"},
             {"tskInsertNote","TaskText_AddNote","","false"},
             {"tskNewMeeting","TaskText_Meeting","","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","","false"},
             {"tskNewToDo","TaskText_ToDo","","false"}};
		tasksByEntity.Add("IContract", contractDetailTasks);

		string[,] salesOrderDetailTasks = 
            {{"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
             {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"},
             {"tskInsertNote","TaskText_AddNote","","false"},
             {"tskNewMeeting","TaskText_Meeting","","false"},
             {"tskNewPhoneCall","TaskText_PhoneCall","","false"},
             {"tskNewToDo","TaskText_ToDo","","false"}};
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
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"}
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
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"}
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
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"}
            };
		tasksByEntity.Add("IDepartment", departmentDetailTasks);

		string[,] roleDetailTasks = 
            {   
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"}
            };
		tasksByEntity.Add("IRole", roleDetailTasks);

		string[,] competitorDetailTasks = 
            {   
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"}
            };
		tasksByEntity.Add("ICompetitor", competitorDetailTasks);

		string[,] leadSourceDetailTasks = 
            {   
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"}
            };
		tasksByEntity.Add("ILeadSource", leadSourceDetailTasks);

		string[,] productDetailTasks = 
            {   
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"}
            };
		tasksByEntity.Add("IProduct", productDetailTasks);

		string[,] packageDetailTasks = 
            {   
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"}
            };
		tasksByEntity.Add("IPackage", packageDetailTasks);

		string[,] litItemDetailTasks = 
            {   
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"}
            };
		tasksByEntity.Add("ILiteratureItem", litItemDetailTasks);

		string[,] pickListDetailTasks = 
            {
                {"tskAddNewPickList", "TaskPickList_AddPickList", "", "false"},
                //AdHoc group Management
                {"tskUserSep0", "Item_Separator", "","false"}, // separator
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"}
            };
		tasksByEntity.Add("IPickListView", pickListDetailTasks);

        string[,] litRequestDetailTasks = 
            {   
                //AdHoc group Management
                {"tskAddToGroup", "TaskText_AddToGroup","javascript:showAdHocList(Ext.EventObject);", "false"},
                {"tskRemoveFromGroup","TaskText_Remove","javascript:removeCurrentFromGroup();","false"}
            };
        tasksByEntity.Add("ILitRequest", litRequestDetailTasks);
        
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

