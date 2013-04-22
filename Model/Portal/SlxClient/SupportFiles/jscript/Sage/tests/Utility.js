define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.tests.Utility", require.toUrl("./Utility.html"), 30000);
    }
});