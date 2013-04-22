define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.MenuItem", require.toUrl("./MenuItem.html"), 30000);
    }
});