define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.GroupMenuFmtScope", require.toUrl("./GroupMenuFmtScope.html"), 30000);
    }
});