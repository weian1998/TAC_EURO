/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys */
dojo.provide("Sage.UI.Currency");
dojo.require("dojo._base.html");
dojo.require("dojox.grid.DataGrid");
dojo.require("dijit._Widget");
dojo.require("Sage._Templated");
dojo.require("dijit.form.CurrencyTextBox");
dojo.require("Sage.UI.CurrencyTextBox");
dojo.require("dojo.currency");


//TODO: This hook will be depricated once ClientBindingManagerService has been converted with Dojo.
dojo.mixin(dijit.form.ValidationTextBox.prototype.attributeMap, { slxchangehook: 'focusNode' });

dojo.declare("Sage.UI.Currency", [dijit._Widget, Sage._Templated], {
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
        'AsHyperlink': new Simplate([
            '<div dojoType="dijit.form.Button" showLabel="true">ONE</div>'
        ]),
        //Default rendering of the control.
        'AsControl': new Simplate([
            '<input  dojoType="Sage.UI.CurrencyTextBox" ',
            '{% if ( $.constraints ) { %} ',
            ' constraints="{places:{%= $.constraints.places %}}" ',
            '{% } %}',            
            'id="{%= $.id %}_CurrencyTextBox" ',
            'style="width:inherit;"',
            'textAlign="{%= $.textAlign %}"',            
            ' name="{%= $.name %}" type="text" ',
            ' value="{%= $.value %}" required="{%= $.required %}"  dojoAttachPoint="focusNode" ',
            '{% if ( !$.multiCurrency ) { %} ',
            ' currency="{%= $.currentCultureSymbol %}" ',
            '{% } %}',
            '{% if ( $.multiCurrency ) { %} ',
            ' lang="{%= $.currentCode %}" ',
            ' class="ISOSpace" ',
            '{% } %}',
            ' maxlength="{%= $.maxLength %}" ><label id="ISOCode"></label> ',
        ]),
        //Renders the control a text only.
        'AsText': new Simplate([
            '<div dojoType="dijit.form.Button" showLabel="true">{%= $.formattedText() %}</div>'
        ])
    },
    widgetTemplate: new Simplate([
        '<div style="width:inherit;" slxcompositecontrol="true" id="{%= $.id %}" >',
        '{%= $.modeTemplates[$.displayMode].apply($) %}',
        '</div>'
    ]),
    postMixInProperties: function () {
        this.currentCultureSymbol = Sys.CultureInfo.CurrentCulture.numberFormat.CurrencySymbol;
    },
    postCreate: function () {
        //summary:
        // Place the ISO code inside the textbox and give it room to display without wrapping,

        //ISO Code placement
        if (this.multiCurrency) {
            //Set the style attribute instead of dojo.style, which does not allow !important.
            dijit.byId(this.id + '_CurrencyTextBox').domNode.setAttribute("style", "width:75% !important;");

            //We need to add aditional positioning if we are in IE7 and 'setAttribute' is not taking affect.
            if (dojo.isIE === 7) {
                dojo.place(String.format('<label id="ISOLabel" style="width:20% !important;position:relative !important;left:2px !important ;bottom:4px !important;" wairole="presentation" readonly="true" tabindex="-1" class="dijitInputInner" role="presentation" > {0} </label>',
                this.currentCode), 'ISOCode', 'replace');
            }
            else {
                dojo.place(String.format('<label id="ISOLabel" style="width:20% !important;" wairole="presentation" readonly="true" tabindex="-1" class="dijitInputInner" role="presentation" > {0} </label>',
                this.currentCode), 'ISOCode', 'replace');
            }
        }
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
    currentCultureSymbol: '', //Sys.CultureInfo.CurrentCulture.numberFormat.CurrencySymbol,
    //summary:
    //  Represents the current currency code.  
    //  Displayed with value when multiCurrency is true.
    //  example: 'EUR', 'USD'
    currentCode: 'USD',  //Default
    //summary:
    //Represents the current exchange rate.  
    exchangeRate: 1, //Default
    //summary:
    // Is multicurrency enabled
    multiCurrency: false,
    displayCurrencyCode: true,
    //summary:
    //.Net control behavior
    autoPostBack: false,
    width: 15,
    maxLength: 128,
    style: '',
    //These three props are for non-grid modes.  Add to basic control config but not column config.    
    enabled: true, // For non-grid mode. Redundant from grid.column.editable: true
    readOnly: false, // For non-grid mode. Redundant from grid.column.editable: true
    visible: true, // For non-grid mode. Redundant from field in grid Select but column not included.
    hotKey: '',
    tabIndex: 0,
    //Sets the display mode that the control will render in.
    displayMode: 'AsControl',    
    // appliedSecurity: '',  Note: Not yet enabled on control.    
    widgetsInTemplate: true,
    styles: 'text-align: right;'
});