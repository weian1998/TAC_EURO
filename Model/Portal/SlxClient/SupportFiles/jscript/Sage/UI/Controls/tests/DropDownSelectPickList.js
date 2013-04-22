define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.DropDownSelectPickList", require.toUrl("./DropDownSelectPickList.html"), 30000);
    }
});