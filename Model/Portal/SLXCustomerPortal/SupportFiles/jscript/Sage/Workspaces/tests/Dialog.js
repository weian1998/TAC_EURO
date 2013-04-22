/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.Workspaces.tests.Dialog", require.toUrl("./DialogTest.html"), 30000);
    }
});