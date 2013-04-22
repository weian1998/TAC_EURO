/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/Dialog',
       'Sage/UI/Controls/DependControl',
       'dojo/_base/declare'
],
function (dialog, dependControl, declare) {
    // Basically just ripped from sage-controls. Removed Ext and YAHOO
    // TODO: Use SData
    var widget = declare('Sage.UI.Controls.DependencyLookup', null, {
        ClientId: '',
        PanelId: '',
        InitCall: null,
        LookupControls: null,
        CurrentIndex : 0,
        AutoPostBack: false,
        panel: null,
        Title: '',
        Size: '',
        constructor: function(clientId, initCall, size, autoPostBack, title) {
            this.ClientId = clientId;
            this.PanelId = clientId + '_Panel';
            this.InitCall = initCall;
            this.LookupControls = [];
            this.CurrentIndex = 0;
            this.Size = size + 'px';
            this.AutoPostBack = autoPostBack;
            this.panel = null;
            this.Title = title;
        },
        CanShow: function() {
            var inPostBack = false;
            if (Sys) {
                var prm = Sys.WebForms.PageRequestManager.getInstance();
                inPostBack = prm.get_isInAsyncPostBack();
            }
            if (!inPostBack) {
                return true;
            } else {
                var id = this.ClientId + '_obj';
                var handler = function () {
                    window[id].Show('');
                }
                Sage.SyncExec.call(handler);
                return false;
            }
        },
        Show: function () {
            if (this.CanShow()) {
                if (this.panel == null) {
                    this.panel = dijit.byId(this.PanelId + '_Dialog');
                    var lookup = dojo.byId(this.PanelId);
                    
                    if(!this.panel) {
                        lookup.style.display = 'block';
                        dojo.place(lookup, dojo.byId('mainform'), 'last');
                        this.panel = new dialog({
                            id: this.PanelId + '_Dialog',
                            content: lookup,
                            title: this.Title || ''
                        });
                        this.panel.startup();
                        dojo.place(this.panel.domNode, dojo.byId('mainform'), 'last');
                        
                    }
                    else {
                        this.panel.setContent(lookup);
                        lookup.style.display = 'block';
                    }
                    
                    if ((this.CurrentIndex == 0) || (this.LookupControls[i] != undefined)) {
                        this.Init();
                    }
                    
                    for (var i = 0; i < this.CurrentIndex; i++) {
                        if (this.LookupControls[i] != undefined) {
                            var text = dojo.byId(this.LookupControls[i].TextId);
                            var seedVal = '';
                            if (i > 0) {
                                seedVal = this.GetSeeds(i);
                            }
                            if ((text.value != '') || (seedVal != '') || (i == 0)) {
                                this.LookupControls[i].CurrentValue = text.value;
                                var listId = this.LookupControls[i].ListId;
                                var list = dojo.byId(listId);
                                if (list.options.length == 0) {
                                    this.LookupControls[i].LoadList(seedVal);
                                }
                            }
                        }
                    }
                }
                this.panel.show();
            }
        },
        AddControl: function (baseId, listId, textId, type, displayProperty, seedProperty) {
            var dependCtrl = new dependControl(baseId, listId, textId, type, displayProperty, seedProperty);
            this.LookupControls[this.CurrentIndex] = dependCtrl;
            this.CurrentIndex++;
        },
        AddFilters: function (FilterProp, FilterValue) {
            var dependCtrl = new dependControl(listId, textId, type, displayProperty, seedProperty);
            this.LookupControls[this.CurrentIndex] = dependCtrl;
            this.CurrentIndex++;
        },
        SelectionChanged: function (index) {
            if ((index + 1) < this.CurrentIndex) {
                this.LookupControls[index + 1].LoadList(this.GetSeeds(index + 1));
                for (var i = index + 2; i < this.CurrentIndex; i++) {
                    this.LookupControls[i].ClearList();
                }
            }
        },
        Ok: function () {
            this.panel.hide();
            for (var i = 0; i < this.CurrentIndex; i++) {
                var text = document.getElementById(this.LookupControls[i].TextId);
                var list = document.getElementById(this.LookupControls[i].ListId);
                if ((list.selectedIndex != undefined) && (list.selectedIndex != -1)) {
                    text.value = list.options[list.selectedIndex].text;
                }
                else {
                    text.value = '';
                }
                this.InvokeChangeEvent(text);
            }
            if (this.AutoPostBack) {
                if (Sys) {
                    Sys.WebForms.PageRequestManager.getInstance()._doPostBack(this.ClientId, null);
                }
                else {
                    document.forms(0).submit();
                }
            }
        },
        Init: function () {
            eval(this.InitCall);
        },
        InvokeChangeEvent: function (cntrl) {
            if (document.createEvent) {
                //FireFox
                var evObj = document.createEvent('HTMLEvents');
                evObj.initEvent('change', true, true);
                cntrl.dispatchEvent(evObj);
            }
            else {
                //IE
                cntrl.fireEvent('onchange');
            }
        },
        GetSeeds: function (index) {
            var result = '';
            for (var i = index; i > 0; i--) {
                var dependParent = this.LookupControls[i - 1];
                var dependChild = this.LookupControls[i];
                var list = dojo.byId(dependParent.ListId);
                if (list.selectedIndex == -1) {
                    return result;
                }
                var seed = list.options[list.selectedIndex];
                result += dependChild.SeedProperty + ',' + seed.text + '|'
            }
            result = result.substr(0, result.length - 1);
            return result;
        },
        close: function () {
            this.panel.hide();
        }
    });

    return widget;
});



