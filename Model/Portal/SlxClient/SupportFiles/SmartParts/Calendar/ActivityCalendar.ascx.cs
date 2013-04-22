using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using Sage.Platform.Application.UI;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Activity;
using Sage.SalesLogix.Web.UI.Activity;
using Activity = Sage.SalesLogix.Activity.Activity;
using TimeZone = Sage.Platform.TimeZone;

public partial class SmartParts_Calendar_ActivityCalendar : UserControl, ISmartPartInfoProvider
{
    private const string CalendarCss = "~/css/calendar.css";



    private LinkHandler _linkHandler;

    private LinkHandler Link
    {
        get
        {
            if (_linkHandler == null)
                _linkHandler = new LinkHandler(Page);
            return _linkHandler;
        }
    }

    public string ActivityContextMenu { get; set; }

    #region Service Properties

    [ServiceDependency]
    public IUserService UserService { get; set; }

    [ServiceDependency]
    public IContextService ContextService { get; set; }

    [ServiceDependency]
    public IMenuService MenuService { get; set; }

    [ServiceDependency]
    public IUserOptionsService OptionsService { get; set; }

    #endregion

    protected override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);

        if (MenuService != null)
        {
            if (!string.IsNullOrEmpty(ActivityContextMenu))
            {
                RegisterContextMenu(ActivityContextMenu, "calendar_activityContextMenu");
            }
        }
    }

    private void RegisterContextMenu(string menu, string id)
    {
        var menuPath = (menu.IndexOf("ContextMenuItems") > 0) ? menu : string.Format("~/ContextMenuItems/{0}.ascx", menu);
        var menuControl = Page.LoadControl(menuPath);
        if (menuControl != null)
        {
            var cMenu = menuControl.Controls[0] as NavItemCollection;
            if (cMenu != null)
            {
                cMenu.ID = id;
                MenuService.AddMenu(string.Empty, cMenu, menuType.ContextMenu);
            }
        }
    }

    protected void Page_Init(object sender, EventArgs e)
    {

    }

    protected void Page_Load(object sender, EventArgs e)
    {
       
    }

    protected void Page_PreRender(object sender, EventArgs e)
    {
    }


    #region ISmartPartInfoProvider Members

    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        var tinfo = new ToolsSmartPartInfo();
        foreach (Control c in wnTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }
    #endregion
}




