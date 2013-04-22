
AutoLogout = new function () {
    this.OneMinute = 60000;
    this.LogoutDuration = 20;
    this.StartAlertAt = 10;
    this.StartWarnAt = 5;
    this.Enabled = true;
};

AutoLogout.process = function (minutes) {
    if (!AutoLogout.Enabled) return;
    if (AutoLogout.LogoutReset) {
        minutes = 0;
        AutoLogout.LogoutReset = false;
    }
    if (minutes === this.LogoutDuration) {
        try {
            window.location.href = 'Shutdown.axd';
        } catch (e) { }
        return;
    }
    if (minutes < this.StartWarnAt) {
        window.setTimeout('AutoLogout.process(' + (minutes + 1) + ')', this.OneMinute);
        return;
    }
    if (typeof MasterPageLinks !== "undefined") {
        var msg = String.format(MasterPageLinks.IdleMessage, minutes);
        var elem = dojo.byId('autoLogoff');
        if (minutes >= this.LogoutDuration - this.StartAlertAt) {
            dojo.addClass(elem, 'alerttext');
            msg = String.format(MasterPageLinks.LogoffMessage, this.LogoutDuration - minutes);
        }
        dojo.html.set(elem, msg);
        window.setTimeout('AutoLogout.process(' + (minutes + 1) + ')', this.OneMinute);
    }
    return;
};
AutoLogout.resetTimer = function () {
    AutoLogout.LogoutReset = true;
    var elem = dojo.byId('autoLogoff');
    if (elem) {
        dojo.removeClass(elem, 'alerttext');
        dojo.html.set(elem, '');
    }
};

Error.prototype.toMessage = function (xtraMsg, showFullStack) {
    var sError = "";
    if (dojo.isString(xtraMsg) && xtraMsg.length > 0) {
        sError = xtraMsg;
        if (!(sError.lastIndexOf(" ") + 1 == sError.length)) {
            sError += " ";
        }
    }
    var sMsg = this.message;
    if (!(sMsg.lastIndexOf(".") + 1 == sMsg.length)) {
        sMsg += ".";
    }
    if (dojo.isIE) {
        var iNumber = this.number;
        if (isNaN(iNumber)) {
            iNumber = 0;
        }
        sError = dojo.string.substitute("${0}${1} Details: name=${2}; number=${3}.",
                        [sError, sMsg, this.name, iNumber]);
    }
    else {
        var iLineNumber = -1;
        var sSource = "";
        var sStack = "";
        if (typeof this.lineNumber !== "undefined") {
            iLineNumber = this.lineNumber;
        }
        if (typeof this.stack !== "undefined") {
            sStack = this.stack;
            if (typeof showFullStack == "boolean" && showFullStack) {
                sSource = sStack;
            }
            else {
                if (!isNaN(iLineNumber)) {
                    var iPos = sStack.indexOf(dojo.string.substitute(".js:${0}", [iLineNumber])); //DNL
                    if (iPos != -1) {
                        sSource = sStack.substring(0, iPos + 3);
                        iPos = sSource.lastIndexOf("/");
                        if (iPos != -1) {
                            sSource = sSource.substring(iPos + 1);
                        }
                    }
                }
            }
        }
        if (sSource.length == 0) {
            sSource = "unknown";
        }
        if (iLineNumber == -1) {
            iLineNumber = "unknown";
        }
        sError = dojo.string.substitute("${0}${1} Details: name=${2}; line=${3}; source=${4}.",
                        [sError, sMsg, this.name, iLineNumber, sSource]);
    }
    return sError;
};