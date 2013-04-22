using System;
using System.Web.UI.WebControls;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.Workspaces;
using Sage.SalesLogix.Web.Controls;

public partial class SmartParts_TaskPane_FormManager_FormManagerPropertiesList : System.Web.UI.UserControl, ISmartPartInfoProvider
{
    //protected void Page_Load(object sender, EventArgs e)
    //{

    //}

    #region ISmartPartInfoProvider Members

    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        var spinfo = new TaskPaneSmartPartInfo(string.Empty, string.Empty, ContextDisplayMode.NoContext, new string[] { }, false);

        return spinfo as ISmartPartInfo;

    }

    #endregion
}