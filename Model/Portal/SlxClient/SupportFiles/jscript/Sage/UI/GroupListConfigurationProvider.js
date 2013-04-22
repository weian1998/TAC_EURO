/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/_ConfigurationProvider',
        'Sage/Data/GroupLayoutSingleton',
        'Sage/Services/_ServiceMixin',
        'Sage/UI/Columns/SlxLink',
        'Sage/UI/Columns/Boolean',
        'Sage/UI/Columns/DateTime',
        'Sage/UI/Columns/Numeric',
        'Sage/UI/Columns/OwnerType',
        'Sage/UI/Columns/Phone',
        'Sage/UI/Columns/UserType',
        'Sage/UI/Columns/Currency',
        'Sage/Data/SDataStore',
        'Sage/UI/SummaryFormatterScope',
        'dijit/MenuSeparator',
        'dijit/Menu',
        'Sage/UI/MenuItem',
        'dojo/_base/lang',
        'dojo/_base/declare',
        'dojo/i18n'
],
function (
    _ConfigurationProvider,
    GroupLayoutSingleton,
    _ServiceMixin,
    slxLinkColumn,
    booleanColumn,
    dateTimeColumn,
    numericColumn,
    ownerTypeColumn,
    phoneColumn,
    userTypeColumn,
    Currency,
    SDataStore,
    summaryFormatterScope,
    menuSeparator,
    dijitMenu,
    sageMenuItem,
    lang,
    declare,
    i18n) {
    var groupListConfigProvider = declare('Sage.UI.GroupListConfigurationProvider', [_ConfigurationProvider, _ServiceMixin], {
        serviceMap: {
            'groupContextService': 'ClientGroupContext'
        },
        service: null,
        _hasAdHocList: false,
        ROWS_PER_PAGE: 100,

        constructor: function (options) {
            this._adHocOnlyMenuItems = [];
            this._menuItems = [];
            this._subscribes.push(dojo.subscribe('/group/context/changed', this, this._onGroupContextChanged));
        },
        _onGroupContextChanged: function () {
            this.onConfigurationChange();
        },
        requestConfiguration: function (options) {
            var singleton = new GroupLayoutSingleton(),
                onSuccess = lang.hitch(this, this._onRequestConfigurationSuccess, options || {}),
                onFail = lang.hitch(this, this._onRequestConfigurationFailure, options || {}),
                group = this.getCurrentGroup();
            singleton.getGroupLayout(this.formatPredicate(group), onSuccess, onFail, group.$key);
        },
        _onRequestConfigurationSuccess: function (options, entry) {
            if (options.success) {
                options.success.call(options.scope || this, this._createConfiguration(entry), options, this);
            }
        },
        _onRequestConfigurationFailure: function (options, response) {
            if (options.failure) {
                options.failure.call(options.scope || this, response, options, this);
            }
        },
        _createConfigurationForList: function (entry) {
            // todo: fix to store layout somewhere
            var layout = entry.layout,
                select = [],
                structure = [],
                groupContextService = Sage.Services.getService("ClientGroupContext"),
                context,
                i;

            if (groupContextService) {
                context = groupContextService.getContext();
            }

            if (entry['keyField']) {
                select.push(entry['keyField']);
            }

            for (i = 0; i < layout.length; i++) {
                var item = layout[i];
                select.push(item['alias']);
                if (item['visible']) {
                    if (item['webLink']) {
                        var dataPath = item['dataPath'],
                            entity = dataPath.lastIndexOf("!") > -1 ? dataPath.substring(0, dataPath.lastIndexOf("!")).substring(dataPath.lastIndexOf(".") + 1) : dataPath.substring(0, dataPath.lastIndexOf(":")),
                            keyField = entity + 'ID';

                        //take into account the often denormalized field "ACCOUNT" that lives on several entities... (Contact, etc.)
                        if (item['alias'] === 'ACCOUNT' || item['alias'].match(/A\d+_ACCOUNT/ig)) {
                            entity = 'ACCOUNT';
                            keyField = 'ACCOUNTID';
                        }
                        if ((context) && (entity === context.CurrentTable)) {
                            entity = context.CurrentEntity;
                            keyField = context.CurrentTableKeyField;
                        }
                        select.push(keyField);

                        structure.push({
                            field: item['alias'],
                            property: item['propertyPath'],
                            name: item['caption'],
                            type: slxLinkColumn,
                            pageName: entity,
                            idField: keyField,
                            width: item['width'] + 'px'
                        });
                    }
                    else {
                        // hack section
                        if (item['alias'].match(/^email$/i)) {
                            item['format'] = 'Email';
                        }
                        if (item['fieldType'] === 'DateTime') {
                            item['format'] = 'DateTime';
                        }
                        // end hack section

                        switch (item['format']) {
                            case 'Boolean':
                                structure.push({
                                    field: item['alias'],
                                    property: item['propertyPath'],
                                    name: item['caption'],
                                    type: booleanColumn,
                                    styles: 'text-align: ' + item['align'] + ';',
                                    formatString: item['formatString'],
                                    width: item['width'] + 'px'
                                });
                                break;

                            case 'DateTime':
                                structure.push({
                                    field: item['alias'],
                                    property: item['propertyPath'],
                                    name: item['caption'],
                                    type: dateTimeColumn,
                                    styles: 'text-align: ' + item['align'] + ';',
                                    datePattern: item['formatString'],
                                    width: item['width'] + 'px'
                                });
                                break;

                            case 'Email':
                                structure.push({
                                    field: item['alias'],
                                    property: item['propertyPath'],
                                    name: item['caption'],
                                    styles: 'text-align: ' + item['align'] + ';',
                                    formatter: function (val) {
                                        if (!val) {
                                            return '';
                                        }

                                        return dojo.string.substitute(
                                        '<a href=mailto:${0}>${0}</a>',
                                        [Sage.Utility.htmlEncode(val)]);
                                    },
                                    width: item['width'] + 'px'
                                });
                                break;

                            case 'Percent':
                                structure.push({
                                    field: item['alias'],
                                    property: item['propertyPath'],
                                    name: item['caption'],
                                    type: numericColumn,
                                    styles: 'text-align: ' + item['align'] + ';',
                                    constraints: {
                                        places: Sage.Utility.getPrecision(item['formatString']),
                                        round: -1
                                    },
                                    fercent: true,
                                    formatType: 'Percent',
                                    width: item['width'] + 'px',
                                    isWholeNumberPercent: false
                                });
                                break;
                                
                            case 'Fixed':
                                structure.push({
                                    field: item['alias'],
                                    property: item['propertyPath'],
                                    name: item['caption'],
                                    type: numericColumn,
                                    styles: 'text-align: ' + item['align'] + ';',
                                    constraints: {
                                        places: Sage.Utility.getPrecision(item['formatString']),
                                        round: -1
                                    },
                                    // a fake percent
                                    fercent: true,
                                    formatType: item['formatString'][
                                    item['formatString'].length - 1] === '%' ? 'Percent' : 'Number',
                                    width: item['width'] + 'px',
                                    isWholeNumberPercent: item['format'] === 'Percent' ? false : true
                                });
                                break;

                            case 'Owner':
                                var ownerName = item['alias'] + 'NAME';
                                select.push(ownerName);
                                structure.push({
                                    field: ownerName,
                                    styles: 'text-align: ' + item['align'] + ';',
                                    name: item['caption'],
                                    width: item['width'] + 'px'
                                });
                                break;

                            case 'OwnerType':
                                structure.push({
                                    field: item['alias'],
                                    property: item['propertyPath'],
                                    name: item['caption'],
                                    type: ownerTypeColumn,
                                    styles: 'text-align: ' + item['align'] + ';',
                                    width: item['width'] + 'px'
                                });
                                break;

                            case 'Phone':
                                structure.push({
                                    field: item['alias'],
                                    property: item['propertyPath'],
                                    name: item['caption'],
                                    type: phoneColumn,
                                    styles: 'text-align: ' + item['align'] + ';',
                                    width: item['width'] + 'px'
                                });
                                break;

                            case 'PickList Item':
                                var pickName = item['alias'] + 'TEXT';
                                select.push(pickName);
                                structure.push({
                                    field: pickName,
                                    styles: 'text-align: ' + item['align'] + ';',
                                    property: item['propertyPath'],
                                    name: item['caption'],
                                    width: item['width'] + 'px'
                                });
                                break;

                            case 'User':
                                var userName = item['alias'] + 'NAME';
                                select.push(userName);
                                structure.push({
                                    field: userName,
                                    styles: 'text-align: ' + item['align'] + ';',
                                    name: item['caption'],
                                    width: item['width'] + 'px'
                                });
                                break;

                            case 'User Type':
                                structure.push({
                                    field: item['alias'],
                                    property: item['propertyPath'],
                                    name: item['caption'],
                                    type: userTypeColumn,
                                    styles: 'text-align: ' + item['align'] + ';',
                                    width: item['width'] + 'px'
                                });
                                break;
                            case 'Currency':
                                structure.push({
                                    field: item['alias'],
                                    property: item['caption'],
                                    name: item['caption'],
                                    type: Currency,
                                    styles: 'text-align: ' + item['align'] + ';',
                                    width: item['width'] + 'px'
                                });
                                break;
                            default:
                                structure.push({
                                    field: item['alias'],
                                    property: item['caption'],
                                    name: item['caption'],
                                    styles: 'text-align: ' + item['align'] + ';',
                                    width: item['width'] + 'px'
                                });
                                break;
                        } // end switch
                    }
                } // end if(visable)
            } // end for loop

            var store = new SDataStore({
                service: this.service,
                resourceKind: 'groups',
                resourcePredicate: this.formatPredicate(entry),
                queryName: 'execute',
                select: select,
                include: [],
                count: this.ROWS_PER_PAGE
            });

            var tableAliases = {};
            for (i = 0; i < entry['tableAliases'].length; i++)
                tableAliases[entry['tableAliases'][i]['tableName'].toUpperCase()] = entry['tableAliases'][i]['alias'];

            return {
                structure: [{
                    defaultCell: { defaultValue: '' },
                    cells: [
                        structure
                    ]
                }],
                store: store,
                rowsPerPage: this.ROWS_PER_PAGE,
                layout: entry['layout'],
                tableAliases: tableAliases,
                selectedRegionContextMenuItems: this._getListContextMenuItems(),
                onSelectedRegionContextMenu: this._onListContext,
                onNavigateToDefaultItem: lang.hitch(entry, function (item /* Datestore item that was acted on */) {
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
        _getCurrentGroupID: function () {
            var groupContextService = Sage.Services.getService("ClientGroupContext"),
                context,
                results;

            if (groupContextService) {
                context = groupContextService.getContext();
                results = context.CurrentGroupID;
            }

            return results;
        },
        _onListContext: function (e) {
            var groupContextSvc = Sage.Services.getService('ClientGroupContext');
            var context = groupContextSvc.getContext();
            for (var i = 0; i < this._adHocOnlyMenuItems.length; i++) {
                this._adHocOnlyMenuItems[i].set('disabled', !context.isAdhoc);
            }
            this._ensureAdHocListMenu();
        },
        _getListContextMenuItems: function () {
            var menuItem,
                groupId = this._getCurrentGroupID();
            if (this._menuItems.length > 0) {
                return this._menuItems;
            }
            if (!Sage.UI.DataStore.ContextMenus || !Sage.UI.DataStore.ContextMenus.listContextMenu) {
                return [];
            }
            this._menuItems = [];
            this._adHocOnlyMenuItems = [];
            var menuConfig = Sage.UI.DataStore.ContextMenus.listContextMenu.items;
            var len = menuConfig.length;
            for (var i = 0; i < len; i++) {
                var mDef = menuConfig[i];
                if (mDef.displayName === '') {
                    this._menuItems.push(new menuSeparator());
                } else {
                    var href = mDef.href;
                    if (href.indexOf('javascript:') < 0) {
                        href = dojo.string.substitute("javascript:${0}()", [href]);
                    }
                    if (href.indexOf('addSelectionsToGroup') > 0) {
                        menuItem = this._createAddToAdHocMenuItem(mDef);

                        if (menuItem.arrowWrapper) {
                            dojo.style(menuItem.arrowWrapper, "visibility", "");
                        }
                    } else {
                        menuItem = new sageMenuItem({
                            id: groupId + '_' + i,
                            label: mDef.text || '...',
                            icon: mDef.img,
                            title: mDef.tooltip || '',
                            ref: href,
                            onClick: function () {
                                if (this.ref !== '') {
                                    try {
                                        window.location.href = this.ref;
                                    } catch (e) { }
                                }
                            }
                        });
                    }
                    this._menuItems.push(menuItem);
                    if (href.indexOf('removeSelectionsFromGroup') > 0) {
                        this._adHocOnlyMenuItems.push(menuItem);
                    }
                }
            }
            return this._menuItems;
        },
        _createAddToAdHocMenuItem: function (menuDef) {
            this._adHocMenu = new dijitMenu();
            this._adHocMenu.addChild(new sageMenuItem({
                label: 'loading...'
            }));
            this._adHocMenuHref = menuDef.href;
            var menuItem = new sageMenuItem({
                label: menuDef.text || '...',
                icon: menuDef.img,
                title: menuDef.tooltip || '',
                popup: this._adHocMenu
            });
            return menuItem;
        },
        _ensureAdHocListMenu: function () {
            if (this._hasAdHocList) {
                return;
            }
            this._hasAdHocList = true;
            var svc = Sage.Services.getService('ClientGroupContext');
            svc.getAdHocGroupList(function (list) {
                this._adHocMenu.destroyDescendants();
                for (var i = 0; i < list.length; i++) {
                    var grp = list[i];
                    this._adHocMenu.addChild(new sageMenuItem({
                        label: grp['$descriptor'] || grp['name'],
                        icon: '',
                        title: grp['$descriptor'] || grp['name'],
                        ref: dojo.string.substitute(this._adHocMenuHref, { 'groupId': grp['$key'] }),
                        onClick: function () {
                            if (this.ref !== '') {
                                try {
                                    window.location.href = this.ref;
                                } catch (e) { }
                            }
                        }
                    }));
                }
            }, this);
        },
        _createConfigurationForSummary: function (entry) {
            if (!this.summaryOptions) {
                return false;
            }
            var store = new SDataStore({
                service: this.service,
                resourceKind: 'groups',
                resourcePredicate: this.formatPredicate(entry),
                queryName: 'execute',
                select: [entry['keyField']],
                include: []
            }),
                structure = [
                    {
                        field: entry['keyField'],
                        formatter: 'formatSummary',
                        width: '100%',
                        name: 'Summary View',
                        canResize: function () { return false; }
                    }
                ],
                moduleNameParts = ['Sage'],
                templateLocation = this.summaryOptions['templateLocation'],
                templateParts = templateLocation && templateLocation.split('/'),
                i,
                path;

            for (i = 0; i < templateParts.length - 1; i++) {
                moduleNameParts.push(templateParts[i]);
            }
            path = 'dojo/i18n!' + moduleNameParts.join('/') + '/nls/' + templateParts[templateParts.length - 1].replace('.html', '');

            require([path],
                lang.hitch(this, function (nls) {
                    lang.mixin(this, nls);
                })
            );
            return {
                structure: structure,
                layout: entry['layout'],
                store: store,
                rowHeight: 200,
                rowsPerPage: 50,
                formatterScope: new summaryFormatterScope({
                    requestConfiguration: {
                        mashupName: this.summaryOptions['mashupName'] || 'SummaryViewQueries',
                        queryName: this.summaryOptions['queryName'] || ''
                    },
                    templateLocation: this.summaryOptions['templateLocation'] || ''
                })
            };
        },
        _createConfigurationForDetail: function (entry) {
            if (this.detailConfiguration) {
                return {
                    requestConfiguration: {
                        mashupName: this.detailConfiguration['mashupName'] || 'SummaryViewQueries',
                        queryName: this.detailConfiguration['queryName'] || ''
                    },
                    templateLocation: this.detailConfiguration['templateLocation']
                };
            }
            return false;
        },
        _createConfiguration: function (entry) {
            return {
                list: this._createConfigurationForList(entry),
                summary: this._createConfigurationForSummary(entry),
                detail: this._createConfigurationForDetail(entry)
            };
        },
        formatPredicate: function (group) {
            if (group.$key === 'LOOKUPRESULTS') {
                group.family = group.family && group.family.toUpperCase();
                group.name = 'Lookup Results';
                return dojo.string.substitute("name eq '${name}' and upper(family) eq '${family}'", group);
            }

            return "'" + group.$key + "'";
        },
        getCurrentGroup: function () {
            var service = Sage.Services.getService('ClientGroupContext'),
                context = service && service.getContext(),
                results = { name: 'My Accounts', family: 'Account', $key: '' };
            if (context) {
                results = {
                    name: context.CurrentName,
                    family: context.CurrentFamily,
                    $key: context.CurrentGroupID
                };
            }

            return results;
        }
    });
    return groupListConfigProvider;
});