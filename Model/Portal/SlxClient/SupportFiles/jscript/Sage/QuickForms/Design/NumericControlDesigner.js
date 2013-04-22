define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'Sage/_Templated',
    'dijit/_Widget',
    'dijit/_Contained',
    './ControlDesigner',
    './Editors/LayoutPropertyEditor',
    './Editors/NumericBasicPropertyEditor',
    './Editors/NumericAdvancedPropertyEditor',
    'dojo/i18n!./nls/NumericControlDesigner'
], function(
    declare,
    array,
    lang,
    _Templated,
    _Widget,
    _Contained,
    ControlDesigner,
    LayoutPropertyEditor,
    NumericBasicPropertyEditor,
    NumericAdvancedPropertyEditor,
    localization
) {
    return declare('Sage.QuickForms.Design.NumericControlDesigner', [_Widget, _Contained, _Templated, ControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            NumericBasicPropertyEditor,
            NumericAdvancedPropertyEditor,
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

        fieldClass: 'design-numeric',
        helpTopicName: 'Numeric_control',
        quickFormControlType: 'Sage.SalesLogix.QuickForms.QFControls.QFSLXNumeric, Sage.SalesLogix.QuickForms.QFControls',

        //Localization
        displayNameText: 'Numeric',

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

        _getControlLabelPlacementAttr: function() {
            return lang.getObject('ControlLabelPlacement', false, this.entry);
        },
        _setControlLabelPlacementAttr: function(value) {
            lang.setObject('ControlLabelPlacement', value, this.entry);
        },
        _getDecimalDigitsAttr: function() {
            return lang.getObject('DecimalDigits.DecimalDigits', false, this.entry);
        },
        _setDecimalDigitsAttr: function(value) {
            lang.setObject('DecimalDigits.DecimalDigits', value, this.entry);
        },
        _getFormatTypeAttr: function() {
            return lang.getObject('FormatType', false, this.entry);
        },
        _setFormatTypeAttr: function(value) {
            lang.setObject('FormatType', value, this.entry);
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
        _getStrictAttr: function() {
            return lang.getObject('DecimalDigits.Strict', false, this.entry);
        },
        _setStrictAttr: function(value) {
            lang.setObject('DecimalDigits.Strict', value, this.entry);
        },

        setupFor: function(propertyContext){
            this.inherited(arguments);

            this.set('decimalDigits', -1);

            this.set('formatType', 'Number');
            this.set('maxLength', propertyContext['data'].length || -1);
            this.set('strict', false);
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
            this.set('designBinding', (binding && binding['DataItemName']) || this.get('text') || '');
            this.applyCaptionAlignment();
            this.applyVisibility();
        }
    });
});