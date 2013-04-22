define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.ConditionManager", require.toUrl("./ConditionManager.html"), 30000);
    }
});