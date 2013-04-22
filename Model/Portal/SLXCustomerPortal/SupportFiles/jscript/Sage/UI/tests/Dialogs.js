define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.Dialogs", require.toUrl("./Dialogs.html"), 30000);
    }
});