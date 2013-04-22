using System;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Entity.Interfaces;
using Sage.Platform.ComponentModel;
using Sage.SalesLogix.CampaignStage;
using Sage.Platform.Application.UI;
using Sage.Platform.Orm.Interfaces;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal;

public partial class SmartParts_Campaign_AddEditStage : EntityBoundSmartPartInfoProvider
{
    private ICampaignStage _stage;
    private string _mode = string.Empty;
    private IPersistentEntity _parentEntity;

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(ICampaignStage); }
    }

    /// <summary>
    /// Called when [add entity bindings].
    /// </summary>
    protected override void OnAddEntityBindings()
    {
        BindingSource.Bindings.Add(new Sage.Platform.WebPortal.Binding.WebEntityBinding("Description", txtDecription, "Text", "", ""));
        BindingSource.Bindings.Add(new Sage.Platform.WebPortal.Binding.WebEntityBinding("Status", pklStatus, "PickListValue", "", ""));
        BindingSource.Bindings.Add(new Sage.Platform.WebPortal.Binding.WebEntityBinding("StartDate", dtStartDate, "DateTimeValue", "", null));
        BindingSource.Bindings.Add(new Sage.Platform.WebPortal.Binding.WebEntityBinding("LeadSource", luLeadSource, "LookupResultValue", "", null));
        BindingSource.Bindings.Add(new Sage.Platform.WebPortal.Binding.WebEntityBinding("EndDate", dtEndDate, "DateTimeValue", "", null));
        BindingSource.Bindings.Add(new Sage.Platform.WebPortal.Binding.WebEntityBinding("Notes", txtComment, "Text", "", ""));
        BindingSource.Bindings.Add(new Sage.Platform.WebPortal.Binding.WebEntityBinding("CampaignCode", txtCode, "Text", "", ""));
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
    /// Called when [wire event handlers].
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        cmdSave.Click += new EventHandler(cmdSave_OnClick);
        cmdSave.Click += new EventHandler(DialogService.CloseEventHappened);
        cmdCancel.Click += new EventHandler(DialogService.CloseEventHappened);
        txtCode.Attributes.Add("onChange", "javascript: return Sage.UI.Forms.AddEditStage.CS_OnCodeChange(this);");
        base.OnWireEventHandlers();
    }

    /// <summary>
    /// Called when [form bound].
    /// </summary>
    protected override void OnFormBound()
    {
        base.OnFormBound();
        _parentEntity = GetParentEntity() as IPersistentEntity;
        _stage = (ICampaignStage)BindingSource.Current;
        if (DialogService.DialogParameters.Count > 0)
        {
            object mode;
            if(DialogService.DialogParameters.TryGetValue("Mode", out mode))
            {
                _mode = mode.ToString();
            }
        }
        LoadView();
    }

    /// <summary>
    /// Ints the register client scripts.
    /// </summary>
    private void IntRegisterClientScripts()
    {
        ScriptManager.RegisterClientScriptInclude(this, GetType(), "AddEditStage", Page.ResolveUrl("~/SmartParts/Campaign/AddEditStage.js"));
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
                tinfo.Title = _stage.Id != null
                                  ? (_mode == "Complete"
                                         ? GetLocalResourceObject("DialogTitleComplete").ToString()
                                         : GetLocalResourceObject("DialogTitleEdit").ToString())
                                  : GetLocalResourceObject("DialogTitleAdd").ToString();
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

    /// <summary>
    /// Handles the RowCommand event of the grdTasks control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewCommandEventArgs"/> instance containing the event data.</param>
    protected void grdTasks_RowCommand(object sender, GridViewCommandEventArgs e)
    {
    }

    /// <summary>
    /// Handles the RowDeleting event of the grdTasks control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewDeleteEventArgs"/> instance containing the event data.</param>
    protected void grdTasks_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {
    }

    /// <summary>
    /// Handles the OnClick event of the cmdSave control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdSave_OnClick(object sender, EventArgs e)
    {
        ICampaignStage stage = BindingSource.Current as ICampaignStage;
        stage.Save();
        IPanelRefreshService refresher = PageWorkItem.Services.Get<IPanelRefreshService>();
        refresher.RefreshAll();
    }

    /// <summary>
    /// Loads the view.
    /// </summary>
    private void LoadView()
    {
        //New Stage
        if (_stage.Id == null)
        {
            _stage.Campaign = (ICampaign)_parentEntity;
            _stage.Status = GetLocalResourceObject("Status_Open").ToString();
            _stage.CampaignCode = _stage.Campaign.CampaignCode;
            _stage.StartDate = DateTime.UtcNow;
        }
        else //Existing Stage
        {
            if (_mode == "Complete")//Complete the stage.
            {
                _stage.EndDate = DateTime.UtcNow;
                _stage.Status = GetLocalResourceObject("Status_Completed").ToString();
            }
        }
        grdTasks.DataSource = _stage.CampaignTasks;
        grdTasks.DataBind();
        LoadBudget(_stage);
    }

    /// <summary>
    /// Loads the budget.
    /// </summary>
    /// <param name="stage">The stage.</param>
    private void LoadBudget(ICampaignStage stage)
    {
        try
        {
            ComponentView budget = Rules.CalculateBudget(stage);
            slxCurActualCost.Text = budget.GetProperties()["ActualCosts"].GetValue(budget).ToString();
            slxCurEstimatedCost.Text = budget.GetProperties()["EstCosts"].GetValue(budget).ToString();
            txtActualHours.Text = string.Format("{0:n}", budget.GetProperties()["ActualHours"].GetValue(budget));
            txtEstimatedHours.Text = string.Format("{0:n}",budget.GetProperties()["EstHours"].GetValue(budget));
        }
        catch
        {
           //Error Calculatig Budget.
        }
    }
}