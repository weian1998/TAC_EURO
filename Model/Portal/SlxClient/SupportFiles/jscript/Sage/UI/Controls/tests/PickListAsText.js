define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.PickListAsText", require.toUrl("./PickListAsText.html"), 30000);
    }
});