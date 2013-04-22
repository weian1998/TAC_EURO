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
    'dojo/i18n!./nls/GenericBasicPropertyEditor'
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
    return declare('Sage.QuickForms.Design.Editors.GenericBasicPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
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
                '</div>',
            '</fieldset>'
        ]),

        _caption: null,
        _captionAlignment: null,

        //Localization
        titleText: 'Basic',

        appearanceText: 'Appearance',

        captionText: 'Caption:',
        captionTooltipText: 'The label to display on the form for this control.',
        captionAlignmentText: 'Caption Alignment:',
        captionAlignmentTooltipText: 'Justification of the label text.',

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
            }
            this._designer.set('captionAlignment', value);
        }
    });
});