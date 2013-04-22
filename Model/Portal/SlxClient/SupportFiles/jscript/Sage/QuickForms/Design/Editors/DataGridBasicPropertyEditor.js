define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/layout/ContentPane',
    'dojox/layout/TableContainer',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/Select',
    'dijit/form/CheckBox',
    'Sage/_Templated',
    './_PropertyEditor',
    '../PropertyValueError',
    'dojo/i18n!./nls/DataGridBasicPropertyEditor'
], function(
    declare,
    lang,
    ContentPane,
    TableContainer,
    TextBox,
    NumberTextBox,
    Select,
    Checkbox,
    _Templated,
    _PropertyEditor,
    PropertyValueError,
    localization)
{
    return declare('Sage.QuickForms.Design.Editors.DataGridBasicPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.appearanceText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.captionTooltipText %}">',
                        '<label>{%= $.captionText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_caption" data-dojo-attach-event="onChange:_onCaptionChange"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.captionAlignmentTooltipText %}">',
                        '<label>{%= $.captionAlignmentText %}</label>',
                        '<div data-dojo-type="dijit.form.Select" data-dojo-attach-point="_captionAlignment" data-dojo-attach-event="onChange:_onCaptionAlignmentChange">',
                            '{% for (var alignment in $.alignmentText) { %}',
                                '<span value="{%= alignment %}">{%= $.alignmentText[alignment] %}</span>',
                            '{% } %}',
                        '</div>',
                    '</div>',
                '</div>',
            '</fieldset>',

            '<fieldset style="display:none;"><legend>{%= $.behaviorText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.pageSizeTooltipText %}">',
                        '<label>{%= $.pageSizeText %}</label>',
                        '<div data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-point="_pageSize" data-dojo-attach-event="onChange:_onPageSizeChange" data-dojo-props="constraints:{min:0,max:1000,places:0}"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.resizableColumnsTooltipText %}">',
                        '<label>{%= $.resizableColumnsText %}</label>',
                        '<div data-dojo-type="dijit.form.CheckBox" data-dojo-attach-point="_resizableColumns" data-dojo-attach-event="onChange:_onResizableColumnsChange"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                '</div>',
            '</fieldset>'
        ]),

        _caption: null,
        _captionAlignment: null,
        _pageSize: null,
        _resizableColumns: null,

        //Localization
        titleText: 'Basic',
        appearanceText: 'Appearance',
        behaviorText: 'Behavior',
        dataText: 'Data',

        captionText: 'Caption:',
        captionTooltipText: 'The label to display on the form for this control.',
        captionAlignmentText: 'Caption Alignment:',
        captionAlignmentTooltipText: 'Justification of the label text.',
        pageSizeText: 'Page Size:',
        pageSizeTooltipText: 'The number of grid records to display on a single page.',
        resizableColumnsText: 'Resizable Columns:',
        resizableColumnsTooltipText: 'Allows user to resize columns.',
        alignmentText: {
            'left': 'Left',
            'center': 'Center',
            'right': 'Right'
        },

        constructor: function() {
            lang.mixin(this, localization);
        },

        setup: function() {
            this.inherited(arguments);

            this._caption.set('value', this._designer.get('caption'));
            this._captionAlignment.set('value', this._designer.get('captionAlignment'));
            this._pageSize.set('value', this._designer.get('pageSize'));
            this._resizableColumns.set('value', this._designer.get('resizableColumns'));
        },

        _onCaptionChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('caption', value);
        },
        _onCaptionAlignmentChange: function(value){
            if (this.isSuspended()) {
                return;
            };
            this._designer.set('captionAlignment', value);
        },
        _onPageSizeChange: function(value){
            if (this.isSuspended() || !this._pageSize.isValid()) return;
            this._designer.set('pageSize', value);
        },
        _onResizableColumnsChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('resizableColumns', value);
        }
    });
});