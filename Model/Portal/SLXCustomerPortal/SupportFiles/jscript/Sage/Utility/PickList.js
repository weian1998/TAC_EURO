/*globals Sage, window, define, sessionStorage */
define([
        'dojo/_base/lang',
        'dojo/_base/declare',
        'Sage/Data/SDataServiceRegistry',
        'dojo/json',
        './_LocalStorageMixin',
        '../Utility'
],
function (lang, declare, SDataServiceRegistry, json, _LocalStorageMixin, util) {
    var PickListUtil = declare('Sage.Utility.PickList', [_LocalStorageMixin], {
        _storageNameSpace: 'PickListData',
        checkStaleCache: function () {
            //console.log('checkStaleCache start');
            var modifiedAt = this.getFromLocalStorage('modified_at', this._storageNameSpace);
            var alreadyChecked = sessionStorage.getItem("PickListChangeStateCheck");
            if (modifiedAt && alreadyChecked === null) {
                //console.log('we have not checked the server yet, checking now..');
                modifiedAt = new Date(Date.parse(modifiedAt));

                var service, request, entry, data;
                data = sessionStorage.getItem('pickListExpireCheck');

                if (data === null) {
                    service = SDataServiceRegistry.getSDataService('system');

                    request = new Sage.SData.Client.SDataServiceOperationRequest(service);
                    request.setOperationName('getPickListsChangeState');

                    request.execute({}, {
                        success: lang.hitch(this, function (data) {
                            if (!data || !data.response || !data.response.lastModifiedDate) {
                                return;
                            }

                            var lastModifiedServer = util.Convert.toDateFromString(data.response.lastModifiedDate);
                            //console.log('Last modified from server: ', lastModifiedServer);
                            if (this._isLocalStorageExpired(modifiedAt, lastModifiedServer)) {
                                //console.log('Last modified on server is newer than local storage, clearing cache.');
                                this.clear(this._storageNameSpace);
                            }
                        })
                    });

                    // Indicate we already ran the check
                    sessionStorage.setItem("PickListChangeStateCheck", "true");
                } 
            }
        },
        _isLocalStorageExpired: function(localStorageDate, serverDate) {
            localStorageDate.setSeconds(0);
            serverDate.setSeconds(0);
            localStorageDate.setMilliseconds(0);
            serverDate.setMilliseconds(0);
            return serverDate.valueOf() >= localStorageDate.valueOf();
        },
    });

    Sage.namespace('Utility.PickList');
    lang.mixin(Sage.Utility.PickList, new PickListUtil());
    return Sage.Utility.PickList;
});
