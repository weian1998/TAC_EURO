define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.Phone", require.toUrl("./Phone.html"), 30000);
    }
});