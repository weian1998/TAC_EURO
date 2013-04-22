define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Filters.tests.GroupFilterConfigurationProvider", require.toUrl("./GroupFilterConfigurationProvider.html"), 30000);
    }
});