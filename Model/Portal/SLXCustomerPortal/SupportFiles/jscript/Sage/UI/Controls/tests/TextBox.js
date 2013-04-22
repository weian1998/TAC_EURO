define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.TextBox", require.toUrl("./TextBox.html"), 30000);
    }
});