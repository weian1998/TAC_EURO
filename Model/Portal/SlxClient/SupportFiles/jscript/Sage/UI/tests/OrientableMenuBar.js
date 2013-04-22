define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.OrientableMenuBar", require.toUrl("./OrientableMenuBar.html"), 30000);
    }
});