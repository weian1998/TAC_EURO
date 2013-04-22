define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Dashboard.tests.WidgetDefinition", require.toUrl("./WidgetDefinition.html"), 30000);
    }
});