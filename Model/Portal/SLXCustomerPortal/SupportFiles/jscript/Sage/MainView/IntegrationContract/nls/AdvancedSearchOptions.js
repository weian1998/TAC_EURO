define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            dialogCaption: "Link to Accounting",
            searchOptionsHeader: "Search for Matches in ",
            searchOptionsText: "The following criteria was used in the previous search. Modify the criteria for a new search. Click OK to begin searching.",
            propertyText: "Property",
            operatorText: "Operator",
            searchText: "Search Value",
            loadingText: "loading...",
            loadingDisplay: "Searching for results...",
            hideImgAltText: 'Remove Condition',
            addImgAltText: 'Add Condition',
            okText: "OK",
            cancelText: "Cancel"
        }
    };
    return lang.mixin(LanguageList, nls);
});