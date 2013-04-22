/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       "dijit/MenuBar",
       "Sage/UI/MenuItem",
       "Sage/UI/PopupMenuBarItem",
       "Sage/UI/OrientableMenuBar",
       'dojo/i18n!./nls/HelpMenu',
       'dojo/_base/declare',
       'dojo/dom-class'
],
function (menuBar, menuItem, popupMenuBarItem, orientableMenuBar, i18nStrings, declare, domClass) {
    var widget = declare('Sage.UI.Controls.HelpMenu', orientableMenuBar, {    
        orientation: { 'BR' : 'TR', 'BL' : 'TL' },
        postMixInProperties: function() {
            this.inherited(arguments);
        },
        postCreate: function() {
            this.inherited(arguments);

            var menu = new dijit.Menu();
            menu.addChild(new menuItem({
                label: i18nStrings.webClientHelpText,
                imageClass: 'icon_Help_16x16',
                title: i18nStrings.webClientHelpText,
                id: 'helpRoot',
                onClick: function () { Sage.Utility.openHelp('slxoverview'); }
            }));
            menu.addChild(new menuItem({
                label: i18nStrings.gettingStartedText,
                imageClass: 'icon_pdf_16x16',
                title: i18nStrings.gettingStartedText,
                id: 'helpGettingStarted',
                onClick: function() { window.open('help/Getting Started with Sage SalesLogix Web Client.pdf', 'MCWebHelp'); }
            }));
            menu.addChild(new menuItem({
                label: i18nStrings.quickReferenceText,
                imageClass: 'icon_pdf_16x16',
                title: i18nStrings.quickReferenceText,
                id: 'helpQuickReference',
                onClick: function() { window.open('help/Sage SalesLogix Quick Reference for the Web User.pdf', 'MCWebHelp'); }
            }));
            menu.addChild(new menuItem({
                label: i18nStrings.aboutText,
                imageClass: 'icon_Help_16x16',
                title: i18nStrings.aboutText,
                id: 'helpAbout',
                onClick: function () { Sage.Utility.openHelp('slxthirdparty'); }
            }));
            var menuChildren = menu.getChildren();
            domClass.add(menuChildren[1].domNode, 'hiddenHelpButton'); // Hidden for Customer Portal - "Getting Started"
            domClass.add(menuChildren[2].domNode, 'hiddenHelpButton'); // Hidden for Customer Portal - "Quick Reference"

            this.addChild(new popupMenuBarItem({
                label: '',
                iconStyle: 'width: 16px',
                imageClass: 'icon_Help_16x16',
                title: i18nStrings.helpText,
                id: 'btnHelpMenu',
                popup: menu
            }));
        }
    });

    return widget;
});
