/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/_Widget',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dijit/Dialog',
        'dijit/form/Button',
        'dijit/form/CheckBox',
        'dojo/_base/declare',
        'dojo/i18n',
        'dojo/_base/array',
        'dojo/_base/lang',
        'dojo/dom-construct',
        'dijit/registry',
        'Sage/UI/Controls/_DialogHelpIconMixin',
        'Sage/Utility/Filters',
        'dojo/json',
        'dojo/text!./templates/EditFilters.html',
        'dojo/i18n!./nls/EditFilters'
], function (
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Dialog,
        Button,
        CheckBox,
        declare,
        i18n,
        array,
        lang,
        domConstruct,
        registry,
        DialogHelpIconMixin,
        FiltersUtility,
        json,
        template) {
    return declare('Sage.UI.Filters.EditFilters', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        widgetsInTemplate: true,
        
        id: 'editFilters',
        store: null,
        filterPanel: null,
        checkBoxes: null,
        
        // i18n
        selectAllText: 'Select All',
        dialogTitle: 'Edit Filters',
        okText: 'OK',
        cancelText: 'Cancel',
        
        constructor: function () {
            var resource = i18n.getLocalization('Sage.UI.Filters', 'EditFilters');
            this.inherited(arguments);
            this.checkBoxes = [];
            
            if (resource) {
                this.selectAllText = resource.selectAllText;
                this.okText = resource.okText;
                this.cancelText = resource.cancelText;
                this.dialogTitle = resource.dialogTitle;
            }
        },
        postCreate: function () {
            this.inherited(arguments);
            this.checkAll.on('click', lang.hitch(this, this._onCheckAllClick));
        },
        _onCheckAllClick: function () {
            if (this.checkAll.checked) {
                this._onSelectAllClick();
            } else {
                this._onClearAllClick();
            }
        },
        showDialog: function () {
            this.requestData();
            lang.mixin(this.dialogNode, new DialogHelpIconMixin());
            this.dialogNode.createHelpIconByTopic('editFilters');
            this.dialogNode.show();
        },
        hideDialog: function () {
            this.dialogNode.hide();
        },
        uninitialize: function () {
            this._destroyContent();
            this.checkAll.destroy(false);
            this.buttonCancel.destroy(false);
            this.buttonOK.destroy(false);
            this.dialogNode.destroy(false);
            this.checkBoxes = null;
            
            this.inherited(arguments);
        },
        requestData: function() {
            this._destroyContent();
            
            if (this.store) {
                this.store.fetch({
                    onItem: lang.hitch(this, this._onFetchItem),
                    onError: lang.hitch(this, this._onFetchError),
                    onComplete: lang.hitch(this, this._onFetchComplete)
                });
            }
        },
        _onClearAllClick: function () {
            array.forEach(this.checkBoxes, function (checkBox) {
                checkBox.set('checked', false);
            });
        },
        _onSelectAllClick: function () {
            array.forEach(this.checkBoxes, function (checkBox) {
                checkBox.set('checked', true);
            });
        },
        _onCancelClick: function () {
            this.dialogNode.hide();
        },
        _onOKClick: function () {
            this.dialogNode.hide();
            
            var data = this.filterPanel._configuration._hiddenFilters,
                key = this.filterPanel._configuration._hiddenFiltersKey,
                service = Sage.Services.getService("ClientGroupContext"),
                context = service && service.getContext();
            
            array.forEach(this.checkBoxes, function (checkBox) {
                var prop;
                
                prop = context.CurrentEntity + '_' + checkBox.get('label');
                if (data[prop]) {
                    // Update existing
                    data[prop].hidden = !checkBox.get('checked');
                } else {
                    // Create new
                    data[prop] = {
                        expanded: false,
                        hidden: !checkBox.get('checked'),
                        items: []
                    };
                }
            });

            FiltersUtility.setHiddenFilters(key, json.stringify(data));
            this.filterPanel.refreshFilters(false);
        },
        _destroyContent: function () {
            array.forEach(registry.findWidgets(this.contentNode), function (widget) {
                widget.destroy(false);
            });
            
            this.checkBoxes = [];
            this.contentNode.innerHTML = '';
        },
        _onFetchError: function() {
        },
        _onFetchItem: function(entry) {
            var type = entry.filterType,
                filterName = entry.filterName,
                displayName = entry.displayName || entry.filterName,
                id = filterName + '_check',
                checkBox = new CheckBox({ 'id': id, 'label': filterName });// CheckBox label appears to be broken..
            
            domConstruct.place(checkBox.domNode, this.contentNode, 'last');
            domConstruct.create('br', {}, checkBox.domNode, 'after');
            domConstruct.create('label', { 'for': id, innerHTML: displayName }, checkBox.domNode, 'after');
            checkBox.on('click', lang.hitch(this, this._onCheckClick));
            this.checkBoxes.push(checkBox);
        },
        _onCheckClick: function (e) {
            if (e.target && e.target.checked === false) {
                this.checkAll.set('checked', false);
            }
        },
        _onFetchComplete: function () {
            this.startup();
            this.setupCheckState();
        },
        setupCheckState: function () {
            var data = this.filterPanel._configuration._hiddenFilters || {},
                key = FiltersUtility.getHiddenFiltersKey(),
                service = Sage.Services.getService("ClientGroupContext"),
                context = service && service.getContext(),
                hasHiddenItems = false;
            
            this.checkAll.set('checked', true);
            this._onSelectAllClick();
            
            array.forEach(this.checkBoxes, function (checkBox) {
                var prop;
                
                prop = context.CurrentEntity + '_' + checkBox.get('label');
                if (data[prop]) {
                    if (data[prop].hidden) {
                        checkBox.set('checked', false);
                        hasHiddenItems = true;
                    } else {
                        checkBox.set('checked', true);
                    }
                }
            });
            
            this.checkAll.set('checked', !hasHiddenItems);
        }
    });
});