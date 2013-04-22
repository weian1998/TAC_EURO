define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Alarms.tests.AlarmButton", require.toUrl("./AlarmButton.html"), 30000);
    }
});