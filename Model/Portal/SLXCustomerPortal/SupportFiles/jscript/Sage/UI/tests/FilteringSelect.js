define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.FilteringSelect", require.toUrl("./FilteringSelect.html"), 30000);
    }
});