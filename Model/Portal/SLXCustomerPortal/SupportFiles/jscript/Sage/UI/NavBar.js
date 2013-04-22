/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/layout/AccordionContainer',
        'Sage/UI/NavBarPane',
        'Sage/Layout/_SplitterEnhancedMixin',
        'dojo/_base/declare'
],
// ReSharper disable InconsistentNaming
function (AccordionContainer, NavBarPane, _SplitterEnhancedMixin, declare) {
    // ReSharper restore InconsistentNaming
    var navBar = declare('Sage.UI.NavBar', [AccordionContainer, _SplitterEnhancedMixin], {
        persist: true,
        postCreate: function () {
            this.inherited(arguments);
            var items = Sage.UI.DataStore.NavBar && Sage.UI.DataStore.NavBar.items;
            if (items) this._processNavCollection(items);
        },

        _processNavCollection: function (items) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                this.addChild(new NavBarPane({
                    title: item.text,
                    items: item.items
                }));
            }
        },
        startup: function () {
            this.inherited(arguments);
            this.domNode.style.overflow = "hidden";
        }
    });

    return navBar;
});