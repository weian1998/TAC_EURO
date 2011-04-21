Sage.ToolTipCombo = function (config) {
    Sage.ToolTipCombo.superclass.constructor.call(this, config);
    var dispMode = config.tipDisplayMode || 'quicktip';
    if (dispMode.toLowerCase() == 'inline') {
        this.tpl = config.tpl ||
            '<tpl for="."><div class="x-combo-list-item" id="{' + this.valueField + '}" ext:qtip="{' + config.tooltipField + '}">' +
            '<div style="font-weight:bold">{' + this.displayField + '}</div><div>{' + config.tooltipField + '}</div>' +
            '</div></tpl>';
    } else {
        this.tpl = '<tpl for="."><div class="x-combo-list-item" ext:qtip="{' + this.tooltipField + '}">{' + this.displayField + '}</div></tpl>';
    }
};

Ext.extend(Sage.ToolTipCombo, Ext.form.ComboBox, {});
Ext.reg('tooltipcombo', Sage.ToolTipCombo);