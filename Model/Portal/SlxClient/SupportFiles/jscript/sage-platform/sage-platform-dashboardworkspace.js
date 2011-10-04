
function setupPortal() {
    Ext.get("MainWorkArea").setStyle("display", "none");
    slxDashboard = new Sage.SalesLogix.Dashboard(userDashboardOptions);
    slxDashboard.init();
};


if (typeof Sys !== "undefined") {
    Type.registerNamespace("Sage.SalesLogix");
}
else {
    Ext.namespace("Sage.SalesLogix");
}


Sage.SalesLogix.Dashboard = function(options) {
    this._options = options || { curportal: 0 };
    this._options.dirty = false;
    this._removed = {};
    this.defaultPageString = '{"?xml":{"@version":"1.0","@encoding":"utf-8"},"Dashboard":{"@title":"{0}","@name":"{0}","@family":"System","@isHidden":"false","style":null,"Columns":{"Column":[{"@width":0.49,"Widgets":{"Widget":[]}},{"@width":0.49,"Widgets":{"Widget":[]}}]}}}';
}

//Sage.SalesLogix.Dashboard.refreshWidget = function(name) {
//    var code = String.format("if (typeof {0} != 'undefined') {0}();", name + "_refresh");
//    eval(code);
//}
//Sage.SalesLogix.Dashboard.editWidget = function(name) {
//    var code = String.format("if (typeof {0} != 'undefined') {0}();", name + "_edit");
//    eval(code);
//}

Sage.SalesLogix.Dashboard.prototype.init = function () {
    var thisDashboard = this;
    var pages = new Array();
    var hiddenPages = new Array();
    for (var k = 0; k < DashboardPages.length; k++) {
        var pageObject = new Sage.SalesLogix.DashboardPage(DashboardPages[k], k, thisDashboard);
        pageObject.id = "portal_panel_" + k;
        pageObject.dashboardPagesIndex = k;
        if (pageObject.name === this._options.defpage) {
            this._options.curportal = k;
        }
        pages.push(pageObject);
        //if ($.inArray(pageObject.name, this._options.hiddenPages) > -1) {
        if (this._options.hiddenPages.indexOf(pageObject.name) > -1) {
            hiddenPages.push(pageObject.id);
        }
    }
    if (this._options.curportal > DashboardPages.length - 1) {
        this._options.curportal = 0;
    }
    var curDashboard = this;
    var centerpanel = mainViewport.findById("center_panel_center");
    var panel = this._tabPanel = new Ext.TabPanel({
        border: false,
        enableTabScroll: true,
        id: "dashboard_panel"
    });
    for (var i = 0; i < pages.length; i++) {
        try {
            pages[i].title = Sage.Analytics.localize(pages[i].title);
            panel.add(pages[i]);
        } catch (e) {
            if (window.console) {
                console.log("failed to load page " + i + " " + e);
            }
        }
    }
    panel.on("contextmenu", function (tabpanel, tab, e) {
        var portalNum = parseInt(tab.id.match(/\d+$/), 10);
        pages[portalNum].createTabContextMenu(portalNum).showAt(e.getXY());
    });
    panel.on("tabchange", function (tabpanel, tab) {
        if (tab) { //hide fires this event with a null tab
            var dp = mainViewport.findById("dashboard_panel");
            dp.setWidth(dp.getSize().width - 1); //firing resize without changing anything doesn't recalc
            dp.setWidth(dp.getSize().width + 1);
            if (thisDashboard._options.curportal != tab.pageNumber) {
                thisDashboard._options.curportal = tab.pageNumber;
                thisDashboard._options.dirty = true;
            }
            tab.loadWidgets();
        }
    });
    $(window).bind("beforeunload", function () {
        thisDashboard.updateUserOptions();
    });
    centerpanel.add(panel);
    mainViewport.doLayout();
    this.ActivateVisible(this._options.curportal);
    for (var i = 0; i < hiddenPages.length; i++) {
        panel.hideTabStripItem(hiddenPages[i]);
    }
    panel.doLayout();
    if (typeof idRefreshAndCloseButtons != "undefined") {
        idRefreshAndCloseButtons();
    }
}

Sage.SalesLogix.Dashboard.prototype.updateUserOptions = function() {
    if (this._options.dirty) {
        this._options.dirty = false;
        $.ajax({
            type: "PUT",
            contentType: "application/json; charset=utf-8",
            url: String.format("slxdata.ashx/slx/crm/-/dashboard/useroption?name=Options&category=Dashboard&data={0}", Ext.util.JSON.encode(this._options)),
            dataType: "json",
            error: function(request, status, error) {
            },
            success: function(data, status) {
            }
        });
    }
}

Sage.SalesLogix.Dashboard.prototype.getAvailableContent = function(portalNum) {
    return DashboardWidgetsList;
}

Sage.SalesLogix.Dashboard.prototype.deletePortal = function(portalNum) {
    var panel = mainViewport.findById("dashboard_panel");
    var tab = panel.findById("portal_panel_" + portalNum);
    if (tab) {
        panel.remove(tab);
        DashboardPages.splice(portalNum, 1);
        if (tab.name === this._options.defpage) {
            this._options.defpage = '';
        }
        this.ActivateVisible();
    }
}

Sage.SalesLogix.Dashboard.prototype.ActivateVisible = function(index) {
    if ((index) && (index < this._tabPanel.items.length) && (index >= 0)) {
        if (this._options.hiddenPages.indexOf(this._tabPanel.items.items[index].name) == -1) {
            this._tabPanel.activate(this._tabPanel.items.items[index]);
            return;
        }
    }
    for (var i = 0; i < this._tabPanel.items.length; i++) {
        var tabname = this._tabPanel.items.items[i].name;
        if (this._options.hiddenPages.indexOf(tabname) == -1) {
            this._tabPanel.activate(this._tabPanel.items.items[i]);
            return;
        }
    }
    //if none visible, add an empty
    var DefaultPageString = String.format(this.defaultPageString, "Default");
    this._options.hiddenPages.remove("Default");
    DashboardPages.remove(DefaultPageString);
    DashboardPages.push(DefaultPageString);
    mainViewport.findById("center_panel_center").removeAll();
    slxDashboard = new Sage.SalesLogix.Dashboard(this._options);
    slxDashboard.init();
}


function setUpDashboardPanels() {
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
    mainViewport = new Ext.FormViewport({
        layout: "border",
        autoShow: false,
        border: false,
        bufferResize: true,
        items: [
            {
                region: "north",
                id: "north_panel",
                height: 62,
                title: false,
                collapsible: false,
                border: false,
                contentEl: "north_panel_content"
            }, {
                region: "south",
                id: "south_panel",
                height: 20,
                collapsible: false,
                border: false,
                contentEl: "south_panel_content"
            }, {
                region: "west",
                id: "west_panel",
                stateId: "west_panel",
                border: false,
                split: true,
                width: 150,
                collapsible: true,
                collapseMode: 'mini',
                margins: "0 0 0 0",
                cmargins: "0 0 0 0",
                layout: 'accordion',
                sequence: true,
                defaults: {
                    stateEvents: ["collapse", "expand"],
                    getState: function() {
                        return { collapsed: this.collapsed };
                    }
                },
                animCollapse: false,
                animFloat: false,
                layoutConfig: {
                    animate: false,
                    hideCollapseTool: true
                },
                header: false
            }, {
                region: "center",
                id: "center_panel",
                applyTo: "center_panel",
                collapsible: false,
                border: false,
                margins: "6 6 6 6",
                cmargins: "0 0 0 0",
                layout: "border",
                items: [{
                    region: "center",
                    id: "center_panel_center",
                    applyTo: "center_panel_center",
                    border: false,
                    collapsible: false,
                    margins: "0 0 0 0",
                    autoScroll: false,
                    layout: "fit"
}]
}]
    });
}

function setNavState() {
    for (var i = 0; i < NavBar_Menus.length; i++) {
        var item = mainViewport.findById('nav_bar_menu_' + i);
        if (item) item.saveState();
    }
}


Sage.SalesLogix.userNotify = function (msg) {
    if ($('#PageTitle').get().length > 0) {
        var notifyElem = $("#userNotify").get(0);
        if (notifyElem) {
            $('#userNotify').html(msg);
            $('#userNotify').css('display', 'inline');
        } else {
            $('#PageTitle').after('<div id="userNotify" style="display:inline;" class="sage-saleslogix-usernotify" >' + msg + '</div>')
        }
        $('#userNotify').css('top', $('#PageTitle').position().top);
        $('#userNotify').css('left', $('#PageTitle').outerWidth());
        window.setTimeout(function() { $('#userNotify').fadeOut(); }, 5000);
    }
}

function promoteGroupToDashboard() {
    var template = '<Widget name="Group List" family="System"><options><name>Group List</name><title>{0}</title><family>System</family><groupfamily>{1}</groupfamily><groupname>{2}</groupname><groupid>{3}</groupid><limit>{4}</limit><subtitle></subtitle><datasource>slxdata.ashx/slx/crm/-/groups?family={5}&amp;name={6}&amp;format=json&amp;meta=true&amp;start=0&amp;limit={4}</datasource><entity>{8}</entity><visiblerows>{7}</visiblerows></options></Widget>';

    var win = new Ext.Window({ title: MasterPageLinks.PromoteTitle,
        width: 215,
        height: 375,
        autoScroll: true,
        buttons: [
            {
                text: MasterPageLinks.OK,
                handler: function (t, e) {
                    var cgi = getCurrentGroupInfo();
                    var page = Ext.getCmp('PagesGrid').getSelectionModel().getSelected();
                    if (page) {
                        var widgetstring = String.format(template, cgi.DisplayName, "Sage.Entity.Interfaces.I" + cgi.Family, cgi.Name, cgi.Id, 10,
                            $('<div/>').text(cgi.Family).html(), $('<div/>').text(cgi.Name).html(), 10, cgi.Entity);
                        $.ajax({
                            type: "POST",
                            url: String.format("slxdata.ashx/slx/crm/-/dashboard/page?action=addwidget&name={0}&family={1}",
                                page.data.Name,
                                page.data.Family
                            ),
                            data: widgetstring,
                            processData: false,
                            error: function (request, status, error) {
                                Ext.Msg.alert(MasterPageLinks.Warning, request.responseText);
                            },
                            success: function (data, status) {
                            if (data != "Success") {
                                Ext.Msg.alert(MasterPageLinks.Warning, data);
                                return;
                            }
                                Sage.SalesLogix.userNotify(String.format(MasterPageLinks.PromotionNotification, page.data.Name, cgi.DisplayName));
                                if (typeof callback === "function") callback(data, status);
                            }
                        });
                    }
                    win.close();
                }
            }, {
                text: MasterPageLinks.MailMergeView_Cancel,
                handler: function (t, e) {
                    win.close();
                }
            }
        ],
        items: [{ xtype: 'label',
            style: "padding:6px",
            text: MasterPageLinks.PromoteDescription
        }],
        tools: [{ id: 'help',
            handler: function (evt, toolEl, panel) {
                window.open('help/WebClient_CSH.htm#taskpanecommontasks', "MCWebHelp");
            }
        }]
    });

    $.ajax({
        type: "GET",
        url: "slxdata.ashx/slx/crm/-/dashboard/page",
        cache: false,
        error: function(request, status, error) {
            Ext.Msg.alert(MasterPageLinks.Warning, request.responseText);
        },
        success: function(data, status) {
            var storedata = {};
            storedata.items = Sys.Serialization.JavaScriptSerializer.deserialize(data);
            var grid = new Ext.grid.GridPanel({
                store: new Ext.data.JsonStore({
                    autoDestroy: true,
                    fields: ['Name', 'Family'],
                    root: 'items',
                    data: storedata
                }),
                colModel: new Ext.grid.ColumnModel({
                    defaults: {
                        width: 180,
                        sortable: false
                    },
                    columns: [
                        { header: 'Page', dataIndex: 'Name' }
                    ]
                }),
                sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),
                width: 200,
                height: 250,
                border: false,
                frame: true,
                id: 'PagesGrid'
            });
            win.add(grid);
            win.show();
        }
    });

}
