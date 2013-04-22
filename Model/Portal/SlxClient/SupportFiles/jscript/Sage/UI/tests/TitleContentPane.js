define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.tests.TitleContentPane", require.toUrl("./TitleContentPane.html"), 30000);
    }
});