// Client Script for JoinEditor.ascx

var TableListText = JoinEditorResources.TableListXML;
var LocalJoinText = JoinEditorResources.LocalJoinText;
var EditGlobalJoinText = JoinEditorResources.EditGlobalJoinText;
var SelectAlertMessage = JoinEditorResources.SelectAlertMessage;
var SerializeError = JoinEditorResources.SerializeError;

function init() {
    var pObj = document.getElementById("parentTables");
    var cObj = document.getElementById("childTables");

    var TableList = Sys.Serialization.JavaScriptSerializer.deserialize(TableListText);
    if ((!TableList) || (!TableList.tables)) {
        alert(SerializeError);
    }
    for (var i = 0; i < TableList.tables.length; i++) {
        var popt = document.createElement("OPTION");
        var copt = document.createElement("OPTION");
        pObj.options.add(popt);
        cObj.options.add(copt);
        popt.value = TableList.tables[i].name;
        copt.value = TableList.tables[i].name;
        popt.innerHTML = TableList.tables[i].dispname;
        copt.innerHTML = TableList.tables[i].dispname;
    }
    
    if ((window.opener.joinObjForEdit) && (window.opener.joinObjForEdit.QBObjectType)) {
        if (window.opener.joinObjForEdit.QBObjectType == "joinInfo") {
            var joinObj = window.opener.joinObjForEdit;
        
            if (joinObj.islocaljoin == "T") {
                document.getElementById("parentTables").disabled = true;
                document.getElementById("parentFields").disabled = true;
                document.getElementById("joinOptions").style.display = 'none';
            } else {
                if (joinObj.joinid.indexOf('SYST') > -1) {
                    // This is a system join so the tables and columns should not be editable.
                    document.getElementById("parentTables").disabled = true;
                    document.getElementById("parentFields").disabled = true;
                    document.getElementById("childFields").disabled = true;
                    document.getElementById("childTables").disabled = true;
                }			
            }
            document.getElementById("joinid").value = joinObj.joinid;
            document.getElementById("childTables").value = joinObj.fromtable;
            getTableFields(joinObj.fromtable, document.getElementById("childFields"));
            document.getElementById("childFields").value = joinObj.fromfield;
            document.getElementById("parentTables").value = joinObj.totable;
            getTableFields(joinObj.totable, document.getElementById("parentFields"));
            document.getElementById("parentFields").value = joinObj.tofield;
            //joinObj.secondary = "F";
            document.getElementById("cascade").value = joinObj.cascadetype;
            document.getElementById("visibility").value = joinObj.usebydefault;
            if (joinObj.jointype == "=") {
                document.forms[0].jointype[0].checked = true;
            } else if (joinObj.jointype == ">") {
                document.forms[0].jointype[1].checked = true;
            } else {
                document.forms[0].jointype[2].checked = true;
            }
        }
    } else {
        getTableFields(pObj.value, document.getElementById("parentFields"));	
    }
}

dojo.ready(init);

function getTableFields(aTableName, aListObj) {
    if ((aTableName) && (aListObj)) {
        var vURL = "SLXGroupBuilder.aspx?method=GetColumnsForTable&tbl=" + aTableName;
        var xmlDoc = null;

        dojo.xhrGet({
            url: vURL,
            sync: true,
            load: function (data) {
                xmlDoc = getXMLDoc(data);
                if (xmlDoc) {
                    // Now that we have the list of fields, we need to display them...
                    var fields = xmlDoc.documentElement.getElementsByTagName('Field');

                    // Clear the list object
                    aListObj.innerHTML = "";

                    //Add the fields...
                    for (var i = 0; i < fields.length; i++) {
                        var opt = document.createElement("OPTION");
                        aListObj.options.add(opt);
                        opt.value = fields[i].getAttribute('name');
                        opt.innerHTML = fields[i].getAttribute('displayname');
                    }
                }
            },
            error: function (err) {
            }
        });
    }
}

function parentTableChanged() {
    getTableFields(document.getElementById("parentTables").value, document.getElementById("parentFields"));
}

function childTableChanged() {
    getTableFields(document.getElementById("childTables").value, document.getElementById("childFields"));
}

function save() {
    //var f = document.mainform;
    if ((document.getElementById("childTables").value == "") || (document.getElementById("childFields").value == "") || (document.getElementById("parentTables").value == "") || (document.getElementById("parentFields").value == "")) {
        alert(SelectAlertMessage);
        return;
    }
    var joinObj = new joinInfo();
    joinObj.joinid = document.getElementById("joinid").value;
    joinObj.fromtable = document.getElementById("childTables").value;
    joinObj.fromfield = document.getElementById("childFields").value;
    joinObj.totable = document.getElementById("parentTables").value;
    joinObj.tofield = document.getElementById("parentFields").value;
    joinObj.secondary = "F";
    joinObj.cascadetype = document.getElementById("cascade").value;
    joinObj.usebydefault = document.getElementById("visibility").value;
    if (document.forms[0].jointype[0].checked) {
        joinObj.jointype = "=";
    } else if (document.forms[0].jointype[1].checked) {
        joinObj.jointype = ">";
    } else {
        joinObj.jointype = "<";
    }
    var joinXML = joinObj.asXML();
    
    if ((joinXML) && (window.opener)) {
        if ((window.opener.joinObjForEdit) && (window.opener.joinObjForEdit.islocaljoin == "T")) {
            joinObj.totablepath = window.opener.joinObjForEdit.totablepath;
            window.opener.QueryBuilderMain.joinXML = joinObj.asXML();
            window.opener.QueryBuilderMain.HandleJoinEditor();
        } else {
            var vURL = "SLXGroupBuilder.aspx?method=SaveJoin&joinid=" + joinObj.joinid;
            dojo.xhrPost({
                url: vURL,
                sync: true,
                postData: joinXML,
                headers: {'Content-Type': 'application/xml'},
                load: function (data) {
                    if (data != "") {
                        window.opener.location = "GlobalJoinManager.aspx";
                    }
                },
                error: function (err) {
                }
            });
          }
    }
    window.close();
    
}



