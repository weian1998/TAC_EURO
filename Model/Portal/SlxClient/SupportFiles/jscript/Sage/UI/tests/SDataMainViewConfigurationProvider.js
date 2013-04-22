define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.SDataMainViewConfigurationProvider", require.toUrl("./SDataMainViewConfigurationProvider.html"), 30000);
    }
});