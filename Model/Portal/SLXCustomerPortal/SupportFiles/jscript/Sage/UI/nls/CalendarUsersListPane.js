﻿define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            header_color: 'Color',
            header_user: 'User',
            maxUsersErrorMessage: 'Sorry, you cannot view more than ${0} calendars (including your own) at one time.  Clear one of the currently-selected calendars and try again.'
        }
    };
    return lang.mixin(LanguageList, nls);
});