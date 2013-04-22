define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            accessText: 'Access',
            columnText: 'Column',
            entityText: 'Entity',
            noAccessText: 'No Access',
            profilesText: 'Profiles',
            propertyText: 'Property',
            securityManagerText: 'Security Manager',
            readOnlyText: 'Read Only',
            readWriteText: 'Read Write',
            resetText: 'Reset',
            saveText: 'Save',
            tableText: 'Table'
        }
    };
    return lang.mixin(LanguageList, nls);
});