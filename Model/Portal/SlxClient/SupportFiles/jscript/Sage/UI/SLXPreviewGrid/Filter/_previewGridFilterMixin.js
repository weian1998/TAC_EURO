/*globals define  */
define([
    'dojo/_base/declare'
],
function (declare) {
    return declare('Sage.UI.SLXPreviewGrid.Filter._previewGridFilterMixin', null,
    {
        /////////////////////////////////////
        // Public API
        getQuery: function () {
            var v = this.get('value');
            if (v) {
                return "upper(" + this.field + ") like '%" + v.replace("'", "''").toUpperCase() + "%'";
            }
            return "";
        },

        reset: function () {
            this.set('value', '');
        },

        getState: function () {
            //console.log('returning filter state ' + this.field + ':  {value :' + this.get('value') + ' }');
            return { 'value': this.get('value') };
        },

        applyState: function (state) {
            //console.log('applying filter state ' + this.field + ' ' + state);
            if (state) {
                this.set('value', state['value'] || '');
            }
        }
    });
});