/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/_Widget',
    'Sage/UI/ConditionManager',
    'Sage/UI/SDataLookup',
    'dojo/dom-attr',
    'Sage/UI/Controls/EntityInfoToolTip',
    'dojo/i18n!./nls/Lookup',
    'dojo/text!./templates/Lookup.html',
    'dojo/_base/declare'
],
function (_TemplatedMixin, _WidgetsInTemplateMixin, _Widget, conditionManager, _SDataLookup, domAttr, EntityInfoToolTip, i18nStrings, template, declare) {
    var widget = declare('Sage.UI.Controls.Lookup', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {

        /**
        * @property {string} DOM id of control
        */
        id: 'lookup',

        /**
        * @property {object} SDataLookup configuration object 
        */
        config: null,

        /**
        * @property {object} SDataLookup results object 
        */
        selectedObject: null,

        /**
        * @property {bool} showEntityInfoTooltip 
        */
        showEntityInfoToolTip: false,

        disabled: false,
        required: false,

        allowClearingResult: false,

        //i18n strings...
        buttonToolTip: 'Find',
        closeButtonToolTip: 'Remove',

        //end i18n strings
        _tooltip: false,

        _setSelectedObjectAttr: function (value) {
            this.textbox.value = (value) ? value.$descriptor : '';
            this.selectedObject = value;
            this._onChange(value);
        },

        _getSelectedObjectAttr: function () {
            return this.selectedObject;
        },

        _setShowEntityInfoToolTipAttr: function (showTooltip) {
            this.showEntityInfoToolTip = showTooltip;
            if (!this.domNode) {
                return;
            }
            this._tooltip = (showTooltip) ? this._createToolTip() : false;
        },
        _getShowEntityInfoToolTipAttr: function () {
            return this.showEntityInfoToolTip;
        },
        _createToolTip: function () {
            return new EntityInfoToolTip({
                connectId: [this.domNode],
                position: ['below'],
                entityName: this.config.storeOptions.resourceKind,
                entityId: (this.selectedObject && this.selectedObject['$key']) ? this.selectedObject['$key'] : ''
            });
        },

        _setAllowClearingResultAttr: function (allow) {
            this.allowClearingResult = allow;
            if (allow) {
                dojo.removeClass(this.clearButton, 'display-none');
            } else {
                dojo.addClass(this.clearButton, 'display-none');
            }
        },

        _getAllowClearingResultAttr: function () {
            return this.allowClearingResult;
        },

        _setDisabledAttr: function (value) {
            this.disabled = value;
            domAttr.set(this.focusNode, 'disabled', value);
            this.focusNode.setAttribute("aria-disabled", value);
            if (value) {
                dojo.style(this.clearButton, 'visibility', 'hidden');
                dojo.style(this.clearButton, 'display', 'none');
                dojo.style(this.lookupButton, 'visibility', 'hidden');
                dojo.style(this.lookupButton, 'display', 'none');
            } else {
                dojo.style(this.clearButton, 'visibility', '');
                dojo.style(this.clearButton, 'display', '');
                dojo.style(this.lookupButton, 'visibility', '');
                dojo.style(this.lookupButton, 'display', '');
            }
        },
        _getDisabledAttr: function () {
            return this.disabled;
        },
        _onChange: function (value) {
            if (this._tooltip) {
                this._tooltip.set('entityId', (value && value['$key']) ? value['$key'] : '');
            }
            this.onChange(value);
        },

        /**
        * Fires when lookup results are set or selectedObject is set.
        * @event
        */
        onChange: function (value) {
        },

        // Display properties
        templateString: template,
        widgetsInTemplate: false,

        /**
        *
        * @constructor
        */
        constructor: function (options) {
            this.inherited(arguments);
            dojo.mixin(this, i18nStrings);
        },

        //To force closetooltip
        hideTooltip: function () {
            if (this._tooltip) {
                this._tooltip.close();
            }
        },
        postCreate: function () {
            var self = this;

            dojo.connect(this.lookupButton, 'onclick', this.lookupButton, function () {
                if (!self.get('disabled')) {
                    var lookup = new _SDataLookup(self.config);
                    lookup.doSelected = function (items) {
                        self.set('selectedObject', items[0]);
                        lookup.lookupDialog.hide();
                        //lookup.destroy();
                    };

                    lookup.showLookup();
                    var handle = dojo.connect(lookup.lookupDialog, 'onHide', lookup, function () { dojo.disconnect(handle); this.destroy(); });
                }
            }, true);

            dojo.connect(this.clearButton, 'onclick', null, function () {
                if (!self.get('disabled')) {
                    self.textbox.value = '';
                    self.set('selectedObject', null);
                }
            }, true);
        }
    });

    return widget;
});
