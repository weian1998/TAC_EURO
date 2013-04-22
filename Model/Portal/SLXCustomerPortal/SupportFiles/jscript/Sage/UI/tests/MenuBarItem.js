define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.MenuBarItem", require.toUrl("./MenuBarItem.html"), 30000);
    }
});