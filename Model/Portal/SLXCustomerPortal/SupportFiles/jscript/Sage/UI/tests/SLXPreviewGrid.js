define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.SLXPreviewGrid", require.toUrl("./SLXPreviewGrid.html"), 30000);
    }
});