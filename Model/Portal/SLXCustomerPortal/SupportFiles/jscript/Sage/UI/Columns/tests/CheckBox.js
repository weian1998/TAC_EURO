define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Columns.tests.Checkbox", require.toUrl("./Checkbox.html"), 30000);
    }
});