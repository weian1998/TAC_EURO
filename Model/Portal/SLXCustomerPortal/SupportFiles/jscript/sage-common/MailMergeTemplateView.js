var templateTree;
var templatePanel;
var templateName;
var templateId;
var templateXML;

function capFirstLetter(aString) {
    var first = aString.charAt(0).toUpperCase();
    return first + aString.substr(1).toLowerCase();
}

function closeTemplates() {
    templatePanel.hide();
}

function applyData(nodeInfo) {
    document.getElementById(templateId).value = nodeInfo.id;
    document.getElementById(templateName).value = nodeInfo.name;
    templatePanel.hide();
}

function localizeName(val) {
    if (typeof MasterPageLinks[val] != "undefined")
        return MasterPageLinks[val];
    if (typeof MasterPageLinks[val.toLowerCase()] != "undefined")
        return MasterPageLinks[val.toLowerCase()];
    return val;
}

function processNode(xnode, treeParent) {
    var newTreeNode;
    var nodeInfo = new Object;
    if (xnode.nodeName.toLowerCase() == 'item') {
        newTreeNode = new Ext.tree.TreeNode({
            text: localizeName(xnode.attributes.getNamedItem("name").nodeValue),
            templateid: xnode.attributes.getNamedItem("templateid").nodeValue
        });
        newTreeNode.on("click", function () { applyData({ name: newTreeNode.text, id: xnode.attributes.getNamedItem("templateid").nodeValue }); });
    } else {
        newTreeNode = new Ext.tree.TreeNode({
            text: capFirstLetter(localizeName(xnode.nodeName)),
            singleClickExpand: true
        });
    }
    treeParent.appendChild(newTreeNode);
    if (!(xnode.nextSibling == null)) {
        processNode(xnode.nextSibling, treeParent);
    }
    if (!(xnode.firstChild == null)) {
        processNode(xnode.firstChild, newTreeNode);
    }
}

function treeInit() {
    templateTree = new Ext.tree.TreePanel({
        rootVisible: false,
        border: false,
        layout: "fit",
        animate: false,
        autoScroll: true
    });
    var root = new Ext.tree.TreeNode({
        title: "Templates"
    });
    templateTree.setRootNode(root);
    var node = document.getElementById(templateXML).value
    var doc = getXMLDoc(node);
    var xnode = doc.firstChild;
    while (xnode.nodeName.toUpperCase() != "TEMPLATES") {
        xnode = xnode.nextSibling;
    }
    processNode(xnode.firstChild, root);

    templatePanel = new Ext.Window({
        id: this._id + "_template_dialog",
        layout: "border",
        closeAction: "hide",
        title: MasterPageLinks.MailMergeView_Title,
        plain: true,
        height: 600,
        width: 500,
        stateful: false,
        constrain: true,
        items: [{
            region: "center",
            border: false,
            layout: "fit",
            items: [templateTree]
}],
            buttonAlign: "right",
            buttons: [{
            text: MasterPageLinks.MailMergeView_Cancel,
                handler: function() {
                    templatePanel.hide();
                }
}]
            });

            templatePanel.doLayout();
        }
        
function setUp() {
    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(treeInit);
}

function ShowMailMergeTemplates(tmpName, tmpId, tmpXML) {
    templateXML = tmpXML;
    templateName = tmpName;
    templateId = tmpId;
    setUp();
    treeInit();
    templatePanel.show();
    templateTree.expandAll();
    templatePanel.center();
    if (typeof idTemplates === "function") idTemplates();
}