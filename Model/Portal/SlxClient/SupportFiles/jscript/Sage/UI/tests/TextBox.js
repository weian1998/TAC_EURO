define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.TextBox", require.toUrl("./TextBox.html"), 30000);
    }
});