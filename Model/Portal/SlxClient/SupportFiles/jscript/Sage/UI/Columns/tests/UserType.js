define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Columns.tests.UserType", require.toUrl("./UserType.html"), 30000);
    }
});