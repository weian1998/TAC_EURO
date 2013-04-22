/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/MenuBar',
    'Sage/UI/MenuItem',
    'Sage/UI/PopupMenuBarItem',
    'Sage/UI/OrientableMenuBar',
    'Sage/UI/MenuBarItem',
    'Sage/UI/Controls/_DialogHelpIconMixin',
    'dojo/i18n',
    'dojo/data/ItemFileReadStore',
    'dojo/i18n!./nls/TimeZoneItem',
    'dojo/_base/declare'
],
function (MenuBar, MenuItem, PopupMenuBarItem, OrientableMenuBar, MenuBarItem, _DialogHelpIconMixin, i18n, itemFileReadStore, nlsResource, declare) {
    var TimeZoneItem = declare('Sage.UI.TimeZoneItem', MenuBar, {
        _TimeZoneDialog: new Simplate(['<div><div style="height:auto;">',
            '{%= $.setTimeZone %}<br />',
            '<select id="timeZoneItemsList" data-dojo-type="dijit.form.Select" shouldPublishMarkDirty="false" style="width:345px; margin-top:10px; margin-bottom:10px;"></select></div>',
            '<div class="button-bar alignright"><button data-dojo-type="dijit.form.Button"',
            ' type="button" id="btnTimeZoneDialogOk" title="{%= $.buttonOK %}" align="right">{%= $.buttonOK %}</button>',
            '<button data-dojo-type="dijit.form.Button"',
            ' type="button" id="btnTimeZoneDialogCancel" title="{%= $.buttonCancel %}" align="right">{%= $.buttonCancel %}</button>',
            '</div></div>']),
        postMixInProperties: function () {
            dojo.mixin(this, i18n.getLocalization("Sage.UI", "TimeZoneItem"));

            this.inherited(arguments);
        },
        postCreate: function () {
            this.inherited(arguments);
            
            var initialLabel;
            
            initialLabel = Sage.Utility.getClientContextByKey('userTimeZone');

            this.addChild(new MenuBarItem({
                label: initialLabel,
                title: this.timeZoneText,
                id: 'btnTimeZoneMenu',
                onClick: function () {
                    dojo.xhrGet({
                        url: 'slxdata.ashx/slx/crm/-/timezones/p',
                        handleAs: 'json',
                        load: function (data) {
                            var timeZoneMenu = dijit.byId('TimeZoneMenu'),
                                btnTimeZoneMenu = dijit.byId('btnTimeZoneMenu');

                            timeZoneMenu._initializeDialog();
                            timeZoneMenu._initializeTimeZoneDataStore(data, btnTimeZoneMenu.label);
                        },
                        error: function (err) {
                        }
                    });
                }
            }));
        },
        _initializeDialog: function () {
            var timeZoneMenu = dijit.byId('TimeZoneMenu');
            var d = new dijit.Dialog({
                title: timeZoneMenu.timeZoneSettingsText,
                style: "width:auto;"
            });

            dojo.mixin(d, new _DialogHelpIconMixin());
            d.createHelpIconByTopic("Select_TimeZone");
            
            var mkup = this._TimeZoneDialog.apply({
                buttonOK: timeZoneMenu.buttonOKText,
                buttonCancel: timeZoneMenu.buttonCancelText,
                setTimeZone: timeZoneMenu.setTimeZoneText
            });

            d.set('content', mkup);
            d.show();

            var fnHide = function() {
                dojo.disconnect(_closed);
                dojo.disconnect(closeClick);
                dojo.disconnect(okClick);
                
                setTimeout((function (d) {
                    return function () {
                        d.destroyDescendants();
                        d.destroy(false);
                    };
                })(d), 1);
            };
            
            var fnDestroy = function () {
                d.hide();
            };

            var fnOkClick = function () {
                var timeZoneItemsList = dijit.byId('timeZoneItemsList'),
                    timeZoneMenu = dijit.byId('TimeZoneMenu'),
                    selectedItem = '';
                
                for(var i = 0; i < timeZoneItemsList.options.length; i++) {
                    if(timeZoneItemsList.options[i].value === timeZoneItemsList.value) {
                        selectedItem = timeZoneItemsList.options[i];
                        break;
                    }
                }
                
                if (selectedItem) {                    
                    timeZoneMenu._updateTimeZone(selectedItem, timeZoneMenu.location ? true : false);
                }
                d.hide();
            };

            var _closed = dojo.connect(d, "hide", this, fnHide);
            var closeClick = dojo.connect(dijit.byId('btnTimeZoneDialogCancel'), "onClick", this, fnDestroy);
            var okClick = dojo.connect(dijit.byId('btnTimeZoneDialogOk'), "onClick", this, fnOkClick);
        },
        _initializeTimeZoneDataStore: function (data, selectedValue) {
            var items = [];
            var selectedOffset = '';
            
            for(var i = 0; i < data.length; i++) {
                if(!data[i].Displayname || !data[i].Keyname) {
                    continue;
                }
                
                if(data[i].Displayname == selectedValue) {
                    var parsedDisplayName = data[i].Displayname.split(')');
                    selectedOffset = data[i].OffsetHours;
                    
                    break;
                }
            };
            
            dojo.forEach(data, function (item) {
                if (!item.Displayname || !item.Keyname) {
                    return;
                }
                if(item.OffsetHours == selectedOffset) {
                    items.push({
                        id: item.Keyname,
                        text: item.Displayname
                    });
                }
            });

            var storeData = {
                label: 'text',
                identifier: 'id',
                items: items
            };

            var timeZoneStore = new itemFileReadStore({
                data: storeData
            });

            var timeZoneList = dijit.byId('timeZoneItemsList');
            timeZoneList.setStore(timeZoneStore);
            timeZoneList.set('searchAttr', 'text');
            
            for(var i = 0; i < timeZoneList.options.length; i++) {
                if(timeZoneList.options[i].label === selectedValue) {
                    timeZoneList.setValue(timeZoneList.options[i].value);
                    break;
                }
            }
        },
        _updateTimeZone: function (selectedItem, isCustomerPortal) {
            var payload = {
                "$name": "setusertimezone",
                "request": {
                    "UserId": Sage.Utility.getClientContextByKey('userID'),
                    "userTimeZone": selectedItem.value,
                    "isCustomerPortal": isCustomerPortal ? 't' : ''
                }
            };
            var request = new Sage.SData.Client.SDataServiceOperationRequest(Sage.Data.SDataServiceRegistry.getSDataService('dynamic'))
                .setResourceKind('users')
                .setOperationName('setusertimezone');
            request.execute(payload, {
                success: function () {
                    var btnTimeZoneMenu = dijit.byId('btnTimeZoneMenu');
                    btnTimeZoneMenu.setLabel(selectedItem.label);
                },
                failure: function () {
                    console.log('Failure to Change Time Zone');
                },
                scope: this
            });
        }
    });

    return TimeZoneItem;
});
