define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.LogOffButton", require.toUrl("./LogOffButton.html"), 30000);
    }
});