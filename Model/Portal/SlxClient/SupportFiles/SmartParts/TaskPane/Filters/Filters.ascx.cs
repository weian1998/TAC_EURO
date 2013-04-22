using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Common.Syndication.Json;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.SalesLogix.Client.GroupBuilder;

//[assembly: WebResource("Sage.SalesLogix.Client.GroupBuilder.jscript.Filter_ClientScript.js", "text/javascript", PerformSubstitution = true)]

public partial class SmartParts_TaskPane_Filters : System.Web.UI.UserControl, ISmartPartInfoProvider
{

    protected void Page_Load(object sender, EventArgs e)
    {

    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo tinfo = new Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo();
        return tinfo;
    }
}
