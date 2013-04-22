define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.Name", require.toUrl("./Name.html"), 30000);
    }
});