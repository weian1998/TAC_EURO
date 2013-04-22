define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.EntityInfoToolTip", require.toUrl("./EntityInfoToolTip.html"), 30000);
    }
});