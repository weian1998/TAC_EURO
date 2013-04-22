define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.GroupListConfigurationProvider", require.toUrl("./GroupListConfigurationProvider.html"), 30000);
    }
});