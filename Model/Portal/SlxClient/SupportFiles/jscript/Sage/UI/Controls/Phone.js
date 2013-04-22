/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/_Widget',
       'Sage/_Templated',
       'Sage/UI/Controls/TextBox',
       'dojo/_base/declare'
],
function (_Widget, _Templated, textBox, declare) {
    var widget = declare('Sage.UI.Controls.Phone', textBox, {
        slxchangehook: 'true',
        _setslxchangehookAttr: { node: 'focusNode', type: 'attribute', attribute: 'slxchangehook' },
        shouldPublishMarkDirty: true,
        //.Net control behavior
        autoPostBack: false,
        postCreate: function () {
            this.inherited(arguments);
            this.unformattedValue = this.unformatNumber(this.get('value'));
        },
        unformattedValue: '',
        formatPhoneChange: function (number) {
            var formattedVal = this.formatNumberForDisplay(number);
            this.unformattedValue = this.unformatNumber(number);
            this.set('value', formattedVal);
        },
        /*
        {0}: original value
        {1}: cleaned value
        {2}: entire match (against clean value)
        {3..n}: match groups (against clean value)
        */
        formatters: [{
            test: /^\+.*/,
            format: '{0}'
        }, {
            test: /^(\d{3})(\d{3,4})$/,
            format: '{3}-{4}'
        }, {
            test: /^(\d{3})(\d{3})(\d{2,4})$/, // 555 555 5555
            format: '({3}) {4}-{5}'
        }, {
            test: /^(\d{3})(\d{3})(\d{2,4})([^0-9]{1,}.*)$/, // 555 555 5555x
            format: '({3}) {4}-{5}{6}'
        }, {
            test: /^(\d{11,})(.*)$/,
            format: '{1}'
        }],
        unformatNumber: function (number) {
            var n = number;
            n = n.replace("(", "");
            n = n.replace(")", "");
            n = n.replace(" ", "");
            n = n.replace("-", "");
            return n;
        },
        formatNumberForDisplay: function (number, clean) {
            var n = number;
            if (typeof clean === 'undefined') clean = n;
            for (var i = 0; i < this.formatters.length; i++) {
                var formatter = this.formatters[i],
                        match;
                if ((match = formatter.test.exec(clean))) {
                    return String.format.apply(String, [formatter.format, n, clean].concat(match));
                }
            }
            return n;
        },
        onChange: function (e) {
            if (this.shouldPublishMarkDirty) {
                dojo.publish("Sage/events/markDirty");
            }
            this.formatPhoneChange(e);
        }
    });

    return widget;
});

