using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.UI.Web;
using Sage.Platform.WebPortal.Services;
using Sage.SalesLogix.Activity;
using Sage.Platform.Orm.Entities;
using Sage.SalesLogix.Client.GroupBuilder;
using Sage.SalesLogix.Security;
using Sage.SalesLogix.SelectionService;
using Sage.SalesLogix.Services.PotentialMatch;
using Sage.SalesLogix.Web.SelectionService;

public class LinkHandler
{
    private const int ActivityDlg_Height = 570;
    private const int ActivityDlg_Width = 870;
    private const int CompleteActivityDlg_Height = 590;
    private const int CompleteActivityDlg_Width = 870;
    private const int HistoryDlg_Height = 780;
    private const int HistoryDlg_Width = 730;

    private readonly ApplicationPage _Page;

    private ApplicationPage Page
    {
        get { return _Page; }
    }

    private bool IsInDialogIFrame
    {
        get
        {
            if (_Page != null)
            {
                return (_Page.PageWorkItem.Workspaces["DialogWorkspace"] == null);
            }
            return false;
        }
    }

    private IWebDialogService Dialog
    {
        get { return Page.PageWorkItem.Services.Get<IWebDialogService>(true); }
    }

    public static IContextService AppContext
    {
        get { return ApplicationContext.Current.Services.Get<IContextService>(true); }
    }

    private IUserManagementService _ums;
    public IUserManagementService UserManagementService
    {
        get { return _ums ?? (_ums = ApplicationContext.Current.Services.Get<IUserManagementService>(true)); }
    }

    public LinkHandler(System.Web.UI.Page page) : this((ApplicationPage)page) { }
    public LinkHandler(ApplicationPage page)
    {
        _Page = page;
    }

    #region Entity Link Handler

    public void EntityDetail(string id, string kind)
    {
        Page.Response.Redirect(string.Format("~/{0}.aspx?entityid={1}", kind, id));
    }

    #endregion

    public void MergeRecords(String selectionContextKey)
    {
        Dialog.SetSpecs(-1, -1, 750, 650, "MergeRecords");
        IGroupContextService srv = ApplicationContext.Current.Services.Get<IGroupContextService>() as GroupContextService;
        EntityGroupInfo currentEntityGroupInfo = srv.GetGroupContext().CurrentGroupInfo;
        ISelectionService selectionService = (ISelectionService) SelectionServiceRequest.GetSelectionService();
        ISelectionContext selectionContext = selectionService.GetSelectionContext(selectionContextKey);
        IList<string> list = selectionContext.GetSelectedIds();
        if (list != null)
        {
            MergeArguments mergeArguments = new MergeArguments(list[0], list[1], currentEntityGroupInfo.EntityType, currentEntityGroupInfo.EntityType);
            Dialog.DialogParameters.Add("mergeArguments", mergeArguments);
            Dialog.ShowDialog();
        }
        else
        {
            throw new ValidationException("The selection service does not contain any selected records.");
        }
    }

    public void ShowDialog(String type, String smartPart, String entityId, String title, bool isCentered, int top, int left, int height, int width)
    {
        Type entityType = Type.GetType(type);
        Dialog.SetSpecs(top, left, height, width, smartPart, title, isCentered);
        Dialog.EntityID = entityId;
        Dialog.EntityType = entityType;
        Dialog.ShowDialog();
    }

    #region Confirmations

    public void ConfirmActivity(string id, string toUserId)
    {
        string url = string.Format("~/ConfirmActivity.aspx?entityid={0}&touserid={1}", id, toUserId);
        Page.Response.Redirect(url);
    }

    public void DeleteConfirmation(string id, string notifyId)
    {
        string url = string.Format("~/DeleteConfirmation.aspx?entityid={0}&notifyid={1}", id, notifyId);
        Page.Response.Redirect(url);
    }

    public void RemoveDeletedConfirmation(string id)
    {
        string url = string.Format("~/RemoveDeletedConfirmation.aspx?entityid={0}", id);
        Page.Response.Redirect(url);
    }

    #endregion

    #region User Functionality
    public void NewUsers()
    {
        Dialog.SetSpecs(400, 600, "AddUsers", "Add New Users");
        Dialog.ShowDialog();
    }

    /// <summary>
    /// sets user status to "retired" for the selected list of users.
    /// </summary>
    public void DeleteUsers(IList<string> targetUserIds)
    {
        // currently not implemented
    }

    public void ShowEditSecurityProfileDialog(string selectionInfoKey)
    {
        Dialog.DialogParameters.Clear();
        Dialog.SetSpecs(210, 400, "EditSecurityProfile");

        string[] ids = selectionInfoKey.Split(',');
        Dialog.DialogParameters.Add("childId", ids[0]);
        Dialog.EntityID = ids[0];
        Dialog.EntityType = typeof(IOwner);
        Dialog.DialogParameters.Add("parentId", ids[1]);
        Dialog.DialogParameters.Add("profileId", ids[2]);
        Dialog.ShowDialog();
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="targetTeamIds"></param>
    public void DeleteTeam(IList<string> targetTeamIds)
    {
        foreach (string id in targetTeamIds)
        {
            ITeam team = EntityFactory.GetById<ITeam>(id);
            team.Delete();
        }

        FormHelper.RefreshMainListPanel(Page, GetType());
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="targetDepartmentIds"></param>
    public void DeleteDepartment(IList<string> targetDepartmentIds)
    {
        foreach (string id in targetDepartmentIds)
        {
            IDepartment department = EntityFactory.GetById<IDepartment>(id);
            department.Delete();
        }

        FormHelper.RefreshMainListPanel(Page, GetType());
    }
    /// <summary>
    /// Copies the selected departments and all members along with the appropriate security
    /// </summary>
    /// <param name="targetUserIds"></param>
    public void CopyDepartment(IList<string> targetIds)
    {
        foreach (string departId in targetIds)
        {
            //Just Processing one for now
            IDepartment sourceDepart = EntityFactory.GetById<IDepartment>(departId);
            IDepartment newDepart = null;
            Sage.SalesLogix.Department.Rules.CopyDepartment(sourceDepart, out newDepart);
            if (newDepart != null)
            {
                HttpContext.Current.Response.Redirect(string.Format("~/{0}.aspx?entityId={1}", "Department", newDepart.Id.ToString()), false);
            }
            break;
        }
    }

    /// <summary>
    /// Copies the selected teams and all members along with the appropriate security
    /// </summary>
    /// <param name="targetUserIds"></param>
    public void CopyTeam(IList<string> targetIds)
    {

        foreach(string  teamId in targetIds)
        {
            //Just Processing one for now
            ITeam sourceTeam = EntityFactory.GetById<ITeam>(teamId);
            ITeam newTeam = null;
            Sage.SalesLogix.Team.Rules.CopyTeam(sourceTeam, out newTeam);
            if(newTeam != null)
            {
                HttpContext.Current.Response.Redirect(string.Format("~/{0}.aspx?entityId={1}", "Team", newTeam.Id.ToString()), false);         
            }
            break;
        }
    }

    /// <summary>
    /// copies a user with no user interaction.  Assumes source user's profile.
    /// </summary>
    public void CopyUser(IList<string> targetUserIds)
    {
        Dialog.DialogParameters.Clear();
        Dialog.DialogParameters.Add("selectedIds", targetUserIds);
		Dialog.SetSpecs(150, 300, "CopyUser", Resources.User.CopyUser_DialogTitle);
        Dialog.ShowDialog();
    }

    private AddUserOptions SetAddUserOptions(IUser existingUser)
    {
        AddUserOptions options = new AddUserOptions();
        options.TemplateID = existingUser.Id.ToString();
        options.Quantity = 1;
        options.CreateFromProfile = true;
        options.UseCalendarProfile = true;
        options.UseClientOptionsProfile = true;
        options.UseCustomProfile = true;
        options.UseEmployeeProfile = true;
        options.UseFunctionSecurityProfile = true;
        options.UseGeneralProfile = true;
        options.UseSecurityProfile = true;
        options.UserType = existingUser.Type;
        options.UseSecurityProfile = true;
        options.UseTeamsProfile = true;
        options.UseSyncProfile = true;
        options.UseSupportProfile = true;
        return options;
    }

    public void RedirectToNewGroupDetail(IList<IUser> newUserList)
    {
        if (newUserList.Count > 1)
        {
            IGroupContextService srv = ApplicationContext.Current.Services.Get<IGroupContextService>() as GroupContextService;
            if (srv != null)
            {
                string tableName = "USERSECURITY";
                srv.CurrentTable = tableName;

                EntityGroupInfo currentEntityGroupInfo = srv.GetGroupContext().CurrentGroupInfo;
                currentEntityGroupInfo.LookupTempGroup.ClearConditions();
                StringBuilder sb = new StringBuilder();
                foreach (IUser user in newUserList)
                {
                    sb.AppendFormat("{0},", user.Id);
                }
                string idList = sb.ToString();
                if (idList.EndsWith(","))
                    idList = idList.TrimEnd(new char[] { ',' });

                idList = string.Format("\"{0}\"", idList);
                currentEntityGroupInfo.LookupTempGroup.AddLookupCondition(string.Format("{0}:UserId", tableName), "IN", idList);
                //currentEntityGroupInfo.LookupTempGroup.AddLookupCondition(string.Format("{0}:UserCode", tableName), "LIKE", "<Copy of%");
                currentEntityGroupInfo.LookupTempGroup.GroupXML = GroupInfo.RebuildGroupXML(currentEntityGroupInfo.LookupTempGroup.GroupXML);
                srv.CurrentGroupID = GroupContext.LookupResultsGroupID;
            }
            HttpContext.Current.Response.Redirect(string.Format("~/{0}.aspx", "User"), false);
        }
        else
        {
            HttpContext.Current.Response.Redirect(string.Format("~/{0}.aspx?entityId={1}", "User", newUserList[0].Id), false);
        }
    }

    /// <summary>
    /// Launches a dialog that allows the user to select the source user profile
    /// or template to copy to the selected list of users.
    /// </summary>
    public void CopyUserProfile(IList<string> targetUserIds)
    {
        Dialog.DialogParameters.Clear();
        Dialog.DialogParameters.Add("selectedIds", targetUserIds);
		Dialog.SetSpecs(350, 400, "CopyUserProfile", Resources.User.CopyProfile_DialogTitle);
        Dialog.ShowDialog();
    }

    /// <summary>
    /// Launches a dialog that allows the user to select the team to which
    /// the selected list of users will be assigned.
    /// </summary>
    public void AddToTeam(IList<string> targetIds)
    {

        IGroupContextService srv = ApplicationContext.Current.Services.Get<IGroupContextService>() as GroupContextService;
        EntityGroupInfo currentEntityGroupInfo = srv.GetGroupContext().CurrentGroupInfo;
        
        Type entityContext = null;
        switch (currentEntityGroupInfo.EntityName)
        { 
            
            case "User":
                entityContext =  typeof(IUser);
                break;
            case "Team":
                entityContext = typeof(ITeam);
                break;
            case "Department":
                entityContext = typeof(IDepartment);
                break;


        }
                
        Dialog.DialogParameters.Clear();
        Dialog.DialogParameters.Add("selectedIds", targetIds);
        Dialog.DialogParameters.Add("context", entityContext);  
        Dialog.SetSpecs(210, 350, "AddToTeam");
        Dialog.ShowDialog();
        
        
    }
        
    public void RemoveFromAllTeams(IList<string> targetIds)
    {

        
        IGroupContextService srv = ApplicationContext.Current.Services.Get<IGroupContextService>() as GroupContextService;
        EntityGroupInfo currentEntityGroupInfo = srv.GetGroupContext().CurrentGroupInfo;
               
        switch (currentEntityGroupInfo.EntityName)
        { 
            
            case "User":
                RemoveUserFromAllTeams(targetIds);
                break;
            case "Team":
                RemoveTeamFromAllTeams(targetIds);
                break;
            case "Department":
                RemoveDepartmentFromAllTeams(targetIds);
                break;
        }       
       
    }

    public void RemoveUserFromAllTeams(IList<string> targetIds)
    {
        foreach (string userId in targetIds)
        {
            IUser user = EntityFactory.GetById<IUser>(userId);
            if ((user.Type != UserType.Retired) || (user.Type != UserType.Template))
            {
                IList<IOwnerJoin> teams = user.GetTeamMembership();
                foreach (IOwnerJoin team in teams)
                {
                    user.RemoveFromTeam(team);
                }
            }
        }   
    }

    public void RemoveTeamFromAllTeams(IList<string> targetIds)
    {
        IList<ITeam> teams = Sage.SalesLogix.Team.Rules.GetTeams();
        foreach(ITeam team in teams)
        {
           foreach (string selectedTeamId in targetIds)
           {
               IOwnerJoin selectedTeam = EntityFactory.GetByCompositeId(typeof(IOwnerJoin), new string[] {"ParentOwnerId","ChildOwnerId"}, new object[] {team.Id, selectedTeamId }) as IOwnerJoin;
               if (selectedTeam != null)
                   team.RemoveMember(selectedTeam);
           }
        }
    }

    public void RemoveDepartmentFromAllTeams(IList<string> targetIds)
    {
        IList<ITeam> teams = Sage.SalesLogix.Team.Rules.GetTeams();
        foreach (ITeam team in teams)
        {
            foreach (string selectedDepartId in targetIds)
            {
                IOwnerJoin selectedDepart = EntityFactory.GetByCompositeId(typeof(IOwnerJoin), new string[] { "ParentOwnerId", "ChildOwnerId" }, new object[] { team.Id, selectedDepartId }) as IOwnerJoin;
                if(selectedDepart != null)
                    team.RemoveMember(selectedDepart);
                
            }
        }
    }    
   
    public void ReplaceTeamMember(IList<string> targetIds)
    {

        IGroupContextService srv = ApplicationContext.Current.Services.Get<IGroupContextService>() as GroupContextService;
        EntityGroupInfo currentEntityGroupInfo = srv.GetGroupContext().CurrentGroupInfo;

        switch (currentEntityGroupInfo.EntityName)
        {

            case "User":
                ReplaceTeamMemberUser(targetIds);
                break;
            case "Team":
                ReplaceTeamMemberTeam(targetIds);
                break;
            case "Department":
                ReplaceTeamMemberDepartment(targetIds);
                break;
        }       
        
    }

    public void ReplaceTeamMemberUser(IList<string> targetIds)
    {
        IEntityHistoryService ehs = ApplicationContext.Current.Services.Get<IEntityHistoryService>();
        object lastId = ehs.GetLastIdForType<IUser>();
        if (lastId != null)
        {

            targetIds = new List<string>() { lastId.ToString() };
            Dialog.DialogParameters.Clear();
            Dialog.DialogParameters.Add("selectedIds", targetIds);
            Dialog.DialogParameters.Add("context", typeof(IUser));
            Dialog.SetSpecs(200, 350, "ReplaceTeamMember", "");
            Dialog.ShowDialog();
        }
        
    
    }

    public void ReplaceTeamMemberTeam(IList<string> targetIds)
    {
        IEntityHistoryService ehs = ApplicationContext.Current.Services.Get<IEntityHistoryService>();
        object lastId = ehs.GetLastIdForType<ITeam>();
        if (lastId != null)
        {
            
            targetIds = new List<string>() { lastId.ToString() };
            Dialog.DialogParameters.Clear();
            Dialog.DialogParameters.Add("selectedIds", targetIds);
            Dialog.DialogParameters.Add("context", typeof(ITeam));
            Dialog.SetSpecs(200, 350, "ReplaceTeamMember", "");
            Dialog.ShowDialog();
        }
        
    }

    public void ReplaceTeamMemberDepartment(IList<string> targetIds)
    {
        IEntityHistoryService ehs = ApplicationContext.Current.Services.Get<IEntityHistoryService>();
        object lastId = ehs.GetLastIdForType<IDepartment>();
        if (lastId != null)
        {

            targetIds = new List<string>() { lastId.ToString() };
            Dialog.DialogParameters.Clear();
            Dialog.DialogParameters.Add("selectedIds", targetIds);
            Dialog.DialogParameters.Add("context", typeof(IDepartment));
            Dialog.SetSpecs(200, 350, "ReplaceTeamMember", "");
            Dialog.ShowDialog();
        }
    
    }

    public void SetUsersToStandardRole()
    {
        IList<IUser> users = UserManagementService.GetUsers();
        foreach (var user in users)
        {
            if (user.Type != UserType.AddOn && user.Type != UserType.Template && user.Type != UserType.Admin)
                Sage.SalesLogix.User.Rules.ApplyDefaultRoleSecurity(user);
        }
    }

    /// <summary>
    /// postponed feature
    /// </summary>
    public void AssignRoleToUsers(IList<string> targetUserIds)
    {
    }
    /// <summary>
    /// postponed feature
    /// </summary>
    public void ImportUsers()
    {
    }
    /// <summary>
    /// postponed feature
    /// </summary>
    public void RealignActivities()
    {
    }
    #endregion User Functionality

    #region History Dialogs

    public void NewNote()
    {
        NewNote(new Dictionary<string, string>());
    }

    public void NewNote(Dictionary<string, string> args)
    {
        AppContext["ActivityParameters"] = args;
        Dialog.SetSpecs(-1, -1, 550, 760, "InsertNote");
        Dialog.EntityType = typeof(IHistory);
        Dialog.EntityID = EntityViewMode.Insert.ToString();
        Dialog.ShowDialog();
    }

    public void EditHistory(string id)
    {
        Dictionary<string, string> args = new Dictionary<string, string>();
        args.Add("contenturl", string.Format("History.aspx?entityid={0}", id));
        ShowHistoryDialog(args);
    }
    public void EditHistory(string id, Dictionary<string, string> args)
    {
        if (!args.ContainsKey("contenturl"))
            args.Add("contenturl", string.Format("History.aspx?entityid={0}", id));
        ShowHistoryDialog(args);
    }

    private void ShowHistoryDialog(Dictionary<string, string> args)
    {
        AppContext["ActivityParameters"] = args;
        Dialog.SetSpecs(-1, -1, HistoryDlg_Height, HistoryDlg_Width, "ActivityDialogController");
        Dialog.ShowDialog();
    }

    #endregion

    #region Activity Details Dialogs

    public void SchedulePhoneCall()
    {
        Dictionary<string, string> args = new Dictionary<string, string>();
        args.Add("type", "atPhoneCall");
        ScheduleActivity(args);
    }

    public void ScheduleMeeting()
    {
        Dictionary<string, string> args = new Dictionary<string, string>();
        args.Add("type", "atAppointment");
        ScheduleActivity(args);
    }

    public void ScheduleToDo()
    {
        Dictionary<string, string> args = new Dictionary<string, string>();
        args.Add("type", "atToDo");
        ScheduleActivity(args);
    }

    public void SchedulePersonalActivity()
    {
        Dictionary<string, string> args = new Dictionary<string, string>();
        args.Add("type", "atPersonal");
        ScheduleActivity(args);
    }

    public void ScheduleActivity(Dictionary<string, string> args)
    {
        args.Add("entityid", null);
        ShowActivityDialog(args);
    }

    public void EditActivity(string id)
    {
        if (Dialog.SmartPartMappedID != "EditRecurrence" && IsRecurring(id))
            ShowSeriesOrOccurrenceDialog("EditRecurrence", id);
        else
        {
            Dictionary<string, string> args = new Dictionary<string, string>();
            args.Add("entityid", id);
            ShowActivityDialog(args);
        }
    }

    private void ShowActivityDialog(Dictionary<string, string> args)
    {
        ActivityParameters aparams = new ActivityParameters(args);
        string url;
        if (aparams.RecurDate.HasValue)
        {
            // TODO: Refactor to remove QS dependancy
            url = string.Format("Activity.aspx?modeid=Insert&activityid={0}&recurdate={1}",
                aparams["activityid"],
                aparams.RecurDate);
        }
        else
        {
            url = string.IsNullOrEmpty(aparams.Id)
                ? "Activity.aspx?modeid=Insert"
                : string.Format("Activity.aspx?entityid={0}", aparams.Id);
        }
        aparams.Add("contenturl", url);
        AppContext["ActivityParameters"] = aparams;
        if (IsInDialogIFrame)
        {
            Page.Response.Redirect(url);
        }
        else
        {
            Dialog.SetSpecs(-1, -1, ActivityDlg_Height, ActivityDlg_Width, "ActivityDialogController");
            Dialog.ShowDialog();
        }
    }

    public void EditActivityOccurrencePrompt(string id, DateTime recurDate)
    {
        Dictionary<string, string> args = new Dictionary<string, string>();
        args.Add("recurdate", recurDate.ToString());
        AppContext["ActivityParameters"] = args;

        Dialog.SetSpecs(-1, -1, 230, 330, "EditRecurrence");
        ShowActivityDialog(id);
    }

    public void EditActivityOccurrence(string id, DateTime recurDate)
    {
        Dictionary<string, string> args = new Dictionary<string, string>();
        args.Add("activityid", id);
        args.Add("recurdate", recurDate.ToString());
        ShowActivityDialog(args);
    }

    // pass null id for Insert
    private void ShowActivityDialog(string id)
    {
        Dialog.EntityType = typeof(IActivity);
        Dialog.EntityID = id ?? EntityViewMode.Insert.ToString();
        Dialog.ShowDialog();
    }

    private static object BuildOccurrence()
    {
        Dictionary<string, string> args = (Dictionary<string, string>)AppContext["ActivityParameters"];
        if (args == null || !args.ContainsKey("activityid")) return null;

        Activity activity = EntityFactory.GetById<Activity>(args["activityid"]);
        DateTime startDate = TryParse(args["recurdate"]) ?? activity.StartDate;

        return activity.RecurrencePattern.GetOccurrence(startDate);
    }

    private static DateTime? TryParse(string s)
    {
        DateTime result;
        return DateTime.TryParse(s, out result) ? (DateTime?)result : null;
    }

    #endregion

    #region Complete Activity Dialogs

    public void ScheduleCompleteActivity()
    {
        Dialog.SetSpecs(-1, -1, 350, 500, "ScheduleCompleteActivity");
        Dialog.ShowDialog();
    }

    public void ScheduleCompleteActivity(Dictionary<string, string> args)
    {
        CompleteActivity(null, args);
    }

    public void CompleteActivityOccurrencePrompt(string id, DateTime recurDate)
    {
        Dictionary<string, string> args = new Dictionary<string, string>();
        args.Add("recurdate", recurDate.ToString());
        AppContext["ActivityParameters"] = args;

        Dialog.SetSpecs(-1, -1, 230, 330, "CompleteRecurrence");
        ShowActivityDialog(id);
    }

    public void CompleteActivityOccurrence(string id, DateTime recurDate)
    {
        Dictionary<string, string> args = new Dictionary<string, string>();
        args.Add("activityid", id);
        args.Add("recurdate", recurDate.ToString());
        // TODO: Refactor to remove QS dependancy
        args.Add("contenturl", string.Format("CompleteActivity.aspx?activityid={0}&recurdate={1}&entityid={2}", id, recurDate, id));
        AppContext["ActivityParameters"] = args;

        ShowCompleteActivityDialog(null, null);
    }

    public void CompleteActivity(string id, Dictionary<string, string> args)
    {
        //Completing an existing Activity
        if (id != null)
        {
            string mode;
            if (args.TryGetValue("mode", out mode) && mode == "batch")
            {
                args.Add("contenturl", string.Format("CompleteActivity.aspx?entityid={0}", id));
                args.Add("entityid", id);
                AppContext["ActivityParameters"] = args;
                ShowCompleteActivityDialog(id, args);
            }
            else
                CompleteActivity(id);
        }
        //Completing a new Activity
        else
        {
            args.Add("contenturl", "CompleteActivity.aspx?modeid=Insert");
            AppContext["ActivityParameters"] = args;
            ShowCompleteActivityDialog(id, args);
        }
    }

    public void CompleteActivity(string id)
    {
        if (Dialog.SmartPartMappedID != "CompleteRecurrence" && IsRecurring(id))
        {
            ShowSeriesOrOccurrenceDialog("CompleteRecurrence", id);
        }
        else
        {
            Dictionary<string, string> args = new Dictionary<string, string>();
            if (id != null)
            {
                args.Add("contenturl", string.Format("CompleteActivity.aspx?entityid={0}", id));
                args.Add("entityid", id);
            }
            AppContext["ActivityParameters"] = args;

            ShowCompleteActivityDialog(id, args);
        }
    }

    private void ShowCompleteActivityDialog(string id, IDictionary<string, string> args)
    {
        if (IsInDialogIFrame)
        {
            Page.Response.Redirect(args["contenturl"]);
        }

        Dialog.SetSpecs(-1, -1, CompleteActivityDlg_Height, CompleteActivityDlg_Width, "ActivityDialogController");
        Dialog.ShowDialog();
    }

    #endregion

    #region Delete Activity Dialogs

    public void DeleteActivity(string id)
    {
        Activity activity = EntityFactory.GetById<Activity>(id);
        activity.Delete();
        FormHelper.RefreshMainListPanel(Page, GetType());
    }

    public void DeleteActivityOccurrencePrompt(string id, DateTime recurDate)
    {
        Dictionary<string, string> args = new Dictionary<string, string>();
        args.Add("recurdate", recurDate.ToString());
        AppContext["ActivityParameters"] = args;

        Dialog.SetSpecs(-1, -1, 230, 330, "DeleteRecurrence");
        ShowActivityDialog(id);
    }

    #endregion

    private static bool IsRecurring(string id)
    {
        if (string.IsNullOrEmpty(id)) return false;

        Activity activity = EntityFactory.GetById<Activity>(id);
        if (activity == null) return false;

        return activity.Recurring && activity.RecurrencePattern.Range.NumOccurences > -1;
    }

    private void ShowSeriesOrOccurrenceDialog(string mappedId, string id)
    {
        AppContext["ActivityParameters"] = new Dictionary<string, string>();
        Dialog.SetSpecs(200, 200, 230, 330, mappedId);
        ShowActivityDialog(id);
    }
}

public class ActivityParameters : Dictionary<string, string>
{
    public ActivityParameters() { }

    public ActivityParameters(Dictionary<string, string> dictionary) : base(dictionary) { }

    public ActivityType Type
    {
        get { return ContainsKey("type") ? GetActivityType(this["type"]) : ActivityType.atAppointment; }
    }

    public string Id
    {
        get { return ContainsKey("entityid") ? this["entityid"] : null; }
    }

    public DateTime? RecurDate
    {
        get { return ContainsKey("recurdate") ? TryParse(this["recurdate"]) : null; }
    }

    public bool IsBatchMode
    {
        get { return ContainsKey("mode") ? this["mode"] == "batch" : false; }
    }

    private static ActivityType GetActivityType(string s)
    {
        if (string.IsNullOrEmpty(s)) return ActivityType.atAppointment;
        try
        {
            return (ActivityType)Enum.Parse(typeof(ActivityType), s);
        }
        catch (ArgumentException) { }
        return ActivityType.atAppointment;
    }

    private static DateTime? TryParse(string s)
    {
        DateTime result;
        return DateTime.TryParse(s, out result) ? (DateTime?)result : null;
    }
}