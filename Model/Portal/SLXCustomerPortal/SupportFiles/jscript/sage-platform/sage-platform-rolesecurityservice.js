Sage.RoleSecurityService = function (actionList) {
    this._actionList = actionList;
    // Implement callback when SData call is finished
    //this._consumerCallback = {};
    this._userID = "";
    this._actionName = "";
}

Sage.RoleSecurityService.prototype.hasAccess = function (actionName) { // callback
    // this._consumerCallback = callback;
    this._actionName = actionName;
    this._userID = Sage.Utility.getClientContextByKey('userID');
    var rval = false;

    //If the current user is Administrator, then return true always.
    if (dojo.trim(this._userID.toUpperCase()) === 'ADMIN') {
        rval = true;
    }
    else {
        var aLen = this._actionList.length;
        for (var i = 0; i < aLen; i++) {
            if (this._actionList[i].toUpperCase() === this._actionName.toUpperCase()) {
                rval = true;
                break;
            }
        }
    }
    //this._consumerCallback(rval);  
    return rval;
}