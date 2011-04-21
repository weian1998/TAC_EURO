var fired = false;
function getValues(btn, TemplateId) {
    var templatetext;
    var onlyAttachment;
    var sbtext;
    var reqfor;
    var description;
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].id.indexOf("clientdata") > -1) {
            dest = inputs[i];
        }
        if (inputs[i].id.indexOf("TemplateName") > -1) {
            templatetext = inputs[i];
        }
        if (inputs[i].id.indexOf("PrintLiteratureList_2") > -1) {
            onlyAttachment = inputs[i];
        }
        if (inputs[i].id.indexOf("SendBy_TXT") > -1) {
            sbtext = inputs[i];
        }
        if (inputs[i].id.indexOf("RequestedFor_LookupText") > -1) {
            reqfor = inputs[i];
        }
        if (inputs[i].id.indexOf("Description") > -1) {
            description = inputs[i];
        }

    }
    if ((document.getElementById(TemplateId).value == "") & (!onlyAttachment.checked)) {
        alert(LitWarning_SelectTemplate);
        return false;
    }
    dest.value = document.getElementById(TemplateId).value;
    var total = 0;
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].id.indexOf("QRFOR") > -1) {
            if (inputs[i].value.length > 0) {
                dest.value += '|' + inputs[i].id.substr(5) + '=' + inputs[i].value;
                if (!isNaN(parseInt(inputs[i].value))) {
                    total += parseInt(inputs[i].value);
                } else {
                    alert(LitWarning_UnableToParseQuantity);
                    return false;
                }
            }
        }
    }
    if (total == 0) {
        alert(LitWarning_QtyGreaterThanZero);
        return false;
    }
    if (total > 1000000000) {
        alert(LitWarning_MaxOneBillion);
        return false;
    }
    if ((templatetext.value == "") && (!onlyAttachment.checked)) {
        alert(LitWarning_MustSelectTemplate);
        return false;
    }
    var sbdt = new Date(sbtext.value);
    var n = new Date();
    if (sbdt < n + 1) {
        alert(LitWarning_SendByDate);
        return false;
    }
    if (reqfor.value == '') {
        alert(LitWarning_SelectContact);
        return false;
    }
    if (description.value.length > 63) {
        alert(LitWarning_DescriptionLessThan64);
        return false;
    }
    if (fired) {
        return false;
    } else {
        fired = true;
    }
    return true;
}

/////////////////////////////////////////////////////////////////////////////
// http://ajax.asp.net/docs/ClientReference/Sys/ApplicationClass/SysApplicationNotifyScriptLoadedMethod.aspx
/////////////////////////////////////////////////////////////////////////////
if (typeof (Sys) !== 'undefined') { Sys.Application.notifyScriptLoaded(); }
/*
--------------------------------------------------------
DO NOT PUT SCRIPT BELOW THE CALL TO notifyScriptLoaded()
--------------------------------------------------------
*/