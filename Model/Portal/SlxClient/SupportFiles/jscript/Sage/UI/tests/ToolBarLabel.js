define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.ToolBarLabel", require.toUrl("./ToolBarLabel.html"), 30000);
    }
});