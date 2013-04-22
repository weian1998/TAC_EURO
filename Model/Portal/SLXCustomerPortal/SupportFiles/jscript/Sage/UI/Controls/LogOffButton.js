/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        "dijit/MenuBar",
        "Sage/UI/MenuItem",
        'Sage/UI/MenuBarItem',
        'dojo/i18n!./nls/LogOffButton',
        'dojo/_base/declare'
],
function (MenuBar, MenuItem, MenuBarItem, i18nStrings, declare) {
    var logOffButton = declare('Sage.UI.Controls.LogOffButton', MenuBar, {
        postMixInProperties: function () {
            this.inherited(arguments);
        },
        postCreate: function () {
            this.inherited(arguments);
           
            this.addChild(new MenuBarItem({
                label: i18nStrings.logOffText,
                iconStyle: 'width: 16px',
                icon: 'images/icons/login_16.png',
                imageClass: 'icon_login_16',
                title: i18nStrings.logOffText,
                id: 'btnLogOff',
                onClick: function () {
                    try {
                        window.location.href = 'Shutdown.axd';
                    } catch (e) { } //ie throws an error when the user clicks cancel on the "are you sure" dialog.
                }
            }));
        }
    });
    
    return logOffButton;
});