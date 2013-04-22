define([
    'dojo/string',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dijit/_WidgetBase',
    './ControlDesignerRegistry',
    './RowDesigner',
    './ColumnDesigner',
    './Editors/FormBasicPropertyEditor',
    './Editors/FormAdvancedPropertyEditor',
    './Editors/FormUsagesPropertyEditor',
    'dojo/i18n!./nls/FormDesigner'
], function(
    string,
    topic,
    declare,
    lang,
    array,
    _WidgetBase,
    ControlDesignerRegistry,
    RowDesigner,
    ColumnDesigner,
    FormBasicPropertyEditor,
    FormAdvancedPropertyEditor,
    FormUsagesPropertyEditor,
    localization
) {
    /* todo: non visible designers should not need to inherit from _WidgetBase, but require full attribute support, more than Stateful provides */
    return declare('Sage.QuickForms.Design.FormDesigner', [_WidgetBase], {
        /**
         * The bound entry (from SData) pertaining to the QuickForm.
         */
        entry: null,
        editors: [
            FormBasicPropertyEditor,
            FormAdvancedPropertyEditor,
            FormUsagesPropertyEditor
        ],

        helpTopicName: 'Form_properties',

        _controls: null,
        _rows: null,
        _columns: null,

        displayNameText: 'Form',

        constructor: function() {
            lang.mixin(this, localization);
        },
        uninitialize: function() {
            this.inherited(arguments);

            array.forEach(this._controls, function(designer) { designer.destroyRecursive(); });
            array.forEach(this._rows, function(designer) { designer.destroyRecursive(); });
            array.forEach(this._columns, function(designer) { designer.destroyRecursive(); });
        },
        set: function(name, value) {
            var result = this.inherited(arguments);

            var names = this._getAttrNames(name),
                setter = this[names.s];

            if (lang.isFunction(setter))
            {
                topic.publish('/quickforms/design/designerModified', this, name, value, result, this);
            }

            return result;
        },
        _getNameAttr: function() {
            return lang.getObject('entity.Name', false, this.entry);
        },
        _setNameAttr: function(value) {
            lang.setObject('entity.Name', value, this.entry);
        },
        _getDescriptionAttr: function() {
            return lang.getObject('entity.Description', false, this.entry);
        },
        _setDescriptionAttr: function(value) {
            lang.setObject('entity.Description', value, this.entry);
        },
        _getActiveControlAttr: function() {
            return lang.getObject('entity.ActiveControl', false, this.entry);
        },
        _setActiveControlAttr: function(value) {
            lang.setObject('entity.ActiveControl', value, this.entry);
        },
        _getUseEntityNameAsTitleAttr: function() {
            return lang.getObject('entity.UseEntityNameAsTitle', false, this.entry);
        },
        _setUseEntityNameAsTitleAttr: function(value) {
            lang.setObject('entity.UseEntityNameAsTitle', value, this.entry);
        },
        _getEtagAttr: function() {
            return lang.getObject('etag', false, this.entry);
        },
        _setEtagAttr: function(value) {
            lang.setObject('etag', value, this.entry);
        },
        _getRowsAttr: function() {
            return this._rows || (this._rows = this._createRowDesigners());
        },
        _getRowCountAttr: function() {
            return this.get('rows').length;
        },
        _createRowDesigners: function() {
            var raw = lang.getObject('entity.Rows', false, this.entry),
                designers = [];

            array.forEach(raw, function(row, index) {
                var designer = new RowDesigner({
                    entry: row,
                    form: this,
                    index: index
                });

                designers.push(designer);
            }, this);

            return designers;
        },
        _getColumnsAttr: function() {
            return this._columns || (this._columns = this._createColumnDesigners());
        },
        _getColumnCountAttr: function() {
            return this.get('columns').length;
        },
        _createColumnDesigners: function() {
            var raw = lang.getObject('entity.Columns', false, this.entry),
                designers = [];

            array.forEach(raw, function(column, index) {
                var designer = new ColumnDesigner({
                    entry: column,
                    form: this,
                    index: index
                });

                designers.push(designer);
            }, this);

            return designers;
        },
        _getControlsAttr: function() {
            return this._controls || (this._controls = this._createControlDesigners());
        },
        _createControlDesigners: function() {
            var raw = lang.getObject('entity.Controls', false, this.entry),
                designers = [];

            array.forEach(raw, function(control) {
                var ctor = ControlDesignerRegistry.getDesignerFor(control);
                if (ctor)
                {
                    var designer = new ctor({
                        entry: control,
                        form: this
                    });

                    designers.push(designer);
                }
                else
                {
                    throw new Error('Could not find designer for type: "' + control['$type'] + '".');
                }
            }, this);

            return designers;
        },
        addControl: function(designer) {
            var designers = this.get('controls'),
                raw = lang.getObject('entity.Controls', false, this.entry) || [];

            designers.push(designer);
            raw.push(designer.get('entry'));

            lang.setObject('entity.Controls', raw, this.entry);
        },
        addRow: function(designer, at) {
            var designers = this.get('rows'),
                raw = lang.getObject('entity.Rows', false, this.entry) || [];

            designer.index = at || designer.index || designers.length;

            for (var i = designer.index; i < designers.length; i++) designers[i].index += 1;

            designers.splice(designer.index, 0, designer);
            raw.splice(designer.index, 0, designer.get('entry'));

            lang.setObject('entity.Rows', raw, this.entry);
        },
        removeRow: function(at) {
            var designers = this.get('rows'),
                raw = lang.getObject('entity.Rows', false, this.entry) || [];

            for (var i = at; i < designers.length; i++) designers[i].index -= 1;

            designers.splice(at, 1);
            raw.splice(at, 1);
        },
        addColumn: function(designer, at) {
            var designers = this.get('columns'),
                raw = lang.getObject('entity.Columns', false, this.entry) || [];

            designer.index = at || designer.index || designers.length;

            for (var i = designer.index; i < designers.length; i++) designers[i].index += 1;

            designers.splice(designer.index, 0, designer);
            raw.splice(designer.index, 0, designer.get('entry'));

            lang.setObject('entity.Columns', raw, this.entry);
        },
        removeColumn: function(at) {
            var designers = this.get('columns'),
                raw = lang.getObject('entity.Columns', false, this.entry) || [];

            for (var i = at; i < designers.length; i++) designers[i].index -= 1;

            designers.splice(at, 1);
            raw.splice(at, 1);
        },
        createUniqueId: function(desired) {
            var lookup = {},
                next = desired,
                count = 1;
            array.forEach(this.get('controls'), function(designer) {
                var id = designer.get('controlId');
                if (next == id)
                {
                    do { next = desired + count++; } while (lookup[next]);
                }
                lookup[id] = true;
            });
            return next;
        }
    });
});