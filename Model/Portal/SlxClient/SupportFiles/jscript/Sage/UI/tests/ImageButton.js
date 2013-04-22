define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.ImageButton", require.toUrl("./ImageButton.html"), 30000);
    }
});