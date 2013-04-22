define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests._DialogLoadingMixin", require.toUrl("./_DialogLoadingMixin.html"), 30000);
    }
});