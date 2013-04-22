define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.URL", require.toUrl("./URL.html"), 30000);
    }
});