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
    'dojo/i18n!./nls/NumericAdvancedPropertyEditor'
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
    localization) {
    return declare('Sage.QuickForms.Design.Editors.NumericAdvancedPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
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
                    '<div class="editor-field" title="{%= $.formatTypeTooltipText %}">',
                        '<label>{%= $.formatTypeText %}</label>',
                        '<div data-dojo-type="dijit.form.Select" data-dojo-attach-point="_formatType" data-dojo-attach-event="onChange:_onFormatTypeChange">',
                        '{% for (var format in $.numberFormatText) { %}',
                            '<span value="{%= format %}">{%= $.numberFormatText[format] %}</span>',
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
                    '<div class="editor-field" title="{%= $.requiredTooltipText %}">',
                        '<label>{%= $.requiredText %}</label>',
                        '<div data-dojo-attach-point="_required" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onRequiredChange"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.decimalDigitsTooltipText %}">',
                        '<label>{%= $.decimalDigitsText %}</label>',
                        '<div data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-point="_decimalDigits" data-dojo-props="constraints:{min:-1,max:100,places:0}" data-dojo-attach-event="onChange:_onDecimalDigitsChange"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.strictTooltipText %}">',
                        '<label>{%= $.strictText %}</label>',
                        '<div data-dojo-attach-point="_strict" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onStrictChange"></div>',
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
        _isReadOnly: null,
        _defaultDataBinding: null,
        _formatType: null,
        _maxLength: null,
        _required: null,
        _strict: null,
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
        decimalDigitsText: 'Decimal Digits:',
        decimalDigitsTooltipText: 'The number of digits after the decimal to display and allow for data entry.',
        defaultDataBindingText: 'Data Bindings:',
        defaultDataBindingTooltipText: 'Data field(s) in the database used by this control.',
        enabledText: 'Enabled:',
        enabledTooltipText: 'Allows user to interact with this control.',
        formatTypeText: 'Format Type:',
        formatTypeTooltipText: 'Type of format to use when converting number to string.',
        maxLengthText: 'Max Length:',
        maxLengthTooltipText: 'Maximum number of characters user can enter.',
        requiredText: 'Required:',
        requiredTooltipText: 'Requires a value when saving data.',
        strictText: 'Strict:',
        strictTooltipText: 'Pads display of number with trailing zeros as necessary.',
        visibleText: 'Visible:',
        visibleTooltipText: 'Show or hide this control on the form.',
        numberFormatText: {
            'Number': 'Number',
            'Percent': 'Percent',
            'Decimal': 'Decimal',
            'Scientific': 'Scientific'
        },
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

            this._controlId.set('value', this._designer.get('controlId'));
            this._controlLabelPlacement.set('value', this._designer.get('controlLabelPlacement'));
            this._controlType.set('value', this._designer.get('controlName'));
            this._decimalDigits.set('value', this._designer.get('decimalDigits'));
            this._enabled.set('value', this._designer.get('enabled'));
            this._formatType.set('value', this._designer.get('formatType'));
            this._maxLength.set('value', this._designer.get('maxLength'));
            this._required.set('value', this._designer.get('required'));
            this._strict.set('value', this._designer.get('strict'));
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
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('enabled', value);
        },
        _onDecimalDigitsChange: function(value){
            if (this.isSuspended() || !this._decimalDigits.isValid()) {
                return;
            }
            this._designer.set('decimalDigits', value);
        },
        _onFormatTypeChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('formatType', value);
        },
        _onControlLabelPlacementChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('controlLabelPlacement', value);
        },
        _onMaxLengthChange: function(value){
            if (this.isSuspended() || !this._maxLength.isValid()) {
                return;
            }
            this._designer.set('maxLength', value);
        },
        _onRequiredChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('required', value);
        },
        _onStrictChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('strict', value);
        },
        _onVisibleChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('visible', value);
        }
    });
});