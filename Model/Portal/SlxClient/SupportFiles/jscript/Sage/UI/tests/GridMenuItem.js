define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.GridMenuItem", require.toUrl("./GridMenuItem.html"), 30000);
    }
});