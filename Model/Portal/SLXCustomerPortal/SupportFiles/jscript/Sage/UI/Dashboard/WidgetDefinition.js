/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'Sage/UI/widgetEditorLookup',
       'Sage/UI/EditorContainer',
       'dijit/form/ValidationTextBox',
       'dijit/form/NumberTextBox',
       'dijit/form/FilteringSelect',
       'dojo/data/ItemFileReadStore',
       "dojo/data/ItemFileWriteStore",
       'dojox/grid/DataGrid',
       "dojo/i18n",
       'dojo/i18n!./nls/WidgetDefinition'
],
function (widgetEditorLookup, editorContainer, validationTextBox, numberTextBox, filteringSelect, itemFileReadStore, itemFileWriteStore, dataGrid, i18n) {
    return function (def, callback) {
        if (!def.type) { def.type = 'BaseWidget'; }
        require(['Sage/UI/Dashboard/' + def.type], function (T){
          // Require the type, pass it back to the caller
          callback(new T(def));
        });
    };
});



