define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.DurationSelect", require.toUrl("./DurationSelect.html"), 30000);
    }
});