define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Dashboard.tests.DashboardWidget", require.toUrl("./DashboardWidget.html"), 30000);
    }
});