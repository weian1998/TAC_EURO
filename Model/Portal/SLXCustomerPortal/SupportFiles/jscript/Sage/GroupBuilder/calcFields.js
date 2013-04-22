// Client Script for calcFiels.ascx
// Cross Browser  xmlHttp support
var calcFieldObj;
var calcFieldXML;

var deleteMessage = calcFieldResources.deleteMessage; //'Are you sure you want to delete this record: Yes I am.

var dgCalcFields;
dgCalcFields = new SLXDataGrid("grdCalcFields");


dojo.connect(dgCalcFields, 'onrendercomplete', dgCalcFields, buildTable);
dojo.connect(dgCalcFields, 'onrowselect', dgCalcFields, rowSelected);
dojo.connect(dgCalcFields, 'onrowdeselect', dgCalcFields, rowDeSelected);

function closeWin() {
    window.close();
}
    
function addItem() {
    var vURL = 'addCalcField.aspx';
    window.open(vURL, "addCalcField","dialog=yes,centerscreen=yes,width=600,height=440,status=no,toolbar=no,scrollbars=yes,modal=yes,title='addCalcField'");
}

function calcFields_CallBack() {
    if (calcFieldXML) {
        var vURL = "SLXGroupBuilder.aspx?method=SaveCalculatedField";
        dojo.xhrPost({
            url: vURL,
            sync: true,
            postData: calcFieldXML,
            load: function (data) {
                if (data != "") {
                    window.location = "calcfields.aspx";
                }
            },
            error: function (err) {
            }
        });
    }
}

function editItem() {
    var idx = dgCalcFields.selectedIndex;
    if (idx > 0) {
        var row = document.getElementById("grdCalcFields").rows[idx];
        calcFieldObj = row.calcFieldObj;
        var vURL = 'addCalcField.aspx?tbl=' + calcFieldObj.baseTable;
        window.open(vURL, "addCalcField","dialog=yes,centerscreen=yes,width=600,height=440,status=no,toolbar=no,scrollbars=yes,modal=yes,title='addCalcField'");
    }
}

function deleteItem() {
    var idx = dgCalcFields.selectedIndex;
    if (idx > 0) {
        var row = document.getElementById("grdCalcFields").rows[idx];
        if (confirm(deleteMessage)) {
            document.getElementById("postType").value = "del";
            var calcFieldObj = dgCalcFields.gridElement.rows[idx].calcFieldObj;
                        
            var vURL = "SLXGroupBuilder.aspx?method=DeleteCalculatedField&calcFieldID=" + calcFieldObj.calcFieldID;

            dojo.xhrGet({
                url: vURL,
                sync: true,
                load: function (data) {
                    if (data != "") {
                        window.location = "calcfields.aspx";
                    }
                },
                error: function (err) {
                }
            });
        }
    }
}

function rowSelected(index) {
    var calcFieldObj = dgCalcFields.gridElement.rows[index].calcFieldObj;
    document.getElementById("displayText").innerHTML = calcFieldObj.displayText;		
}

function rowDeSelected() {
    document.getElementById("displayText").innerHTML = '';
}

function buildTable() {
      sortcol = document.getElementById("sortcol").value - 0 + 1;
    sortdir = document.getElementById("sortdir").value;
    var xmlDoc = getXMLDoc(calcFieldResources.calcFieldXML);
    
    if (xmlDoc) {
        var nodes = xmlDoc.getElementsByTagName('calcfield');
        var grd = document.getElementById("grdCalcFields");
        for (var i = 0; i < nodes.length; i++) {
            var calcFieldObj = new calcFieldInfo(getNodeXML(nodes[i]));
            var pos = 0;
            var compstr = "";
            switch (sortcol) {
                case(2) :
                    compstr = calcFieldObj.name.toUpperCase();
                    break;
                case(3) :
                    compstr = calcFieldObj.alias.toUpperCase();
                    break;
                default :
                    compstr = calcFieldObj.baseTable.toUpperCase();
                    break;
            }
            for (var x = 1; x < grd.rows.length; x++) {
                if (sortdir == "ASC") {
                    if (compstr < grd.rows[x].cells[sortcol].innerHTML.toUpperCase()) {
                        pos = x;
                        break;
                    }
                } else {
                    if (compstr > grd.rows[x].cells[sortcol].innerHTML.toUpperCase()) {
                        pos = x;
                        break;
                    }
                }
            }
            
            var row = dgCalcFields.addNewRow(pos);
            row.cells[0].innerHTML = calcFieldObj.baseTable;
            row.cells[1].innerHTML = calcFieldObj.name;
            row.cells[2].innerHTML = calcFieldObj.alias;
            row.calcFieldObj = calcFieldObj; 
        }
    }
}

function sortTable() {
    document.getElementById("sortcol").value = event.colIndex;
    document.getElementById("sortdir").value = event.sortdir;
    //clean the table out.
    var grd = document.getElementById("grdCalcFields");
    for (var i = grd.rows.length - 1; i > 0; i--) {
        grd.deleteRow(i);
    }
    // build it again.
    buildTable();
}

