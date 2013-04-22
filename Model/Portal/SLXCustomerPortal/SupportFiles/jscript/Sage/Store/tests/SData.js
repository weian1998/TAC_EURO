define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.Store.tests.SData", require.toUrl("./SData.html"), 30000);
    }
});