/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/form/SimpleTextarea',
       'dojo/_base/declare'
],
function (simpleTextarea, declare) {
    var widget = declare("Sage.UI.Controls.SimpleTextarea", [simpleTextarea], {
        baseClass: "dijitTextBox dijitTextArea sageTextArea",
        templateString: "<div><textarea ${!nameAttrSetting} dojoAttachPoint='focusNode,containerNode,textbox' autocomplete='off'></textarea></div>",
        hotKey: '',
        multiLineMaxLength: '',
        shouldPublishMarkDirty: true,
        _setHotKeyAttr: { node: 'textbox', type: 'attribute', attribute: 'accessKey' },
        constructor: function (args) {
            this.maxLength = args.multiLineMaxLength;
        },
        onChange: function (e) {
            if (this.shouldPublishMarkDirty) {
                dojo.publish("Sage/events/markDirty");
            }
            this.inherited(arguments);
        }
    });
    return widget;
});