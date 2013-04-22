/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojox/grid/DataGrid',
    'Sage/Data/SDataStore',
    'Sage/Data/SDataServiceRegistry',
    'dojo/string',
    'Sage/Groups/GroupContextService',
    'dojo/_base/declare',
    'dijit/_Widget',
    'dojo/_base/lang',
    'Sage/UI/Filters/FilterManager',
    'dojo/_base/array',
    'Sage/Utility/_LocalStorageMixin',
    'dojo/topic'
],
function (DataGrid,
        SDataStore,
        sDataServiceRegistry,
        dString,
        GroupContextService,
        declare,
        _Widget,
        lang,
        FilterManager,
        array,
        _LocalStorageMixin,
        topic) {
    var groupListTasklet = declare('Sage.Groups.GroupListTasklet', [_Widget, _LocalStorageMixin], {

        _contextSetHandle: null,
        _groupChangedHandle: null,
        gridLoadedHandler: null,
        gridOnSelectedHandle: null,
        groupContextService: null,
        context: null,

        grid: null,
        store: null,
        query: '',
        service: null,
        id: 'GroupListTasklet',
        keyAlias: '',
        columnDisplayName: '',
        allowOnSelectToFire: true, // flag so we can skip the _onSelected event if needed

        STORE_KEY_STORE_QUERY: '_STORE_QUERY_', // + groupId

        subscribesTo: {
            groupLookupSuccess: "/group/lookup/success",
            adhocGroupRemoved: "/group/adhoc/removed",
            groupNavFirst: "/group/nav/first",
            groupNavPrevious: "/group/nav/previous",
            groupNavNext: "/group/nav/next",
            groupNavLast: "/group/nav/last"
        },

        constructor: function (options) {
            //summary:
            //      Clientside script to instantiate the detail view's grouplist.  Should only be called by
            //      SmartParts\TaskPane\GroupList\GroupListTasklet.ascx
            //options: object
            //      options for this list, needs a keyAlias, columnDisplayName, id
            //returns:
            //      constructs the list
            this.inherited(arguments);
            lang.mixin(this, options);

            this.groupContextService = Sage.Services.getService("ClientGroupContext");
            this.context = this.groupContextService.getContext();

            if (this.context.CurrentFamily === null) {
                this._contextSetHandle = dojo.connect(this.groupContextService, 'onContextSet', this, '_createList');
            } else {
                this._createList();
            }

            // Events
            this._groupChangedHandle = dojo.connect(this.groupContextService, 'onCurrentGroupChanged', this, '_groupChanged');

            topic.subscribe(this.subscribesTo.groupLookupSuccess, lang.hitch(this, this._onLookupSuccess));
            topic.subscribe(this.subscribesTo.groupNavFirst, lang.hitch(this, this._onGroupNavFirst));
            topic.subscribe(this.subscribesTo.groupNavPrevious, lang.hitch(this, this._onGroupNavPrevious));
            topic.subscribe(this.subscribesTo.groupNavNext, lang.hitch(this, this._onGroupNavNext));
            topic.subscribe(this.subscribesTo.groupNavLast, lang.hitch(this, this._onGroupNavLast));

            topic.subscribe(this.subscribesTo.adhocGroupRemoved, lang.hitch(this, this._onRecordRemoved));
        },
        _onLookupSuccess: function (args) {
            /* args object:
            {
                conditions: 'conditions string'
            }
            */

            Sage.Link.toListView();
        },
        _onGroupNavFirst: function (args) {
            /* args object:
            {
                count: 10,
                fromEntityId: 'EntityId',
                position: 1,
                toEntityId: 'EntityId'
            }
            */

            this.selectGridRow(0);
        },
        _onGroupNavLast: function (args) {
            /* args object:
            {
                count: 10,
                fromEntityId: 'EntityId',
                position: 1,
                toEntityId: 'EntityId'
            }
            */

            this.selectGridRow(args.count - 1);
        },
        _onGroupNavPrevious: function (args) {
            /* args object:
            {
                count: 10,
                fromEntityId: 'EntityId',
                position: 1,
                toEntityId: 'EntityId'
            }
            */

            // grid is 0 based, groups are 1 based
            var position = args.position - 1;
            this.selectGridRow(position - 1);
        },
        _onGroupNavNext: function (args) {
            /* args object:
            {
                count: 10,
                fromEntityId: 'EntityId',
                position: 1,
                toEntityId: 'EntityId'
            }
            */

            // grid is 0 based, groups are 1 based
            var position = args.position - 1;
            this.selectGridRow(position + 1);
        },
        _onRecordRemoved: function (args) {
            /* args object:
            {
                family: 'ACCOUNT',
                groupId: 'somegroupId',
                groupName: 'Some Group',
                ids: [1, 2] // List of ids removed. In our case this should always have a length of 1 in detail mode
            }
            */
            var index,
                newIndex;

            index = this.grid.selection.selectedIndex;
            if (index === 0) {
                newIndex = index + 1;
            } else {
                newIndex = index - 1;
            }

            this.selectGridRow(newIndex);
            this._onSelected(newIndex);

            // If we were on the first row, stay there, otherwise jump back one
            this._onRecordRemovedRefresh(index === 0 ? index : newIndex);
        },
        _onRecordRemovedRefresh: function (index) {
            if (this.grid) {
                this.gridRefreshedHandler = dojo.connect(this.grid, '_onFetchComplete', this, function () {
                    this.selectGridRow(index);
                });

                try {
                    this.grid.setStore(this.get('store'));
                } catch (err) { }
            }
        },
        _groupChanged: function () {
            if (this.grid) {
                this.gridLoadedHandler = dojo.connect(this.grid, '_onFetchComplete', this, '_groupChangedAndLoaded');

                try {
                    this.grid.setStore(this.get('store'));
                } catch (err) { }
            }
        },
        _groupChangedAndLoaded: function () {
            this.selectGridRow(0);
            this._onSelected(0);
            if (this.gridLoadedHandler) {
                dojo.disconnect(this.gridLoadedHandler);
            }
        },
        _getStoreQueryKey: function () {
            var id = this.STORE_KEY_STORE_QUERY + this._getGroupID();
            return id;
        },
        _getGroupNS: function () {
            var ns = Sage.Groups.GroupManager.LOCALSTORE_NAMESPACE + '-' + this._getGroupID();
            return ns;
        },
        _getGroupID: function () {
            this.context = this.groupContextService.getContext();
            var results = -1;
            if (this.context) {
                results = this.context.CurrentGroupID;
            }

            return results;
        },
        _getStoreAttr: function () {
            this.context = this.groupContextService.getContext();
            this.context.CurrentFamily = this.context.CurrentFamily.toUpperCase();
            var resourcePredicate = "'" + this.context.CurrentGroupID + "'";

            if (this.context['CurrentGroupID'] === 'LOOKUPRESULTS') {
                // If this is a non-English site, the query will fail to pull from 'Lookup Results' group
                this.context['CurrentName'] = 'Lookup Results';
            }

            var temp = this.getFromLocalStorage(this._getStoreQueryKey(), this._getGroupNS()),
                defaults = {
                    resourceKind: 'groups',
                    service: this.service,
                    queryName: 'execute',
                    resourcePredicate: resourcePredicate,
                    select: [this.keyAlias, this.columnDisplayName]
                };

            if (temp && temp.store && temp.query) {
                // Mixing in will give a type error in the grid
                defaults.select = temp.store.select;
                defaults.resourcePredicate = temp.store.resourcePredicate;
                this.query = temp.query;
                if (this.query) {
                    defaults.where = this.query;
                }
            }

            this.store = new SDataStore(defaults);
            return this.store;
        },
        refreshGrid: function () {
            // Refresh the grid and fire onSelected to navigate as well.
            // Fires on group change, or initial loading.
            this.context = this.groupContextService.getContext();
            var position = this.context.CurrentEntityPosition - 1;

            this.selectGridRow(position);

            if (this.gridRefreshedHandler) {
                dojo.disconnect(this.gridRefreshedHandler);
            }
        },
        selectGridRow: function (position) {
            this.allowOnSelectToFire = false;
            if (this.grid.rowCount > 0) {
                this.grid.scrollToRow(position);
                this.grid.selection.clear();
                this.grid.selection.select(position);
                this.grid.onSelected(position);
            } else {
                Sage.Link.toListView();
            }
            this.allowOnSelectToFire = true;
        },
        uninitialize: function () {
            try {
                if (this.grid && this.grid.destroy) {
                    this.grid.destroy();
                }
                if (this.gridOnSelectedHandle) {
                    this.gridOnSelectedHandle.remove();
                }
            } catch (err) {
            }

            this.inherited(arguments);
        },
        _createList: function () {
            var self = this,
                gridId = this.id + "_grid",
                grid;

            this.service = sDataServiceRegistry.getSDataService('system');

            if (this.grid) {
                this.grid.setStore(this.get('store'));
                grid = this.grid;
            } else {
                grid = new DataGrid({
                    store: this.get('store'),
                    id: gridId,
                    structure: [{
                        field: "_item",
                        headerClasses: "displaynone",
                        width: '100%',
                        formatter: function (item) {
                            return (item && item.hasOwnProperty(self.columnDisplayName) ? item[self.columnDisplayName] : dojo.string.substitute("(${0})", [item[self.keyAlias]]));
                        }
                    }, {
                        field: this.keyAlias,
                        hidden: true,
                        headerClasses: "displaynone",
                        width: '0px'
                    }],
                    showTitle: false,
                    autoWidth: false,
                    rowSelector: false,
                    selectionMode: 'single',
                    width: '100%',
                    height: '230px'
                });

                dojo.byId(this.id + '_node').appendChild(grid.domNode);
                this.gridRefreshedHandler = dojo.connect(grid, '_onFetchComplete', this, 'refreshGrid');
                grid.startup();
                this.grid = grid;
            }

            this.gridOnSelectedHandle = this.grid.on('selected', lang.hitch(this, this._onSelected));
        },
        _onSelected: function (index) {
            if (!this.allowOnSelectToFire) {
                /* selectGridRow sets this to false, so we can select the row without navigating to the entity */
                return;
            }

            var cec,
                preventity,
                selected,
                nav;

            if (Sage.Services.hasService("ClientEntityContext")) {
                cec = Sage.Services.getService("ClientEntityContext");
                preventity = cec.getContext().EntityId;
                selected = this.grid.selection.getFirstSelected();
                if (selected) {
                    cec.navigateSLXGroupEntity(selected[this.keyAlias], preventity, index + 1);
                }
            }
        }
    });

    return groupListTasklet;
});
