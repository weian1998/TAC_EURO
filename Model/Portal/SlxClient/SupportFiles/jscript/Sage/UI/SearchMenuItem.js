/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/declare',
        'dijit/MenuItem',
        'dijit/form/TextBox',
        'dijit/form/CheckBox',
        'dijit/form/Button',
        'Sage/UI/ImageButton',
        'dojo/dom-construct',
        'dojo/_base/lang',
        'dojo/has',
        'dojo/_base/sniff',
        'Sage/UI/Controls/_DialogHelpIconMixin',
        'dojo/text!../templates/GridMenuItem.html',
        'dojo/i18n!./nls/SearchMenuItem',
        'dojo/topic'
    ],
function (
        declare,
        MenuItem,
        TextBox,
        CheckBox,
        Button,
        ImageButton,
        domConstruct,
        lang,
        has,
        sniff,
        DialogHelpIconMixin,
        template,
        nls,
        topic
    ) {
    var widget = declare('Sage.UI.SearchMenuItem', MenuItem, {
        id: 'groupSearchMenuItem',

        templateString: template,
        seedQuery: '',

        // localized strings
        findText: 'Find: ',
        showHiddenText: 'Show Hidden: ',
        clearText: 'Clear',
        // end localized strings

        textBox: null,
        findButton: null,
        clearButton: null,
        showHiddenCheck: null,
        registeredWidgets: null,
        
        startup: function() {
            this.inherited(arguments);
            var keyDownFunc = lang.hitch(this, function(event) {
                    if (event.keyCode === 9) {
                        event.cancelBubble = true;
                    }
                });
            if (nls) {
                this.findText = nls.findText;
                this.showHiddenText = nls.showHiddenText;
                this.clearText = nls.clearText;
            }
            
            this.getParent().on('open', lang.hitch(this, this.init));
            
            if (has('mozilla')) {
                this.getParent().on('keyPress', keyDownFunc);
            } else {
                this.getParent().on('keyDown', keyDownFunc);
            }
        },
        init: function() {
            if (!this.started) {
                topic.subscribe("sage/ui/groups/gridMenuStarted", lang.hitch(this, function(gridMenuItem) {
                    this.registeredWidgets = [];
                    this._createSearchTextBox();
                    this._createShowHidden();
                    this._setQuery();// TODO: This will cause an extra query on initial load because the grid was started with an existing store. Fix it.
                    this.started = true;
                }));
            }

            var fn = lang.hitch(this, function() { this.focusText(); });
            setTimeout(fn, 100);
        },
        focusText: function() {
            if (this.textBox && this.textBox.focus) {
                this.textBox.focus();
            }
        },
        _createSearchTextBox: function() {
            this.textBox = new TextBox();
            this.textBox.startup();
            this.registeredWidgets.push(this.textBox);
            var keyDownFunc = lang.hitch(this, function(event) {
                if(event.keyCode === 13) {
                    this._setQuery();
                }
                
                // Prevent left/right arrow and tab from bubbling.
                if (event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 9) {
                    event.cancelBubble = true;
                }
            });
            
            if (has('mozilla')) {
                this.textBox.on('keyPress', keyDownFunc);
            } else {
                this.textBox.on('keyDown', keyDownFunc);
            }

            domConstruct.place(this.textBox.domNode, this.containerNode, 'only');
            domConstruct.create('label', {
                    'for': this.textBox.id,
                    'innerHTML': this.findText + ': ',
                    'class': 'groupMenuLabel'
                }, this.containerNode, 'first');
                
            this.findButton = new ImageButton({
                imageClass: 'icon_Find_16x16',
                'class': 'groupMenuButton',
                'title': this.findText,
                onClick: lang.hitch(this, function() { this._setQuery(); })
            });
            
            this.clearButton = new Button({
                label: this.clearText,
                'class': 'groupMenuButton',
                'title': this.clearText,
                onClick: lang.hitch(this, function () {
                    this.textBox.set('value', '');
                    this._setQuery();
                })
            });
            
            domConstruct.place(this.findButton.domNode, this.containerNode, 'last');
            domConstruct.place(this.clearButton.domNode, this.containerNode, 'last');
            
            this.titleBar = this.containerNode;
            lang.mixin(this, new DialogHelpIconMixin());
            this.createHelpIconByTopic('Group_Manager');
            domConstruct.place(this.helpIcon, this.containerNode, 'last');
            
            this.registeredWidgets.push(this.findButton);
            this.registeredWidgets.push(this.clearButton);
        },
        _createShowHidden: function() {
            var key = 'GroupMenuShowHidden',
                checkState = sessionStorage.getItem(key);
            
            if (checkState === null) {
                sessionStorage.setItem(key, 'false');
                checkState = 'false';
            }
            
            this.showHiddenCheck = new CheckBox();
            this.showHiddenCheck.set('checked', checkState === 'true' ? true : false);
            this.registeredWidgets.push(this.showHiddenCheck);
            
            this.showHiddenCheck.on('click', lang.hitch(this, function(event) {
                this._setQuery();
                var grid = dijit.byId('groupsGridInMenu');
                
                if (grid) {
                    if (this.showHiddenCheck.checked) {
                        sessionStorage.setItem(key, 'true');
                        grid.structure[1].width = "205px";
                    } else {
                        sessionStorage.setItem(key, 'false');
                        grid.structure[1].width = "260px";
                    }
                
                    grid.setStructure(grid.structure);
                    grid.layout.setColumnVisibility(2, this.showHiddenCheck.checked);
                }
            }));
            
            var wrapper = domConstruct.create('p', null, this.containerNode, 'last');
            
            domConstruct.place(this.showHiddenCheck.domNode, wrapper, 'last');
            domConstruct.create('label', {
                    'for': this.showHiddenCheck.id,
                    'innerHTML': this.showHiddenText,
                    'class': 'groupMenuLabel'
                }, this.showHiddenCheck.domNode, 'before');
        },
        _setQuery: function() {
            var grid = dijit.byId('groupsGridInMenu'),
                searchText = this.textBox.get('value').replace(/'/g, "''"),
                queryParts = [];
                
            if (grid) {
                if (!this.seedQuery) {
                    // Preserve the original query.
                    this.seedQuery = grid.get('query');
                }
                
                queryParts.push(this.seedQuery);
                
                if (searchText) {
                    searchText = this._escapeSearchText(searchText);
                    queryParts.push("and upper(displayName) like '%" + searchText.toUpperCase() + "%'");
                }

                if (!this.showHiddenCheck.checked) {
                    queryParts.push("and not isHidden");
                }

                grid.set('query', queryParts.join(' '));
                grid._refresh();
            }
        },
        _escapeSearchText: function (searchText) {
            searchText = searchText.replace(/\[/g, '[[]').replace(/_/g, '[_]').replace(/%/g, '[%]');
            return searchText;
        },
        _onClick: function(e) {
            // because we live in a menu, we don't want the menu's click handling to hide
            // us when the user selects a row.
            e.cancelBubble = true;
        },
        destroy: function() {
            var i;
            if (this.registeredWidgets !== null) {
                for (i = 0; i < this.registeredWidgets.length; i++) {
                    this.registeredWidgets[i].destroy(false);
                    this.registeredWidgets.splice(i, 1);
                }
            }
            
            this.inherited(arguments);
        }
    });

    return widget;
});
