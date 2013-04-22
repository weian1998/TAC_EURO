define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.SummaryContainer", require.toUrl("./SummaryContainer.html"), 30000);
    }
});