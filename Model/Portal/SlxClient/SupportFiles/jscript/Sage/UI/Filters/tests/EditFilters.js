define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Filters.tests.EditFilters", require.toUrl("./EditFilters.html"), 30000);
    }
});