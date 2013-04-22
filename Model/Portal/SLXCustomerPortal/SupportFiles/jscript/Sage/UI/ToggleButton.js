/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/form/Button',
       'dijit/_Widget',
       'dojo/text',
       'dojo/text!../templates/ToggleButton.html',
       'dojo/_base/declare'
],
function (button, _Widget, text, template, declare) {
    var widget = declare('Sage.UI.ToggleButton', button, {
        templateString: template,

        __setValueAttr: { node: 'valueNode', type: 'attribute', attribute: 'value' },
        getValue: function () {
            return this.get('label');
        },
        setValue: function (val) {
            this.set('label', val);
        },
        _onButtonClick: function (e) {
        }
    });

    return widget;
});
