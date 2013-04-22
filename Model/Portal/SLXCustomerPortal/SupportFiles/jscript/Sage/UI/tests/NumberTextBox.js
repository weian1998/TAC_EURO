define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.NumberTextBox", require.toUrl("./NumberTextBox.html"), 30000);
    }
});