define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.EditorContainer", require.toUrl("./EditorContainer.html"), 30000);
    }
});