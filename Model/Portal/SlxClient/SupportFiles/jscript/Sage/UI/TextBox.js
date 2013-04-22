/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/form/TextBox',
    'dojo/_base/declare'
],
function (TextBox, declare) {
    var widget = declare('Sage.UI.TextBox', TextBox, {
        /**
        * Set the displayed text in the Textbox,
        * checking to see if watermark is specified
        */
        postCreate: function () {
            this.inherited(arguments);
            // reference to the original value
            this._val = this.get('value');
            if (this.get('value') === '' && this._val) {
                this.set('value', this._val);
            }
            this.set('class', 'txt-ss-watermark');
        },
        /**
        * Listener for the onFocus event. if watermark is true
        * it is removed here
        */
        onFocus: function () {
            this.set('value', '');
            this.set('class', 'txt-ss');
        },
        /**
        * When programatically inserting text the onFocus() event isn't fired
        * This method mimics that event so that your hydrated text isn't 
        * watermarked. Pass in a string to display
        * @param {String} val
        */
        forceFocus: function (val) {
            this.set('value', val);
            this.set('class', 'txt-ss');
        },
        /**
        * Listener for the blur event. The control
        * is left alone if text was input or reset to
        * the initial display with watermark preference if blank
        */
        onBlur: function () {
            if (this.get('value') === '') {
                this.set('class', 'txt-ss-watermark');
                this.set('value', this._val);
            }
        }
    });

    return widget;
});
