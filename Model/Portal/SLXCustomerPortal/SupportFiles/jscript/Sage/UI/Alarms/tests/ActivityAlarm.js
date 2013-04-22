define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Alarms.tests.ActivityAlarm", require.toUrl("./ActivityAlarm.html"), 30000);
    }
});