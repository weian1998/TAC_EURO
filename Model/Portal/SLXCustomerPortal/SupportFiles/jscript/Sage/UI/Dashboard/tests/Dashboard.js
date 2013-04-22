define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Dashboard.tests.Dashboard", require.toUrl("./Dashboard.html"), 30000);
    }
});