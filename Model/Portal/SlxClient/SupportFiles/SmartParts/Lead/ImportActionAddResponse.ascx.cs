using System;
using System.Web.UI;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Services.Import.Actions;
using Sage.SalesLogix.Services.Import;
using Sage.Entity.Interfaces;
using Sage.Platform;

public partial class ImportActionAddResponse :EntityBoundSmartPartInfoProvider 
{
    #region Public Methods

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(IImportHistory); }
    }

    /// <summary>
    /// Gets or sets the action.
    /// </summary>
    /// <value>The action.</value>
    public ActionAddResponse Action { get; set; }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in ImportActionAddResponse_LTools.Controls)
        {
            tinfo.LeftTools.Add(c);
        }
        foreach (Control c in ImportActionAddResponse_CTools.Controls)
        {
            tinfo.CenterTools.Add(c);
        }
        foreach (Control c in ImportActionAddResponse_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        tinfo.Title = GetLocalResourceObject("Title").ToString();
        return tinfo;
               
    }

    #endregion

    #region Private Methods

    /// <summary>
    /// Override this method to add bindings to the currrently bound smart part
    /// </summary>
    protected override void OnAddEntityBindings()
    {
    }

    /// <summary>
    /// Sets the state of the action.
    /// </summary>
    private void SetActionState()
    {
        ImportManager importManager = GetImportManager();
        Action = importManager.ActionManager.GetAction("AddResponse") as ActionAddResponse;
        Action.HydrateChanges();
        if (Action == null) return;
        if (!Action.Initialized)
        {
            dtpResponseDate.DateTimeValue = DateTime.UtcNow;
            pklResponseStatus.PickListValue = GetLocalResourceObject("DefaultResponseStatus").ToString();
            ImportTargetProperty tpLeadSource = importManager.EntityManager.GetEntityProperty("LeadSource");
            if (tpLeadSource != null && !String.IsNullOrEmpty(tpLeadSource.DefaultValue.ToString()))
            {
                ILeadSource ls = EntityFactory.GetById<ILeadSource>(tpLeadSource.DefaultValue);
                if (ls != null)
                {
                    lueResponseLeadSource.LookupResultValue = ls;
                    lueResponseLeadSource.Text = ls.Description;
                }
            }
            txtComments.Text = Action.Response.Comments;
            pklResponseMethod.PickListValue = Action.Response.ResponseMethod;
            lueCampaign.LookupResultValue = Action.Response.Campaign;
            lbxStages.SelectedValue = Action.Response.Stage;
            pklInterest.PickListValue = Action.Response.Interest;
            pklInterestLevel.PickListValue = Action.Response.InterestLevel;

            if (Mode.Value == "")
            {
                Action.Initialized = true;
                Mode.Value = "ADD";
            }
        }
        else
        {

            if (!String.IsNullOrEmpty(Action.Response.LeadSource))
            {
                ILeadSource ls = EntityFactory.GetById<ILeadSource>(Action.Response.LeadSource);
                if (ls != null)
                {
                    lueResponseLeadSource.LookupResultValue = ls;
                    lueResponseLeadSource.Text = ls.Description;
                }
            }

            txtComments.Text = Action.Response.Comments;
            dtpResponseDate.DateTimeValue = Action.Response.ResponseDate;
            pklResponseStatus.PickListValue = Action.Response.Status;
            pklResponseMethod.PickListValue = Action.Response.ResponseMethod;
            lueCampaign.LookupResultValue = Action.Response.Campaign;
            lbxStages.SelectedValue = Action.Response.Stage;
            pklInterest.PickListValue = Action.Response.Interest;
            pklInterestLevel.PickListValue = Action.Response.InterestLevel;
        }
    }

    /// <summary>
    /// Saves the state of the action.
    /// </summary>
    private void SaveActionState(bool setInt)
    {
        ImportManager importManager = GetImportManager();
        Action = importManager.ActionManager.GetAction("AddResponse") as ActionAddResponse;
        Action.Response.Comments = txtComments.Text;
        Action.Response.LeadSource = lueResponseLeadSource.LookupResultValue != null
                                         ? ((ILeadSource) lueResponseLeadSource.LookupResultValue).Id.ToString()
                                         : String.Empty;
        Action.Response.ResponseDate = dtpResponseDate.DateTimeValue;
        Action.Response.Status = pklResponseStatus.PickListValue;
        Action.Response.ResponseMethod = pklResponseMethod.PickListValue;
        Action.Response.Campaign = lueCampaign.LookupResultValue as ICampaign;
        Action.Response.Stage = lbxStages.SelectedValue;
        Action.Response.Interest = pklInterest.PickListValue;
        Action.Response.InterestLevel = pklInterestLevel.PickListValue;

        if (setInt)
        {
            Action.Initialized = true;
            Action.Active = true;
        }
        Action.SaveChanges();
        Page.Session["importManager"] = importManager;
    }

    /// <summary>
    /// Loads the campaign stages.
    /// </summary>
    private void LoadCampaignStages()
    {
        lbxStages.Items.Clear();
        lbxStages.Items.Add(string.Empty);

        ICampaign campaign = Action.Response.Campaign;
        if (campaign != null)
        {
            foreach (ICampaignStage cs in campaign.CampaignStages)
            {
                lbxStages.Items.Add(cs.Description);
            }
        }
    }

    /// <summary>
    /// Gets the import manager.
    /// </summary>
    /// <returns></returns>
    private ImportManager GetImportManager()
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager == null)
        {
            DialogService.ShowMessage("error_ImportManager_NotFound");
        }
        return importManager;
    }

    #endregion

    /// <summary>
    /// Handles the Load event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Load(object sender, EventArgs e)
    {
    }

    /// <summary>
    /// Called when the smartpart has been bound.  Derived components should override this method to run code that depends on entity context being set and it not changing.
    /// </summary>
    protected override void OnFormBound()
    {
        base.OnFormBound();
        if (ClientBindingMgr != null)
        {   // register these with the ClientBindingMgr so they can do their thing without causing the dirty data warning message...
            ClientBindingMgr.RegisterBoundControl(lueResponseLeadSource);
            ClientBindingMgr.RegisterBoundControl(dtpResponseDate);
            ClientBindingMgr.RegisterBoundControl(pklResponseStatus);
            ClientBindingMgr.RegisterBoundControl(pklResponseMethod);
            ClientBindingMgr.RegisterBoundControl(pklInterest);
            ClientBindingMgr.RegisterBoundControl(pklInterestLevel);
            ClientBindingMgr.RegisterBoundControl(lueCampaign);
            ClientBindingMgr.RegisterDialogCancelButton(btnCancel);
        }
        if (Visible)
        {
            SetActionState();
        }
    }

    /// <summary>
    /// Called when [wire event handlers].
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        btnSave.Click += btnSave_OnClick;
        btnSave.Click += DialogService.CloseEventHappened;
        btnCancel.Click += DialogService.CloseEventHappened;
        btnCancel.Click += btnCancel_OnClick;

        base.OnWireEventHandlers();
    }

    /// <summary>
    /// Handles the OnClick event of the btnSave control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnSave_OnClick(object sender, EventArgs e)
    {
         SaveActionState(true);
         IPanelRefreshService refresher = PageWorkItem.Services.Get<IPanelRefreshService>();
         if (refresher != null)
         {
             refresher.RefreshAll();
         }
    }

    /// <summary>
    /// Handles the OnClick event of the btnCancel control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnCancel_OnClick(object sender, EventArgs e)
    {
        ImportManager importManager = GetImportManager();
        Action = importManager.ActionManager.GetAction("AddResponse") as ActionAddResponse;
        if (Mode.Value == "ADD")
        {
            Action.Initialized = false;
            Action.Active = false;
            Action.Response.LeadSource = string.Empty;
            Page.Session["importManager"] = importManager;
        }
    }


    /// <summary>
    /// Called when [result value changed].
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void OnResultValueChanged(object sender, EventArgs e)
    {
        SaveActionState(false);
        LoadCampaignStages();
        Action.Response.Stage = String.Empty;
    }
}