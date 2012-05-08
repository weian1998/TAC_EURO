using System;
using System.Text;
using System.Web.UI;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.Security;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;

/// <summary>
/// Summary description for invoices for integration contract.
/// </summary>
public partial class ICInvoices : EntityBoundSmartPartInfoProvider
{
    private bool _runActivating;

    /// <summary>
    /// Gets or sets the role security service.
    /// </summary>
    /// <value>The role security service.</value>
    [ServiceDependency]
    public IRoleSecurityService RoleSecurityService { get; set; }

    public override Type EntityType
    {
        get { return typeof(IAccount); }
    }

    protected override void OnAddEntityBindings()
    {
    }

    protected override void OnActivating()
    {
        _runActivating = true;
    }

    private void DoActivating()
    {
        ScriptManager.RegisterClientScriptInclude(this, GetType(), "ICInvoices", Page.ResolveUrl("~/SmartParts/Account/ICInvoices.js"));
        var script = new StringBuilder();
        script.Append(Page.IsPostBack
                          ? "invoice = new Sage.UI.Forms.ICInvoices(); invoice.init({workspace: '" + getMyWorkspace() + "'});"
                          : "dojo.ready(function() {dojo.parser.parse(dojo.query('#element_ICInvoices td.tws-tab-view-body')[0]); invoice = new Sage.UI.Forms.ICInvoices(); invoice.init({workspace: '" + getMyWorkspace() + "'}); });");
        ScriptManager.RegisterStartupScript(this, GetType(), "initialize_ICInvoices", script.ToString(), true);
        IAccount account = BindingSource.Current as IAccount;
        if (account != null && account.GlobalSyncId.HasValue)
        {
            var clientContextService = PageWorkItem.Services.Get<ClientContextService>();
            if (clientContextService != null)
            {
                if (clientContextService.CurrentContext.ContainsKey("OperatingCompany"))
                {
                    clientContextService.CurrentContext["OperatingCompany"] = account.OperatingCompany.Id.ToString();
                }
                else if (account.OperatingCompany != null)
                {
                    clientContextService.CurrentContext.Add("OperatingCompany", account.OperatingCompany.Id.ToString());
                }
                if (clientContextService.CurrentContext.ContainsKey("GlobalSyncId"))
                {
                    clientContextService.CurrentContext["GlobalSyncId"] = account.GlobalSyncId.ToString();
                }
                else
                {
                    clientContextService.CurrentContext.Add("GlobalSyncId", account.GlobalSyncId.ToString());
                }
            }
            //else
            //{
            //    clientContextService.CurrentContext.Remove("OperatingCompany");
            //    clientContextService.CurrentContext.Remove("GlobalSyncId");
            //}
        }
    }

    protected override void OnFormBound()
    {
        EntityPage epage = Page as EntityPage;
        if (epage != null)
            _runActivating = (epage.IsNewEntity || _runActivating);
        if (_runActivating)
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