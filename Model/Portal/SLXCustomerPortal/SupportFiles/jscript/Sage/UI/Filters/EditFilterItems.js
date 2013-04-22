/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/_Widget',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dijit/Dialog',
        'dijit/form/Button',
        'Sage/UI/ImageButton',
        'dijit/form/CheckBox',
        'dijit/form/TextBox',
        'dojo/_base/declare',
        'dojo/_base/array',
        'dojo/_base/lang',
        'dojo/dom-construct',
        'dijit/registry',
        'Sage/UI/Controls/_DialogHelpIconMixin',
        'Sage/Utility/Filters',
        'dojo/json',
        'dojo/parser',
        'dojo/text!./templates/EditFilterItems.html',
        'dojo/i18n!./nls/EditFilterItems'
], function (
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Dialog,
        Button,
        ImageButton,
        CheckBox,
        TextBox,
        declare,
        array,
        lang,
        domConstruct,
        registry,
        DialogHelpIconMixin,
        FiltersUtility,
        json,
        parser,
        template,
        resource
) {
    return declare('Sage.UI.Filters.EditFilterItems', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        widgetsInTemplate: true,

        id: 'editFilterItems',
        store: null,
        activeFilters: '', // preserve query for original store
        filter: null,
        checkBoxes: null,
        allItems: null, // Keep this list even after searches, etc.
        filterPanel: null,
        parent: null, // checkbox filter
        formatter: null,
        baseFilter:'',
        // i18n
        selectAllText: 'Select All',
        findItemText: 'Find Item:',
        findText: 'Find',
        clearText: 'Clear',
        dialogTitle: 'Edit Filter Items',
        okText: 'OK',
        cancelText: 'Cancel',

        count: 1000,
        loading: false,
        handles: null,
        mainHandles: null,
        safeCheck: true,

        checkBoxTemplate: new Simplate([
            '<input id="{%: $.id %}" ',
            'name="{%: $.name %}" ',
            'data-dojo-type="dijit.form.CheckBox" ',
            'data-dojo-props="label: \'{%: $.name %}\'" ',
            'class="editFilterCheckBox" />',
            '<label for="{%: $.id %}">{%: $.itemName %}</label><br />'
        ]),

        constructor: function (options) {
            this.inherited(arguments);
            this.checkBoxes = [];
            this.allItems = [];
            this.handles = [];
            this.mainHandles = []; // main controls that don't refresh

            if (resource) {
                this.selectAllText = resource.selectAllText;
                this.clearText = resource.clearText;
                this.findItemText = resource.findItemText;
                this.findText = resource.findText;
                this.dialogTitle = resource.dialogTitle;
                this.okText = resource.okText;
                this.cancelText = resource.cancelText;
            }
        },
        postCreate: function () {
            this.inherited(arguments);
            this.mainHandles.push(this.textFind.on('keyDown', lang.hitch(this, this._onFindMouseDown)));
            this.mainHandles.push(this.checkAll.on('click', lang.hitch(this, this._onCheckAllClick)));
        },
        _onCheckAllClick: function () {
            if (this.safeCheck) {
                if (this.checkAll.checked) {
                    this._onSelectAllClick();
                } else {
                    this._onClearAllClick();
                }
            }
        },
        showDialog: function () {
            this.requestData();
            lang.mixin(this.dialogNode, new DialogHelpIconMixin());
            this.dialogNode.createHelpIconByTopic('editFilterItems');
            this.dialogNode.show();
        },
        hideDialog: function () {
            this.dialogNode.hide();
        },
        _onClearAllClick: function () {
            array.forEach(this.checkBoxes, function (checkBox) {
                var label = checkBox.get('label'),
                    index = array.indexOf(this.allItems, checkBox.get('label'));

                if (index === -1) {
                    this.allItems.push(label);
                }

                checkBox.set('checked', false);
            }, this);
        },
        _onSelectAllClick: function () {
            array.forEach(this.checkBoxes, function (checkBox) {
                var label = checkBox.get('label'),
                    index = array.indexOf(this.allItems, checkBox.get('label'));
                if (index > -1) {
                    this.allItems.splice(index, 1);
                }

                checkBox.set('checked', true);

            }, this);
        },
        _onClearClick: function () {
            this.textFind.set('value', '');
            this._onFindClick();
        },
        _onCancelClick: function () {
            this.textFind.set('value', '');
            this._onFindClick();

            this.dialogNode.hide();
            this.allItems = [];
        },
        _onOKClick: function () {
            this.textFind.set('value', '');
            this._onFindClick();

            var data = this.filterPanel._configuration._hiddenFilters || {},
                key = this.filterPanel._configuration._hiddenFiltersKey,
                service = Sage.Services.getService("ClientGroupContext"),
                context = service && service.getContext(),
                prop = context.CurrentEntity + '_' + this.filter.filterName,
                items = [];

            // Create it if necessary
            if (!data[prop]) {
                data[prop] = {
                    expanded: false,
                    hidden: false
                };
            }

            data[prop].items = this.allItems;
            FiltersUtility.setHiddenFilters(key, json.stringify(data));

            if (this.parent) {
                this.parent.refresh();
            }

            this.dialogNode.hide();
            this.allItems = [];
        },
        uninitialize: function () {
            if (!this.contentNode) {
                return;
            }
            
            array.forEach(this.mainHandles, function (handle) {
                handle.remove();
            });

            this._destroyContent();
            this.checkBoxes = null;
            this.allItems = null;
            this.checkAll.destroy(false);
            this.buttonCancel.destroy(false);
            this.buttonOK.destroy(false);
            this.buttonFind.destroy(false);
            this.textFind.destroy(false);
            this.dialogNode.destroy(false);
            this.inherited(arguments);
        },
        requestData: function () {
            if (!this.loading) {
                this._destroyContent();
                this.checkBoxes = [];
                this.activeFilters = this.store.request.getQueryArg('_activeFilter');
                this.store.request.setQueryArg('_activeFilter', this.baseFilter);
            }

            this.loading = true;

            this.store.fetch({
                onError: lang.hitch(this, this._onFetchError),
                onComplete: lang.hitch(this, this._onFetchComplete),
                count: this.count
            });
        },
        _onFindMouseDown: function (event) {
            if (event.keyCode === 13) {
                this._onFindClick();
            }
        },
        _onFindClick: function () {
            if (!this.loading) {
                var searchText = this.textFind.get('value');

                if (searchText) {
                    this.store.where = 'displayName like "%' + this.textFind.get('value') + '%"';
                } else {
                    this.store.where = '';
                }

                this.requestData();
            }
        },
        _destroyContent: function () {
            if (!this.contentNode) {
                return;
            }

            array.forEach(registry.findWidgets(this.contentNode), function (widget) {
                widget.destroy(false);
            });

            array.forEach(this.handles, function (handle) {
                handle.remove();
            });

            this.handles = [];
            this.checkBoxes = [];
            this.contentNode.innerHTML = '';
        },
        _onFetchError: function () {
        },
        _onCheckClick: function (e) {
            // "this" is object with self set to editfilteritems and 
            // checkBox set to the clicked checkbox
            var self = this.self,
                checkBox = this.checkBox,
                name = checkBox && checkBox.get('label'),
                index;

            if (checkBox.checked) {
                // Checked means we want a "visible" item.
                // allItems keeps a list of NOT visible, remove.
                index = array.indexOf(self.allItems, name);
                if (index > -1) {
                    self.allItems.splice(index, 1);
                }
            } else {
                self._safeCheckAll(false);
                self.allItems.push(name);
            }
        },
        _safeCheckAll: function (checked) {
            // Don't perform a iteration over all the items,
            // if safeCheck is false
            this.safeCheck = false;
            this.checkAll.set('checked', checked);
            this.safeCheck = true;
        },
        _onFetchComplete: function (items) {
            var entry,
                itemName,
                id,
                checkBox,
                templateItems = [],
                i,
                len = items.length,
                name,
                labelValue;


            for (i = 0; i < len; i++) {
                entry = items[i];
                labelValue = entry.$descriptor;
                if (this.formatter) {
                    labelValue = this.formatter(entry.$descriptor);
                }
                itemName = labelValue + ' (' + entry.value + ')';
                id = [this.filter.filterName, i].join('_');
                name = entry.name && entry.name.trim();

                if (name) {
                    name = name.replace("'", "\\'");
                    templateItems.push(this.checkBoxTemplate.apply({
                        id: id,
                        name: name,
                        itemName: itemName
                    }));
                }
            }

            checkBox = domConstruct.toDom(templateItems.join(''));
            domConstruct.place(checkBox, this.contentNode, 'last');

            this._finishedLoading();
        },
        _finishedLoading: function () {
            // We share the store with the checkbox filter.
            // Set the active filter query arg back.
            if (this.activeFilters) {
                this.store.request.setQueryArg('_activeFilter', this.activeFilters);
            }

            this._parseCheckBoxes();
            this.setupCheckState();

            this.loading = false;
        },
        _parseCheckBoxes: function () {
            var widgets;
            parser.parse(this.contentNode);

            widgets = registry.findWidgets(this.contentNode);
            array.forEach(widgets, function (checkBox) {
                checkBox.on('click', lang.hitch({ checkBox: checkBox, self: this }, this._onCheckClick));
                this.checkBoxes.push(checkBox);
            }, this);
        },
        setupCheckState: function () {
            var data = this.filterPanel._configuration._hiddenFilters || {},
                service = Sage.Services.getService("ClientGroupContext"),
                context = service && service.getContext(),
                prop = context.CurrentEntity + '_' + this.filter.filterName,
                firstLoad = this.allItems.length === 0;

            if (data[prop]) {
                array.forEach(this.checkBoxes, function (checkBox) {
                    var dataIndex,
                        cachedIndex,
                        label = checkBox.get('label');

                    dataIndex = array.indexOf(data[prop].items, label);
                    cachedIndex = array.indexOf(this.allItems, label);

                    if (dataIndex > -1) {
                        checkBox.set('checked', false);
                        if (cachedIndex === -1 && firstLoad) {
                            this.allItems.push(label);
                        }
                    } else {
                        checkBox.set('checked', true);
                    }

                    cachedIndex = array.indexOf(this.allItems, label);

                    // These items may not be in the filter panels _hiddenFilters yet..
                    //index = array.indexOf(this.allItems, label);
                    if (cachedIndex > -1) {
                        checkBox.set('checked', false);
                    } else {
                        checkBox.set('checked', true);
                    }
                }, this);

                this._safeCheckAll(this.allItems.length === 0);
            }
        }
    });
});