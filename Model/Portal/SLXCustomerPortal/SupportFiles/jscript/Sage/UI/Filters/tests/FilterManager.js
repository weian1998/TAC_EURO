define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Filters.tests.FilterManager", require.toUrl("./FilterManager.html"), 30000);
    }
});