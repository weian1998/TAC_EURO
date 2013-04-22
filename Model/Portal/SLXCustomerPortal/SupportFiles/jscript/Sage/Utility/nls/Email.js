define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
                RecipientInfoError: "There was an unexpected error attempting to read the recipient information: ${0}",
                MailToProtocolError: "There was an error attempting to generate an e-mail message using the mailto: protocol (href.length=${0}). The number of e-mail recipients may need to be reduced. Browser error: ${1}.",
                InvalidContextError: "The e-mail request cannot be processed. This operation is only supported for Contacts or Leads.",
                InvalidArgumentError: "The e-mail request cannot be processed. Invalid argument.",
                FilteredOutMsg: "Filtered out: Non-solicitable: ${0}; Invalid: ${1}; Dupes: ${2}",
                AllInvalidEmailError: "The collection does not include one entity with a valid and/or solicitable e-mail address.",
                EmailFieldQueried: "The e-mail field queried was: ${0}.",
                EntityInfoError: "The was a failure attempting to retrieve the entity information.",
                CapabilityModeError: "The capability to write an e-mail to a group selection is only available in list views.",
                CapabilityEntityError: "The capability to write an e-mail to a group selection is only available for Contacts or Leads.",
                NoRowsSelectedError: "There are no rows selected."
            }
    };
    return lang.mixin(LanguageList, nls);
});