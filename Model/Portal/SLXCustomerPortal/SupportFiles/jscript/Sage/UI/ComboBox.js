/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/form/ComboBox',
       'dojo/currency',
       'dojo/_base/declare'
],
function (comboBox, currency, declare) {
    var widget = declare("Sage.UI.ComboBox", [comboBox], {
        _hClickBody: false,
        maxHeight: dojo.isIE ? 160 : 170,
        shouldPublishMarkDirty: true,
        //.Net control behavior
        autoPostBack: false,
        _onKeyPress: function (e) {
            //ToDo: Enable option to allow free text
            //ToDo: Fix tab out option to auto complete on elements that do not allow free text.
            // if (option to allow free text (i.e. picklist) === false) {
            //if (e.constructor.DOM_VK_DOWN !== e.charOrCode && e.constructor.DOM_VK_IP !== e.charOrCode) {
            dojo.stopEvent(e);
            //}
            // }
        },
        postCreate: function () {
            this.connect(this, 'onChange', this.onChanged);
            this.inherited(arguments);
        },
        onChanged: function (e) {
            if (this.shouldPublishMarkDirty) {
                dojo.publish("Sage/events/markDirty");
            }
            if (this.autoPostBack) {
                __doPostBack(this.id, '');
            }
        },
        onClickBody: function (e) {
            if (dojo.isIE >= 9 && this._opened) {
                var obj = dijit.getEnclosingWidget(e.target);
                if (obj && obj === this) {
                    /* Fixes a bug in dijit.form.ComboBox where the document.body onclick
                    event will get called when the mouse is over the dropdown button.
                    The dojo control handles the event OK so there is no need to call
                    this.closeDropDown() in this scenario (IE9).             
                    */
                    return;
                }
                this.closeDropDown();
            }
        },
        closeDropDown: function (/*Boolean*/focus) {
            if (dojo.isIE >= 9 && this._hClickBody) {
                dojo.disconnect(this._hClickBody);
                this._hClickBody = false;
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
