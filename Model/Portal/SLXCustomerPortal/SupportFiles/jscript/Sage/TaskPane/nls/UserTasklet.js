﻿define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
        addToRoleTitle: 'Add to Role',
        resetUsersTitle: 'Reset Users'
    }
    };
    return lang.mixin(LanguageList, nls);
});
