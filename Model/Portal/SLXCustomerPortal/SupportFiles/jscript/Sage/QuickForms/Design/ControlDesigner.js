define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'require',
    'dojo/string',
    'dojo/topic',
    'dojo/dom-class',
    'dojo/query',
    'dijit/_Contained',
    './PropertyValueError',
    'dojo/NodeList-traverse',
    'dojo/i18n!./nls/ControlDesigner'

], function(
    declare,
    lang,
    array,
    require,
    string,
    topic,
    domClass,
    query,
    _Contained,
    PropertyValueError,
    nodeListTraverse,
    localization
) {
    return declare('Sage.QuickForms.Design.ControlDesigner', [_Contained], {
        /**
         * Meta-data for design.
         */
        designSupport: {
            visible: true
        },
        /**
         * True to enable design surface validation of properties.
         */
        _checked: true,
        /**
         * The bound entry (from SData) pertaining to the QuickForm control.
         */
        entry: null,
        editors: null,
        form: null,
        helpTopicName: '',

        /* default values (set to false-y to prevent base overrides from being set) */
        column: 0,
        row: 0,

        /**
         * Control Name to be shown in Control Type select
         */
        displayNameText: null,

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
        _isOnDesignSurface: function() {
            /* todo: messy way to break circular dependency for type checking */
            var surfaceType = this._surfaceType || (this._surfaceType = require('./DesignSurface'));
            var parent = this.getParent();

            return (parent && parent.isInstanceOf(surfaceType));
        },
        /* These functions map between the control designer and the QuickForm entry */
        _getControlIdAttr: function() {
            return lang.getObject('ControlId', false, this.entry);
        },
        _setControlIdAttr: function(value) {
            lang.setObject('ControlId', value, this.entry);
        },
        _getCaptionAttr: function() {
            return lang.getObject('Caption', false, this.entry);
        },
        _setCaptionAttr: function(value) {
            lang.setObject('Caption', value, this.entry);
        },
        _getCaptionAlignmentAttr: function() {
            return lang.getObject('CaptionAlignment', false, this.entry);
        },
        _setCaptionAlignmentAttr: function(value) {
            lang.setObject('CaptionAlignment', value, this.entry);
            this.applyCaptionAlignment(value);
        },
        _getControlNameAttr: function() {
            return this.displayNameText;
        },
        _getEnabledAttr: function() {
            return lang.getObject('Enabled', false, this.entry);
        },
        _setEnabledAttr: function(value) {
            lang.setObject('Enabled', value, this.entry);
        },
        _getFormAttr: function(){
            return this.form;
        },
        _getIsReadOnlyAttr: function() {
            return lang.getObject('IsReadOnly', false, this.entry);
        },
        _setIsReadOnlyAttr: function(value) {
            lang.setObject('IsReadOnly', value, this.entry);
        },
        _getToolTipAttr: function() {
            return lang.getObject('ToolTip', false, this.entry);
        },
        _setToolTipAttr: function(value) {
            lang.setObject('ToolTip', value, this.entry);
        },
        _getVisibleAttr: function() {
            return lang.getObject('Visible', false, this.entry);
        },
        _setVisibleAttr: function(value) {
            lang.setObject('Visible', value, this.entry);
            this.applyVisibility(value);
        },
        _getRowAttr: function() {
            return lang.getObject('Row', false, this.entry);
        },
        _setRowAttr: function(value) {
            if (value === this.get('row')) {
                return;
            }

            if (this._checked && this._isOnDesignSurface())
            {
                var result = this.getParent().validateMove(this, value, this.get('column'));
                if (result) throw new PropertyValueError(result, this.get('row'));
            }

            if (this._checked && this._isOnDesignSurface())
            {
                this.getParent().moveWidget(this, value, this.get('column'));
            }
            else
            {
                lang.setObject('Row', value, this.entry);
            }
        },
        _getRowSpanAttr: function() {
            return lang.getObject('RowSpan', false, this.entry);
        },
        _setRowSpanAttr: function(value) {
            if (value === this.get('rowSpan')) return;

            if (this._checked && this._isOnDesignSurface())
            {
                var result = this.getParent().validateSize(this, value, this.get('columnSpan'));
                if (result) throw new PropertyValueError(result, this.get('rowSpan'));
            }

            lang.setObject('RowSpan', value, this.entry);

            // todo: move the designer to it's current position in order to push other designers down

            if (this._checked && this._isOnDesignSurface()) this.getParent().layout(true);
        },
        _getColumnAttr: function() {
            return lang.getObject('Column', false, this.entry);
        },
        _setColumnAttr: function(value) {
            if (value === this.get('column')) return;

            if (this._checked && this._isOnDesignSurface())
            {
                var result = this.getParent().validateMove(this, this.get('row'), value);
                if (result) throw new PropertyValueError(result, this.get('column'));
            }

            if (this._checked && this._isOnDesignSurface())
            {
                this.getParent().moveWidget(this, this.get('row'), value);
            }
            else
            {
                lang.setObject('Column', value, this.entry);
            }
        },
        _getColumnSpanAttr: function() {
            return lang.getObject('ColumnSpan', false, this.entry);
        },
        _setColumnSpanAttr: function(value) {
            if (value === this.get('columnSpan')) return;

            if (this._checked && this._isOnDesignSurface())
            {
                var result = this.getParent().validateSize(this, this.get('rowSpan'), value);
                if (result) throw new PropertyValueError(result, this.get('columnSpan'));
            }

            lang.setObject('ColumnSpan', value, this.entry);

            if (this._checked && this._isOnDesignSurface()) this.getParent().layout(true);
        },
        _getDataBindingsAttr: function() {
            return lang.getObject('DataBindings', false, this.entry);
        },
        _setDataBindingsAttr: function(value) {
            lang.setObject('DataBindings', value, this.entry);
        },
        findDataBinding: function(predicate) {
            var bindings = this.get('dataBindings');
            if (bindings)
            {
                for (var i = 0; i < bindings.length; i++)
                {
                    if (predicate && predicate(bindings[i])) return bindings[i];
                }
            }
            return null;
        },
        unchecked: function(fn) {
            this._checked = false;
            try
            {
                fn.call(this, this);
            }
            finally
            {
                this._checked = true;
            }
        },
        applyCaptionAlignment: function(alignment){
            if (!this.designCaptionNode || !this.fieldClass) return;

            alignment = alignment || this.get('captionAlignment');

            domClass.remove(this.designCaptionNode, string.substitute('${0}-left ${0}-center ${0}-right', [this.fieldClass+'-caption']));
            domClass.add(this.designCaptionNode, string.substitute('${0}-caption-${1}', [this.fieldClass, alignment]));
        },
        applyVisibility: function(visible) {
            if (!(this.containerNode)) return;

            if (typeof visible === 'undefined')
                visible = this.get('visible');

            domClass.toggle(this.containerNode, 'design-visible-false', !visible);
        },
        setupFor: function(propertyContext) {
            this.entry = {
                '$type': this.quickFormControlType, /* this is REQUIRED by the serializer (sdata side) be the first property */
                'Row': 0,
                'RowSpan': 1,
                'Column': 0,
                'ColumnSpan': 1
            };

            this.set('caption', propertyContext['displayName']);
            this.set('captionAlignment', 'left');
            this.set('controlId', this.form.createUniqueId(propertyContext['propertyName']));
            this.set('controlLabelPlacement', 'left');
            this.set('enabled', true);
            this.set('isReadOnly', false);
            this.set('toolTip', '');
            this.set('visible', true);
        }
    });
});