define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojox/layout/ContentPane',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/Select',
    'dijit/form/CheckBox',
    'Sage/_Templated',
    './_PropertyEditor',
    '../PropertyValueError',
    'dojo/i18n!./nls/RowBasicPropertyEditor'
], function(
    declare,
    lang,
    ContentPane,
    TextBox,
    NumberTextBox,
    Select,
    Checkbox,
    _Templated,
    _PropertyEditor,
    PropertyValueError,
    localization)
{
    return declare('Sage.QuickForms.Design.Editors.RowBasicPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.appearanceText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.indexTooltipText %}">',
                        '<label>{%= $.indexText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_index" data-dojo-attach-event="onChange:_onIndexChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                '</div>',
            '</fieldset>'
        ]),

        _index: null,

        //Localization
        titleText: 'Basic',
        appearanceText: 'Appearance',

        indexText: 'Index:',
        indexTooltipText: 'Number of the row or column, beginning with zero.',

        constructor: function() {
            lang.mixin(this, localization);
        },
        setup: function() {
            this.inherited(arguments);

            this._index.set('value', this._designer.get('index'));
        },

        _onIndexChange: function(value) {
        }
    });
});