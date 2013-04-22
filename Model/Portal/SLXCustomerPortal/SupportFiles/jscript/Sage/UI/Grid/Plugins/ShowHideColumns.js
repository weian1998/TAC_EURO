/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/declare',
        'dojo/_base/array',
        'dojo/_base/lang',
        'dojox/grid/enhanced/_Plugin',
        'dojox/grid/EnhancedGrid',
        'dijit/Menu',
        'dijit/CheckedMenuItem',
        'dojo/on',
        'dojo/topic'
], function(
    declare,
    array,
    lang,
    _Plugin,
    EnhancedGrid,
    Menu,
    CheckedMenuItem,
    on,
    topic){

    var ShowHideColumns = declare("Sage.UI.Grid.Plugins.ShowHideColumns", _Plugin, {
        // name: String
        //      Plugin name.
        name: "showHideColumns",
        
        //privates: Object
        //      Private properties/methods shouldn't be mixin-ed anytime.
        privates: {},
        
        hideQueue: null,
        
        constructor: function(){
            this.hideQueue = [];
            this.inherited(arguments);
        },
        onStartUp: function(){
            var menu = new Menu(),
                menuItem;
            menu.startup();
            
            on(menu, 'open', lang.hitch(this, function () {
                if (this.grid.headerMenu) {
                    this.grid.headerMenu.destroyDescendants();
                }
                
                array.forEach(this.grid.layout.cells, function(cell){
                    menuItem = new CheckedMenuItem({
                        label: cell.name || '',
                        checked: !cell.hidden
                    });
                    
                    menuItem._onClick = lang.hitch({plugin: this, item: menuItem, cell: cell}, function (e) {
                            this.plugin.hideQueue.push(this.cell);
                            this.item.set('checked', !this.item.checked);
                            // Prevent menu from closing so we can multi-select
                            e.cancelBubble = true;
                    });
                    
                    this.grid.headerMenu.addChild(menuItem);
                }, this);
            }));
            
            on(menu, 'blur', lang.hitch(this, function () {
                array.forEach(this.hideQueue, function (item) {
                    this.grid.layout.setColumnVisibility(item.index, item.hidden);
                    topic.publish('/sage/ui/grid/columnToggle/' + this.grid.id, item);
                }, this);
                topic.publish('/sage/ui/grid/columnsToggled/' + this.grid.id);
                this.hideQueue = [];
            }));
            
            this.grid.set('headerMenu', menu);
        }
    });

    EnhancedGrid.registerPlugin(ShowHideColumns/*name:'showHideColumns'*/);

    return ShowHideColumns;
});
