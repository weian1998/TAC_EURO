define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Dashboard.tests.DashboardWidgetCell", require.toUrl("./DashboardWidgetCell.html"), 30000);
    }
});