/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    //// Root Sage modules ////
    "Sage/_ActionMixin",
    "Sage/Utility",
    "Sage/LanguageList",
    "Sage/Link",
    "Sage/Array",
    "Sage/_ConfigurationProvider",
    "Sage/_Templated",
    "Sage/Format",
    //// Sub Sage modules ////
    "Sage/Data/main",
    "Sage/Store/main",
    // GroupBuilder only required in the Manage Groups dialog.
    //"Sage/GroupBuilder/main",
    "Sage/Groups/main",
    "Sage/Layout/main",
    "Sage/MailMerge/main",
    "Sage/MainView/main",
    "Sage/QuickForms/Design/main",
    "Sage/Services/main",
    "Sage/TaskPane/main",
    "Sage/UI/main",
    "Sage/Utility/main",
    "Sage/Workspaces/main",
    'dojo/i18n!dijit/nls/common'  //for multiple files in our modules
], function() {
	// module:
	//		Sage/main
	// summary:
	//		The Sage/main module provides loading of all sub Sage modules.
});