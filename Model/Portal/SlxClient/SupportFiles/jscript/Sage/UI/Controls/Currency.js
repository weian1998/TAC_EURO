/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dojo/_base/html',
       'dojox/grid/DataGrid',
       'dijit/_Widget',
       'Sage/_Templated',
       'dijit/form/CurrencyTextBox',
       'Sage/UI/Controls/CurrencyTextBox',
       'dojo/currency',
       'dojo/string',
       'dojo/_base/declare',
       'Sage/Utility'
],
function (html, dataGrid, _Widget, _Templated, currencyTextBox, sageCurrencyTextBox, currency, string, declare, utility) {
    //TODO: This hook will be depricated once ClientBindingManagerService has been converted with Dojo.
    dojo.mixin(dijit.form.ValidationTextBox.prototype.attributeMap, { slxchangehook: 'focusNode' });

    var widget = declare("Sage.UI.Controls.Currency", [_Widget, _Templated], {
        //using Simplate to faciliate conditional display
        //Reference enum for Display Modes
        displayModes: {
            //Renders the control as hyperlinked text.
            'AsHyperlink': 0,
            //Default rendering of the control.
            'AsControl': 1,
            //Renders the control a text only.        
            'AsText': 2
        },
        //Display Mode template object.
        modeTemplates: {
            //Renders the control as hyperlinked text.
            // Does not work - was never wired up
            'AsHyperlink': new Simplate([
                '<div data-dojo-type="dijit.form.Button" showLabel="true">{%= $.value %}</div>'
            ]),
            //Default rendering of the control.
            'AsControl': new Simplate([
                '<input  data-dojo-type="Sage.UI.Controls.CurrencyTextBox" ',
                'constraints="{ {%= $.constraintsToString() %} }" ',
                'id="{%= $.id %}_CurrencyTextBox" ',
                'style="width:inherit;"',
                'textAlign="{%= $.textAlign %}"',
                ' name="{%= $.name %}" type="text" ',
                ' value="{%= $.value %}" dojoAttachPoint="focusNode" ',
                '{% if ( $.multiCurrency ) { %} ',
                ' class="ISOSpace" ',
                '{% } %}',
                ' hotKey="{%= $.hotKey %}" ',
                '{% if($.disabled === "disabled") { %} ',
                ' disabled="disabled" ',
                '{% } %}',
                '{% if($.readonly === "readonly") { %} ',
                ' readonly="readonly" ',
                '{% } %}',
                ' maxlength="{%= $.maxLength %}" ',
                ' required="{%= $.required %}">',
                '{% if ( $.multiCurrency ) { %} ',
                    '<label id="{%= $.id %}_ISOLabel" ',
                       'dojoAttachPoint="currencyCodeLabel" ',
                       'for="${0}_CurrencyTextbox" ',
                       'class="ISOLabel" ',
                       'wairole="presentation" ',
                       'readonly="true" ',
                       'tabindex="-1" ',
                       'class="dijitInputInner" ',
                       'role="presentation">',
                    '</label> ',
                '{% } %}'
            ]),
            //Renders the control a text only.
            'AsText': new Simplate([
                '<div data-dojo-type="dijit.form.Button" showLabel="true">{%= $.formattedText() %}</div>'
            ])
        },
        widgetTemplate: new Simplate([
            '<div style="width:inherit;" slxcompositecontrol="true" id="{%= $.id %}" >',
            '{%= $.modeTemplates[$.displayMode].apply($) %}',
            '</div>'
        ]),
        postMixInProperties: function () {
            this.currentCultureSymbol = Sys.CultureInfo.CurrentCulture.numberFormat.CurrencySymbol;

            if (this.multiCurrency) {
                // multiCurrency displays currency code in a label, not the currency symbol
                this.constraints['currency'] = null;
            } else {
                if (this.constraints['currency'] === '' || this.constraints['currency'] === null) {
                    this.constraints['currency'] = this.currentCode;
                }
            }
        },
        _onBlur: function () {
            //we need this so that the validationtextbox does not set the state as an error when only one digit was added after the decimal place
            this.focusNode.set('displayedValue', utility.maximizeDecimalDigit(this.focusNode.focusNode.value, this.constraints.places));
        },
        postCreate: function () {
            //summary:
            // Place the ISO code next to the textbox in a label

            //ISO Code placement
            if (this.multiCurrency) {
                //Set the style attribute instead of dojo.style, which does not allow !important.
                dijit.byId(this.id + '_CurrencyTextBox').domNode.setAttribute("style", "width:100% !important;");
                this.currencyCodeLabel.innerHTML = this.currentCode;
            }

            this.inherited(arguments);
        },
        value: 0,
        //summary:
        //     When provided to dijit.form.CurrencyTextBox via the lang property, 
        //     currentCulture enables the control to know the expected formatting.
        //     example: 'de-de'    
        //     Sys.CultureInfo.CurrentCulture.name,
        //summary:
        //   Provided to dijit.form.CurrencyTextBox for currency formatting.
        //   example: 'EUR', 'USD'
        //   postMixInProperties sets this.
        currentCultureSymbol: '', //Sys.CultureInfo.CurrentCulture.numberFormat.CurrencySymbol,
        //summary:
        //  Represents the current currency code.  
        //  Displayed with value when multiCurrency is true.
        //  example: 'EUR', 'USD'
        currentCode: 'USD',  //Default
        //summary:
        //Represents the current exchange rate. For a server side control, the value is already calculated.
        exchangeRate: 1, //Default
        //summary:
        // Is multicurrency enabled
        multiCurrency: false,
        displayCurrencyCode: true, // not used? TODO:
        //summary:
        //.Net control behavior
        autoPostBack: false,
        width: 15,
        maxLength: 128,
        required: false,
        style: '',
        //These three props are for non-grid modes.  Add to basic control config but not column config.    
        enabled: true, // For non-grid mode. Redundant from grid.column.editable: true
        readonly: '', // For non-grid mode. Redundant from grid.column.editable: true
        disabled: '',
        visible: true, // For non-grid mode. Redundant from field in grid Select but column not included.
        hotKey: '',
        tabIndex: 0,
        //Sets the display mode that the control will render in.
        displayMode: 'AsControl',
        // appliedSecurity: '',  Note: Not yet enabled on control.    
        widgetsInTemplate: true,
        styles: 'text-align: right;',
        name: '',
        constraints: null,
        id: 'currencyControl',
        //summary:
        //  Converts the constraints object to a string usable in the template.
        //  Strings are wrapped in single quotes.
        constraintsToString: function () {
            // TODO: Same function is used in numeric, move to a util class
            var tmp = [];
            for (var prop in this.constraints) {
                if (this.constraints.hasOwnProperty(prop)) {
                    var value = this.constraints[prop];
                    if (typeof value === 'string') {
                        value = "\'" + value + "\'";
                    }

                    tmp.push(prop + ":" + value);
                }
            }

            var results = tmp.join(",");
            return results;
        },
        constructor: function (options) {
            this.inherited(arguments);
        },
        destroy: function () {
            if (this.focusNode) {
                this.focusNode.destroy();
            }
            this.inherited(arguments);
        }
    });

    return widget;
});

