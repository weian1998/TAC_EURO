define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.GroupsTitlePaneConfigProvider", require.toUrl("./GroupsTitlePaneConfigProvider.html"), 30000);
    }
});