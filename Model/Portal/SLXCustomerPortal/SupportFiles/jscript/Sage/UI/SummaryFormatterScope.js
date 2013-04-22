/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/UI/SummaryContainer',
        'Sage/Data/SummaryViewDataManager',
        'Sage/UI/Controls/SummaryAggregate',
        'dojo/_base/lang',
        'dojo/_base/declare'
],
function (summaryContainer, SummaryViewDataManager, SummaryAggregate, lang, declare) {
    var summaryFormatterScope = declare('Sage.UI.SummaryFormatterScope', null, {
        templateLocation: false,
        queryName: '',
        idField: '',
        dataManager: null,
        requestConfiguration: false,
        widgets: [],
        constructor: function (args) {
            dojo.mixin(this, args);
            this.widgets = [];
            this.preFetchResources();
            this._setupDataManager();
        },
        _setupDataManager: function () {
            this.dataManager = new SummaryViewDataManager();
            if (Sage.Services.hasService('SummaryViewDataManager')) {
                Sage.Services.removeService('SummaryViewDataManager');
            }
            Sage.Services.addService('SummaryViewDataManager', this.dataManager);
        },
        formatSummary: function (value, idx) {

            var widget,
                id = idx + '_sum_' + value;

            if (value === null) {
                return '';
            }

            if (this.dataManager == null) {
                this.dataManager = Sage.Services.getService('SummaryViewDataManager');
            }

            if (this.dataManager == null) {
                this._setupDataManager();
            }

            //widget = dijit.byId(id);
            //if (!widget) {
            //     widget = new summaryContainer({
            //         id: id,
            //         templateLocation: this.templateLocation
            //     });
            // }

            widget = dijit.byId(id);
            if (widget) {
                widget.destroy();
            }
            widget = new summaryContainer({
                id: id,
                templateLocation: this.templateLocation
            });

            this.dataManager.requestData(value, widget, this.requestConfiguration);
            this.widgets[idx] = widget;
            return this.widgets[idx];

        },
        preFetchResources: function () {
            var moduleNameParts = ['Sage'];
            var templateParts = this.templateLocation.split('/');
            for (var i = 0; i < templateParts.length - 1; i++) {
                moduleNameParts.push(templateParts[i]);
            }
            var path = 'dojo/i18n!' + moduleNameParts.join('/') + '/nls/' + templateParts[templateParts.length - 1].replace('.html', '');
            require([path],
                lang.hitch(this, function (nls) {
                    lang.mixin(this, nls);
                }));

            //Dynamic caching need to be obscured from the builder by using the dojo['cache'] calling method
            dojo['cache']('Sage', this.templateLocation);
        }
    });

    return summaryFormatterScope;
});
