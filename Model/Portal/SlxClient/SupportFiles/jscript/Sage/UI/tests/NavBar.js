define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.NavBar", require.toUrl("./NavBar.html"), 30000);
    }
});