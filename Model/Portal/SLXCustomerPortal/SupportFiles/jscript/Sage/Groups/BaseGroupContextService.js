/*globals Sage, dojo, window, define */
define([
        'Sage/Utility',
        'dojo/string',
        'Sage/Data/SDataServiceRegistry',
        'dojo/ready',
        'dojo/_base/lang',
        'dojo/_base/declare',
        'dojo/_base/array'
    ],
function (
        utility,
        dString,
        sDataServiceRegistry,
        ready,
        lang,
        declare,
        array
    ) {
    var baseGroupContextService = declare('Sage.Groups.BaseGroupContextService', null, {
        _adHocGroupList: null,
        _connects: null,
        _subscribes: null,
        _emptyContext: null,
        _currentRequestHandle: null,
        _isAdHocGroupListRetrieved: false,
        constructor: function () {
            this._connects = [];
            this._subscribes = [];
            this._adHocGroupList = [];
            this._emptyContext = {
                DefaultGroupID: null,
                CurrentGroupID: null,
                CurrentTable: null,
                CurrentName: null,
                CurrentEntity: null,
                CurrentFamily: null
            };

            ready(lang.hitch(this, function () {
                if (!this.isContextRequired()) {
                    var context = utility.getValue(window, 'Sage.Groups._groupContext'),
                        container = utility.getValue(window, 'Sage.UI.DataStore.Filters');
                    if (container) {
                        if (context['AppliedFilterInfo']) {
                            container['default'] = this.createFilterExtendedSet(context['AppliedFilterInfo']);
                        }
                    }
                }

                if (this.isContextRequired()) {
                    this.requestContext();
                }
            }));
        },
        createFilterExtendedSet: function (appliedFilterInfo) {
            var sourceDefinitionSet = appliedFilterInfo['definitionSet'] || [],
                sourceApplied = appliedFilterInfo['applied'] || [],
                resultDefinitionSet = {},
                resultApplied = {},
                sourceItem,
                resultItem,
                i,
                j,
                value;

            for (i = 0; i < sourceDefinitionSet.length; i++) {
                sourceItem = sourceDefinitionSet[i];
                resultItem = {
                    '$key': sourceItem['id'],
                    '$partial': true,
                    'filterName': sourceItem['filterName'],
                    'displayName': sourceItem['displayName'],
                    'propertyName': sourceItem['propertyName'],
                    'propertyDataTypeId': sourceItem['propertyDataTypeId'],
                    'details': {}
                };

                if (sourceItem['filterType'] == 'rangeFilter') {
                    resultItem['details']['rangeFilter'] = {
                        'characters': sourceItem['characters']
                    };
                } else {
                    resultItem['details']['distinctFilter'] = {};
                }

                resultDefinitionSet[sourceItem['id']] = resultItem;
            }

            for (i = 0; i < sourceApplied.length; i++) {
                sourceItem = sourceApplied[i];
                resultItem = {};

                for (j = 0; j < sourceItem['rangeValues'].length; j++) {
                    value = sourceItem['rangeValues'][j];
                    resultItem[value['rangeName']] = lang.mixin({}, value);
                }

                for (j = 0; j < sourceItem['distinctValues'].length; j++) {
                    value = sourceItem['distinctValues'][j];
                    if (typeof value === 'string') {
                        resultItem[value] = value;
                    }
                }

                resultApplied[sourceItem['id']] = resultItem;
            }

            return {
                'definitionSet': resultDefinitionSet,
                'applied': resultApplied
            };
        },
        destroy: function () {
            array.forEach(this._connects, function (handle) {
                dojo.disconnect(handle);
            });

            this.unsubscribeConnects();

            this.uninitialize();
        },
        unsubscribeConnects: function () {
            array.forEach(this._subscribes, function (handle) {
                dojo.unsubscribe(handle);
            });
        },
        uninitialize: function () {
        },
        isContextRequired: function () {
            var results = !(Sage && Sage.Groups && Sage.Groups._groupContext);
            return results;
        },
        createCompatibleContext: function (context) {
            if (context['currentGroupId'] == 'LOOKUPRESULTS') {
                context['currentName'] = 'Lookup Results';
            }
            var compatibleContext = {
                'AppliedFilterInfo': context['appliedFilterInfo'],
                'ContainsPositionState': context['containsPositionState'],
                'CurrentDisplayName': context['currentDisplayName'],
                'CurrentEntity': context['currentEntity'],
                'CurrentEntityID': context['currentEntityId'],
                'CurrentEntityPosition': context['currentEntityPosition'],
                'CurrentFamily': context['currentFamily'],
                'CurrentGroupCount': context['currentGroupCount'],
                'CurrentGroupID': context['currentGroupId'],
                'CurrentName': context['currentName'],
                'CurrentTable': context['currentTable'],
                'CurrentTableKeyField': context['currentTableKeyField'],
                'DefaultGroupID': context['defaultGroupId'],
                'FirstEntityID': context['firstEntityId'],
                'LastEntityID': context['lastEntityId'],
                'LookupLayoutGroupName': context['lookupLayoutGroupName'],
                'NextEntityID': context['nextEntityId'],
                'PreviousEntityID': context['previousEntityId'],
                'RetrievedOn': context['retrievedOn'],
                'isAdhoc': context['isAdHoc']
            };

            if (!context['appliedFilterInfo']) {
                delete compatibleContext.AppliedFilterInfo;
            }

            return compatibleContext;
        },
        _onDefaultFilterRefresh: function (applied, definitionSet, filterManager) {

        },
        getContext: function () {

        },
        setContext: function (context) {
            var container = Sage && Sage.Groups;
            if (container && context) {
                lang.mixin(container._groupContext, context);
                this.onContextSet(container._groupContext);
            }
        },
        setCurrentGroup: function (groupId, groupName) {

        },
        _onSetContextRequestSuccess: function (entry) {
            var context = entry && entry['response'],
                compatibleContext = context && this.createCompatibleContext(context);
            if (compatibleContext) this.setContext(compatibleContext);

            this.onCurrentGroupChanged({ current: compatibleContext });
        },
        _onSetContextRequestFailure: function (response, o) {
        },
        onSuccessfulGroupChanged: function (data) {
            var previousContext = this.getContext();
            this.setContext(data);
            this.onCurrentGroupChanged({ current: data, previous: previousContext });
        },
        onCurrentGroupChanged: function (options) {

        },
        publishFiltersApplied: function () {
            // When the dom is ready publish that we have applied filters.
            var context = this.getContext();
            if (context.AppliedFilterInfo) {
                ready(lang.hitch(this, function () {
                    var extendedSet = this.createFilterExtendedSet(context.AppliedFilterInfo),
                        container = utility.getValue(window, 'Sage.UI.DataStore.Filters');
                    container['default'] = extendedSet;
                    dojo.publish('/ui/filters/default/apply', [extendedSet['applied'], extendedSet['definitionSet'], this]);
                }));
            }
        },
        applyFilters: function (filterManager) {
            var context = this.getContext();
            if (context.AppliedFilterInfo) {
                var extendedSet = this.createFilterExtendedSet(context.AppliedFilterInfo),
                        container = utility.getValue(window, 'Sage.UI.DataStore.Filters');
                container['default'] = extendedSet;
                if (filterManager) {
                    filterManager._onApply(extendedSet['applied'], extendedSet['definitionSet'], this);
                }

            }
        },
        onContextSet: function (context) {

        }
    });

    return baseGroupContextService;
});
