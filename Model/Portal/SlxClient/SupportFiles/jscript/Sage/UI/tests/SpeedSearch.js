define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.SpeedSearch", require.toUrl("./SpeedSearch.html"), 30000);
    }
});