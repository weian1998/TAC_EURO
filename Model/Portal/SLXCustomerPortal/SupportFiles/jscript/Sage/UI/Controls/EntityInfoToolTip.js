/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/Tooltip',
       'Sage/Data/SingleEntrySDataStore',
       'Sage/Utility',
       'dojo/string',
       'dojo/html',
       'dojo/i18n!./nls/EntityInfoToolTip',
       'dojo/_base/lang',
       'dojo/_base/declare'
],
function (tooltip, SingleEntrySDataStore, util, dString, dhtml, nlsStrings, lang, declare) {
    var widget = declare('Sage.UI.Controls.EntityInfoToolTip', tooltip, {

        /*
        Example:
        var t = new Sage.UI.Controls.EntityInfoToolTip({
        connectId: '<some Dom element id',
        position: ['below'],
        entityName: 'accounts',
        entityId: 'AA2EK0013106',
        dataProps: [
        { label: 'Co:', property: 'AccountName' },
        { label: 'Ph:', property: 'MainPhone' },
        { label: 'URL:', property: 'WebAddress' }
        ]
        });
        */


        /**
        * @property {string} Entity name. Required.
        */
        entityName: '',

        /**
        * @property {string} Entity ID to fetch. Required.
        */
        entityId: '',

        /**
        * @property {array} configuration of objects specifying label and property for requesting and displaying data
        */
        dataProps: [],
        /**
        * @property {aray} specifies relationship includes when needed for items defined in dataProps
        */
        include: [],

        /* Resource strings from nls/{language}/EntityInfoToolTip.js
        errorText: 'Information not found.',
        loadingText: 'Loading...',
        noInfoText: 'No information to show.',
        mainText: 'Main:',
        faxText: 'Fax:',
        tollFreeText: 'Toll Free:',
        urlText: 'Web URL:',
        workText: 'Work:',
        mobileText: 'Mobile:',
        emailText: 'Email:',
        contactNameText: 'Name:',
        phoneText: 'Phone:',
        accountText: 'Account:',
        */

        _store: null,
        _storeOptions: null,

        constructor: function (options) {
            lang.mixin(this, nlsStrings);
            this.inherited(arguments);
        },
        postCreate: function () {
            this.inherited(arguments);
            this.label = 'Loading...';
        },
        //onShow: function () {
        open: function (target) {
            if (!this.entityId || this.entityId.trim() === '') {
                this.set('label', this.noInfoText);
            } else if (!this._store) {
                if (this.dataProps.length < 1) {
                    this.dataProps = this._findPredefined(this.entityName);
                }
                if (this.dataProps.length < 1) {
                    this.set('label', this.errorText);
                    return;
                }
                this._setupStore();
                this._fetchData(target);
            }
            this.inherited(arguments);
        },
        _setDataPropsAttr: function (dataProps) {
            this._store = false;
            this.set('label', this.loadingText);
            this.dataProps = dataProps;
        },
        _getDataPropsAttr: function () {
            return this.dataProps;
        },
        _setEntityIdAttr: function (entityId) {
            this._store = false;
            this.set('label', (entityId === '') ? this.noInfoText : this.loadingText);
            this.entityId = entityId;
        },
        _getEntityIdAttr: function () {
            return this.entityId;
        },
        _setupStore: function () {
            var select = [], sel = '', include = [], included = {};
            for (var i = 0; i < this.dataProps.length; i++) {
                sel = this.dataProps[i].property;
                if (sel.indexOf('.') > 0) {
                    var parts = sel.split('.'), inc = '';
                    for (var p = 0; p < parts.length - 1; p++) {
                        inc += parts[p];
                        if (!included[inc]) {
                            include.push(inc);
                            included[inc] = true;
                        }
                        inc += '/';
                    }
                    sel = sel.replace(/\./g, '/');
                }

                select.push(sel);
            }
            var self = this;
            var storeOptions = {
                include: dojo.isArray(this.include) ? this.include : [],
                select: select,
                resourceKind: self.entityName
            };
            if (include.length > 0) {
                storeOptions['include'] = include;
            }
            var dataStore = new SingleEntrySDataStore(storeOptions);

            self._storeOptions = storeOptions;
            self._store = dataStore;
        },
        _fetchData: function (target) {
            var t = target;
            this._store.fetch({
                predicate: '"' + this.entityId + '"',
                onComplete: function (data) { this.displayResults(data, t) },
                // when we implement "auto" mode, we can use this...
                //                beforeRequest: function (request) { 
                //                    request.setQueryArg('precedence', '1');
                //                },
                onError: function (e) {
                    this.set('label', this.errorText);
                },
                scope: this
            });
        },
        displayResults: function (data, target) {
            //console.log(data);
            var html = '<table class="propertyTip">';
            for (var i = 0; i < this.dataProps.length; i++) {
                var dp = this.dataProps[i];
                var val = util.getValue(data, dp.property);
                if (val) {
                    html += dString.substitute('<tr><td class="caption">${0}</td><td class="value">${1}</td></tr>', [dp.label, val]);
                }
            }
            html += '</table>';
            this.set('label', html);
            this.close();
            this.open(target);
        },
        _findPredefined: function (entity) {
            switch (entity) {
                case 'accounts':
                    return [
                        { label: this.mainText || 'Main Phone:', property: 'MainPhone' },
                        { label: this.faxText || 'Fax:', property: 'Fax' },
                        { label: this.tollFreeText || 'Toll Free', property: 'TollFree' },
                        { label: this.urlText || 'Web URL', property: 'WebAddress' }
                    ];
                case 'contacts':
                    return [
                        { label: this.workText || 'Work:', property: 'WorkPhone' },
                        { label: this.mobileText || 'Mobile:', property: 'Mobile' },
                        { label: this.faxText || 'Fax:', property: 'Fax' },
                        { label: this.emailText || 'Email:', property: 'Email' }
                    ];
                case 'leads':
                    return [
                        { label: this.workText || 'Work:', property: 'WorkPhone' },
                        { label: this.mobileText || 'Mobile:', property: 'Mobile' },
                        { label: this.faxText || 'Fax:', property: 'Fax' },
                        { label: this.emailText || 'Email:', property: 'Email' }
                    ];
                case 'tickets':
                    return [
                        { label: this.contactNameText || 'Contact:', property: 'Contact.Name' },
                        { label: this.phoneText || 'Phone:', property: 'Contact.WorkPhone' },
                        { label: this.emailText || 'Email:', property: 'Contact.Email' }
                    ];
                case 'opportunities':
                    return [
                        { label: this.accountText || 'Account:', property: 'Account.AccountName' },
                        { label: this.mainText || 'Main Phone:', property: 'Account.MainPhone' }
                    ];
            }
            return [];
        }
    });

    return widget;
});

