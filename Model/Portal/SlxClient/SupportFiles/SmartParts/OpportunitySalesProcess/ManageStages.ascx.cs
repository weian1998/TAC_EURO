using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Text;
using System.Collections.Generic;
using Sage.Entity.Interfaces;
using Sage.SalesLogix.Web.Controls;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform;

public partial class SmartParts_OpportunitySalesProcess_ManageStages : EntityBoundSmartPartInfoProvider
{
    private ISalesProcesses _salesProcess = null;
   
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
        get { return typeof(IOpportunity); }
    }

    /// <summary>
    /// Called when [form bound].
    /// </summary>
    protected override void OnFormBound()
    {
        base.OnFormBound();
        LoadView();
    }

    /// <summary>
    /// Called when [wire event handlers].
    /// </summary>
    protected override void OnWireEventHandlers()
    {
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
        string opportunityId = EntityContext.EntityID.ToString();
        LoadSalesProcess(opportunityId);
    }

    /// <summary>
    /// Ints the register client scripts.
    /// </summary>
    protected void IntRegisterClientScripts()
    {
        ScriptManager.RegisterClientScriptInclude(this, GetType(), "ManageStages",
                                          Page.ResolveUrl("~/SmartParts/OpportunitySalesProcess/ManageStages_ClientScript.js"));
        var script = new StringBuilder();
        if (Page.IsPostBack)
        {
            script.Append(" Sage.UI.Forms.ManageStages.init();");
        }
        else
        {
            script.Append("dojo.ready(function() { Sage.UI.Forms.ManageStages.init(); });");
        }
        ScriptManager.RegisterStartupScript(this, GetType(), "initialize_ManageStages", script.ToString(), true);
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        if (GetLocalResourceObject("Title") != null)
        {
            tinfo.Title = GetLocalResourceObject("Title").ToString();
        }
        foreach (Control c in ManageStages_LTools.Controls)
        {
            tinfo.LeftTools.Add(c);
        }
        foreach (Control c in ManageStages_CTools.Controls)
        {
            tinfo.CenterTools.Add(c);
        }
        foreach (Control c in ManageStages_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    /// <summary>
    /// Called when [my dialog closing].
    /// </summary>
    /// <param name="from">From.</param>
    /// <param name="e">The <see cref="Sage.Platform.WebPortal.Services.WebDialogClosingEventArgs"/> instance containing the event data.</param>
    protected override void OnMyDialogClosing(object from, WebDialogClosingEventArgs e)
    {
        base.OnMyDialogClosing(from, e);
        //we nned to refresh the salesprocess page or we will get un wanted postbacks on the Stages DDL.
        Session.Remove("MANAGESTAGESACTIVE");
        IPanelRefreshService refresher = PageWorkItem.Services.Get<IPanelRefreshService>();
        refresher.RefreshAll();
    }

    /// <summary>
    /// Called when [my dialog opening].
    /// </summary>
    protected override void OnMyDialogOpening()
    {
        base.OnMyDialogOpening();
        Session.Add("MANAGESTAGESACTIVE", "T");
    }

    /// <summary>
    /// Loads the sales process.
    /// </summary>
    /// <param name="opportunityId">The opportunity id.</param>
    private void LoadSalesProcess(string opportunityId)
    {
        IOpportunity opp = EntityFactory.GetRepository<IOpportunity>().FindFirstByProperty("Id", opportunityId);
        if( opp != null)
        {
            txtOpportunity.Text = opp.Description;
        }

        ISalesProcesses salesProcess = Sage.SalesLogix.SalesProcess.Helpers.GetSalesProcess(opportunityId);
        _salesProcess = salesProcess;
        if (salesProcess != null)
        {
            txtSalesProcess.Text = salesProcess.Name;
            LoadSnapShot(salesProcess);
            IList<ISalesProcessAudit> list = salesProcess.GetSalesProcessAudits();
            grdStages.DataSource = list;
            grdStages.DataBind();
        }
        else 
        {
            List<ISalesProcessAudit> list = new List<ISalesProcessAudit>(); 
            grdStages.DataSource = list;
            grdStages.DataBind();
        }             
    }

    /// <summary>
    /// Loads the snap shot.
    /// </summary>
    /// <param name="salesProcess">The sales process.</param>
    private void LoadSnapShot(ISalesProcesses salesProcess)
    {
        foreach (ISalesProcessAudit spAudit in salesProcess.SalesProcessAudits)
        {
            if (spAudit.ProcessType == "STAGE")
            {
                if (spAudit.IsCurrent == true)
                {
                    SetSnapShot(spAudit);   
                }
            }
        }
    }

    /// <summary>
    /// Sets the snap shot.
    /// </summary>
    /// <param name="stage">The stage.</param>
    private void SetSnapShot(ISalesProcessAudit stage)
    {
        if (stage != null)
        {
            valueCurrnetStage.Text = stage.StageName;
            valueProbabilty.Text = stage.Probability.ToString() + "%";
            valueDaysInStage.Text = Convert.ToString(this._salesProcess.DaysInStage(stage.Id.ToString()));
            valueEstDays.Text = Convert.ToString(this._salesProcess.EstimatedDaysToClose());
            dtpEstClose.DateTimeValue = (DateTime)this._salesProcess.EstimatedCloseDate();
        }
        else
        {
            valueCurrnetStage.Text = "''";
            valueProbabilty.Text = "0%";
            valueDaysInStage.Text = "0";
            valueEstDays.Text = "0";
            dtpEstClose.DateTimeValue = DateTime.MinValue;
            dtpEstClose.Text = string.Empty;
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
            ISalesProcessAudit spAudit = (ISalesProcessAudit)e.Row.DataItem;
            if ((spAudit.ProcessType == "HEADER") || (spAudit.ProcessType == "FOOTER")||(spAudit.ProcessType == "STEP"))
            {
                e.Row.Cells.Clear();
                return;
            }
            if (spAudit.ProcessType == "STAGE")
            {
                CheckBox chkStageComplete = ((CheckBox)e.Row.FindControl("chkStageComplete"));
                if (chkStageComplete != null)
                {
                    chkStageComplete.Attributes.Add("onClick", string.Format("return Sage.UI.Forms.ManageStages.onCompleteStage('{0}','{1}','{2}');", cmdCompleteStage.ClientID, stageContext.ClientID, spAudit.Id.ToString() + ":" + spAudit.Completed));
                    chkStageComplete.Checked = (spAudit.Completed == true);
                }

                CheckBox chkStageCurrnet = ((CheckBox)e.Row.FindControl("chkStageCurrent"));
                if (chkStageCurrnet != null)
                {
                    chkStageCurrnet.Attributes.Add("onClick", string.Format("return Sage.UI.Forms.ManageStages.onSetCurrent('{0}','{1}','{2}');", cmdSetCurrent.ClientID, currentContext.ClientID, spAudit.Id.ToString() + ":" + spAudit.IsCurrent));
                    chkStageCurrnet.Checked = (spAudit.IsCurrent == true);
                    chkStageCurrnet.Enabled = (spAudit.IsCurrent != true);
                }           

                DateTimePicker dtpStartDate = (DateTimePicker)e.Row.FindControl("dtpStartDate");
                if (dtpStartDate != null)
                {
                    dtpStartDate.SetClientSideChangeHandler(string.Format("Sage.UI.Forms.ManageStages.onStartStageWithDate(this,'{0}','{1}','{2}');", cmdStartDate.ClientID, startDateContext.ClientID, spAudit.Id.ToString()));
                    if (spAudit.StartDate != null)
                    {
                        dtpStartDate.DateTimeValue = (DateTime)spAudit.StartDate;
                    }
                    else
                    {
                        dtpStartDate.DateTimeValue = DateTime.MinValue;
                        dtpStartDate.Text = string.Empty;
                    }
                }
                DateTimePicker dtpCompletedDate = (DateTimePicker)e.Row.FindControl("dtpCompleteDate");
                if (dtpCompletedDate != null)
                {
                    dtpCompletedDate.SetClientSideChangeHandler(string.Format("Sage.UI.Forms.ManageStages.onCompleteStageWithDate(this,'{0}','{1}','{2}');", cmdCompleteDate.ClientID, completeDateContext.ClientID, spAudit.Id.ToString()));
                    if (spAudit.CompletedDate != null)
                    {
                        dtpCompletedDate.DateTimeValue = (DateTime)spAudit.CompletedDate;
                    }
                    else
                    {
                        dtpCompletedDate.DateTimeValue = DateTime.MinValue;
                        dtpCompletedDate.Text = string.Empty;
                    }
                }
            }
        }
    }

    /// <summary>
    /// Handles the OnClick event of the cmdCompleteStage control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdCompleteStage_OnClick(object sender, EventArgs e)
    {
        string[] args = stageContext.Value.Split(new Char[] { ':' });
        string spaid = args[0];
        ISalesProcesses salesProcess = Sage.SalesLogix.SalesProcess.Helpers.GetSalesProcess(EntityContext.EntityID.ToString());
        if (args[1] == "False")
        {
            string result = salesProcess.CanCompleteStage(spaid);
            if (result == string.Empty)
            {
                salesProcess.CompleteStage(spaid, DateTime.Now);
                salesProcess.Save();
            }
            else
            {
                if (DialogService != null)
                {
                    DialogService.ShowMessage(result);
                }
            }
        }
        else
        {
            salesProcess.UnCompleteStage(spaid);
            salesProcess.Save();
        }
    }

    /// <summary>
    /// Handles the OnClick event of the cmdSetCurrent control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdSetCurrent_OnClick(object sender, EventArgs e)
    {
        string[] args = currentContext.Value.Split(new Char[] { ':' });
        string spaid = args[0];
        ISalesProcesses salesProcess = Sage.SalesLogix.SalesProcess.Helpers.GetSalesProcess(EntityContext.EntityID.ToString());
        if (args[1] == "False")
        {
            string result = salesProcess.CanMoveToStage(spaid);
            if (result == string.Empty)
            {
                salesProcess.SetToCurrentStage(spaid);
                salesProcess.Save();
            }
            else
            {
                if (DialogService != null)
                {
                    DialogService.ShowMessage(result);
                }
            }
        }
    }

    /// <summary>
    /// Handles the OnClick event of the cmdCompleteDate control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdCompleteDate_OnClick(object sender, EventArgs e)
    {
        string[] args = completeDateContext.Value.Split(new Char[] { ':' });
        string spaid = args[0];
        DateTime completeDate = ResolveDateTime(args[1]);
        ISalesProcesses salesProcess = Sage.SalesLogix.SalesProcess.Helpers.GetSalesProcess(EntityContext.EntityID.ToString());
        string result = salesProcess.CanCompleteStage(spaid);
        if (result == string.Empty)
        {
            salesProcess.CompleteStage(spaid, completeDate);
            salesProcess.Save();
        }
        else
        {
            if (DialogService != null)
            {
                DialogService.ShowMessage(result);
            }
        }
    }

    /// <summary>
    /// Handles the OnClick event of the cmdStartDate control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdStartDate_OnClick(object sender, EventArgs e)
    {
        string[] args = startDateContext.Value.Split(new Char[] { ':' });
        string spaid = args[0];
        DateTime startDate = ResolveDateTime(args[1]);
        ISalesProcesses salesProcess = Sage.SalesLogix.SalesProcess.Helpers.GetSalesProcess(EntityContext.EntityID.ToString());
        salesProcess.StartStage(spaid, startDate);
        salesProcess.Save();
    }

    /// <summary>
    /// Handles the onDialogOpening event of the DialogService control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void DialogService_onDialogOpening(object sender, EventArgs e)
    {
        if (DialogService.SmartPartMappedID == ID)
        {
            string opportunityId = EntityContext.EntityID.ToString();
            LoadSalesProcess(opportunityId);
        }
    }

    /// <summary>
    /// Handles the onDialogClosing event of the DialogService control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void DialogService_onDialogClosing(object sender, EventArgs e)
    {
        if (DialogService.SmartPartMappedID == ID)
        {
            Response.Redirect(Request.Url.ToString());
        }
    }

    /// <summary>
    /// Resolves the date time.
    /// </summary>
    /// <param name="textDate">The text date.</param>
    /// <returns></returns>
    private DateTime ResolveDateTime(string textDate)
    {
        DateTime result = DateTime.MinValue;
        string[] vals = textDate.Split(',');
        if (vals.Length > 1)
        {
            int year = int.Parse(vals[0]);
            int month = int.Parse(vals[1]);
            int day = int.Parse(vals[2]);
            result = new DateTime(year, month, day, 0, 0, 0);
        }
        return result;
    }
    //public IEnumerable<ScriptDescriptor> GetScriptDescriptors()
    //{
    //    yield break;
    //}
    //public IEnumerable<ScriptReference> GetScriptReferences()
    //{
    //    List<ScriptReference> refs = new List<ScriptReference>();
    //    ScriptReference javRef = new ScriptReference("~/SmartParts/OpportunitySalesProcess/ManageStages_ClientScript.js");
    //    //refs.Add(javRef);
    //    return refs;
    //}
}
