/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys */
dojo.provide("Sage.UI.Controls.Numeric");
dojo.require("dojo._base.html");
dojo.require("dijit._Widget");
dojo.require("Sage._Templated");
dojo.require("Sage.UI.NumberTextBox");
dojo.require("dojo.currency");

//TODO: This hook will be depricated once ClientBindingManagerService has been converted with Dojo.
dojo.mixin(dijit.form.ValidationTextBox.prototype.attributeMap, { slxchangehook: 'focusNode' });

dojo.declare("Sage.UI.Controls.Numeric", [dijit._Widget, Sage._Templated], {
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
            '<input  dojoType="Sage.UI.NumberTextBox" ',
            '{% if ( $.constraints.places ) { %} ',
            ' constraints="{places:{%= $.constraints.places %}}" ',
            '{% } %}',
            '{% if ( $.constraints.maxPlaces ) { %} ',
            ' constraints="{maxPlaces:{%= $.constraints.maxPlaces %}}" ',
            '{% } %}',
            'id="{%= $.id %}_NumberTextBox" ',
            'style="width:inherit;"',
            'textAlign="{%= $.textAlign %}"',
            ' name="{%= $.name %}" type="text" ',
            ' value="{%= $.value %}" required="{%= $.required %}"  dojoAttachPoint="focusNode" ',
            ' maxlength="{%= $.maxLength %}" > ',
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
    value: 0,
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