using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.ComponentModel;
using Sage.Platform.Orm.Interfaces;
using Sage.Platform.Repository;
using Sage.Platform.WebPortal.Binding;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;

/// <summary>
/// Summary description for AddEditTargetResponse
/// </summary>
public partial class AddEditTargetResponse : EntityBoundSmartPartInfoProvider
{
    private WebEntityListBindingSource _dtsProducts;
    private WebEntityListBindingSource _dtsOpens;
    private WebEntityListBindingSource _dtsClicks;
    private WebEntityListBindingSource _dtsUndeliverables;
    private int _grdProductsdeleteColumnIndex = -2;

    #region Public Methods

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(ITargetResponse); }
    }

    /// <summary>
    /// DataSource for the Products records.
    /// </summary>
    /// <value>The DTS products.</value>
    public WebEntityListBindingSource dtsProducts
    {
        get
        {
            if (_dtsProducts == null)
            {
                _dtsProducts = new WebEntityListBindingSource(typeof(IResponseProduct), EntityType, "ResponseProducts", MemberTypes.Property);
                _dtsProducts.UseSmartQuery = true;
            }
            return _dtsProducts;
        }
    }

    /// <summary>
    /// DataSource for the Marketing Service Open records.
    /// </summary>
    /// <value>The Marketing Service Open datasource.</value>
    public WebEntityListBindingSource dtsOpens
    {
        get
        {
            return _dtsOpens ?? (_dtsOpens = new WebEntityListBindingSource(typeof (IMarketingServiceOpen), EntityType,
                                                                            "MarketingServiceRecipient.MarketingServiceOpens",
                                                                            MemberTypes.Property));
        }
    }

    /// <summary>
    /// DataSouce for the the Marketing Service Click records.
    /// </summary>
    /// <value>The Marketing Service Click datasource.</value>
    public WebEntityListBindingSource dtsClicks
    {
        get
        {
            return _dtsClicks ??
                   (_dtsClicks = new WebEntityListBindingSource(typeof (IMarketingServiceClick), EntityType,
                                                                "MarketingServiceRecipient.MarketingServiceClicks",
                                                                MemberTypes.Property));
        }
    }

    /// <summary>
    /// DataSource for the Marketing Service Undeliverables records.
    /// </summary>
    /// <value>The Marketing Service Undeliverables datasource.</value>
    public WebEntityListBindingSource dtsUndeliverables
    {
        get
        {
            return _dtsUndeliverables ??
                   (_dtsUndeliverables =
                    new WebEntityListBindingSource(typeof (IMarketingServiceUndeliverable), EntityType,
                                                   "MarketingServiceRecipient.MarketingServiceUndeliverables",
                                                   MemberTypes.Property));
        }
    }

    /// <summary>
    /// Gets a value indicating whether this instance is lead.
    /// </summary>
    /// <value><c>true</c> if this instance is lead; otherwise, <c>false</c>.</value>
    public Boolean IsLead
    {
        get { return rdgTargetType.SelectedIndex > 0; }
        set { rdgTargetType.SelectedIndex = value ? 1 : 0; }
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();

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

    #endregion

    #region Private Methods

    /// <summary>
    /// Sets the UI display based on the TargetType selected.
    /// </summary>
    private void SetTargetTypeDisplay()
    {
        if (rdgTargetType.SelectedIndex == 0)
        {
            divContact.Visible = true;
            divLead.Visible = false;
        }
        else
        {
            divContact.Visible = false;
            divLead.Visible = true;
        }
    }

    /// <summary>
    /// Assigns the campaign target.
    /// </summary>
    private void AssignCampaignTarget()
    {
        ITargetResponse targetResponse = BindingSource.Current as ITargetResponse;
        if (targetResponse.Campaign != null)
        {
            ICampaignTarget campaignTarget = targetResponse.CampaignTarget;
            if (targetResponse.CampaignTarget == null)
            {
                ICampaign campaign = (ICampaign)lueCampaign.LookupResultValue;
                Object entityId;
                if (rdgTargetType.SelectedIndex == 1)
                    entityId = targetResponse.Lead.Id;
                else
                    entityId = targetResponse.Contact.Id;
                IRepository<ICampaignTarget> repository = EntityFactory.GetRepository<ICampaignTarget>();
                IQueryable query = (IQueryable)repository;
                IExpressionFactory expFactory = query.GetExpressionFactory();
                ICriteria criteria = query.CreateCriteria()
                    .Add(expFactory.And(
                        expFactory.Eq("EntityId", entityId),
                        expFactory.Eq("Campaign.Id", campaign.Id)));
                IList<ICampaignTarget> targets = criteria.List<ICampaignTarget>();
                if (targets.Count > 0)
                {
                    campaignTarget = targets[0];
                }
                else
                {
                    campaignTarget = EntityFactory.Create<ICampaignTarget>();
                    campaignTarget.Stage = targetResponse.Stage;
                    if (rdgTargetType.SelectedIndex == 1)
                    {
                        if (targetResponse.Lead != null)
                        {
                            campaignTarget.EntityId = targetResponse.Lead.Id.ToString();
                            campaignTarget.TargetType = "Lead";
                        }
                    }
                    else if (targetResponse.Contact != null)
                    {
                        campaignTarget.EntityId = targetResponse.Contact.Id.ToString();
                        campaignTarget.TargetType = "Contact";
                    }
                    campaignTarget.Campaign = targetResponse.Campaign;
                    campaignTarget.Status = GetLocalResourceObject("CampaignTargetStatus").ToString();
                }
            }
            else
            {
                if (rdgTargetType.SelectedIndex == 1)
                {
                    if (targetResponse.Lead != null)
                    {
                        campaignTarget.EntityId = targetResponse.Lead.Id.ToString();
                        campaignTarget.TargetType = "Lead";
                    }
                }
                else if (targetResponse.Contact != null)
                {
                    campaignTarget.EntityId = targetResponse.Contact.Id.ToString();
                    campaignTarget.TargetType = "Contact";
                }
                campaignTarget.Campaign = targetResponse.Campaign;
                campaignTarget.Status = GetLocalResourceObject("CampaignTargetStatus").ToString();
            }
            targetResponse.CampaignTarget = campaignTarget;
        }
        else
        {
            //don't create a campaignTarget
            targetResponse.CampaignTarget = null;
        }
    }

    /// <summary>
    /// Handles the OnCurrentEntitySet event of the BindingSource control.
    /// </summary>
    private void BindingSource_Set(object sender, EventArgs e)
    {
        bool enableEntity = false;
        bool enableCampaign = false;

        rdgTargetType.Enabled = true;
        ITargetResponse targetResponse = BindingSource.Current as ITargetResponse;

        if (DialogService.DialogParameters.ContainsKey("IsLead") || EntityPage.EntityTypeName == "Sage.Entity.Interfaces.ILead, Sage.Entity.Interfaces")
        {
            rdgTargetType.SelectedIndex = 1;
            DialogService.DialogParameters.Remove("IsLead");
        }
        else
        {
            if (rdgTargetType.SelectedIndex == -1) // default to contact if not set
                rdgTargetType.SelectedIndex = 0;
        }

        if (DialogService.DialogParameters.ContainsKey("ResponseDataSource"))
        {
            ITargetResponse targetResponseNew = DialogService.DialogParameters["ResponseDataSource"] as ITargetResponse;
            if (targetResponseNew != null)
            {
                targetResponse.Contact = targetResponseNew.Contact;
                targetResponse.Lead = targetResponseNew.Lead;
                targetResponse.Campaign = targetResponseNew.Campaign;
                if (targetResponseNew.CampaignTarget != null)
                    targetResponse.CampaignTarget = targetResponseNew.CampaignTarget;
                if (String.IsNullOrEmpty(targetResponse.Stage) && targetResponse.CampaignTarget != null)
                    targetResponse.Stage = targetResponse.CampaignTarget.Stage;
                if (targetResponseNew.Id == null)
                    targetResponse.Status = GetLocalResourceObject("Default_TargetStatus").ToString();
            }
        }

        //Adding a new response 
        if (targetResponse.Id == null)
        {
            enableEntity = true;
            enableCampaign = true;
            lueContact.SeedValue = targetResponse.Contact != null ? targetResponse.Contact.Account.Id.ToString() : string.Empty;
        }
        else //Editing a response
        {
            enableCampaign = (targetResponse.Campaign == null);
            rdgTargetType.Enabled = false;
        }
        lueContact.EnableLookup = enableEntity;
        lueContact.Enabled = enableEntity;
        lueLead.EnableLookup = enableEntity;
        lueLead.Enabled = enableEntity;
        lueCampaign.EnableLookup = enableCampaign;
        lueCampaign.Enabled = enableCampaign;

        if (DialogService.DialogParameters.ContainsKey("ResponseDataSource"))
            DialogService.DialogParameters.Remove("ResponseDataSource");
    }

    /// <summary>
    /// Loads the campaign stages.
    /// </summary>
    private void LoadCampaignStages()
    {
        lbxStages.Items.Clear();
        lbxStages.Items.Add(string.Empty);
        ITargetResponse targetResponse = BindingSource.Current as ITargetResponse;
        if (targetResponse == null) return;
        ICampaign campaign = targetResponse.Campaign;
        if (campaign == null) return;
        bool valueFound = false;
        foreach (ICampaignStage stage in campaign.CampaignStages)
        {
            lbxStages.Items.Add(stage.Description);
            if (stage.Description != targetResponse.Stage) continue;
            lbxStages.SelectedValue = stage.Description;
            valueFound = true;
        }

        if (!valueFound && !string.IsNullOrEmpty(targetResponse.Stage))
        {
            lbxStages.Items.Add(targetResponse.Stage);
        }
    }

    /// <summary>
    /// Handles the Init event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Init(object sender, EventArgs e)
    {
        if (Visible)
        {
            if (BindingSource.Current == null)
            {
                BindingSource.OnCurrentEntitySet += BindingSource_Set;
            }
            else
            {
                BindingSource_Set(sender, e);
            }
        }
    }

    /// <summary>
    /// Called when [closing].
    /// </summary>
    protected override void OnClosing()
    {
        DialogService.DialogParameters.Remove("ResponseDataSource");
        DialogService.DialogParameters.Remove("IsLead");
        rdgTargetType.SelectedIndex = 0; // set back to contact
        base.OnClosing();
        Refresh();
    }

    /// <summary>
    /// Called when [form bound].
    /// </summary>
    protected override void OnFormBound()
    {
        if (IsLead)
        {
            lueLead.Text = String.Empty;
            rdgTargetType.SelectedIndex = 1;
        }
        else
        {
            rdgTargetType.SelectedIndex = 0;
        }
        SetTargetTypeDisplay();
        LoadCampaignStages();
        ClientBindingMgr.RegisterDialogCancelButton(cmdCancel);
        ClientBindingMgr.RegisterSaveButton(cmdOK);

        if (dtsOpens.SourceObject == null)
            dtsOpens.SourceObject = BindingSource.Current;
        if (dtsClicks.SourceObject == null)
            dtsClicks.SourceObject = BindingSource.Current;
        if (dtsUndeliverables.SourceObject == null)
            dtsUndeliverables.SourceObject = BindingSource.Current;

        grdProducts.DataSource = dtsProducts2;
        grdProducts.DataBind();
        dtsOpens.Bind();
        dtsClicks.Bind();
        dtsUndeliverables.Bind();
    }

    /// <summary>
    /// Called when [wire event handlers].
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        rdgTargetType.TextChanged += rdgTargetType_ChangeAction;
        cmdOK.Click += cmdOK_ClickAction;
        cmdOK.Click += DialogService.CloseEventHappened;
        cmdCancel.Click += DialogService.CloseEventHappened;
        lueAddProduct.LookupResultValueChanged += lueAddProduct_ChangeAction;
    }

    /// <summary>
    /// Called when [add entity bindings].
    /// </summary>
    protected override void OnAddEntityBindings()
    {
        WebEntityBinding lueLeadSourceLookupResultValueBinding = new WebEntityBinding("LeadSource", lueTargetLeadSource, "LookupResultValue");
        BindingSource.Bindings.Add(lueLeadSourceLookupResultValueBinding);
        WebEntityBinding lueContactValueBinding = new WebEntityBinding("Contact", lueContact, "LookupResultValue", String.Empty, null);
        BindingSource.Bindings.Add(lueContactValueBinding);
        WebEntityBinding lueLeadValueBinding = new WebEntityBinding("Lead", lueLead, "LookupResultValue", String.Empty, null);
        BindingSource.Bindings.Add(lueLeadValueBinding);
        WebEntityBinding lueCampaignLookupResultValueBinding = new WebEntityBinding("Campaign", lueCampaign, "LookupResultValue", String.Empty, null);
        BindingSource.Bindings.Add(lueCampaignLookupResultValueBinding);
        WebEntityBinding dtpResponseDateDateTimeValueBinding = new WebEntityBinding("ResponseDate", dtpResponseDate, "DateTimeValue", String.Empty, null);
        BindingSource.Bindings.Add(dtpResponseDateDateTimeValueBinding);
        WebEntityBinding lbxStagesTextBinding = new WebEntityBinding("Stage", lbxStages, "Text");
        BindingSource.Bindings.Add(lbxStagesTextBinding);
        WebEntityBinding pklResponseStatusPickListValueBinding = new WebEntityBinding("Status", pklResponseStatus, "PickListValue");
        BindingSource.Bindings.Add(pklResponseStatusPickListValueBinding);
        WebEntityBinding pklResponseMethodPickListValueBinding = new WebEntityBinding("ResponseMethod", pklResponseMethod, "PickListValue");
        BindingSource.Bindings.Add(pklResponseMethodPickListValueBinding);
        WebEntityBinding pklInterestPickListValueBinding = new WebEntityBinding("Interest", pklInterest, "PickListValue");
        BindingSource.Bindings.Add(pklInterestPickListValueBinding);
        WebEntityBinding pklInterestLevelPickListValueBinding = new WebEntityBinding("InterestLevel", pklInterestLevel, "PickListValue");
        BindingSource.Bindings.Add(pklInterestLevelPickListValueBinding);
        WebEntityBinding txtCommentsTextBinding = new WebEntityBinding("Comments", txtComments, "Text");
        BindingSource.Bindings.Add(txtCommentsTextBinding);
        dtsClicks.Bindings.Add(new WebEntityListBinding("MarketingServiceRecipient.MarketingServiceClicks", grdClicks));
        dtsClicks.BindFieldNames = new[] { "Id", "LinkName", "LinkURL", "ClickDate" };
        dtsOpens.Bindings.Add(new WebEntityListBinding("MarketingServiceRecipient.MarketingServiceOpens", grdOpens));
        dtsOpens.BindFieldNames = new[] { "Id", "OpenDate", "UnsubscribeDate", "UnsubscribeCampaignName" };
        dtsUndeliverables.Bindings.Add(new WebEntityListBinding("MarketingServiceRecipient.MarketingServiceUndeliverables", grdUndeliverables));
        dtsUndeliverables.BindFieldNames = new[] { "Id", "BounceDate", "BounceCampaignName", "BounceCount", "BounceReason" };

        BindingSource.OnCurrentEntitySet += dtsProducts_OnCurrentEntitySet;
        BindingSource.OnCurrentEntitySet += dtsOpens_OnCurrentEntitySet;
        BindingSource.OnCurrentEntitySet += dtsClicks_OnCurrentEntitySet;
        BindingSource.OnCurrentEntitySet += dtsUndeliverables_OnCurrentEntitySet;
    }

    /// <summary>
    /// Handles the ChangeAction event of the rdgTargetType control.
    /// </summary>
    /// <param   name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void rdgTargetType_ChangeAction(object sender, EventArgs e)
    {
        SetTargetTypeDisplay();
    }

    /// <summary>
    /// Handles the ClickAction event of the cmdOK control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdOK_ClickAction(object sender, EventArgs e)
    {
        ITargetResponse targetResponse = BindingSource.Current as ITargetResponse;

        // contact must be selected
        if (!IsLead)
        {
            if (lueContact.Text.Trim().Length == 0)
                throw new ValidationException(GetLocalResourceObject("error_NoContact.Text").ToString());
        }
        else
        {
            if (lueLead.Text.Trim().Length == 0)
                throw new ValidationException(GetLocalResourceObject("error_NoLead.Text").ToString());
        }

        AssignCampaignTarget();

        if (targetResponse.CampaignTarget != null && !targetResponse.CampaignTarget.PersistentState.Equals(PersistentState.New))
            targetResponse.CampaignTarget.Save();

        targetResponse.Save();
        RefreshData();
    }

    /// <summary>
    /// Handles the RowEditing event of the grdProducts control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewEditEventArgs"/> instance containing the event data.</param>
    protected void grdProducts_RowEditing(object sender, GridViewEditEventArgs e)
    {
        grdProducts.SelectedIndex = e.NewEditIndex;
    }

    /// <summary>
    /// Handles the RowDeleting event of the grdProducts control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewDeleteEventArgs"/> instance containing the event data.</param>
    protected void grdProducts_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {
        grdProducts.SelectedIndex = -1;
    }

    /// <summary>
    /// Gets the index of the GRD parts delete column.
    /// </summary>
    /// <value>The index of the GRD parts delete column.</value>
    protected int grdProductsDeleteColumnIndex
    {
        get
        {
            if (_grdProductsdeleteColumnIndex == -2)
            {
                int bias = (grdProducts.ExpandableRows) ? 1 : 0;
                _grdProductsdeleteColumnIndex = -1;
                int colcount = 0;
                foreach (DataControlField col in grdProducts.Columns)
                {
                    ButtonField btn = col as ButtonField;
                    if (btn != null)
                    {
                        if (btn.CommandName == "Delete")
                        {
                            _grdProductsdeleteColumnIndex = colcount + bias;
                            break;
                        }
                    }
                    colcount++;
                }
            }
            return _grdProductsdeleteColumnIndex;
        }
    }

    /// <summary>
    /// Handles the RowDataBound event of the grdParts control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewRowEventArgs"/> instance containing the event data.</param>
    protected void grdProducts_RowDataBound(object sender, GridViewRowEventArgs e)
    {
        if (e.Row.RowType == DataControlRowType.DataRow)
        {
            if ((grdProductsDeleteColumnIndex >= 0) && (grdProductsDeleteColumnIndex < e.Row.Cells.Count))
            {
                TableCell cell = e.Row.Cells[grdProductsDeleteColumnIndex];
                foreach (Control c in cell.Controls)
                {
                    LinkButton btn = c as LinkButton;
                    if (btn != null)
                    {
                        btn.Attributes.Add("onclick", "javascript: return confirm('" + GetLocalResourceObject("grdProducts.Remove.ConfirmationMessage") + "');");
                        return;
                    }
                }
            }
        }
    }

    protected void grdProducts_RowCommand(object sender, GridViewCommandEventArgs e)
    {
        if (e.CommandName == "Page")
            return;
        int rowIndex;
        if (Int32.TryParse(e.CommandArgument.ToString(), out rowIndex))
        {
            dtsProducts.SelectedIndex = rowIndex;
            if (e.CommandName.Equals("Delete"))
            {
                if (grdProducts.DataKeys[0].Values.Count > 0)
                {
                    ITargetResponse targetResponse = BindingSource.Current as ITargetResponse;
                    if (targetResponse != null)
                    {
                        IResponseProduct responseProduct = EntityFactory.GetRepository<IResponseProduct>().Get(grdProducts.DataKeys[rowIndex].Values[0].ToString());
                        if (responseProduct != null)
                        {
                            targetResponse.ResponseProducts.Remove(responseProduct);
                            responseProduct.Delete();
                            if (PageWorkItem != null)
                            {
                                IPanelRefreshService refresher = PageWorkItem.Services.Get<IPanelRefreshService>();
                                if (refresher != null)
                                    refresher.RefreshAll();
                            }
                        }
                    }
                }
            }
        }
    }

    /// <summary>
    /// Refreshes the data.
    /// </summary>
    protected void RefreshData()
    {
        IPanelRefreshService refreshService = PageWorkItem.Services.Get<IPanelRefreshService>();
        if (refreshService != null)
        {
            refreshService.RefreshAll();
        }
        else
        {
            Response.Redirect(Request.Url.ToString());
        }
    }

    /// <summary>
    /// Handles the ChangeAction event of the lueAddProduct control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void lueAddProduct_ChangeAction(object sender, EventArgs e)
    {
        if (lueAddProduct.LookupResultValue != null)
        {
            ITargetResponse targetResponse = BindingSource.Current as ITargetResponse;
            IProduct product = lueAddProduct.LookupResultValue as IProduct;
            if ((targetResponse != null) && (product != null))
            {
                IResponseProduct responseProduct = EntityFactory.Create<IResponseProduct>();
                responseProduct.TargetResponse = targetResponse;
                responseProduct.Product = product;
                targetResponse.ResponseProducts.Add(responseProduct);
                _dtsProducts2 = null;
            }
        }
    }

    private IList<ComponentView> _dtsProducts2;
    public IList<ComponentView> dtsProducts2
    {
        get
        {
            if (_dtsProducts2 == null)
            {
                var targetResponse = BindingSource.Current as ITargetResponse;
                //IList<IResponseProduct> sortedItems;
                //sortedItems = (from k in targetResponse.ResponseProducts orderby k.Product.Name ascending select k).ToList();
                var list1 = dtsProducts.GetData(0, 0, "Product.Name");
                var list = new List<ComponentView>();
                foreach (ComponentView objpr in list1)
                {
                    IResponseProduct pr = objpr.Component as IResponseProduct;
                    if (pr.Id != null)
                    {
                        String[] propNames = new[] { "Id", "Product.Name", "Product.Description", "Product.ActualId", "Product.Status" };
                        object[] propValues = { pr.Id, pr.Product.Name, pr.Product.Description, pr.Product.ActualId, pr.Product.Status };
                        var view = new ComponentView(propNames, propValues);
                        list.Add(view);
                    }
                }
                foreach (IResponseProduct pr in targetResponse.ResponseProducts)
                {
                    if (pr.Id == null)
                    {
                        String[] propNames = new[] { "Id", "Product.Name", "Product.Description", "Product.ActualId", "Product.Status" };
                        object[] propValues = { pr.Id, pr.Product.Name, pr.Product.Description, pr.Product.ActualId, pr.Product.Status };
                        var view = new ComponentView(propNames, propValues);
                        list.Add(view);
                    }
                }

                _dtsProducts2 = list;
            }
            return _dtsProducts2;
        }
    }

    /// <summary>
    /// Handles the OnCurrentEntitySet event of the dtsproducts control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    void dtsProducts_OnCurrentEntitySet(object sender, EventArgs e)
    {
        if (!Visible || dtsProducts == null) return;
        if (dtsProducts.SourceObject == null)
            dtsProducts.SourceObject = BindingSource.Current;
    }

    /// <summary>
    /// Handles the OnCurrentEntitySet event of the dtsOpens control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    void dtsOpens_OnCurrentEntitySet(object sender, EventArgs e)
    {
        if (!Visible || dtsOpens == null) return;
        if (dtsOpens.SourceObject == null)
            dtsOpens.SourceObject = BindingSource.Current;
    }

    /// <summary>
    /// Handles the OnCurrentEntitySet event of the dtsClicks control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    void dtsClicks_OnCurrentEntitySet(object sender, EventArgs e)
    {
        if (!Visible || dtsClicks == null) return;
        if (dtsClicks.SourceObject == null)
            dtsClicks.SourceObject = BindingSource.Current;
    }

    /// <summary>
    /// Handles the OnCurrentEntitySet event of the dtsUndeliverables control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    void dtsUndeliverables_OnCurrentEntitySet(object sender, EventArgs e)
    {
        if (!Visible || dtsUndeliverables == null) return;
        if (dtsUndeliverables.SourceObject == null)
            dtsUndeliverables.SourceObject = BindingSource.Current;
    }

    #endregion
}