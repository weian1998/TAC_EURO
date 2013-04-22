/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/form/Select',
       'dojo/_base/declare'
],
function (select, declare) {
    var widget = declare('Sage.UI.Controls.Select', [select], {
        _hClickBody: false,
        shouldPublishMarkDirty: true,
        autoPostBack: false,
        maxHeight: dojo.isIE ? 146 : 155,
        postCreate: function () {
            this.connect(this, 'onChange', this.onChanged);
            this.inherited(arguments);
        },
        destroy: function () {
            this.inherited(arguments);
        },
        onClickBody: function (e) {
            if (dojo.isIE >= 9 && this._opened) {
                this.closeDropDown();
            }
        },
        onChanged: function (newValue) {
            if (this.shouldPublishMarkDirty) {
                dojo.publish('Sage/events/markDirty');
            }
            if (this.autoPostBack) {
                __doPostBack(this.id, '');
            }
        },
        closeDropDown: function (/*Boolean*/focus) {
            if (dojo.isIE >= 9 && this._hClickBody) {
                dojo.disconnect(this._hClickBody);
            }
            this.inherited(arguments);
        },
        openDropDown: function () {
            if (dojo.isIE >= 9) {
                // WORKAROUND: Please see http://bugs.dojotoolkit.org/ticket/14408. This issue is still [not] fixed.
                this._hClickBody = dojo.connect(document.body, 'onclick', this, this.onClickBody);
            }
            this.inherited(arguments);
        }
    });

    return widget;
});
