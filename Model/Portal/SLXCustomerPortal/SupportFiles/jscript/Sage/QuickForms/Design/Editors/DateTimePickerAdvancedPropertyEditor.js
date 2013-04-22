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
    'dojo/i18n!./nls/DateTimePickerAdvancedPropertyEditor'
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
    return declare('Sage.QuickForms.Design.Editors.DateTimePickerAdvancedPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.appearanceText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.buttonToolTipTooltipText %}">',
                        '<label>{%= $.buttonToolTipText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_buttonToolTip" data-dojo-attach-event="onChange:_onButtonToolTipChange"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.displayModeTooltipText %}">',
                        '<label>{%= $.displayModeText %}</label>',
                        '<div data-dojo-type="dijit.form.Select" data-dojo-attach-point="_displayMode" data-dojo-attach-event="onChange:_onDisplayModeChange">',
                            '{% for (var mode in $.displayModeTypeText) { %}',
                                '<span value="{%= mode %}">{%= $.displayModeTypeText[mode] %}</span>',
                            '{% } %}',
                        '</div>',
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
                    '<div class="editor-field" title="{%= $.requiredTooltipText %}">',
                        '<label>{%= $.requiredText %}</label>',
                        '<div data-dojo-attach-point="_required" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onRequiredChange"></div>',
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
                    '<div class="editor-field" title="{%= $.timelessTooltipText %}">',
                        '<label>{%= $.timelessText %}</label>',
                        '<div data-dojo-attach-point="_timeless" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onTimelessChange"></div>',
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

        _buttonToolTip: null,
        _controlType: null,
        _controlId: null,
        _enabled: null,
        _controlLabelPlacement: null,
        _defaultDataBinding: null,
        _displayMode: null,
        _required: null,
        _timeless: null,
        _visible: null,

        //Localization
        titleText: 'Advanced',
        appearanceText: 'Appearance',
        behaviorText: 'Behavior',
        controlInfoText: 'Control Info',
        dataText: 'Data',

        buttonToolTipText: 'Button Tooltip:',
        buttonToolTipTooltipText: 'The tooltip  to display when the user\'s mouse hovers over the button part of the control.',
        controlIdText: 'Control Id:',
        controlIdTooltipText: 'Identifier for this control.',
        controlLabelPlacementText: 'Label Placement:',
        controlLabelPlacementTooltipText: 'Label position in relation to the control.',
        controlTypeText: 'Control Type:',
        controlTypeTooltipText: 'Sage SalesLogix control type.',
        defaultDataBindingText: 'Data Bindings:',
        defaultDataBindingTooltipText: 'Data field(s) in the database used by this control.',
        displayModeText: 'Display Mode:',
        displayModeTooltipText: 'Mode of display of control: text box, hyperlink, or plain text.',
        enabledText: 'Enabled:',
        enabledTooltipText: 'Allows user to interact with this control.',
        requiredText: 'Required:',
        requiredTooltipText: 'Requires a value when saving data.',
        timelessText: 'Timeless:',
        timelessTooltipText: 'Use date without time and no DST conversion.',
        visibleText: 'Visible:',
        visibleTooltipText: 'Show or hide this control on the form.',
        labelPlacementText: {
            'left': 'Left',
            'right': 'Right',
            'top': 'Top',
            'none': 'None'
        },
        displayModeTypeText: {
            'AsControl': 'As Control',
            'AsText': 'As Text',
            'AsHyperlink': 'As Hyperlink'
        },

        constructor: function() {
            lang.mixin(this, localization);
        },

        setup: function(){
            this.inherited(arguments);

            this._buttonToolTip.set('value', this._designer.get('buttonToolTip'));
            this._controlType.set('value', this._designer.get('controlName'));
            this._controlId.set('value', this._designer.get('controlId'));
            this._displayMode.set('value', this._designer.get('displayMode'));
            this._enabled.set('value', this._designer.get('enabled'));
            this._controlLabelPlacement.set('value', this._designer.get('controlLabelPlacement'));
            this._required.set('value', this._designer.get('required'));
            this._timeless.set('value', this._designer.get('timeless'));
            this._visible.set('value', this._designer.get('visible'));

            var binding = this._designer.get('defaultDataBinding');
            this._defaultDataBinding.set('value', (binding && binding['DataItemName']) || '');
        },

        _onButtonToolTipChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('buttonToolTip', value);
        },
        _onControlTypeChange: function(value){
        },
        _onControlIdChange: function(value){
        },
        _onDefaultDataBindingChange: function(value){
        },
        _onDisplayModeChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('displayMode', value);
        },
        _onEnabledChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('enabled', value);
        },
        _onControlLabelPlacementChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('controlLabelPlacement', value);
        },
        _onRequiredChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('required', value);
        },
        _onTimelessChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('timeless', value);
        },
        _onVisibleChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('visible', value);
        }
    });
});