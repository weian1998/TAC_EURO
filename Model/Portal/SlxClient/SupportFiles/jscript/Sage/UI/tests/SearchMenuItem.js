define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.SearchMenuItem", require.toUrl("./SearchMenuItem.html"), 30000);
    }
});