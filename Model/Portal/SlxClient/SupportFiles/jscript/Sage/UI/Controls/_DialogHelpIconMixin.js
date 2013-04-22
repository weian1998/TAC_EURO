/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
/* 
Mixin for creating a help icon in dijit/Dialogs (or anything that has a titleBar attach point)
*/
define([
        'dojo/_base/declare',
        'dojo/dom-construct',
        'dojo/dom-attr',
        'dojo/i18n!./nls/_DialogHelpIconMixin'
//'Sage/Link' /* Circular ref between Link/Utility - Don't require this */
],
function (declare, domConstruct, domAttr, nls) {
    return declare('Sage.UI.Controls._DialogHelpIconMixin', null, {
        helpTopic: '',
        createHelpIcon: function (url, target) {
            // Bail out if there is no url or we already have an existing helpIcon
            if (!url || this.helpIcon) {
                //if we have multiple dialogs living in the same workspace the help icon may contain the wrong help context
                domConstruct.destroy(this.helpIcon);
            }

            var link = domConstruct.create('a', { href: url, 'target': target || 'help', 'class': 'dialogHelpIcon' }, this.titleBar, 'first'),
                node = domConstruct.create('div', { 'class': 'Global_Images icon16x16 icon_Help_16x16', title: nls.helpTooltip }, link);

            // Assign a helpIcon attach point for this.
            this.helpIcon = link;
        },
        createHelpIconByTopic: function (topic, subsystem) {
            if (!topic) {
                topic = this.helpTopic;
            } else {
                this.helpTopic = topic;
            }
            var target = Sage.Link.getHelpUrlTarget(),
                url = Sage.Link.getHelpUrl(topic, subsystem);
            this.createHelpIcon(url, target);
        },
        destroy: function () {
            domConstruct.destroy(this.helpIcon);
            this.inherited(arguments);
        },
        _setHelpTopicAttr: function (topic) {
            this.helpTopic = topic;
            if (this.helpIcon) {
                var url = Sage.Link.getHelpUrl(topic);
                domAttr.set(this.helpIcon, 'href', url);
            } else {
                this.createHelpIconByTopic(topic);
            }
        },
        _getHelpTopicAttr: function () {
            return this.helpTopic;
        }
    });
});