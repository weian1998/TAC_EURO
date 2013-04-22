/* external script file                                      */
/* Copyright ©1997-2006                                      */
/* Sage Software, Inc.                                       */
/* All Rights Reserved                                       */
/* Main library of scripts used throughout the application   */

function forceNumInput() {
    /* use this method with the onkeypress event to force only number input */
    if ((event.keyCode < 48) || (event.keyCode > 57)) {
        event.returnValue = false;
    }
}

function limitLength(num) {
    /* function used to limit the length of                   */
    /* textareas to 'num' characters with an onkeypress event */
    if (typeof event != "undefined")
    {
        var actEl = event.srcElement;
        var txt = actEl.value;
        if (txt.length >= num) {
            txt = txt.substr(0,num);
            actEl.value = txt;
            event.returnValue=false;
        } else {
            event.returnValue=true;
        }
    }
}
