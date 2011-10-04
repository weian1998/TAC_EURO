dojo.provide("Sage.UI.PickList");

dojo.require("dijit._Widget");

dojo.declare("Sage.UI.PickList", dijit._Widget, {
    // summary:
    //  SalesLogix picklist widget.
    //  XXX: maybe this could use a dijit.form.Select instead...

    // name of SLX picklist
    picklistName: "",
    // how are the values stored in the database?
    // id|text|code
    storageMode: "",
    // how are the values to be displayed in the client?
    // id|text|code
    // TODO: need to be able to specify more than 1, eg text + code
    displayMode: "",

    _select: null,

    ////////////////////////////////
    // Widget Lifecycle
    buildRendering: function () {
        this.inherited(arguments);
        var sel = this._select = document.createElement("select");
        sel.innerHTML = "<option value='' selected>";
        this.domNode.appendChild(sel);
        Sage.UI.PickList.fetchPicklistItems(this.picklistName, this.storageMode, this.displayMode, dojo.hitch(this, function (items) {
            //var opts = [{ value: '', label: ''}];
            for (var k in items) {
                var opt = document.createElement("option");
                opt.text = items[k];
                opt.value = k;
                sel.appendChild(opt);
                //opts.push({ value: k, label: items[k] });
            }
            //this.addOption(opts);
        }));
    },

    _getValueAttr: function () {
        return this._select.value;
    },

    _setValueAttr: function (v) {
        this._select.value = v;
    }
});

Sage.UI.PickList.fetchPicklistItems = function (picklistName, storageMode, displayMode, callback) {
    // summary:
    //  Helper function to retrieve a hash of picklist items, indexed by storageMode.
    // storageMode:
    //  id|text|code
    // displayMode:
    //  id|text|code
    // callback:
    //  If provided, this call will be async and the callback will be called with the hash.
    //  If not provided, this call will be synchronous and the data will be returned.

    // XXX: consider moving to a "PickListModel" type of class?

    // XXX: this will not work if invoked from an aspx page inside of a subfolder... 
    // 99% of SLX pages are on top level so should be OK
    // XXX: this service is not sending cache headers... should we implement cache locally?
    var url = "slxdata.ashx/slx/crm/-/picklists/find?name=" + picklistName;
    var result = null;
    
    dojo.xhrGet({
        url: url,
        sync: !callback,
        handleAs: 'json',
        load: function (data) {
            result = {};
            var getPicklistValue = function (mode) {
                switch (mode) {
                    case "id":
                        return function (item) { return item.itemId };
                    case "code":
                        return function (item) { return item.code };
                    case "text":
                        return function (item) { return item.text };
                    default:
                        throw "Invalid picklist mode: " + mode;
                }
            };
            var getText = getPicklistValue(displayMode);
            var getKey = getPicklistValue(storageMode);
            dojo.forEach(data.items, function (item) {
                result[getKey(item)] = getText(item);
            });
            if (callback)
                callback(result);
        }
    });
    return result;
};