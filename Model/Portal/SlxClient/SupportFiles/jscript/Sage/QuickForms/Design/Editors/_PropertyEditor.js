define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-class',
    '../PropertyValueError',
    'dojo/i18n!./nls/_PropertyEditor'
], function(
    declare,
    lang,
    array,
    domClass,
    PropertyValueError,
    localization)
{
    return declare('Sage.QuickForms.Design.Editors._PropertyEditor', null, {
        _designer: null,
        _suspended: false,

        titleText: 'Properties',
        _setTitleTextAttr: function(value) {
            this.set('title', value);
        },

        designer: null,

        constructor: function() {
            lang.mixin(this, localization);
        },
        buildRendering: function() {
            this.inherited(arguments);

            domClass.add(this.domNode, 'design-property-editor');
        },
        suspend: function() {
            this._suspended = true;
        },
        resume: function() {
            this._suspended = false;
        },
        isSuspended: function() {
            return this._suspended;
        },
        setup: function(designer) {
        },
        _setDesignerAttr: function(value) {
            this.suspend();
            this._designer = value;
            this.setup(value);

            // in order to work around an issue with dijit (firing onChange using setTimeout) we have to
            // set our flag in the same manner in order to ensure it comes *after* setup phase
            // notification events.
            setTimeout(lang.hitch(this, this.resume), 0);
        },
        _getDesignerAttr: function() {
            return this._designer;
        }
    });
});