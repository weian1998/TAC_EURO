/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/i18n!./nls/SecurityManagerTasksTasklet',
    'Sage/TaskPane/_BaseTaskPaneTasklet',
    'Sage/TaskPane/TaskPaneContent',
    'Sage/MainView/SecurityMgr/SecurityProfile',
    'dojo/_base/declare'
],
function (i18nStrings, _BaseTaskPaneTasklet, TaskPaneContent, SecurityProfile, declare) {
    var securityManagerTasksTasklet = declare('Sage.TaskPane.SecurityManagerTasksTasklet', [_BaseTaskPaneTasklet, TaskPaneContent], {
        addSecurityProfileTitle: 'Add Profile',
        editSecurityProfileTitle: 'Edit Profile',
        taskItems: [],
        constructor: function () {
            dojo.mixin(this, i18nStrings);
            this.taskItems = [
                {
                    taskId: 'AddSecurityProfile',
                    type: "Link",
                    displayName: this.addSecurityProfileTitle,
                    clientAction: 'securityManagerTasksActions.addSecurityProfile();',
                    securedAction: 'Entities/SecurityManager/AddProfile'
                },
                {
                    taskId: 'EditSecurityProfile',
                    type: "Link",
                    displayName: this.editSecurityProfileTitle,
                    clientAction: 'securityManagerTasksActions.editSecurityProfile();',
                    securedAction: 'Entities/SecurityManager/EditProfile'
                }
            ];
        },
        addSecurityProfile: function () {
            //this.addSecurityProfileActionItem(true);
            var store = this.getStore();
            store.newItem({
                onComplete: this.receiveNewProfileToEdit,
                scope: this
            });
        },
        getStore: function () {
            if (this.store) {
                return this.store;
            }
            var sDataSvc = Sage.Data.SDataServiceRegistry.getSDataService('system');
            this.store = new Sage.Data.SingleEntrySDataStore({
                service: sDataSvc,
                resourceKind: 'securityProfiles',
                include: [],
                select: ['profileDescription', 'defaultPermission', 'profileType']
            });
            return this.store;
        },
        receiveNewProfileToEdit: function (profile) {
            this.receiveProfileToEdit(profile, true);
        },
        receiveProfileToEdit: function (profile, isNew) {
            this._isNew = (isNew === true);
            var dlg = dijit.byId('secProfileDlg');
            if (dlg) {
                dlg.show();
                var description = dijit.byId('secDlg_Description');
                var type = dijit.byId('secDlg_Type');
                
                if(profile.profileDescription) {
                    description.set('value', profile.profileDescription);
                }
                
                if(profile.profileType) {
                    type.set('value', profile.profileType);
                }
                else {
                    type.set('value', 'UserDefined');
                }
            }
        },
        addSecurityProfileActionItem: function (isNew) {
            return function () {
                var addProfileDialog = new SecurityProfile(isNew);
                addProfileDialog.show();
            };
        },
        editSecurityProfile: function () {
            var currentProfileId;
            var grpContextSvc = Sage.Services.getService('ClientGroupContext');
            if (grpContextSvc) {
                var ctx = grpContextSvc.getContext();
                currentProfileId = ctx.CurrentGroupID;
                var st = this.getStore();
                st.fetch({
                    predicate: '"' + currentProfileId + '"',
                    onComplete: this.receiveProfileToEdit,
                    scope: this
                });
            }
        },
        save: function (options) {
            if (this.store) {
                var newDescription = dijit.byId('secDlg_Description');
                var newType = dijit.byId('secDlg_Type');
                this.store.setValue(false, 'profileDescription', newDescription.value);
                this.store.setValue(false, 'profileType', newType.value);
                if (this._isNew) {
                    this.store.saveNewEntity(false, options.success, options.failure, this);
                } else {
                    this.store.save(options);
                }
            }
        },
        saveAndClose: function () {
            this.save({
                success: function (entity) {
                    var dlg = dijit.byId('secProfileDlg');
                    dlg.hide();
                    if(this._isNew) {
                        var newTab = new dijit.layout.ContentPane();
                        newTab.id = entity['$key'];
                        newTab.title = entity.profileDescription;
                        var groupTab = dijit.byId('GroupTabs');
                        groupTab.addChild(newTab);
                        groupTab.selectChild(newTab);
                    }
                    else {
                        var existingTab = dijit.byId(entity['$key']);
                        existingTab.set('title', entity.profileDescription);
                    }
                },
                failure: function (err) {
                    alert('The profile could not be saved: ' + err);
                }
            });
        }
        //        editSecurityProfile: function () {
        //            this.prepareSelectedRecords(this.editSecurityProfileActionitem(this.getSelectionInfo()));
        //        },
        //        editSecurityProfileActionitem: function (selectionInfo) {
        //            return function () {
        //                var editProfileDialog = new SecurityProfile(selectionInfo);
        //                editProfileDialog.show();
        //            };
        //        }
    });
    return securityManagerTasksTasklet;
});