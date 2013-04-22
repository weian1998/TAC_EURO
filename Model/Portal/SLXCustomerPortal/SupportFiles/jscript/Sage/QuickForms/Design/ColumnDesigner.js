define([
    'dojo/string',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dijit/_WidgetBase',
    './Editors/ColumnBasicPropertyEditor',
    'dojo/i18n!./nls/ColumnDesigner'
], function(
    string,
    topic,
    declare,
    lang,
    array,
    _WidgetBase,
    ColumnBasicPropertyEditor,
    localization
) {
    /* todo: non visible designers should not need to inherit from _WidgetBase, but require full attribute support, more than Stateful provides */
    return declare('Sage.QuickForms.Design.ColumnDesigner', [_WidgetBase], {
        /**
         * The bound entry (from SData) pertaining to the QuickForm.
         */
        entry: null,
        editors: [
            ColumnBasicPropertyEditor
        ],

        helpTopicName: 'Column_properties',

        displayNameText: 'Column',

        constructor: function() {
            lang.mixin(this, localization);
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
        _getWidthAttr: function() {
            return lang.getObject('Width', false, this.entry);
        },
        _setWidthAttr: function(value) {
            lang.setObject('Width', value, this.entry);
        },
        _getSizeTypeAttr: function() {
            return lang.getObject('SizeType', false, this.entry);
        },
        _setSizeTypeAttr: function(value) {
            lang.setObject('SizeType', value, this.entry);
        }
    });
});