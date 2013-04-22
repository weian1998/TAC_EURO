define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.SDataLookup", require.toUrl("./SDataLookup.html"), 30000);
    }
});