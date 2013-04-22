/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/_base/declare'
],
function (declare) {
    var widget = declare('Sage.UI.Controls.DependControl', null, {
        BaseId: '',
        ListId: '',
        TextId: '',
        Type: '',
        DisplayProperty: '',
        SeedProperty: '',
        CurrentValue: '',

        constructor: function(baseId, listId, textId, type, displayProperty, seedProperty){
            this.BaseId = baseId;
            this.ListId = listId;
            this.TextId = textId;
            this.Type = type;
            this.DisplayProperty = displayProperty;
            this.SeedProperty = seedProperty;
            this.CurrentValue = '';
        },
        LoadList: function (seedValue) {
            var requestUrl = 'SLXDependencyHandler.aspx';
            dojo.xhrGet({
                url: requestUrl,
                handleAs: 'text',
                preventCache: true,
                sync: true,
                content: {
                    cacheid: this.BaseId,
                    type: this.Type,
                    displayprop: this.DisplayProperty,
                    seeds: seedValue,
                    currentval: this.CurrentValue
                },
                load: dojo.hitch(this, function(data) {
                    var list = dojo.byId(this.ListId);
                    list.innerHTML = '';

                    var items = data.split('|');
                    for (var i = 0; i < items.length; i++) {
                        if (items[i] === '') {
                            continue;
                        }

                        var parts = items[i].split(',');
                        var oOption = document.createElement('OPTION');
                        list.options.add(oOption);

                        if (parts[0].charAt(0) == '@') {
                            parts[0] = parts[0].substr(1);
                            oOption.selected = true;
                        }

                        oOption.innerHTML = parts[1];
                        oOption.value = parts[0];
                    }
                }),
                error: function(error) { console.error(error); }
            });
        },
        ClearList: function () {
            var list = dojo.byId(this.ListId);
            list.innerHTML = '';
        }
    });

    return widget;
});
