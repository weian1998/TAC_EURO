/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/MenuBar',
       'Sage/UI/MenuItem',
       'Sage/UI/PopupMenuBarItem',
       'Sage/UI/PopupMenuItem',
       'dijit/Menu',
       'Sage/UI/MenuBarItem',
       'dijit/MenuSeparator',
       'dojo/_base/declare'
],
function (menubar, menuItem, popupMenuBarItem, popupMenuItem, dijitMenu, menuBarItem, menuSeparator, declare) {
    var widget = declare('Sage.UI.MenuBar', [menubar], {
        postMixInProperties: function () {
            // create a single store from all data sorces needed
            this.store = Sage.UI.DataStore.MenuBar || {};
            this.inherited(arguments);
        },
        postCreate: function () {
            this.inherited(arguments);
            var len = this.store.items ? this.store.items.length : 0;
            for (var i = 0; i < len; i++) {
                var menuConfig = this.store.items[i];
                var mid = (menuConfig.id !== '') ? menuConfig.id : this.id + '_' + i;
                var config = {
                    label: menuConfig.text || '...',
                    icon: menuConfig.img || this._blankGif,
                    id: mid,
                    title: menuConfig.tooltip || menuConfig.text || '',
                    ref: menuConfig.href || menuConfig.navurl || '',
                    imageClass: menuConfig.imageClass || ''
                };
                if (menuConfig.items && menuConfig.items.length > 0) {
                    var menu = new dijitMenu({});
                    this._addItemsToMenu(menuConfig.items, menu, mid);
                    config['popup'] = menu;
                    this.addChild(new popupMenuBarItem(config));
                } else {
                    //some don't have children, they are just buttons...
                    config['onClick'] = dojo.hitch(config, function () {
                        if (this.ref !== '') {
                            window.location.href = this.ref;
                        }
                    });
                    this.addChild(new menuBarItem(config));
                }
            }
        },
        _addItemsToMenu: function (items, menu, idContainer) {
            idContainer = idContainer || '';
            var len = items.length;
            for (var i = 0; i < len; i++) {
                var item = items[i];
                if (item.isspacer || item.text === '-') {
                    menu.addChild(new menuSeparator({}));
                } else {

                    var config = {
                        label: item.text || '...',
                        icon: item.img || this._blankGif,
                        title: item.tooltip || item.text || '',
                        ref: item.href || '',
                        imageClass: item.imageClass || ''
                    };
                    if (item.id !== '') {
                        config['id'] = idContainer + '_' + item.id;
                    }
                    if (item.href !== '') {
                        config['onClick'] = function () {
                            if (this.ref !== '') {
                                try {
                                    window.location.href = this.ref;
                                } catch (e) { }
                            };
                        }
                    }
                    if (item.submenu.length > 0) {
                        //recursively add submenus as appropriate...
                        var popup = new dijitMenu({});
                        this._addItemsToMenu(item.submenu, popup, item.id || '');
                        config['popup'] = popup;
                        menu.addChild(new popupMenuItem(config));
                    } else {
                        menu.addChild(new menuItem(config));
                    }
                }
            }
        }
    });

    return widget;
});
