define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.MenuBar", require.toUrl("./MenuBar.html"), 30000);
    }
});