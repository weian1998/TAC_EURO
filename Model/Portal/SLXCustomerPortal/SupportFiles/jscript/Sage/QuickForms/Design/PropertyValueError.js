define([
    'dojo/string',
    'dojo/_base/lang'
], function(string, lang) {
    var PropertyValueError = function(result, value, message) {
        this.result = result;
        this.value = value;
        this.message = message || string.substitute(this.messageText, [value]);
    };

    lang.extend(PropertyValueError, {
        messageText: 'The value ${0} is not allowed.',
        toString: function() {
            return this.message;
        }
    });

    return lang.setObject('Sage.QuickForms.Design.PropertyValueError', PropertyValueError);
});