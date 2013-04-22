define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.Lookup", require.toUrl("./Lookup.html"), 30000);
    }
});