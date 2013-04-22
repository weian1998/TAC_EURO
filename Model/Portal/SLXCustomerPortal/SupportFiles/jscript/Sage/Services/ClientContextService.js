/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/_base/declare'
],
function (declare) {
    var widget = declare('Sage.Services.ClientContextService', null, {
        // summary:
        //      This service provides a place to pass contextual information from the client to the server or server to client.  
        //      The service itself is quite simple; the power of this service is knowing its contents.  The following is a 
        //      list ofthings that are usually avaiable from this service:
        //      -userID : (always available) Contains the user ID of the currently logged in user.
        //      -userPrettyName : (always available) Contains the formatted name of the currently logged in user.
        //      -userDateFmtStr : (always available) Contains the date formatstring based on the language setting of the browser.
        //      -userTimeFmtStr : (always available) Contains the time formatstring based on the language setting of the browser.
        //      -ClientEntityId : (available in detail mode of entity pages) Contains the id of the entity currently being edited in the detail view.
        //      -PreviousEntityId : (available on the server during postbacks specifically for changing to a new entity) Contains the id of the entity we are moving from.  The use of this context key alerts various workitems on the server that the current postback is one in which the current entity is changing.  The context should change from the 'previous entity' to the one identified by "ClientEntityId".
        // example:
        //  |   //This is some server side code (C# - The types are fully qualified here for clarity):
        //  |   Sage.Platform.WebPortal.Services.ClientContextService contextService = PageWorkItem.Services.Get<Sage.Platform.WebPortal.Services.ClientContextService>();
        //  |   if (contextService.CurrentContext.ContainsKey("Foo")) {
        //  |       contextService.CurrentContext["Foo"] = "Bar";
        //  |   } else {
        //  |       contextService.CurrentContext.Add("Foo", "Bar");
        //  |   }
        //  |   
        //  |   //Now some javascript running in the browser can have code like this to show the value of "Foo":
        //  |   var context = Sage.Services.getService("ClientContextService");
        //  |   if (context && context.containsKey("Foo")) {
        //  |       alert("Foo is: " + context.getValue("Foo"));
        //  |   }
        // example:
        //  |   //This JavaScript example gets the currently logged in user's name and shows a personalized message:
        //  |   var contextservice = Sage.Services.getService("ClientContextService");
        //  |   if (contextservice.containsKey("userPrettyName")) {
        //  |       alert("Hello, " + contextservice.getValue("userPrettyName") + " how are you today?");
        //  |   } else {
        //  |       alert("Hello, how are you today?");
        //  |   }

        contextDataFieldId: false,
        _items: [],
        _watches: [],
        constructor: function (opts) {
            dojo.mixin(this, opts);
            this.load();
        },

        //Internal Helper Methods
        _toItemLiteral: function (key, value) {
            var newItem = {};
            newItem.itemKey = key;
            newItem.itemVal = value;
            return newItem;
        },
        _indexOf: function (key) {
            for (var i = 0; i < this._items.length; i++) {
                if (this._items[i].itemKey == key) {
                    return i;
                }
            }
            return -1;
        },
        _indexOfNoCase: function (key) {
            for (var i = 0; i < this._items.length; i++) {
                if (this._items[i].itemKey.toUpperCase() == key.toUpperCase()) {
                    return i;
                }
            }
            return -1;
        },
        _throwKeyNotFound: function (key) {
            throw "Entry Not Found: " + key;
        },
        _throwDuplicateKey: function (key) {
            throw "Entry Already Exists: " + key;
        },

        //public methods...
        add: function (key, value) {
            // summary:
            //      Adds an item to the context dictionary.
            if (this._indexOf(key) === -1) {
                var lit = this._toItemLiteral(key, value);
                this._items.push(lit);
                this.save();
            }
            else
                this._throwDuplicateKey(key);
        },
        remove: function (key) {
            // summary:
            //      Removes the item from the context dictionary.
            var index = this._indexOf(key);
            if (index !== -1) {
                this._items.splice(index, 1);
                this.save();
            }
        },
        setValue: function (key, value) {
            // summary:
            //      Sets a new value to an item that already exists in the context dictionary.
            var index = this._indexOf(key);
            if (index !== -1) {
                this._items[index].itemVal = value;
                this.save();
            }
            else {
                this._throwKeyNotFound(key);
            }
        },
        getValue: function (key) {
            // summary:
            //      Gets the value of the item in the context dictionary by key.
            var index = this._indexOf(key);
            if (index !== -1) {
                return decodeURIComponent(this._items[index].itemVal);
            }
            else {
                this._throwKeyNotFound(key);
            }
        },
        getValueEx: function (key, nocase) {
            // summary:
            //      Gets the value of the item in the context dictionary by key with the ability to specify if the key should or should not be case sensitive.
            var index;
            if (nocase)
                index = this._indexOfNoCase(key);
            else
                index = this._indexOf(key);
            if (index !== -1) {
                return decodeURIComponent(this._items[index].itemVal);
            }
            else {
                this._throwKeyNotFound(key);
            }
        },
        clear: function () {
            // summary:
            //      Removes all items from the context dictionary.
            this._items = [];
            this.save();
        },
        containsKey: function (key) {
            // summary:
            //      Checks to see if an item with the given key exists in the context dictionary.
            return (this._indexOf(key) !== -1);
        },
        containsKeyEx: function (key, nocase) {
            // summary:
            //      Checks to see if an item with the given key exists in the context dictionary with the ability to specify if the key should or should not be case sensitive.
            if (nocase)
                return (this._indexOfNoCase(key) !== -1);
            else
                return (this._indexOf(key) !== -1);
        },
        getCount: function () {
            // summary:
            //      Returns the number of items currently in the context dictionary.
            return this._items.length;
        },
        hasKeys: function () {
            // summary:
            //      Indicates whether there are any items in the context dictionary.
            return this._items.length === 0;
        },
        getKeys: function () {
            // summary:
            //     Returns an array of all the keys of the items in the context dictionary.
            var keyRes = [];
            for (i = 0; i < this._items.length; i++) {
                keyRes.push(this._items[i].itemKey);
            }
            return keyRes;
        },
        valueAt: function (index) {
            // summary:
            //      Returns the value of the item in the dictionary at the given location.
            if (this._items[index]) {
                return decodeURIComponent(this._items[index].itemVal);
            }
            else {
                return null;
            }
        },
        keyAt: function (index) {
            // summary:
            //      Returns the key of the item in the dictionary at the given location.
            this.load();
            if (this._items[index])
                return this._items[index].itemKey;
            else
                return null;
        },
        getValues: function () {
            // summary:
            //      Returns an array containing the values of all the items in the context dictionary.
            var valRes = [];
            for (i = 0; i < this._items.length; i++) {
                valRes.push(decodeURIComponent(this._items[i].itemVal));
            }
            return valRes;
        },
        save: function (hours) {
            // summary:
            //      Saves the state of the current context to a hidden form field so the data is passed to the server in the form post.
            var data = document.getElementById(this.contextDataFieldId);
            if (data) {
                //alert("saving to: " + data.id);
                data.value = this.toString();
            }
            else {
                alert("can't find context data field");
            }
        },
        load: function () {
            // summary:
            //      Loads the context dictionary from the data found in the hidden form field.
            var data = document.getElementById(this.contextDataFieldId);
            if (data) {
                if (data.value) {
                    //alert("loading from: " + data.id);
                    this.fromString(data.value);
                }
            }
        },
        toString: function () {
            // summary:
            //      Returns a URL Encoded string containing ampersand separated name/value pairs of all the items in the context dictionary.
            var str = "";
            for (i = 0; i < this._items.length; i++) {
                str += this._items[i].itemKey + "=" + encodeURIComponent(this._items[i].itemVal);
                if (i !== this._items.length - 1)
                    str += "&";
            }
            return str;
        },
        fromString: function (qString) {
            // summary:
            //      Loads the context dictionary from a URL Encoded string of name/value pairs.
            this._items = [];
            if (qString != "") {
                var items = qString.split("&");
                for (i = 0; i < items.length; i++) {
                    var pair = items[i].split("=");
                    this._items.push(this._toItemLiteral(pair[0], decodeURIComponent(pair[1])));
                }
            }
            this.save();
        }
    });

    return widget;
});



