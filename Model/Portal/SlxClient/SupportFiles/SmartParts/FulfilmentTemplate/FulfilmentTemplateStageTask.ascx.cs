﻿using System;
using System.Collections;
using System.Data;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform;
using Sage.Entity.Interfaces;
using Sage.Platform.Application.UI;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.Data;
using Sage.Platform.Repository;
using log4net;
using Sage.Platform.Application;
//using NHibernate;
using Sage.Platform.Framework;
using System.Text;
using System.Data.OleDb;
using System.Collections.Generic;
using Sage.SalesLogix.Web.Controls;
using Sage.Platform.WebPortal;
using System.Drawing;



public partial class SmartParts_FulFilmentTemplate_FulfilmentTemplateStageTask : EntityBoundSmartPartInfoProvider
{
    private IFulFilmentTemplate   _FulfilmentTemplate;
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
    /// Loads the view.
    /// </summary>
    private void LoadView()
    {
        _FulfilmentTemplate = GetParentEntity() as IFulFilmentTemplate ;
        LoadGrid();
    }

    /// <summary>
    /// Loads the grid.
    /// </summary>
    private void LoadGrid()
    {

        IFulFilmentTemplate  fulfilmentTemplate = EntityFactory.GetById<IFulFilmentTemplate>(_FulfilmentTemplate.Id);
        grdStages.DataSource = GetStageAndTasks(fulfilmentTemplate);
        grdStages.DataBind();
       
       
    }
    public static DataTable GetDataTable()
    {
        DataTable table = new DataTable("StagesAndSteps");
        DataColumn column = table.Columns.Add();
        column.ColumnName = "Id";
        column.DataType = typeof(string);
        column.AllowDBNull = true;
        column = table.Columns.Add();
        column.ColumnName = "Type";
        column.DataType = typeof(string);
        column.AllowDBNull = true;
        column = table.Columns.Add();
        column.ColumnName = "Description";
        column.DataType = typeof(string);
        column.AllowDBNull = true;
        column = table.Columns.Add();
        column.ColumnName = "Status";
        column.DataType = typeof(string);
        column.AllowDBNull = true;
        column = table.Columns.Add();
        column.ColumnName = "Priority";
        column.DataType = typeof(string);
        column.AllowDBNull = true;
        column = table.Columns.Add();
        column.ColumnName = "NeededDate";
        column.DataType = typeof(DateTime);
        column.AllowDBNull = true;
        column = table.Columns.Add();
        column.ColumnName = "StartDate";
        column.DataType = typeof(DateTime);
        column.AllowDBNull = true;
        column = table.Columns.Add();
        column.ColumnName = "CompletedDate";
        column.DataType = typeof(DateTime);
        column.AllowDBNull = true;
        column = table.Columns.Add();
        column.ColumnName = "WeightedPercentage";
        column.DataType = typeof(double);
        column.AllowDBNull = true;
        column = table.Columns.Add();
        column.ColumnName = "StageSequence";
        column.DataType = typeof(double);
        column.AllowDBNull = true;
        column = table.Columns.Add();
        column.ColumnName = "TaskSequence";
        column.DataType = typeof(double);
        column.AllowDBNull = true;

        return table;
    }

    public static DataTable GetStageAndTasks(IFulFilmentTemplate FulfilmentTemplate)
    {

        DataTable table = GetDataTable();
        DataTable returntable = GetDataTable();
        //=========================================
        //Create Return Table
        //=========================================

        foreach (IFulFilTemplateStage stage in FulfilmentTemplate.FulFilTemplateStages)
        {
            DataRow row = table.NewRow();
            row["id"] = string.Format("{0}:S", stage.Id);
            row["Type"] = "STAGE";
            row["Description"] = stage.Description;
            row["Status"] = stage.Status;
            if (stage.StageSequence == null)
            {
                row["StageSequence"] = 0;
            }
            else
            {
                row["StageSequence"] = stage.StageSequence;
            }
            
            row["TaskSequence"] = 0;
            table.Rows.Add(row);
            if (stage.FulFilTemplateTasks.Count == 0)
            {
                DataRow row2 = table.NewRow();
                row2["id"] = string.Format("{0}:T", "PLACE_HOLDER");
                row2["Type"] = "PLACE_HOLDER";
                row2["Description"] = "There are no tasks assigned to this stage";
                if (stage.StageSequence == null)
                {
                    row2["StageSequence"] = 0;
                }
                else
                {
                    row2["StageSequence"] = stage.StageSequence;
                }
                row2["TaskSequence"] = 0;
                table.Rows.Add(row2);
            }
            else
            {
                foreach (IFulFilTemplateTask  task in stage.FulFilTemplateTasks )
                {
                    DataRow row3 = table.NewRow();
                    row3["id"] = string.Format("{0}:T", task.Id);
                    row3["Type"] = "TASK";
                    row3["Description"] = task.Description;
                    row3["Status"] = task.Status;
                    row3["Priority"] = task.Priority;
                    try
                    {
                        row3["StageSequence"] = stage.StageSequence;
                    }
                    catch
                    {
                        row3["StageSequence"] = 0;
                    }
                    try
                    {
                        row3["TaskSequence"] = task.TaskSequence;
                    }
                    catch
                    {
                        row3["TaskSequence"] = 1;
                    }
                    
                    try
                    {
                        row3["NeededDate"] = task.DueDate;
                    }
                    catch
                    {
                    }
                    try
                    {
                        row3["WeightedPercentage"] = task.WeightedPercentage ;
                    }
                    catch
                    {
                        row3["WeightedPercentage"] = 0;
                    }
                    table.Rows.Add(row3);
                }
                continue;
            }
        }
        //========================================================================
        // Sort by Stage and Task
        // The Select Method just returns an Array of Rows
        //========================================================================
        foreach (DataRow tmpRow in table.Select("", "StageSequence, TaskSequence"))
        {
            DataRow row4 = returntable.NewRow();
            row4["id"] = tmpRow["id"];
            row4["Type"] = tmpRow["Type"];
            row4["Description"] = tmpRow["Description"];
            row4["Status"] = tmpRow["Status"];
            row4["Priority"] = tmpRow["Priority"];
            row4["StageSequence"] = tmpRow["StageSequence"];
            row4["TaskSequence"] = tmpRow["TaskSequence"];
            row4["NeededDate"] = tmpRow["NeededDate"];
            row4["WeightedPercentage"] = tmpRow["WeightedPercentage"];

            returntable.Rows.Add(row4);  
        }
        return returntable;
    }

    /// <summary>
    /// Handles the ClickAction event of the btnAddStage control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnAddStage_ClickAction(object sender, EventArgs e)
    {
       
        if (DialogService != null)
        {
            // InsertChildDialogActionItem
            DialogService.SetSpecs(400, 600, "AddEditFulilmentTemplateStage", "Add Stage");
            DialogService.EntityType = typeof(Sage.Entity.Interfaces.IFulFilTemplateStage);
            DialogService.SetChildIsertInfo(
              typeof(Sage.Entity.Interfaces.IFulFilTemplateStage),
              typeof(Sage.Entity.Interfaces.IFulFilmentTemplate),
              typeof(Sage.Entity.Interfaces.IFulFilTemplateStage).GetProperty("FulFilmentTemplate"),
              typeof(Sage.Entity.Interfaces.IFulFilmentTemplate).GetProperty("FulFilTemplateStages"));
            DialogService.ShowDialog();
        }
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
            DataRowView dr = (DataRowView)e.Row.DataItem;

            if (dr["Type"].ToString() == "TASK")
            {
                e.Row.Cells[0].Style.Value = "margin-left:20px";
                e.Row.Cells[5].Text = String.Empty;
                LinkButton editTask = (LinkButton)e.Row.Cells[6].Controls[0];
                editTask.Text = "Edit Task";
                LinkButton completeTask = (LinkButton)e.Row.Cells[7].Controls[0];
                completeTask.Text = "Complete Task";
                LinkButton deleteCommnad = (LinkButton)e.Row.Cells[8].Controls[0];
                deleteCommnad.Text = "Delete Task";
                deleteCommnad.Attributes.Add("onclick", string.Format("javascript: return confirm('{0}');", PortalUtil.JavaScriptEncode("Are you sure you want to Delete")));

                if (dr["WeightedPercentage"] != null)
                {
                    Label lblPercent = ((Label)e.Row.FindControl("lblPercent"));
                    if (lblPercent != null)
                    {
                        try
                        {
                            lblPercent.Text = string.Format("{0}%", ((double)dr["WeightedPercentage"]) * 100);
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
                        dtpNeededDate.DateTimeValue = (DateTime)dr["NeededDate"];
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
                //e.Row.Cells[0].Font.Bold = false;
                e.Row.Cells[0].Font.Bold = true;
                e.Row.BackColor = Color.FromArgb(220, 233, 247);
                e.Row.Cells[0].Text = string.Format("{0}: {1}", "Stage", dr["Description"].ToString());
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
                e.Row.Cells.RemoveAt(1);
                LinkButton deleteCommnad = (LinkButton)e.Row.Cells[4].Controls[0];
                deleteCommnad.Attributes.Add("onclick", string.Format("javascript: return confirm('{0}');", PortalUtil.JavaScriptEncode("Are You Sure you want to Delete")));
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
        if (e.CommandName.Equals("AddTask"))
        {
            int rowIndex = Convert.ToInt32(e.CommandArgument);
            string id = grdStages.DataKeys[rowIndex].Value.ToString();
            string[] result = id.Split(':');

            if (DialogService != null)
            {
                if (result[1] == "S")
                {
                    //DialogService.SetSpecs(200, 200, 550, 700, "AddEditTask", "Add Task", true);
                    //DialogService.EntityType = typeof(ICampaignTask);
                    //DialogService.DialogParameters.Add("StageId", result[0]);
                    //DialogService.DialogParameters.Add("Mode", "Add");
                    //DialogService.ShowDialog();
                    // InsertChildDialogActionItem
                    DialogService.SetSpecs(400, 700, "AddEditFulFilmentTemplateTask", "Add Task");
                    DialogService.EntityType = typeof(Sage.Entity.Interfaces.IFulFilTemplateTask);
                    //DialogService.SetChildIsertInfo(
                    //  typeof(Sage.Entity.Interfaces.IFulFilTemplateTask),
                    //  typeof(Sage.Entity.Interfaces.IFulFilTemplateStage),
                    //  typeof(Sage.Entity.Interfaces.IFulFilTemplateStage).GetProperty("FulFilmentTemplateStage"),
                    //  typeof(Sage.Entity.Interfaces.IFulFilTemplateStage).GetProperty("FulFilTemplateTasks"));
                    DialogService.DialogParameters.Add("StageId", result[0]);
                    DialogService.ShowDialog();
                }
            }
        }

        if (e.CommandName.Equals("Edit"))
        {
            int rowIndex = Convert.ToInt32(e.CommandArgument);
            string id = grdStages.DataKeys[rowIndex].Value.ToString();
            string[] result = id.Split(':');

            if (DialogService != null)
            {
                if (result[1] == "S")
                {
                    // QFDataGrid
                    DialogService.SetSpecs(400, 600, "AddEditFulilmentTemplateStage", "Edit Stage");
                    DialogService.EntityType = typeof(Sage.Entity.Interfaces.IFulFilTemplateStage);
                    DialogService.EntityID = result[0];
                    DialogService.ShowDialog();
                }
                else if (result[1] == "T")
                {
                    // QFDataGrid
                    DialogService.SetSpecs(400, 700, "AddEditFulFilmentTemplateTask", "Edit Task");
                    DialogService.EntityType = typeof(Sage.Entity.Interfaces.IFulFilTemplateTask);
                    DialogService.EntityID = result[0];
                    DialogService.ShowDialog();
                }
            }
        }
        if (e.CommandName.Equals("Complete"))
        {
            //================================================================
            //  Templates are Not Completed
            //================================================================
            //int rowIndex = Convert.ToInt32(e.CommandArgument);
            //string id = grdStages.DataKeys[rowIndex].Value.ToString();
            //string[] result = id.Split(':');

            //if (DialogService != null)
            //{
            //    if (result[1] == "S")
            //    {
            //        DialogService.SetSpecs(200, 200, 550, 700, "AddEditStage", "Complete Stage", true);
            //        DialogService.EntityType = typeof(ICampaignStage);
            //        DialogService.EntityID = result[0];
            //        DialogService.DialogParameters.Add("Mode", "Complete");
            //        DialogService.ShowDialog();
            //    }
            //    else if (result[1] == "T")
            //    {
            //        DialogService.SetSpecs(200, 200, 550, 700, "AddEditTask", "Complete Task", true);
            //        DialogService.EntityType = typeof(ICampaignTask);
            //        DialogService.EntityID = result[0];
            //        DialogService.DialogParameters.Add("Mode", "Complete");
            //        DialogService.ShowDialog();
            //    }
            //}
        }

        if (e.CommandName.Equals("Delete"))
        {
            int rowIndex = Convert.ToInt32(e.CommandArgument);
            string Id = grdStages.DataKeys[rowIndex].Value.ToString();
            string[] result = Id.Split(':');
            if (result[1] == "S")  //Stage
            {
                IFulFilTemplateStage  stage = EntityFactory.GetById<IFulFilTemplateStage >(result[0]);
                if (stage != null)
                {
                    //stage.Campaign.CampaignStages.Remove(stage);
                    stage.Delete();
                }
            }
            else if (result[1] == "T") //Task
            {
                IFulFilTemplateTask  task = EntityFactory.GetById<IFulFilTemplateTask >(result[0]);
                if (task != null)
                {
                    //task.CampaignStage.CampaignTasks.Remove(task);
                    //task.Campaign.CampaignTasks.Remove(task);
                    task.Delete();
                }
            }

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

    /// <summary>
    /// Handles the RowEditing event of the grdStages control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewEditEventArgs"/> instance containing the event data.</param>
    protected void grdStages_RowEditing(object sender, GridViewEditEventArgs e)
    {
        grdStages.SelectedIndex = e.NewEditIndex;
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
 
    protected void Page_Load(object sender, EventArgs e)
    {

    }

    #region ISmartPartInfoProvider Members

    /// <summary>
    /// Tries to retrieve smart part information compatible with type
    /// smartPartInfoType.
    /// </summary>
    /// <param name="smartPartInfoType">Type of information to retrieve.</param>
    /// <returns>
    /// The <see cref="T:Sage.Platform.Application.UI.ISmartPartInfo"/> instance or null if none exists in the smart part.
    /// </returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        if (BindingSource != null)
        {
            if (BindingSource.Current != null)
            {
                tinfo.Description = BindingSource.Current.ToString();
                tinfo.Title = BindingSource.Current.ToString();
            }
        }

        foreach (Control c in Controls)
        {
            SmartPartToolsContainer cont = c as SmartPartToolsContainer;
            if (cont != null)
            {
                switch (cont.ToolbarLocation)
                {
                    case SmartPartToolsLocation.Right:
                        foreach (Control tool in cont.Controls)
                        {
                            tinfo.RightTools.Add(tool);
                        }
                        break;
                    case SmartPartToolsLocation.Center:
                        foreach (Control tool in cont.Controls)
                        {
                            tinfo.CenterTools.Add(tool);
                        }
                        break;
                    case SmartPartToolsLocation.Left:
                        foreach (Control tool in cont.Controls)
                        {
                            tinfo.LeftTools.Add(tool);
                        }
                        break;
                }
            }
        }

        return tinfo;
    }
    public override Type EntityType
    {
        get { return typeof(IFulFilmentTemplate); }
    }

    protected override void OnAddEntityBindings()
    {
        //throw new NotImplementedException();
    }
    /// <summary>
    /// Derived components should override this method to wire up event handlers.
    /// </summary>
   
    #endregion
}
