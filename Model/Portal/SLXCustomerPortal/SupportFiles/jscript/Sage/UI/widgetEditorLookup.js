/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/form/ValidationTextBox',
    'dijit/form/RadioButton',
    'dijit/form/ComboBox',
    'dojo/data/ItemFileReadStore',
    'dijit/form/NumberTextBox'
],
function (validationTextBox, radioButton, comboBox, itemFileReadStore, numberTextBox) {
    var widget = {};
    widget.txtField = function (context) {
        var simplate  = new Simplate([
            '<div data-dojo-type="dijit.form.ValidationTextBox" id="{%= $.id %}"',
            ' regExp="[^<>;]*" invalidMessage="{%= $.invMess %}" style="width:100%;"></div>'
            ]);
        return simplate.apply(context);
    };

    widget.rdoGroup = function (context) {
        var simplate = new Simplate([
            '<table width="100%"><tr><td align="left" width="50%"><input type="radio" id="{%= $.idOne %}" data-dojo-type="dijit.form.RadioButton"',
            ' value="{%= $.valOne %}" name="{%= $.name %}"/><label for="${idOne}">{%= $.lblOne %}',
            '</label></td><td align="left" width="50%"><input type="radio" id="{%= $.idTwo %}"data-dojo-type="dijit.form.RadioButton"',
            ' value="{%= $.valTwo %}" name="{%= $.name %}"/><label for="{%= $.idTwo %}">{%= $.lblTwo %}',
            '</label></td></tr></table>'
        ]);
        return simplate.apply(context);
    };

    widget.comboField = function (context) {
        var simplate = new Simplate([
            '<input data-dojo-type="dijit.form.ComboBox" id="{%= $.id %}" style="width:100%;"',
            ' required="true" searchAttr="{%= $.searchAttr %}"/>'
        ]);
        return simplate.apply(context);
    };

    widget.numberField = function (context) {
        var simplate = new Simplate([
            '<input data-dojo-type="dijit.form.NumberTextBox" id="{%= $.id %}" style="width:100%;"',
            ' invalidMessage="{%= $.invMess %}"/>'
        ]);
        return simplate.apply(context);
    };
    
    widget.wholeNumberField = function (context) {
        var simplate = new Simplate([
            '<input data-dojo-type="Sage.UI.NumberTextBox" shouldPublishMarkDirty="false" id="{%= $.id %}"',
            ' invalidMessage="{%= $.invMess %}" constraints="{places:0}" style="width:100%;" formatType="Number"/>'
        ]);
        return simplate.apply(context);
    };


    // ToDo: Refactor widgetEditorLookup to widgetEditorInput
    // myEditRow takes whatever dojo type is provided.  
    // Customizer should maintain a unique id and use it to 
    //   access the new dijit. 
    widget._myEditRow = function (context) {
        var simplate = new Simplate([
            '<div data-dojo-type="{%= $.type %}" id="{%= $.id %}" shouldPublishMarkDirty="false" style="height:{%= $.height %};width:100%;" ></div>'
        ]);
        return simplate.apply(context);
    };
    
    Sage.UI.widgetEditorLookup = widget; // TODO: Refactor this
    return widget;
});


