define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Columns.tests.Boolean", require.toUrl("./Boolean.html"), 30000);
    }
});