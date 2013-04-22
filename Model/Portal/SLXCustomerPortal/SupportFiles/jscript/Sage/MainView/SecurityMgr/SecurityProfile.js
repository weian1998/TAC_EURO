/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/i18n!./nls/SecurityProfile',
        'Sage/UI/Controls/_DialogHelpIconMixin',
        'dojo/_base/lang',
        'dijit/Dialog',
        'dijit/_Widget',
        'Sage/_Templated',
        'dojo/_base/declare',
        'dijit/form/Form',
        'dijit/form/Select',
        'dijit/form/Textarea',
        'dijit/layout/ContentPane',
        'dojox/layout/TableContainer',
        'dojo/i18n!./nls/SecurityProfile'
],
function (i18nStrings, _DialogHelpIconMixin, dojoLang, dijitDialog, _Widget, _Templated, declare) {
    var securityProfile = declare('Sage.MainView.SecurityMgr.SecurityProfile', [_Widget, _Templated], {
        _dialog: false,
        selectedFieldIndex: 1,
        store: false,
        _isNew: false,
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div>',
                '<div data-dojo-type="dijit.Dialog" id="{%= $.id %}_dlgSecurityProfile" title="{%= $.securityProfile_Caption %}" dojoAttachPoint="_dialog" dojoAttachEvent="onCancel:_close">',
                    '<div data-dojo-type="dijit.form.Form" id="{%= $.id %}_frmSecurityProfile">',
                        '<table cellspacing="20">',
                            '<tr>',
                                '<td>',
                                    '<label>{%= $.description_Text %}</label>',
                                '</td>',
                                '<td>',
                                    '<input type="text" id="secDlg_Description" dojoAttachPoint="profileDescription" name="profileDescription" required="true" dojoType="dijit.form.TextBox" />',
                                '</td>',
                            '<tr>',
                                '<td>',
                                    '<label>{%= $.profileType_Text %}</label>',
                                '</td>',
                                '<td>',
                                    '<select dojoType="dijit.form.Select" name="profileType" id="secDlg_Type">',
                                        '<option value="U">User</option>',
                                        '<option value="S">System</option>',
                                    '</select>',
                                '</td>',
                            '</tr>',
                        '</table>',
                        '<div align="right">',
                            '<div data-dojo-type="dijit.form.Button" id="{%= $.id%}_btn_OK" name="btn_OK" dojoAttachPoint="btn_OK" dojoAttachEvent="onClick:_okClick">{%= $.ok_Text %}</div>',
                            '<div data-dojo-type="dijit.form.Button" style="margin-left:5px;" id="{%= $.id%}_btn_Cancel" name="btn_Cancel" dojoAttachPoint="btn_Cancel" dojoAttachEvent="onClick:_close">{%= $.btnCancel_Caption %}</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ]),
        constructor: function (isNew) {
            this._isNew = isNew;
            dojo.mixin(this, i18nStrings);
        },
        show: function () {
            if (isNew) {
                var store = this.getStore();
                store.newItem({
                    onComplete: this.receiveNewProfileToEdit,
                    scope: this
                });
            }
            this._dialog.show();
            if (!this._dialog.helpIcon) {
                dojoLang.mixin(this._dialog, new _DialogHelpIconMixin());
                this._dialog.createHelpIconByTopic('securityprofile');
            }
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
                dlg.set('value', profile);
                dlg.show();
            }
        },
        _okClick: function () {
        },
        save: function (options) {
            if (this.store) {
                var dlg = dijit.byId('secProfileDlg');
                var formVals = dlg.get('value');
                for (var prop in formVals) {
                    this.store.setValue(false, prop, formVals[prop]);
                }
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
                    var titlePane = dijit.byId('titlePane');
                    if (titlePane) {
                        titlePane.resetConfiguration();
                    }
                },
                failure: function (err) {
                    alert('The profile could not be saved: ' + err);
                }
            });
        },
        _close: function () {
            this._dialog.destroyRecursive();
        }
    });
    return securityProfile;
});