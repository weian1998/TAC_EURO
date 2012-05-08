using System;
using System.Drawing;
using System.Web.UI;
using System.Collections.Generic;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.ComponentModel;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.BusinessRules;
using Sage.SalesLogix.SelectionService;
using Sage.SalesLogix.Services.Integration;
using Sage.SalesLogix.Web.SelectionService;
using Sage.Platform.WebPortal;
using TimeZone = Sage.Platform.TimeZone;

public partial class AccountingTasksTasklet : UserControl, ISmartPartInfoProvider
{
    [ServiceDependency]
    private static IRoleSecurityService RoleSecurityService { get; set; }
    private static TimeZone _timeZone;
    private static ISalesOrder _currentSOEntity;

    /// <summary>
    /// Gets or sets the dialog service.
    /// </summary>
    /// <value>The dialog service.</value>
    [ServiceDependency]
    public IWebDialogService DialogService { get; set; }

    /// <summary>
    /// Gets or sets an instance of the Refresh Service.
    /// </summary>
    /// <value>The refresh service.</value>
    [ServiceDependency]
    public IPanelRefreshService RefreshService { set; get; }

    private static TimeZone TimeZone
    {
        get
        {
            if (_timeZone == null)
            {
                var context = ApplicationContext.Current.Services.Get<IContextService>(true);
                _timeZone = (TimeZone)context["TimeZone"];
            }
            return _timeZone;
        }
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        ScriptManager.GetCurrent(Page).Scripts.Add(
            new ScriptReference("~/SmartParts/TaskPane/AccountingTasks/AccountingTasks.js"));
        EntityPage page = Page as EntityPage;
        if (page != null && page.EntityContext != null)
        {
            if (page.EntityContext.EntityType.Equals(typeof (IAccount)))
            {
                LoadAccountTasks(page);
            }
            else if (page.EntityContext.EntityType.Equals(typeof (ISalesOrder)))
            {
                LoadSOTasks(page);
            }
        }
    }

    private void LoadAccountTasks(EntityPage page)
    {
        if (page.IsDetailMode)
        {
            divEntityAccountList.Style.Add("display", "none");
            divEntityAccountDetails.Style.Add("display", "block");
            IAccount account = EntityFactory.GetRepository<IAccount>().Get(page.EntityContext.EntityID);
            if (account == null)
            {
                return;
            }
            if (BusinessRuleHelper.IsIntegrationContractEnabled())
            {
                if (account.PromotedToAccounting.HasValue && account.PromotedToAccounting.Value)
                {
                    lblLinkAccount.Text = GetLocalResourceObject("lblLinkAnotherAccount.Caption").ToString();
                    lblNotLinkedStatus.Visible = false;
                    lblLinkedStatus.Visible = true;
                    IAppIdMapping slxFeed = IntegrationHelpers.GetSlxAccountingFeed();
                    lblLinkAccount.Enabled = !slxFeed.RestrictToSingleAccount.HasValue ||
                                             !slxFeed.RestrictToSingleAccount.Value;
                    updateAccountPanel.Update();
                }
                else
                {
                    lblLinkAccount.Text = GetLocalResourceObject("lblLinkAccount.Caption").ToString();
                    lblNotLinkedStatus.Visible = true;
                    lblLinkedStatus.Visible = false;
                    lblLinkAccount.Enabled = true;
                }
            }
            else
            {
                rowlnkLinkAccount.Style.Add("display", "none");
                rowlnkLinkAccount_List.Style.Add("display","none");    
                rowlnkLinkStatus.Style.Add("display","none");
            }
            lblLastUpdate.Text = String.Format(GetLocalResourceObject("lblLastUpdate.Caption").ToString(),
                                               TimeZone.UTCDateTimeToLocalTime((DateTime) account.ModifyDate));
            if (page.IsNewEntity)
            {
                updateAccountPanel.Update();
            }
        }
        else
        {
            divEntityAccountList.Style.Add("display", "block");
            divEntityAccountDetails.Style.Add("display", "none");
            lblLinkStatus.Visible = false;
            if (!BusinessRuleHelper.IsIntegrationContractEnabled())
            {
                rowlnkLinkAccount.Style.Add("display", "none");
                rowlnkLinkAccount_List.Style.Add("display", "none");
                rowlnkLinkStatus.Style.Add("display", "none");
            }
        }
    }

    private void LoadSOTasks(EntityPage page)
    {
        if (page.IsDetailMode)
        {
            divEntitySalesOrder.Style.Add("display", "block");
            _currentSOEntity = EntityFactory.GetRepository<ISalesOrder>().Get(page.EntityContext.EntityID);
            rowCheckPrices.Style.Add("display", "none");
            rowSOSubmit.Style.Add("display", "none");
            rowSOStatus.Style.Add("display", "block");
            divSOLastUpdate.Style.Add("display", "block");
            lblStatus.ForeColor = lblSOStatus.ForeColor;
            Sage.Platform.SData.IAppIdMappingService mappingService = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.SData.IAppIdMappingService>(true);
            if (!mappingService.IsIntegrationEnabled())
            {
                rowSOStatus.Style.Add("display", "none");
                divSOLastUpdate.Style.Add("display", "none");
            }
            else
            {
                bool isOpen = true;
                if (!String.IsNullOrEmpty(_currentSOEntity.ERPSalesOrder.ERPStatus))
                {
                    isOpen =
                        (_currentSOEntity.ERPSalesOrder.ERPStatus.Equals(
                            GetLocalResourceObject("ERPStatus_Open").ToString()) ||
                         _currentSOEntity.ERPSalesOrder.ERPStatus.Equals(GetLocalResourceObject("ERPStatus_Rejected").ToString()));
                }
                lblStatus.Text = _currentSOEntity.ERPSalesOrder.ERPStatus;
                //sales order has never been submitted
                if (!_currentSOEntity.GlobalSyncId.HasValue && isOpen)
                {
                    rowCheckPrices.Style.Add("display", "block");
                    rowSOSubmit.Style.Add("display", "block");
                }
                else if (_currentSOEntity.GlobalSyncId.HasValue && !isOpen)
                {
                    lblStatus.ForeColor = Color.Red;
                    rowCheckPrices.Style.Add("display", "none");
                    rowSOSubmit.Style.Add("display", "none");
                }
            }
            if (mappingService.IsIntegrationEnabled())
            {
                lblSOSubmittedOn.Text = String.Format(GetLocalResourceObject("lblSoSubmittedOn.Caption").ToString(),
                                                      TimeZone.UTCDateTimeToLocalTime(
                                                          (DateTime) _currentSOEntity.ModifyDate),
                                                      _currentSOEntity.ModifyUser);
            }
            if (page.IsNewEntity)
            {
                updateSOPanel.Update();
            }
        }
    }

    protected void lnkLinkAccount_Click(object sender, EventArgs e)
    {
        string caption = GetLocalResourceObject("LinkAccounting.Caption").ToString();
        DialogService.SetSpecs(200, 200, 250, 600, "SelectOperatingAccount", caption, true);
        string id = GetSelectedRecord();
        if (!String.IsNullOrEmpty(id))
        {
            if (DialogService.DialogParameters.ContainsValue("LinkAccountSelectedId"))
            {
                DialogService.DialogParameters.Remove("LinkAccountSelectedId");
            }
            DialogService.DialogParameters.Add("LinkAccountSelectedId", id);
        }
        DialogService.ShowDialog();
    }

    protected void lnkCheckPrices_Click(object sender, EventArgs e)
    {
        if (ValidateErpSalesOrder())
        {
            ShowCheckPrice(GetSelectedRecord(), false);
        }
    }

    protected void lnkSubmitSalesOrder_Click(object sender, EventArgs e)
    {
        if (ValidateErpSalesOrder(true))
        {
            if (_currentSOEntity.Account == null || !_currentSOEntity.Account.PromotedToAccounting.HasValue ||
                    (_currentSOEntity.Account.PromotedToAccounting.HasValue && !_currentSOEntity.Account.PromotedToAccounting.Value))
            {
                throw new ValidationException(GetLocalResourceObject("Error_Account_NotPromoted").ToString());
            }
            ShowCheckPrice(_currentSOEntity.Id.ToString(), true);
        }
    }

    private bool ValidateErpSalesOrder()
    {
        return ValidateErpSalesOrder(false);
    }

    private bool ValidateErpSalesOrder(bool requirePromotion)
    {
        if (_currentSOEntity != null)
        {
            bool promoted = false;
            if (_currentSOEntity.OperatingCompany == null)
            {
                throw new ValidationException(
                    GetLocalResourceObject("Error_Account_NotPromoted").ToString());
            }
            if (_currentSOEntity.OperatingCompany.Enabled.HasValue && !_currentSOEntity.OperatingCompany.Enabled.Value)
            {
                throw new ValidationException(
                    String.Format(GetLocalResourceObject("Error_IntegrationFeed_Disabled").ToString(),
                                  _currentSOEntity.OperatingCompany.Name));
            }
            //ensure that this account is linked to this opperating company
            foreach (IAccountOperatingCompany oppCompany in _currentSOEntity.Account.AccountOperatingCompanies)
            {
                if (oppCompany.IntegrationApplication.Equals(_currentSOEntity.OperatingCompany))
                {
                    promoted = true;
                    break;
                }
            }
            if ((!promoted) && (requirePromotion))
            {
                throw new ValidationException(
                    GetLocalResourceObject("Error_Account_NotPromoted").ToString());
            }
            if (_currentSOEntity.SalesOrderItems.Count <= 0)
            {
                throw new ValidationException(
                    String.Format(GetLocalResourceObject("Error_CheckPrice_NoProducts").ToString(),
                                    _currentSOEntity.SalesOrderNumber));
            }
            return true;
        }
        return false;
    }

    private void ShowCheckPrice(String entityId, bool submitSalesOrder)
    {
        EntityPage page = Page as EntityPage;
        if (page != null)
        {
            try
            {
                IList<ComponentView> lines = _currentSOEntity.GetUpdatedErpPricingLines();
                string caption = GetLocalResourceObject("CheckPrice_Dialog.Caption").ToString();
                DialogService.SetSpecs(200, 200, 400, 975, "ICUpdatePricing", caption, true);
                DialogService.EntityType = page.EntityContext.EntityType;
                DialogService.DialogParameters.Add("SubmitSalesOrder", submitSalesOrder);
                DialogService.DialogParameters.Add("PriceList", lines);
                DialogService.EntityID = entityId;
                DialogService.ShowDialog();
            }
            catch (Exception ex)
            {
                throw new ValidationException(GetLocalResourceObject("Error_PricingService").ToString());
            }
        }
    }

    protected void lnkUnLinkAccount_Click(object sender, EventArgs e)
    {
        IntegrationManager.RemoveLinkedTradingAccount(GetSelectedRecord());
    }

    private string GetSelectedRecord()
    {
        ISelectionService srv = (ISelectionService) SelectionServiceRequest.GetSelectionService();
        ISelectionContext selectionContext = srv.GetSelectionContext(hfSelections.Value);
        if (selectionContext != null)
        {
            List<string> ids = selectionContext.GetSelectedIds();
            if (ids.Count > 0)
            {
                return ids[0];
            }
        }
        //if none selected, assume it is the current one
        EntityPage page = Page as EntityPage;
        if (page != null && page.EntityContext != null)
        {
            return page.EntityContext.EntityID.ToString();
        }
        return String.Empty;
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        return tinfo;
    }
}
