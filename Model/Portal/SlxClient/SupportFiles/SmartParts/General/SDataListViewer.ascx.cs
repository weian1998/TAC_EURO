using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.Application;

public partial class SmartParts_General_SDataListViewer : UserControl
{
    public string MainViewDefinition { get; set; }
    public string MainViewDefinitionForwardSlash
    {
        get
        {
            return MainViewDefinition.Replace(".", "/");
        }
    }
    public string HelpTopicName { get; set; }
    public string TabContextMenu { get; set; }
    public string ListContextMenu { get; set; }
    public bool DetailPaneVisibleOnLoad { get; set; }
    private int _detailPaneDefaultHeight = 250;
    public int DetailPaneDefaultHeight { 
        get { return _detailPaneDefaultHeight; } 
        set { _detailPaneDefaultHeight = value; } 
    }
    private string _detailPaneType = string.Empty;
    public string DetailPaneType
    {
        get
        {
            if (string.IsNullOrEmpty(_detailPaneType))
            {
                _detailPaneType = "Sage.UI.SummaryDetailPane";
            }
            return _detailPaneType;
        }

        set
        { _detailPaneType = value; }
    }
    public string SummaryConfigFile { get; set; }
    public string DetailsPaneConfigFile { get; set; }
    protected void Page_Load(object sender, EventArgs e)
    {
        
    }

    [ServiceDependency]
    public IMenuService MenuService { get; set; }

    protected override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);

       
        if (MenuService != null)
        {
            if (!string.IsNullOrEmpty(TabContextMenu))
            {
                RegisterContextMenu(TabContextMenu, "groupTabContextMenu");
            }
            if (!string.IsNullOrEmpty(ListContextMenu))
            {
                RegisterContextMenu(ListContextMenu, "listContextMenu");
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
    



    public string GetConfiguration(string configFile)
    {
        if (string.IsNullOrEmpty(configFile))
        {
            return "false";
        }

        Sage.Platform.SummaryView.WebSummaryViewConfiguration config;
        var serializer = new System.Xml.Serialization.XmlSerializer(typeof(Sage.Platform.SummaryView.WebSummaryViewConfiguration));
        using (var reader = new System.IO.StreamReader(Page.MapPath(string.Format("~/SummaryConfigData/{0}.xml", configFile))))
        {
            config = serializer.Deserialize(reader) as Sage.Platform.SummaryView.WebSummaryViewConfiguration;
        }
        if (config == null)
        {
            return string.Empty;
        }

        var obj = new Sage.Common.Syndication.Json.Linq.JObject();
        obj["mashupName"] = config.MashupName;
        obj["queryName"] = config.QueryName;
        obj["templateLocation"] = config.Template;

        return Sage.Common.Syndication.Json.JsonConvert.SerializeObject(obj);
    }
}
