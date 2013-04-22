/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/UI/MenuItem',
        'dojo/text!../templates/MenuBarItem.html',
        'dojo/_base/declare'
],
function (menuItem, template, declare) {
    var widget = declare("Sage.UI.MenuBarItem", menuItem, {
        iconClass: '',
        _setIconClassAttr: { node: 'iconNode', type: 'class' },
        
        label: '',
        _setLabelAttr: { node: 'containerNode', type: 'innerHTML' },
        
        icon: '',
        _setIconAttr: { node: 'iconNode', type: 'attribute', attribute: 'src' },
        
        imageClass: 'noIcon',
        
        iconStyle: '',
        _setIconStyleAttr: { node: 'iconNode', type: 'style' },
        
        templateString: template
    });
    
    return widget;
});