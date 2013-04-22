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
    var groupContextService = declare('Sage.Groups.GroupContextService', null, {
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

            this._isAdHocGroupListRetrieved = false;
            this._subscribes.push(
                dojo.subscribe(dString.substitute("/ui/filters/default/refresh"), this, this._onDefaultFilterRefresh)
            );

            ready(lang.hitch(this, function(){
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
                }
                if (sourceItem['filterType'] == 'lookupFilter') {
                    resultItem['details']['lookupFilter'] = {};                    
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
                for (j = 0; j < sourceItem['lookupValues'].length; j++) {
                    lookuValue = sourceItem['lookupValues'][j];
                    resultItem['value'] = lookuValue;               
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
            if(context['currentGroupId'] == 'LOOKUPRESULTS') {
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
            var groupContext = this.getContext(),
                service = sDataServiceRegistry.getSDataService('system'),
                entry = {
                    '$name': 'applyFilterToGroup',
                    'request': {
                        'groupId': groupContext['CurrentGroupID'],
                        'filter': dojo.toJson(filterManager.createValueSet())
                    }
                };
                if((groupContext['CurrentGroupID'] === null)|| (groupContext['CurrentGroupID'] === ''))
                {
                   return;
                }
                
            var request = new Sage.SData.Client.SDataServiceOperationRequest(service)
                .setOperationName('applyFilterToGroup');

            request.execute(entry, {});
        },
        getContext: function () {
            var context = Sage && Sage.Groups && Sage.Groups._groupContext;
            if (context) {
                return context;
            }

            if (this.isContextRequired()) {
                this.requestContext();
            }

            return this._emptyContext;
        },
        requestContext: function (onComplete) {
            if (this._currentRequestHandle) {
                return;
            }

            var service = sDataServiceRegistry.getSDataService('system'),
                request = new Sage.SData.Client.SDataServiceOperationRequest(service)
                    .setOperationName('getGroupContext');

            this._currentRequestHandle = request.execute({}, {
                success: this._onRequestContextSuccess,
                failure: this._onRequestContextFailure,
                scope: this
            });
        },
        _onRequestContextSuccess: function (entry) {
            var context = entry && entry['response'];
            if (context) this.setContext(this.createCompatibleContext(context));

            this._currentRequestHandle = null;
        },
        _onRequestContextFailure: function (response, o) {
            this._currentRequestHandle = null;
        },
        setContext: function (context) {
            var container = Sage && Sage.Groups;
            if (container && context) {
                lang.mixin(container._groupContext, context);
                this.onContextSet(container._groupContext);
            }
        },
        setCurrentGroup: function (groupId, groupName) {
            var context = this.getContext();
            if (context && (context['CurrentGroupID'] === groupId)) {
                if (groupId === 'LOOKUPRESULTS') {
                    context['currentName'] = 'Lookup Results';
                    //the conditions probably changed, so just fire onCurrentGroupChanged...
                    this.onCurrentGroupChanged({ current: context });
                }
                return;
            }

            //assume a groupID is coming in - and that it is an ID (not the name)...
            if (groupId.length === 12 || groupId === 'LOOKUPRESULTS') {
                // todo: handle if a group name and family is passed...
                var service = sDataServiceRegistry.getSDataService('system'),
                    request = new Sage.SData.Client.SDataServiceOperationRequest(service)
                        .setOperationName('setGroupContext'),
                    entry = {
                        request: {
                            'currentGroupId': groupId,
                            'currentName': '',
                            'currentFamily': ''
                        }
                    };

                request.execute(entry, {
                    success: this._onSetContextRequestSuccess,
                    failure: this._onSetContextRequestFailure,
                    scope: this
                });
            }
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
            // We need to apply the the change before publishing the applied filters Info
            //The filter panel will check and see if the group is the same before appling the filter info.
            dojo.publish('/group/context/changed', [options, this]);
            if (options['current']['AppliedFilterInfo']) {
                // We need to apply the the change before publishing the applied filters Info
                //The filter panel will check and see if the group is the same before appling the filter info.
                this.publishFiltersApplied(options['current']['AppliedFilterInfo']);
            }          
        },
        publishFiltersApplied: function (appliedFilterInfo) {
            // When the dom is ready publish that we have applied filters.
            if (appliedFilterInfo) {
                ready(lang.hitch(this, function () {
                    var extendedSet = this.createFilterExtendedSet(appliedFilterInfo),
                        container = utility.getValue(window, 'Sage.UI.DataStore.Filters');
                    container['default'] = extendedSet;
                    dojo.publish('/ui/filters/default/apply', [extendedSet['applied'], extendedSet['definitionSet'], this]);
                }));
            }
        },
        onContextSet: function (context) {
            if (context && context['AppliedFilterInfo']) {
                this.publishFiltersApplied(context['AppliedFilterInfo']);
            }
        },

        //adhoc group list...
        getAdHocGroupList: function (callback, callbackScope) {
            if (this._isAdHocGroupListRetrieved) {
                callback.call(callbackScope || this, this._adHocGroupList);
                return;
            }
            var store = new Sage.Data.BaseSDataStore({
                service: sDataServiceRegistry.getSDataService('system'),
                resourceKind: 'groups',
                include: [],
                select: ['name', 'family', 'isHidden', 'isAdHoc', 'mainTable', 'keyField', 'entityName']
            });

            Sage.Groups._groupContext.CurrentFamily = Sage.Groups._groupContext.CurrentFamily.toUpperCase();
            
            store.fetch({
                query: dojo.string.substitute("upper(family) eq '${CurrentFamily}' and isAdHoc", Sage.Groups._groupContext),
                count: 1000,
                sort: [{ attribute: 'name'}],
                start: 0,
                onComplete: function (data) {
                    this._adHocGroupList = data;
                    callback.call(callbackScope || this, this._adHocGroupList);
                    this._isAdHocGroupListRetrieved = true;
                },
                scope: this
            });
        }
    });

    Sage.Services.addService("ClientGroupContext", new groupContextService());
    return groupContextService;
});
