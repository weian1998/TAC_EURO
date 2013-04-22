define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/layout/ContentPane',
    'dojox/layout/TableContainer',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/Select',
    'Sage/_Templated',
    './_PropertyEditor',
    '../PropertyValueError',
    'dojo/i18n!./nls/DataGridAdvancedPropertyEditor'
], function(
    declare,
    lang,
    ContentPane,
    TableContainer,
    TextBox,
    NumberTextBox,
    Select,
    _Templated,
    _PropertyEditor,
    PropertyValueError,
    localization)
{
    return declare('Sage.QuickForms.Design.Editors.DataGridAdvancedPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.appearanceText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.renderVerticalTooltipText %}">',
                        '<label>{%= $.renderVerticalText %}</label>',
                        '<div data-dojo-type="dijit.form.CheckBox" data-dojo-attach-point="_renderVertical" data-dojo-attach-event="onChange:_onRenderVerticalChange"></div>',
                    '</div>',
                    '<div class="editor-field" style="display:none;" title="{%= $.showSortIconTooltipText %}">',
                        '<label>{%= $.showSortIconText %}</label>',
                        '<div data-dojo-type="dijit.form.CheckBox" data-dojo-attach-point="_showSortIcon" data-dojo-attach-event="onChange:_onShowSortIconChange"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.visibleTooltipText %}">',
                        '<label>{%= $.visibleText %}</label>',
                        '<div data-dojo-attach-point="_visible" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onVisibleChange"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.behaviorText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.emptyTableRowTooltipText %}">',
                        '<label>{%= $.emptyTableRowText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_emptyTableRowString" data-dojo-attach-event="onChange:_onEmptyTableRowStringChange"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.expandableRowsTooltipText %}">',
                        '<label>{%= $.expandableRowsText %}</label>',
                        '<div data-dojo-type="dijit.form.CheckBox" data-dojo-attach-point="_expandableRows" data-dojo-attach-event="onChange:_onExpandableRowsChange"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.dataText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.dataSourceTooltipText %}">',
                        '<label>{%= $.dataSourceText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_dataSource" data-dojo-attach-event="onChange:_onDataSourceChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
            '<div class="editor-content-half">',
            '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.controlInfoText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.controlIdTooltipText %}">',
                        '<label>{%= $.controlIdText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_controlId" data-dojo-attach-event="onChange:_onControlIdChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.controlTypeTooltipText %}">',
                        '<label>{%= $.controlTypeText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_controlType" data-dojo-attach-event="onChange:_onControlTypeChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
            '</fieldset>'
        ]),

        _controlId: null,
        _controlType: null,
        _dataSource: null,
        _emptyTableRowString: null,
        _expandableRows: null,
        _renderVertical: null,
        _showSortIcon: null,
        _visible: null,

        //Localization
        titleText: 'Advanced',

        appearanceText: 'Appearance',
        behaviorText: 'Behavior',
        controlInfoText: 'Control Info',
        dataText: 'Data',

        controlIdText: 'Control Id:',
        controlIdTooltipText: 'Identifier for this control.',
        controlTypeText: 'Control Type:',
        controlTypeTooltipText: 'Sage SalesLogix control type.',
        dataSourceText: 'Data Source:',
        dataSourceTooltipText: 'Source of the data for this control such as another control or an entity.',
        emptyTableRowText: 'Empty Table Row Text:',
        emptyTableRowTooltipText: 'Text to display if grid shows no data.',
        expandableRowsText: 'Expandable Rows:',
        expandableRowsTooltipText: 'Allows user to expand grid rows to show more text.',
        renderVerticalText: 'Render Vertically:',
        renderVerticalTooltipText: 'Show grid rows as columns.',
        showSortIconText: 'Show Sort Icon:',
        showSortIconTooltipText: 'Show sort icon on columns that are sortable.',
        visibleText: 'Visible:',
        visibleTooltipText: 'Show or hide this control on the form.',

        constructor: function() {
            lang.mixin(this, localization);
        },

        setup: function(){
            this.inherited(arguments);

            this._controlType.set('value', this._designer.get('controlName'));
            this._controlId.set('value', this._designer.get('controlId'));
            this._dataSource.set('value', this._designer.get('dataSource'));
            this._emptyTableRowString.set('value', this._designer.get('emptyTableRowText'));
            this._expandableRows.set('value', this._designer.get('expandableRows'));
            this._renderVertical.set('value', this._designer.get('renderVertical'));
            this._showSortIcon.set('value', this._designer.get('showSortIcon'));
            this._visible.set('value', this._designer.get('visible'));
        },

        _onControlTypeChange: function(value){
        },
        _onControlIdChange: function(value){
        },
        _onDataSourceChange: function(value){
        },
        _onEmptyTableRowStringChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('emptyTableRowText', value);
        },
        _onExpandableRowsChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('expandableRows', value);
        },
        _onRenderVerticalChange: function(value){
            if (this.isSuspended()) {
                return;
            }
            this._designer.set('renderVertical', value);
        },
        _onShowSortIconChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('showSortIcon', value);
        },
        _onVisibleChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('visible', value);
        }
    });
});