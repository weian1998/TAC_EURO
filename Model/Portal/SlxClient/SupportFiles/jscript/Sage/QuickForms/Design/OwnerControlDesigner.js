define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'Sage/_Templated',
    'dijit/_Widget',
    'dijit/_Contained',
    './ControlDesigner',
    './Editors/LayoutPropertyEditor',
    './Editors/OwnerBasicPropertyEditor',
    './Editors/OwnerAdvancedPropertyEditor',
    'dojo/i18n!./nls/OwnerControlDesigner'
], function(
    declare,
    array,
    lang,
    _Templated,
    _Widget,
    _Contained,
    ControlDesigner,
    LayoutPropertyEditor,
    OwnerBasicPropertyEditor,
    OwnerAdvancedPropertyEditor,
    localization
) {
    return declare('Sage.QuickForms.Design.OwnerControlDesigner', [_Widget, _Contained, _Templated, ControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            OwnerBasicPropertyEditor,
            OwnerAdvancedPropertyEditor,
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

        fieldClass: 'design-owner',
        helpTopicName: 'Owner_control',
        quickFormControlType: 'Sage.SalesLogix.QuickForms.QFControls.QFSLXOwner, Sage.SalesLogix.QuickForms.QFControls',

        //Localization
        displayNameText: 'Owner',

        constructor: function() {
            lang.mixin(this, localization);
        },

        _setCaptionAttr: function(value) {
            this.inherited(arguments);

            this.set('designCaption', value);
        },
        _getDefaultDataBindingAttr: function() {
            return this.findDataBinding(function(binding) {
                return (binding['ControlItemName'] == 'LookupResultValue');
            });
        },

        _getControlLabelPlacementAttr: function() {
            return lang.getObject('ControlLabelPlacement', false, this.entry);
        },
        _setControlLabelPlacementAttr: function(value) {
            lang.setObject('ControlLabelPlacement', value, this.entry);
        },
        _getRequiredAttr: function() {
            return lang.getObject('Required', false, this.entry);
        },
        _setRequiredAttr: function(value) {
            lang.setObject('Required', value, this.entry);
        },


        setupFor: function(propertyContext){
            this.inherited(arguments);

            this.set('required', false);

            this.set('dataBindings', [{
                $type: 'Sage.Platform.QuickForms.Controls.QuickFormPropertyDataBindingDefinition, Sage.Platform.QuickForms',
                BindingType: 'Property',
                ControlItemName: 'LookupResultValue',
                DataItemName: propertyContext.propertyPath,
                DataSourceID: 'MainEntity',
                FormatString: '',
                NullValueString: 'null'
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