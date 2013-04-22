define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.SummaryFormatterScope", require.toUrl("./SummaryFormatterScope.html"), 30000);
    }
});