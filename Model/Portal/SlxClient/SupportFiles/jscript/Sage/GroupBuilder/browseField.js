// Client Script for browseField.ascx

function browseField_valueSelected() {
    if (document.getElementById(browseFieldResources.listValues).multiple == true) {
        var opts = document.getElementById(browseFieldResources.listValues).options;
        var retVal = "";
        for (var i = 0; i < opts.length; i++) {
            if (opts[i].selected) {
                var safeval = opts[i].value ? opts[i].value.replace(/\'/g, "''") 
                                                : opts[i].value.replace(/\'/g, "''");
                retVal += (retVal != "") ? ", " : "";
                retVal += "'" + safeval + "'";
            }
        }
        returnValue = retVal;
    } else {
        returnValue = document.getElementById(browseFieldResources.listValues).value;
    }

    if ((window.opener.QueryBuilderMain.currentCondition.getTypeCode() == '11') && ((window.opener.document.getElementById("selCondOperator").value.toUpperCase().indexOf('WITHIN') == -1) || window.opener.document.getElementById("chkLiteral").checked)) {
        if (window.opener.document.getElementById("chkLiteral").checked) {
            window.opener.document.getElementById("txtValueIs").value = returnValue;            
        } else {
            window.opener.document.getElementById(window.opener.DateValueClientID).value = returnValue;
        }
    } else {
        window.opener.document.getElementById("txtValueIs").value = returnValue;
    }

    window.close();
}

function browseField_Cancel() {
    window.close();
}

