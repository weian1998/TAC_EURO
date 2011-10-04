using System;
using System.Collections.Generic;
using System.Data;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.Platform.Security;
using Sage.SalesLogix.Activity;

public class ActivityFacade
{
    private static string CurrentUserId
    {
        get { return ApplicationContext.Current.Services.Get<IUserService>(true).UserId.Trim(); }
    }

    /// <summary>
    /// Binds the leader list to the current user's calendar access list.
    /// Inserts the user calendar for the selected user if it does not exist. This case would occur if 
    /// the current user does not have access to the selected user's calendar.  
    /// </summary>
    /// <param name="list">The list of user calendars.</param>
    /// <param name="selectedUserId">The selected user id.</param>
    public static void BindLeaderList(DropDownList list, string selectedUserId)
    {
        if (list.Items.Count > 1) return; // already loaded
        list.Items.Clear();
        bool selectedUserInList = false;
        List<UserCalendar> userCalendar = UserCalendar.GetCurrentUserCalendarList();
        foreach (UserCalendar uc in userCalendar)
        {
            if (uc.AllowAdd.HasValue && uc.AllowAdd.Value) // == true
            {
                if (uc.UserId.ToUpper().Trim() == selectedUserId.ToUpper().Trim()) selectedUserInList = true;
                ListItem listItem = new ListItem(uc.UserName, uc.CalUser.Id.ToString());
                list.Items.Add(listItem);
            }
        }
        UserCalendar suc = UserCalendar.GetUserCalendarById(selectedUserId);
        if (suc != null)
        {
            //Verify that we have the exact right userid.  i.e. 'ADMIN    ' may be trimmed to 'ADMIN'
            selectedUserId = suc.CalUser.Id.ToString();
            if (!selectedUserInList)
            {
                ListItem newItem = new ListItem(suc.UserName, suc.CalUser.Id.ToString());
                list.Items.Add(newItem);
            }
        }

        ListItem selected = list.Items.FindByValue(selectedUserId);
        if (selected == null)
        {
            selected = new ListItem(selectedUserId, selectedUserId);
            list.Items.Add(selected);
        }
        list.SelectedIndex = list.Items.IndexOf(selected);
    }

    #region ScheduleCompleteActivity helper

    public static DataTable GetActivitiesForUser(string entityName, string entityId)
    {
        if (string.IsNullOrEmpty(entityName) || string.IsNullOrEmpty(entityId))
            return BuildDataTable();

        const bool includeUnconfirmed = false;
        const bool expandRecurrences = false;

        IList<Activity> list = new List<Activity>();
        IList<Activity> activities = Activity.GetActivitiesForEntity(
            entityName, entityId, includeUnconfirmed, expandRecurrences);

        foreach (Activity a in activities)
        {
            if (a.UserId == CurrentUserId)
            {
                list.Add(a);
            }
        }

        return MapToDataTable(list);
    }

    private static DataTable MapToDataTable(IEnumerable<Activity> results)
    {
        DataTable dataTable = BuildDataTable();

        foreach (Activity item in results)
        {
            DataRow row = dataTable.NewRow();
            row[0] = item.ActivityId;
            row[1] = item.Type;
            row[2] = item.StartDate;
            row[3] = item.Timeless;
            row[4] = item.Notes;
            dataTable.Rows.Add(row);
        }

        return dataTable;
    }

    private static DataTable BuildDataTable()
    {
        var dataTable = new DataTable();
        dataTable.Columns.Add(new DataColumn("ActivityID"));
        dataTable.Columns.Add(new DataColumn("Type", typeof(ActivityType)));
        dataTable.Columns.Add(new DataColumn("StartDate", typeof(DateTime)));
        dataTable.Columns.Add(new DataColumn("Timeless", typeof(bool)));
        dataTable.Columns.Add(new DataColumn("Notes"));
        return dataTable;
    }

    #endregion
}
