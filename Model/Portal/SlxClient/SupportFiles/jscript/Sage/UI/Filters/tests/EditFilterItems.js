define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Filters.tests.EditFilterItems", require.toUrl("./EditFilterItems.html"), 30000);
    }
});