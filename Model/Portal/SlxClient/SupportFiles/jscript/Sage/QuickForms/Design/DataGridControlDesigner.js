define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'dojo/dom-style',
    'Sage/_Templated',
    'dijit/_Widget',
    'dijit/_Contained',
    './ControlDesigner',
    './Editors/LayoutPropertyEditor',
    './Editors/DataGridBasicPropertyEditor',
    './Editors/DataGridAdvancedPropertyEditor',
    'dojo/i18n!./nls/DataGridControlDesigner'
], function(
    declare,
    array,
    lang,
    domConstruct,
    domStyle,
    _Templated,
    _Widget,
    _Contained,
    ControlDesigner,
    LayoutPropertyEditor,
    DataGridBasicPropertyEditor,
    DataGridAdvancedPropertyEditor,
    localization
) {
    return declare('Sage.QuickForms.Design.DataGridControlDesigner', [_Widget, _Contained, _Templated, ControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            DataGridBasicPropertyEditor,
            DataGridAdvancedPropertyEditor,
            LayoutPropertyEditor
        ],
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div class="{%= $.fieldClass %}" data-dojo-attach-point="containerNode">',
                '<table class="{%= $.fieldClass %}-table" data-dojo-attach-point="tableNode">',
                '</table>',
            '</div>'
        ]),
        tableHeaderTemplate: new Simplate([
            '<th style="width:{%= $.widthStyle %}">{%: $.ColumnHeading || $.Text %}</th>'
        ]),

        fieldClass: 'design-datagrid',
        helpTopicName: 'Data_Grid_control',
        quickFormControlType: 'Sage.SalesLogix.QuickForms.QFControls.QFDataGrid, Sage.SalesLogix.QuickForms.QFControls',

        //Localization
        displayNameText: 'Data Grid',
        emptyTableRowStringText: 'No records match the selection criteria.',

        constructor: function() {
            lang.mixin(this, localization);
        },
        _getDataSourceAttr: function() {
            return lang.getObject('DataSource', false, this.entry);
        },
        _setDataSourceAttr: function(value) {
            lang.setObject('DataSource', value, this.entry);
        },
        _getPageSizeAttr: function() {
            return lang.getObject('PageSize', false, this.entry);
        },
        _setPageSizeAttr: function(value) {
            lang.setObject('PageSize', value, this.entry);
        },
        _getResizableColumnsAttr: function() {
            return lang.getObject('ResizableColumns', false, this.entry);
        },
        _setResizableColumnsAttr: function(value) {
            lang.setObject('ResizableColumns', value, this.entry);
        },
        _getColumnsAttr: function() {
            return lang.getObject('Columns', false, this.entry);
        },
        _setColumnsAttr: function(value) {
            lang.setObject('Columns', value, this.entry);
        },
        _getEmptyTableRowTextAttr: function() {
            return lang.getObject('EmptyTableRowText', false, this.entry);
        },
        _setEmptyTableRowTextAttr: function(value) {
            lang.setObject('EmptyTableRowText', value, this.entry);
        },
        _getExpandableRowsAttr: function() {
            return lang.getObject('ExpandableRows', false, this.entry);
        },
        _setExpandableRowsAttr: function(value) {
            lang.setObject('ExpandableRows', value, this.entry);
        },
        _getRenderVerticalAttr: function() {
            return lang.getObject('RenderVertical', false, this.entry);
        },
        _setRenderVerticalAttr: function(value) {
            lang.setObject('RenderVertical', value, this.entry);
        },
        _getShowSortIconAttr: function() {
            return lang.getObject('ShowSortIcon', false, this.entry);
        },
        _setShowSortIconAttr: function(value) {
            lang.setObject('ShowSortIcon', value, this.entry);
        },

        renderColumns: function(){
            var columns = this.get('columns'),
                row = domConstruct.create('tr');

            for(var i = 0; i < columns.length; i++) {
                var column = lang.clone(columns[i]);

                column.widthStyle = column.Width > 0 ? column.Width + 'em' : 'auto';

                domConstruct.place(this.tableHeaderTemplate.apply(column, this), row, 'last');
            }
            domConstruct.place(row, this.tableNode, 'only');
        },

        setupFor: function(propertyContext){
            this.inherited(arguments);

            this.set('dataSource', null);
            this.set('pageSize', 20);
            this.set('resizableColumns', true);

            this.set('emptyTableRowString', this.emptyTableRowStringText);
            this.set('expandableRows', false);
            this.set('renderVertical', false);
            this.set('showSortIcon', true);
        },
        startup: function() {
            this.inherited(arguments);

            this.renderColumns();
            this.applyVisibility();
        }
    });
});