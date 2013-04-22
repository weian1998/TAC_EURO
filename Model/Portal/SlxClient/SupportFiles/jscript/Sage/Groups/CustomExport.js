/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
/* -------------------------------------------------------------------------                  
Sage SalesLogix Desktop Integration
Sage.Groups.CustomExport
Copyright(c) 2010-2012, Sage Software                         
------------------------------------------------------------------------- */

define ([
        "Sage/MailMerge/Helper",
        "Sage/MailMerge/Service",        
        "Sage/UI/Dialogs",
        "dojo/string",
        "dojo/_base/declare"
    ],
// ReSharper disable InconsistentNaming
    function(Helper, DesktopService, Dialogs, dString, declare) {
        // ReSharper restore InconsistentNaming
        var oGroupsCustomExport = declare("Sage.Groups.CustomExport", null, {
            constructor : function(groupId, useGroupContext) {
                this.DataLoaded = false;
                this.GroupDatasetReader = new Sage.SimpleXmlReader();
                this.GroupId = null;
                this.GroupName = null;
                this.GroupReader = new Sage.SimpleXmlReader();
                this.GroupTable = null;
                if (dojo.isString (groupId)) {
                    this.GroupId = groupId;
                }
                this.LastError = null;
                this.RaiseErrorWhenNoRecords = false;
                this.Service = Helper.GetDesktopService();
                this.ShowProgress = true;
                this.UseGroupContext = null;
                this.WhichReader = {
                    wrGroup : 0,
                    wrGroupDataset : 1
                };
                if (this.Service == null) {
                    throw new Error (Helper.DesktopErrors().DesktopServiceHelperError);
                }
                if (typeof useGroupContext === "boolean") {
                    this.UseGroupContext = useGroupContext;
                }
                if (typeof this.UseGroupContext === "boolean" && this.UseGroupContext) {
                    this.LoadGroupContext();
                }
            },
            CleanGroupName : function(groupName) {
                var result = String (groupName);
                var oRegExp = new RegExp ('[/:"*?<>|\r\n]+', "g");
                result = result.replace (oRegExp, "");
                return result;
            },
            Execute : function() {
                if (!dojo.isString (this.GroupId) || (dojo.isString (this.GroupId) && this.GroupId == "")) {
                    throw new Error (Helper.DesktopErrors().InvalidGroupId);
                }

            },
            GetGroupDatasetNodeText : function(path, node) {
                var sText = this.GetNodeText (this.WhichReader.wrGroupDataset, path, node);
                return sText;
            },
            GetGroupNodeText : function(path, node) {
                var sText = this.GetNodeText (this.WhichReader.wrGroup, path, node);
                return sText;
            },
            GetNodeText : function(which, path, node) {
                var oNode;
                var sText;
                switch (which) {
                    case this.WhichReader.wrGroup:
                        oNode = this.GroupReader.selectSingleNode (path, node);
                        if (oNode) {
                            sText = this.GroupReader.getNodeText (oNode);
                            return sText;
                        }
                        break;
                    case this.WhichReader.wrGroupDataset:
                        oNode = this.GroupDatasetReader.selectSingleNode (path, node);
                        if (oNode) {
                            sText = this.GroupDatasetReader.getNodeText (oNode);
                            return sText;
                        }
                        break;
                }
                return "";
            },
            HideProgress : function() {
                if (this.ShowProgress) {
                    Dialogs.closeProgressBar();
                }
            },
            LoadGroupContext : function() {
                this.GroupId = null;
                this.GroupName = null;
                this.GroupTable = null;
                var oContext = this.Service.GetContext();
                if (oContext) {
                    oContext.Refresh();
                    this.GroupId = oContext.GroupId;
                    this.GroupName = oContext.GroupName;
                    this.GroupTable = oContext.GroupTableName;
                    return;
                }
                throw new Error (Helper.DesktopErrors().ClientGroupContextError);
            },
            LoadGroupData : function() {
                var sDatasetXml = this.Service.GetFromServer (dString.substitute ("${0}/SLXGroupManager.aspx?action=GetGroupDataTableAsXML&gid=${1}", [this.Service.GetClientPath(), this.GroupId]));
                if (sDatasetXml == "") {
                    throw new Error (dString.substitute (Helper.DesktopErrors().GroupManagerError, ["GetGroupDataTableAsXML", this.GroupId])); /*DNL*/
                }
                var sGroupXml = this.Service.GetFromServer (dString.substitute ("${0}/SLXGroupManager.aspx?action=GetGroupXML&groupid=${1}", [this.Service.GetClientPath(), this.GroupId]));
                if (sGroupXml == "") {
                    throw new Error (dString.substitute (Helper.DesktopErrors().GroupManagerError, ["GetGroupXML", this.GroupId])); /*DNL*/
                }
                this.GroupDatasetReader.loadXml (sDatasetXml);
                this.GroupReader.loadXml (sGroupXml);
                this.DataLoaded = true;
            },
            SageGearsFactoryAvailable : function() {
                return (Sage && Sage.gears && Sage.gears.factory);
            },
            UpdateProgress : function(percent, msg) {
                if (this.ShowProgress) {
                    var opts = { title : "Sage SalesLogix", pct : percent, maximum : 100, width : 325, height : 125, showmessage : true, message : msg, canclose : false };
                    Dialogs.showProgressBar (opts);
                }
            }
        });

        return oGroupsCustomExport;
    }
);
