define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.Data.tests.WritableSDataStore", require.toUrl("./WritableSDataStore.html"), 30000);
    }
});