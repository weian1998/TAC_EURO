define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.ComboBox", require.toUrl("./ComboBox.html"), 30000);
    }
});