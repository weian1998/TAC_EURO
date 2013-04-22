define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/layout/ContentPane',
    'dojox/layout/TableContainer',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'Sage/_Templated',
    './_PropertyEditor',
    '../PropertyValueError',
    'dojo/i18n!./nls/LayoutPropertyEditor'
], function(
    declare,
    lang,
    ContentPane,
    TableContainer,
    TextBox,
    NumberTextBox,
    _Templated,
    _PropertyEditor,
    PropertyValueError,
    localization)
{
    return declare('Sage.QuickForms.Design.Editors.LayoutPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.positionText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.rowTooltipText %}">',
                        '<label>{%= $.rowText %}</label>',
                        '<div data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-point="_row" data-dojo-attach-event="onChange:_onRowChange" required="true" data-dojo-props="constraints:{min:0,max:100,places:0}"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.columnTooltipText %}">',
                        '<label>{%= $.columnText %}</label>',
                        '<div data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-point="_column" data-dojo-attach-event="onChange:_onColumnChange" required="true" data-dojo-props="constraints:{min:0,max:100,places:0}"></div>',
                    '</div>',
                '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.sizeText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.rowSpanTooltipText %}">',
                        '<label>{%= $.rowSpanText %}</label>',
                        '<div data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-point="_rowSpan" data-dojo-attach-event="onChange:_onRowSpanChange" required="true" data-dojo-props="constraints:{min:1,max:100,places:0}"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.columnSpanTooltipText %}">',
                        '<label>{%= $.columnSpanText %}</label>',
                        '<div data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-point="_columnSpan" data-dojo-attach-event="onChange:_onColumnSpanChange" required="true" data-dojo-props="constraints:{min:1,max:100,places:0}"></div>',
                    '</div>',
                '</div>',
            '</fieldset>'
        ]),

        _row: null,
        _column: null,
        _rowSpan: null,
        _columnSpan: null,

        titleText: 'Layout',

        positionText: 'Position',
        sizeText: 'Size',

        rowText: 'Row:',
        rowTooltipText: 'Row number of the control.',
        columnText: 'Column:',
        columnTooltipText: 'Column number of the control.',
        rowSpanText: 'Row Span:',
        rowSpanTooltipText: 'Number of cells the control occupies vertically.',
        columnSpanText: 'Column Span:',
        columnSpanTooltipText: 'Number of cells the control occupies horizontally.',

        constructor: function() {
            lang.mixin(this, localization);
        },
        setup: function() {
            this.inherited(arguments);

            this._row.set('value', this._designer.get('row'));
            this._column.set('value', this._designer.get('column'));
            this._rowSpan.set('value', this._designer.get('rowSpan'));
            this._columnSpan.set('value', this._designer.get('columnSpan'));
        },
        _onRowChange: function(value) {
            if (this.isSuspended() || !this._row.isValid()) return;

            try
            {
                this._designer.set('row', parseInt(value) || 0);
            }
            catch (e)
            {
                this._row.setValue(e.value);

                if (console) {
                    console.error(e.message, e);
                }
            }
        },
        _onColumnChange: function(value) {
            if (this.isSuspended() || !this._column.isValid()) return;

            try
            {
                this._designer.set('column', parseInt(value) || 0);
            }
            catch (e)
            {
                this._column.setValue(e.value);

                if (console) {
                    console.error(e.message);
                }
            }
        },
        _onRowSpanChange: function(value) {
            if (this.isSuspended() || !this._rowSpan.isValid()) return;

            try
            {
                this._designer.set('rowSpan', parseInt(value) || 1);
            }
            catch (e)
            {
                this._rowSpan.setValue(e.value);

                if (console) {
                    console.error(e.message);
                }
            }
        },
        _onColumnSpanChange: function(value) {
            if (this.isSuspended() || !this._columnSpan.isValid()) return;

            try
            {
                this._designer.set('columnSpan', parseInt(value) || 1);
            }
            catch (e)
            {
                this._columnSpan.setValue(e.value);

                if (console) {
                    console.error(e.message);
                }
            }
        }
    });
});