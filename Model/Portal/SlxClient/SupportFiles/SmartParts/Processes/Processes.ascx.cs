using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;

using Sage.Platform;
using Sage.Platform.Repository;
using Sage.SalesLogix.Web.Controls;
using Sage.Platform.Application.UI;

public partial class SmartParts_Processes_Processes : UserControl, ISmartPartInfoProvider
{
    protected void Page_Load(object sender, EventArgs e)
    {
        RegisterClientScripts();
    }

    protected string BuildProcessesNavigateURL(object ID, object action)
    {
        return
            Page.ResolveClientUrl(string.Format("javascript:ChangeStatusClick('{0}','{1}','{2}','{3}','{4}')", ID,
                                                action, btnChangeStatus.ClientID, hfCurrentId.ClientID,
                                                hfAction.ClientID));
    }

    private void RegisterClientScripts()
    {
        string changeStatusScript = @"function ChangeStatusClick(processId, sAction, btnId, hfId, hfId2)
                                        {
                                            var hidden = document.getElementById(hfId);
                                            hidden.value = processId;

                                            var hidden2 = document.getElementById(hfId2);
                                            hidden2.value = sAction;

                                            document.getElementById(btnId).click();
                                        }";

        ScriptManager.RegisterClientScriptBlock(Page, GetType(), "ChangeStatusClick", changeStatusScript, true);
    }

    protected override void OnPreRender(EventArgs e)
    {
        if (!Visible) return;
        // select list of processes
        SlxGridView1.DataSource = GetProcessList();
        SlxGridView1.DataBind();
    }

    private IList<IProcess> GetProcessList()
    {
        IRepository<IProcess> cRep = EntityFactory.GetRepository<IProcess>();
        IExpressionFactory ep = ((IQueryable)cRep).GetExpressionFactory();

        ICriteria crit = ((IQueryable)cRep).CreateCriteria();

        // limit the number of Processes a user can see by joining to Contact table.
        crit = crit.CreateAlias("Contact", "C");

        // build criteria based on currently selected tab
        switch (ID)
        { 
            case "Starting":
                crit = crit.Add(ep.And(ep.Eq("Suspended", 0), ep.Eq("Status", 2)));
                break;
            case "InProcess":
                crit = crit.Add(ep.And(ep.Eq("Suspended", 0), ep.Eq("Status", 1)));
                break;
            case "Suspended":
                crit = crit.Add(ep.Eq("Suspended", 1));
                break;
            case "Waiting":
                crit = crit.Add(ep.And(ep.Eq("Suspended", 0), ep.Eq("Status", -2)));
                break;
            case "Completed":
                crit = crit.Add(ep.And(ep.Eq("Suspended", 0), ep.Eq("Status", -100)));
                break;
            case "Aborted":
                crit = crit.Add(ep.Eq("Status", -101));
                break;
        }

        if (SlxGridView1.CurrentSortExpression == "LFName")
        {
            crit.AddOrder(SlxGridView1.CurrentSortDirection == "Ascending" ? ep.Asc("C.LastName") : ep.Desc("C.LastName"));
            crit.AddOrder(SlxGridView1.CurrentSortDirection == "Ascending" ? ep.Asc("C.FirstName") : ep.Desc("C.FirstName"));
        }
        else
        {
            if (SlxGridView1.CurrentSortExpression.Length > 0 &&    // is expression specified?
                SlxGridView1.CurrentSortExpression != "C.S.")       // no sorting on ChangeStatus column
                crit.AddOrder(SlxGridView1.CurrentSortDirection == "Ascending" ? ep.Asc(SlxGridView1.CurrentSortExpression) : ep.Desc(SlxGridView1.CurrentSortExpression));
        }
        try
        {
            return crit.List<IProcess>();
        }
        catch
        {
            return null;
        }
    }

    protected bool IsGreenVisible()
    {
        return ID == "Suspended";
    }

    protected bool IsYellowVisible()
    {
        return ID == "Starting" || ID == "InProcess" || ID == "Waiting";
    }

    protected bool IsRedVisible()
    {
        return IsYellowVisible() || IsGreenVisible();
    }

    protected string GetStatusText()
    {
        return ID == "Completed"
                   ? GetLocalResourceObject("Completed").ToString()
                   : (ID == "Aborted" ? GetLocalResourceObject("Aborted").ToString() : "");
    }

    protected void btnChangeStatus_Click(object sender, EventArgs e)
    {
        string processID = hfCurrentId.Value;
        string action = hfAction.Value;

        IProcess process = (IProcess)EntityFactory.GetById(typeof(IProcess), processID);
        if (process == null)
            return;

        bool bSuspended = false;
        int nStatus = 0;

        switch (action)
        { 
            case "Abort":             // Abort process
                nStatus = -101;
                break;
            case "Suspend":          // Suspend process
                bSuspended = true;
                nStatus = process.Status ?? 0;
                break;
            case "Resume":           // Resume process
                nStatus = process.Status ?? 0;
                break;
        }
        process.UpdateStatus(nStatus, bSuspended);
    }

    protected void PageIndexChanging(Object sender, GridViewPageEventArgs e)
    {
        ((SlxGridView)sender).PageIndex = e.NewPageIndex;
        ((SlxGridView)sender).DataBind();
    }

    protected void Sorting(Object sender, GridViewSortEventArgs e)
    { 
    }

    #region ISmartPartInfoProvider Members

    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo tinfo = new Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo();
        foreach (Control c in this.Processes_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        //tinfo.ImagePath = Page.ResolveClientUrl("images/icons/Processes_24x24.gif"); 
        return tinfo;
    }

    #endregion

    protected void cmdSchedProcess_Click(Object sender, ImageClickEventArgs e)
    {
        if (DialogService != null)
        {
            DialogService.SetSpecs(200, 200, 250, 350, "ScheduleProcess", "", true);
            DialogService.ShowDialog();
        }
    }

    private Sage.Platform.WebPortal.Services.IWebDialogService _dialogService;
    [Sage.Platform.Application.ServiceDependency]
    public Sage.Platform.WebPortal.Services.IWebDialogService DialogService
    {
        get { return _dialogService; }
        set { _dialogService = value; }
    }
}
