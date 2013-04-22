/* external script file                               */
/* Copyright ©1997-2006                               */
/* Sage Software, Inc.                                */
/* All Rights Reserved                                */
/*  querybuilder.js                                   */
/*  This javascript object provides object support    */
/*  for the varios entities that are used in building */
/*  queries.  These objects are passed between        */
/*  the various dialogs.                              */
/*  fieldInfo:  data related to a data field          */
/*  layoutInfo:  information for a 'layout'           */
/*  conditionInfo: info about a query condition       */
/*  sortInfo:  information about sorting the results  */
/*  calcFieldInfo:  Calculated field information      */
/*  joinInfo:  DB join information                    */
/*                                                    */
/*  Author: Newell Chappell                           */
/*  December 2004                                     */
/*  ================================================  */
/*  These objects all have a QBObjectType property    */
/*  that can be queried to see what kind of object    */
/*  you are working with.  They also all have an      */
/*  asXML() function.                                 */

// ResourceStrings
var globalResourceString = querybuilderResources.globalResourceString;
var globalResourceInteger = querybuilderResources.globalResourceInteger;
var globalResourceDecimal = querybuilderResources.globalResourceDecimal;
var globalResourceDateTime = querybuilderResources.globalResourceDateTime;
var globalResourceMemo = querybuilderResources.globalResourceMemo;
var globalResourceCalculated = querybuilderResources.globalResourceCalculated;
var globalResourceUnknown = querybuilderResources.globalResourceUnknown;

var globalResourceStartingWith = querybuilderResources.globalResourceStartingWith;
var globalResourceLike = querybuilderResources.globalResourceLike;
var globalResourceEqual = querybuilderResources.globalResourceEqual;
var globalResourceNotEqual = querybuilderResources.globalResourceNotEqual;
var globalResourceLessThan = querybuilderResources.globalResourceLessThan;
var globalResourceGreaterThan = querybuilderResources.globalResourceGreaterThan;
var globalResourceLessThanOrEqual = querybuilderResources.globalResourceLsThanOrEqual;
var globalResourceGreaterThanOrEqual = querybuilderResources.globalResourceGrtrThanOrEqual;
var globalResourceIn = querybuilderResources.globalResourceIn;
var globalResourceWithinLast = querybuilderResources.globalResourceWithinLast;
var globalResourceWithinNext = querybuilderResources.globalResourceWithinNext;
var globalResourceDoesNotContainData = querybuilderResources.globalResourceDoesNotContainData;
var globalResourceDoesContainData = querybuilderResources.globalResourceDoesContainData;


/* ------------------------------------------------------------------------------------------------------*/
function fieldInfo() {
    /* Constructor for the fieldInfo object class       */
    /*  properties for this class:                      */
    this.QBObjectType = "fieldInfo";
    this.alias = "";        //the real column name           eg: MAINPHONE
    this.datapath = "";     //the real datapath              eg: CONTACT:ACCOUNTID=ACCOUNTID.ACCOUNT!MAINPHONE
    this.displayname = "";  //the column name the user sees  eg: Main Phone
    this.displaypath = "";   //the path the user sees:        eg: Contact.Account.Main Phone
    this.fieldtypecode = ""; //the code of the field type
    this.fieldtypename = ""; //the name of the field type
    this.ishidden = "F";     //is this a hidden field
            /*  code  : name          */
            /*------------------------*/
            /*	1     : String        */
            /*	3     : Integer       */
            /*	6     : Decimal       */
            /*	11    : Date/Time     */
            /*	16    : Memo/Blob     */
            /*	calc  : Calculated    */
            /*------------------------*/
}

function fieldInfo_getTypeName() {
    /* this function is so you can set the code and get the name   */
    if (this.fieldtypename != '') {
        return this.fieldtypename;
    } else if (this.fieldtypecode != '') {
        this.fieldtypecode = consolidateFieldType(this.fieldtypecode);
        switch (this.fieldtypecode) {
            case ('1') :
                this.fieldtypename = globalResourceString;
                break;
            case ('3') :
                this.fieldtypename = globalResourceInteger;
                break;
            case ('6') :
                this.fieldtypename = globalResourceDecimal;
                break;
            case ('11') :
                this.fieldtypename = globalResourceDateTime;
                break;
            case ('16') :
                this.fieldtypename = globalResourceMemo;
                break;
            case ('calc') :
                this.fieldtypename = globalResourceCalculated;
                break;
            default:
                this.fieldtypename = globalResourceUnknown;
                break;
        }
        return this.fieldtypename;
    } else {
        return '';
    }
}

function consolidateFieldType(code) {
  switch (code) {
        case ('23') : case ('24') : case ('35') :
            return '1';
            break;
        case ('2') : case ('25') :
            return '3';
            break;
        case ('4') : case ('7') :
            return '6';
            break;
        case ('9') : case ('10') : case ('36') :
            return '11';
            break;
        case ('15') : case ('17') : case ('18') : case ('19') : case ('20') : case ('21') : case ('27') : case ('29') : case ('30') : case ('31') : case ('32') : case ('33') : case ('34') :
            return '16';
            break;
        default :
            return code;
            break;
  }
}

function fieldInfo_getTypeCode() {
    /* this function is so you can set the name and get the code   */
    if (this.fieldtypecode != '') {
        this.fieldtypecode = consolidateFieldType(this.fieldtypecode);
        return this.fieldtypecode;
    } else if (this.fieldtypename != '') {
        switch (this.fieldtypename) {
            case ('String') :
                this.fieldtypecode = '1';
                break;
            case ('Integer') :
                this.fieldtypecode = '3';
                break;
            case ('Decimal') :
                this.fieldtypecode = '6';
                break;
            case ('Date/Time') :
                this.fieldtypecode = '11';
                break;
            case ('Memo/Blob') :
                this.fieldtypecode = '16';
                break;
            case ('Calculated') :
                this.fieldtypecode = 'calc';
                break;
            default:
                this.fieldtypecode = 'unknown';
                break;
        }
        return this.fieldtypecode;
    } else {
        return '';
    }
}

function fieldInfo_asXML() {
    var ret = '<fieldinfo>';
    ret += '<datapath><![CDATA[' + this.datapath.replace(/!:/, '!') + ']]></datapath>';
    ret += '<alias>' + this.alias + '</alias>';
    ret += '<displayname>' + this.displayname + '</displayname>';
    ret += '<displaypath>' + this.displaypath + '</displaypath>';
    ret += '<fieldtypecode>' + this.fieldtypecode + '</fieldtypecode>';
    ret += '<fieldtypename>' + this.fieldtypename + '</fieldtypename>';
    ret += '</fieldinfo>';
    return ret;
}

function fieldInfo_buildDisplayPath() {
    /*  Use this function when you have a datapath and want to                 */
    /*  populate other properties (alias, displayname, displaypath) from it.   */
    var dPath = this.datapath;
    var disp = "";
    var isTable = true;
    var temp = "";
    for (var i = 0; i < dPath.length; i++) {
        var chr = dPath.charAt(i);
        if (isTable) {
            if ((chr == ":") || (chr == '!')) {
                //we just finished getting a table name...
                if (disp == "") {
                    disp = temp;
                } else {
                    disp = disp + "." + temp;
                }
                temp = "";
                isTable = false;
            } else {
                temp += chr;
            }
        } else if (chr == ".") {
            // we are at another table...
            isTable = true;
        }
    }
    // now that we have the tables, get the last field name
    var fName = "";
    if (dPath.indexOf("!") > -1) {
        fName = dPath.substr(dPath.lastIndexOf("!") + 1);
    } else {
        fName = dPath.substr(dPath.indexOf(":") + 1);
    }
    disp = disp + "." + fName;
    this.displaypath = disp;
    //just in case the alias and displayname properties are not set...
    this.alias = (this.alias == "") ? fName : this.alias;
    this.displayname = (this.displayname == "") ? fName : this.displayname;
    return disp;
}

function fieldInfo_getTableName() {
    if(this.datapath != "") {
        endpos = (this.datapath.lastIndexOf("!") > -1) ? this.datapath.lastIndexOf("!") : this.datapath.lastIndexOf(":");
        startpos = (this.datapath.lastIndexOf("!") > -1) ? (this.datapath.lastIndexOf(".") + 1) : 0;
        return this.datapath.substring(startpos, endpos);
    } else {
        return "";
    }
}

fieldInfo.prototype.asXML = fieldInfo_asXML;
fieldInfo.prototype.getTypeCode = fieldInfo_getTypeCode;
fieldInfo.prototype.getTypeName = fieldInfo_getTypeName;
fieldInfo.prototype.getTableName = fieldInfo_getTableName;
fieldInfo.prototype.buildDisplayPath = fieldInfo_buildDisplayPath;
/* ------------------------------------------------------------------------------------------------------*/
function layoutInfo(layoutXML) {
    /* Constructor for this class    */
        
    this.QBObjectType = "layoutInfo";
    this.alias = "";         //the real column name           eg: MAINPHONE
    this.datapath = "";      //the real datapath              eg: CONTACT:ACCOUNTID=ACCOUNTID.ACCOUNT!MAINPHONE
    this.displayname = "";   //the column name the user sees  eg: Main Phone
    this.displaypath = "";    //the path the user sees:        eg: Contact.Account.Main Phone
    this.fieldtypecode = ""; //the code of the field type
    this.fieldtypename = ""; //the name of the field type
    this.caption = "";       //the string to use as the column header
    this.width = "";         //the width of the display column
    this.align = "";         //alignment of the data
    this.captalign = "";     //alignment of the caption
    this.format = "";        //SLFormat type
    this.formatstring = "";  //Format String
    this.ishidden = false;   //Hidden field?
    this.visible = true;
    
    this.weblink = false;
    this.cssclass = "";
    
    if (layoutXML){
        var xmlDoc = getXMLDoc(layoutXML);
        if (xmlDoc) {
            this.ishidden = (xmlDoc.documentElement.nodeName == 'hiddenfield');
            if (!this.ishidden) {
                this.caption = getNodeText(xmlDoc.getElementsByTagName('caption')[0]);
                this.width = getNodeText(xmlDoc.getElementsByTagName('width')[0]);
                this.align = getNodeText(xmlDoc.getElementsByTagName('align')[0]);
                this.captalign = getNodeText(xmlDoc.getElementsByTagName('captalign')[0]);
                this.format = getNodeText(xmlDoc.getElementsByTagName('format')[0]);
                this.formatstring = getNodeText(xmlDoc.getElementsByTagName('formatstring')[0]);
            }
            this.alias = getNodeText(xmlDoc.getElementsByTagName('alias')[0]);
            this.datapath = getNodeText(xmlDoc.getElementsByTagName('datapath')[0]);
            this.displayname = getNodeText(xmlDoc.getElementsByTagName('displayname')[0]);
            this.displaypath = getNodeText(xmlDoc.getElementsByTagName('displaypath')[0]);
            if (xmlDoc.getElementsByTagName('visible')[0]) {
                this.visible = (getNodeText(xmlDoc.getElementsByTagName('visible')[0]) == 'T');
            }
            if (xmlDoc.getElementsByTagName('weblink')[0]) {
                this.weblink = (getNodeText(xmlDoc.getElementsByTagName('weblink')[0]) == 'T');
            }
            this.cssclass = getNodeText(xmlDoc.getElementsByTagName('cssclass')[0]);
        }
    }
}

function layoutInfo_asXML() {
    var res = '';
    if (!this.ishidden) {
        res = '<layout>';
        res += '<datapath><![CDATA[' + this.datapath.replace(/!:/, '!') + ']]></datapath>';
        res += '<alias><![CDATA[' + this.alias + ']]></alias>';
        res += '<displayname><![CDATA[' + this.displayname + ']]></displayname>';
        res += '<displaypath><![CDATA[' + this.displaypath + ']]></displaypath>';
        this.fieldtypecode = this.getTypeCode();
        res += '<fieldtype><![CDATA[' + this.fieldtypecode + ']]></fieldtype>';
        res += '<caption><![CDATA[' + this.caption + ']]></caption>';
        res += '<width>' + this.width + '</width>';
        res += '<align>' + this.align + '</align>';
        res += '<captalign>' + this.captalign + '</captalign>';
        res += '<format>' + this.format + '</format>';
        res += '<formatstring><![CDATA[' + this.formatstring + ']]></formatstring>';
        res += '<visible>' + (this.visible ? 'T' : 'F') + '</visible>';
        res += '<weblink>' + (this.weblink ? 'T' : 'F') + '</weblink>';
        res += '<cssclass>' + this.cssclass + '</cssclass>';
        res += '</layout>';
    } else {
        res = '<hiddenfield>';
        res += '<datapath><![CDATA[' + this.datapath + ']]></datapath>';
        res += '<alias><![CDATA[' + this.alias + ']]></alias>';
        res += '<displayname><![CDATA[' + this.displayname + ']]></displayname>';
        res += '<displaypath><![CDATA[' + this.displaypath + ']]></displaypath>';
        this.fieldtypecode = this.getTypeCode();
        res += '<fieldtype><![CDATA[' + this.fieldtypecode + ']]></fieldtype>';
        res += '</hiddenfield>';
        res += '<weblink>' + (this.weblink ? 'T' : 'F') + '</weblink>';
        res += '<cssclass>' + this.cssclass + '</cssclass>';
    }
    return res;
}

function layoutInfo_getTypeCode() {
    if (this.fieldtypecode != '') {
        this.fieldtypecode = consolidateFieldType(this.fieldtypecode);
        return this.fieldtypecode;
    } else if (this.fieldtypename != '') {
        var ofld = new fieldInfo();
        ofld.fieldtypename = this.fieldtypename;
        return ofld.getTypeCode();
    } else {
        return '';
    }
}

function layoutInfo_getTypeName() {
    if (this.fieldtypename != '') {
        return this.fieldtypename;
    } else if (this.fieldtypecode != '') {
        this.fieldtypecode = consolidateFieldType(this.fieldtypecode);
        var ofld = new fieldInfo();
        ofld.fieldtypecode = this.fieldtypecode;
        return ofld.getTypeName();
    } else {
        return '';
    }
}


layoutInfo.prototype.getTypeCode = layoutInfo_getTypeCode;
layoutInfo.prototype.getTypeName = layoutInfo_getTypeName;
layoutInfo.prototype.asXML = layoutInfo_asXML;
/* ------------------------------------------------------------------------------------------------------*/
function conditionInfo(condXML, paramXML) {
    /* Constructor for this class                       */
    this.QBObjectType = "conditionInfo";
    this.alias = "";        //the real column name           eg: MAINPHONE
    this.datapath = "";     //the real datapath              eg: CONTACT:ACCOUNTID=ACCOUNTID.ACCOUNT!MAINPHONE
    this.displayname = "";  //the column name the user sees  eg: Main Phone
    this.displaypath = "";   //the path the user sees:        eg: Contact.Account.Main Phone
    this.fieldtypecode = ""; //the code of the field type
    this.fieldtypename = ""; //the name of the field type
    this.operator = "";
    this.value = "";
    this.connector = "";
    this.leftparens = "";
    this.rightparens = "";
    this.isliteral = "";
    this.isnegated = "";
    this.casesens = "";

    if (condXML){
        var xmlDoc = getXMLDoc(condXML);
        if (xmlDoc) {
            this.alias = getNodeText(xmlDoc.getElementsByTagName('alias')[0]);
            this.datapath = getNodeText(xmlDoc.getElementsByTagName('datapath')[0]);
            this.displayname = getNodeText(xmlDoc.getElementsByTagName('displayname')[0]);
            this.displaypath = getNodeText(xmlDoc.getElementsByTagName('displaypath')[0]);
            this.fieldtypecode = getNodeText(xmlDoc.getElementsByTagName('fieldtype')[0]);
            this.fieldtypename = this.getTypeName();
            this.operator = getNodeText(xmlDoc.getElementsByTagName('operator')[0]);
                        
            var valText = getNodeText(xmlDoc.getElementsByTagName('value')[0]);
                     
            if ((paramXML) && (valText.toUpperCase().indexOf('VALUEPARAM') > 0)) {
                var paramXmlDoc = getXMLDoc(paramXML);
                var paramNodes = paramXmlDoc.getElementsByTagName('parameter');

                // look for matching parameter
                for (var i=0; i< paramNodes.length; i++) {
                    if (getNodeText(paramNodes[i].getElementsByTagName('name')[0]).toUpperCase() == valText.toUpperCase().substring(1, valText.length)) {
                    
                       valText = getNodeText( paramNodes[i].getElementsByTagName('value')[0]);
                   
                       switch (this.operator.trim().toUpperCase()) {
                            case ('STARTING WITH'):
                                valText = valText.substring(0, valText.length - 1);
                                break;
                            case ('LIKE'):
                                if (valText.indexOf('%') == 0) {
                                    valText = valText.replace('%', '');
                                }
                                if (valText.lastIndexOf('%') == valText.length - 1) {
                                    valText = valText.substring(0, valText.length - 1);
                                }
                                if (valText.indexOf('%') == 0) {
                                    valText = valText.replace(' ', '');
                                }
                                if (valText.lastIndexOf('%') == valText.length - 1) {
                                    valText = valText.substring(0, valText.length - 1);
                                }
                                break;
                       }
                       break;
                    }
                }
            }
            
            this.value = valText;
            
            
            this.connector = getNodeText(xmlDoc.getElementsByTagName('connector')[0]);
            this.connector = this.connector.trim();
            this.leftparens = getNodeText(xmlDoc.getElementsByTagName('leftparens')[0]);
            this.rightparens = getNodeText(xmlDoc.getElementsByTagName('rightparens')[0]);
            this.isliteral = getNodeText(xmlDoc.getElementsByTagName('isliteral')[0]);
            this.isnegated = getNodeText(xmlDoc.getElementsByTagName('isnegated')[0]);
            this.casesens = getNodeText(xmlDoc.getElementsByTagName('casesens')[0]);
        }
    }

}



function conditionInfo_asXML() {
    var ret = '<condition>';
    ret += '<alias><![CDATA[' + this.alias + ']]></alias>';
    ret += '<datapath><![CDATA[' + this.datapath.replace(/!:/, '!') + ']]></datapath>';
    ret += '<displayname><![CDATA[' + this.displayname + ']]></displayname>';
    ret += '<displaypath><![CDATA[' + this.displaypath + ']]></displaypath>';
    this.fieldtypecode = this.getTypeCode();
    ret += '<fieldtype><![CDATA[' + this.fieldtypecode + ']]></fieldtype>';
    ret += '<operator><![CDATA[' + this.operator + ']]></operator>';
    if (this.operator.toUpperCase().indexOf('IS') > -1) {
        this.value = 'NULL';
    }
    ret += '<value><![CDATA[' + this.value + ']]></value>';
    ret += '<connector><![CDATA[' + this.connector + ']]></connector>';
    ret += '<leftparens><![CDATA[' + this.leftparens + ']]></leftparens>';
    ret += '<rightparens><![CDATA[' + this.rightparens + ']]></rightparens>';
    ret += '<isliteral>' + this.isliteral + '</isliteral>';
    ret += '<isnegated>' + this.isnegated + '</isnegated>';
    ret += '<casesens>' + this.casesens + '</casesens>';
    ret += '</condition>';
    return ret;
}

function conditionInfo_getTypeCode() {
    if (this.fieldtypecode != '') {
        this.fieldtypecode = consolidateFieldType(this.fieldtypecode);
        return this.fieldtypecode;
    } else if (this.fieldtypename != '') {
        var ofld = new fieldInfo();
        ofld.fieldtypename = this.fieldtypename;
        return ofld.getTypeCode();
    } else {
        return '';
    }
}

function conditionInfo_getTypeName() {
    if (this.fieldtypename != '') {
        return this.fieldtypename;
    } else if (this.fieldtypecode != '') {
        this.fieldtypecode = consolidateFieldType(this.fieldtypecode);
        var ofld = new fieldInfo();
        ofld.fieldtypecode = this.fieldtypecode;
        return ofld.getTypeName();
    } else {
        return '';
    }
}

function conditionInfo_buildOperatorSelectHTML(strName, strOnChange) {
    if (strName == '') {
        strName = 'selOperator';
    }

    var txt = '<select id="'
    txt += strName;
    txt += '" name="';
    txt += strName;
    txt += '" style="width:155px"';
    if (strOnChange != '') {
        txt += 'onchange="' + strOnChange + '"';
    }
    txt += '>';

    var typ = this.getTypeCode();
    if ((typ.toUpperCase() == 'CALC') || (typ == '') || (typ == '0')) {
        typ = '1';
    }

    if ((typ == '1') || (typ == '16')) {
        // only strings and memo/blobs get this...
        txt += this.buildOptText(' STARTING WITH ', globalResourceStartingWith);
        txt += this.buildOptText(' LIKE ', globalResourceLike);
    }
    if (typ != '16') {
        // everything but blobs get this...
        txt += this.buildOptText('=', globalResourceEqual);
        txt += this.buildOptText('<>', globalResourceNotEqual);
        txt += this.buildOptText('<', globalResourceLessThan);
        txt += this.buildOptText('>', globalResourceGreaterThan);
        txt += this.buildOptText('<=', globalResourceLessThanOrEqual);
        txt += this.buildOptText('>=', globalResourceGreaterThanOrEqual);
    }
    if ((typ == '1') || (typ == '3')) {
        // only strings and integers get this...
        txt += this.buildOptText(' IN ', globalResourceIn);
    }
    if (typ == '11') {
        // only dates get this...
        txt += this.buildOptText(' WITHIN- ', globalResourceWithinLast);
        txt += this.buildOptText(' WITHIN+ ', globalResourceWithinNext);
    }
    //everybody gets this...
    txt += this.buildOptText(' IS ', globalResourceDoesNotContainData);
    txt += this.buildOptText(' IS NOT ', globalResourceDoesContainData);
    txt += '</select>';
    return txt;

}

function conditionInfo_buildOptText(strValue, strText) {
    var thisVal = (this.operator == "") ? "=" : this.operator.toUpperCase();

    var ret = '<option value="';
    ret += strValue;
    ret += '" ';

    //trim both values for comparison...
    if (thisVal.indexOf(' ') == 0) {
        thisVal = thisVal.replace(' ', '');
    }
    if (thisVal.lastIndexOf(' ') == thisVal.length - 1) {
        thisVal = thisVal.substring(0, thisVal.length - 1);
    }
    if (strValue.indexOf(' ') == 0) {
        strValue = strValue.replace(' ', '');
    }
    if (strValue.lastIndexOf(' ') == strValue.length - 1) {
        strValue = strValue.substring(0, strValue.length - 1);
    }

    if (thisVal == strValue.toUpperCase()) {
        ret += 'selected';
    }
    ret += '>' + strText + '</option>';
    return ret;
}

conditionInfo.prototype.buildOptText = conditionInfo_buildOptText;
conditionInfo.prototype.buildOperatorSelectHTML = conditionInfo_buildOperatorSelectHTML;
conditionInfo.prototype.getTypeCode = conditionInfo_getTypeCode;
conditionInfo.prototype.getTypeName = conditionInfo_getTypeName;
conditionInfo.prototype.asXML = conditionInfo_asXML;

/* ------------------------------------------------------------------------------------------------------*/
function sortInfo(sortXML) {
    /* Constructor for this class                       */
    this.QBObjectType = "sortInfo";
    this.alias = "";        //the real column name           eg: MAINPHONE
    this.datapath = "";     //the real datapath              eg: CONTACT:ACCOUNTID=ACCOUNTID.ACCOUNT!MAINPHONE
    this.displayname = "";  //the column name the user sees  eg: Main Phone
    this.displaypath = "";  //the path the user sees:        eg: Contact.Account.Main Phone
    this.sortorder = "";    //ASC or DESC

    if (sortXML){
        var xmlDoc = getXMLDoc(sortXML);
        if (xmlDoc) {
            this.alias = getNodeText(xmlDoc.getElementsByTagName('alias')[0]);
            this.datapath = getNodeText(xmlDoc.getElementsByTagName('datapath')[0]);
            this.displayname = getNodeText(xmlDoc.getElementsByTagName('displayname')[0]);
            this.displaypath = getNodeText(xmlDoc.getElementsByTagName('displaypath')[0]);
            this.sortorder = getNodeText(xmlDoc.getElementsByTagName('sortorder')[0]);
        }
    }
}

function sortInfo_asXML() {
    var ret = '<sort>';
    ret += '<datapath>' + this.datapath.replace(/!:/, '!') + '</datapath>';
    ret += '<alias>' + this.alias + '</alias>';
    ret += '<displayname>' + this.displayname + '</displayname>';
    ret += '<displaypath>' + this.displaypath + '</displaypath>';
    ret += '<sortorder>' + this.sortorder + '</sortorder>';
    ret += '</sort>';
    return ret;
}

sortInfo.prototype.asXML = sortInfo_asXML;

/* ------------------------------------------------------------------------------------------------------*/
function calcFieldInfo(calcFieldXML) {
    //constructor...
    this.QBObjectType = 'calcFieldInfo';
    this.calcFieldID = '';
    this.name = '';
    this.alias = '';
    this.baseTable = '';
    this.realTableName = '';
    this.calcType = 'S';
    this.paths = '';
    this.text = '';
    this.fieldCount = 0;
    this.displayText = '';
    this.description = '';

    if (calcFieldXML){
        var xmlDoc = getXMLDoc(calcFieldXML);
        if (xmlDoc) {
            this.calcFieldID = getNodeText(xmlDoc.getElementsByTagName('calcfieldid')[0]);
            this.name = getNodeText(xmlDoc.getElementsByTagName('name')[0]);
            this.parseCalculation(getNodeText(xmlDoc.getElementsByTagName('calculation')[0]));
            this.baseTable = getNodeText(xmlDoc.getElementsByTagName('basetable')[0]);
            this.realTableName = getNodeText(xmlDoc.getElementsByTagName('realTableName')[0]);
            this.description = getNodeText(xmlDoc.getElementsByTagName('description')[0]);
            var localizedText = getNodeText(xmlDoc.getElementsByTagName('localizedDisplayValue')[0]);
            if ((localizedText) && (localizedText.length > 1))
                this.displayText = localizedText;
        }
    }
}


function calcFieldInfo_asXML() {
    var ret = '<calcfield>';
    ret += '<calcfieldid>' + this.calcFieldID + '</calcfieldid>';
    ret += '<name><![CDATA[' + this.name + ']]></name>';
    ret += '<calculation><![CDATA[' + this.buildCalculation() + ']]></calculation>';
    ret += '<basetable>' + this.baseTable + '</basetable>';
    ret += '<realTableName>' + this.realTableName + '</realTableName>';    
    ret += '<description><![CDATA[' + this.description + ']]></description>';
    ret += '</calcfield>';
    return ret;
}

function calcFieldInfo_parseCalculation(calcStr) {
    if (calcStr.indexOf('|') == 0) {
        calcStr = calcStr.substr(1);
    }
    if (calcStr.lastIndexOf('|') == calcStr.length - 1) {
        calcStr = calcStr.substring(0, calcStr.length - 1);
    }
    
    var parts = calcStr.split('|');
    if (parts.length > 2) {
        this.alias = parts[0];
        this.calcType = parts[1].charAt(0);
        this.text = parts[1].substr(1);
        this.displayText = this.text;
        var fldCnt = 0;
        for (var i = 3; i < parts.length; i++) {
            fldCnt++
            this.paths += '|';
            this.paths += parts[i];
            this.displayText = this.displayText.replace('%' + fldCnt, this.makePrettyPath(parts[i]));
        }
        this.fieldCount = fldCnt;
    }
}

function calcFieldInfo_makePrettyPath(strDataPath) {
    return strDataPath;
}

function calcFieldInfo_buildCalculation() {
    var ret = '|';
    ret += this.alias;
    ret += '|';
    ret += this.calcType + this.text;
    ret += '|';
    ret += this.fieldCount;
    //ret += '|';  //paths have the | in front
    ret += this.paths;
    ret += '|';
    return ret;
}

calcFieldInfo.prototype.asXML = calcFieldInfo_asXML;
calcFieldInfo.prototype.buildCalculation = calcFieldInfo_buildCalculation;
calcFieldInfo.prototype.makePrettyPath = calcFieldInfo_makePrettyPath;
calcFieldInfo.prototype.parseCalculation = calcFieldInfo_parseCalculation;

/* ------------------------------------------------------------------------------------------------------*/
function joinInfo(joinXML) {
    this.QBObjectType = "joinInfo";
    this.joinid = "";
    this.fromtable = "";
    this.fromfield = "";
    this.totable = "";
    this.tofield = "";
    this.totablepath = "";
    this.secondary = "";
    this.cascadetype = "";
    this.usebydefault = "";
    this.jointype = "";
    this.islocaljoin = "F";  // this is something we added to pass into the Join Editor so it knows how to display itself.

    if (joinXML) {
        var xmlDoc = getXMLDoc(joinXML);
        if (xmlDoc) {
            this.joinid = getNodeText(xmlDoc.getElementsByTagName('joinid')[0]);
            this.fromtable = getNodeText(xmlDoc.getElementsByTagName('fromtable')[0]);
            this.fromfield = getNodeText(xmlDoc.getElementsByTagName('fromfield')[0]);
            this.totable = getNodeText(xmlDoc.getElementsByTagName('totable')[0]);
            this.tofield = getNodeText(xmlDoc.getElementsByTagName('tofield')[0]);
            this.secondary = getNodeText(xmlDoc.getElementsByTagName('secondary')[0]);
            this.cascadetype = getNodeText(xmlDoc.getElementsByTagName('cascadetype')[0]);
            this.usebydefault = getNodeText(xmlDoc.getElementsByTagName('usebydefault')[0]);
            this.jointype = getNodeText(xmlDoc.getElementsByTagName('jointype')[0]);
            if (xmlDoc.getElementsByTagName("islocaljoin")[0]) {
                this.islocaljoin = getNodeText(xmlDoc.getElementsByTagName("islocaljoin")[0]);
            } else {
                this.islocalJoin = "F";
            }
            this.totablepath = (xmlDoc.getElementsByTagName("totablepath")[0])
                        ? getNodeText(xmlDoc.getElementsByTagName("totablepath")[0])
                        : '';
        }
    }
}

function joinInfo_asXML() {
    var retXML = '<join><joinid>';
    retXML += this.joinid;
    retXML += '</joinid><fromtable>';
    retXML += this.fromtable;
    retXML += '</fromtable><fromfield>';
    retXML += this.fromfield;
    retXML += '</fromfield><totablepath>';
    retXML += this.totablepath;
    retXML += '</totablepath><totable>';
    retXML += this.totable;
    retXML += '</totable><tofield>';
    retXML += this.tofield;
    retXML += '</tofield><secondary>';
    retXML += this.secondary;
    retXML += '</secondary><cascadetype>';
    retXML += this.cascadetype;
    retXML += '</cascadetype><usebydefault>';
    retXML += this.usebydefault;
    retXML += '</usebydefault><jointype><![CDATA[';
    retXML += this.jointype;
    retXML += ']]></jointype></join>';
    return retXML;

}

joinInfo.prototype.asXML = joinInfo_asXML;

//Other query builder functions...






















