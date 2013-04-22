/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/lang',
        'dojo/_base/declare',
        'dojo/i18n',
        'dijit/_Widget',
        'Sage/_Templated',
        'Sage/UI/Controls/TextBox',
        'Sage/UI/Controls/PickList',
        'Sage/UI/Controls/DropDownSelectPickList',
        'dijit/Dialog',
        'Sage/UI/Controls/_DialogHelpIconMixin',
        'dojo/i18n!./nls/Name',
        'dojo/text!./templates/Name.html',
        'dojo/text!./templates/PersonName.html'
],
// ReSharper disable InconsistentNaming
function (
    lang,
    declare, 
    i18n,
    _Widget,
    _Templated,
    textBox, 
    pickList,
    dropDownSelectPickList,
    dialog,
    _DialogHelpIconMixin,
    nlsBundle,
    nameTemplate,
    personNameTemplate
 ) {
// ReSharper restore InconsistentNaming
    //dojo.requireLocalization('Sage.UI.Controls', 'Name');

    /**
    * @class Class for name control TextBox with edit dialog.
    */
    var widget = declare('Sage.UI.Controls.Name', [_Widget, _Templated], {
        //using Simplate to faciliate conditional display
        widgetTemplate: new Simplate(nameTemplate.split('\r')),
        dialogContent: new Simplate(personNameTemplate.split('\r')),
        templateOverridePath: 'templates/PersonName-Override.html', //i.e. 'templates/PersonName-Override.html'
        widgetsInTemplate: true,
        clientId: '',
        nameDesc: '',
        buttonImageUrl: '',
        buttonToolTip: '',
        buttonVisible: true,
        tabIndex: 0,
        //Name data object
        //name: {},
        //TODO: Move up into Name object once sdata name object structure is determined.
        prefix: '',
        first: '',
        middle: '',
        last: '',
        suffix: '',
        //PickList Data
        'Name Prefix': {},
        'Name Suffix': {},
        'LastName Prefix': {},
        //.net bound controls
        name: '',
        prefixClientId: '',
        nameFirstClientId: '',
        nameMiddleClientId: '',
        nameLastClientid: '',
        suffixClientId: '',
        required: false,
        //.net properties
        autoPostBack: false,
        constructor: function (options) {
            options.id = options.clientId;
            this.resources = i18n.getLocalization('Sage.UI.Controls', 'Name');

            if (options.templateOverridePath && options.templateOverridePath.length > 0) {
                try {
                    //Dynamic caching need to be obscured from the builder by using the dojo['cache'] calling method
                    this.dialogContent = new Simplate(dojo['cache']('Sage.UI.Controls', options.templateOverridePath).split('\r'));
                }
                catch (e) {
                    // No overriding templates exists.
                    console.log('Could not load template:' + e.description);
                }
            }
            // this.inherited(arguments);
        },
        postCreate: function () {
                this.getDotNetData();
                if (!this['Name Prefix'].data || !this['Name Suffix'].data || !this['LastName Prefix'].data) {
                    this.loadPickLists();
            }
            this.inherited(arguments);
        },
        loadPickLists: function () {
            var prefixDef = new dojo.Deferred();
            var suffixDef = new dojo.Deferred();
            var lastPreDef = new dojo.Deferred();

            var pickListConfig = {
                pickListName: 'Name Prefix', // Required
                // storeOptions: {}, // Optional
                // dataStore: {}, // Optional
                canEditText: false,
                itemMustExist: true,
                maxLength: -1,
                storeMode: 'text', // text, id, code
                sort: true,
                displayMode: 'AsControl',
                // clientId: 'ASP.NET Control ClientID Here',
                required: false,
                //placeInNodeId: '',
                autoPostBack: false
            };

            var prefixPickList = new pickList(pickListConfig);
            prefixPickList.getPickListData(prefixDef);
            prefixDef.then(dojo.hitch(this, this.storePickListData), function (e) {
                console.error(e); // errback
            });

            pickListConfig.pickListName = 'Name Suffix';
            var suffixPickList = new pickList(pickListConfig);
            suffixPickList.getPickListData(suffixDef);
            suffixDef.then(dojo.hitch(this, this.storePickListData), function (e) {
                console.error(e); // errback
            });

            pickListConfig.pickListName = 'LastName Prefix';
            var lastNamePrefixPickList = new pickList(pickListConfig);
            lastNamePrefixPickList.getPickListData(lastPreDef);
            lastPreDef.then(dojo.hitch(this, this.storePickListData), function (e) {
                console.error(e); // errback
            });

        },
        storePickListData: function (data) {
            this[data.name].data = data;
        },
        showDialog: function () {
            this.editDialog = dijit.byId([this.id, '-Dialog'].join(''));
            if (!this.editDialog) {
                this.editDialog = new dialog({
                    title: this.resources.dialogTitle,
                    id: [this.id, '-Dialog'].join('')
                    //                style: ['height:', dHeight, 'px;width:', dWidth, 'px;'].join('')
                });

                this.editDialog.set("content", this.dialogContent.apply({ id: this.id,
                    prefixText: this.resources.prefixText,
                    nameFirstText: this.resources.nameFirstText,
                    nameMiddleText: this.resources.nameMiddleText,
                    nameLastText: this.resources.nameLastText,
                    suffixText: this.resources.suffixText,
                    cancelText: this.resources.cancelText,
                    okText: this.resources.okText
                }));

            }
            this.setEditFields();
            // mixin help icon
            lang.mixin(this.editDialog, new _DialogHelpIconMixin());
            this.editDialog.createHelpIconByTopic('editname');
            this.editDialog.show();
            if (this.modality === 'modeless') {
                dojo.destroy([this.id, '-Dialog_underlay'].join(''));
            }
        },
        textBoxOnChange: function (value) {
            if (value !== this.formatName()) {
            this.parseName(value);
            this.setDotNetData();
            dojo.publish("Sage/events/markDirty");
            }
        },
        parseName: function (value) {
            var parseText = value.split(' ');
            var i, item;

            //See if the first value is a prefix and shift it.        
            for (i = 0; i < this['Name Prefix'].data.items.$resources.length; i++) {
                item = this['Name Prefix'].data.items.$resources[i];
                if (item.text.toUpperCase() === parseText[0].toUpperCase()) {
                    this.prefix = parseText[0];
                    // Remove the prefix after it has been evaluated and 
                    parseText.shift();
                    break;
                }
            }

            //See if the last value is a suffix and pop it.
            for (i = 0; i < this['Name Suffix'].data.items.$resources.length; i++) {
                item = this['Name Suffix'].data.items.$resources[i];
                if (item.text.toUpperCase() === parseText[parseText.length - 1].toUpperCase()) {
                    this.suffix = parseText[parseText.length - 1];
                    // Remove the suffix after it has been evaluated.
                    parseText.pop();
                    break;
                }
            }

            //If two values left check if first is 
            if (parseText.length > 0) {
                this.last = parseText[parseText.length - 1];
                parseText.pop();
            }

            //If the last item matches a LastName Prefix, append it to the last name
            if (parseText.length > 0) {
                for (i = 0; i < this['LastName Prefix'].data.items.$resources.length; i++) {
                    item = this['LastName Prefix'].data.items.$resources[i];
                    if (item.text.toUpperCase() === parseText[parseText.length - 1].toUpperCase()) {
                        this.last = [parseText[parseText.length - 1], this.last].join(' ');
                        // Remove the suffix after it has been evaluated.
                        parseText.pop();
                        break;
                    }
                }
            }

            //If there are items remaining
            if (parseText.length === 2) {
                this.first = parseText[0];
                this.middle = parseText[1];
            }

            if (parseText.length === 1) {
                this.first = parseText[0];
            }

        },
        getEditFields: function () {
            this.updateNameObj();
                this.setDotNetData();
            dojo.publish("Sage/events/markDirty");
        },
        updateNameObj: function () {
            if (dijit.byId([this.id, '-Prefix'].join(''))) {
                this.prefix = dijit.byId([this.id, '-Prefix'].join('')).comboBox.get('value');
            }
            if (dijit.byId([this.id, '-First'].join(''))) {
                this.first = dijit.byId([this.id, '-First'].join('')).get('value');
            }
            if (dijit.byId([this.id, '-Middle'].join(''))) {
                this.middle = dijit.byId([this.id, '-Middle'].join('')).get('value');
            }
            if (dijit.byId([this.id, '-Last'].join(''))) {
                this.last = dijit.byId([this.id, '-Last'].join('')).get('value');
            }
            if (dijit.byId([this.id, '-Suffix'].join(''))) {
                this.suffix = dijit.byId([this.id, '-Suffix'].join('')).comboBox.get('value');
            }
        },
        getDotNetData: function () {
            //summary:
            //We have a connected .net control to post values to.
            if (this.prefixClientId !== '') {
                this.prefix = dojo.byId(this.prefixClientId).value;
            }
            if (this.nameFirstClientId !== '') {
                this.first = dojo.byId(this.nameFirstClientId).value;
            }
            if (this.nameMiddleClientId !== '') {
                this.middle = dojo.byId(this.nameMiddleClientId).value;
            }
            if (this.nameLastClientid !== '') {
                this.last = dojo.byId(this.nameLastClientid).value;
            }
            if (this.suffixClientId !== '') {
                this.suffix = dojo.byId(this.suffixClientId).value;
            }
        },
        setDotNetData: function () {
            dojo.byId(this.prefixClientId).value = this.prefix;
            dojo.byId(this.nameFirstClientId).value = this.first;
            dojo.byId(this.nameMiddleClientId).value = this.middle;
            dojo.byId(this.nameLastClientid).value = this.last;
            dojo.byId(this.suffixClientId).value = this.suffix;
        },
        setEditFields: function () {
            if (dijit.byId([this.id, '-Prefix'].join(''))) {
                dijit.byId([this.id, '-Prefix'].join('')).comboBox.set('value', this.prefix);
            }
            if (dijit.byId([this.id, '-First'].join(''))) {
                dijit.byId([this.id, '-First'].join('')).set('value', this.first);
                dijit.byId([this.id, '-First'].join('')).set('style', 'width:100%');
            }
            if (dijit.byId([this.id, '-Middle'].join(''))) {
                dijit.byId([this.id, '-Middle'].join('')).set('value', this.middle);
                dijit.byId([this.id, '-Middle'].join('')).set('style', 'width:100%');
            }
            if (dijit.byId([this.id, '-Last'].join(''))) {
                dijit.byId([this.id, '-Last'].join('')).set('value', this.last);
                dijit.byId([this.id, '-Last'].join('')).set('style', 'width:100%');
            }
            if (dijit.byId([this.id, '-Suffix'].join(''))) {
                dijit.byId([this.id, '-Suffix'].join('')).comboBox.set('value', this.suffix);
            }
        },
        _okClicked: function () {
            this.getEditFields();
            if (this.focusNode.value !== this.formatName()) {        
                this.focusNode.set('value', this.formatName());
                dojo.publish("Sage/events/markDirty");
            }
        },
        _cancelClicked: function () {
            this.editDialog.hide();
        },
        formatName: function () {
            var name = ((this.prefix == "") ? "" : this.prefix + ' ');
            name += ((this.first == "") ? "" : this.first + ' ');
            name += ((this.middle == "") ? "" : this.middle + ' ');
            name += ((this.last == "") ? "" : this.last + ' ');
            name += ((this.suffix == "") ? "" : this.suffix);
            name = name.trim();
            return name;
        }

    });

    return widget;
});

