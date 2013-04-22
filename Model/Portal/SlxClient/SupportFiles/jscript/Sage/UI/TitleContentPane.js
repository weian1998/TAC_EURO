/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/MenuSeparator',
        'dijit/Menu',
        'dijit/layout/ContentPane',
        'dijit/MenuItem',
        'dijit/PopupMenuItem',
        'dijit/MenuBar',
        'dijit/MenuBarItem',
        'Sage/UI/PopupMenuBarItem',
        'dojox/grid/DataGrid',
        'Sage/UI/OrientableMenuBar',
        'Sage/UI/GridMenuItem',
        'Sage/UI/ImageButton',
        'Sage/Utility',
        'Sage/Groups/GroupContextService',
        'Sage/Data/BaseSDataStore',
        'Sage/UI/GroupsTitlePaneConfigProvider',
        'dojo/dom-style',
        'dojo/_base/array',
        'dojo/dom-class',
        'dojo/_base/declare',
        'dojo/_base/lang'
    ],
function (
        MenuSeparator,
        Menu,
        ContentPane,
        MenuItem,
        PopupMenuItem,
        MenuBar,
        MenuBarItem,
        PopupMenuBarItem,
        DataGrid,
        OrientableMenuBar,
        GridMenuItem,
        ImageButton,
        Utility,
        GroupContextService,
        BaseSDataStore,
        GroupsTitlePaneConfigProvider,
        domStyle,
        array,
        domClass,
        declare,
        lang
    ) {
    var TitleContentPane = declare('Sage.UI.TitleContentPane', ContentPane, {
        // summary:
        //      This class is responsible for the Title pane area in the standard SalesLogix layout.
        //      This includes the title - usually the name of the entity or page, the 'group' tabs and menu.
        started: false,
        // _configurationProvider: object
        //      The object that will provide configuration details for the parts of this pane - title, tabs and menu.
        _configurationProvider: null,
        _configuration: {},
        _titleFmtString: '${0}',
        _groupMenuBar: false,
        _groupMenu: false,

        // title: string
        //      The string used in the title format string (as provided by the configuration provider).
        title: false,
        tabConnects: null,

        startup: function () {
            this.inherited(arguments);
            var handle,
                mode = Utility.getModeId();

            if (typeof mode === 'string' && mode.toLowerCase() === 'list') {
                handle = dojo.subscribe('/listView/applyConfiguration', lang.hitch(this, function () {
                    dojo.disconnect(handle);
                    this._doStartup();
                }));
            } else {
                this._doStartup();
            }
        },
        _doStartup: function () {
            if (this.started) {
                return;
            }

            this.tabConnects = [];
            
            if (this._configurationProvider === null) {
                var eCtx = Sage.Services.getService('ClientEntityContext');
                if (eCtx) {
                    var c = eCtx.getContext();
                    if (c['IsGroupsBasedEntity']) {
                        this._configurationProvider = new GroupsTitlePaneConfigProvider();
                    }
                }
            }

            if (this._configurationProvider !== null) {
                var gmenuDom = dojo.create('div', { 'id': 'GroupMenuSpace', 'class': 'GroupButton' });
                dojo.place(gmenuDom, this.domNode);
                dojo.connect(this._configurationProvider, "onTitlePaneConfigurationChange", this, "resetConfiguration");

                this._configurationProvider.requestTitlePaneConfiguration({
                    scope: this,
                    success: function (config) {
                        this._setConfiguration(config);
                        this.started = true;
                    }
                });
            } else {
               this._hideEmptyTabBar();
            }
        },
        _resize: function () {
            var tabs = dijit.byId("GroupTabs");
            tabs.resize();
        },
        _setConfiguration: function (config) {
            this._configuration = config;
            if (this._configuration) {
                if (this._configuration.menu) {
                    this._addMenu(this._configuration.menu);
                }
                if (this._configuration.tabs) {
                    this._showTabBar();
                    this._addTabs(this._configuration.tabs);
                } else {
                    this._hideEmptyTabBar();
                }
                if (this._configuration.titleFmtString) {
                    this._titleFmtString = this._configuration.titleFmtString;
                }
            }
        },
        resetConfiguration: function () {
            // summary:
            //      Callback method for events that indicate that the title pane contents are out of date
            //      and need to be refreshed.
            var tabs = dijit.byId('GroupTabs');

            if (tabs) {
                array.forEach(this.tabConnects, function (handle) {
                    dojo.disconnect(handle);
                });

                this.tabConnects = [];

                try {
                    tabs.removeChildren();
                } catch (err) {
                    console.error(err);
                }
            }

            this.started = false;
            this._doStartup();
        },
        _setTitleAttr: function (title) {
            dojo.html.set(dojo.byId('PageTitleText'), dojo.string.substitute(this._titleFmtString, [title]));
        },
        _setConfigurationProviderAttr: function (configurationProvider) {
            //ToDo:  implement functionality to start this up again if the provider changes...  <---<<<   <---<<<
            this._configurationProvider = configurationProvider;
            this._doStartup();
            this._resize();
        },
        _addMenu: function (menuConfig) {
            if (menuConfig) {
                //add groups Menu...
                if (this._groupMenu) {
                    return;
                }

                this._groupMenuBar = new OrientableMenuBar({
                    id: 'groupMenuBar',
                    title: menuConfig.tooltip,
                    orientation: { 'BR': 'TR', 'BL': 'TL' },
                    baseClass: 'group-menu-bar'
                });

                domClass.remove(this._groupMenuBar.containerNode, 'dijitMenuBar');

                this._groupMenu = new Menu({
                    id: 'groupMenu',
                    style: { width: menuConfig.width || '350px' }
                });

                this._addItemsToMenu(this._groupMenu, menuConfig.items);

                this._groupMenuBar.addChild(new PopupMenuBarItem({
                    label: menuConfig.text || '...',
                    icon: menuConfig.img || this._blankGif,
                    imageClass: menuConfig.imageClass || '',
                    baseClass: 'group-menu-button',
                    id: menuConfig.id || Sage.guid('groupMenuItem'),
                    popup: this._groupMenu,
                    style: 'width:80px'
                }));

                this._groupMenuBar.placeAt("GroupsWrapper", "before");
                this._groupMenuBar.startup();

                var addGroupButton = new ImageButton({
                    id: 'addGroupButton',
                    imageClass: 'icon_plus_16x16',
                    title: menuConfig.addGroupTooltip,
                    onClick: function () {
                        Sage.Groups.GroupManager.CreateGroup();
                    }
                });

                addGroupButton.placeAt("GroupsWrapper", "before");
                addGroupButton.startup();
            }
        },
        _addItemsToMenu: function (menu, items) {
            var len = items.length, itm;
            for (var i = 0; i < len; i++) {
                itm = items[i];
                if (itm.fn) {
                    menu.addChild(itm.fn.call(itm.scope || this));
                } else if (itm.items && itm.items.length > 0) {
                    var submenu = new Menu({ parentMenu: menu, id: itm.id + '_submenu' });
                    this._addItemsToMenu(submenu, itm.items);
                    menu.addChild(new MenuItem({
                        label: itm.text || '...',
                        icon: itm.img || this._blankGif,
                        title: itm.tooltip || '',
                        popup: submenu,
                        //iconClass: 'dijitEditorIcon dijitEditorIconSpace',
                        id: itm.id
                    }));
                } else {
                    if (itm.isSeparator || itm.text === '-') {
                        menu.addChild(new MenuSeparator());
                    } else {
                        menu.addChild(new MenuItem({
                            label: itm.text || '...',
                            //iconClass: 'dijitEditorIcon dijitEditorIconSpace',
                            icon: itm.img || this._blankGif,
                            title: itm.tooltip || '',
                            id: itm.id,
                            onClick: itm.onClick || function () {
                                document.location = itm.href;
                            }
                        }));
                    }
                }
            }
        },
        _addTabs: function (tabConfig) {
            try {
                var tConfig = {
                    selectedTabId: '',
                    tabKeyProperty: '$key',
                    tabNameProperty: '$descriptor', // group display name
                    tabGroupNameProperty: 'name', // group name
                    tabFamilyProperty: 'family',
                    tabHiddenProperty: false
                };

                dojo.mixin(tConfig, tabConfig);

                if (tConfig) {
                    var tabs = dijit.byId("GroupTabs");
                    tabs.startup();
                    var blank = this._blankGif;
                    var closable = typeof tConfig.onTabClose === 'function';
                    var lookupTabItems;
                    if (tConfig.staticTabs) {
                        var len = tConfig.staticTabs.length;
                        for (var i = 0; i < len; i++) {
                            var t = tConfig.staticTabs[i];
                            var tabId = t[tConfig.tabKeyProperty];
                            var sTab = dijit.byId(tabId) || new ContentPane({
                                id: tabId,
                                title: t[tConfig.tabNameProperty],
                                closable: true,
                                dataItem: t,
                                onClose: function () { return false; }
                            });
                            var child = tabs.addChild(sTab);

                            if (tConfig.selectedTabId === tabId) {
                                tabs.selectChild(sTab);
                            }

                            // Build the static tab context menu (which is the lookup results tab).
                            // The tab menus hitch on to the "close" tab menu. The tabs must be set as closable,
                            // or the menu will not show up.
                            var staticMenu = dijit.byId(dojo.string.substitute("GroupTabs_tablist_${0}_Menu", [t[tConfig.tabKeyProperty]]));
                            staticMenu.destroyDescendants(); // Remove the close option

                            if (staticMenu && tConfig.showTabContextMenus && t["contextMenuItems"]) {
                                lookupTabItems = t["contextMenuItems"]; // Sage.UI.DataStore.ContextMenus.GroupLookupTabContextMenu.items;
                                for (var x = 0; x < lookupTabItems.length; x++) {
                                    var mItem = lookupTabItems[x];
                                    if (mItem.isspacer || mItem.text === '') {
                                        staticMenu.addChild(new MenuSeparator());
                                    } else {
                                        var href = mItem.href;
                                        if (href.indexOf('javascript:') < 0) {
                                            href = dojo.string.substitute("javascript:${0}('${1}','${2}','${3}');", [href, t[tConfig.tabKeyProperty], t[tConfig.tabNameProperty], t[tConfig.tabFamilyProperty]]);
                                        } else {
                                            var substituteObj = {
                                                'groupId': t[tConfig.tabKeyProperty],
                                                'groupName': t[tConfig.tabNameProperty],
                                                'family': t[tConfig.tabFamilyProperty]
                                            };
                                            href = dojo.string.substitute(href, substituteObj);
                                        }
                                        var itemId = t[tConfig.tabFamilyProperty] + '_LOOKUP_' + x;
                                        var menuItem = new MenuItem({
                                            id: itemId,
                                            label: mItem.text || '...',
                                            icon: mItem.img || blank,
                                            title: mItem.tooltip || '',
                                            ref: href,
                                            onClick: function () {
                                                if (this.ref !== '') {
                                                    try {
                                                        window.location.href = this.ref;
                                                    } catch (e) { }
                                                }
                                            }
                                        });

                                        staticMenu.addChild(menuItem);
                                    }
                                }
                            }
                        }
                    }

                    if (tConfig.lookupButton) {
                        tConfig.lookupButton.startup();
                        dojo.place(tConfig.lookupButton.domNode, tabs.domNode, 'before');
                    }

                    var userId = Utility.getClientContextByKey('userID');
                    var fParams = {
                        onComplete: function (data) {
                            var dataItem,
                                i,
                                tabList = [],
                                selectedTab,
                                menuFuncs = [],
                                tabId;

                            for (i = 0; i < data.length; i++) {
                                dataItem = data[i];
                                if (tConfig.tabHiddenProperty && dataItem[tConfig.tabHiddenProperty] === true) {
                                    continue;
                                }

                                tabId = dataItem[tConfig.tabKeyProperty];

                                var aTab = dijit.byId(tabId) || new ContentPane({
                                    id: tabId,
                                    title: dataItem[tConfig.tabNameProperty],
                                    closable: closable,
                                    dataItem: dataItem
                                });

                                tabList.push(aTab);

                                if (tConfig.selectedTabId === dataItem[tConfig.tabKeyProperty]) {
                                    selectedTab = aTab;
                                }

                                // create a clojure array and execute them after the tabs
                                // have been added, otherwise the menu (GroupTabs_tablist_${0}_Menu) won't exist
                                menuFuncs.push((function menuFunction(dataItem, userId) {
                                    var tabId = dataItem[tConfig.tabKeyProperty];
                                    return function () {
                                        //build the tab context menu
                                        var tabmenu = dijit.byId(dojo.string.substitute("GroupTabs_tablist_${0}_Menu", [dataItem[tConfig.tabKeyProperty]])),
                                            disabled = false,
                                            isShared = false,
                                            isAdmin = userId.trim() === 'ADMIN';

                                        if (dataItem.userId !== userId) {
                                            isShared = true;
                                        } else {
                                            isShared = false;
                                        }

                                        if (!tabmenu) {
                                            return;
                                        }

                                        tabmenu.destroyDescendants(); // Destroy close button
                                        if (Sage.UI.DataStore.ContextMenus && Sage.UI.DataStore.ContextMenus.groupTabContextMenu) {
                                            var menuConfig = Sage.UI.DataStore.ContextMenus.groupTabContextMenu.items;

                                            for (var mi = 0; mi < menuConfig.length; mi++) {
                                                var mItem = menuConfig[mi];

                                                // Disable delete and share
                                                // if group was shared to you
                                                if ((mItem.id === 'gtcDelete' && isShared && !isAdmin) ||
                                                    (mItem.id === 'gtcShare' && isShared)) {
                                                    disabled = true;
                                                } else {
                                                    disabled = false;
                                                }

                                                if (mItem.isspacer || mItem.text === '') {
                                                    tabmenu.addChild(new MenuSeparator());
                                                } else {
                                                    var href = mItem.href;
                                                    if (href.indexOf('javascript:') < 0) {
                                                        href = dojo.string.substitute("javascript:${0}('${1}','${2}','${3}');", [href, dataItem[tConfig.tabKeyProperty], (dataItem[tConfig.tabGroupNameProperty] || dataItem[tConfig.tabNameProperty]), dataItem[tConfig.tabFamilyProperty]]);
                                                    } else {
                                                        var substituteObj = {
                                                            'groupId': dataItem[tConfig.tabKeyProperty],
                                                            'groupName': dataItem[tConfig.tabNameProperty] || dataItem[tConfig.tabGroupNameProperty],
                                                            'family': dataItem[tConfig.tabFamilyProperty]
                                                        };
                                                        href = dojo.string.substitute(href, substituteObj);
                                                    }

                                                    tabmenu.addChild(new MenuItem({
                                                        id: tabId + '_tab_' + mi,
                                                        label: mItem.text || '...',
                                                        icon: mItem.img || blank,
                                                        title: mItem.tooltip || '',
                                                        ref: href,
                                                        disabled: disabled,
                                                        onClick: function () {
                                                            if (this.ref !== '') {
                                                                try {
                                                                    window.location.href = this.ref;
                                                                } catch (e) { }
                                                            }
                                                        }
                                                    }));
                                                }
                                            }
                                        }
                                    };
                                })(dataItem, userId));
                            }

                            dojo.connect(tabs, 'onAddChildrenComplete', this, function () {
                                dojo.forEach(menuFuncs, function (func) {
                                    func.call();
                                });

                                menuFuncs = null;

                                if (selectedTab) {
                                    tabs.selectChild(selectedTab);
                                }
                            });

                            tabs.addChildren(tabList);
                        }
                    };
                    dojo.mixin(fParams, tConfig.fetchParams);
                    if (tConfig.store) {
                        tConfig.store.fetch(fParams);
                    }

                    if (tConfig.onTabClick) {
                        this.tabConnects.push(dojo.connect(tabs, 'onClick', tConfig, 'onTabClick', true));
                    }

                    if (tConfig.onTabSelect) {
                        this.tabConnects.push(dojo.connect(tabs, 'selectChild', tConfig, 'onTabSelect'));
                    }

                    if (closable) {
                        this.tabConnects.push(dojo.connect(tabs, 'closeChild', tConfig, 'onTabClose'));
                    }

                } else {
                    this._hideEmptyTabBar();
                }
            } catch (err) {
                console.error(err);
            }
        },
        _hideEmptyTabBar: function () {
            var tabs = dijit.byId('GroupTabs');
            if (tabs) {
                if (dojo.byId('localTitle').style.display != "none") {
                    domStyle.set(this.domNode, 'height', '37px');
                } else {
                    domStyle.set(this.domNode, 'display', 'none');
                }

                this.getParent().layout();
                tabs.set('style', 'display:none');
            }
        },
        _showTabBar: function () {
            var tabs = dijit.byId('GroupTabs');
            if (tabs) {
                if (dojo.byId('localTitle').style.display != "none") {
                    domStyle.set(this.domNode, 'height', '67px');
                } else {
                    domStyle.set(this.domNode, 'display', 'none');
                }
                tabs.domNode.style.display = 'block';
                this.getParent().layout();
            };
        }
    });

    return TitleContentPane;
});
