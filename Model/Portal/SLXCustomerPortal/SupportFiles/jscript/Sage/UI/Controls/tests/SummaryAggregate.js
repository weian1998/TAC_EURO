define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.SummaryAggregate", require.toUrl("./SummaryAggregate.html"), 30000);
    }
});