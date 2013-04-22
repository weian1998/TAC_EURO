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
            row[0] = item.Id;
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
