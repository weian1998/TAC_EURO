define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/Deferred',
    'dojo/string',
    'dojo/dom',
    'dojo/on',
    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/DeferredList',
    'dijit/_Widget',
    'Sage/Services/_ServiceMixin',
    'Sage/_EventMapMixin',
    'Sage/_Templated',
    'dojo/dnd/Source',
    'dojo/dnd/Manager',
    'dojo/i18n!./nls/DataSourcePanel'
], function(
    declare,
    array,
    lang,
    Deferred,
    string,
    dom,
    on,
    domAttr,
    domClass,
    domConstruct,
    DeferredList,
    _Widget,
    _ServiceMixin,
    _EventMapMixin,
    _Templated,
    Source,
    Manager,
    localization
) {
    var _Source = declare('Sage.QuickForms.Design.DataSourcePanelDnDSource', [Source], {
        avatarTemplate: new Simplate([
            '<div class="design-property" data-property-type="{%: $.data.dataTypeId %}">',
            '<div class="design-property-icon"></div>',
            '<span>{%: $.propertyPath %}</span>',
            '</div>'
        ]),
        owner: null,
        accept: ['none'],
        constructor: function() {
            this.creator = true; /* flag to enable use of _normalizedCreator */
            lang.mixin(this, localization);
            // The help link for the task pane is handled by base.master
            // so it needs to be manually manipulated here to be different
            // on the FormManager page
            var taskPaneHelpIcon = dojo.byId('TaskPane_taskPaneHelp');
            if(taskPaneHelpIcon) {
                taskPaneHelpIcon.target = '';
                taskPaneHelpIcon.href = 'javascript:Sage.Utility.openHelp("Adding_Data_Field");';
            }
        },
        checkAcceptance: function(fromSource, nodes) {
            if (fromSource == this) return false;

            return this.inherited(arguments);
        },
        onDropInternal: function(fromSource, nodes, copy) {
            /* do nothing */
        },
        onDropExternal: function(fromSource, nodes, copy) {
            /* do nothing */
        },
        onDndStart: function(fromSource, nodes, copy) {
            this.inherited(arguments);
        },
        onDndCancel: function() {
            this.inherited(arguments);
        },
        getItem: function(key) {
            var value = this.inherited(arguments),
                node = dom.byId(key),
                path = domAttr.get(node, 'data-property'),
                context = node && this.owner._context[path];

            return lang.mixin({
                context: context
            }, value);
        },
        /**
         * The `_normalizedCreator` method is used to generate a separate, style-able, avatar, instead of
         * overriding avatar creation globally or swapping methods in and out on drag start and cancel.
         *
         * @unsafe
         */
        _normalizedCreator: function(data, hint) {
            var context = this.owner._context[data],
                contentNode = domConstruct.toDom(this.avatarTemplate.apply(context, this)),
                containerNode = domConstruct.create('div', {
                    'class': 'design-surface-dnd-avatar'
                });

            domConstruct.place(contentNode, containerNode);

            return {node: containerNode};
        }
    });

    var DataSourcePanel = declare('Sage.QuickForms.Design.DataSourcePanel', [_Widget, _ServiceMixin, _EventMapMixin, _Templated], {
        events: {
            'li:click': true
        },
        serviceMap: {
            'dataService': { type: 'sdata', name: 'metadata' }
        },
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div class="design-property-panel">',
            '<div class="design-property-panel-search">',
                '<div>',
                    '<input type="text" data-dojo-attach-point="queryNode" />',
                '</div>',
                '<input type="button" />',
            '</div>',
            '<div class="design-property-panel-tree" data-dojo-attach-point="treeNode">',
            '</div>',
            '</div>'
        ]),
        containerTemplate: new Simplate([
            '<ul></ul>'
        ]),
        propertyTemplate: new Simplate([
            '<li class="design-property" data-property="{%: $.propertyPath %}" data-property-category="{%: $.type %}" data-property-type="{%: $.data.dataTypeId %}" data-action="_toggle">',
            '<div class="design-property-expando"></div>',
            '<div class="design-property-icon"></div>',
            '<span>{%: $.displayName %}</span>',
            '</li>'
        ]),
        loadingTemplate: new Simplate([
            '<ul class="design-property-loading"><li>{%: $.loadingText %}</li></ul>'
        ]),

        _context: null,
        _designGroup: null,
        _designGroupTopics: null,
        designGroup: 'default',
        queryNode: null,
        treeNode: null,
        sortProperty: 'propertyName',

        loadingText: 'Loading...',

        _getDesignGroupAttr: function() {
            return this._designGroup;
        },
        _setDesignGroupAttr: function(value) {
            if (this._designGroupTopics)
            {
                array.forEach(this._designGroupTopics, function(topic) {
                    this.unsubscribe(topic);
                }, this);
            }

            this._designGroup = value;
            this._designGroupTopics = [
                this.subscribe(string.substitute('/quickforms/design/${0}/clear', [this._designGroup]), this._onFormCleared),
                this.subscribe(string.substitute('/quickforms/design/${0}/load', [this._designGroup]), this._onFormLoaded)
            ];
        },
        constructor: function() {
            this._context = {};
            this._sources = [];
        },
        uninitialize: function() {
            if (this._sources)
            {
                array.forEach(this._sources, function(source) {
                    source.destroy();
                });
            }

            this._sources = [];
        },
        clear: function() {
            domConstruct.empty(this.treeNode);
            this._context = {};
        },
        _onFormCleared: function() {
            this.clear();
        },
        _onFormLoaded: function(entry) {
            var entity = entry['entity']['EntityTypeName'].substr(1);
            this._load(entity, this.treeNode);
        },
        _toggle: function(evt, node) {
            var path = domAttr.get(node, 'data-property'),
                context = this._context[path];
            if (context && context.data['entityName'])
            {
                if (context['loaded'])
                {
                    domClass.toggle(node, 'design-property-expanded');
                }
                else
                {
                    domClass.add(node, 'design-property-expanded');

                    context['loaded'] = true;

                    this._load(context.data['entityName'], node);
                }
            }
        },
        _load: function(entity, node) {
            var loader = domConstruct.place(this.loadingTemplate.apply(this, this), node);

            var wait = [],
                deferred;

            deferred = new Deferred();
            new Sage.SData.Client.SDataSingleResourceRequest(this.dataService)
                .setResourceKind('entities')
                .setResourceSelector('"' + entity + '"')
                .setQueryArg('select', 'properties/*')
                .read({
                    success: lang.hitch(this, this._onPropertyRequestSuccess, deferred, entity),
                    failure: lang.hitch(this, this._onRequestFailure, deferred)
                });

            wait.push(deferred);

            deferred = new Deferred();
            new Sage.SData.Client.SDataResourceCollectionRequest(this.dataService)
                .setResourceKind('relationships')
                .setQueryArg('where',
                    string.substitute(
                        '(parentEntity.name eq "${0}" and cardinality eq "M:1") or (childEntity.name eq "${0}" and cardinality eq "1:M")', [entity]
                    ))
                .read({
                    success: lang.hitch(this, this._onRelationshipRequestSuccess, deferred, entity),
                    failure: lang.hitch(this, this._onRequestFailure, deferred)
                });

            wait.push(deferred);

            deferred = new Deferred();
            new Sage.SData.Client.SDataResourceCollectionRequest(this.dataService)
                .setResourceKind('entities')
                .setQueryArg('where',
                    string.substitute(
                        'extendedEntity.name eq "${0}"', [entity]
                    ))
                .setQueryArg('select', 'extendedEntityPropertyName')
                .read({
                    success: lang.hitch(this, this._onExtendedRequestSuccess, deferred, entity),
                    failure: lang.hitch(this, this._onRequestFailure, deferred)
                });

            wait.push(deferred);

            new DeferredList(wait, false, true, true)
                .then(
                    lang.hitch(this, this._process, node, loader),
                    lang.hitch(this, this._error, node, loader)
                );
        },
        _onPropertyRequestSuccess: function(deferred, entity, feed) {
            deferred.resolve(feed['properties']['$resources']);
        },
        _onExtendedRequestSuccess: function(deferred, entity, feed) {
            var properties = array.map(feed['$resources'], function(entry) {
                return {
                    displayName: entry['$descriptor'],
                    propertyName: entry['$key'],
                    entityName: entry['$key']
                };
            });

            deferred.resolve(properties);
        },
        _onRelationshipRequestSuccess: function(deferred, entity, feed) {
            var relationships = [],
                entries = feed['$resources'];

            array.forEach(entries, function(entry) {
                if (entity == entry['parentEntity']['$key'] && entry['parentProperty']['isIncluded'])
                {
                    relationships.push({
                        displayName: entry['parentProperty']['displayName'],
                        propertyName: entry['parentProperty']['propertyName'],
                        propertyId: entry['parentProperty']['id'],
                        entityName: entry['childEntity']['$key'],
                        includes: array.map(entry['columns']['$resources'], function(column) {
                            return column['parentPropertyId'];
                        })
                    });
                }
                else if (entity == entry['childEntity']['$key'] && entry['childProperty']['isIncluded'])
                {
                    relationships.push({
                        displayName: entry['childProperty']['displayName'],
                        propertyName: entry['childProperty']['propertyName'],
                        propertyId: entry['childProperty']['id'],
                        entityName: entry['parentEntity']['$key'],
                        includes: array.map(entry['columns']['$resources'], function(column) {
                            return column['childPropertyId'];
                        })
                    });
                }
            }, this);

            deferred.resolve(relationships);
        },
        _onRequestFailure: function(deferred, request) {
            deferred.reject(request);
        },
        _error: function(node, loader, error) {
            domConstruct.destroy(loader);
        },
        _process: function(node, loader, results) {
            var basePath = domAttr.get(node, 'data-property'),
                included = {},
                relationships = [],
                properties = [],
                extended;

            array.forEach(results[1][1], function(result) {
                array.forEach(result['includes'], function(id) { included[id] = true; });

                relationships.push({
                    propertyPath: basePath ? basePath + '.' + result['propertyName'] : result['propertyName'],
                    propertyName: result['propertyName'],
                    displayName: result['displayName'] || result['propertyName'],
                    type: 'relationship',
                    data: result
                });
            });

            array.forEach(results[0][1], function(result) {
                if (included[result['id']]) {
                    return;
                }

                if (result['isIncluded']) {
                    properties.push({
                        propertyPath: basePath ? basePath + '.' + result['propertyName'] : result['propertyName'],
                        propertyName: result['propertyName'],
                        displayName: result['displayName'] || result['propertyName'],
                        type: 'standard',
                        data: result,
                        dataTypeData: result['dataTypeData'] ? dojo.fromJson(result['dataTypeData']) : {}
                    });
                }
            });

            extended = array.map(results[2][1], function(result) {
                return {
                    propertyPath: basePath ? basePath + '.' + result['propertyName'] : result['propertyName'],
                    propertyName: result['propertyName'],
                    displayName: result['displayName'] || result['propertyName'],
                    type: 'extended',
                    data: result
                };
            });

            var all = properties.concat(relationships, extended),
                sortOn = this.sortProperty;

            all.sort(function(a, b) {
                var nameA = a[sortOn],
                    nameB = b[sortOn];

                return (nameA < nameB)
                    ? -1
                    : (nameA > nameB)
                        ? 1
                        : 0;
            });

            domConstruct.destroy(loader);

            this.render(node, all);
        },
        render: function(node, properties) {
            var containerNode = domConstruct.place(this.containerTemplate.apply(this, this), node);
            var self = this;
            array.forEach(properties, function(property) {
                this._context[property.propertyPath] = property;

                var propertyNode = domConstruct.place(this.propertyTemplate.apply(property, this), containerNode);
                if (propertyNode && property['type'] == 'standard')
                {
                    domAttr.set(propertyNode, 'dndType', 'property');
                    domAttr.set(propertyNode, 'dndData', property.propertyPath);

                    domClass.add(propertyNode, 'dojoDndItem');
                } else {
                    on(propertyNode, 'mousedown', function () {
                        if (self._sources && self._sources.length > 0) {
                            self._sources[0].selectNone();
                        }
                    });
                }
            }, this);

            // create DnD source
            var source = new DataSourcePanel.Source(containerNode, {
                owner: this,
                copyOnly: true,
                selfAccept: false
            });

            source.startup();

            this._sources.push(source);
        }
    });

    DataSourcePanel.Source = _Source;

    return DataSourcePanel;
});