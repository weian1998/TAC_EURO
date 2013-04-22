/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/UI/SDataMainViewConfigurationProvider',
    'Sage/UI/Columns/RadioGroup',
    'Sage/Data/WritableSDataStore',
    'Sage/MainView/SecurityMgr/SecurityManagerGroupContext',
    'dojo/i18n!./nls/SecurityManager',
    'dojo/_base/declare'
],
function (SDataMainViewConfigurationProvider, RadioGroup, WritableSDataStore, SecurityManagerGroupContext, nlsStrings, declare) {
    var securityManager = declare('Sage.MainView.SecurityManager', SDataMainViewConfigurationProvider, {
        _profilesStore: false,
        _currentProfileId: false,
        _currentProfileDescription: false,
        _profileNameCache: {},
        store: false,
        entityType: 'securityProfileColumns',
        constructor: function (options) {
            dojo.mixin(this, nlsStrings);
            var grpContextSvc = Sage.Services.getService('ClientGroupContext');
            if (!grpContextSvc || grpContextSvc.declaredClass != 'Sage.MainView.SecurityMgr.SecurityManagerGroupContext') {
                Sage.Services.removeService('ClientGroupContext');
                grpContextSvc = new SecurityManagerGroupContext();
                Sage.Services.addService('ClientGroupContext', grpContextSvc);
            }

            if (grpContextSvc) {
                var ctx = grpContextSvc.getContext();
                this._currentProfileId = ctx.CurrentGroupID;
                this._currentProfileDescription = ctx.CurrentName;
            }
            this.service = Sage.Data.SDataServiceRegistry.getSDataService('system');
            this.titlePaneConfiguration = {
                tabs: this._getTabsConfig(),
                menu: this._getMenuConfig(),
                titleFmtString: this.securityManagerText + ': ${0}'
            }
            
            dojo.subscribe('/group/context/changed', this, 'onConfigurationChange');
        },
        _getListPanelConfig: function () {
            /*
            example urls for this list...
            http://localhost/SlxClient/slxdata.ashx/slx/system/-/securityProfiles
            http://localhost/SlxClient/slxdata.ashx/slx/system/-/securityProfiles("PROF00000001")?format=json

            http://localhost/SlxClient/slxdata.ashx/slx/system/-/securityProfileColumns("PROF00000001;ACCOUNT;ACCOUNT")?format=html
            http://localhost/SlxClient/slxdata.ashx/slx/system/-/securityProfileColumns?format=json
            http://localhost/SlxClient/slxdata.ashx/slx/system/-/securityProfileColumns?where=table eq "ACCOUNT" and profile.id eq "PROF00000001"
            */

            var refreshBtn = dijit.byId('refreshBtn');
            if (!this.refreshEvent) {
                this.refreshEvent = dojo.connect(refreshBtn, 'onClick', this, function () {
                    var listPanel = dijit.byId('list');
                    listPanel._markClean();
                });
            }

            var structure = [
                { field: 'table', name: this.tableText, width: '155px' },
                { field: 'entity', name: this.entityText, width: '130px' },
                { field: 'column', name: this.columnText, width: '140px' },
                { field: 'property', name: this.propertyText, width: '100px' },
                {
                    field: 'access',
                    name: this.accessText,
                    labels: [this.readWriteText, this.readOnlyText, this.noAccessText],
                    width: '300px',
                    type: RadioGroup,
                    options: ['ReadWrite', 'ReadOnly', 'NoAccess'],
                    editable: true
                }
            ];

            var where = (this._currentProfileId) ? dojo.string.substitute('profile.id eq "${0}"', [this._currentProfileId]) : '';

            if (!this.store) {
                //var store = new Sage.Data.SDataStore({
                this.store = new WritableSDataStore({
                    id: 'securityProfileColumns',
                    service: this.service,
                    isSecurityManager: true,
                    resourceKind: 'securityProfileColumns',
                    include: [],
                    select: ['table', 'entity', 'column', 'property', 'access'],
                    directQuery: { conditions: where }
                });
            } else {
                this.store.directQuery = { conditions: where };
            }
            this.listPanelConfiguration = {
                list: {
                    structure: structure,
                    store: this.store,
                    selectionMode: 'none',
                    id: 'securityManagerListConfig'
                },
                detail: false,
                //                {
                //                    resourceKind: 'securityProfiles',
                //                    loadingMsg: 'Loading...',
                //                    predicateProperty: '$key',
                //                    contentType: Sage.UI.FLSDetailPaneContent
                //                },
                summary: false,
                toolBar: {
                    items: [
                        {
                            icon: '~/ImageResource.axd?scope=global&type=Global_Images&key=Save_16x16',
                            title: this.saveText,
                            onClick: dojo.hitch(this.store, "save")
                        },
                        {
                            icon: '~/ImageResource.axd?scope=global&type=Global_Images&key=Reset_16x16',
                            title: this.resetText,
                            onClick: dojo.hitch(this.store, "revert")
                        }
                    ]
                }
            };

            dojo.style(dijit.byId('addGroupButton').domNode, 'display', 'none');
            return this.listPanelConfiguration;
        },
        requestConfiguration: function (options) {
            //returns the list panel configuration through the success callback method...
            if (options.success) {
                options.success.call(options.scope || this, this._getListPanelConfig(), this);
            }
        },
        requestTitlePaneConfiguration: function (options) {
            //            this.titlePaneConfiguration = {
            //                tabs: this._getTabsConfig(),
            //                menu: this._getMenuConfig(),
            //                titleFmtString: 'Security Manager: ${0}'
            //            };
            if (options.success) {
                options.success.call(options.scope || this, this.titlePaneConfiguration, this);
            }
        },
        //handleGroupChanged: function(obj) {
        onConfigurationChange: function (obj) {
            this._currentProfileId = obj.current.CurrentGroupID;
            this._currentProfileDescription = obj.current.CurrentName;
            if (this._currentProfileId && this._currentProfileId.length === 12) {
                if (this._profileNameCache && this._profileNameCache.hasOwnProperty(this._currentProfileId)) {
                    this._setUIForNewGroup(false);
                } else {
                    this._profilesStore.fetch({
                        onComplete: dojo.hitch(this, '_setUIForNewGroup')
                    });
                }
            }
        },
        onTitlePaneConfigurationChange: function () {

        },
        _setUIForNewGroup: function (profileList) {
            if (profileList) {
                this._profileNameCache = {};
                for (var i = 0; i < profileList.length; i++) {
                    this._profileNameCache[profileList[i]['$key']] = profileList[i]['$descriptor'];
                }
            }

            //set title in title pane...
            var titlePane = dijit.byId('titlePane');
            if (titlePane) {
                titlePane.set('title', this._profileNameCache[this._currentProfileId]);
            }

            //select correct tab (without firing tab change event?...)
            var tabs = dijit.byId('GroupTabs');
            if (tabs) {
                var children = tabs.getChildren();
                for (var i = 0; i < children.length; i++) {
                    if (children[i].id === this._currentProfileId) {
                        tabs.selectChild(children[i], false);
                        break;
                    }
                }
            }
        },
        _getTabsConfig: function () {
            this._setProfilesStore();
            this._profilesStore.fetch({
                onComplete: dojo.hitch(this, '_setUIForNewGroup')
            });
            return {
                store: this._profilesStore,
                selectedTabId: this._currentProfileId,
                tabKeyProperty: '$key',
                tabNameProperty: 'profileDescription',
                fetchParams: {},
                staticTabs: [],
                onTabSelect: function (child) {
                    var grpContextSvc = Sage.Services.getService('ClientGroupContext');
                    if (grpContextSvc) {
                        var ctx = grpContextSvc.getContext();
                        var id = child.id || child;
                        if (ctx.CurrentGroupID === id) {
                            return;
                        }
                        var listPanel = dijit.byId('list');
                        listPanel._markClean();
                        grpContextSvc.setCurrentGroup(id, child.title);
                    }
                },
                onTabClose: false
            };

        },
        _setProfilesStore: function () {
            this._profilesStore = this._profilesStore || new WritableSDataStore({
                id: 'securityProfilesstore',
                service: this.service,
                resourceKind: 'securityProfiles',
                include: [],
                select: ['profileDescription', 'defaultPermission', 'profileType'],
                orderby: 'profileDescription'
            });
        },
        _getMenuConfig: function () {
            this._setProfilesStore();
            return {
                id: 'profileMenu',
                img: 'images/icons/Groups_16x16.gif',
                text: this.profilesText,
                tooltip: this.profilesText,
                width: '300px',
                items: [
                    {
                        fn: this._getProfileMenuGrid,
                        scope: this
                    }
                ]
            };
        },
        _getProfileMenuGrid: function () {
            return new Sage.UI.GridMenuItem({
                gridOptions: {
                    id: 'profileGridInMenu',
                    store: this._profilesStore,
                    rowsPerPage: 40,
                    structure: [
                        { field: 'profileDescription', name: 'Description', width: '290px'}//,
                    //{field: 'defaultPermission', name: 'Default Permission', width: '150px'},
                    //{field: 'profileType', name: 'Profile Type', width: '150px'}
                    ],
                    selectionMode: 'single',
                    query: {},
                    height: '400px',
                    width: '350px',
                    //formatterScope: fmtScope,
                    onSelected: function (idx) {
                        var profile = this.getItem(idx);
                        var ctxService = Sage.Services.getService('ClientGroupContext');
                        if (ctxService) {
                            var ctx = ctxService.getContext();
                            if (ctx.CurrentGroupID === profile['$key']) {
                                return;
                            }
                            
                            var groupTabs = dijit.byId('GroupTabs'),
                                groupTabChildren = groupTabs.getChildren();
                            for(var i = 0; i < groupTabChildren.length; i++) {
                                if(groupTabChildren[i].id == profile['$key']) {
                                    groupTabs.selectChild(groupTabChildren[i]);
                                    ctxService.setCurrentGroup(profile['$key'], profile.profileDescription);
                                    return;
                                }
                            }
                        }
                    }
                }
            });
        }

    });
    return securityManager;
});