/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/UI/Dialogs',
        'Sage/Utility/Email',
        'dojo/string',
        'Sage/Groups/GroupContextService',
        'dojox/storage/LocalStorageProvider',
        'dojo/_base/array',
        'dojo/_base/lang',
        'dojo/i18n',
        'dojo/i18n!./nls/GroupManager',
        'Sage/Data/SDataServiceRegistry',
        'dojo/_base/xhr',
        'dojo/topic',
        'dojo/aspect'
    ],
function (
        dialogs,
        email,
        dString,
        GroupContextService,
        LocalStorageProvider,
        array,
        lang,
        i18n,
        nls,
        sDataServiceRegistry,
        xhr,
        topic,
        aspect
    ) {
    Sage.namespace('Sage.Groups.GroupManager');
    Sage.Groups.GroupManager = {
        CurrentUserID: "",
        SortCol: -1,
        SortDir: "ASC",
        //CurrentMode : "CONTACT", //Contact
        GMUrl: "SLXGroupBuilder.aspx?method=",
        GroupXML: "",
        resources: nls,
        LOCALSTORE_NAMESPACE: 'SageGroups',
        QB_WIDTH: 840,
        QB_HEIGHT: 650,

        GetFromServer: function (url, datatype, onSuccess, onError, sync) {
            var args = {
                url: url,
                sync: sync || false,
                handleAs: datatype || 'text',
                headers: { 'Content-Type': 'application/xml' },
                preventCache: true,
                load: onSuccess,
                error: onError
            };
            return dojo.xhrGet(args);
        },

        ClearLocalStorage: function () {
            var localStore = new LocalStorageProvider();
            localStore.initialize();
            localStore.clear(Sage.Groups.GroupManager.resources.LOCALSTORE_NAMESPACE);
            window.location.reload(true);
        },

        ClearLocalStorageForGroup: function (groupId) {
            var localStore = new LocalStorageProvider();
            localStore.initialize();

            array.forEach(localStore.getNamespaces(), function (item) {
                if (item.indexOf(groupId) > -1) {
                    localStore.clear(item);
                }
            });

            sessionStorage.removeItem('GROUPLAYOUT_' + groupId);
            sessionStorage.removeItem('hidden_filters_' + groupId);
            sessionStorage.removeItem('METADATA_FILTERS_' + groupId);
            window.location.reload(true);
        },

        PostToServer: function (url, data, onSuccess, onError) {
            var args = {
                url: url,
                postData: data,
                handleAs: 'text',
                headers: { 'Content-Type': 'application/xml' },
                load: function (data) {
                    if (typeof onSuccess === 'function') {
                        onSuccess(data);
                    }
                },
                error: function (err) {
                    if (typeof onError === 'function') {
                        onError(err);
                    }
                }
            };

            return dojo.xhrPost(args);
        },

        GetCurrentGroupInfo: function () {
            var clGrpContextSvc = Sage.Services.getService("ClientGroupContext");
            if (clGrpContextSvc) {
                var clGrpContext = clGrpContextSvc.getContext();
                return { "Name": clGrpContext.CurrentName,
                    "Family": clGrpContext.CurrentFamily,
                    "Id": clGrpContext.CurrentGroupID,
                    "isAdhoc": clGrpContext.isAdhoc,
                    "Entity": clGrpContext.CurrentEntity
                };
            }
            return "";
        },

        CreateGroup: function (mode) {
            if (typeof mode === 'undefined' || mode === '') {
                mode = Sage.Groups.GroupManager.GetCurrentGroupInfo().Family;
            }
            var vURL = "QueryBuilderMain.aspx?mode=" + mode,
                width = Sage.Groups.GroupManager.QB_WIDTH,
                height = Sage.Groups.GroupManager.QB_HEIGHT;


            window.open(vURL, "GroupViewer",
                dString.substitute("resizable=yes,centerscreen=yes,width=${width},height=${height},status=no,toolbar=no,scrollbars=yes", { width: width, height: height }));
        },

        DeleteGroup: function (groupID, groupName) {
            if (typeof groupID === 'undefined' || groupID === '') {
                groupID = Sage.Groups.GroupManager.GetCurrentGroupInfo().Id;
            }
            var msg = (groupName) ? dString.substitute(Sage.Groups.GroupManager.resources.ConfirmDeleteFmtMessage, [groupName]) : Sage.Groups.GroupManager.resources.ConfirmDeleteMessage;
            dialogs.raiseQueryDialog('', msg,
                function (result) {
                    if (result === true) {
                        Sage.Groups.GroupManager.GetFromServer(Sage.Groups.GroupManager.GMUrl + 'DeleteGroup&gid=' + groupID,
                            'text',
                            function () {
                                var url = document.location.href.replace("#", "");
                                if (url.indexOf("?") > -1) {
                                    var halves = url.split("?");
                                    url = halves[0];
                                }
                                document.location = url;
                            },
                            function (req) {
                            }
                        );
                    }
                },
                Sage.Groups.GroupManager.resources.yesCaption,
                Sage.Groups.GroupManager.resources.noCaption);
        },
        EditGroup: function (strGroupID) {
            // show group editor dialog...
            var curGrpInfo = Sage.Groups.GroupManager.GetCurrentGroupInfo();
            if (typeof strGroupID === 'undefined' || strGroupID === '')
                strGroupID = curGrpInfo.Id;

            var url = dString.substitute('QueryBuilderMain.aspx?gid=${groupid}\&mode=${md}', { groupid: strGroupID, md: curGrpInfo.Family }),
                width = Sage.Groups.GroupManager.QB_WIDTH,
                height = Sage.Groups.GroupManager.QB_HEIGHT;

            window.open(url, "EditGroup",
            dString.substitute("resizable=yes,centerscreen=yes,width=${width},height=${height},status=no,toolbar=no,scrollbars=yes", { width: width, height: height }));
        },
        CopyGroup: function (strGroupID) {
            // show group editor dialog...
            var curGrpInfo = Sage.Groups.GroupManager.GetCurrentGroupInfo();
            if (typeof strGroupID === 'undefined' || strGroupID === '')
                strGroupID = curGrpInfo.Id;
            var vURL = ['QueryBuilderMain.aspx?gid=', strGroupID, '&action=copy', '&mode=', curGrpInfo.Family].join(''),
                width = Sage.Groups.GroupManager.QB_WIDTH,
                height = Sage.Groups.GroupManager.QB_HEIGHT;

            window.open(vURL, "EditGroup",
               dString.substitute("resizable=yes,centerscreen=yes,width=${width},height=${height},status=no,toolbar=no,scrollbars=yes", { width: width, height: height }));
        },

        //depricated:
        //ShowGroupInViewer...
        //Count

        ListGroupsAsSelect: function (family) {
            var sFamily = family;
            if (!dojo.isString(sFamily) || sFamily.length === 0) {
                sFamily = Sage.Groups.GroupManager.GetCurrentGroupInfo().Family;
                if (!dojo.isString(sFamily) || sFamily.length === 0) {
                    return "";
                }
            }
            var sUrl = Sage.Groups.GroupManager.GMUrl + "GetGroupList&entity=" + sFamily;
            var sResult = "";
            Sage.Groups.GroupManager.GetFromServer(
                sUrl,
                "text",
                function (data) {
                    sResult = data;
                },
                function (err) {
                    if (typeof console !== "undefined") {
                        console.error(err);
                    }
                },
                true);
            var oXmlDoc = getXMLDoc(sResult);
            if (oXmlDoc) {
                var arrGroupInfos = oXmlDoc.getElementsByTagName("GroupInfo");
                if (!arrGroupInfos) {
                    return "";
                }
                var sSelectOption = "";
                for (var i = 0; i < arrGroupInfos.length; i++) {
                    sSelectOption += "<option value = '" + arrGroupInfos[i].getElementsByTagName("GroupID")[0].firstChild.nodeValue + "'>" + arrGroupInfos[i].getElementsByTagName("DisplayName")[0].firstChild.nodeValue + "</option>";
                }
                return sSelectOption;
            }
            return "";
        },
        GetGroupId: function (name) {
            var results = '';

            // Call httpHandler synchronously
            Sage.Groups.GroupManager.GetFromServer(
                Sage.Groups.GroupManager.GMUrl + 'GetGroupId&name=' + encodeURIComponent(name),
                'text',
                function (data) {
                    results = data;
                },
                function (err) {
                    console.error(err);
                },
                true);

            return results;
        },
        HideGroup: function (strGroupID, skipReload) {
            if (typeof strGroupID === 'undefined' || strGroupID === '') {
                strGroupID = Sage.Groups.GroupManager.GetCurrentGroupInfo().Id;
            }

            Sage.Groups.GroupManager.PostToServer(Sage.Groups.GroupManager.GMUrl + 'HideGroup&gid=' + strGroupID, '', lang.hitch(this, Sage.Groups.GroupManager._HideOrShowComplete, skipReload, strGroupID));
        },
        _HideOrShowComplete: function (skipReload, groupId) {
            var service, context, reloadFn, handle;

            if (skipReload) {
                return;
            }

            reloadFn = function () {
                if (handle && handle.remove) {
                    handle.remove();
                }

                var titlePane = dijit.byId('titlePane');
                if (titlePane) {
                    titlePane.resetConfiguration();
                }
            };

            service = Sage.Services.getService("ClientGroupContext");
            context = service && service.getContext();

            handle = aspect.after(service, 'onCurrentGroupChanged', reloadFn);

            if (!Sage.Groups.GroupManager._isDefaultGroup(groupId) && context.CurrentGroupID === groupId) {
                // User has hidden the current group they are on, and it is NOT the default group
                service.setCurrentGroup(context.DefaultGroupID);
            } else if (Sage.Groups.GroupManager._isDefaultGroup(groupId) && context.CurrentGroupID === groupId) {
                // User has hidden the group they are on, and it happens to be the default group that we would normally switch to...
                // Lookup results is good enough??
                service.setCurrentGroup('LOOKUPRESULTS');
            } else {
                // Hide a group other than current, no need to switch here, just reload the tabs
                reloadFn.call();
            }
        },
        _isDefaultGroup: function (groupId) {
            var service, context, results;

            results = false;
            service = Sage.Services.getService("ClientGroupContext");
            if (service) {
                context = service.getContext();
                if (context) {
                    results = context.DefaultGroupID === groupId;
                }
            }

            return results;
        },
        UnHideGroup: function groupmanager_(strGroupID, skipReload) {
            if (typeof strGroupID === 'undefined' || strGroupID === '') {
                strGroupID = Sage.Groups.GroupManager.GetCurrentGroupInfo().Id;
            }

            Sage.Groups.GroupManager.GetFromServer(Sage.Groups.GroupManager.GMUrl + 'UnHideGroup&gid=' + strGroupID, '', lang.hitch(this, Sage.Groups.GroupManager._HideOrShowComplete, skipReload, strGroupID));
        },
        ShowGroups: function (strTableName) {
            if (typeof strTableName === 'undefined' || strTableName === '')
                strTableName = Sage.Groups.GroupManager.GetCurrentGroupInfo().Family;
            var vURL = 'ShowGroups.aspx?tablename=' + strTableName;
            window.open(vURL, "ShowGroups", "resizable=yes,centerscreen=yes,width=800,height=646,status=no,toolbar=no,scrollbars=yes");
        },

        CreateAdHocGroup: function (strGroups, strName, strFamily, strLayoutId) {
            //ToDo: should this be depricated or removed?...
            var vURL = [Sage.Groups.GroupManager.GMUrl, 'CreateAdHocGroup',
                '&name=', encodeURIComponent(strName),
                '&family=', strFamily,
                '&layoutid=', encodeURIComponent(strLayoutId)].join();
            return Sage.Groups.GroupManager.PostToServer(vURL, strGroups);

        },
        EditAdHocGroupAddMember: function (strGroupID, strItem) {
            //ToDo: should this be depricated or removed?...
            if (typeof strGroupID === 'undefined' || strGroupID === '')
                strGroupID = Sage.Groups.GroupManager.GetCurrentGroupInfo().Id;
            var x = Sage.Groups.GroupManager.GetFromServer(Sage.Groups.GroupManager.GMUrl + 'EditAdHocGroupAddMember&groupid=' + strGroupID + '&entityid=' + strItem);
        },
        EditAdHocGroupDeleteMember: function (strGroupID, strItem) {
            //ToDo: should this be depricated or removed?...
            if (typeof strGroupID === 'undefined' || strGroupID === '')
                strGroupID = Sage.Groups.GroupManager.GetCurrentGroupInfo().Id;
            var x = Sage.Groups.GroupManager.GetFromServer(Sage.Groups.GroupManager.GMUrl + 'EditAdHocGroupDeleteMember&groupid=' + strGroupID + '&entityid=' + strItem);
        },
        SetDefault: function (strGroupID, name, family) {
            Sage.Groups.GroupManager._saveGroupUserOptions(name, family, "DEFAULTGROUP");
        },
        SetLookupLayout: function (strGroupID, name, family) {
            Sage.Groups.GroupManager._saveGroupUserOptions(name, family, "LOOKUPLAYOUTGROUP");
        },
        _saveGroupUserOptions: function (name, family, optionCategory) {
            var groupInfo = Sage.Groups.GroupManager.GetCurrentGroupInfo(),
                currentName = groupInfo.Name,
                currentFamily = groupInfo.Family,
                tempName = name || currentName,
                tempFamily = family || currentyFamily;

            var svc = Sage.Services.getService("UserOptions");
            if (svc) {
                svc.set(family, optionCategory, dString.substitute("${0}:${1}", [tempFamily, tempName]));
            }
        },
        IsAdHoc: function (groupId) {
            alert('not implemented in this object yet...');
        },

        ExportGroup: function (strGroupID, strFileName) {
            try {
                require(['Sage/MailMerge/Helper', 'Sage/MailMerge/Service'], function (Helper, DesktopService) {
                    var oService = Helper.GetDesktopService();
                    if (oService) {
                        if (strGroupID === '')
                            strGroupID = Sage.Groups.GroupManager.GetCurrentGroupInfo().Id;
                        oService.ExportToExcel(strGroupID);
                        return;
                    }
                    throw new Error(dString.substitute("${0} ${1}", [Helper.DesktopErrors().MailMergeServiceLoad, Helper.DesktopErrors().SageGearsObjectError]));
                });
            }
            catch (err) {
                dialogs.showError(err.message);
            }
        },

        ShareGroup: function (strGroupID) {
            // show group editor dialog...
            if (typeof strGroupID === 'undefined' || strGroupID === '')
                strGroupID = Sage.Groups.GroupManager.GetCurrentGroupInfo().Id;
            var vURL = 'ShareGroup.aspx?gid=' + strGroupID;
            window.open(vURL, "ShareGroup", "resizable=yes,centerscreen=yes,width=500,height=450,status=no,toolbar=no,scrollbars=yes");
        },

        GetGroupSQL: function (groupId, useAliases, parts, applyFilters) {
            var sGroupId = groupId;
            if (!dojo.isString(sGroupId) || sGroupId.length === 0) {
                sGroupId = Sage.Groups.GroupManager.GetCurrentGroupInfo().Id;
                if (!dojo.isString(sGroupId) || sGroupId.length === 0) {
                    return "";
                }
            }
            var sUrl = Sage.Groups.GroupManager.GMUrl + "GetGroupSQL&gid=" + sGroupId;
            if (typeof useAliases !== "undefined") {
                if (dojo.isString(useAliases)) {
                    if ((useAliases === "true") || (useAliases === "false")) {
                        sUrl += "&UseAliases=" + useAliases;
                    }
                }
                else {
                    if (typeof useAliases === "boolean") {
                        sUrl += "&UseAliases=" + useAliases.toString();
                    }
                }
            }
            if (dojo.isString(parts) && parts.length > 0) {
                sUrl += "&parts=" + parts;
            }

            if (typeof applyFilters !== "undefined") {
                if (dojo.isString(applyFilters)) {
                    if ((applyFilters === "true") || (applyFilters === "false")) {
                        sUrl += "&ApplyFilters=" + applyFilters;
                    }
                }
                else {
                    if (typeof applyFilters === "boolean") {
                        sUrl += "&ApplyFilters=" + applyFilters.toString();
                    }
                }
            }
            var sResult = "";
            Sage.Groups.GroupManager.GetFromServer(
                sUrl,
                "text",
                function (data) {
                    sResult = data;
                },
                function (err) {
                    if (typeof console !== "undefined") {
                        console.error(err);
                    }
                },
                true);
            return sResult;
        },

        GetGroupSQLFromXML: function (groupXml, onSuccess, onError) {
            Sage.Groups.GroupManager.PostToServer(Sage.Groups.GroupManager.GMUrl + "GetGroupSQL", groupXml, onSuccess, onError);
        },

        GetGroupSQLById: function (groupId, onSuccess, onError) {
            url = Sage.Groups.GroupManager.GMUrl + "GetGroupSQL&gid=" + groupId;
            Sage.Groups.GroupManager.GetFromServer(url, 'json', onSuccess, onError);
        },

        saveSelectionsAsNewGroup: function () {
            var selectionInfo = Sage.Utility.getSelectionInfo();
            if (!selectionInfo || selectionInfo.selectionCount === 0) {
                if (selectionInfo.recordCount < 1) {
                    dialogs.showInfo(Sage.Groups.GroupManager.resources.noRecordsInGroup, Sage.Groups.GroupManager.resources.noneSelectedTitle);
                } else {
                    var dialogbody = dString.substitute(Sage.Groups.GroupManager.resources.noneSelectedPromptFmt, [selectionInfo.recordCount]);
                    dialogs.raiseQueryDialog(
                        Sage.Groups.GroupManager.resources.noneSelectedTitle,
                        dialogbody,
                        function (result) {
                            if (result === true) {
                                Sage.Groups.GroupManager.promptForName('');
                            }
                        },
                        Sage.Groups.GroupManager.resources.yesCaption,
                        Sage.Groups.GroupManager.resources.noCaption);
                }
            } else {
                Sage.Groups.GroupManager.promptForName('');
            }
        },
        promptForName: function (addlMsg, defaultValue) {
            var selectionInfo = Sage.Utility.getSelectionInfo();
            var totalToAdd = (selectionInfo.selectionCount === 0) ? selectionInfo.recordCount : selectionInfo.selectionCount;
            var dialogBody = dString.substitute(Sage.Groups.GroupManager.resources.newGroupNamePrompt, [totalToAdd, addlMsg || '']);
            dialogs.raiseInputDialogExt({
                title: Sage.Groups.GroupManager.resources.newGroupTitle,
                query: dialogBody,
                callbackFn: function (result, name) {
                    if (result === true) {
                        if (name === '') {
                            window.setTimeout(function () { Sage.Groups.GroupManager.promptForName(Sage.Groups.GroupManager.resources.newGroupRePrompt, name); }, 100);
                        } else if (name.match(/[\/\\:\*\?"<\>|\.'\r\n]/) !== null) {
                            window.setTimeout(function () { Sage.Groups.GroupManager.promptForName(Sage.Groups.GroupManager.resources.invalidCharMsg, name); }, 100);
                        } else {
                            Sage.Groups.GroupManager.saveNewGroupPost(name);
                        }
                    }
                },
                yesText: Sage.Groups.GroupManager.resources.okCaption,
                noText: Sage.Groups.GroupManager.resources.cancelCaption,
                defaultValue: defaultValue || '',
                closable: true
            });
        },
        saveNewGroupPost: function (name, saveAll) {
            var selectionInfo = Sage.Utility.getSelectionInfo(),
                service = sDataServiceRegistry.getSDataService('system'),
                request = new Sage.SData.Client.SDataSingleResourceRequest(service),
                groupContext = Sage.Services.getService("ClientGroupContext").getContext(),
                family = groupContext.CurrentFamily,
                groupId = groupContext.CurrentGroupID,
                entry = {},
                copy = false;

            request.setResourceKind('groups');

            if (selectionInfo.selectionCount === 0) {
                copy = true;
            }

            entry = {
                family: family,
                name: name,
                adHocIds: selectionInfo.selectedIds
            };

            request.create(entry, {
                success: function (entry) {
                    if (copy) {
                        Sage.Groups.GroupManager.copyFromGroup(groupId, entry.$key);
                    } else {
                        Sage.Groups.GroupManager.newGroupCreated();
                    }
                },
                failure: function () {
                },
                scope: this
            });
        },
        removeSelectionsFromGroup: function () {
            var selectionInfo = Sage.Utility.getSelectionInfo();
            if (selectionInfo.selectionCount === 0) {
                if (selectionInfo.recordCount < 1) {
                    dialogs.showInfo(Sage.Groups.GroupManager.resources.noRecordsInGroup, Sage.Groups.GroupManager.resources.noneSelectedTitle);
                } else {
                    var dialogBody = dString.substitute(Sage.Groups.GroupManager.resources.noneSelectedRemovePromptFmt, [selectionInfo.recordCount]);
                    dialogs.raiseQueryDialog(Sage.Groups.GroupManager.resources.noneSelectedTitle, dialogBody,
                        function (result) {
                            if (result === true) {
                                Sage.Groups.GroupManager.removeConfirmed();
                            }
                        },
                        Sage.Groups.GroupManager.resources.yesCaption,
                        Sage.Groups.GroupManager.resources.noCaption);
                }
            } else {
                Sage.Groups.GroupManager.removeConfirmed();
            }
        },
        removeConfirmed: function () {
            var selectionInfo = Sage.Utility.getSelectionInfo(),
                groupContext = Sage.Services.getService("ClientGroupContext").getContext(),
                family = groupContext.CurrentFamily,
                name = groupContext.CurrentName,
                groupId = groupContext.CurrentGroupID;

            Sage.Groups.GroupManager.removeIds(groupId, name, family, selectionInfo.selectedIds, function () {
                Sage.Groups.GroupManager.refreshListView();
            }, function (err) {
                console.error(err);
            }, this);
        },
        removeIds: function (groupId, groupName, family, ids, onSuccess, onFailure, scope) {
            var service = sDataServiceRegistry.getSDataService('system'),
                request = new Sage.SData.Client.SDataServiceOperationRequest(service),
                entry,
                onSuccessWrapper,
                idsRemoved = [];

            request.setResourceKind('groups');
            if (ids && ids.length > 0) {
                request.setOperationName('removeAdHocIds');
                idsRemoved = ids;
            } else {
                request.setOperationName('removeAllAdHocIds');
                idsRemoved.push(ids);
            }

            entry = {
                '$name': 'removeAdHocIds',
                request: {
                    groupId: groupId,
                    groupName: groupName,
                    family: family,
                    adHocIds: ids
                }
            };

            onSuccessWrapper = lang.hitch(this, function () {
                topic.publish('/group/adhoc/removed', { 'groupId': groupId, 'groupName': groupName, 'family': family, 'ids': idsRemoved });
                if (onSuccess) {
                    onSuccess.call(arguments);
                }
            });

            request.execute(entry, {
                success: onSuccessWrapper,
                failure: onFailure,
                scope: scope || this
            });
        },
        addSelectionsToGroup: function (groupID) {
            //Handle addition from details view
            var entityId = Sage.Utility.getCurrentEntityId();
            if (entityId !== '') {
                Sage.Groups.GroupManager.postAddToGroup(groupID, { selectedIds: [entityId], selectionCount: 1 });
            } else {
                //Handle additions from list view
                var selectionInfo = Sage.Utility.getSelectionInfo();
                if (selectionInfo.selectionCount === 0) {
                    if (selectionInfo.recordCount < 1) {
                        dialogs.showInfo(Sage.Groups.GroupManager.resources.noRecordsInGroup, Sage.Groups.GroupManager.resources.noneSelectedTitle);
                    } else {
                        var dialogBody = dString.substitute(Sage.Groups.GroupManager.resources.noneSelectedPromptFmt, [selectionInfo.recordCount]);
                        dialogs.raiseQueryDialog(Sage.Groups.GroupManager.resources.noneSelectedTitle, dialogBody,
                            function (result) {
                                if (result === true) {
                                    Sage.Groups.GroupManager.addConfirmed(groupID);
                                }
                            },
                            Sage.Groups.GroupManager.resources.yesCaption,
                            Sage.Groups.GroupManager.resources.noCaption);
                    }
                } else {
                    Sage.Groups.GroupManager.addConfirmed(groupID);
                }
            }
        },
        copyFromGroup: function (fromGroupId, toGroupId) {
            var selectionInfo = Sage.Utility.getSelectionInfo(),
                service = sDataServiceRegistry.getSDataService('system'),
                request = new Sage.SData.Client.SDataServiceOperationRequest(service),
                groupContext = Sage.Services.getService("ClientGroupContext").getContext(),
                family = groupContext.CurrentFamily,
                name = groupContext.CurrentName,
                entry;

            request.setResourceKind('groups');
            request.setOperationName('addAdHocIdsFrom');

            entry = {
                '$name': 'addAdHocIdsFrom',
                request: {
                    groupId: toGroupId,
                    groupName: name,
                    family: family,
                    fromGroupId: fromGroupId
                }
            };

            request.execute(entry, {
                success: function () {
                    var ctxService = Sage.Services.getService('ClientGroupContext');
                    if (ctxService) {
                        var titlePane = dijit.byId('titlePane');
                        if (titlePane) {
                            titlePane.resetConfiguration();
                        }

                        ctxService.setCurrentGroup(toGroupId);
                    }
                },
                failure: function () {
                },
                scope: this
            });
        },
        addConfirmed: function (groupID) {
            var selectionInfo = Sage.Utility.getSelectionInfo();
            Sage.Groups.GroupManager.postAddToGroup(groupID, selectionInfo);
        },
        postAddToGroup: function (groupId, selectionInfo) {
            var service = sDataServiceRegistry.getSDataService('system'),
                request = new Sage.SData.Client.SDataServiceOperationRequest(service),
                groupContext = Sage.Services.getService("ClientGroupContext").getContext(),
                family = groupContext.CurrentFamily,
                fromGroupId = groupContext.CurrentGroupID,
                entry,
                operation = 'addAdHocIds';


            if (selectionInfo.selectionCount === 0) {
                Sage.Groups.GroupManager.copyFromGroup(fromGroupId, groupId);
                return;
            }

            request.setResourceKind('groups');
            request.setOperationName(operation);

            entry = {
                '$name': operation,
                request: {
                    groupId: groupId,
                    family: family,
                    adHocIds: selectionInfo.selectedIds /* adHocIds is ignored if operation is "all" */
                }
            };

            request.execute(entry, {
                success: function () {
                },
                failure: function () {
                },
                scope: this
            });
        },
        saveLookupAsGroup: function (obj, e, msg) {
            if (typeof (msg) === 'undefined') {
                msg = Sage.Groups.GroupManager.resources.groupNameText;
            }
            dialogs.raiseInputDialogExt({
                title: Sage.Groups.GroupManager.resources.saveLookupDlgTitle,
                query: msg,
                callbackFn: function (result, name) {
                    if (result === true) {
                        if (name === '') {
                            window.setTimeout(function () { Sage.Groups.GroupManager.saveLookupAsGroup(Sage.Groups.GroupManager.resources.newGroupRePrompt); }, 100);
                        } else if (name.match(/\'|\"|\/|\\|\*|\:|\?|\<|\>/) !== null) {
                            window.setTimeout(function () { Sage.Groups.GroupManager.promptForName(Sage.Groups.GroupManager.resources.invalidCharMsg); }, 100);
                        } else {
                            var postUrl = "slxdata.ashx/slx/crm/-/groups/adhoc?action=SaveLookupAsGroup&name=" + encodeURIComponent(name);
                            xhr.post({
                                url: postUrl,
                                handleAs: 'text',
                                content: {},
                                load: Sage.Groups.GroupManager.newGroupCreated,
                                error: Sage.Groups.GroupManager.handleAjaxError
                            });
                        }
                    }
                },
                yesText: Sage.Groups.GroupManager.resources.okCaption,
                noText: Sage.Groups.GroupManager.resources.cancelCaption,
                defaultValue: '',
                closable: true
            });
        },
        handleAjaxError: function (request) {
            if (typeof request != 'undefined') {
                if (request.responseXML) {
                    var nodes = request.responseXML.getElementsByTagName('sdata:message');
                    if (nodes.length > 0) {
                        dialogs.showError(nodes[0].text || nodes[0].textContent, '');
                    }
                }
                else {
                    dialogs.alert("an unidentified exception has occured");
                }
            }
        },
        newGroupCreated: function () {
            Sage.Link.toListView();
        },
        refreshListView: function () {
            var listpanel = dijit.byId('list');
            if (listpanel) {
                listpanel.refreshList();
            }
        },
        emailSelectionsFromGroup: function () {
            var subject, body, nameOrder, emailField;
            subject = "";
            body = "";
            nameOrder = 0; // 0 = FirstLast; 1 = LastFirst.
            emailField = "Email"; // Valid values are "Email" (for Contact and Lead) and "SecondaryEmail" and "Email3" for Contact.
            // Works only for Contact and Lead groups.
            email.writeEmailToGroupSelection(subject, body, nameOrder, emailField);
        }
    };
    window.groupManager = Sage.Groups.GroupManager; //for backward compatibility
    return groupManager;
});
