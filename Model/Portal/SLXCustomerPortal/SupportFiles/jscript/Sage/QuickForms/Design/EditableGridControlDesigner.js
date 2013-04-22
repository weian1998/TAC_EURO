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
    './Editors/GenericBasicPropertyEditor',
    './Editors/GenericAdvancedPropertyEditor',
    'dojo/i18n!./nls/EditableGridControlDesigner'
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
    GenericBasicPropertyEditor,
    GenericAdvancedPropertyEditor,
    localization
) {
    return declare('Sage.QuickForms.Design.EditableGridControlDesigner', [_Widget, _Contained, _Templated, ControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            GenericBasicPropertyEditor,
            GenericAdvancedPropertyEditor,
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
            '<th>{%: $.ColumnHeading || $.Text %}</th>'
        ]),

        fieldClass: 'design-editablegrid',
        helpTopicName: 'visual_control',
        quickFormControlType: 'Sage.SalesLogix.QuickForms.QFControls.SDataGrid.QFSDataGrid, Sage.SalesLogix.QuickForms.QFControls',

        //Localization
        displayNameText: 'Editable Grid',

        constructor: function() {
            lang.mixin(this, localization);
        },
        _getColumnsAttr: function() {
            return lang.getObject('Columns', false, this.entry);
        },
        _setColumnsAttr: function(value) {
            lang.setObject('Columns', value, this.entry);
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

        startup: function() {
            this.inherited(arguments);

            this.renderColumns();
        }
    });
});