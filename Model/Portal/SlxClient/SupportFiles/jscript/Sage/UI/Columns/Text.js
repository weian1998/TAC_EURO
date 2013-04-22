/*globals define */
define([
        'dijit/form/TextBox',
        'Sage/UI/SLXPreviewGrid/Filter/_previewGridFilterMixin',
        'dojo/_base/declare'
],
function (textBox, filterMixin, declare) {
    var text = declare("Sage.UI.SLXPreviewGrid.Filter.Text", [textBox, filterMixin], {
        // summary:
        //  a simple free-form text filter.  by default a "contains" search is performed

        postMixInProperties: function () {
            // reset the type to "text" - this overrides any type that is inherited from the column config 
            // (typically the type of grid cell that would be used)
            this.type = 'text';
            this.style = "width: 200px";
            this.inherited(arguments);
        },
        reset: function () {
            this.set('displayedValue', '');
            this.set('value', '');
        }
    });
    return text;
});