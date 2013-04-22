/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojox/grid/cells/_base',
        'dojo/string',
        'dojo/_base/declare',
        'Sage/Utility/Filters'
],
function (_base, dString, declare, Filters) {
    var widget = declare('Sage.UI.Columns.DataType', _base, {
        constructor: function(){
            this.inherited(arguments);
        },
        formatter: function(val, index) {
            var t = Filters.resolveDataTypeQB(val),
                results = 'string';
            switch (t){
                case 'Integer':
                    results = 'int';
                    break;
                case 'Decimal':
                    results = 'float';
                    break;
                case 'Date/Time':
                    results = 'date';
                    break;
                case 'Memo/Blob':
                    results = 'blob';
                    break;
                case 'String':
                default:
                    results = 'string';
                    break;
                    
            }
            return  dString.substitute('<img src="images/ft_${0}.gif" class="dataTypeColumnDimensions" />', [results]);;
        }
    });

    return widget;
});