define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests._TitlePaneConfigProvider", require.toUrl("./_TitlePaneConfigProvider.html"), 30000);
    }
});