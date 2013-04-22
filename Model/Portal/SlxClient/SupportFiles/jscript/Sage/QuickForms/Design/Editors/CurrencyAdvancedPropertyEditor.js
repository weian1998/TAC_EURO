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
    'dojo/i18n!./nls/CurrencyAdvancedPropertyEditor'
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
    return declare('Sage.QuickForms.Design.Editors.CurrencyAdvancedPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.appearanceText %}</legend>',
            '<div class="editor-content-half">',
                '<div class="editor-field" title="{%= $.displayModeTooltipText %}">',
                    '<label>{%= $.displayModeText %}</label>',
                    '<div data-dojo-type="dijit.form.Select" data-dojo-attach-point="_displayMode" data-dojo-attach-event="onChange:_onDisplayModeChange">',
                    '{% for (var type in $.displayTypeText) { %}',
                        '<span value="{%= type %}">{%= $.displayTypeText[type] %}</span>',
                    '{% } %}',
                    '</div>',
                '</div>',
                '<div class="editor-field" title="{%= $.visibleTooltipText %}">',
                    '<label>{%= $.visibleText %}</label>',
                    '<div data-dojo-attach-point="_visible" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onVisibleChange"></div>',
                '</div>',
            '</div>',
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
            '</fieldset>',

            '<fieldset><legend>{%= $.behaviorText %}</legend>',
            '<div class="editor-content-half">',
                '<div class="editor-field" title="{%= $.decimalDigitsTooltipText %}">',
                    '<label>{%= $.decimalDigitsText %}</label>',
                    '<div data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-point="_decimalDigits" data-dojo-props="constraints:{min:-1,max:100,places:0}" data-dojo-attach-event="onChange:_onDecimalDigitsChange"></div>',
                '</div>',
                '<div class="editor-field" title="{%= $.enabledTooltipText %}">',
                    '<label>{%= $.enabledText %}</label>',
                    '<div data-dojo-attach-point="_enabled" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onEnabledChange"></div>',
                '</div>',
            '</div>',
            '<div class="editor-content-half">',
                '<div class="editor-field" title="{%= $.maxLengthTooltipText %}">',
                    '<label>{%= $.maxLengthText %}</label>',
                    '<div data-dojo-attach-point="_maxLength" data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-event="onChange:_onMaxLengthChange" data-dojo-props="constraints:{min:-1,places:0}"></div>',
                '</div>',
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
                '<div class="editor-field" title="{%= $.exchangeRateTypeTooltipText %}">',
                    '<label>{%= $.exchangeRateTypeText %}</label>',
                    '<div data-dojo-type="dijit.form.Select" data-dojo-attach-point="_exchangeRateType" data-dojo-attach-event="onChange:_onExchangeRateTypeChange">',
                    '{% for (var rate in $.exchangeTypeText) { %}',
                        '<span value="{%= rate %}">{%= $.exchangeTypeText[rate] %}</span>',
                    '{% } %}',
                    '</div>',
                '</div>',
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

        _controlId: null,
        _controlLabelPlacement: null,
        _controlType: null,
        _decimalDigits: null,
        _defaultDataBinding: null,
        _displayCurrencyCode: null,
        _displayMode: null,
        _enabled: null,
        _exchangeRateType: null,
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
        decimalDigitsText: 'Decimal Digits:',
        decimalDigitsTooltipText: 'The number of digits after the decimal to display and allow for data entry.',
        defaultDataBindingText: 'Data Bindings:',
        defaultDataBindingTooltipText: 'Data field(s) in the database used by this control.',
        displayModeText: 'Display Mode:',
        displayModeTooltipText: 'Mode of display of control: text box, hyperlink, or plain text.',
        enabledText: 'Enabled:',
        enabledTooltipText: 'Allows user to interact with this control.',
        exchangeRateTypeText: 'Exchange Rate Type:',
        exchangeRateTypeTooltipText: 'Type of exchange rate to show in currency fields.',
        maxLengthText: 'Max Length:',
        maxLengthTooltipText: 'Maximum number of characters user can enter.',
        requiredText: 'Required:',
        requiredTooltipText: 'Requires a value when saving data.',
        visibleText: 'Visible:',
        visibleTooltipText: 'Show or hide this control on the form.',
        displayTypeText: {
            'AsHyperlink': 'As Hyperlink',
            'AsControl': 'As Control',
            'AsText': 'As Text'
        },
        exchangeTypeText: {
            'BaseRate': 'Base Rate',
            'OpportunityRate': 'Opportunity Rate (Deprecated)',
            'MyRate': 'My Rate',
            'SalesOrderRate': 'Sales Order Rate (Deprecated)',
            'EntityRate': 'Entity Rate'
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
            this._displayMode.set('value', this._designer.get('displayMode'));
            this._enabled.set('value', this._designer.get('enabled'));
            this._exchangeRateType.set('value', this._designer.get('exchangeRateType'));
            this._maxLength.set('value', this._designer.get('maxLength'));
            this._required.set('value', this._designer.get('required'));
            this._visible.set('value', this._designer.get('visible'));

            var binding = this._designer.get('defaultDataBinding');
            this._defaultDataBinding.set('value', (binding && binding['DataItemName']) || '');
        },

        _onControlIdChange: function(value){
        },
        _onControlLabelPlacementChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('controlLabelPlacement', value);
        },
        _onControlTypeChange: function(value){
        },
        _onDecimalDigitsChange: function(value){
            if (this.isSuspended() || !this._decimalDigits.isValid()) {
                return;
            }
            this._designer.set('decimalDigits', value);
        },
        _onDefaultDataBindingChange: function(value){
        },
        _onDisplayModeChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('displayMode', value);
        },
        _onEnabledChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('enabled', value);
        },
        _onExchangeRateTypeChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('exchangeRateType', value);
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