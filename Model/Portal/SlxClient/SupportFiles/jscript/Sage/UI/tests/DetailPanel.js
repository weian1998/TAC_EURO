define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.DetailPanel", require.toUrl("./DetailPanel.html"), 30000);
    }
});