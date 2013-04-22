define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.Currency", require.toUrl("./Currency.html"), 30000);
    }
});