using System;
using System.Collections.Generic;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Text;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using Sage.SalesLogix.Activity;
using Sage.SalesLogix.Client.GroupBuilder;
using Sage.SalesLogix.WebUserOptions;
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using Sage.Platform;
using Sage.SalesLogix.Security;
using Sage.Entity.Interfaces;
using Sage.Platform.Security;
using Sage.Platform.Application.UI;
using Sage.SalesLogix;

public partial class AlertsOptionsPage : Sage.Platform.WebPortal.SmartParts.SmartPart, ISmartPartInfoProvider
{
      // ****  09.22.11 kw   I think this is supposed to be here for the Category, but not sure if that category is correct..
    private string _CategoryActivityAlarm = "ActivityAlarm";

    protected void Page_Load(object sender, EventArgs e)
    {
        //if (!IsPostBack)
        //{
        // initialize

        UserOptionsManager options = new UserOptionsManager(_CategoryActivityAlarm, Server.MapPath(@"App_Data\LookupValues"));

        ddlDefaultSnooze.DataSource = options.GetOptionsList("DefaultSnoozeValues");
        ddlDefaultSnooze.DataTextField = options.DataTextField;
        ddlDefaultSnooze.DataValueField = options.DataValueField;
       
        Page.DataBind();

        //}
    }

    protected void Page_PreRender(object sender, EventArgs e)
    {


        UserOptionsManager options = new UserOptionsManager(_CategoryActivityAlarm, Server.MapPath(@"App_Data\LookupValues"));
       
        Utility.SetSelectedValue(ddlDefaultSnooze, options.GetOptionAsString("DefaultSnooze"));

        chkIncludeUnconfirmedActivities.Checked = options.GetOptionAsBoolean("DisplayAlertConfirmations");
        chkIncludeAlarms.Checked = options.GetOptionAsBoolean("DisplayAlertAlarms");
        chkAlertsPrompt.Checked = options.GetOptionAsBoolean("PromptAlerts");
        chkDispAlertsInToolbar.Checked = options.GetOptionAsBoolean("DisplayAlertsInToolbar");

        // only enable the PromptAlert, Include Alerts and Include Unconfirmed options if DisplayAlertAlarms options has been checked
        chkAlertsPrompt.Enabled = chkDispAlertsInToolbar.Checked;
        chkIncludeAlarms.Enabled = chkDispAlertsInToolbar.Checked;
        chkIncludeUnconfirmedActivities.Enabled = chkDispAlertsInToolbar.Checked; 
     
        GenerateScript();
    }

    private void GenerateScript()
    {
        StringBuilder scp = new StringBuilder();

        scp.AppendLine("function ToggleAlertsEnabled()");
        scp.AppendLine("{");
        scp.AppendFormat("var displayAlerts = document.getElementById('{0}');", chkDispAlertsInToolbar.ClientID);
        scp.AppendFormat("var alertsPrompt = document.getElementById('{0}');", chkAlertsPrompt.ClientID);
        scp.AppendFormat("var includeAlarms = document.getElementById('{0}');", chkIncludeAlarms.ClientID);
        scp.AppendFormat("var inclUncActivities = document.getElementById('{0}');", chkIncludeUnconfirmedActivities.ClientID);
        scp.AppendLine("alertsPrompt.disabled= !displayAlerts.checked;");
        scp.AppendLine("includeAlarms.disabled =  !displayAlerts.checked;");
        scp.AppendLine("inclUncActivities.disabled = !displayAlerts.checked;");
        scp.AppendLine("}");
        ScriptManager.RegisterStartupScript(Page, GetType(), ClientID, scp.ToString(), true);
      
    }

    protected void _save_Click(object sender, EventArgs e)
    {
        // save values
        UserOptionsManager options = new UserOptionsManager(_CategoryActivityAlarm, Server.MapPath(@"App_Data\LookupValues"));
        options.SetOptionAsString("DefaultSnooze", ddlDefaultSnooze.SelectedValue);
        options.SetOptionAsBoolean("DisplayAlertsInToolbar",chkDispAlertsInToolbar.Checked);
        options.SetOptionAsBoolean("PromptAlerts",chkAlertsPrompt.Checked);
        options.SetOptionAsBoolean("DisplayAlertAlarms", chkIncludeAlarms.Checked);
        options.SetOptionAsBoolean("DisplayAlertConfirmations", chkIncludeUnconfirmedActivities.Checked);
        
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
        //tinfo.ImagePath = Page.ResolveClientUrl("~/images/icons/Schdedule_To_Do_24x24.gif");
        return tinfo;
    }

}