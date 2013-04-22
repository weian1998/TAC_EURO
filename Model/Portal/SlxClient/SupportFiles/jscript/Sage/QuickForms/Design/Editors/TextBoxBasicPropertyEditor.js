define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-style',
    'dijit/layout/ContentPane',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/Select',
    'dijit/form/CheckBox',
    'Sage/_Templated',
    './_PropertyEditor',
    '../PropertyValueError',
    'dojo/i18n!./nls/TextBoxBasicPropertyEditor'
], function(
    declare,
    lang,
    domStyle,
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
    return declare('Sage.QuickForms.Design.Editors.TextBoxBasicPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.appearanceText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.captionTooltipText %}">',
                        '<label>{%= $.captionText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_caption" data-dojo-attach-event="onChange:_onCaptionChange"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.captionAlignmentTooltipText %}">',
                        '<label>{%= $.captionAlignmentText %}</label>',
                        '<div data-dojo-type="dijit.form.Select" data-dojo-attach-point="_captionAlignment" data-dojo-attach-event="onChange:_onCaptionAlignmentChange">',
                            '{% for (var alignment in $.alignmentText) { %}',
                                '<span value="{%= alignment %}">{%= $.alignmentText[alignment] %}</span>',
                            '{% } %}',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.linesTooltipText %}">',
                        '<label>{%= $.linesText %}</label>',
                        '<div data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-point="_lines" data-dojo-props="constraints:{min:0,max:1000,places:0}" data-dojo-attach-event="onChange:_onLinesChange"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.toolTipTooltipText %}">',
                        '<label>{%= $.toolTipText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_toolTip" data-dojo-attach-event="onChange:_onToolTipChange"></div>',
                    '</div>',
                '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.behaviorText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.isReadOnlyTooltipText %}">',
                        '<label>{%= $.isReadOnlyText %}</label>',
                        '<div data-dojo-type="dijit.form.CheckBox" data-dojo-attach-point="_isReadOnly" data-dojo-attach-event="onChange:_onIsReadOnlyChange"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                '</div>',
            '</fieldset>'
        ]),

        _caption: null,
        _captionAlignment: null,
        _lines: null,
        _isReadOnly: null,
        _tooltip: null,

        //Localization
        titleText: 'Basic',

        appearanceText: 'Appearance',
        behaviorText: 'Behavior',

        captionText: 'Caption:',
        captionTooltipText: 'The label to display on the form for this control.',
        captionAlignmentText: 'Caption Alignment:',
        captionAlignmentTooltipText: 'Justification of the label text.',
        linesText: 'Lines:',
        linesTooltipText: 'Number of lines of text displayed.',
        isReadOnlyText: 'Read Only:',
        isReadOnlyTooltipText: 'Does not allow edits.',
        toolTipText: 'Tooltip:',
        toolTipTooltipText: 'Short help text about control.',
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
            this._lines.set('value', this._designer.get('lines'));
            this._isReadOnly.set('value', this._designer.get('isReadOnly'));
            this._toolTip.set('value', this._designer.get('toolTip'));

            var D = Sage.QuickForms.Design,
                designer = this._designer;
            if(designer instanceof D.PhoneControlDesigner || designer instanceof D.UrlControlDesigner || designer instanceof D.EmailControlDesigner) {
                domStyle.set(this._lines.domNode.parentNode, 'display', 'none');
            }
        },

        _onCaptionChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('caption', value);
        },
        _onCaptionAlignmentChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('captionAlignment', value);
        },
        _onLinesChange: function(value){
            if(this.isSuspended() || !this._lines.isValid()) return;
            this._designer.set('lines', value);
        },
        _onIsReadOnlyChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('isReadOnly', value);
        },
        _onToolTipChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('toolTip', value);
        }
    });
});