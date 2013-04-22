define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.JsonPrintDetailPane", require.toUrl("./JsonPrintDetailPane.html"), 30000);
    }
});