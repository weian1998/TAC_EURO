define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Dashboard.tests.BaseWidget", require.toUrl("./BaseWidget.html"), 30000);
    }
});