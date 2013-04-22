define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.MultiSelectPickList", require.toUrl("./MultiSelectPickList.html"), 30000);
    }
});