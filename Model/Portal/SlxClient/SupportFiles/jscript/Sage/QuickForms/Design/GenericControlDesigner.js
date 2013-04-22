define([
    'dojo/string',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'Sage/_Templated',
    'dijit/_Widget',
    'dijit/_Contained',
    './ControlDesigner',
    './Editors/LayoutPropertyEditor',
    './Editors/GenericBasicPropertyEditor',
    './Editors/GenericAdvancedPropertyEditor',
    'dojo/i18n!./nls/GenericControlDesigner'
], function(
    string,
    declare,
    lang,
    _Templated,
    _Widget,
    _Contained,
    ControlDesigner,
    LayoutPropertyEditor,
    GenericBasicPropertyEditor,
    GenericAdvancedPropertyEditor,
    localization)
{
    return declare('Sage.QuickForms.Design.GenericControlDesigner', [_Widget, _Contained, _Templated, ControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            GenericBasicPropertyEditor,
            GenericAdvancedPropertyEditor,
            LayoutPropertyEditor
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

        helpTopicName: 'visual_control',
        displayNameText: 'Unknown',

        constructor: function() {
            lang.mixin(this, localization);
        },

        _setControlIdAttr: function(value) {
            this.inherited(arguments);

            this.set('designCaption', value);
        },

        getFormattedType: function(){
            var type = lang.getObject('$type', false, this.entry) || this.displayNameText,
                name = (type.indexOf(', ') !== -1) ? type.split(', ')[0] : type,
                parts = (type.indexOf('.') !== -1) ? name.split('.') : [name];
            return parts[parts.length-1];
        },

        startup: function() {
            this.inherited(arguments);

            this.displayNameText = this.getFormattedType();
            this.set('designCaption', this.get('controlId'));
            this.applyVisibility();
        }
    });
});