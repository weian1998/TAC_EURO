/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/MenuItem',
        'dijit/_Widget',
        'dojo/dom-style',
        'dojo/_base/declare',
        'dojo/text!../templates/MenuItem.html'
],
function (menuItem, _Widget, domStyle, declare, template) {
    var widget = declare('Sage.UI.MenuItem', menuItem, {
        templateString: template,
        
        iconClass: '',
        _setIconClassAttr: { node: 'iconNode', type: 'class' },
        
        label: '',
        _setLabelAttr: { node: 'containerNode', type: 'innerHTML' },
        
        icon: '',
        _setIconAttr: { node: 'iconNode', type: 'attribute', attribute: 'src' },
        
        imageClass: 'noIcon',
        
        iconStyle: '',
        _setIconStyleAttr: { node: 'iconNode', type: 'style' },
        
        ref: '',

        postMixInProperties: function() {
            if (this.hasImageClass() && this.hasIcon()) {
                this.icon = this._blankGif;
            } else {
                this.icon = this.icon || this._blankGif;
            }
            this.inherited(arguments);
        },
        postCreate: function () {
            this.inherited(arguments);
            if (this.hasImageClass()) {
                this.set('icon', this._blankGif);
                domStyle.set(this.iconNode, 'display', 'none');
            } else {
                domStyle.set(this.iconNodeSprite, 'display', 'none');
            }
        },
        hasImageClass: function () {
            if (this.imageClass && this.imageClass !== 'noIcon') {
                return true;
            }
            
            return false;
        },
        hasIcon: function () {
            if (this.icon && this.icon !== this._blankGif) {
                return true;
            }
            
            return false;
        },
        destroy: function() {
            this._setSelected = function () {};
            this.inherited(arguments);
        }
    });
    
    return widget;
});