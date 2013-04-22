/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojox/grid/cells/_base',
    'dojo/_base/declare'
],
function (cellsBase, declare) {
    var widget = declare('Sage.UI.Columns.RadioGroup', dojox.grid.cells.AlwaysEdit, {
            // summary:
            // grid cell that provides a set of radio buttons that are always available for editing
            options: null,
            values: null,
            labels: [],
            constructor: function(inCell) {
            //if they only provide options, we use them as the values...
            this.values = this.values || this.options;
            if (this.labels && this.labels.length > 0) {
                var caption = ['<table style="width:100%"><tr>'];
                for (var i = 0; i < this.labels.length; i++) {
                    caption.push('<td style="text-align: center;">' + this.labels[i] + '</td>');
                }
                this.name = caption.join('');
            }
        },
            formatEditing: function(inData, inRowIndex) {
            //console.log('formatting the Access column... ' + inData + " ... " + inRowIndex);
            var markup = ['<table style="width:100%"><tr>'];

            for (var i = 0; i < this.values.length; i++) {
                markup.push([
                    '<td style="text-align: center;">',
                    '<input type="radio"',
                    ' id="' + this.values[i] + "_" + inRowIndex + '"',
                    ' name="' + this.field + "_" + inRowIndex + '"',
                    ' value="' + this.values[i] + '"',
                    inData === this.values[i] ? ' checked="checked" />' : ' />'
                    ].join(''));
            }
            markup.push('</tr></table>');
            return markup.join('');
        },
        doclick: function(e) {
            if (e.target.tagName === 'INPUT') {
                var editMgr = this.grid.edit;
                editMgr.applyCellEdit(e.target.value, this, e.rowIndex);
            }
        }
        });
        return widget;
    });