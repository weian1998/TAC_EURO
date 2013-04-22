define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.DateTextBox", require.toUrl("./DateTextBox.html"), 30000);
    }
});