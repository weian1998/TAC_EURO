using System;
using System.Data;
using System.Drawing;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Text;
using Sage.Entity.Interfaces;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform;
using Sage.Platform.Orm;
using Sage.SalesLogix.Web.Controls;
using Sage.Platform.WebPortal;
using Sage.Platform.Application.UI;

/// <summary>
/// 
/// </summary>
public partial class SmartParts_StagesAndTasks : EntityBoundSmartPartInfoProvider 
{
    private ICampaign _campaign;

    /// <summary>
    /// Called when [add entity bindings].
    /// </summary>
    protected override void OnAddEntityBindings()
    {
    }

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(ICampaign); }
    }

    /// <summary>
    /// Called when [form bound].
    /// </summary>
    protected override void OnFormBound()
    {
        LoadView();
        base.OnFormBound();
    }

    /// <summary>
    /// Called when [wire event handlers].
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        btnAddStage.Click += new ImageClickEventHandler(btnAddStage_ClickAction);
        base.OnWireEventHandlers();
    }

    /// <summary>
    /// Called when [register client scripts].
    /// </summary>
    protected override void OnRegisterClientScripts()
    {
        base.OnRegisterClientScripts();
        IntRegisterClientScripts();
    }

    /// <summary>
    /// Loads the view.
    /// </summary>
    private void LoadView()
    {
        _campaign = GetParentEntity() as ICampaign;
        LoadGrid();
    }

    /// <summary>
    /// Ints the register client scripts.
    /// </summary>
    protected void IntRegisterClientScripts()
    {
        string script = GetLocalResourceObject("StagesAndTasks_ClientScript").ToString();
        StringBuilder sb = new StringBuilder(script);
        ScriptManager.RegisterStartupScript(Page, GetType(), "StagesAndTasks", sb.ToString(), false);
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        if (GetLocalResourceObject("Title") != null)
        {
            tinfo.Title = GetLocalResourceObject("Title").ToString();
        }
        foreach (Control c in Stages_LTools.Controls)
        {
            tinfo.LeftTools.Add(c);
        }
        foreach (Control c in Stages_CTools.Controls)
        {
            tinfo.CenterTools.Add(c);
        }
        foreach (Control c in Stages_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    /// <summary>
    /// Handles the ClickAction event of the btnAddStage control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnAddStage_ClickAction(object sender, EventArgs e)
    {
        LoadStageView(GetLocalResourceObject("DialogCaption_AddStage").ToString(), "Add", String.Empty);
    }

    /// <summary>
    /// Handles the RowDataBound event of the grdStages control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewRowEventArgs"/> instance containing the event data.</param>
    protected void grdStages_RowDataBound(object sender, GridViewRowEventArgs e)
    {
        if (e.Row.RowType == DataControlRowType.DataRow)
        {
            DataRowView dr = (DataRowView) e.Row.DataItem;
            
            if (dr["Type"].ToString() == "TASK")
            {
                e.Row.Cells[0].Style.Value = "margin-left:20px";
                e.Row.Cells[5].Text = String.Empty;
                LinkButton editTask = (LinkButton)e.Row.Cells[6].Controls[0];
                editTask.Text = GetLocalResourceObject("grdStages.EditTask.RowCommand").ToString();
                LinkButton completeTask = (LinkButton)e.Row.Cells[7].Controls[0];
                completeTask.Text = GetLocalResourceObject("grdStages.CompleteTask.RowCommand").ToString();
                LinkButton deleteCommnad = (LinkButton)e.Row.Cells[8].Controls[0];
                deleteCommnad.Text = GetLocalResourceObject("grdStages.DeleteTask.RowCommand").ToString();
                deleteCommnad.Attributes.Add("onclick", string.Format("javascript: return confirm('{0}');", PortalUtil.JavaScriptEncode(GetLocalResourceObject("DeleteTaskMSG").ToString())));
                
                if (dr["PercentComplete"] != null)
                {
                    Label lblPercent = ((Label)e.Row.FindControl("lblPercent"));
                    if(lblPercent != null)
                    {
                        try
                        {
                            lblPercent.Text = string.Format("{0}%", ((double) dr["PercentComplete"])*100);
                        }
                        catch
                        {
                            lblPercent.Text = string.Empty;
                        }
                    }
                }
                DateTimePicker dtpNeededDate = (DateTimePicker)e.Row.FindControl("dtpNeededDate");
                if (dtpNeededDate != null)
                {
                    try
                    {
                       dtpNeededDate.DateTimeValue =(DateTime)dr["NeededDate"];
                    }
                    catch
                    {
                        dtpNeededDate.Text = string.Empty;
                    }
                }
            }
            if (dr["Type"].ToString() == "STAGE")
            {
                e.Row.Cells[0].ColumnSpan = 5;
                e.Row.Cells[0].HorizontalAlign = HorizontalAlign.Left;
                e.Row.Cells[0].Font.Bold = false;
                e.Row.BackColor = Color.FromArgb(220, 233, 247);
                e.Row.Cells[0].Text = string.Format("{0}: {1}", GetLocalResourceObject("Stage"), dr["Description"]);
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
                LinkButton deleteCommnad = (LinkButton)e.Row.Cells[4].Controls[0];
                deleteCommnad.Attributes.Add("onclick", string.Format("javascript: return confirm('{0}');", PortalUtil.JavaScriptEncode(GetLocalResourceObject("DeleteStageMSG").ToString())));
            }
            if (dr["Type"].ToString() == "PLACE_HOLDER")
            {
                e.Row.Cells[0].ColumnSpan = 9;
                e.Row.Cells[0].HorizontalAlign = HorizontalAlign.Left;
                e.Row.Cells[0].Font.Bold = false;
                e.Row.Cells[0].Style.Value = "margin-left:20px";
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
            }
        }
    }

    /// <summary>
    /// Handles the RowCommand event of the grdStages control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewCommandEventArgs"/> instance containing the event data.</param>
    protected void grdStages_RowCommand(object sender, GridViewCommandEventArgs e)
    {
        int rowIndex = Convert.ToInt32(e.CommandArgument);
        string id = grdStages.DataKeys[rowIndex].Value.ToString();
        string[] result = id.Split(':');
        switch (e.CommandName)
        {
            case "AddTask":
                if (result[1] == "S")
                {
                    LoadTaskView(GetLocalResourceObject("DialogCaption_AddTask").ToString(), "Add", result[0], String.Empty);
                }
                break;
            case "Edit":
                if (result[1] == "S") //Stage
                {
                    LoadStageView(GetLocalResourceObject("DialogCaption_EditStage").ToString(), "Edit", result[0]);
                }
                else if (result[1] == "T") //Task
                {
                    LoadTaskView(GetLocalResourceObject("DialogCaption_EditTask").ToString(), "Edit", String.Empty, result[0]);
                }
                break;
            case "Complete":
                if (result[1] == "S") //Stage
                {
                    LoadStageView(GetLocalResourceObject("DialogCaption_CompleteStage").ToString(), "Complete", result[0]);
                }
                else if (result[1] == "T") //Task
                {
                    LoadTaskView(GetLocalResourceObject("DialogCaption_CompleteTask").ToString(), "Complete", String.Empty, result[0]);
                }
                break;
            case "Delete":
                if (result[1] == "S")  //Stage
                {
                    ICampaignStage stage = EntityFactory.GetById<ICampaignStage>(result[0]);
                    if (stage != null)
                    {
                        stage.Campaign.CampaignStages.Remove(stage);
                        stage.Delete();
                    }
                }
                else if (result[1] == "T") //Task
                {
                    ICampaignTask task = EntityFactory.GetById<ICampaignTask>(result[0]);
                    if (task != null)
                    {
                        task.CampaignStage.CampaignTasks.Remove(task);
                        task.Campaign.CampaignTasks.Remove(task);
                        task.Delete();
                    }
                }
                break;
        }

        if (PageWorkItem != null)
        {
            IPanelRefreshService refresher = PageWorkItem.Services.Get<IPanelRefreshService>();
            if (refresher != null)
            {
                refresher.RefreshAll();
            }
        }
    }

    private void LoadStageView(string dialogCaption, string mode, string entityId)
    {
        if (DialogService != null)
        {
            DialogService.SetSpecs(200, 200, 580, 700, "AddEditStage", dialogCaption, true);
            DialogService.EntityType = typeof(ICampaignStage);
            DialogService.EntityID = entityId;
            DialogService.DialogParameters.Add("Mode", mode);
            DialogService.ShowDialog();
        }
    }

    private void LoadTaskView(string dialogCaption, string mode, string stageId, string entityId)
    {
        if (DialogService != null)
        {
            DialogService.SetSpecs(200, 200, 580, 700, "AddEditTask", dialogCaption, true);
            DialogService.EntityType = typeof(ICampaignTask);
            DialogService.EntityID = entityId;
            if (!String.IsNullOrEmpty(stageId))
            {
                DialogService.DialogParameters.Add("StageId", stageId);
            }
            DialogService.DialogParameters.Add("Mode", mode);
            DialogService.ShowDialog();
        }
    }

    /// <summary>
    /// Handles the RowEditing event of the grdStages control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewEditEventArgs"/> instance containing the event data.</param>
    protected void grdStages_RowEditing(object sender, GridViewEditEventArgs e)
    {
        grdStages.SelectedIndex = e.NewEditIndex;
        e.Cancel = true;
    }

    /// <summary>
    /// Handles the RowDeleting event of the grdStages control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewDeleteEventArgs"/> instance containing the event data.</param>
    protected void grdStages_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {
    }

    /// <summary>
    /// Loads the grid.
    /// </summary>
    private void LoadGrid()
    {
        using (new SessionScopeWrapper(true))
        {
            ICampaign campaign = EntityFactory.GetById<ICampaign>(_campaign.Id);
            grdStages.DataSource = Sage.SalesLogix.Campaign.Rules.GetStageAndTasks(campaign);
            grdStages.DataBind();
        }
    }
}