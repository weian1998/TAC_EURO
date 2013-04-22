using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Web.UI;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.UI.Web;
using Sage.Platform.WebPortal.Services;
using Sage.SalesLogix.Client.GroupBuilder;
using Sage.SalesLogix.Security;
using Sage.SalesLogix.SelectionService;
using Sage.SalesLogix.Services.PotentialMatch;
using Sage.SalesLogix.Web.SelectionService;
using User = Resources.User;

public class LinkHandler
{
    private readonly ApplicationPage _page;

    private ApplicationPage Page
    {
        get { return _page; }
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

    public LinkHandler(Page page) : this((ApplicationPage) page) { }

    public LinkHandler(ApplicationPage page)
    {
        _page = page;
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
        var srv = ApplicationContext.Current.Services.Get<IGroupContextService>();
        EntityGroupInfo currentEntityGroupInfo = srv.GetGroupContext().CurrentGroupInfo;
        var selectionService = SelectionServiceRequest.GetSelectionService();
        ISelectionContext selectionContext = selectionService.GetSelectionContext(selectionContextKey);
        IList<string> list = selectionContext.GetSelectedIds();
        if (list != null && list.Count == 2)
        {
            MergeArguments mergeArguments = new MergeArguments(list[0], list[1], currentEntityGroupInfo.EntityType, currentEntityGroupInfo.EntityType);
            Dialog.DialogParameters.Remove("mergeArguments");
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

    #region User Functionality

    public void NewUsers()
    {
        Dialog.SetSpecs(400, 600, "AddUsers", "Add New Users");
        Dialog.ShowDialog();
    }

    /// <summary>
    /// sets user status to "retired" for the selected list of users.
    /// </summary>
    public void DeleteUsers(IList<string> targetIds)
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
    /// <param name="targetIds"></param>
    public void CopyDepartment(IList<string> targetIds)
    {
        foreach (string departId in targetIds)
        {
            //Just Processing one for now
            IDepartment sourceDepart = EntityFactory.GetById<IDepartment>(departId);
            IDepartment newDepart;
            Sage.SalesLogix.Department.Rules.CopyDepartment(sourceDepart, out newDepart);
            if (newDepart != null)
            {
                HttpContext.Current.Response.Redirect(string.Format("~/{0}.aspx?entityId={1}", "Department", newDepart.Id), false);
            }
            break;
        }
    }

    /// <summary>
    /// Copies the selected teams and all members along with the appropriate security
    /// </summary>
    /// <param name="targetIds"></param>
    public void CopyTeam(IList<string> targetIds)
    {
        foreach (string teamId in targetIds)
        {
            //Just Processing one for now
            ITeam sourceTeam = EntityFactory.GetById<ITeam>(teamId);
            ITeam newTeam;
            Sage.SalesLogix.Team.Rules.CopyTeam(sourceTeam, out newTeam);
            if (newTeam != null)
            {
                HttpContext.Current.Response.Redirect(string.Format("~/{0}.aspx?entityId={1}", "Team", newTeam.Id), false);
            }
            break;
        }
    }

    /// <summary>
    /// copies a user with no user interaction.  Assumes source user's profile.
    /// </summary>
    public void CopyUser(IList<string> targetIds)
    {
        Dialog.DialogParameters.Clear();
        Dialog.DialogParameters.Add("selectedIds", targetIds);
        Dialog.SetSpecs(150, 300, "CopyUser", User.CopyUser_DialogTitle);
        Dialog.ShowDialog();
    }

    public void RedirectToNewGroupDetail(IList<IUser> newUserList)
    {
        var srv = ApplicationContext.Current.Services.Get<IGroupContextService>();
        if (srv != null)
        {
            if (Dialog != null)
            {
                Dialog.CloseEventHappened(null, null);
            }

            const string tableName = "USERSECURITY";
            srv.CurrentTable = tableName;

            EntityGroupInfo currentEntityGroupInfo = srv.GetGroupContext().CurrentGroupInfo;
            currentEntityGroupInfo.LookupTempGroup.ClearConditions();
            StringBuilder sb = new StringBuilder();

            if (newUserList.Count > 1)
            {
                foreach (IUser user in newUserList)
                {
                    sb.AppendFormat("'{0}',", user.Id);
                }
                string idList = sb.ToString();
                if (idList.EndsWith(","))
                    idList = idList.TrimEnd(new char[] { ',' });

                idList = string.Format("({0})", idList);
                currentEntityGroupInfo.LookupTempGroup.AddLookupCondition(string.Format("{0}:UserId", tableName), "IN", idList);
                currentEntityGroupInfo.LookupTempGroup.GroupXML = GroupInfo.RebuildGroupXML(currentEntityGroupInfo.LookupTempGroup.GroupXML);
                srv.CurrentGroupID = GroupContext.LookupResultsGroupID;
                HttpContext.Current.Response.Redirect(string.Format("~/{0}.aspx", "User"), false);
            }
            else
            {
                currentEntityGroupInfo.LookupTempGroup.AddLookupCondition(string.Format("{0}:UserId", tableName), "=", newUserList[0].Id.ToString());
                currentEntityGroupInfo.LookupTempGroup.GroupXML = GroupInfo.RebuildGroupXML(currentEntityGroupInfo.LookupTempGroup.GroupXML);
                srv.CurrentGroupID = GroupContext.LookupResultsGroupID;
                HttpContext.Current.Response.Redirect(string.Format("~/{0}.aspx?entityId={1}", "User", newUserList[0].Id), false);
            }
        }
    }

    /// <summary>
    /// Launches a dialog that allows the user to select the source user profile
    /// or template to copy to the selected list of users.
    /// </summary>
    public void CopyUserProfile(IList<string> targetIds)
    {
        Dialog.DialogParameters.Clear();
        Dialog.DialogParameters.Add("selectedIds", targetIds);
        Dialog.SetSpecs(350, 400, "CopyUserProfile", User.CopyProfile_DialogTitle);
        Dialog.ShowDialog();
    }

    /// <summary>
    /// Launches a dialog that allows the user to select the team to which
    /// the selected list of users will be assigned.
    /// </summary>
    public void AddToTeam(IList<string> targetIds)
    {
        var srv = ApplicationContext.Current.Services.Get<IGroupContextService>();
        EntityGroupInfo currentEntityGroupInfo = srv.GetGroupContext().CurrentGroupInfo;

        Type entityContext = null;
        switch (currentEntityGroupInfo.EntityName)
        {
            case "User":
                entityContext = typeof(IUser);
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
        var srv = ApplicationContext.Current.Services.Get<IGroupContextService>();
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
        foreach (ITeam team in teams)
        {
            foreach (string selectedTeamId in targetIds)
            {
                IOwnerJoin selectedTeam = EntityFactory.GetByCompositeId(typeof(IOwnerJoin), new string[] {"ParentOwnerId", "ChildOwnerId"}, new object[] {team.Id, selectedTeamId}) as IOwnerJoin;
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
                if (selectedDepart != null)
                    team.RemoveMember(selectedDepart);
            }
        }
    }

    public void ReplaceTeamMember(IList<string> targetIds)
    {
        var srv = ApplicationContext.Current.Services.Get<IGroupContextService>();
        EntityGroupInfo currentEntityGroupInfo = srv.GetGroupContext().CurrentGroupInfo;

        var ehs = ApplicationContext.Current.Services.Get<IEntityHistoryService>();
        object lastId = null;
        switch (currentEntityGroupInfo.EntityName)
        {
            case "User":
                lastId = ehs.GetLastIdForType<IUser>();
                if (lastId != null)
                {
                    targetIds = new List<string> { lastId.ToString() };
                ReplaceTeamMember(targetIds, typeof (IUser));
                }
                break;
            case "Team":
                lastId = ehs.GetLastIdForType<ITeam>();
                if (lastId != null)
                {
                    targetIds = new List<string> { lastId.ToString() };
                ReplaceTeamMember(targetIds, typeof (ITeam));
                }
                break;
            case "Department":
                lastId = ehs.GetLastIdForType<IDepartment>();
                if (lastId != null)
                {
                    targetIds = new List<string> { lastId.ToString() };
                ReplaceTeamMember(targetIds, typeof (IDepartment));
                }
                break;
        }
    }

    public void ReplaceTeamMember(IList<string> targetIds, Type context)
    {
        Dialog.DialogParameters.Clear();
        Dialog.DialogParameters.Add("selectedIds", targetIds);
        Dialog.DialogParameters.Add("context", context);
        Dialog.SetSpecs(200, 350, "ReplaceTeamMember", "");
        Dialog.ShowDialog();
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
    public void AssignRoleToUsers(IList<string> targetIds)
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

    #region Actvity

    public void ScheduleCompleteActivity()
    {
        Dialog.SetSpecs(-1, -1, 600, 500, "ScheduleCompleteActivity");
        Dialog.ShowDialog();
    }

    #endregion
}
