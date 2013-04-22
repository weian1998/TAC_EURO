/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/UI/_DetailPane',
        'Sage/_Templated',
        'Sage/UI/SummaryContainer',
        'dojo/_base/declare'
],
function (_DetailPane, _Templated, summaryContainer, declare) {
    var summaryDetailPane = declare('Sage.UI.SummaryDetailPane', [_DetailPane, _Templated], {
        widgetsInTemplate: false,
        contentNode: null,
        paneContents: null,
        attributeMap: {
            'content': { node: 'contentNode', type: 'innerHTML' }
        },
        widgetTemplate: new Simplate([
            '<div class="EntityCard">',
                '<div dojoAttachPoint="contentNode"></div>',
            '</div>'
        ]),
        clear: function () {
            if (this.paneContents) {
                this.paneContents.destroyRecursive();
            }
        },
        _onSelected: function (index, row, grid) {
            if (!this._configuration) {
                return;
            }
            if (this.paneContents) {
                this.paneContents.destroyRecursive();
            }
            var groupContextSvc = Sage.Services.getService('ClientGroupContext');
            var context = groupContextSvc.getContext();
            var keyFieldName = context.CurrentTableKeyField;

            if (keyFieldName && this._configuration.requestConfiguration) {
                if (this._configuration.keyField) {
                    keyFieldName = this._configuration.keyField;
                }
                var keyValue = this._getKeyValue(row, keyFieldName);
                var dataManager = Sage.Services.getService('SummaryViewDataManager');
                var pane = new summaryContainer({
                    id: 'det_' + keyValue,
                    templateLocation: this._configuration.templateLocation
                });
                pane.postProcessCallBack = this._configuration.postProcessCallBack;
                dojo.place(pane.domNode, this.contentNode, 'only');
                this.paneContents = pane;
                dataManager.requestDataNoWait(keyValue, pane, this._configuration.requestConfiguration);
            } else {
                this.set('content', 'Please check the configuration for this panel.');
            }
        },
        _getKeyValue: function (data, keyFieldName) {
            var parts = keyFieldName.split('.');
            if (parts.length < 2) {
                return data[keyFieldName];
            } else {
                return this._getKeyValue(data[parts[0]], parts[1]);  //lets do just do one level        
            }
        }
    });

    return summaryDetailPane;
});
