using System;
using System.Web.UI;
using Sage.Entity.Interfaces;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.SmartParts;
using System.Text;

/// <summary>
/// Summary description for invoices for integration contract.
/// </summary>
public partial class ICInvoices : EntityBoundSmartPartInfoProvider
{
    public override Type EntityType
    {
        get { return typeof(IAccount); }
    }

    protected override void OnAddEntityBindings()
    {
    }

    private void DoActivating()
    {
        IAccount account = BindingSource.Current as IAccount;
        string operatingCompanyId = String.Empty;
        string globalSyncId = String.Empty;
        if (account != null && account.GlobalSyncId != null && account.OperatingCompany != null)
        {
            operatingCompanyId = account.OperatingCompany.Id.ToString();
            globalSyncId = account.GlobalSyncId.ToString();
        }

        var script = new StringBuilder();
        script.AppendLine(
            @"require([
            'dojo/ready',
            'Sage/MainView/IntegrationContract/InvoiceRTDV'
        ], function (ready, InvoiceRTDV) {");

        var baseScript = string.Format(
            "window.setTimeout(function() {{ window.invoiceRTDV = new InvoiceRTDV({{ 'workspace': '{0}', 'tabId': '{1}', 'placeHolder': '{2}', 'operatingCompanyId': '{3}', 'globalSyncId': '{4}' }}); invoiceRTDV.loadSalesInvoices(); }}, 1);",
            getMyWorkspace(),
            ID,
            sdgrdInvoices_Grid.ClientID,
            operatingCompanyId,
            globalSyncId);

        if (!Page.IsPostBack)
        {
            script.AppendFormat("ready(function() {{ {0}; }} );", baseScript);
        }
        else
        {
            script.AppendLine(baseScript);
        }
        script.AppendLine("});"); // end require
        ScriptManager.RegisterStartupScript(this, GetType(), "InvoiceRTDV", script.ToString(), true);
    }

    protected override void OnFormBound()
    {
        DoActivating();
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        if (BindingSource != null && BindingSource.Current != null)
        {
            tinfo.Description = BindingSource.Current.ToString();
            tinfo.Title = BindingSource.Current.ToString();
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
}