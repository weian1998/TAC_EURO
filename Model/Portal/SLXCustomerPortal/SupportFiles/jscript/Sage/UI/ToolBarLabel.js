/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dojo/_base/declare'
],
function (_Widget, _TemplatedMixin, declare) {
    var toolBarLabel = declare('Sage.UI.ToolBarLabel', [_Widget, _TemplatedMixin], {
        label: 'label',
        //Default region
        region: 'leading',
        templateString: '<span class="dijitToolbarLabel"><span class="dijitReset dijitInline " dojoAttachPoint="containerNode"></span></span>',

        attributeMap: {
            label: { node: "containerNode", type: "innerHTML" }
        },
        _append: function (val) {
            this.containerNode.innerHTML += val;
        },
        _setLabelAttr: function (label) {
            this.containerNode.innerHTML = this.label = label;
        }
    });
    return toolBarLabel;
});