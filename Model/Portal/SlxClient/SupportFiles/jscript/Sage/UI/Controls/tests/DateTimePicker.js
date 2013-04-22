define(["doh", "require"], function(doh, require){
    if(doh.isBrowser){
        doh.register("Sage.UI.Controls.tests.DateTimePicker", require.toUrl("./DateTimePicker.html"), 30000);
    }
});