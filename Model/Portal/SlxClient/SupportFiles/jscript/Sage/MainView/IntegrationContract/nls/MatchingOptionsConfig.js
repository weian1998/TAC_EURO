define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            matchingCaption: "Edit Match Criteria",
            matchingHeader: "Match Criteria for ",
            matchingDescription: "Add or remove operators to define the match criteria for all users who link Sage SalesLogix records with an accounting system. This criteria determines the results returned when searching for matching records between accounting systems.",
            propertyText: "Property",
            operatorText: "Operator",
            loadingText: "Loading...",
            filter_AddCondition: "Add Condition",
            filter_RemoveCondition: "Remove Condition",
            error_InvalidEndpoint: "Please specify a valid endpoint before continuing.",
            okText: "OK",
            cancelText: "Cancel"
        }
    };
    return lang.mixin(LanguageList, nls);
});