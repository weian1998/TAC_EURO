define([
        'dojo/_base/lang'
],
function (lang) {
    var nls = {
        root: {
            webSiteAddressText: 'Website Address',
            heightText: 'Height',
            pixelsText: 'pixels',
            rangeMessage: 'Enter a value 100-1000',
            invalidUrl: 'Invalid website format (http://*)'
        }
    };
    var languageList = {
        de: true,
        en: true
    };
    return lang.mixin(languageList, nls);
});