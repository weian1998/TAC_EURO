﻿define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            displayNameText: "Url"
        }
    };
    return lang.mixin(LanguageList, nls);
});