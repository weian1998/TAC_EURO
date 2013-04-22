define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Alarms.tests.AlertPane", require.toUrl("./AlertPane.html"), 30000);
    }
});