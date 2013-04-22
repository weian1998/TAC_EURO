define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'Sage/_Templated',
    'dijit/_Widget',
    'dijit/_Contained',
    './ControlDesigner',
    './Editors/LayoutPropertyEditor',
    './Editors/CurrencyBasicPropertyEditor',
    './Editors/CurrencyAdvancedPropertyEditor',
    'dojo/i18n!./nls/CurrencyControlDesigner'
], function(
    declare,
    array,
    lang,
    _Templated,
    _Widget,
    _Contained,
    ControlDesigner,
    LayoutPropertyEditor,
    CurrencyBasicPropertyEditor,
    CurrencyAdvancedPropertyEditor,
    localization
) {
    return declare('Sage.QuickForms.Design.CurrencyControlDesigner', [_Widget, _Contained, _Templated, ControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            CurrencyBasicPropertyEditor,
            CurrencyAdvancedPropertyEditor,
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

        fieldClass: 'design-currency',
        helpTopicName: 'Currency_control',
        quickFormControlType: 'Sage.SalesLogix.QuickForms.QFControls.QFSLXCurrency, Sage.SalesLogix.QuickForms.QFControls',

        //Localization
        displayNameText: 'Currency',

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
            return lang.getObject('DecimalDigits', false, this.entry);
        },
        _setDecimalDigitsAttr: function(value) {
            lang.setObject('DecimalDigits', value, this.entry);
        },
        _getDisplayCurrencyCodeAttr: function() {
            return lang.getObject('DisplayCurrencyCode', false, this.entry);
        },
        _setDisplayCurrencyCodeAttr: function(value) {
            lang.setObject('DisplayCurrencyCode', value, this.entry);
        },
        _getDisplayModeAttr: function() {
            return lang.getObject('DisplayMode', false, this.entry);
        },
        _setDisplayModeAttr: function(value) {
            lang.setObject('DisplayMode', value, this.entry);
        },
        _getExchangeRateTypeAttr: function() {
            return lang.getObject('ExchangeRateType', false, this.entry);
        },
        _setExchangeRateTypeAttr: function(value) {
            lang.setObject('ExchangeRateType', value, this.entry);
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

            this.set('decimalDigits', -1);

            this.set('currentCode', null);
            this.set('displayCurrencyCode', true);
            this.set('displayMode', 'AsControl');
            this.set('exchangeRateType', 'BaseRate');
            this.set('maxLength', propertyContext['data'].length || '');
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