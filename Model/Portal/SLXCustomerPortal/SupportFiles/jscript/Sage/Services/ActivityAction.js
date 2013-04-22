/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/i18n',
        'Sage/UI/Dialogs',
        'dijit/_Widget',
        'dojo/_base/declare'
],
function (
   i18n,
   Dialogs,
   _Widget,
   declare
) {

    var activityAction = declare('Sage.Services.ActivityAction', [_Widget], {
        _service: false,
        _contract: 'activities',
        _resourceKind: 'service',
        _operationName: false,
        _payLoad: false,
        _selectionContext: false,
        _publishMap: false,
        _publishMapWithId: false,
        _activityId: false,
        _configuration: false,
        _args: {},
        message: 'Are you sure you want to continue?',
        description: '',
        constructor: function () {
            // this._service =  Sage.Utility.getSDataService('activities');        
        },
        execute: function (options) {
            var map = this._publishMap;
            var mapWithId = this._publishMapWithId;
            var activityId = this._activityId;

            var postUrl = String.format("slxdata.ashx/slx/crm/-/{0}/{1}/{2}", this._contract, this._resourceKind, this._operationName);
            $.ajax({
                type: "POST",
                url: postUrl,
                contentType: "application/json",
                data: dojo.toJson(this._args),
                processData: false,
                success: function (result) {
                    if (map) {
                        dojo.publish(map, [result, this]);
                    }
                    if (mapWithId) {
                        if (activityId) {
                            dojo.publish(mapWithId, [activityId, this]);
                        }
                    }
                    if (options) {
                        options.success(result, options.scope);
                    }
                },
                failure: function (request) {
                    if (options) {
                        options.failure(result, options.scope);
                    }
                }
            });
        },

        _setConfigurationAttr: function (config) {
            this._configuration = config;
        },
        _getConfigurationAttr: function () {
            return this._configuration;
        },

        _setServiceAttr: function (service) {
            this._service = service;
        },
        _getServiceAttr: function () {
            return this._service;
        },
        _setSelectionInfoAttr: function (selectionInfo) {
            this._selectionInfo = selectionInfo;
        },
        _getSelectionInfoAttr: function () {
            return this._selectionInfo;
        },
        _setOperationNameAttr: function (operationName) {
            this._operationName = operationName;
        },
        _getOperationNameAttr: function () {
            return this._operationName;
        },
        _setResourceKindAttr: function (resourceKind) {
            this._resourceKind = resourceKind;
        },
        _getResourceKindAttr: function () {
            return this._resourceKind;
        },
        _setArgsAttr: function (args) {
            this._args = args;
        },
        _getArgsAttr: function () {
            return this._args;
        },
        _setActionDescriptionAttr: function (description) {
            this.description = description;
        },
        _getActionDescriptionAttr: function () {
            return this.description;
        },

        _setActionMessageAttr: function (message) {
            this.message = message;
        },
        _getActionMessageAttr: function () {
            return this.message;
        },
        _setPublishMapAttr: function (publishMap) {
            this._publishMap = publishMap;
        },
        _setPublishMapWithIdAttr: function (publishMapWithId) {
            this._publishMapWithId = publishMapWithId;
        },
        _setActivityIdAttr: function (activityId) {
            this._activityId = activityId;
        }

    });

    return activityAction;
});
