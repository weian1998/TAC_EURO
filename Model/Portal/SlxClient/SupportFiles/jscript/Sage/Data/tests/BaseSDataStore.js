define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.Data.tests.BaseSDataStore", require.toUrl("./BaseSDataStore.html"), 30000);
    }
});