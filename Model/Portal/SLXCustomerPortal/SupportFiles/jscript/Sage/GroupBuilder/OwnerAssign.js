// Client Script for OwnerAssign.ascx
var currentTab = 0;
var tabUsers = 0;
var tabDepartments = 1;
var tabTeams = 2;
var users;
var teams;
var departments;

var currentUserID = OwnerAssignResources.CurrentUserID;
var ownerXML = OwnerAssignResources.ownerXML;

function loadTabs() {

    var xmlDoc = getXMLDoc(ownerXML);
    
    users.length = 0;
    //var list = xmlDoc.selectSingleNode("Owners/Users").childNodes;
    var list = xmlDoc.getElementsByTagName('Users')[0].childNodes;
    users.length = list.length;
    var ctr = 0;
    for (var i=0; i<list.length; i++) {
        var userTypeElem = document.getElementById('userType');
        var userType = userTypeElem.options[userTypeElem.selectedIndex].value;
  
        var type = getNodeText(list[i].getElementsByTagName("type")[0]);
                
        if (userType.indexOf(type) > -1) {
            users[ctr].value = getNodeText(list[i].getElementsByTagName("seccodeid")[0]);
            var stext = getNodeText(list[i].getElementsByTagName("seccodedesc")[0]); 
            users[ctr].text = stext;    
            ctr++;
        }
    }
    users.length = ctr;
    teams.length = 0;
  
    list = xmlDoc.getElementsByTagName("Teams")[0].childNodes;
    teams.length = list.length;
    ctr = 0;
    for (var i=0; i<list.length; i++) { 
        if (document.getElementById('myteams').checked) {
            if (getNodeText(list[i].getElementsByTagName("member")[0]) == "true") {
                teams[ctr].value = getNodeText(list[i].getElementsByTagName("seccodeid")[0]); 
                teams[ctr].text = getNodeText(list[i].getElementsByTagName("seccodedesc")[0]);  
                ctr++;
            }
        } else {
            teams[i].value = getNodeText(list[i].getElementsByTagName("seccodeid")[0]); 
            teams[i].text = getNodeText(list[i].getElementsByTagName("seccodedesc")[0]);    
        }
    }
    departments.length = 0;
   
     list = xmlDoc.getElementsByTagName("Departments")[0].childNodes;
    departments.length = list.length;
    for (var i=0; i<list.length; i++) {
        departments[i].value = getNodeText(list[i].getElementsByTagName("seccodeid")[0]); 
        departments[i].text = getNodeText(list[i].getElementsByTagName("seccodedesc")[0]);  
    }
} 

function tabClick(tab) {
      switch (tab) {
        case (0) :
            document.getElementById("tabUser").style.fontWeight = 'bold';
            document.getElementById("tabpageUser").style.display = 'inline';
            document.getElementById("tabDep").style.fontWeight = 'normal';
            document.getElementById("tabpageDep").style.display = 'none';
            document.getElementById("tabTeam").style.fontWeight = 'normal';
            document.getElementById("tabpageTeam").style.display = 'none';
            break;
        case (1) :
            document.getElementById("tabUser").style.fontWeight = 'normal';
            document.getElementById("tabpageUser").style.display = 'none';
            document.getElementById("tabDep").style.fontWeight = 'bold';
            document.getElementById("tabpageDep").style.display = 'inline';
            document.getElementById("tabTeam").style.fontWeight = 'normal';
            document.getElementById("tabpageTeam").style.display = 'none';
            break;
        case (2) :
            document.getElementById("tabUser").style.fontWeight = 'normal';
            document.getElementById("tabpageUser").style.display = 'none';
            document.getElementById("tabDep").style.fontWeight = 'normal';
            document.getElementById("tabpageDep").style.display = 'none';
            document.getElementById("tabTeam").style.fontWeight = 'bold';
            document.getElementById("tabpageTeam").style.display = 'inline';
            break;			
    }
    currentTab = tab;
}
function userType_onchange() {
    loadTabs();
}
function myteams_onclick() {
    loadTabs();
}
function body_onload() {
    users = document.getElementById("selUsers").options;
    teams = document.getElementById("selTeams").options;
    departments = document.getElementById("selDepartments").options;
    if (currentUserID == "ADMIN") {
        document.getElementById("myteams").style.display = 'none';
        document.getElementById("lblMYTEAMS").style.display = 'none';	
    }
    loadTabs();
    tabClick(0);
}

// Attach OnLoad event
dojo.ready(body_onload);
    
function buildReturnVal(optionlist) {
    var res = "";
    for (var i=0; i<optionlist.length; i++) {
        if (optionlist[i].selected)
            res += "<owner><value>" + optionlist[i].value + "</value><name>" + optionlist[i].text + "</name></owner>";
    }
    return res;
}
function ok_onclick() {
    var returnXML = "<Owners>";
    returnXML += buildReturnVal(document.getElementById("selUsers").options);
    returnXML += buildReturnVal(document.getElementById("selTeams").options);
    returnXML += buildReturnVal(document.getElementById("selDepartments").options);
    returnXML += "</Owners>"
    
    if (window.opener) {
    
        window.opener.ShareGroup_CallBack(returnXML);
    }
    
    window.close();
}

