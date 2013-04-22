define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.CheckBox", require.toUrl("./CheckBox.html"), 30000);
    }
});