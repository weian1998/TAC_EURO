define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'Sage/_Templated',
    'dijit/_Widget',
    'dijit/_Contained',
    './ControlDesigner',
    './Editors/LayoutPropertyEditor',
    './Editors/DateTimePickerBasicPropertyEditor',
    './Editors/DateTimePickerAdvancedPropertyEditor',
    'dojo/i18n!./nls/DateTimePickerControlDesigner'
], function(
    declare,
    array,
    lang,
    _Templated,
    _Widget,
    _Contained,
    ControlDesigner,
    LayoutPropertyEditor,
    DateTimePickerBasicPropertyEditor,
    DateTimePickerAdvancedPropertyEditor,
    localization
) {
    return declare('Sage.QuickForms.Design.DateTimePickerControlDesigner', [_Widget, _Contained, _Templated, ControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            DateTimePickerBasicPropertyEditor,
            DateTimePickerAdvancedPropertyEditor,
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

        fieldClass: 'design-datetimepicker',
        helpTopicName: 'DateTime_Picker_control',
        quickFormControlType: 'Sage.SalesLogix.QuickForms.QFControls.QFDateTimePicker, Sage.SalesLogix.QuickForms.QFControls',

        //Localization
        displayNameText: 'DateTime Picker',

        constructor: function() {
            lang.mixin(this, localization);
        },

        _setCaptionAttr: function(value) {
            this.inherited(arguments);

            this.set('designCaption', value);
        },
        _getDefaultDataBindingAttr: function() {
            return this.findDataBinding(function(binding) {
                return (binding['ControlItemName'] == 'DateTimeValue');
            });
        },

        _getButtonToolTipAttr: function() {
            return lang.getObject('ButtonToolTip', false, this.entry);
        },
        _setButtonToolTipAttr: function(value) {
            lang.setObject('ButtonToolTip', value, this.entry);
        },
        _getControlLabelPlacementAttr: function() {
            return lang.getObject('ControlLabelPlacement', false, this.entry);
        },
        _setControlLabelPlacementAttr: function(value) {
            lang.setObject('ControlLabelPlacement', value, this.entry);
        },
        _getDisplayDateAttr: function() {
            return lang.getObject('DisplayDate', false, this.entry);
        },
        _setDisplayDateAttr: function(value) {
            lang.setObject('DisplayDate', value, this.entry);
        },
        _getDisplayModeAttr: function() {
            return lang.getObject('DisplayMode', false, this.entry);
        },
        _setDisplayModeAttr: function(value) {
            lang.setObject('DisplayMode', value, this.entry);
        },
        _getDisplayTimeAttr: function() {
            return lang.getObject('DisplayTime', false, this.entry);
        },
        _setDisplayTimeAttr: function(value) {
            lang.setObject('DisplayTime', value, this.entry);
        },
        _getRequiredAttr: function() {
            return lang.getObject('Required', false, this.entry);
        },
        _setRequiredAttr: function(value) {
            lang.setObject('Required', value, this.entry);
        },
        _getTimelessAttr: function() {
            return lang.getObject('Timeless', false, this.entry);
        },
        _setTimelessAttr: function(value) {
            lang.setObject('Timeless', value, this.entry);
        },

        setupFor: function(propertyContext){
            this.inherited(arguments);

            this.set('displayDate', true);
            this.set('displayTime', false);

            this.set('buttonToolTip', '');
            this.set('displayMode', 'AsControl');
            this.set('required', false);
            this.set('timeless', false);

            this.set('dataBindings', [{
                $type: 'Sage.Platform.QuickForms.Controls.QuickFormPropertyDataBindingDefinition, Sage.Platform.QuickForms',
                BindingType: 'Property',
                ControlItemName: 'DateTimeValue',
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