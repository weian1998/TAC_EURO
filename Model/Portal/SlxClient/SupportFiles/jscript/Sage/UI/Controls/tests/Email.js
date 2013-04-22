define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.Email", require.toUrl("./Email.html"), 30000);
    }
});