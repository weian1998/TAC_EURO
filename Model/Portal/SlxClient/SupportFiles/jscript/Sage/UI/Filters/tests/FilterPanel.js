define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Filters.tests.FilterPanel", require.toUrl("./FilterPanel.html"), 30000);
    }
});