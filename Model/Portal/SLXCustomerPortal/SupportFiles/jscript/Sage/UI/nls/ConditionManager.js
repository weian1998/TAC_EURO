define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
                addimgalttext: 'Add Condition',
                hideimgalttext: 'Remove Condition',
                addrowlabel: 'Lookup by:',
                hiderowlabel: 'And:',
                srchBtnCaption: 'Search',
                errorOperatorRequiresValue: 'The operator requires a value',
                startingWith: 'Starting With',
                endsWith: 'Ends With',
                contains: 'Contains',
                equalTo: 'Equal to',
                notEqualTo: 'Not Equal to',
                equalOrLessThan: 'Equal or Less than',
                equalOrGreaterThan: 'Equal or Greater than',
                lessThan: 'Less than',
                greaterThan: 'Greater than'
        }
    };
    return lang.mixin(LanguageList, nls);
});