// Client Script for addCalcField.ascx
dojo.require("Sage.UI.Dialogs");
dojo.require("Sage.UI.Controls.Select");

var currentTab = 0;
var tabProperties = 0;
var tabCalculations = 1;
var calcFieldObj = new calcFieldInfo();
var fields = new Array();

function tabClick(idx) {
    if (idx == 0) {
        document.getElementById("tabProp").style.fontWeight = 'bold';
        document.getElementById("tabpageProp").style.display = 'inline';
        document.getElementById("tabCalc").style.fontWeight = 'normal';
        document.getElementById("tabpageCalc").style.display = 'none';
    } else {
        document.getElementById("tabProp").style.fontWeight = 'normal';
        document.getElementById("tabpageProp").style.display = 'none';
        document.getElementById("tabCalc").style.fontWeight = 'bold';
        document.getElementById("tabpageCalc").style.display = 'inline';
    }    
    currentTab = idx;
}

function loadTree() {
    /* load the treeview with the base table, it's global joins and columns.                     */
    var tbl = dijit.byId(addCalcFieldResources.lstBaseTable).attr("value");
    var vURL = 'GroupBuilder/newTableTree.aspx?tbl=';
    vURL += tbl;
    vURL += '&withcols=T&tablepath=';
    vURL += tbl;
    document.getElementById("treeFrame").src = vURL;
}

function init() {
       tabClick(0);
    if (window.opener) {
        if (window.opener.calcFieldObj) {
            calcFieldObj = window.opener.calcFieldObj;
            document.getElementById("txtName").value = calcFieldObj.name;
            document.getElementById("txtAlias").value = calcFieldObj.alias;
            document.getElementById("txtDescription").value = calcFieldObj.description;
            dijit.byId(addCalcFieldResources.lstBaseTable).attr("value", calcFieldObj.realTableName);
            dijit.byId("selCalcType").attr("value", calcFieldObj.calcType);
            buildDispHTML(calcFieldObj);
        }
    }
}

dojo.ready(function() {
    init();
});

function pageLoad() {
    init();
}

function buildDispHTML(calcFieldObj) {
    /* To build the display HTML from an existing calculated field we need to    */
    /* loop through the datapaths and make displaypaths from them.               */
    /* We also need to populate the fields array as we go.                       */
    var dispHtml = calcFieldObj.text;
    var strPaths = calcFieldObj.paths;
    if (strPaths.indexOf('|') == 0) {
        strPaths = strPaths.replace('|', '');
    }
    if (strPaths.lastIndexOf('|') == strPaths.length -1) {
        strPaths = strPaths.substr(0, strPaths.length -1);
    }
    var paths = strPaths.split('|');
    for (var i = 0; i < paths.length; i++) {
        var fieldObj = new fieldInfo();
        fieldObj.datapath = paths[i];
        fieldObj.buildDisplayPath();
        var idx = i + 1;
        var repVal = '<span contenteditable="false">';
        repVal += fieldObj.displaypath;
        repVal += '</span>';
        dispHtml = dispHtml.replace('%' + idx, repVal);
        
        fields.push(fieldObj);
    }
    document.getElementById("dispText").innerHTML = dispHtml;
}

function ok_click() {
    // validate required fields...
    if (document.getElementById("txtName").value == "") {
        Sage.UI.Dialogs.showInfo(addCalcFieldResources.jsEnterName);
        tabClick(0);
        document.getElementById("txtName").focus();
        return;
    }
    if (document.getElementById("txtAlias").value == "") {
        Sage.UI.Dialogs.showInfo(addCalcFieldResources.jsEnterAlias);
        tabClick(0);
        document.getElementById("txtAlias").focus();
        return;
    }
    if (document.getElementById("txtAlias").value.indexOf(' ') > -1) {
        Sage.UI.Dialogs.showError(addCalcFieldResources.jsAliasNoSpace);
        tabClick(0);
        document.getElementById("txtAlias").focus();
        return;
    }
    if (document.getElementById("dispText").innerHTML == "") {
        Sage.UI.Dialogs.showError(addCalcFieldResources.jsCannotSave);
        tabClick(1);
        document.getElementById("dispText").focus();
        return;
    }

    calcFieldObj.name = document.getElementById("txtName").value;
    calcFieldObj.alias = document.getElementById("txtAlias").value;
    calcFieldObj.description = document.getElementById("txtDescription").value;
    calcFieldObj.baseTable = dijit.byId(addCalcFieldResources.lstBaseTable).attr("value");
    calcFieldObj.realTableName = dijit.byId(addCalcFieldResources.lstBaseTable).attr("value");
    calcFieldObj.calcType = dijit.byId("selCalcType").attr("value");
    parseCalculation(); //(sets paths, text, fieldCount, and displayText)
    
    if (window.opener) {
        window.opener.calcFieldXML = calcFieldObj.asXML();
        window.opener.calcFields_CallBack();
    }
    window.close();
}

function treeitem_click(aName, aType, aDispPath, aDataPath) {
    /*  We only care if we are on the calculations tab and                                       */
    /*  only if they click a column.                                                             */
    if ((currentTab == tabProperties) || (aType == 'table')) {
        return;
    }
    //alert('aType: ' + aType);
    //document.mainform.txtDispText.value += aDispPath;

    var fieldObj = new fieldInfo();
    fieldObj.alias = aName;
    fieldObj.datapath = aDataPath;
    fieldObj.displayname = aName;
    fieldObj.displaypath = aDispPath;
    fields.push(fieldObj);
    
    document.getElementById("dispText").innerHTML += '<span contenteditable="false">' + aDispPath + '</span>';
}

function itemClicked(aName, aType, aDispPath, aDataPath) {
    treeitem_click(aName, aType, aDispPath, aDataPath);
}

function addCalc(aOperand) {
    //document.mainform.txtDispText.value += aOperand;
    document.getElementById("dispText").innerHTML += aOperand;
    return false;
}

function parseCalculation() {
    /* the following properties are reset by this function:                                      */
    calcFieldObj.paths = '';
    calcFieldObj.text = '';
    calcFieldObj.fieldCount = 0;
    calcFieldObj.displayText = document.getElementById("dispText").innerHTML;
    /*  As we parse through the innerHTML of the calculation string the user built,              */
    /*    we need to keep track of where we are.                                                 */
    /*  If we are inside the <span> tag itself - don't collect characters                        */
    /*  If we are between open and close <span> tag - collect characters as field path           */
    /*  if we are outside of <span> elements - collect characters as text                        */
    /*  The following boolean variables help keep track of where we are:                         */
    var isText = true;        /* we are in the text portion of the string                        */
    var isFieldText = false;  /* we are in the field path portion of the string                  */
    var isOpenSpan = false;   /* we are inside the open span tag - <span contenteditable=TRUE>   */
    var isCloseSpan = false;  /* we are inside the close span tag - </span>                      */
    var calcHTML = document.getElementById("dispText").innerHTML;
    calcHTML = calcHTML.replace('<P>', '');
    calcHTML = calcHTML.replace('</P>', '');
    var resultStr = '';
    var fieldStr = '';
    var fieldCount = 0;
    for (var i = 0; i < calcHTML.length; i++) {
        if (calcHTML.charAt(i) == '<') {
            /* we are starting a tag, change gears...                                                */
            if (calcHTML.charAt(i + 1) == '/') {
                isCloseSpan = true;
                isOpenSpan = false;
                if (isFieldText) {
                    if (fieldStr != '') {
                        addFieldToCalc(fieldStr);
                        fieldCount++;
                        fieldStr = '';
                        resultStr += '%' + fieldCount;
                    }
                }
            } else {
                isOpenSpan = true;
                isCloseSpan = false;
            }
            isText = false;
            isFieldText = false;
        } else if (calcHTML.charAt(i) == '>') {
            /* we ended the tag, so we need to change gears...                                       */
            isFieldText = isOpenSpan;
            isText = isCloseSpan;
            isOpenSpan = false;
            isCloseSpan = false;
        } else {
            /* OK, we are not starting or ending a tag, are we collecting characters?                */
            if (isText) {
                resultStr += calcHTML.charAt(i);
            }
            if (isFieldText) {
                fieldStr += calcHTML.charAt(i);
            }
        }
    }
    resultStr = replaceAll(resultStr, '&nbsp;', ' ');
    resultStr = replaceAll(resultStr, '&lt;', '<');
    resultStr = replaceAll(resultStr, '&gt;', '>');
    resultStr = replaceAll(resultStr, '&amp;', '&');

    calcFieldObj.text = resultStr;
    calcFieldObj.fieldCount = fieldCount;
    calcFieldObj.displayText = document.getElementById("dispText").innerHTML;
}

function replaceAll(aStr, aFrom, aTo) {
    var res = aStr;
    if ((aFrom == aTo) || (aFrom == '')) {
        return res;
    }
    while(res.indexOf(aFrom) > -1) {
        res = res.replace(aFrom, aTo);
    }
    return res;
}

function addFieldToCalc(aDispPath) {
    /* add this field to the calculation text of the calcFieldObj                                */
    var foundIt = false;
    for (var i = 0; i < fields.length; i++) {
        if (fields[i].displaypath.toUpperCase() == aDispPath.toUpperCase()) {
            foundIt = true;
            calcFieldObj.paths += '|' + fields[i].datapath;
            break;
        }
    }
    if (!foundIt) {
        Sage.UI.Dialogs.showError(addCalcFieldResources.jsErrorFieldNotFound + aDispPath);
    }		
}

