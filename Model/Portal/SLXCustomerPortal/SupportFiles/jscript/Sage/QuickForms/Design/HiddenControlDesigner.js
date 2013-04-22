define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'Sage/_Templated',
    'dijit/_Widget',
    'dijit/_Contained',
    './ControlDesigner',
    './Editors/NonVisibleAdvancedPropertyEditor',
    'dojo/i18n!./nls/HiddenControlDesigner'
], function(declare, array, lang, _Templated, _Widget, _Contained, ControlDesigner, NonVisibleAdvancedPropertyEditor, localization) {
    return declare('Sage.QuickForms.Design.HiddenControlDesigner', [_Widget, _Contained, _Templated, ControlDesigner], {
        designSupport: {
            visible: false
        },
        editors: [
            NonVisibleAdvancedPropertyEditor
        ],
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div data-dojo-attach-point="containerNode">',
            '<span data-dojo-attach-point="designCaptionNode"></span>',
            '</div>'
        ]),
        _setDesignCaptionAttr: {
            node: 'designCaptionNode', type: 'innerText'
        },

        helpTopicName: 'Hidden_Text_control',
        quickFormControlType: 'Sage.Platform.QuickForms.QFControls.QFHidden, Sage.Platform.QuickForms.QFControls',

        displayNameText: 'Hidden Text',

        constructor: function() {
            lang.mixin(this, localization);
        },
        _setControlIdAttr: function(value) {
            this.inherited(arguments);

            this.set('designCaption', value);
        },
        startup: function() {
            this.inherited(arguments);

            this.set('designCaption', this.get('controlId'));
        }
    });
});