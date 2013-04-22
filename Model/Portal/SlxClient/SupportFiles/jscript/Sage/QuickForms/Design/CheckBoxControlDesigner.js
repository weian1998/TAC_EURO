define([
    'dojo/dom-class',
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'Sage/_Templated',
    'dijit/_Widget',
    'dijit/_Contained',
    './ControlDesigner',
    './Editors/LayoutPropertyEditor',
    './Editors/CheckBoxBasicPropertyEditor',
    './Editors/CheckBoxAdvancedPropertyEditor',
    'dojo/i18n!./nls/CheckBoxControlDesigner'
], function(
    domClass,
    declare,
    array,
    lang,
    _Templated,
    _Widget,
    _Contained,
    ControlDesigner,
    LayoutPropertyEditor,
    CheckBoxBasicPropertyEditor,
    CheckBoxAdvancedPropertyEditor,
    localization
) {
    return declare('Sage.QuickForms.Design.CheckBoxControlDesigner', [_Widget, _Contained, _Templated, ControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            CheckBoxBasicPropertyEditor,
            CheckBoxAdvancedPropertyEditor,
            LayoutPropertyEditor
        ],
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div class="design-checkbox" data-dojo-attach-point="containerNode">',
                '<span class="{%= $.fieldClass %}-icon" data-dojo-attach-point="designCheckedNode"></span>',
                '<div class="{%= $.fieldClass %}-caption" data-dojo-attach-point="designCaptionNode"></div>',
                '<div class="{%= $.fieldClass %}-field" data-dojo-attach-point="designBindingNode"></div>',
            '</div>'
        ]),
        _setDesignCaptionAttr: {
            node: 'designCaptionNode', type: 'innerText'
        },
        _setDesignBindingAttr: {
            node: 'designBindingNode', type: 'innerText'
        },

        fieldClass: 'design-checkbox',
        helpTopicName: 'Checkbox_control',
        quickFormControlType: 'Sage.Platform.QuickForms.QFControls.QFCheckBox, Sage.Platform.QuickForms.QFControls',

        //Localization
        displayNameText: 'CheckBox',

        constructor: function() {
            lang.mixin(this, localization);
        },

        _setCaptionAttr: function(value) {
            this.inherited(arguments);

            this.set('designCaption', value);
        },
        _getDefaultDataBindingAttr: function() {
            return this.findDataBinding(function(binding) {
                return (binding['ControlItemName'] == 'Checked');
            });
        },
        _getControlLabelPlacementAttr: function() {
            return lang.getObject('ControlLabelPlacement', false, this.entry);
        },
        _setControlLabelPlacementAttr: function(value) {
            lang.setObject('ControlLabelPlacement', value, this.entry);
        },
        _getCheckedAttr: function() {
            return lang.getObject('Checked', false, this.entry);
        },
        _setCheckedAttr: function(value) {
            lang.setObject('Checked', value, this.entry);
            if (value) {
                domClass.add(this.designCheckedNode, 'design-checkbox-icon-checked');
            }
            else {
                domClass.remove(this.designCheckedNode, 'design-checkbox-icon-checked');
            }
        },

        setupFor: function(propertyContext){
            this.inherited(arguments);

            this.set('checked', false);

            this.set('dataBindings', [{
                $type: 'Sage.Platform.QuickForms.Controls.QuickFormPropertyDataBindingDefinition, Sage.Platform.QuickForms',
                BindingType: 'Property',
                ControlItemName: 'Checked',
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