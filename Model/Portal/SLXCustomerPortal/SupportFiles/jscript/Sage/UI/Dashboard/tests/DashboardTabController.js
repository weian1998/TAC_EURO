define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Dashboard.tests.DashboardTabController", require.toUrl("./DashboardTabController.html"), 30000);
    }
});