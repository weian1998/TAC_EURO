define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.SummaryDetailPane", require.toUrl("./SummaryDetailPane.html"), 30000);
    }
});