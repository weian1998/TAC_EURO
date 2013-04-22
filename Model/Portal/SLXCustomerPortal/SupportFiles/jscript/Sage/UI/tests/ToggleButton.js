define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.ToggleButton", require.toUrl("./ToggleButton.html"), 30000);
    }
});