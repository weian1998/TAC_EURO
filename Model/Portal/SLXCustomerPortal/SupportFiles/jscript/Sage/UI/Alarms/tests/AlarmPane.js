define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Alarms.tests.AlarmPane", require.toUrl("./AlarmPane.html"), 30000);
    }
});