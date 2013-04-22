define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.WidgetEditor", require.toUrl("./WidgetEditor.html"), 30000);
    }
});