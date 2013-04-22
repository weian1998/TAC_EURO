define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.widgetEditorLookup", require.toUrl("./widgetEditorLookup.html"), 30000);
    }
});