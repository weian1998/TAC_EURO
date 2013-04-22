define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.ListPanel", require.toUrl("./ListPanel.html"), 30000);
    }
});