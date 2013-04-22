using System;
using Sage.Common.Syndication.Json;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using Sage.Platform.Application.UI;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.Services;
using Sage.SalesLogix.Client.GroupBuilder;

public partial class SmartParts_Options_OptionRedirector : System.Web.UI.UserControl, ISmartPartInfoProvider
{
    static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

    protected void Page_PreRender(object sender, EventArgs e)
    {
        IUserOptionsService opts = Sage.Platform.Application.ApplicationContext.Current.Services.Get<IUserOptionsService>();
        string defPage = opts.GetCommonOption("ShowOnStartup", "General");
        if (defPage != "")
        {
            defPage = defPage.Replace("Welcome.aspx", "Home.aspx");
            Response.Redirect(defPage, true);
            return;
        }
    }



    #region ISmartPartInfoProvider Members

    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        return new SmartPartInfo(GetLocalResourceObject("PageDescription.Text").ToString(), GetLocalResourceObject("PageDescription.Text").ToString());
    }

    #endregion
}
