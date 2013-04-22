define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.PickList", require.toUrl("./PickList.html"), 30000);
    }
});