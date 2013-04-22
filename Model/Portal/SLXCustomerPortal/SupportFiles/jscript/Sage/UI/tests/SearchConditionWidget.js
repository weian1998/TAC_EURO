define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.SearchConditionWidget", require.toUrl("./SearchConditionWidget.html"), 30000);
    }
});