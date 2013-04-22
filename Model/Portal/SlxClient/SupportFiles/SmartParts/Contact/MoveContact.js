Sage.namespace("Sage.UI.Forms");
Sage.UI.Forms.MoveContact = {
    clearReassignToValue: function (id) {
        var reassignContact = dojo.byId(id + "_LookupResult");
        var reassignContactText = dojo.byId(id + "_LookupText");
        if (reassignContact && reassignContactText) {
            reassignContact.value = '';
            reassignContactText.value = '';
        }
    },
    init: function () {
    },
    validateRequirements: function () {
        var bindingManager = Sage.Services.getService('ClientBindingManagerService');
        if (bindingManager) {
            if (bindingManager._CurrentEntityIsDirty) {
                Sage.UI.Dialogs.alert('The contact has been changed and must be saved before it can be moved to a new account.');
                return false;
            }
        }
        return true;
    }
};