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
    'dojo/i18n!./nls/FormAdvancedPropertyEditor'
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
    return declare('Sage.QuickForms.Design.Editors.FormAdvancedPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.generalText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.useEntityNameAsTitleTooltipText %}">',
                        '<label>{%= $.useEntityNameAsTitleText %}</label>',
                        '<div data-dojo-attach-point="_useEntityNameAsTitle" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onUseEntityNameAsTitleChange"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                '</div>',
            '</fieldset>'
        ]),

        _useEntityNameAsTitle: null,

        //Localization
        titleText: 'Advanced',

        generalText: 'General',

        useEntityNameAsTitleText: 'Use Entity Name As Title:',
        useEntityNameAsTitleTooltipText: 'Use name of current entity in form title.',

        constructor: function() {
            lang.mixin(this, localization);
        },

        setup: function(){
            this.inherited(arguments);

            this._useEntityNameAsTitle.set('value', this._designer.get('useEntityNameAsTitle'));
        },

        _onUseEntityNameAsTitleChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('useEntityNameAsTitle', value);
        }
    });
});