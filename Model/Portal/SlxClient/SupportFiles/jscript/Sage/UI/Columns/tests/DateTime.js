define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Columns.tests.DateTime", require.toUrl("./DateTime.html"), 30000);
    }
});