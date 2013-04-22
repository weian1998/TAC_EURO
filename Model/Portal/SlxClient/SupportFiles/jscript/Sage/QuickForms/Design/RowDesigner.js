define([
    'dojo/string',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dijit/_WidgetBase',
    './Editors/RowBasicPropertyEditor',
    'dojo/i18n!./nls/RowDesigner'
], function(
    string,
    topic,
    declare,
    lang,
    array,
    _WidgetBase,
    RowBasicPropertyEditor,
    localization
) {
    /* todo: non visible designers should not need to inherit from _WidgetBase, but require full attribute support, more than Stateful provides */
    return declare('Sage.QuickForms.Design.RowDesigner', [_WidgetBase], {
        /**
         * The bound entry (from SData) pertaining to the QuickForm.
         */
        entry: null,
        editors: [
            RowBasicPropertyEditor
        ],

        helpTopicName: 'Row_properties',

        displayNameText: 'Row',

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
        }
    });
});