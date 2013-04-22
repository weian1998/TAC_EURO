define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Dashboard.tests.ChartingWidget", require.toUrl("./ChartingWidget.html"), 30000);
    }
});