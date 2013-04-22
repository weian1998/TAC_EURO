define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.UniqueToListValidationTextBox", require.toUrl("./UniqueToListValidationTextBox.html"), 30000);
    }
});