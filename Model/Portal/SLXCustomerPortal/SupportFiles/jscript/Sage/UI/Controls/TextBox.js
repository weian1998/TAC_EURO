/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/form/ValidationTextBox',
       'dojo/dom-class',
       'dojo/query',
       'dojo/_base/declare'
],
function (validationTextBox, domClass, dojoQuery, declare) {
    var widget = declare("Sage.UI.Controls.TextBox", [validationTextBox], {
        maxLength: '',
        // textWithIcons allows for styling to be applied to a textbox where an icon accompanies the text inside the box.
        textWithIcons: false,
        shouldPublishMarkDirty: true,
        //.Net control behavior
        autoPostBack: false,
        
        // Attribute maps
        hotKey: '',
        _setHotKeyAttr: { node: 'textbox', type: 'attribute', attribute: 'accessKey' },
        
        slxchangehook: 'true',
        _setslxchangehookAttr: { node: 'focusNode', type: 'attribute', attribute: 'slxchangehook' },

        postCreate: function () {
            this.connect(this, 'onChange', this.onChanged);
            this.inherited(arguments);
        },
        startup: function (parameters) {
            if (this.textWithIcons) {
                var self = this;
                dojo.ready(function () {
                    if (dojoQuery('#' + self.id)[0]) {
                        var element = dojoQuery('#' + self.id)[0];
                        domClass.add(element.parentNode, 'textcontainer-with-icons');
                    }
                });
            }
            this.inherited(arguments);
        },
        onChanged: function (e) {
            if (this.shouldPublishMarkDirty) {
                dojo.publish("Sage/events/markDirty");
            }
            if (this.autoPostBack) {
                __doPostBack(this.id, '');
            }
        },
        setAttribute: function (attr, val) {
            /* Hide deprecated warnings, due to the parser and _WidgetBase assuming focusNode is a dom node and not a widget */
            this.set(attr, val);
        }
    });

    return widget;
});
