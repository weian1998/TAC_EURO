define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests._DetailPane", require.toUrl("./_DetailPane.html"), 30000);
    }
});