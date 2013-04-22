define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'Sage/_Templated',
    'dijit/_Widget',
    'dijit/_Contained',
    './ControlDesigner',
    './Editors/LayoutPropertyEditor',
    './Editors/ComboBoxBasicPropertyEditor',
    './Editors/ComboBoxAdvancedPropertyEditor',
    'dojo/i18n!./nls/ComboBoxControlDesigner'
], function(
    declare,
    array,
    lang,
    _Templated,
    _Widget,
    _Contained,
    ControlDesigner,
    LayoutPropertyEditor,
    ComboBoxBasicPropertyEditor,
    ComboBoxAdvancedPropertyEditor,
    localization
) {
    return declare('Sage.QuickForms.Design.ComboBoxControlDesigner', [_Widget, _Contained, _Templated, ControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            ComboBoxBasicPropertyEditor,
            ComboBoxAdvancedPropertyEditor,
            LayoutPropertyEditor
        ],
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div class="{%= $.fieldClass %}" data-dojo-attach-point="containerNode">',
            '<div class="{%= $.fieldClass %}-caption" data-dojo-attach-point="designCaptionNode"></div>',
            '<div class="{%= $.fieldClass %}-field">',
                '<span data-dojo-attach-point="designBindingNode"></span>',
                '<div class="{%= $.fieldClass %}-icon"></div>',
            '</div>',
            '</div>'
        ]),
        _setDesignCaptionAttr: {
            node: 'designCaptionNode', type: 'innerText'
        },
        _setDesignBindingAttr: {
            node: 'designBindingNode', type: 'innerText'
        },

        fieldClass: 'design-combobox',
        helpTopicName: 'ComboBox_control',
        quickFormControlType: 'Sage.Platform.QuickForms.QFControls.QFListBox, Sage.Platform.QuickForms.QFControls',

        //Localization
        displayNameText: 'ComboBox',

        constructor: function() {
            lang.mixin(this, localization);
        },

        _setCaptionAttr: function(value) {
            this.inherited(arguments);

            this.set('designCaption', value);
        },
        _getDefaultDataBindingAttr: function() {
            return this.findDataBinding(function(binding) {
                return (binding['ControlItemName'] == 'SelectedValue');
            });
        },
        _getControlLabelPlacementAttr: function() {
            return lang.getObject('ControlLabelPlacement', false, this.entry);
        },
        _setControlLabelPlacementAttr: function(value) {
            lang.setObject('ControlLabelPlacement', value, this.entry);
        },
        _getDataSourceAttr: function() {
            return lang.getObject('DataSource', false, this.entry);
        },
        _setDataSourceAttr: function(value) {
            lang.setObject('DataSource', value, this.entry);
        },
        _getHasItemsAttr: function() {
            var items = lang.getObject('ItemValues', false, this.entry);
            return (lang.isArray(items) && items.length > 0);
        },
        _getItemValuesAttr: function() {
            return lang.getObject('ItemValues', false, this.entry);
        },
        _setItemValuesAttr: function(value) {
            lang.setObject('ItemValues', value, this.entry);
        },
        _getTextFieldAttr: function() {
            return lang.getObject('TextField', false, this.entry);
        },
        _setTextFieldAttr: function(value) {
            lang.setObject('TextField', value, this.entry);
        },
        _getValueFieldAttr: function() {
            return lang.getObject('ValueField', false, this.entry);
        },
        _setValueFieldAttr: function(value) {
            lang.setObject('ValueField', value, this.entry);
        },

        setupFor: function(propertyContext){
            this.inherited(arguments);

            this.set('dataSource', null);
            this.set('textField', '');
            this.set('valueField', '');

            this.set('dataBindings', [{
                $type: 'Sage.Platform.QuickForms.Controls.QuickFormPropertyDataBindingDefinition, Sage.Platform.QuickForms',
                BindingType: 'Property',
                ControlItemName: 'SelectedValue',
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