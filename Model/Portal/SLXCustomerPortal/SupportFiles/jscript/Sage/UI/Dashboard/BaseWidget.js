/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/UI/Dashboard/BaseWidget',
    'Sage/Utility',
    'dojo/i18n',
    'Sage/UI/EditorContainer',
    'dojo/_base/declare',
    'dojo/i18n!./nls/WidgetDefinition'
],
function (baseWidget, util, i18n, editorContainer, declare) {
    //dojo.requireLocalization("Sage.UI.Dashboard", "WidgetDefinition");
    var widget = declare('Sage.UI.Dashboard.BaseWidget', null, {
        constructor: function (def) {
            dojo.safeMixin(this, def);
        },
        postMixInProperties: function () {
            dojo.mixin(this, i18n.getLocalization("Sage.UI.Dashboard", "WidgetDefinition"));
            this.inherited(arguments);
        },
        family: 'System',
        prefHeight: 0.33,
        timestamp: true,
        _getEditorString: function (config, _id) {
            var _widgetDefinitionResource = i18n.getLocalization("Sage.UI.Dashboard", "WidgetDefinition");
            var localizedWidgetName = _widgetDefinitionResource[this.name];

            if (localizedWidgetName) {
                localizedWidgetName += ' ' + _widgetDefinitionResource["settingsText"];  // "[Widget Name]" + " Settings"
            }
            else {
                localizedWidgetName = _widgetDefinitionResource["defaultWidgetText"]; // default to "Edit Widget Settings" if resource not found
            }

            // make a new table container with the config
            config._pcid = _id;
            var cont = new editorContainer(config);
            if (!cont) {
                console.warn('hit...');
            }
            if(this._editorTpl) {
                return this._editorTpl.apply({
                    title: localizedWidgetName,
                    id: _id + '_editor',
                    content: cont.doTemplate()
                });
            }
            
            return '';
        }
    });
    
    return widget;
});