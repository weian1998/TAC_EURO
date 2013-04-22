define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/layout/ContentPane',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/Select',
    'Sage/_Templated',
    './_PropertyEditor',
    '../PropertyValueError',
    'dojo/i18n!./nls/TextBoxAdvancedPropertyEditor'
], function(
    declare,
    lang,
    ContentPane,
    TextBox,
    NumberTextBox,
    Select,
    _Templated,
    _PropertyEditor,
    PropertyValueError,
    localization)
{
    return declare('Sage.QuickForms.Design.Editors.TextBoxAdvancedPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
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
                    '<div class="editor-field" title="{%= $.enabledTooltipText %}">',
                        '<label>{%= $.enabledText %}</label>',
                        '<div data-dojo-attach-point="_enabled" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onEnabledChange"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.maxLengthTooltipText %}">',
                        '<label>{%= $.maxLengthText %}</label>',
                        '<div data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-point="_maxLength" data-dojo-attach-event="onChange:_onMaxLengthChange" data-dojo-props="constraints:{min:-1,places:0}"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.requiredTooltipText %}">',
                        '<label>{%= $.requiredText %}</label>',
                        '<div data-dojo-attach-point="_required" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onRequiredChange"></div>',
                    '</div>',
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

        _controlType: null,
        _controlId: null,
        _enabled: null,
        _controlLabelPlacement: null,
        _defaultDataBinding: null,
        _maxLength: null,
        _required: null,
        _visible: null,

        //Localization
        titleText: 'Advanced',

        appearanceText: 'Appearance',
        behaviorText: 'Behavior',
        controlInfoText: 'Control Info',
        dataText: 'Data',

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
        maxLengthText: 'Max Length:',
        maxLengthTooltipText: 'Maximum number of characters user can enter.',
        requiredText: 'Required:',
        requiredTooltipText: 'Requires a value when saving data.',
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

            this._controlType.set('value', this._designer.get('controlName'));
            this._controlId.set('value', this._designer.get('controlId'));
            this._enabled.set('value', this._designer.get('enabled'));
            this._controlLabelPlacement.set('value', this._designer.get('controlLabelPlacement'));
            this._maxLength.set('value', this._designer.get('maxLength'));
            this._required.set('value', this._designer.get('required'));
            this._visible.set('value', this._designer.get('visible'));

            var binding = this._designer.get('defaultDataBinding');
            this._defaultDataBinding.set('value', (binding && binding['DataItemName']) || '');
        },

        _onControlTypeChange: function(value){
        },
        _onControlIdChange: function(value){
        },
        _onDefaultDataBindingChange: function(value){
        },
        _onEnabledChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('enabled', value);
        },
        _onControlLabelPlacementChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('controlLabelPlacement', value);
        },
        _onMaxLengthChange: function(value){
            if (this.isSuspended() || !this._maxLength.isValid()) return;
            this._designer.set('maxLength', value);
        },
        _onRequiredChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('required', value);
        },
        _onVisibleChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('visible', value);
        }
    });
});