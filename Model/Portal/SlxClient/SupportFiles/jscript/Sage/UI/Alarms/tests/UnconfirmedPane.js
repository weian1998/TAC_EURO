define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Alarms.tests.UnconfirmedPane", require.toUrl("./UnconfirmedPane.html"), 30000);
    }
});