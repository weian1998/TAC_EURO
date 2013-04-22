define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Dashboard.tests.DashboardPage", require.toUrl("./DashboardPage.html"), 30000);
    }
});