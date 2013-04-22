var DateValueClientID = QBAddConditionResources.DateValueClientID;
var DateValueFormat   = QBAddConditionResources.DateValueFormat;

function QBAddCondition_Load() {
    if (QueryBuilderMain.currentCondition) {
        //Field Name:
        document.getElementById("txtFieldName_AddCondition").value = QueryBuilderMain.currentCondition.displayname;
        document.getElementById("txtFieldName_AddCondition").disabled = true;
        //Field Type:
        document.getElementById("txtFieldType").value = QueryBuilderMain.currentCondition.getTypeName();
        document.getElementById("txtFieldType").disabled = true;
        if (QueryBuilderMain.currentCondition.fieldtypename == 'Memo/Blob') {
            document.getElementById("chkCaseSensEdit").disabled = true;
            document.getElementById("btnBrowse").disabled = true;
        }
        //Operator:
        document.getElementById("operatorSpace").innerHTML = QueryBuilderMain.currentCondition.buildOperatorSelectHTML('selCondOperator', 'QBAddCondition_operatorChanged()');
        //Value:
        // for Date/Time types, we usually need to show the calendar control (except Within last/next xxx days)
        var typ = QueryBuilderMain.currentCondition.getTypeCode();
        if (typ == "11" && ((QueryBuilderMain.currentCondition.operator.toUpperCase().indexOf('WITHIN') == -1) || QueryBuilderMain.currentCondition.isliteral == 'true')) {
            if (QueryBuilderMain.currentCondition.value != '') {
                if (QueryBuilderMain.currentCondition.isliteral == 'true') {
                    document.getElementById("dateValueDiv").style.display = 'none';   //hide date picker
                    document.getElementById("textValueDiv").style.display = 'inline';
                    document.getElementById("txtValueIs").value = QueryBuilderMain.currentCondition.value;
                } else {
                    document.getElementById("textValueDiv").style.display = 'none';
                    document.getElementById("dateValueDiv").style.display = 'inline';
                    document.getElementById("txtValueIs").value = '';                    
                    var d = time.buildDateFromStr(QueryBuilderMain.currentCondition.value, "YYYYMMDD");
                    if (isNaN(d.getYear())) {
                        d = time.buildDateFromStr(QueryBuilderMain.currentCondition.value, DateValueFormat);
                    }
                    document.getElementById(DateValueClientID).value = d.fmtDate(DateValueFormat);
                }
            }
           
        } else {	
            document.getElementById("dateValueDiv").style.display = 'none';   //hide date picker
            document.getElementById("textValueDiv").style.display = 'inline';
            document.getElementById("txtValueIs").value = QueryBuilderMain.currentCondition.value;
        }
        // if the operator is "does not contain data" or "does contain data" 
        // we need to do some stuff...
        if (QueryBuilderMain.currentCondition.operator.toUpperCase().indexOf('IS') > -1) {
            document.getElementById("txtValueIs").value = '';
            document.getElementById("txtValueIs").disabled = true;
            document.getElementById("chkLiteral").disabled = true;
            document.getElementById("chkCaseSensEdit").disabled = true;
            document.getElementById("btnBrowse").disabled = true;
        }
        //Case Sensitive:
        document.getElementById("chkCaseSensEdit").checked = (QueryBuilderMain.currentCondition.casesens == 'true');
        //Literal:
        document.getElementById("chkLiteral").checked = (QueryBuilderMain.currentCondition.isliteral == 'true');
    }
}

function QBAddCondition_operatorChanged() {
    var op = document.getElementById("selCondOperator").value;
    if (op.toUpperCase().indexOf('IS') > -1) {
        document.getElementById("txtValueIs").value = '';
        document.getElementById("txtValueIs").disabled = true;
        document.getElementById(DateValueClientID).disabled = true;
        document.getElementById("chkLiteral").disabled = true;
        document.getElementById("chkCaseSensEdit").disabled = true;
        document.getElementById("btnBrowse").disabled = true;
    } else {
        document.getElementById("txtValueIs").disabled = false;
        document.getElementById(DateValueClientID).disabled = false;
        document.getElementById("chkLiteral").disabled = false;
        if (QueryBuilderMain.currentCondition.getTypeCode() != '16') {
            document.getElementById("chkCaseSensEdit").disabled = false;
            document.getElementById("btnBrowse").disabled = false;
        }
    }
    // If the data type is a Date/Time, we may need to toggle the date picker and the textbox.
    if (QueryBuilderMain.currentCondition.getTypeCode() == '11') {
        if (op.toUpperCase().indexOf('WITHIN') > -1) {
            document.getElementById("textValueDiv").style.display = 'inline'; //show text box
            document.getElementById("dateValueDiv").style.display = 'none';   //hide date picker
            document.getElementById("txtValueIs").value = '';
        } else {
            if (document.getElementById("chkLiteral").checked) {
                document.getElementById("dateValueDiv").style.display = 'none';   //hide date picker
                document.getElementById("textValueDiv").style.display = 'inline';
                document.getElementById("txtValueIs").value = QueryBuilderMain.currentCondition.value;                
            } else {
                document.getElementById("textValueDiv").style.display = 'none'; //hide text box
                document.getElementById("dateValueDiv").style.display = 'inline'; //show date picker
                document.getElementById("txtValueIs").value = '';                
            }
        }
    }
}

function QBAddCondition_Cancel_Click() {
    dijit.byId("dlgAddCondition").hide();
}

function QBAddCondition_OK_Click() {
    var currentCondition = QueryBuilderMain.currentCondition;
    if (currentCondition) {
        currentCondition.operator = document.getElementById("selCondOperator").value;
        if (currentCondition.getTypeCode() == "11" && ((currentCondition.operator.toUpperCase().indexOf('WITHIN') == -1) || document.getElementById("chkLiteral").checked)) {
            if (document.getElementById("chkLiteral").checked) {
                currentCondition.value = document.getElementById("txtValueIs").value;
            } else {
                var d = time.buildDateFromStr(document.getElementById(DateValueClientID).value, DateValueFormat);
                currentCondition.value = (d == null) ? null : d.fmtDate("YYYYMMDD") + " 00:00:00";                
            }
        } else {
            currentCondition.value = document.getElementById("txtValueIs").value;
            if ((currentCondition.operator == " IN ") && (currentCondition.value.charAt(0) != "(")) {
                currentCondition.value = String.format("({0})", currentCondition.value);
            }
        }
        currentCondition.casesens = (document.getElementById("chkCaseSensEdit").checked) ? 'true' : 'false';
        currentCondition.isliteral = (document.getElementById("chkLiteral").checked) ? 'true' : 'false';
        
        if (currentCondition.IsNew) {
            QueryBuilderMain.addDataToConditionGrid(currentCondition);
            QueryBuilderMain.updateAndOrs();
        } 
                 
        // Update grid
        var selRow;
        if (currentCondition.IsNew) {
            selRow = QueryBuilderMain.dgConditions.gridElement.rows.length - 1;
        } else {
            selRow = QueryBuilderMain.dgConditions.selectedIndex;
        }
        
              
        if (selRow > 0) {
            var row = QueryBuilderMain.dgConditions.gridElement.rows[selRow];
             
           if (currentCondition) {
                var opObjs = row.getElementsByTagName('SELECT');
                opObjs[0].value = currentCondition.operator;
                if (currentCondition.value != '') {
                    row.cells[4].firstChild.nodeValue = currentCondition.value;
                } else {
                    row.cells[4].firstChild.nodeValue = ' ';
                }
                row.cells[5].firstChild.checked = (currentCondition.casesens == 'true');
                row.conditionObj = currentCondition;
            }  
        }
    }

    dijit.byId("dlgAddCondition").hide();
}

function QBAddCondition_browseField() {
    var vUrl = 'browseField.aspx?';
    
    var tablename = QueryBuilderMain.currentCondition.datapath;
    if (tablename.indexOf('!') > -1) {
        tablename = tablename.substring(tablename.lastIndexOf('.') + 1, tablename.lastIndexOf('!'));
    } else {
        tablename = tablename.substring(0, tablename.indexOf(':'));
    }
    vUrl += 'tbl=' + tablename;
    var fld = QueryBuilderMain.currentCondition.alias;
    if (fld.indexOf(".") > -1) {
        fld = fld.substring(fld.indexOf(".") + 1);
    }
    vUrl += '&fld=' + fld;
    vUrl += '&multi=';
    vUrl += (document.getElementById("selCondOperator").value.toUpperCase() == ' IN ') ? 'true' : 'false';
    
    window.open(vUrl, "browseField","dialog=yes,centerscreen=yes,width=400,height=240,status=no,toolbar=no,scrollbars=no,modal=yes");
}

function QBAddCondition_Literal_Click() {
    var currentCondition = QueryBuilderMain.currentCondition;
    if (currentCondition) {
        if (currentCondition.getTypeCode() == "11" && document.getElementById("chkLiteral").checked) {
            document.getElementById("dateValueDiv").style.display = 'none';
            document.getElementById("textValueDiv").style.display = 'inline';
            document.getElementById("txtValueIs").value = QueryBuilderMain.currentCondition.value;
        } else {
            document.getElementById("textValueDiv").style.display = 'none';
            document.getElementById("dateValueDiv").style.display = 'inline';
            document.getElementById("txtValueIs").value = '';
        }
    }
}

function ShowAddCondition() {
    QBAddCondition_Load();
    QBAddCondition_operatorChanged();
    dijit.byId("dlgAddCondition").show();
}