define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.GroupTabPane", require.toUrl("./GroupTabPane.html"), 30000);
    }
});