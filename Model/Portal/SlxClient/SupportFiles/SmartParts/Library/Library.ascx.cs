using System;
using System.Web.UI;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.SmartParts;

public partial class SmartParts_Library_Library : UserControl, ISmartPartInfoProvider
{
    #region ISmartPartInfoProvider Members

    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        return new ToolsSmartPartInfo();
    }

    #endregion
}