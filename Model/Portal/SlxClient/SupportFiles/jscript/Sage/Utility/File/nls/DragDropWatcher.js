define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
         query0:'The feature you are requesting requires the Sage SalesLogix Desktop <br> Integration Module.',
         query1: 'Find out more...',
         query2: 'Would you like to install this feature now?',
         query3: 'Note: This module can be installed at any time from the logon or options pages.'
    }
    };
    return lang.mixin(LanguageList, nls);
});
