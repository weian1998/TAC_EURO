
Sage.SalesLogix.DashboardPage = Ext.extend(function (options, pageNum, dashboard) {
    var self = this;
    this.cellCount = 0;
    this.pageNumber = pageNum;
    this.dashboard = dashboard;
    this.dirty = false;
    function addCol(c) {
        function addCell(widget, col) {
            var cell = self.createCellObject(widget['@family'], widget['@name'], self.pageNumber, col);
            cell.widgetObject._options = widget['options'];
            return cell;
        }
        var col = self.createColumnObject(c['@width']);
        if (c.Widgets != null) {
            if (Ext.isArray(c.Widgets.Widget)) {
                for (var i = 0; i < c.Widgets.Widget.length; i++)
                    col.items.push(addCell(c.Widgets.Widget[i], col));
            } else {
                col.items.push(addCell(c.Widgets.Widget, col));
            }
        }
        return col;
    }

    if (typeof options.Columns === 'undefined') {
        options = Sys.Serialization.JavaScriptSerializer.deserialize(options).Dashboard;
    }
    this._options = options;
    this._columns = [];
    if (Ext.isArray(options.Columns.Column)) {
        for (var idx = 0; idx < options.Columns.Column.length; idx++) {
            var c = options.Columns.Column[idx];
            this._columns.push(addCol(c));
        }
    } else {
        this._columns.push(addCol(options.Columns.Column));
    }
    this.items = this._columns;
    this.title = options['@title'];
    this.name = options['@name'];
    this.family = options['@family'];
},
    {
        xtype: 'portal',
        region: 'center',
        margins: '35 5 5 0',
        border: false,
        visible: true,
        listeners: {
            drop: function () {
                AutoLogout.resetTimer();
                this.dirty = true;
                this.save();
            }
        },

        createColumnObject: function (width) {
            return { columnWidth: parseFloat(width) > 1 ? parseFloat(width) / 100 : parseFloat(width),
                style: 'padding:10px 0px 10px 10px',
                items: []
            }
        },

        createCellObject: function (family, name, portalNum, column) {
            var currentDashboardPage = this;
            var id = String.format("cell_{0}_page_{1}_display", ++this.cellCount, portalNum);
            var cell = {
                id: id,
                stateful: false,
                cls: 'sage-widget-panel',
                title: name + (this.cellCount),
                tools: [
                    { id: 'refresh',
                        handler: function (e, target, panel) {
                            panel.widgetObject.refresh();
                        },
                        qtip: DashboardResource.Refresh
                    },
                    { id: 'gear',
                        qtip: 'Edit',
                        handler: function (e, target, panel) {
                            //pass the widget a unique id for the editor window
                            panel.widgetObject.editor(Sage.Analytics.generateString('dwEditor'));
                        }
                    },
                    { id: 'close',
                        qtip: DashboardResource.Close,
                        handler: function (e, target, panel) {
                            panel.ownerCt.remove(panel, false);
                            panel.hide();
                            currentDashboardPage.dirty = true;
                            currentDashboardPage.save();
                        }
                    }
                ],
                collapsible: false,
                style: 'padding:0px 0px 10px 0px',
                location: { dashboard: portalNum, cellitem: id },
                autoDestroy: false,
                bbar: []
            };
            var widgetObject = new Sage.Analytics.DashboardWidget({ name: name, family: family, cell: cell,
                listeners: {
                    afterdisplay: function () {
                        mainViewport.findById("center_panel_center").doLayout();
                    },
                    persist: function () {
                        if (this.config.edited) { currentDashboardPage.dirty = true; }
                        currentDashboardPage.save();
                    }
                } //end listeners
            });
            cell.widgetObject = widgetObject;
            return cell;
        },

        init: function () { },

        loadWidgets: function () {
            var panel = mainViewport.findById("portal_panel_" + this.dashboardPagesIndex);
            var curcols = panel.items.items;
            for (var i = 0; i < curcols.length; i++) {
                if (curcols[i].items) {
                    for (var j = 0; j < curcols[i].items.items.length; j++) {
                        if (!curcols[i].items.items[j].widgetObject.config.loaded) {
                            curcols[i].items.items[j].widgetObject.init();
                        }
                    }
                }
            }
        },

        toSerializeableObject: function () {
            var pageObject = DashboardPages[this.dashboardPagesIndex];
            if (typeof pageObject.Dashboard === 'undefined') {
                pageObject = Sys.Serialization.JavaScriptSerializer.deserialize(pageObject);
            }
            pageObject.Dashboard['@title'] = this.title;
            var curcols = mainViewport.findById("portal_panel_" + this.dashboardPagesIndex).items.items;
            for (var i = 0; i < curcols.length; i++) {
                if (i === pageObject.Dashboard.Columns.Column.length)
                    pageObject.Dashboard.Columns.Column.push({});
                pageObject.Dashboard.Columns.Column[i]['@width'] = curcols[i].columnWidth;
                pageObject.Dashboard.Columns.Column[i].Widgets = {};
                pageObject.Dashboard.Columns.Column[i].Widgets.Widget = [];
                if (curcols[i].items) {
                    for (var j = 0; j < curcols[i].items.items.length; j++) {
                        var widget = curcols[i].items.items[j].widgetObject;
                        var newobj = {};
                        newobj["@name"] = widget.config.name;
                        newobj["@family"] = widget.config.family;
                        newobj["options"] = widget._options;
                        delete newobj["options"].cell;
                        pageObject.Dashboard.Columns.Column[i].Widgets.Widget.push(newobj);
                    }
                }
            }
            while (curcols.length < pageObject.Dashboard.Columns.Column.length) {
                pageObject.Dashboard.Columns.Column.remove(pageObject.Dashboard.Columns.Column.length - 1);
            }
            return pageObject;
        },

        save: function (callback) {
            var self = this;
            if (!self.dirty) {
                if (typeof callback === "function") callback();
                return;
            }
            self.dirty = false;
            var thisPageSerialized = Sys.Serialization.JavaScriptSerializer.serialize(this.toSerializeableObject());
            for (var i = 0; i < DashboardPages.length; i++) {
                if (Sys.Serialization.JavaScriptSerializer.deserialize(DashboardPages[i]).Dashboard["@name"] == self.name) {
                    DashboardPages[i] = thisPageSerialized;
                    break;
                }
            }
            $.ajax({
                type: "POST",
                    url: String.format("slxdata.ashx/slx/crm/-/dashboard/page?name={0}&family={1}", this.name, this.family),
                    data: thisPageSerialized,
                    processData: false,
                error: function (request, status, error) {
                    Ext.Msg.alert(DashboardResource.Warning, request.responseText);
                },
                success: function (data, status) {
                        if (data != "Success") {
                            Ext.Msg.confirm(DashboardResource.Warning, data + "<br>" + DashboardResource.PersonalCopy,
                            function (btn) {
                                if (btn == 'yes') {
                                    self.createCopy();
                                }
                            }
                        );
                        return;
                    }
                    if (typeof callback === "function") callback(data, status);
                }
            });
        },

        share: function (callback) {
            var self = this;
            this.save(function () {
                var win = new Ext.Window({ title: DashboardResource.Share,
                    width: parseInt(DashboardResource.Popup_Width),
                    height: parseInt(DashboardResource.Popup_Height),
                    layout: 'fit',
                    autoScroll: true,
                    tools: [{ id: 'help',
                        handler: function (evt, toolEl, panel) {
                            window.open('help/WebClient_CSH.htm#Working_with_the_Dashboard', "MCWebHelp");
                        }
                    }],
                    buttons: [
                                {
                                    text: DashboardResource.Ok,
                                    handler: function (t, e) {
                                        var ownerarray = [];  //self.shareOwners.split(',');
                                        var items = Ext.getCmp('ReleasedGrid').store.data.items;
                                        for (var i = 0; i < items.length; i++) {
                                            ownerarray.push(items[i].data.Id);
                                        }
                                        if (ownerarray.length == 0) ownerarray.push("unrelease");
                                        $.ajax({
                                            type: "POST",
                                            url: String.format("slxdata.ashx/slx/crm/-/dashboard/release?name={0}&family={1}",
                                                self.name,
                                                self.family),
                                            data: Sys.Serialization.JavaScriptSerializer.serialize(ownerarray),
                                            processData: false,
                                            error: function (request, status, error) {
                                                Ext.Msg.alert(DashboardResource.Warning, request.responseText);
                                            },
                                            success: function (data, status) {
                                                if (data != "Success") {
                                                    Ext.Msg.alert(DashboardResource.Warning, data);
                                                    return;
                                                }
                                                if (typeof callback === "function") callback(data, status);
                                            }
                                        });
                                        win.close();
                                    }
                                }, {
                                    text: DashboardResource.Cancel,
                                    handler: function (t, e) {
                                        win.close();
                                    }
                                }
                            ]
                });

                $.ajax({
                    type: "GET",
                    url: "slxdata.ashx/slx/crm/-/dashboard/release",
                    cache: false,
                    data: { name: self.name,
                        family: self.family
                    },
                    error: function (request, status, error) {
                        Ext.Msg.alert(DashboardResource.Warning, request.responseText);
                    },
                    success: function (data, status) {
                        var storedata = {};
                        //var res = Ext.DomQuery.select("string", data)[0].textContent || Ext.DomQuery.select("string", data)[0].text;
                        storedata.items = Sys.Serialization.JavaScriptSerializer.deserialize(data);
                        var grid = new Ext.grid.GridPanel({
                            buttonAlign: 'center',
                            store: new Ext.data.JsonStore({
                                autoDestroy: true,
                                fields: ['Id', 'Text'],
                                root: 'items',
                                data: storedata
                            }),
                            colModel: new Ext.grid.ColumnModel({
                                defaults: {
                                    //width: 120,
                                    sortable: false
                                },
                                columns: [
                                    { header: 'Released to', dataIndex: 'Text' }
                                ]
                            }),
                            sm: new Ext.grid.RowSelectionModel({ singleSelect: false }),
                            //width: 140,
                            //height: 250,
                            frame: true,
                            id: 'ReleasedGrid',
                            buttons: [{
                                text: 'Everyone',
                                handler: function () {
                                    var grid = Ext.getCmp('ReleasedGrid');
                                    var found = false;
                                    for (var i = 0; i < grid.store.data.items.length; i++) {
                                        if (grid.store.data.items[i].data.Id === "SYST00000001") found = true;
                                    }
                                    if (!found) {
                                        var rec = new grid.store.recordType({ "Id": "SYST00000001", "Text": "Everyone" });
                                        grid.store.add(rec);
                                    }
                                }
                            },
                                {
                                    text: 'Add',
                                    handler: function () {
                                        var vURL = 'OwnerAssign.aspx';
                                        window.open(vURL, "OwnerAssign", "resizable=yes,centerscreen=yes,width=500,height=450,status=no,toolbar=no,scrollbars=yes");
                                    }
                                },
                                {
                                    text: 'Remove',
                                    handler: function () {
                                        var grid = Ext.getCmp('ReleasedGrid');
                                        var selected = grid.getSelectionModel().getSelections();
                                        for (var i = 0; i < selected.length; i++) {
                                            grid.store.remove(selected[i]);
                                        }
                                    }
                                }
                            ]
                        });
                        win.add(grid);
                        win.show();
                    }
                });
            });
        },

        createCopy: function () {
            var self = this;
            Ext.Msg.prompt(DashboardResource.Copy_Tab, String.format('{0}:', DashboardResource.Name), function (btn, text) {
                if ((btn == 'ok') && (text.length > 0)) {
                    text = Ext.util.Format.htmlEncode(text);
                    var pageObject = self.toSerializeableObject();
                    pageObject.Dashboard['@name'] = text;
                    pageObject.Dashboard['@title'] = text;
                    DashboardPages.push(Sys.Serialization.JavaScriptSerializer.serialize(pageObject));
                    mainViewport.findById("center_panel_center").removeAll();
                    slxDashboard = new Sage.SalesLogix.Dashboard(self.dashboard._options);
                    slxDashboard.init();
                    mainViewport.findById("portal_panel_" + (DashboardPages.length - 1)).dirty = true;
                    mainViewport.findById("portal_panel_" + (DashboardPages.length - 1)).save();
                    mainViewport.findById("dashboard_panel").activate("portal_panel_" + (DashboardPages.length - 1));
                }
            });
        },

        createTabContextMenu: function (portalNum) {
            var currentDashboardPage = this;
            var tcmenu = new Ext.menu.Menu({ items: [
                new Ext.menu.Item({
                    text: DashboardResource.New_Tab,
                    icon: false,
                    handler: function () {
                        Ext.Msg.prompt(DashboardResource.New_Tab, String.format('{0}:', DashboardResource.Name), function (btn, text) {
                            if ((btn == 'ok') && (text.length > 0)) {
                                text = Ext.util.Format.htmlEncode(text);
                                var DefaultPageString = String.format(currentDashboardPage.dashboard.defaultPageString, text);
                                DashboardPages.push(DefaultPageString);
                                mainViewport.findById("center_panel_center").removeAll();
                                slxDashboard = new Sage.SalesLogix.Dashboard(currentDashboardPage.dashboard._options);
                                slxDashboard.init();
                                mainViewport.findById("portal_panel_" + (DashboardPages.length - 1)).dirty = true;
                                mainViewport.findById("portal_panel_" + (DashboardPages.length - 1)).save();
                                mainViewport.findById("dashboard_panel").activate("portal_panel_" + (DashboardPages.length - 1));
                            }
                        });
                    }
                }),
                new Ext.menu.Item({
                    text: DashboardResource.Copy_Tab,
                    handler: function () {
                        currentDashboardPage.createCopy();
                    }
                }),
                new Ext.menu.Item({ text: DashboardResource.Add_Content, handler: function () {
                    var win = new Ext.Window({ title: DashboardResource.Add_New_Content,
                        width: parseInt(DashboardResource.Popup_Width),
                        height: parseInt(DashboardResource.Popup_Height),
                        layout: 'fit',
                        margins: { top: 10 },
                        buttons: [
                            {
                                text: DashboardResource.Cancel, handler: function (t, e) {
                                    currentDashboardPage.save();
                                    win.close();
                                }
                            }
                        ],
                        tools: [{ id: 'help',
                            handler: function (evt, toolEl, panel) {
                                window.open('help/WebClient_CSH.htm#Introducing_Widgets', "MCWebHelp");
                            }
                        }]
                    });
                    if (DashboardWidgetsList.length == 0) {
                        win.add(new Ext.Panel({ html: String.format("<p>{0}</p>", DashboardResource.NoUnusedContent) }));
                    } else {
                        var scrollpanel = new Ext.Panel({  //without a separate panel ie7 won't scroll
                            autoScroll: true,
                            layout: 'anchor',
                            layoutConfig: { defaultAnchor: '-25' },
                            border: false
                        });
                        win.add(scrollpanel);
                    }
                    for (var widgetid in DashboardWidgetsList) {
                        scrollpanel.add(new Ext.Panel({
                            cls: 'addContentPanels', //for styling
                            margins: { top: 10 },
                            border: false,
                            layout: 'anchor',
                            layoutConfig: { defaultAnchor: '100% 100%' },
                            items: [
                                { xtype: 'label',
                                    text: Sage.Analytics.localize(widgetid),
                                    style: "margin-left:18px;margin-top:16px;display:block;font-weight:bold"
                                },
                                { xtype: 'label',
                                    text: Sage.Analytics.localize(DashboardWidgetsList[widgetid])
                                    , style: "margin-left: 18px; display: block"
                                },
                                { xtype: 'button',
                                    text: DashboardResource.Add,
                                    name: widgetid,
                                    style: "margin-left: 18px;",
                                    listeners: { click: function (t, checked) {
                                        cell = currentDashboardPage.createCellObject(t.family, t.name, portalNum, 0);
                                        mainViewport.findById("portal_panel_" + portalNum).items.items[0].add(cell);
                                        mainViewport.findById("center_panel_center").doLayout();
                                        cell.widgetObject.init(true);
                                        currentDashboardPage.dirty = true;
                                        currentDashboardPage.save();
                                        win.close(); //close the add content menu after button push
                                    }
                                    }
                                }
                                ]
                        }));
                    }
                    if (typeof idPopupWindow != "undefined") {
                        win.on("show", function () { idPopupWindow(); });
                    }
                    win.show();
                }
                }),
                new Ext.menu.Item({ text: DashboardResource.Hide,
                    handler: function () {
                        mainViewport.findById("dashboard_panel").hideTabStripItem(portalNum);
                        currentDashboardPage.dashboard._options.hiddenPages.push(currentDashboardPage.name);
                        if (currentDashboardPage.name === currentDashboardPage.dashboard._options.defpage) {
                            currentDashboardPage.dashboard._options.defpage = '';
                        }
                        currentDashboardPage.dashboard._options.dirty = true;
                        currentDashboardPage.dashboard.ActivateVisible();
                    }
                }),
                new Ext.menu.Item({ text: DashboardResource.Show, handler: function () {
                    var win = new Ext.Window({ title: DashboardResource.Show,
                        width: parseInt(DashboardResource.Popup_Width),
                        height: parseInt(DashboardResource.Popup_Height),
                        buttons: [
                            { text: DashboardResource.Ok, handler: function (t, e) { win.close(); } }
                        ]
                    });
                    for (var i = 0; i < currentDashboardPage.dashboard._options.hiddenPages.length; i++) {
                        var newPanel = new Ext.Panel({ border: false, style: 'padding:10px' }); //was hbox
                        newPanel.add(new Ext.Button({
                            text: DashboardResource.Show,
                            name: currentDashboardPage.dashboard._options.hiddenPages[i],
                            panel: newPanel,
                            style: 'display:inline'
                        })).on("click", function (b) {
                            currentDashboardPage.dashboard._options.hiddenPages.remove(b.name);
                            currentDashboardPage.dashboard._options.dirty = true;
                            var panel = mainViewport.findById("dashboard_panel");
                            var tabid = "";
                            for (var i = 0; i < panel.items.items.length; i++) {
                                if (panel.items.items[i].name === b.name)
                                    tabid = panel.items.items[i].id;
                            }
                            mainViewport.findById("dashboard_panel").unhideTabStripItem(tabid);
                            win.remove(b.panel);
                        });
                        newPanel.add(new Ext.form.Label({ text: currentDashboardPage.dashboard._options.hiddenPages[i],
                            margins: "5",
                            style: 'display:inline;margin-left:10px'
                        }));
                        win.add(newPanel);
                    }
                    win.show();
                }
                }),
                new Ext.menu.Item({
                    text: DashboardResource.Delete_Tab,
                    handler: function () {
                        var confirm = Ext.Msg.confirm(DashboardResource.Delete_Tab, DashboardResource.ConfirmDelete, function (result) {
                            if (result == "yes") {
                                $.ajax({
                                    type: "DELETE",
                                    url: String.format("slxdata.ashx/slx/crm/-/dashboard/page?name={0}&family={1}",
                                        currentDashboardPage.name,
                                        currentDashboardPage.family),
                                    error: function (request, status, error) {
                                        Ext.Msg.alert(DashboardResource.Warning, request.responseText);
                                    },
                                    success: function (data, status) {
                                        if (data != "Success") {
                                            Ext.Msg.alert(DashboardResource.Warning, data);
                                            return;
                                        }
                                        currentDashboardPage.dashboard.deletePortal(portalNum);
                                    }
                                });
                            }
                        });
                    }
                }),
                 new Ext.menu.Item({ text: DashboardResource.Edit_Options, handler: function () {
                     var opWin = new Ext.Window({ title: DashboardResource.Edit_Options,
                         width: parseInt(DashboardResource.Popup_Width),
                         height: parseInt(DashboardResource.Popup_Height),
                         buttons:
                            [{ text: DashboardResource.Ok, handler: function (t, e) {
                                if ($("#PortalName")[0].value.length > 0) {
                                    var newTitle = Ext.util.Format.htmlEncode($("#PortalName")[0].value);
                                    if (currentDashboardPage.title != newTitle) {
                                        currentDashboardPage.title = newTitle;
                                        mainViewport.findById("portal_panel_" + portalNum).setTitle(newTitle);
                                    }
                                }
                                var dp = mainViewport.findById("dashboard_panel");
                                dp.setWidth(dp.getSize().width - 1); //firing resize without changing anything doesn't recalc
                                dp.setWidth(dp.getSize().width + 1);
                                opWin.close();
                                currentDashboardPage.save();
                                currentDashboardPage.dashboard.updateUserOptions();
                            }
                            }
                        ]
                     });
                     opWin.add(new Ext.Panel({
                         style: 'margin: 15px 5px;',
                         //layout: 'hbox',
                         items: [{ xtype: 'label',
                             text: DashboardResource.Title + ':  ',
                             border: false,
                             style: 'line-height: 22px'
                         },
                         { xtype: 'textfield',
                             id: "PortalName",
                             value: currentDashboardPage.title,
                             border: false,
                             listeners: { 'blur': function (t) {
                                 if (t.el.dom.value != currentDashboardPage.title)
                                     currentDashboardPage.dirty = true;
                             }
                             }
                         }
                         ],
                         border: false
                     }));
                     opWin.add(new Ext.Panel({
                         html: String.format("<div style='margin: 5px 5px'>{0}:</div>", DashboardResource.ChooseTemplate)
                        , border: false
                     }));

                     var layouts = [
                       { name: DashboardResource.TwoColSplit, layout: [.49, .49], imgUrl: 'images/icons/2col.gif' },
                     //{ name: DashboardResource.ThreeCol, layout: [.33, .33, .34], imgUrl: 'images/icons/3col.gif' },
                       {name: DashboardResource.TwoColLeft, layout: [.65, .33], imgUrl: 'images/icons/2col_bigL.gif' },
                       { name: DashboardResource.TwoColRight, layout: [.33, .65], imgUrl: 'images/icons/2col_bigR.gif' }
                     //{ name: DashboardResource.OneCol, layout: [.99], imgUrl: 'images/icons/1col.gif' }
                     ];
                     for (var i = 0; i < layouts.length; i++) {
                         var isCurLayout = layouts[i].layout.length === currentDashboardPage.items.length;
                         if (isCurLayout) {
                             for (var j = 0; j < layouts[i].layout.length; j++) {
                                 if (layouts[i].layout[j] != currentDashboardPage.items[j].columnWidth) {
                                     isCurLayout = false;
                                 }
                             }
                         }
                         opWin.add(new Ext.form.Radio({ boxLabel: String.format("<img src='{1}'> {0}", layouts[i].name, layouts[i].imgUrl),
                             name: "Layout",
                             id: String.format("layout_{0}_id", i),
                             layout: layouts[i].layout,
                             style: { marginLeft: '15px' },
                             boxMinHeight: '34px',
                             checked: isCurLayout
                         })).on("check", function (t, checked) {
                             if (checked) {
                                 if (t.layout[0] != currentDashboardPage.items[0].columnWidth) currentDashboardPage.dirty = true;
                                 var curcols = mainViewport.findById("portal_panel_" + currentDashboardPage.pageNumber).items.items;
                                 for (var j = 0; j < t.layout.length; j++) {
                                     if (curcols.length > j) {
                                         curcols[j].columnWidth = t.layout[j];
                                     } else {
                                         mainViewport.findById("portal_panel_" + currentDashboardPage.pageNumber).add(currentDashboardPage.createColumnObject(t.layout[j]));
                                     }
                                 }
                                 while (curcols.length > t.layout.length) {
                                     mainViewport.findById("portal_panel_" + currentDashboardPage.pageNumber).remove(currentDashboardPage.items.length - 1);
                                 }
                                 currentDashboardPage.items = curcols;
                                 mainViewport.findById("center_panel_center").doLayout(true);
                             }
                         });
                     }
                     var makeDefPanel = new Ext.Panel({ //needed for ie7 to align correctly
                         style: { marginTop: '20px', marginLeft: '5px' },
                         border: false
                     });
                     makeDefPanel.add(new Ext.form.Checkbox({ boxLabel: DashboardResource.Make_Default,
                         boxLabelStyle: { marginTop: '20px' },
                         checked: (currentDashboardPage.dashboard._options.defpage == currentDashboardPage.name)
                     })).on("check", function (t, checked) {
                         if (checked != currentDashboardPage.dashboard._options.defpage == currentDashboardPage.name) currentDashboardPage.dashboard._options.dirty = true;
                         if (checked) {
                             currentDashboardPage.dashboard._options.defpage = currentDashboardPage.name;
                         } else {
                             currentDashboardPage.dashboard._options.defpage = '';
                         }
                     });
                     opWin.add(makeDefPanel);

                     if (typeof idPopupWindow != "undefined") {
                         opWin.on("show", function () { idPopupWindow(); });
                     }
                     opWin.show();
                 }
                 }),
                new Ext.menu.Item({ text: DashboardResource.Share, handler: function () {
                    currentDashboardPage.share();
                }
                }),
                new Ext.menu.Separator(),
                new Ext.menu.Item({ text: DashboardResource.Help, handler: function () {
                    window.open('help/WebClient_CSH.htm#Working_with_the_Dashboard', "MCWebHelp");
                }
                })

                ]
            });

            if (typeof idMenuItems != "undefined") {
                tcmenu.on("show", function () { idMenuItems(); });
            }
            return tcmenu;
        }
    }
);


function ShareGroup_CallBack(ownerResultXML) {
    if (ownerResultXML) {
        var xmlDoc = getXMLDoc(ownerResultXML);
        var list = xmlDoc.documentElement.childNodes;
        var grid = Ext.getCmp('ReleasedGrid');
        for (var i = 0; i < list.length; i++) {
            var found = false;
            var val = getNodeText(list[i].getElementsByTagName("value")[0]);
            var name = getNodeText(list[i].getElementsByTagName("name")[0]);
            for (var i = 0; i < grid.store.data.items.length; i++) {
                if (grid.store.data.items[i].data.Id === val) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                var rec = new grid.store.recordType({ "Id": val, "Text": name });
                grid.store.add(rec);
            }
        }
    }
}
