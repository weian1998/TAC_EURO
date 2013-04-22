define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'Sage/_Templated',
    'dijit/_Widget',
    'dijit/_Contained',
    './ControlDesigner',
    './Editors/LayoutPropertyEditor',
    './Editors/PickListBasicPropertyEditor',
    './Editors/PickListAdvancedPropertyEditor',
    'dojo/i18n!./nls/PickListControlDesigner'
], function (
    declare,
    array,
    lang,
    _Templated,
    _Widget,
    _Contained,
    ControlDesigner,
    LayoutPropertyEditor,
    PickListBasicPropertyEditor,
    PickListAdvancedPropertyEditor,
    localization
) {
    return declare('Sage.QuickForms.Design.PickListControlDesigner', [_Widget, _Contained, _Templated, ControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            PickListBasicPropertyEditor,
            PickListAdvancedPropertyEditor,
            LayoutPropertyEditor
        ],
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div class="{%= $.fieldClass %}" data-dojo-attach-point="containerNode">',
            '<div class="{%= $.fieldClass %}-caption" data-dojo-attach-point="designCaptionNode"></div>',
            '<div class="{%= $.fieldClass %}-field">',
                '<span data-dojo-attach-point="designBindingNode"></span>',
                '<div class="{%= $.fieldClass %}-icon">...</div>',
            '</div>',
            '</div>'
        ]),
        _setDesignCaptionAttr: {
            node: 'designCaptionNode', type: 'innerText'
        },
        _setDesignBindingAttr: {
            node: 'designBindingNode', type: 'innerText'
        },

        fieldClass: 'design-picklist',
        helpTopicName: 'Pick_List_control',
        quickFormControlType: 'Sage.SalesLogix.QuickForms.QFControls.QFSLXPickList, Sage.SalesLogix.QuickForms.QFControls',

        //Localization
        displayNameText: 'Pick List',

        constructor: function () {
            lang.mixin(this, localization);
        },

        _setCaptionAttr: function (value) {
            this.inherited(arguments);

            this.set('designCaption', value);
        },
        _getDefaultDataBindingAttr: function () {
            return this.findDataBinding(function (binding) {
                return (binding['ControlItemName'] == 'PickListValue');
            });
        },

        _getStorageModeAttr: function () {
            var mode = lang.getObject('StorageMode', false, this.entry);
            if (mode === "ID") {
                return "Id";
            } else {
                return mode;
            }
        },
        _setStorageModeAttr: function (value) {
            lang.setObject('StorageMode', value, this.entry);
        },
        _getRequiredAttr: function () {
            return lang.getObject('Required', false, this.entry);
        },
        _setRequiredAttr: function (value) {
            lang.setObject('Required', value, this.entry);
        },
        _getPickListNameAttr: function () {
            return lang.getObject('PickListName', false, this.entry);
        },
        _setPickListNameAttr: function (value) {
            lang.setObject('PickListName', value, this.entry);
        },
        _getPickListIdAttr: function () {
            return lang.getObject('PickListId', false, this.entry);
        },
        _setPickListIdAttr: function (value) {
            lang.setObject('PickListId', value, this.entry);
        },
        _getMustExistInListAttr: function () {
            return lang.getObject('MustExistInList', false, this.entry);
        },
        _setMustExistInListAttr: function (value) {
            lang.setObject('MustExistInList', value, this.entry);
        },
        _getMaxLengthAttr: function () {
            return lang.getObject('MaxLength', false, this.entry);
        },
        _setMaxLengthAttr: function (value) {
            lang.setObject('MaxLength', value, this.entry);
        },
        _getDisplayModeAttr: function () {
            return lang.getObject('DisplayMode', false, this.entry);
        },
        _setDisplayModeAttr: function (value) {
            lang.setObject('DisplayMode', value, this.entry);
        },
        _getCanEditTextAttr: function () {
            return lang.getObject('CanEditText', false, this.entry);
        },
        _setCanEditTextAttr: function (value) {
            lang.setObject('CanEditText', value, this.entry);
        },
        _getControlLabelPlacementAttr: function () {
            return lang.getObject('ControlLabelPlacement', false, this.entry);
        },
        _setControlLabelPlacementAttr: function (value) {
            lang.setObject('ControlLabelPlacement', value, this.entry);
        },
        _getAllowMultiplesAttr: function () {
            return lang.getObject('AllowMultiples', false, this.entry);
        },
        _setAllowMultiplesAttr: function (value) {
            lang.setObject('AllowMultiples', value, this.entry);
        },
        setupFor: function (propertyContext) {
            this.inherited(arguments);

            this.set('allowMultiples', false);
            this.set('canEditText', true);
            this.set('displayMode', 'AsControl');
            this.set('maxLength', propertyContext['data'].length || -1);
            this.set('mustExistInList', false);
            this.set('required', false);
            this.set('storageMode', 'Id');
            this.set('pickListName', propertyContext['dataTypeData']['PickListName']);

            this.set('dataBindings', [{
                $type: 'Sage.Platform.QuickForms.Controls.QuickFormPropertyDataBindingDefinition, Sage.Platform.QuickForms',
                BindingType: 'Property',
                ControlItemName: 'PickListValue',
                DataItemName: propertyContext.propertyPath,
                DataSourceID: 'MainEntity',
                FormatString: '',
                NullValueString: ''
            }]);
            this.set('designBinding', propertyContext.propertyPath || '');
        },
        startup: function () {
            this.inherited(arguments);

            var binding = this.get('defaultDataBinding');

            this.set('designCaption', this.get('caption'));
            this.set('designBinding', (binding && binding['DataItemName']) || '');
            this.applyCaptionAlignment();
            this.applyVisibility();
        }
    });
});