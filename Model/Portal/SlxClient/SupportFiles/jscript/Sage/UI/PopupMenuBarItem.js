/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'Sage/UI/MenuBarItem',
       'Sage/UI/PopupMenuItem',
       'dojo/_base/declare'
],
function (MenuBarItem, PopupMenuItem, declare) {
    // summary:
    //      Item in a MenuBar like "File" or "Edit", that spawns a submenu when pressed (or hovered)
    return declare("Sage.UI.PopupMenuBarItem", [PopupMenuItem, MenuBarItem], {});
});
