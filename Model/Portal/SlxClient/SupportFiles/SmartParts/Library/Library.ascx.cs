using System;
using System.Web.UI;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.SmartParts;

public partial class SmartParts_Library_Library : UserControl, ISmartPartInfoProvider
{
    /// <summary>
    /// Gets or sets the role security service.
    /// </summary>
    /// <value>The role security service.</value>
    [ServiceDependency]
    public IRoleSecurityService SecuredActionService { get; set; }

    public string AdministrationView
    {
        get
        {
            return SecuredActionService.HasAccess("Administration/View").ToString().ToLower();
        }
    }

    protected void Page_Load(object sender, EventArgs e)
    {
    }

    #region ISmartPartInfoProvider Members

    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        return new ToolsSmartPartInfo();
    }

    #endregion
}