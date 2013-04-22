define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.SimpleTextarea", require.toUrl("./SimpleTextarea.html"), 30000);
    }
});