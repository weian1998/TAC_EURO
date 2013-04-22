define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.Data.tests.SingleEntrySDataStore", require.toUrl("./SingleEntrySDataStore.html"), 30000);
    }
});