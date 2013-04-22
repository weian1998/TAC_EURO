define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            okText: 'OK',
            cancelText: 'Cancel',
            dialogTitle: 'Edit Name',
            prefixText: 'Prefix:',
            nameFirstText: 'First:',
            nameMiddleText: 'Middle:',
            nameLastText: 'Last:',
            suffixText: 'Suffix:',
            buttonTooltip: 'Edit'
        }
    };
    return lang.mixin(LanguageList, nls);
});
