/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/Groups/GroupLookup'
],
function (GroupLookup) {
    Sage.namespace('Utility.Groups');
    dojo.mixin(Sage.Utility.Groups, {
        showMainLookupFor: function (family, page) {
            var lookupManagerService = Sage.Services.getService('GroupLookupManager');
            if (lookupManagerService) {
                if (typeof family === "undefined") {
                    lookupManagerService.showLookup();
                } else {
                    lookupManagerService.showLookup({ family: family, returnTo: page || false });
                }
            }
        }
    });
    
    return Sage.Utility.Groups;
});