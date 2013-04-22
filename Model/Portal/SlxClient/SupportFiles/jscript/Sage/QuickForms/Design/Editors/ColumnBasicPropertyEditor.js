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
    'dojo/i18n!./nls/ColumnBasicPropertyEditor'
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
    return declare('Sage.QuickForms.Design.Editors.ColumnBasicPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.appearanceText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.indexTooltipText %}">',
                        '<label>{%= $.indexText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_index" data-dojo-attach-event="onChange:_onIndexChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.widthTooltipText %}">',
                        '<label>{%= $.widthText %}</label>',
                        '<div data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-point="_width" data-dojo-attach-event="onChange:_onWidthChange" required="true" data-dojo-props="constraints:{min:0}"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.sizeTypeTooltipText %}">',
                        '<label>{%= $.sizeTypeText %}</label>',
                        '<div data-dojo-type="dijit.form.Select" data-dojo-attach-point="_sizeType" data-dojo-attach-event="onChange:_onSizeTypeChange">',
                            '{% for (var type in $.rowSizeTypeText) { %}',
                                '<span value="{%= type %}">{%= $.rowSizeTypeText[type] %}</span>',
                            '{% } %}',
                        '</div>',
                    '</div>',
                '</div>',
            '</fieldset>'
        ]),

        _index: null,
        _width: null,
        _sizeType: null,

        //Localization
        titleText: 'Basic',
        appearanceText: 'Appearance',

        indexText: 'Index:',
        indexTooltipText: 'Number of the row or column, beginning with zero.',
        widthText: 'Width:',
        widthTooltipText: 'Width of this column of controls.',
        sizeTypeText: 'Size Type:',
        sizeTypeTooltipText: 'Method of sizing: Absolute, AutoSize, or Percent.',

        rowSizeTypeText: {
            'Absolute': 'Absolute',
            'Percent': 'Percent',
            'AutoSize': 'AutoSize'
        },

        constructor: function() {
            lang.mixin(this, localization);
        },

        setup: function() {
            this.inherited(arguments);

            this._index.set('value', this._designer.get('index'));
            this._width.set('value', this._designer.get('width'));
            this._sizeType.set('value', this._designer.get('sizeType'));
        },

        _onWidthChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('width', value);
        },
        _onSizeTypeChange: function(value) {
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('sizeType', value);
        },
        _onIndexChange: function(value) {
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('index', value);
        }
    });
});