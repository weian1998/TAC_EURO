define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.Address", require.toUrl("./Address.html"), 30000);
    }
});