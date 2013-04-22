define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
        crystalActiveXDesignerNotInstalled: "The Crystal Reports ActiveX Designer Run Time Library is not installed.",
        crystalActiveXViewerNotInstalled: "The Crystal ActiveX Report Viewer is not installed.",
        crystalActiveXViewerUnavailable: "The SalesLogix Crystal Report Viewer object is unavailable or is not installed.",
        invalidEntityError: "The entity ID has not been defined or could not be determined.",
        invalidReportingServerError: "The reporting server has not been defined or has been defined incorrectly.",
        invalidReportPluginError: "The report plugin ID has not been defined or could not be determined.",
        invalidTableNameError: "The table name has not been defined or could not be determined.",
        noDefaultReportError: "A default report could not be located for the current entity.",
        reportCannotBeShownError: "The report cannot be shown.",
        reportingInfoError: "There was an unexpected error retrieving reporting information.",
        sageGearsError: "The report cannot be displayed. Sage.gears.factory is inaccessible."
    }
    };
    return lang.mixin(LanguageList, nls);
});
