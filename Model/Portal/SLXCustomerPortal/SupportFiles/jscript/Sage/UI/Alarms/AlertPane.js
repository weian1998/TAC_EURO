/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/_TemplatedMixin',
       'dijit/_WidgetsInTemplateMixin',
       'dijit/_Widget',
       'dojo/_base/declare'
],
function (_TemplatedMixin, _WidgetsInTemplateMixin, _Widget, declare) {
    var widget = declare('Sage.UI.Alarms.AlertPane', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        constructor: function () {
            this.alertItems = [];
            this.alertWidgets = [];
            this.store = null;
            this._drawn = false;
            this.selectedAlerts = {};
        },
        onShow: function () { },
        _hasDifferentItems: function (items) {
            if (items.length !== this.alertWidgets.length) {
                return true;
            }
            if (this.alertItems.length === items.length) {
                for (var i = 0; i < items.length; i++) {
                    if (this.alertItems[i]['$key'] !== items[i]['$key']) {
                        return true;
                    }
                }
                return false;
            }
            return true;
        },
        _setAlertItemsAttr: function (items, isOpen) {
            if (!this._hasDifferentItems(items)) { return; }
            this.alertItems = items;
            this._drawn = false;
            this.selectedAlerts = {};
            var len = this.alertWidgets.length;
            for (var i = 0; i < len; i++) {
                var wid = this.alertWidgets.pop();
                if (wid.selected) {
                    this.selectedAlerts[wid.key] = 1;
                }
                wid.destroy();
            }
            if (len === 0 && this.alertItems.length > 0) {
                //select the first one...
                this.selectedAlerts[this.alertItems[0]['$key']] = 1;
            }
            //if (isOpen) {
            this._drawAlerts();
            //}
            this._alertChanged(this.alertWidgets.length);
        },
        _ensureOneSelected: function () {
            var len = this.alertWidgets.length - 1;
            //is one already selected
            for (var i = 0; i < len; i++) {
                if (this.alertWidgets[i].get('selected')) {
                    return;
                }
            }
            //nope, select the first...
            if (this.alertWidgets.length > 0) {
                this.alertWidgets[0].set('selected', true);
            }
        },
        _drawAlerts: function () {
            if (this._drawn) {
                return;
            }
            dojo.html.set(this._alertContents, '');
            if (this.alertItems) {
                for (var i = 0; i < this.alertItems.length; i++) {
                    this._addAlert(this.alertItems[i]);
                }
                this._drawn = true;
            }
        },
        getUnhandledAlertCount: function () {
            return this.alertWidgets.length;
        },
        _addAlert: function (alert) { },
        closeTooltips: function () {
            for (var i = 0; i < this.alertWidgets.length; i++) {
                this.alertWidgets[i].closeTooltips();
            }
        },
        _alertChanged: function (count) {
            this._ensureOneSelected();
            this.onAlertChanged(count);
        },
        onAlertChanged: function (count) { }

    });

    return widget;
});
