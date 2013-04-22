define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.SingleSelectPickList", require.toUrl("./SingleSelectPickList.html"), 30000);
    }
});