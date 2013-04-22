define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Alarms.tests.UnconfirmedAlarm", require.toUrl("./UnconfirmedAlarm.html"), 30000);
    }
});