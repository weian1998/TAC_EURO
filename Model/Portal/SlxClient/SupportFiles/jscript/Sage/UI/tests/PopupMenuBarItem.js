define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.PopupMenuBarItem", require.toUrl("./PopupMenuBarItem.html"), 30000);
    }
});