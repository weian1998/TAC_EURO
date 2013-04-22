define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.Data.tests.GroupLayoutSingleton", require.toUrl("./GroupLayoutSingleton.html"), 30000);
    }
});