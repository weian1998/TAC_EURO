/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/UI/_TitlePaneConfigProvider',
        'Sage/Data/BaseSDataStore',
        'Sage/UI/GroupMenuFmtScope',
        'Sage/UI/GridMenuItem',
        'Sage/Groups/GroupManager',
        'Sage/Utility',
        'dojo/_base/array',
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/string',
        'Sage/Groups/GroupLookup',
        'Sage/UI/SearchMenuItem',
        'Sage/UI/ImageButton',
        'dojo/i18n!./nls/GroupsTitlePaneConfigProvider',
        'dijit/popup'
],
function (
        _TitlePaneConfigProvider,
        BaseSDataStore,
        GroupMenuFmtScope,
        GridMenuItem,
        GroupManager,
        Utility,
        array,
        declare,
        lang,
        string,
        GroupLookup,
        SearchMenuItem,
        ImageButton,
        resource,
        pm) {
    var provider = declare('Sage.UI.GroupsTitlePaneConfigProvider', _TitlePaneConfigProvider, {
        // summary:
        //      Implementation of Sage.UI._TitlePaneConfigProvider for use on SLX group based main views.
        //strings...
        searchText: 'Lookup',
        lookupResultsText: resource.lookupResultsText,
        //end strings...
        store: false,
        _requestOptions: false,
        _grpContextHandle: false,
        config: false,
        requestTitlePaneConfiguration: function (options) {
            var service,
                gSvc,
                context,
                menuConfig,
                lookupButton,
                tabConfig;

            // summary:
            //      Builds the config object for the title pane including the group tabs and group menu.
            if (this._isInsertMode()) {
                if (options.success) {
                    this.config = {
                        menu: false,
                        tabs: false
                    };
                    options.success.call(options.scope || this, this.config, this);
                }
                return;
            }

            service = Sage.Data.SDataServiceRegistry.getSDataService('system');
            this.store = new BaseSDataStore({
                service: service,
                resourceKind: 'groups',
                include: [],
                sort: [{ attribute: 'displayName', descending: false}]
            });

            gSvc = Sage.Services.getService('ClientGroupContext');
            context = gSvc.getContext();
            if (context.notGroupBased) {
                return;
            }

            if (!context.CurrentFamily) {
                this._requestOptions = options;
                this._grpContextHandle = dojo.connect(gSvc, 'onContextSet', this, '_groupContextSetCallback');
                return;
            }

            menuConfig = this._getMenuConfig();
            lookupButton = dijit.byId('GroupLookupButton');
            if (lookupButton) {
                lookupButton.destroy(true);
            }

            tabConfig = this._getTabConfig();

            this.config = {
                menu: menuConfig,
                tabs: tabConfig
            };

            if (options.success) {
                options.success.call(options.scope || this, this.config, this);
            }
        },
        _isInsertMode: function () {
            var mode = Sage.Utility.getModeId();
            return (mode && (mode.toLowerCase() === 'insert'));
        },
        _groupContextSetCallback: function (context) {
            if (this._grpContextHandle) {
                dojo.disconnect(this._grpContextHandle);
                this._grpContextHandle = false;
            } else {
                return;
            }
            this.config = {
                menu: this._getMenuConfig(),
                tabs: this._getTabConfig()
            };
            if (this._requestOptions.success) {
                this._requestOptions.success.call(this._requestOptions.scope || this, this.config, this);
            }
        },
        _getTabConfig: function () {
            var gSvc = Sage.Services.getService('ClientGroupContext'),
                context = gSvc && gSvc.getContext();
            return {
                store: this.store,
                selectedTabId: context.CurrentGroupID,
                tabKeyProperty: '$key',
                tabNameProperty: '$descriptor', // group display name
                tabGroupNameProperty: 'name', // group name
                tabHiddenProperty: 'isHidden',
                showTabContextMenus: true,
                fetchParams: {
                    query: string.substitute("upper(family) eq '${0}'", [context.CurrentFamily.toUpperCase()]),
                    count: 1000,
                    start: 0,
                    sort: [{ attribute: 'displayName'}]
                },
                lookupButton: new ImageButton({
                    id: 'GroupLookupButton',
                    label: '',
                    imageClass: 'icon_Find_16x16',
                    title: resource.lookupText,
                    onClick: function () {
                        var ctxService = Sage.Services.getService('ClientGroupContext'),
                            lupSvc;
                        if (ctxService) {
                            //show the lookup window...
                            lupSvc = Sage.Services.getService('GroupLookupManager');
                            if (lupSvc) {
                                lupSvc.showLookup();
                            }
                        }
                    }
                }),
                staticTabs: [
                    { '$key': 'LOOKUPRESULTS', '$descriptor': this.lookupResultsText, closable: false, contextMenuItems: this._getTabContextMenuItems() }
                ],
                onTabSelect: function (child, suppressReload) {
                    var id,
                        ctxService;

                    if (suppressReload) {
                        return;
                    }

                    id = (typeof child === "string") ? child : child.id;
                    ctxService = Sage.Services.getService('ClientGroupContext');

                    if (ctxService) {
                        if (id !== 'DOLOOKUP') {
                            ctxService.setCurrentGroup(id);
                        }
                    }
                },
                onTabClose: function (tab) {
                    Sage.Groups.GroupManager.HideGroup(tab.id);
                },
                onTabClick: function (e) {
                    // If the user is in detail mode and clicks the current group tab,
                    // send them back to the list mode. If they click a different group tab,
                    // they stay in detail mode. If they are in list mode already, do nothing.
                    var mode = Utility.getModeId(),
                        ctxService = Sage.Services.getService('ClientGroupContext'),
                        tabs = dijit.byId("GroupTabs"),
                        selectedId = '',
                        currentGroupId = '',
                        context = null,
                        target = e.target,
                        title = '';

                    if (mode !== 'detail') {
                        return;
                    }

                    array.forEach(tabs.getChildren(), function (item) {
                        if (item.selected) {
                            selectedId = item.id;
                            title = item.title;
                        }
                    });

                    if (ctxService) {
                        context = ctxService.getContext();
                        if (selectedId !== 'DOLOOKUP' && context) {
                            currentGroupId = context.CurrentGroupID;
                        }
                    }

                    if (selectedId === currentGroupId && target && target.innerHTML === title) {
                        Sage.Link.toListView();
                    }
                }
            };
        },
        _getTabContextMenuItems: function () {
            var items;
            if (Sage.UI.DataStore.ContextMenus && Sage.UI.DataStore.ContextMenus.GroupLookupTabContextMenu) {
                items = Sage.UI.DataStore.ContextMenus.GroupLookupTabContextMenu.items;
            }
            return items;
        },
        _getMenuConfig: function () {
            var groupContextSvc = Sage.Services.getService('ClientGroupContext'),
                context = groupContextSvc.getContext(),
                groupName = context.CurrentName || '';
            return {
                id: 'mnuGroupMenu',
                cls: '',
                img: 'images/icons/Groups_16x16.gif',
                imageClass: 'icon_Groups_16x16',
                text: resource.groupText,
                tooltip: resource.groupButtonTooltip,
                addGroupTooltip: resource.addGroupButtonTooltip,
                width: '350px',
                items: [
                    {
                        cls: '',
                        id: 'sep2',
                        text: '-',
                        img: '',
                        tooltip: '',
                        href: '',
                        isSeparator: true
                    }, {
                        fn: this._getGroupMenuSearch,
                        scope: this
                    }, {
                        //pass as a function so it gets called when it is time to create it...
                        fn: this._getGroupMenuGrid,
                        scope: this
                    }]
            };
        },
        _getGroupMenuGrid: function () {
            var that = this,
                fmtScope = new GroupMenuFmtScope({ store: this.store }),
                query = {},
                context = false,
                svc = Sage.Services.getService('ClientGroupContext'),
                key = 'GroupMenuShowHidden',
                checkState = sessionStorage.getItem(key),
                hidden = checkState !== 'true';

            if (svc) {
                context = svc.getContext();
                if (context.CurrentEntity) {
                    query = string.substitute('upper(family) eq \'${0}\'', [context.CurrentFamily.toUpperCase()]);
                }
            }
            return new GridMenuItem({
                gridOptions: {
                    id: 'groupsGridInMenu',
                    store: that.store,
                    rowsPerPage: 40,
                    structure: [
                        { name: '&nbsp;', field: '$key', formatter: 'fmtSelectedCol', width: '20px' },
                        {
                            name: resource.groupColumnText,
                            field: 'displayName',
                            width: hidden ? '260px' : '205px'
                        },
                        {
                            name: resource.visibleColumnText,
                            field: 'isHidden',
                            formatter: 'fmtHideCol',
                            width: '55px',
                            hidden: hidden
                        }
                    ],
                    loadingMessage: 'Loading...',
                    noDataMessage: 'No records returned',
                    selectionMode: 'single',
                    query: query,
                    height: '400px',
                    width: '275px',
                    formatterScope: fmtScope,
                    _onCellClick: function (e) {
                        // Change groups when the group name cell is clicked.
                        // Refresh the grid and cancel the bubble (so the menu does not close).
                        var record,
                            ctxService,
                            gridParent = e.grid.getParent(),
                            menu = gridParent && gridParent.getParent(),
                            fetchHandle,
                            groupChangeHandle,
                            isGroupChanging = false, // Do not reset tab config if changed groups
                            context;

                        if (!this.menuClosedHandle) {
                            this.menuClosedHandle = menu.on('close', lang.hitch(this, function () {
                                var titlePane = dijit.byId('titlePane');
                                if (titlePane && !isGroupChanging) {
                                    titlePane.resetConfiguration();
                                }
                                this.menuClosedHandle.remove();
                                this.menuClosedHandle = null;
                            }));
                        }

                        if (e.cell.index === 1) {
                            record = e.grid.getItem(e.rowIndex);
                            ctxService = Sage.Services.getService('ClientGroupContext');
                            if (ctxService) {
                                context = ctxService.getContext();

                                if (context && context.CurrentGroupID === record.$key) {
                                    pm.close(menu);
                                } else {
                                    groupChangeHandle = dojo.connect(ctxService, 'onCurrentGroupChanged', e.grid, function () {
                                        this._refresh();
                                        isGroupChanging = true;
                                        dojo.disconnect(groupChangeHandle);
                                    });

                                    ctxService.setCurrentGroup(record.$key);

                                    fetchHandle = dojo.connect(e.grid, '_onFetchComplete', menu, function () {
                                        dojo.disconnect(fetchHandle);
                                        pm.close(this);
                                    });
                                }

                            }

                        } else {
                            e.stopPropagation();
                        }
                    }
                },
                width: '300px',
                height: '400px'
            });
        },
        _getGroupMenuSearch: function () {
            return new SearchMenuItem({});
        }
    });

    return provider;
});
