define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
        address1Text: 'Address 1:',
        address2Text: 'Address 2:',
        address3Text: 'Address 3:',
        cancelText: 'Cancel',
        cityText: 'City:',
        countryText: 'Country:',
        countyText: 'County:',
        descriptionText: 'Description:',
        dialogTitle: 'Address',
        isMailingText: 'Shipping:',
        isPrimaryText: 'Primary:',
        okText: 'OK',
        postalCodeText: 'Postal Code:',
        salutationText: 'Attention:',
        stateText: 'State:',
        imageEditToolTip: 'Edit',
        imageMapQuestToolTip: 'MapQuest'
        }
    };
    return lang.mixin(LanguageList, nls);
});
