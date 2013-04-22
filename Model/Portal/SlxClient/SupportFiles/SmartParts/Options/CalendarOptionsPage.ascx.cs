using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.SalesLogix.WebUserOptions;
using Sage.Platform.Application.UI;

public partial class CalendarOptionsPage : Sage.Platform.WebPortal.SmartParts.SmartPart, ISmartPartInfoProvider
{
    // ****  09.22.11  kw  I think this should be here, for the category...
    private const string CategoryCalendar = "Calendar";

    protected void Page_Load(object sender, EventArgs e)
    {
        UserOptionsManager options = new UserOptionsManager(CategoryCalendar, Server.MapPath(@"App_Data\LookupValues"));
        // load dropdown lists
        ddlDefaultCalendarView.DataSource = options.GetOptionsList("DefaultCalendarView");
        ddlDefaultCalendarView.DataTextField = options.DataTextField;
        ddlDefaultCalendarView.DataValueField = options.DataValueField;

        ddlNumberOfEvents.DataSource = options.GetOptionsList("NumberOfEvents");
        ddlNumberOfEvents.DataTextField = options.DataTextField;
        ddlNumberOfEvents.DataValueField = options.DataValueField;

        ddlDisplayContactAccount.DataSource = options.GetOptionsList("DisplayContactAccount");
        ddlDisplayContactAccount.DataTextField = options.DataTextField;
        ddlDisplayContactAccount.DataValueField = options.DataValueField;

        ddlDayStart.DataSource = FormatDateTimeList(options.GetOptionsList("DayStart"));
        ddlDayStart.DataTextField = options.DataValueField;
        ddlDayStart.DataValueField = options.DataTextField;

        ddlDayEnd.DataSource = FormatDateTimeList(options.GetOptionsList("DayEnd"));
        ddlDayEnd.DataTextField = options.DataValueField;
        ddlDayEnd.DataValueField = options.DataTextField;

        // NEW to Sawgrass, not in LAN
        ddlDefaultInterval.DataSource = options.GetOptionsList("DefaultInterval");
        ddlDefaultInterval.DataTextField = options.DataValueField;
        ddlDefaultInterval.DataValueField = options.DataValueField;

        ddlDefaultActivityType.DataSource = options.GetOptionsList("DefaultActivityType");
        ddlDefaultActivityType.DataTextField = options.DataTextField;
        ddlDefaultActivityType.DataValueField = options.DataValueField;

        ddlFirstDayOfWeek.DataSource = LocalizeLookup("DayOfWeek", options.GetOptionsList("FirstDayOfWeek"));
        ddlFirstDayOfWeek.DataTextField = options.DataTextField;
        ddlFirstDayOfWeek.DataValueField = options.DataValueField;

        ddlFirstWeekOfYear.DataSource = options.GetOptionsList("FirstWeekOfYear");
        ddlFirstWeekOfYear.DataTextField = options.DataTextField;
        ddlFirstWeekOfYear.DataValueField = options.DataValueField;

        chkOpportunity.Checked = false;
        chkPhoneNumber.Checked = false;
        chkRegarding.Checked = false;
        chkTime.Checked = false;

        // set day checkboxes for common workweek
        chkMon.Checked = true;
        chkTue.Checked = true;
        chkWed.Checked = true;
        chkThu.Checked = true;
        chkFri.Checked = true;

        DataBind();
    }

    protected void Page_PreRender(object sender, EventArgs e)
    {
        UserOptionsManager options = new UserOptionsManager(CategoryCalendar, Server.MapPath(@"App_Data\LookupValues"));
        Utility.SetSelectedValue(ddlDefaultCalendarView, options.GetOptionAsString("DefaultCalendarView"));
        Utility.SetSelectedValue(ddlNumberOfEvents, options.GetOptionAsString("NumEvents"));
        Utility.SetSelectedValue(ddlShowHistoryOnDayView, options.GetOptionAsString("LoadHistoryOnStart"));
        Utility.SetSelectedValue(ddlRememberSelectedUsers, options.GetOptionAsString("RememberUsers"));
        Utility.SetSelectedValue(ddlDisplayContactAccount, options.GetOptionAsString("DisplayContactAccount"));

        string dayStart = options.GetOptionAsString("DayStartTime");
        if (!string.IsNullOrEmpty(dayStart))
        {
            DateTime timeHolder = DateTime.Parse(dayStart);
            ddlDayStart.ClearSelection();

            ListItem startItem = ddlDayStart.Items.FindByValue(timeHolder.ToString("t"));
            if (startItem != null)
                startItem.Selected = true;
            else
            {
                startItem = ddlDayStart.Items.FindByText(timeHolder.ToString("t"));
                if (startItem != null)
                    startItem.Selected = true;
            }
        }
        string dayEnd = options.GetOptionAsString("DayEndTime");
        if (!string.IsNullOrEmpty(dayEnd))
        {
            DateTime timeHolder = DateTime.Parse(dayEnd);

            ddlDayEnd.ClearSelection();
            ListItem endItem = ddlDayEnd.Items.FindByValue(timeHolder.ToString("t"));
            if (endItem != null)
                endItem.Selected = true;
            else
            {
                endItem = ddlDayEnd.Items.FindByText(timeHolder.ToString("t"));
                if (endItem != null)
                    endItem.Selected = true;
            }
        }

        chkOpportunity.Checked = options.GetOptionAsBoolean("ShowOnOpportunities");
        chkPhoneNumber.Checked = options.GetOptionAsBoolean("ShowOnPhoneNumber");
        chkRegarding.Checked = options.GetOptionAsBoolean("ShowOnRegarding");
        chkTime.Checked = options.GetOptionAsBoolean("ShowOnTime");
        chkMon.Checked = options.GetOptionAsBoolean("WorkWeekMon");
        chkTue.Checked = options.GetOptionAsBoolean("WorkWeekTue");
        chkWed.Checked = options.GetOptionAsBoolean("WorkWeekWed");
        chkThu.Checked = options.GetOptionAsBoolean("WorkWeekThu");
        chkFri.Checked = options.GetOptionAsBoolean("WorkWeekFri");
        chkSat.Checked = options.GetOptionAsBoolean("WorkWeekSat");
        chkSun.Checked = options.GetOptionAsBoolean("WorkWeekSun");

        Utility.SetSelectedValue(ddlDefaultInterval, options.GetOptionAsString("DefaultInterval"));
        Utility.SetSelectedValue(ddlDefaultActivityType, options.GetOptionAsString("DefaultActivity"));
        Utility.SetSelectedValue(ddlFirstDayOfWeek, options.GetOptionAsString("WeekStart"));
        Utility.SetSelectedValue(ddlFirstWeekOfYear, options.GetOptionAsString("FirstWeekOfYear"));
    }

    protected void Page_PreRenderOld(object sender, EventArgs e)
    {
        CalendarOptions options;
        try
        {
            options = CalendarOptions.Load(Server.MapPath(@"App_Data\LookupValues"));
        }
        catch
        {
            // temporary, as the service throws an exception for options not found
            // the service is not yet complete, but this allows testing of the UI
            options = CalendarOptions.CreateNew(Server.MapPath(@"App_Data\LookupValues"));
        }

        // set user defaults
        Utility.SetSelectedValue(ddlDefaultCalendarView, options.DefaultCalendarView);
        Utility.SetSelectedValue(ddlNumberOfEvents, options.NumberOfEvents);
        Utility.SetSelectedValue(ddlShowHistoryOnDayView, options.ShowHistoryOnDayView);
        Utility.SetSelectedValue(ddlRememberSelectedUsers, options.RememberSelectedUsers);
        Utility.SetSelectedValue(ddlDisplayContactAccount, options.DisplayContactAccount);

        if (!string.IsNullOrEmpty(options.DayStart))
        {
            DateTime timeHolder = DateTime.Parse(options.DayStart);
            ddlDayStart.ClearSelection();

            ListItem startItem = ddlDayStart.Items.FindByValue(timeHolder.ToString("t"));
            if (startItem != null)
                startItem.Selected = true;
            else
            {
                startItem = ddlDayStart.Items.FindByText(timeHolder.ToString("t"));
                if (startItem != null)
                    startItem.Selected = true;
            }
        }

        if (!string.IsNullOrEmpty(options.DayEnd))
        {
            DateTime timeHolder = DateTime.Parse(options.DayEnd);

            ddlDayEnd.ClearSelection();
            ListItem endItem = ddlDayEnd.Items.FindByValue(timeHolder.ToString("t"));
            if (endItem != null)
                endItem.Selected = true;
            else
            {
                endItem = ddlDayEnd.Items.FindByText(timeHolder.ToString("t"));
                if (endItem != null)
                    endItem.Selected = true;
            }
        }

        chkOpportunity.Checked = options.ShowOpportunities;
        chkPhoneNumber.Checked = options.ShowPhoneNumber;
        chkRegarding.Checked = options.ShowRegarding;
        chkTime.Checked = options.ShowTime;
        chkMon.Checked = options.WorkWeekMon;
        chkTue.Checked = options.WorkWeekTue;
        chkWed.Checked = options.WorkWeekWed;
        chkThu.Checked = options.WorkWeekThu;
        chkFri.Checked = options.WorkWeekFri;
        chkSat.Checked = options.WorkWeekSat;
        chkSun.Checked = options.WorkWeekSun;

        Utility.SetSelectedValue(ddlDefaultInterval, options.DefaultInterval);
        Utility.SetSelectedValue(ddlDefaultActivityType, options.DefaultActivityType);
        Utility.SetSelectedValue(ddlFirstDayOfWeek, options.FirstDayOfWeek);
        Utility.SetSelectedValue(ddlFirstWeekOfYear, options.FirstWeekOfYear);

    }

    protected void _save_Click(object sender, EventArgs e)
    {
        UserOptionsManager options = new UserOptionsManager(CategoryCalendar, Server.MapPath(@"App_Data\LookupValues"));
        options.SetOptionAsString("DefaultCalendarView", ddlDefaultCalendarView.SelectedValue);
        options.SetOptionAsString("NumEvents", ddlNumberOfEvents.SelectedValue);
        options.SetOptionAsString("LoadHistoryOnStart", ddlShowHistoryOnDayView.SelectedValue);
        options.SetOptionAsString("RememberUsers", ddlRememberSelectedUsers.SelectedValue);
        options.SetOptionAsString("DisplayContactAccount", ddlDisplayContactAccount.SelectedValue);
        options.SetOptionAsString("DayStartTime", ddlDayStart.SelectedValue);
        options.SetOptionAsString("DayEndTime", ddlDayEnd.SelectedValue);
        options.SetOptionAsString("DefaultInterval", ddlDefaultInterval.SelectedValue);
        options.SetOptionAsString("DefaultActivity", ddlDefaultActivityType.SelectedValue);
        options.SetOptionAsString("WeekStart", ddlFirstDayOfWeek.SelectedValue);
        options.SetOptionAsString("FirstWeekOfYear", ddlFirstWeekOfYear.SelectedValue);
        options.SetOptionAsBoolean("ShowOnOpportunities", chkOpportunity.Checked);
        options.SetOptionAsBoolean("ShowOnPhoneNumber", chkPhoneNumber.Checked);
        options.SetOptionAsBoolean("ShowOnRegarding", chkRegarding.Checked);
        options.SetOptionAsBoolean("ShowOnTime", chkTime.Checked);
        options.SetOptionAsBoolean("WorkWeekMon", chkMon.Checked);
        options.SetOptionAsBoolean("WorkWeekTue", chkTue.Checked);
        options.SetOptionAsBoolean("WorkWeekWed", chkWed.Checked);
        options.SetOptionAsBoolean("WorkWeekThu", chkThu.Checked);
        options.SetOptionAsBoolean("WorkWeekFri", chkFri.Checked);
        options.SetOptionAsBoolean("WorkWeekSat", chkSat.Checked);
        options.SetOptionAsBoolean("WorkWeekSun", chkSun.Checked);
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo tinfo =
            new Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo();
        tinfo.Description = GetLocalResourceObject("PageDescription.Text").ToString();
        tinfo.Title = GetLocalResourceObject("PageDescription.Title").ToString();
        foreach (Control c in LitRequest_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    private IDictionary<string, string> LocalizeLookup(string localizationTag, IDictionary<string, string> lookup)
    {
        IDictionary<string, string> ll = new Dictionary<string, string>();
        foreach (KeyValuePair<string, string> item in lookup)
        {
            //Every thing is back wards in that the key is text and value is the key. this stems from Sage.SalesLogix.Web.UserOptoipns Project where Options based is defined. 
            var localizedText = GetLocalResourceObject(string.Format("{0}_{1}.Text", localizationTag, item.Key));
            ll.Add(localizedText != null ? localizedText.ToString() : item.Key, item.Value);
        }
        return ll;
    }

    public Dictionary<string, string> FormatDateTimeList(Dictionary<string, string> timeList)
    {
        Dictionary<string, string> localDictionary = new Dictionary<string, string>(timeList.Count);
        DateTime timeObj = DateTime.MinValue;
        foreach (KeyValuePair<string, string> entry in timeList)
        {
            timeObj = DateTime.Parse(entry.Key);
            string formattedTime = timeObj.ToString("t");
            localDictionary.Add(entry.Key, formattedTime);
        }
        return localDictionary;
    }
}