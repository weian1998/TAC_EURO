define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Alarms.tests.AlarmCountDown", require.toUrl("./AlarmCountDown.html"), 30000);
    }
});