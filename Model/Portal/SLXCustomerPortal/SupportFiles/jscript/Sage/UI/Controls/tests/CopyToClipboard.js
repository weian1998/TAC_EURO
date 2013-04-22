define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.CopyToClipboard", require.toUrl("./CopyToClipboard.html"), 30000);
    }
});