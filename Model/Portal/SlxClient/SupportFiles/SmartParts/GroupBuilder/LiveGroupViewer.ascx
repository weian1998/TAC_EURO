<%@ Import namespace="Sage.Platform.Application.Services" %>
<%@ Import namespace="Sage.Platform.Application"%>
<%@ Import Namespace="Sage.Platform.Security" %>
<%@ Import Namespace="Sage.Platform.WebPortal.Services" %>
<%@ Import Namespace="Sage.Platform.WebPortal.SmartParts" %>
<%@ Import namespace="Sage.Platform.WebPortal"%>
<%@ Control Language="C#" EnableViewState="false" ViewStateMode="Disabled" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Timeline" TagPrefix="SalesLogix" %>

<style>
.listPanelToolbar
{
    height: 21px;
}
.rightTools
{
    text-align: right;
}
.leftTools
{
    text-align: left;
    z-index: 4;
}


.jsonPrintDetailPane
{
    height: 100%;
    width: 100%;
    overflow: auto;
    background: #eee;
    border-top: solid 1px #aaa;
}

.jsonPrintDetailPane pre
{
    background: transparent;
    border: none 0px transparent;
}
</style>
<script type="text/javascript">
    require([
        'dojo/ready',
        'Sage/UI/ListPanel',
        'Sage/UI/GroupListConfigurationProvider'
    ],
    function (ready, ListPanel, GroupListConfigurationProvider) {
        ready(function(){
            var virdir = function() {
                var match = /^\/([^\/]+)\//.exec(location.pathname);                
                return match ? match[1] : '';
            };        

            ready(function() {
                var systemService = new Sage.SData.Client.SDataService({
                    serverName: window.location.hostname,
                    virtualDirectory: virdir() + '/slxdata.ashx',
                    applicationName: 'slx',
                    contractName: 'system',
                    port: window.location.port && window.location.port != 80 ? window.location.port : false,
                    json: true,
                    protocol: /https/i.test(window.location.protocol) ? 'https' : false,
                    convertCustomEntityProperty: function(ns, propertyName, value) {
                        if (propertyName === 'layout')
                        {
                            var layout = value[ns + ':layoutItem'];
                            if (layout) 
                                return dojo.isArray(layout) ? layout : [layout];
                        }
                        return value;
                    }
                });        

                var groupsProvider = new GroupListConfigurationProvider({
                    service: systemService,
                    detailConfiguration: <%= GetConfiguration(DetailsPaneConfigFile) %>,
                    summaryOptions: <%= GetConfiguration(SummaryConfigFile) %>
                    }); 
        
                var panel = new ListPanel({
                    id: 'list',
                    configurationProvider: groupsProvider,
                    //detailType: 'Sage.UI.JsonPrintDetailPane',
                    detailType: 'Sage.UI.SummaryDetailPane',
                    helpTopicName: '<%= HelpTopic %>',
                region: 'center'
            });

                var container = dijit.byId('centerContent'),
                    child = dijit.byId('mainContentDetails');
                if (container && child) {
                    container.removeChild(child);
                    container.addChild(panel);
                    container.layout();
                }
            });
        });
    });
</script>

<script runat="server" type="text/C#">

    public string SummaryConfigFile { get; set; }
    public string DetailsPaneConfigFile { get; set; }
    public string ListContextMenu { get; set; }

    [ServiceDependency]
    public IMenuService MenuService { get; set; }
    
    protected override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);

        if (!IsPostBack)
        {
            Sage.SalesLogix.SelectionService.ISelectionService ss = Sage.SalesLogix.Web.SelectionService.SelectionServiceRequest.GetSelectionService();
            if (ss != null)
            {
                Sage.SalesLogix.SelectionService.ISelectionContext groupSelectionContext = new Sage.SalesLogix.Client.GroupBuilder.GroupSelectionContext();
                groupSelectionContext.Key = "list"; // listViewOptions.selectionContextKey;
                groupSelectionContext.SelectionInfo = new Sage.SalesLogix.SelectionService.SelectionInfo();
                ss.SetSelectionContext("list" /*listViewOptions.selectionContextKey */, groupSelectionContext);
            }
        }
        
        if (MenuService != null)
        {
            RegisterContextMenu(!string.IsNullOrEmpty(ListContextMenu) ? ListContextMenu : "GroupListContextMenu",
                                "listContextMenu");
        }
    }

    private void RegisterContextMenu(string menu, string id)
    {
        var menuPath = (menu.IndexOf("ContextMenuItems") > 0) ? menu : string.Format("~/ContextMenuItems/{0}.ascx", menu);
        
        if (System.IO.File.Exists(Server.MapPath(menuPath)))
        {
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
    }
    
    private string GetConfiguration(string configFile)
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

    private string GetHelpTopic()
    {
        EntityPage page = Page as EntityPage;
        if (page != null)
        {
            PageLink pageLink = new PageLink();
            pageLink.LinkType = enumPageLinkType.HelpFileName;
            pageLink.NavigateUrl = HelpTopic;

            if (string.IsNullOrEmpty(HelpTopic))
                pageLink.NavigateUrl = GetDefaultTopic();

            return pageLink.GetWebHelpLink().Url;
        }
        return string.Empty;
    }

    private string GetDefaultTopic()
    {
        var defaultTopic = string.Empty;
        try
        {
            Match pageName = Regex.Match(Page.AppRelativeVirtualPath, @"\/(?<topic>[^\.]*)\.[\w]*");
            if (pageName.Groups.Count > 0)
                defaultTopic = string.Concat(pageName.Groups["topic"].Value, "listview").ToLower();
        }
        catch { } // if the regular expression fails, just return an empty string

        return defaultTopic;
    }
    public string HelpTopic { get; set; }

</script>
    
