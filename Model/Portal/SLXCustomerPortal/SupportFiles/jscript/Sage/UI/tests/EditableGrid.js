define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.EditableGrid", require.toUrl("./EditableGrid.html"), 30000);
    }
});