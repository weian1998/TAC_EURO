define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'Sage/_Templated',
    'dijit/_Widget',
    'dijit/_Contained',
    './ControlDesigner',
    './Editors/LayoutPropertyEditor',
    './Editors/TextBoxBasicPropertyEditor',
    './Editors/TextBoxAdvancedPropertyEditor',
    'dojo/i18n!./nls/TextBoxControlDesigner'
], function(
    declare,
    array,
    lang,
    _Templated,
    _Widget,
    _Contained,
    ControlDesigner,
    LayoutPropertyEditor,
    TextBoxBasicPropertyEditor,
    TextBoxAdvancedPropertyEditor,
    localization
) {
    return declare('Sage.QuickForms.Design.TextBoxControlDesigner', [_Widget, _Contained, _Templated, ControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            TextBoxBasicPropertyEditor,
            TextBoxAdvancedPropertyEditor,
            LayoutPropertyEditor
        ],
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div class="{%= $.fieldClass %}" data-dojo-attach-point="containerNode">',
            '<div class="{%= $.fieldClass %}-caption" data-dojo-attach-point="designCaptionNode"></div>',
            '<div class="{%= $.fieldClass %}-field">',
                '<span data-dojo-attach-point="designBindingNode"></span>',
            '</div>',
            '</div>'
        ]),
        _setDesignCaptionAttr: {
            node: 'designCaptionNode', type: 'innerText'
        },
        _setDesignBindingAttr: {
            node: 'designBindingNode', type: 'innerText'
        },

        fieldClass: 'design-textbox',
        helpTopicName: 'Textbox_control',
        quickFormControlType: 'Sage.Platform.QuickForms.Controls.QFTextBox, Sage.Platform.QuickForms',

        //Localization
        displayNameText: 'TextBox',

        constructor: function() {
            lang.mixin(this, localization);
        },

        _setCaptionAttr: function(value) {
            this.inherited(arguments);

            this.set('designCaption', value);
        },
        _getDefaultDataBindingAttr: function() {
            return this.findDataBinding(function(binding) {
                return (binding['ControlItemName'] == 'Text');
            });
        },

        _getLinesAttr: function() {
            return lang.getObject('Lines', false, this.entry);
        },
        _setLinesAttr: function(value) {
            lang.setObject('Lines', value, this.entry);
        },
        _getControlLabelPlacementAttr: function() {
            return lang.getObject('ControlLabelPlacement', false, this.entry);
        },
        _setControlLabelPlacementAttr: function(value) {
            lang.setObject('ControlLabelPlacement', value, this.entry);
        },
        _getMaxLengthAttr: function() {
            return lang.getObject('MaxLength', false, this.entry);
        },
        _setMaxLengthAttr: function(value) {
            lang.setObject('MaxLength', value, this.entry);
        },
        _getRequiredAttr: function() {
            return lang.getObject('Required', false, this.entry);
        },
        _setRequiredAttr: function(value) {
            lang.setObject('Required', value, this.entry);
        },

        setupFor: function(propertyContext){
            this.inherited(arguments);

            this.set('lines', 1);
            this.set('maxLength', parseInt(propertyContext['data'].length, 10) || -1);
            this.set('required', false);

            this.set('dataBindings', [{
                $type: 'Sage.Platform.QuickForms.Controls.QuickFormPropertyDataBindingDefinition, Sage.Platform.QuickForms',
                BindingType: 'Property',
                ControlItemName: 'Text',
                DataItemName: propertyContext.propertyPath,
                DataSourceID: 'MainEntity',
                FormatString: '',
                NullValueString: ''
            }]);
            this.set('designBinding', propertyContext.propertyPath || '');
        },
        startup: function() {
            this.inherited(arguments);

            var binding = this.get('defaultDataBinding');

            this.set('designCaption', this.get('caption'));
            this.set('designBinding', (binding && binding['DataItemName']) || '');
            this.applyCaptionAlignment();
            this.applyVisibility();
        }
    });
});