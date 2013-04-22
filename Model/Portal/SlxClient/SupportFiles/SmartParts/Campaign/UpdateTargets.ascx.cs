using System;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Entity.Interfaces;
using System.Collections.Generic;
using Sage.SalesLogix.PickLists;
using Sage.Platform.ComponentModel;
using Sage.SalesLogix.CampaignTarget;

public partial class SmartParts_Campaign_UpdateTargets : EntityBoundSmartPartInfoProvider
{
    private ICampaign _campaign;
    private TargetSelectedFilterState _filterState;
    private bool _setLastPageIndex;
   
    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(ICampaign); }
    }

    /// <summary>
    /// Called when [add entity bindings].
    /// </summary>
    protected override void OnAddEntityBindings()
    {

    }

    /// <summary>
    /// Handles the Init event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Init(object sender, EventArgs e)
    {
    }

    /// <summary>
    /// Called when [wire event handlers].
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        cmdUpdate.Click += new EventHandler(cmdUpdate_OnClick);
        cmdUpdate.Click += new EventHandler(DialogService.CloseEventHappened);
        cmdCancel.Click += new EventHandler(DialogService.CloseEventHappened);
        ddlOptions.Attributes.Add("onchange", String.Format("javascript:Sage.UI.Forms.UpdateTargets.optionChange('{0}');", ddlOptions.ClientID));
        grdTargets.PageIndexChanging += new GridViewPageEventHandler(grdTargets_PageIndexChanging);
        base.OnWireEventHandlers();
    }
    /// <summary>
    /// Called when [form bound].
    /// </summary>
    /// 
    protected override void OnFormBound()
    {
        base.OnFormBound();
        ClientBindingMgr.RegisterDialogCancelButton(cmdCancel);
        _campaign = (ICampaign) BindingSource.Current;
        if (DialogService.DialogParameters.Count > 0)
        {
            object filterStateObj;
            if (DialogService.DialogParameters.TryGetValue("TargetSelectedFilterState", out filterStateObj))
            {
                _filterState = filterStateObj as TargetSelectedFilterState;
                _filterState.IncludeSelectedOnly = true;
            }
        }
        LoadView();
    }

    /// <summary>
    /// Handles the OnClick event of the cmdUpdate control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdUpdate_OnClick(object sender, EventArgs e)
    {
        UpdateTargets();
    }

    /// <summary>
    /// Handles the PageIndexChanging event of the grdTargets control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewPageEventArgs"/> instance containing the event data.</param>
    protected void grdTargets_PageIndexChanging(object sender, GridViewPageEventArgs e)
    {
        int pageIndex = e.NewPageIndex;
        // if viewstate is off in the GridView then we need to calculate PageCount ourselves
        if (pageIndex > 10000)
        {
            _setLastPageIndex = true;
            grdTargets.PageIndex = 0;
        }
        else
        {
            _setLastPageIndex = false;
            grdTargets.PageIndex = pageIndex;
        }
    }

    /// <summary>
    /// Handles the RowDataBound event of the grdTargets control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewRowEventArgs"/> instance containing the event data.</param>
    protected void grdTargets_RowDataBound(object sender, GridViewRowEventArgs e)
    {
        if (e.Row.RowType == DataControlRowType.DataRow)
        {
            TargetView target = (TargetView)e.Row.DataItem;
            Sage.SalesLogix.Web.Controls.DateTimePicker dtpLastUpdated = (Sage.SalesLogix.Web.Controls.DateTimePicker)e.Row.FindControl("dtpLastUpdated");
            if (dtpLastUpdated != null)
            {
                try
                {
                    dtpLastUpdated.DateTimeValue = target.ModifyDate;
                }
                catch
                {
                    dtpLastUpdated.DateTimeValue = DateTime.MinValue;
                    dtpLastUpdated.Text = string.Empty;
                }
            }
            Sage.SalesLogix.Web.Controls.DateTimePicker dtpResponseDate = (Sage.SalesLogix.Web.Controls.DateTimePicker)e.Row.FindControl("dtpResponseDateGrid");
            if (dtpResponseDate != null)
            {
                try
                {
                    dtpResponseDate.DateTimeValue = target.ResponseDate;
                }
                catch
                {
                    dtpResponseDate.DateTimeValue = DateTime.MinValue;
                    dtpResponseDate.Text = string.Empty;
                }
            }
        }
    }
    
    /// <summary>
    /// Loads the view.
    /// </summary>
    private void LoadView()
    {
        LoadGrid();
        SetControls();
    }

    /// <summary>
    /// Sets the controls.
    /// </summary>
    private void SetControls()
    {
        LoadOptionsDDL();
        LoadStageToDDL(_campaign);
        LoadStageDDL(_campaign);
        LoadPicklistItems("Target Status", ddlToStatus);
        LoadPicklistItems("Response Method", ddlResponseMethods);
        LoadPicklistItems("Response Interest", ddlResponseInterests);
        LoadPicklistItems("Response Interest Level", ddlResponseInterestLevels);

        if (luLeadSource.LookupResultValue != null)
        {
            luLeadSource.Text = luLeadSource.LookupResultValue.ToString();
        }

        if (dtpResponseDate.DateTimeValue == null)
        {
            dtpResponseDate.DateTimeValue = DateTime.UtcNow;
        }

        opt0.Style.Add("display", "none");
        opt1.Style.Add("display", "none");
        opt2.Style.Add("display", "none");
        opt3.Style.Add("display", "none");

        switch (ddlOptions.SelectedIndex)
        {
            case 1:
                opt1.Style.Add("display", "blocked");
                break;
            case 2:
                opt2.Style.Add("display", "blocked");
                break;
            case 3:
                opt3.Style.Add("display", "blocked");
                break;
            default:
                opt0.Style.Add("display", "blocked");
                break;
        }
    }

    /// <summary>
    /// Loads the options DDL.
    /// </summary>
    private void LoadOptionsDDL()
    {
        ddlOptions.Items.Clear();
        ListItem item = new ListItem();

        item = new ListItem {Text = GetLocalResourceObject("Option_Status").ToString(), Value = "0", Selected = true};
        ddlOptions.Items.Add(item);

        item = new ListItem {Text = GetLocalResourceObject("Option_Stage").ToString(), Value = "1"};
        ddlOptions.Items.Add(item);

        item = new ListItem {Text = GetLocalResourceObject("Option_Initial").ToString(), Value = "2"};
        ddlOptions.Items.Add(item);

        item = new ListItem {Text = GetLocalResourceObject("Option_AddResponse").ToString(), Value = "3"};
        ddlOptions.Items.Add(item);
    }

    /// <summary>
    /// Updates the targets by data source.
    /// </summary>
    private void UpdateTargets()
    {
        List<String> targetIds = GetSelecetedTargetIds();
        switch (ddlOptions.SelectedIndex)
        {
            case 0:
                Helpers.UpdateTargets("Status", ddlToStatus.SelectedValue, targetIds);
                break;
            case 1:
                Helpers.UpdateTargets("Stage", ddlToStage.Text, targetIds);
                break;
            case 2:
                Helpers.UpdateTargets("InitialTarget", rdlInitTargets.Text, targetIds);
                break;
            case 3:
                ICampaign campaign = (ICampaign)BindingSource.Current;
                DoAddResponse(targetIds, campaign);
                break;
        }

    }

    /// <summary>
    /// Does the update status.
    /// </summary>
    /// <param name="status">The status.</param>
    private void DoUpdateStatus(string status)
    {
        TargetsViewDataSource ds = GetDataSource();
        Helpers.UpdateTargetStatus(status, ds);
    }

    /// <summary>
    /// Does the update stage.
    /// </summary>
    /// <param name="stage">The stage.</param>
    private void DoUpdateStage(string stage)
    {
        TargetsViewDataSource ds = GetDataSource();
        Helpers.UpdateTargetStage(stage, ds);
    }

    /// <summary>
    /// Does the update init.
    /// </summary>
    /// <param name="initTarget">if set to <c>true</c> [init target].</param>
    private void DoUpdateInit(Boolean initTarget)
    {
        TargetsViewDataSource ds = GetDataSource();
        Helpers.UpdateTargetInit(initTarget, ds);
    }

    private void DoAddResponse(List<String> targetIds, ICampaign campaign)
    {
        string stage = ddlStage.Text;
        string comment = txtComment.Text;
        string responseMethod = ddlResponseMethods.Text;
        string leadSource = luLeadSource.Text;
        string responseInterest = ddlResponseInterests.Text;
        string responseInterestLevel = ddlResponseInterestLevels.Text;
        DateTime? responseDate = dtpResponseDate.DateTimeValue;

        String[] propNames = { "Stage", "Comment", "ResponseMethod", "LeadSource", "ResponseDate", "Interest", "InterestLevel" };
        object[] propValues = { stage, comment, responseMethod, leadSource, responseDate, responseInterest, responseInterestLevel };
        ComponentView responseData = new ComponentView(propNames, propValues);
        Helpers.AddTargetResponses(targetIds, campaign, responseData);
    }

    private List<String> GetSelecetedTargetIds()
    {
        TargetsViewDataSource ds = new TargetsViewDataSource();

        if (DialogService.DialogParameters.Count > 0)
        {
            object filterStateObj;
            if (DialogService.DialogParameters.TryGetValue("TargetSelectedFilterState", out filterStateObj))
            {
                _filterState = filterStateObj as TargetSelectedFilterState;
                _filterState.IncludeSelectedOnly = true;
            }
        }

        ds.SelectedFilterState = _filterState;
        return ds.GetTargetIds(true);
    }

    /// <summary>
    /// Gets the data source.
    /// </summary>
    /// <returns>
    /// 
    /// </returns>
    private TargetsViewDataSource GetDataSource()
    {
        TargetsViewDataSource ds = new TargetsViewDataSource();
        if (DialogService.DialogParameters.Count > 0)
        {
            object filterStateObj;
            if (DialogService.DialogParameters.TryGetValue("TargetSelectedFilterState", out filterStateObj))
            {
                _filterState = filterStateObj as TargetSelectedFilterState;
                _filterState.IncludeSelectedOnly = true;
            }
        }
        ds.SelectedFilterState = _filterState;
        return ds;
    }

    /// <summary>
    /// Loads the stage DDL.
    /// </summary>
    /// <param name="campaign">The campaign.</param>
    private void LoadStageDDL(ICampaign campaign)
    {
        ddlStage.Items.Clear();
        if (campaign != null)
        {
            foreach (ICampaignStage stage in campaign.CampaignStages)
            {
                ddlStage.Items.Add(stage.Description);
            }
        }
    }

    /// <summary>
    /// Loads the stage to DDL.
    /// </summary>
    /// <param name="campaign">The campaign.</param>
    private void LoadStageToDDL(ICampaign campaign)
    {
        ddlToStage.Items.Clear();
        if (campaign != null)
        {
            foreach (ICampaignStage stage in campaign.CampaignStages)
            {
                ddlToStage.Items.Add(stage.Description);
            }
        }
    }

    /// <summary>
    /// Loads the picklist items.
    /// </summary>
    /// <param name="picklistName">Name of the picklist.</param>
    /// <param name="list">The list.</param>
    private static void LoadPicklistItems(String picklistName, DropDownList list)
    {
        list.Items.Clear();
        IList<PickList> items = PickList.GetPickListItemsByName(picklistName, true);
        if (items != null)
        {
            foreach (PickList picklistItem in items)
            {
                var item = new ListItem();
                item.Text = picklistItem.Text;
                item.Value = picklistItem.Text;
                list.Items.Add(item);
            }
        }
    }

    /// <summary>
    /// Loads the grid.
    /// </summary>
    private void LoadGrid()
    {
        grdTargets.DataSource = TargetsObjectDataSource;
        grdTargets.DataBind();
    }

    /// <summary>
    /// Creates the targets view data source.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.ObjectDataSourceEventArgs"/> instance containing the event data.</param>
    protected void CreateTargetsViewDataSource(object sender, ObjectDataSourceEventArgs e)
    {
        TargetsViewDataSource dataSource = new TargetsViewDataSource();
        dataSource.SelectedFilterState = _filterState;
        if (!String.IsNullOrEmpty(grdTargets.SortExpression))
            dataSource.SortExpression = grdTargets.SortExpression;
        dataSource.IsAscending = grdTargets.SortDirection.Equals(SortDirection.Ascending);
        if (_setLastPageIndex)
        {   
            int pageIndex = 0;
            int recordCount = dataSource.GetDataCount();
            int pageSize = grdTargets.PageSize;
            decimal numberOfPages = recordCount / pageSize;
            pageIndex = Convert.ToInt32(Math.Ceiling(numberOfPages));
            grdTargets.PageIndex = pageIndex;
        }
        e.ObjectInstance = dataSource;
    }

    /// <summary>
    /// Disposes the targets view data source.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.ObjectDataSourceDisposingEventArgs"/> instance containing the event data.</param>
    protected void DisposeTargetsViewDataSource(object sender, ObjectDataSourceDisposingEventArgs e)
    {
        //Cancel the event, so that the object will not be Disposed if it implements IDisposable.
        e.Cancel = true;
    }

    /// <summary>
    /// Handles the Sorting event of the grdTargets control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewSortEventArgs"/> instance containing the event data.</param>
    protected void grdTargets_Sorting(object sender, GridViewSortEventArgs e)
    {
    }

    protected override void OnPreRender(EventArgs e)
    {
        base.OnPreRender(e);
        ScriptManager.RegisterClientScriptInclude(this, GetType(), "UpdateTargets", Page.ResolveUrl("~/SmartParts/Campaign/UpdateTargets_ClientScript.js"));
        var script = new StringBuilder();
        if (Page.IsPostBack)
        {
            script.Append("Sage.UI.Forms.UpdateTargets.init(" + GetWorkSpace() + " );");
        }
        else
        {
            script.Append("dojo.ready(function () {Sage.UI.Forms.UpdateTargets.init(" + GetWorkSpace() + ");");
        }
        ScriptManager.RegisterStartupScript(this, GetType(), "initialize_UpdateTargets", script.ToString(), true);
    }

    private string GetWorkSpace()
    {
        StringBuilder sb = new StringBuilder();
        sb.Append("{");
        sb.AppendFormat("optionStatusId:'{0}',", opt0.ClientID);
        sb.AppendFormat("optionStageId:'{0}',", opt1.ClientID);
        sb.AppendFormat("optionInitializeTargetId:'{0}',", opt2.ClientID);
        sb.AppendFormat("optionAddResponseId:'{0}'", opt3.ClientID);
        sb.Append("}");
        return sb.ToString();
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        if (BindingSource != null)
        {
            if (BindingSource.Current != null)
            {
                tinfo.Title = GetLocalResourceObject("DialogTitle").ToString();
            }
        }

        foreach (Control c in Form_LTools.Controls)
        {
            tinfo.LeftTools.Add(c);
        }
        foreach (Control c in Form_CTools.Controls)
        {
            tinfo.CenterTools.Add(c);
        }
        foreach (Control c in Form_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }
}