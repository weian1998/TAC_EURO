define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/layout/ContentPane',
    'dojox/layout/TableContainer',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/Select',
    'Sage/_Templated',
    './_PropertyEditor',
    '../PropertyValueError',
    'dojo/i18n!./nls/CheckBoxAdvancedPropertyEditor'
], function(
    declare,
    lang,
    ContentPane,
    TableContainer,
    TextBox,
    NumberTextBox,
    Select,
    _Templated,
    _PropertyEditor,
    PropertyValueError,
    localization)
{
    return declare('Sage.QuickForms.Design.Editors.CheckBoxAdvancedPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.appearanceText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.controlLabelPlacementTooltipText %}">',
                        '<label>{%= $.controlLabelPlacementText %}</label>',
                        '<div data-dojo-type="dijit.form.Select" data-dojo-attach-point="_controlLabelPlacement" data-dojo-attach-event="onChange:_onControlLabelPlacementChange">',
                        '{% for (var placement in $.labelPlacementText) { %}',
                            '<span value="{%= placement %}">{%= $.labelPlacementText[placement] %}</span>',
                        '{% } %}',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.visibleTooltipText %}">',
                        '<label>{%= $.visibleText %}</label>',
                        '<div data-dojo-attach-point="_visible" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onVisibleChange"></div>',
                    '</div>',
                '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.behaviorText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" style="display:none;" title="{%= $.checkedTooltipText %}">',
                        '<label>{%= $.checkedText %}</label>',
                        '<div data-dojo-type="dijit.form.CheckBox" data-dojo-attach-point="_checked" data-dojo-attach-event="onChange:_onCheckedChange"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.enabledTooltipText %}">',
                        '<label>{%= $.enabledText %}</label>',
                        '<div data-dojo-attach-point="_enabled" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onEnabledChange"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.dataText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.defaultDataBindingTooltipText %}">',
                        '<label>{%= $.defaultDataBindingText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_defaultDataBinding" data-dojo-attach-event="onChange:_onDefaultDataBindingChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.controlInfoText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.controlIdTooltipText %}">',
                        '<label>{%= $.controlIdText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_controlId" data-dojo-attach-event="onChange:_onControlIdChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.controlTypeTooltipText %}">',
                        '<label>{%= $.controlTypeText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_controlType" data-dojo-attach-event="onChange:_onControlTypeChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
            '</fieldset>'
        ]),

        _checked: null,
        _controlType: null,
        _controlId: null,
        _enabled: null,
        _controlLabelPlacement: null,
        _defaultDataBinding: null,
        _visible: null,

        //Localization
        titleText: 'Advanced',

        appearanceText: 'Appearance',
        behaviorText: 'Behavior',
        controlInfoText: 'Control Info',
        dataText: 'Data',

        checkedText: 'Checked:',
        checkedTooltipText: 'Sets default state of checkbox to selected.',
        controlIdText: 'Control Id:',
        controlIdTooltipText: 'Identifier for this control.',
        controlLabelPlacementText: 'Label Placement:',
        controlLabelPlacementTooltipText: 'Label position in relation to the control.',
        controlTypeText: 'Control Type:',
        controlTypeTooltipText: 'Sage SalesLogix control type.',
        defaultDataBindingText: 'Data Bindings:',
        defaultDataBindingTooltipText: 'Data field(s) in the database used by this control.',
        enabledText: 'Enabled:',
        enabledTooltipText: 'Allows user to interact with this control.',
        visibleText: 'Visible:',
        visibleTooltipText: 'Show or hide this control on the form.',
        labelPlacementText: {
            'left': 'Left',
            'right': 'Right',
            'top': 'Top',
            'none': 'None'
        },

        constructor: function() {
            lang.mixin(this, localization);
        },

        setup: function(){
            this.inherited(arguments);

            this._checked.set('value', this._designer.get('checked'));
            this._controlType.set('value', this._designer.get('controlName'));
            this._controlId.set('value', this._designer.get('controlId'));
            this._enabled.set('value', this._designer.get('enabled'));
            this._controlLabelPlacement.set('value', this._designer.get('controlLabelPlacement'));
            this._visible.set('value', this._designer.get('visible'));

            var binding = this._designer.get('defaultDataBinding');
            this._defaultDataBinding.set('value', (binding && binding['DataItemName']) || '');
        },

        _onCheckedChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('checked', value);
        },
        _onControlTypeChange: function(value){
        },
        _onControlIdChange: function(value){
        },
        _onDefaultDataBindingChange: function(value){
        },
        _onEnabledChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('enabled', value);
        },
        _onControlLabelPlacementChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('controlLabelPlacement', value);
        },
        _onVisibleChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('visible', value);
        }
    });
});