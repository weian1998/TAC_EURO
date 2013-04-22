/*globals Sage, window, define, sessionStorage */
define([
        'dojo/_base/lang',
        'Sage/Data/SDataServiceRegistry',
        'dojo/json'
],
function (lang, SDataServiceRegistry, json) {
    Sage.namespace('Utility.Filters');
    lang.mixin(Sage.Utility.Filters, {
        getHiddenFiltersKey: function () {
            // Compatible with 7.5.4 keys..
            var service = Sage.Services.getService("ClientGroupContext"),
                context = service && service.getContext(),
                keyPart = 'hidden_filters_',
                groupId = context && context.CurrentGroupID,
                key = '';
            if (groupId) {
                groupId = groupId.toLowerCase();
                groupId = groupId.replace(/ /g, '_').replace(/'/g, '_');
                key = keyPart + groupId;
            }
            
            return key;
        },
        setHiddenFilters: function (key, value) {
            var service, entry, request;

            service = SDataServiceRegistry.getSDataService('system');
            entry = {
                '$name': 'setHiddenFilters',
                'request': {
                    'key': key,
                    'value': value
                }
            };
            request = new Sage.SData.Client.SDataServiceOperationRequest(service);

            request.setOperationName('setHiddenFilters');
            request.execute(entry, {});

            // Invalidate the session storage cache
            sessionStorage.removeItem(key);
        },
        getHiddenFilters: function (key, success, failure) {
            var service, request, entry, data;
            data = sessionStorage.getItem(key);

            if (data === null) {
                service = SDataServiceRegistry.getSDataService('system');
                entry = {
                    '$name': 'getHiddenFilters',
                    'request': {
                        'key': key
                    }
                };

                request = new Sage.SData.Client.SDataServiceOperationRequest(service)
                    .setOperationName('getHiddenFilters');

                request.execute(entry, {
                    success: lang.hitch(this, this._getHiddenFiltersSuccess, success, key),
                    failure: failure
                });
            } else {
                // Cached data is stored as json string, parse it back out, and return to the caller
                success.call(this, json.parse(data));
            }

        },
        _getHiddenFiltersSuccess: function (onSuccess, key, data) {
            if (onSuccess) {
                // Cache as json string
                sessionStorage.setItem(key, json.stringify(data));
                onSuccess.call(this, data);
            }
        },
        resolveDataType: function (dataTypeId) {
            //console.log(dataTypeId);
            switch (dataTypeId) {
                case '47f90249-e4c8-4564-9ae6-e1fa9904f8b8': // Integer
                case '6b0b3d51-0728-4b67-9473-52836a81da53': // Short Integer
                case '2596d57d-89d6-4b72-9036-b18c64c5324c': // Decimal
                case 'f37c635c-9fbf-40d8-98d5-750a54a3cca1': // Double
                    return 'numeric';
                case 'ccc0f01d-7ba5-408e-8526-a3f942354b3a': // Text
                case '76c537a8-8b08-4b35-84cf-fa95c6c133b0': // Unicode Text
                case 'b71918bf-fac1-4b62-9ed5-0b0294bc9900': // PickList
                case '517d5e69-9efa-4d0a-8e7a-1c7691f921ba': // Dependency Lookup
                    return 'string';
                case '8edd8fce-2be5-4d3d-bedd-ea667e78a8af': // Enum
                    return 'enum';
                case '1f08f2eb-87c8-443b-a7c2-a51f590923f5': // DateTime
                    return 'date';
                case '30053f5a-8d40-4db1-b185-1e4128eb26cc': // Standard Id
                    return 'key';
                case '92432b4d-8206-4a96-ba7b-e4cbd374f148': // Boolean
                    return 'boolean';
                case 'f4ca6023-9f5f-4e41-8571-50ba94e8f233': // blob
                    return 'binary';
                default:
                    return 'unknown';
            }
        },
        resolveDataTypeQB: function (dataTypeId) {
            var results;
            switch (dataTypeId) {
                case '47f90249-e4c8-4564-9ae6-e1fa9904f8b8': // Integer
                case '6b0b3d51-0728-4b67-9473-52836a81da53': // Short Integer
                    results = 'Integer';
                    break;
                case '2596d57d-89d6-4b72-9036-b18c64c5324c': // Decimal
                case 'f37c635c-9fbf-40d8-98d5-750a54a3cca1': // Double
                    results = 'Decimal';
                    break;
                case 'ccc0f01d-7ba5-408e-8526-a3f942354b3a': // Text
                case '76c537a8-8b08-4b35-84cf-fa95c6c133b0': // Unicode Text
                case 'b71918bf-fac1-4b62-9ed5-0b0294bc9900': // PickList
                case '517d5e69-9efa-4d0a-8e7a-1c7691f921ba': // Dependency Lookup
                    results = 'String';
                    break;
                case '1f08f2eb-87c8-443b-a7c2-a51f590923f5': // DateTime
                    results = 'Date/Time';
                    break;
                case 'f4ca6023-9f5f-4e41-8571-50ba94e8f233': //blob
                    results = 'Memo/Blob';
                    break;
                default:
                    results = 'String';
            }

            return results;
        }
    });
    
    return Sage.Utility.Filters;
});