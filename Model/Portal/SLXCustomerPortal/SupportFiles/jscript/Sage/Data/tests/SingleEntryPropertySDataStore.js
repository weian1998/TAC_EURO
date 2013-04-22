define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.Data.tests.SingleEntryPropertySDataStore", require.toUrl("./SingleEntryPropertySDataStore.html"), 30000);
    }
});