define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Columns.tests.DataType", require.toUrl("./DataType.html"), 30000);
    }
});