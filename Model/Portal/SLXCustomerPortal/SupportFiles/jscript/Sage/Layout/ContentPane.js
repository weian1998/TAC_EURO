/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/declare',
        'dijit/layout/ContentPane',
        'Sage/Layout/_SplitterEnhancedMixin'
],
function (declare, ContentPane, _SplitterEnhancedMixin) {
    var contentPane = declare('Sage.Layout.ContentPane', [ContentPane, _SplitterEnhancedMixin], { });


    return contentPane;
});