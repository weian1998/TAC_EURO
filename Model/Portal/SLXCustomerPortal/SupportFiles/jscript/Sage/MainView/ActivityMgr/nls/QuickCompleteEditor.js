define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            lblResultText: 'Result:',
            lblNoteText: 'Note (append to all items):',
            btnCompleteIndividuallyText: 'Individually',
            btnAsScheduledText: 'As Scheduled',
            btnCompleteNowText: 'Now',
            btnCancelText: 'Cancel',
            btnCloseText: 'Close',
            btnHelpText: 'Help',
            resultCompletedText: 'Complete',
            titleText:'Quick Complete'
        }
    };
    return lang.mixin(LanguageList, nls);
});