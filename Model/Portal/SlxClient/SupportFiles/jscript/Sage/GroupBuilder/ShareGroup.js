
var groupID = ShareGroupResources.GroupID;

function body_onload() {
    if (document.getElementById(ShareGroupResources.txtEveryone).value != "true")
        document.getElementById("btnEveryone").style.display = "none";
    var lb = document.getElementById(ShareGroupResources.lbReleases).options;
    var sel = document.getElementById("selReleases").options;
    for (var i = 0; i < lb.length; i++) {
        var newOpt = document.createElement('option');
        newOpt.value = lb[i].value;
        newOpt.text = lb[i].text;
        try {
            sel.add(newOpt, null);
        } catch(ex) {
            sel.add(newOpt);
        }
    }
}

// Attach OnLoad event
dojo.ready(body_onload);

function remove_onclick() {
    var releases = document.getElementById("selReleases").options;
    for (var i = releases.length - 1; i > -1; i--) {
        if (releases[i].selected)
            releases[i] = null;
    }
}
function everyone_onclick() {
    var sel = document.getElementById("selReleases").options;
    for (var i=0; i<sel.length; i++) {
        if ((sel[i].text==ShareGroupResources.lclEveryone)&&(sel[i].value=="SYST00000001"))
            return; //already in the list
    }
    var newOpt = document.createElement('option');
    newOpt.value = "SYST00000001";
    newOpt.text = ShareGroupResources.lclEveryone;
    try {
        sel.add(newOpt, null);
    } catch(ex) {
        sel.add(newOpt);
    }
}
function ok_onclick() {
    ids = "";
    var sel = document.getElementById("selReleases").options;
    for (var i = 0; i < sel.length; i++) {
        ids += sel[i].value + ",";
    }

    var vUrl = "SLXGroupBuilder.aspx?method=ReleaseGroup&gid=" + groupID + "&toids=" + ids;
    dojo.xhrGet({
        url: vUrl,
        error: function () { window.close(); },
        load: function () { window.close(); }
    });
}
function add_onclick() {
    var vURL = 'OwnerAssign.aspx';
    window.open(vURL, "OwnerAssign","resizable=yes,centerscreen=yes,width=500,height=450,status=no,toolbar=no,scrollbars=yes");
}

function ShareGroup_CallBack(ownerResultXML) {
  
    var selOptions = document.getElementById("selReleases").options;
    if (ownerResultXML) {
        var xmlDoc = getXMLDoc(ownerResultXML);
        var list = xmlDoc.documentElement.childNodes;
        for (var i=0;i<list.length;i++) {
            // is this name already in the list?
            var bNotFound = true;
            var val = getNodeText(list[i].getElementsByTagName("value")[0]);
    
            for (var x = 0; x < selOptions.length; x++) {
                if (selOptions[x].value == val) {
                    bNotFound = false;
                    break;
                }
            }
            if (bNotFound) {
                var newOpt = document.createElement('option');
                newOpt.value = val;
                newOpt.text = getNodeText(list[i].getElementsByTagName("name")[0]);
                try {
                    selOptions.add(newOpt, null);
                } catch (ex) {
                    selOptions.add(newOpt);
                }
            }
        }
    }


}