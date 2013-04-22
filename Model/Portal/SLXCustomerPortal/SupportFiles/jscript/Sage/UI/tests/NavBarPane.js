define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.NavBarPane", require.toUrl("./NavBarPane.html"), 30000);
    }
});