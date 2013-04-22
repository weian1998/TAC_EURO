define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Alarms.tests.AlarmPopup", require.toUrl("./AlarmPopup.html"), 30000);
    }
});