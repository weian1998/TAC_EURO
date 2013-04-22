define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.DependencyLookup", require.toUrl("./DependencyLookup.html"), 30000);
    }
});