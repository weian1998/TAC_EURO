/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/form/ValidationTextBox',
    'dojo/_base/declare'
], function (ValidationTextBox, declare) {
    var validationTextBox = declare('Sage.UI.UniqueToListValidationTextBox', ValidationTextBox, {
        notUniqueText: 'This value already exists',
        uniqueList: "",
        _uniqueHash: {},
        isValid: function (isFocused) {
            var passedBase = this.inherited(arguments);
            var value = this.get('value');
            return (!(value in this._uniqueHash) && passedBase);
        },
        _setUniqueListAttr: function (value) {
            this.uniqueList = dojo.isString(value) ? value.split(",") : (dojo.isArray(value) ? value : [value]);
            this._uniqueHash = {};
            for (var i = 0; i < this.uniqueList.length; i++) {
                this._uniqueHash[this.uniqueList[i]] = 1;
            }
        }
    });
    return validationTextBox;
});
