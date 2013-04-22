/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/_ConfigurationProvider',
        'Sage/Services/_ServiceMixin',
        'dijit/Menu',
        'Sage/UI/MenuItem',
        'dojo/_base/lang',
        'dojo/_base/declare'
],
function (
    _ConfigurationProvider, 
    _ServiceMixin,
    dijitMenu,
    sageMenuItem,
    lang,
    declare) {
    var groupListConfigProvider = declare('Sage.UI.tests.ListPanelTestConfigProvider', [_ConfigurationProvider, _ServiceMixin], {
        serviceMap: {

        },
        service: null,
        
        constructor: function (options) {
            this._menuItems = [];
        },
        requestConfiguration: function (options) {
            var i, len = 1000,
                entry = {
                    layout: [
                    ],
                    keyField: 'id',
                    '$key': '12345',
                    tableAliases: {
                        tableName: '',
                        alias: ''
                    },
                    family: 'Entity',
                    name: 'ENTITY'
                };
            
            for (i = 0; i < len; i++) {
                entry.layout.push({
                    alias: 'Alias' + i,
                    visible: true,
                    webLink: false,
                    dataPath: 'Alias' + i,
                    propertyPath: 'Alias' + i,
                    caption: 'Alias' + i,
                    width: '100',
                    format: '',
                    formatString: ''
                });
            }
            
            this._createConfiguration(entry);
        },
        _createConfigurationForList: function (entry) {
            // todo: fix to store layout somewhere
            var layout = entry.layout,
                select = [],
                structure = [];

            if (entry['keyField']) {
                select.push(entry['keyField']);
            }

            for (var i = 0; i < layout.length; i++) {
                var item = layout[i];
                select.push(item['alias']);
                structure.push({
                    field: item['alias'],
                    property: item['caption'],
                    name: item['caption'],
                    width: item['width'] + 'px'
                });
            }

            var store = {
                service: this.service,
                resourceKind: 'groups',
                resourcePredicate: this.formatPredicate(entry),
                queryName: 'execute',
                select: select,
                include: []
            };

            var tableAliases = {};
            for (var i = 0; i < entry['tableAliases'].length; i++)
                tableAliases[entry['tableAliases'][i]['tableName'].toUpperCase()] = entry['tableAliases'][i]['alias'];

            return {
                structure: [{
                    defaultCell: {defaultValue: ''}, 
                    cells: [
                        structure
                    ]
                }],
                store: store,
                layout: entry['layout'],
                tableAliases: tableAliases,
                selectedRegionContextMenuItems: this._getListContextMenuItems(),
                onSelectedRegionContextMenu : this._onListContext,
                onNavigateToDefaultItem: lang.hitch(entry, function(item /* Datestore item that was acted on */) {
                    if (item) {
                        var keyField = this['keyField'],
                            entityName = this['entityName'],
                            id = item[keyField];

                        if (id) {
                            Sage.Link.entityDetail(entityName, id);
                        }
                    }
                }),
                id: entry['$key']
            };
        },
        _onListContext: function(e) {
        },
        _getListContextMenuItems: function() {
            this._menuItems = [];
            var len = 10,
                menuItem,
                i;
                
            for (i = 0; i < len; i++) {
                menuItem = new sageMenuItem({
                    label: 'Menu' + i,
                    icon: '',
                    title: '',
                    ref: '',
                    onClick: function() {
                    }
                });
                
                this._menuItems.push(menuItem);
            }
            
            return this._menuItems //{ selectedRegion: menu  };//, headerMenu, rowMenu, cellMenu, selectedRegionMenu: menu  ???  
        },
        _createConfigurationForSummary: function (entry) {
            return false;
        },
        _createConfiguration: function (entry) {
            return {
                list: this._createConfigurationForList(entry),
                summary: this._createConfigurationForSummary(entry)
            };
        },
        formatPredicate: function (group) {
            group.family = group.family && group.family.toUpperCase();
            return dojo.string.substitute("name eq '${name}' and upper(family) eq '${family}'", group);
        },
        getCurrentGroup: function () {
            return { name: 'My Accounts', family: 'Account' };
        }
    });
    
    return groupListConfigProvider;
});