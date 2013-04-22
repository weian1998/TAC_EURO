define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.PopupMenuItem", require.toUrl("./PopupMenuItem.html"), 30000);
    }
});