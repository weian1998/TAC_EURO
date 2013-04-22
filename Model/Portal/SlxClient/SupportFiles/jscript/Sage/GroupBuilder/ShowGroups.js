function checkDoAll(item) {
    var vGm = new groupmanager();
    if (item.checked) {
        vGm.UnHideGroup(item.id);
    } else {
        vGm.HideGroup(item.id);
    }
    return true;
}

function ShowGroups_save() {
    window.setTimeout(function() { opener.location.reload(); }, 1);
    window.setTimeout(function() { window.close(); }, 100);
}

function ShowGroups_cancel() {
    window.close();
}
