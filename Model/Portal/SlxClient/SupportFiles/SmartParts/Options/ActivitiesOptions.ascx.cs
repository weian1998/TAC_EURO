using System;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.SalesLogix.WebUserOptions;
using Sage.Platform.Application.UI;

public partial class ActivityOptionsPage : Sage.Platform.WebPortal.SmartParts.SmartPart, ISmartPartInfoProvider
{
    // ****  09.22.11 kw   I think this is supposed to be here for the Category, but not sure if that category is correct..
    private const string CategoryCalendar = "Calendar";
    private const string CategoryActivityAlarm = "ActivityAlarm";
    private const string CategoryMeeting = "ActivityMeetingOptions";
    private const string CategoryPhoneCall = "ActivityPhoneOptions";
    private const string CategoryToDo = "ActivityToDoOptions";
    private const string CategoryPersonalActivity = "ActivityPersonalOptions";

    protected void Page_Load(object sender, EventArgs e)
    {
        UserOptionsManager mgr = new UserOptionsManager(CategoryCalendar, Server.MapPath(@"App_Data\LookupValues"));
        ddlDefaultView.DataSource = mgr.GetOptionsList("DefaultView");
        ddlDefaultView.DataTextField = mgr.DataTextField;
        ddlDefaultView.DataValueField = mgr.DataValueField;
        ddlDefaultFollowupActivity.DataSource = mgr.GetOptionsList("DefaultFollowupActivity");
        ddlDefaultFollowupActivity.DataTextField = mgr.DataTextField;
        ddlDefaultFollowupActivity.DataValueField = mgr.DataValueField;
        ddlCarryOverNotes.DataSource = mgr.GetOptionsList("CarryOverNotes");
        ddlCarryOverNotes.DataTextField = mgr.DataTextField;
        ddlCarryOverNotes.DataValueField = mgr.DataValueField;
        ddlCarryOverAttachments.DataSource = mgr.GetOptionsList("CarryOverAttachments");
        ddlCarryOverAttachments.DataTextField = mgr.DataTextField;
        ddlCarryOverAttachments.DataValueField = mgr.DataValueField;
        ddlDefaultAlarmValue_Meeting.DataSource = mgr.GetOptionsList("DefaultActivityAlarmValues");
        ddlDefaultAlarmValue_Meeting.DataTextField = mgr.DataTextField;
        ddlDefaultAlarmValue_Meeting.DataValueField = mgr.DataValueField;
        ddlDefaultAlarmValue_PhoneCall.DataSource = mgr.GetOptionsList("DefaultActivityAlarmValues");
        ddlDefaultAlarmValue_PhoneCall.DataTextField = mgr.DataTextField;
        ddlDefaultAlarmValue_PhoneCall.DataValueField = mgr.DataValueField;
        ddlDefaultAlarmValue_ToDo.DataSource = mgr.GetOptionsList("DefaultActivityAlarmValues");
        ddlDefaultAlarmValue_ToDo.DataTextField = mgr.DataTextField;
        ddlDefaultAlarmValue_ToDo.DataValueField = mgr.DataValueField;
        ddlDefaultAlarmValue_PersonalActivity.DataSource = mgr.GetOptionsList("DefaultActivityAlarmValues");
        ddlDefaultAlarmValue_PersonalActivity.DataTextField = mgr.DataTextField;
        ddlDefaultAlarmValue_PersonalActivity.DataValueField = mgr.DataValueField;
        ddlDefaultDuration_Meeting.DataSource = mgr.GetOptionsList("DefaultActivityDuration");
        ddlDefaultDuration_Meeting.DataTextField = mgr.DataTextField;
        ddlDefaultDuration_Meeting.DataValueField = mgr.DataValueField;
        ddlDefaultDuration_PhoneCall.DataSource = mgr.GetOptionsList("DefaultPhoneCallDuration");
        ddlDefaultDuration_PhoneCall.DataTextField = mgr.DataTextField;
        ddlDefaultDuration_PhoneCall.DataValueField = mgr.DataValueField;
        ddlDefaultDuration_ToDo.DataSource = mgr.GetOptionsList("DefaultActivityDuration");
        ddlDefaultDuration_ToDo.DataTextField = mgr.DataTextField;
        ddlDefaultDuration_ToDo.DataValueField = mgr.DataValueField;
        ddlDefaultDuration_PersonalActivity.DataSource = mgr.GetOptionsList("DefaultActivityDuration");
        ddlDefaultDuration_PersonalActivity.DataTextField = mgr.DataTextField;
        ddlDefaultDuration_PersonalActivity.DataValueField = mgr.DataValueField;
        chkPastDue.Checked = false;
        chkTimelessMeeting.Checked = false;
        chkTimelessPhoneCall.Checked = false;
        chkTimelessToDo.Checked = false;
        chkTimelessPersonalActivity.Checked = false;
        chkRolloverMeeting.Enabled = false;
        chkRolloverPhoneCall.Enabled = false;
        chkRolloverToDo.Enabled = false;
        chkRolloverPersonalActivity.Enabled = false;
        Page.DataBind();
    }

    protected void Page_PreRender(object sender, EventArgs e)
    {
        UserOptionsManager mgr = new UserOptionsManager(CategoryActivityAlarm, Server.MapPath(@"App_Data\LookupValues"));

        Utility.SetSelectedValue(ddlDefaultView, mgr.GetOptionAsString("DefaultView", CategoryActivityAlarm));
        Utility.SetSelectedValue(ddlDefaultFollowupActivity, mgr.GetOptionAsString("DefaultFollowUpType", CategoryCalendar));
        Utility.SetSelectedValue(ddlCarryOverNotes, mgr.GetOptionAsString("CarryOverNotes", CategoryCalendar));
        Utility.SetSelectedValue(ddlCarryOverAttachments, mgr.GetOptionAsString("CarryOverAttachments", CategoryCalendar));

        SetSelectedMinValue(ddlDefaultAlarmValue_Meeting, mgr.GetOptionAsString("AlarmLead", CategoryMeeting), true);
        SetSelectedMinValue(ddlDefaultAlarmValue_PhoneCall, mgr.GetOptionAsString("AlarmLead", CategoryPhoneCall), true);
        SetSelectedMinValue(ddlDefaultAlarmValue_ToDo, mgr.GetOptionAsString("AlarmLead", CategoryToDo), true);
        SetSelectedMinValue(ddlDefaultAlarmValue_PersonalActivity, mgr.GetOptionAsString("AlarmLead", CategoryPersonalActivity), true);

        Utility.SetSelectedValue(ddlDefaultDuration_Meeting, mgr.GetOptionAsString("Duration", CategoryMeeting));
        Utility.SetSelectedValue(ddlDefaultDuration_PhoneCall, mgr.GetOptionAsString("Duration", CategoryPhoneCall));
        Utility.SetSelectedValue(ddlDefaultDuration_ToDo, mgr.GetOptionAsString("Duration", CategoryToDo));
        Utility.SetSelectedValue(ddlDefaultDuration_PersonalActivity, mgr.GetOptionAsString("Duration", CategoryPersonalActivity));

        chkRolloverMeeting.Enabled = chkTimelessMeeting.Checked = mgr.GetOptionAsBoolean("Timeless", CategoryMeeting);
        chkRolloverPhoneCall.Enabled = chkTimelessPhoneCall.Checked = mgr.GetOptionAsBoolean("Timeless", CategoryPhoneCall);
        chkRolloverToDo.Enabled = chkTimelessToDo.Checked = mgr.GetOptionAsBoolean("Timeless", CategoryToDo);
        chkRolloverPersonalActivity.Enabled = chkTimelessPersonalActivity.Checked = mgr.GetOptionAsBoolean("Timeless", CategoryPersonalActivity);

        chkRolloverMeeting.Checked = mgr.GetOptionAsBoolean("Autorollover", CategoryMeeting);
        chkRolloverPhoneCall.Checked = mgr.GetOptionAsBoolean("Autorollover", CategoryPhoneCall);
        chkRolloverToDo.Checked = mgr.GetOptionAsBoolean("Autorollover", CategoryToDo);
        chkRolloverPersonalActivity.Checked = mgr.GetOptionAsBoolean("Autorollover", CategoryPersonalActivity);

        chkPastDue.Checked = mgr.GetOptionAsBoolean("DisplayPastDueInToolBar", CategoryActivityAlarm);
        GenerateScript();
    }

    private string GetWorkSpace()
    {
        StringBuilder sb = new StringBuilder();
        sb.Append("{");
        sb.AppendFormat("chkPastDueID:'{0}',", chkPastDue.ClientID);
        sb.AppendFormat("chkTimelessMeetingID:'{0}',", chkTimelessMeeting.ClientID);
        sb.AppendFormat("chkTimelessPhoneCallID:'{0}',", chkTimelessPhoneCall.ClientID);
        sb.AppendFormat("chkTimelessToDoID:'{0}',", chkTimelessToDo.ClientID);
        sb.AppendFormat("chkTimelessPersonalID:'{0}',", chkTimelessPersonalActivity.ClientID);
        sb.AppendFormat("chkRolloverMeetingID:'{0}',", chkRolloverMeeting.ClientID);
        sb.AppendFormat("chkRolloverPhoneCallID:'{0}',", chkRolloverPhoneCall.ClientID);
        sb.AppendFormat("chkRolloverToDoID:'{0}',", chkRolloverToDo.ClientID);
        sb.AppendFormat("chkRolloverPersonalID:'{0}'", chkRolloverPersonalActivity.ClientID);
        sb.Append("}");

        return sb.ToString();
    }

    private void GenerateScript()
    {
        ScriptManager.RegisterClientScriptInclude(this, GetType(), "ActivityOptions", Page.ResolveUrl("~/SmartParts/Options/ActivityOptions.js"));
        var script = new StringBuilder();
        script.Append(" Sage.UI.Forms.ActivityOptions.init(" + GetWorkSpace() + " );");
        ScriptManager.RegisterStartupScript(this, GetType(), "initialize_ActivityOptions", script.ToString(), true);
    }

    protected void _save_Click(object sender, EventArgs e)
    {
        UserOptionsManager mgr = new UserOptionsManager(CategoryActivityAlarm, Server.MapPath(@"App_Data\LookupValues"));
        mgr.SetOptionAsString("DefaultView", CategoryActivityAlarm, ddlDefaultView.SelectedValue);
        mgr.SetOptionAsString("DefaultFollowUpType", CategoryCalendar, ddlDefaultFollowupActivity.SelectedValue);
        mgr.SetOptionAsString("CarryOverNotes", CategoryCalendar, ddlCarryOverNotes.SelectedValue);
        mgr.SetOptionAsString("CarryOverAttachments", CategoryCalendar, ddlCarryOverAttachments.SelectedValue);
        mgr.SetOptionAsString("AlarmLead", CategoryMeeting, ddlDefaultAlarmValue_Meeting.SelectedValue);
        mgr.SetOptionAsString("AlarmLead", CategoryToDo, ddlDefaultAlarmValue_ToDo.SelectedValue);
        mgr.SetOptionAsString("AlarmLead", CategoryPhoneCall, ddlDefaultAlarmValue_PhoneCall.SelectedValue);
        mgr.SetOptionAsString("AlarmLead", CategoryPersonalActivity, ddlDefaultAlarmValue_PersonalActivity.SelectedValue);
        mgr.SetOptionAsString("Duration", CategoryMeeting, ddlDefaultDuration_Meeting.SelectedValue);
        mgr.SetOptionAsString("Duration", CategoryToDo, ddlDefaultDuration_ToDo.SelectedValue);
        mgr.SetOptionAsString("Duration", CategoryPhoneCall, ddlDefaultDuration_PhoneCall.SelectedValue);
        mgr.SetOptionAsString("Duration", CategoryPersonalActivity, ddlDefaultDuration_PersonalActivity.SelectedValue);
        mgr.SetOptionAsBoolean("Timeless", CategoryMeeting, chkTimelessMeeting.Checked);
        mgr.SetOptionAsBoolean("Timeless", CategoryPhoneCall, chkTimelessPhoneCall.Checked);
        mgr.SetOptionAsBoolean("Timeless", CategoryToDo, chkTimelessToDo.Checked);
        mgr.SetOptionAsBoolean("Timeless", CategoryPersonalActivity, chkTimelessPersonalActivity.Checked);
        mgr.SetOptionAsBoolean("Autorollover", CategoryMeeting, chkRolloverMeeting.Checked);
        mgr.SetOptionAsBoolean("Autorollover", CategoryPhoneCall, chkRolloverPhoneCall.Checked);
        mgr.SetOptionAsBoolean("Autorollover", CategoryToDo, chkRolloverToDo.Checked);
        mgr.SetOptionAsBoolean("Autorollover", CategoryPersonalActivity, chkRolloverPersonalActivity.Checked);
        mgr.SetOptionAsBoolean("DisplayPastDueInToolBar", CategoryActivityAlarm, chkPastDue.Checked);
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo tinfo = new Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo();
        tinfo.Description = GetLocalResourceObject("PageDescription.Text").ToString();
        tinfo.Title = GetLocalResourceObject("PageDescription.Title").ToString();
        foreach (Control c in this.LitRequest_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    private void SetSelectedMinValue(ListControl lc, string value, bool enabled)
    {
        if (enabled)
        {
            if (lc.Items.FindByValue(value) != null)
            {
                lc.SelectedValue = value;
            }
            else
            {
                if (!string.IsNullOrEmpty(value))
                {
                    int minValue = 0;
                    try
                    {
                        minValue = Convert.ToInt32(value);
                        ListItem newItem = new ListItem();
                        newItem.Value = value;
                        newItem.Text = GetMinText(minValue);
                        newItem.Selected = true;
                        lc.Items.Add(newItem);
                    }
                    catch (Exception)
                    {

                    }
                }
            }
        }
        else
        {
            if (lc.Items.FindByValue("0") != null)
            {
                lc.SelectedValue = "0";
            }
        }
    }

    private string GetMinText(int value)
    {
        string minText = "Custom";
        double n = 0;
        if (value <= 60)
        {
            minText = string.Format("{0} Minutes", value);
        }
        else if ((value > 60) && (value <= 1080))
        {
            n = (value / 1080);
            minText = string.Format("{0} Hours", n);
        }
        else if ((value > 1080) && (value <= 1440))
        {
            n = (value / 1440);
            minText = string.Format("{0} Days", n);
        }
        else if ((value > 1440) && (value <= 10080))
        {
            n = (value / 10080);
            minText = string.Format("{0} Weeks", n);
        }
        else
        {
            n = (value / 60);
            minText = string.Format("{0} Minutes", n);
        }
        return minText;
    }
}