/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/UI/_DetailPane',
        'Sage/_Templated',
        'dojo/_base/declare'
],
function (_DetailPane, _Templated, declare) {
    return declare('Sage.UI.JsonPrintDetailPane', [_DetailPane, _Templated], {
        widgetsInTemplate: true,
        contentNode: null,
        attributeMap: {
            'content': { node: 'contentNode', type: 'innerHTML' }
        },
        widgetTemplate: new Simplate([
            '<div class="json-print-detail-pane">',
            '<pre dojoAttachPoint="contentNode"></pre>',
            '</div>'
        ]),
        _onSelected: function (index, row, grid) {
            this.set('content', dojo.toJson(row, true));
        }
    });
});
