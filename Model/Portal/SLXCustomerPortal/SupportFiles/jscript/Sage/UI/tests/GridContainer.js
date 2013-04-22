define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.GridContainer", require.toUrl("./GridContainer.html"), 30000);
    }
});