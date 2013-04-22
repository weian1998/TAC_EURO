define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            firstText: "Move First",
            previousText: "Move Previous",
            nextText: "Move Next",
            lastText: "Move Last",
            listText: "List View",
            noRecordsText: "No Records",
            labelFmtText: "${0} of ${1}"
        }
    };
    return lang.mixin(LanguageList, nls);
});
