/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        "dojo/i18n",
        'dijit/form/Button',
        'dojo/_base/declare'
],
function (i18n, button, declare) {
    //dojo.requireLocalization("dijit", "common");
    var widget = declare('Sage.UI.EditorContainer', null, {
        constructor: function (config) {
            dojo.safeMixin(this, config);
            dojo.mixin(this, i18n.getLocalization("dijit", "common"));
        },
        textCell: new Simplate('<td class="editor-text">{%= $[0] %}</td>'),
        textCellWithLoading: new Simplate('<td class="editor-text">{%= $.label %}<span style="display:none; float:right;" id="{%= $.id %}_loading">{%= $.loadingLabel %}</span></td>'),
        ctrlCell: new Simplate('<td class="editor-ctrl">{%= $[0] %}</td>'),
        rowTpl: new Simplate('<tr>{%= $.cells %}</tr>'),
        btnRow: new Simplate('<tr><td></td><td id="{%= $.id %}_editor_tools"><table width="100%"><tr><td id="{%= $.id %}_custom_tools" align="left"></td><td align="right">{%= $.btn %}</td></tr></table></td></tr>'),
        tableTpl: new Simplate([
            '<table class="editor-table">',
            '<tbody>{%= $.rows %}</tbody></table>'
        ]),
        // add the listeners after parsing
        btnOk: new Simplate([
            '<button style="align:right;" data-dojo-type="dijit.form.Button" type="button"',
            ' id="{%= $.id %}_btnOK" title="{%= $.buttonOk %}">{%= $.buttonOk %}</button>'
        ]),
        btnCancel: new Simplate([
            '<button style="align:right;" data-dojo-type="dijit.form.Button" type="button"',
            ' id="{%= $.id %}_btnCancel" title="{%= $.buttonCancel %}">{%= $.buttonCancel %}</button>'
        ]),
        doTemplate: function () {
            // cycle through editorFields and put
            // the markup together
            var _rows = [];
            // TODO if order is a problem use Sage.Iterator
            for (var p in this.rows) {
                if (this.rows.hasOwnProperty(p)) {
                    var _cells = [];
                    if(this.rows[p].loading) {
                        _cells.push(this.textCellWithLoading.apply({label: this.rows[p].title, id: this._pcid, loadingLabel: this.rows[p].loading}),
                            this.ctrlCell.apply([this.rows[p].control]));
                    }
                    else {
                    _cells.push(this.textCell.apply([this.rows[p].title]),
                        this.ctrlCell.apply([this.rows[p].control]));
                    }
                    _rows.push(this.rowTpl.apply({ cells: _cells.join('') }));
                }
            }
            // push in the buttons
            var btns = [
                this.btnOk.apply({
                    id: this._pcid,
                    buttonOk: this.buttonOk
                }),
                this.btnCancel.apply({
                    id: this._pcid,
                    buttonCancel: this.buttonCancel
                })
            ];
            _rows.push(this.btnRow.apply({ btn: btns.join(''), id: this._pcid }));
            return this.tableTpl.apply({ rows: _rows.join('') });
        }
    });
    
    return widget;
});