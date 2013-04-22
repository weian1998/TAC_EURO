define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.SummaryContents", require.toUrl("./SummaryContents.html"), 30000);
    }
});