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
    'dojo/i18n!./nls/DateTimePickerBasicPropertyEditor'
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
    return declare('Sage.QuickForms.Design.Editors.DateTimePickerBasicPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
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
                    '<div class="editor-field" title="{%= $.displayDateTooltipText %}">',
                        '<label>{%= $.displayDateText %}</label>',
                        '<div data-dojo-attach-point="_displayDate" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onDisplayDateChange"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.displayTimeTooltipText %}">',
                        '<label>{%= $.displayTimeText %}</label>',
                        '<div data-dojo-attach-point="_displayTime" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onDisplayTimeChange"></div>',
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
        _displayDate: null,
        _displayTime: null,
        _isReadOnly: null,
        _toolTip: null,

        //Localization
        titleText: 'Basic',
        appearanceText: 'Appearance',
        behaviorText: 'Behavior',

        captionText: 'Caption:',
        captionTooltipText: 'The label to display on the form for this control.',
        captionAlignmentText: 'Caption Alignment:',
        captionAlignmentTooltipText: 'Justification of the label text.',
        displayDateText: 'Display Date:',
        displayDateTooltipText: 'Display the date portion.',
        displayTimeText: 'Display Time:',
        displayTimeTooltipText: 'Display the time portion.',
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
            this._displayDate.set('value', this._designer.get('displayDate'));
            this._displayTime.set('value', this._designer.get('displayTime'));
            this._isReadOnly.set('value', this._designer.get('isReadOnly'));
            this._toolTip.set('value', this._designer.get('toolTip'));
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
        },
        _onDisplayDateChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('displayDate', value);
        },
        _onDisplayTimeChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('displayTime', value);
        },
        _onIsReadOnlyChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('isReadOnly', value);
        },
        _onToolTipChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('toolTip', value);
        }
    });
});