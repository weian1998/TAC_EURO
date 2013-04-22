using System;
using System.Collections.Generic;
using System.Web.UI;
using Sage.Entity.Interfaces;
using Sage.Platform.ComponentModel;
using Sage.Platform.WebPortal.Binding;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.Application.UI;

/// <summary>
/// Summary description for ICupdatePricing
/// </summary>
public partial class ICUpdatePricing : EntityBoundSmartPartInfoProvider
{
    private bool _loadPricingChanges = true;

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(ISalesOrder); }
    }

    protected override void OnAddEntityBindings()
    {
        //curOriginalTotalPrice binding
        WebEntityBinding curOriginalTotalPriceCurrentCodeBinding = new WebEntityBinding("CurrencyCode", curOriginalTotalPrice, "CurrentCode");
        curOriginalTotalPriceCurrentCodeBinding.IgnoreFLSDisabling = true;
        BindingSource.Bindings.Add(curOriginalTotalPriceCurrentCodeBinding);
        WebEntityBinding curOriginalTotalPriceExchangeRateBinding = new WebEntityBinding("ExchangeRate", curOriginalTotalPrice, "ExchangeRate");
        curOriginalTotalPriceExchangeRateBinding.IgnoreFLSDisabling = true;
        BindingSource.Bindings.Add(curOriginalTotalPriceExchangeRateBinding);
        WebEntityBinding curOriginalTotalPriceTextBinding = new WebEntityBinding("GrandTotal", curOriginalTotalPrice, "Text");
        BindingSource.Bindings.Add(curOriginalTotalPriceTextBinding);
        //curNewTotalPrice binding
        WebEntityBinding curNewTotalPriceCurrentCodeBinding = new WebEntityBinding("CurrencyCode", curNewTotalPrice, "CurrentCode");
        curNewTotalPriceCurrentCodeBinding.IgnoreFLSDisabling = true;
        BindingSource.Bindings.Add(curNewTotalPriceCurrentCodeBinding);
    }

    protected override void OnFormBound()
    {
        if (_loadPricingChanges)
        {
            if (DialogService.DialogParameters.ContainsKey("PriceList"))
            {
                ISalesOrder salesOrder = BindingSource.Current as ISalesOrder;
                lblHeader.Text = String.Format(GetLocalResourceObject("lblHeader.Text").ToString(),
                                               salesOrder.SalesOrderNumber, salesOrder.Account.AccountName);
                grdProducts.DataSource = (IList<ComponentView>)DialogService.DialogParameters["PriceList"];
                grdProducts.DataBind();
                if (grdProducts.DataKeys.Count > 0)
                {
                    curNewTotalPrice.Text = grdProducts.DataKeys[0].Values[0].ToString();
                }
                ClientBindingMgr.RegisterDialogCancelButton(btnCancel);
            }
        }
    }

    protected void btnOK_ClickAction(object sender, EventArgs e)
    {
        ISalesOrder salesOrder = BindingSource.Current as ISalesOrder;
        bool submitSalesOrder = Convert.ToBoolean(DialogService.DialogParameters["SubmitSalesOrder"].ToString());
        salesOrder.CompleteUpdatedErpPricingLines(submitSalesOrder);
        Response.Redirect(Request.Url.ToString());
    }

    protected void btnCancel_ClickAction(object sender, EventArgs e)
    {
        ISalesOrder salesOrder = BindingSource.Current as ISalesOrder;
        salesOrder.CleanUpErpPricingLines();
    }

    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        btnOK.Click += btnOK_ClickAction;
        btnOK.Click += DialogService.CloseEventHappened;
        btnOK.Click += Refresh;
        btnCancel.Click += btnCancel_ClickAction;
        btnCancel.Click += DialogService.CloseEventHappened;
    }

    /// <summary>
    /// Called when the dialog is closing.
    /// </summary>
    protected override void OnClosing()
    {
        DialogService.DialogParameters.Remove("SubmitSalesOrder");
        DialogService.DialogParameters.Remove("PriceList");
        _loadPricingChanges = false;
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
        foreach (Control c in ICUpdatePricing_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    #endregion
}