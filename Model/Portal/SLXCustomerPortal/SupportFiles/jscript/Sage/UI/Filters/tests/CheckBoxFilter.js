define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Filters.tests.CheckBoxFilter", require.toUrl("./CheckBoxFilter.html"), 30000);
    }
});