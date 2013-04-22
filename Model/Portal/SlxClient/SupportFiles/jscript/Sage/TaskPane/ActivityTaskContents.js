/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/_Widget',
        'Sage/_Templated',
        'dojo/_base/declare'
],
function(
   _Widget,
   _Templated,
   declare
){     
  var activityTaskContents = declare('Sage.TaskPane.ActivityTaskContents', [_Widget, _Templated], {
        widgetsInTemplate: true,
        templateLocation: '', 
        templateString: '', 
        widgetTemplate: '',
        constructor: function(config) {
            this.widgetTemplate = config.taskTemplate;
            dojo.subscribe('/sage/ui/list/selectionChanged', function (listPanel) {
                    var countSpan = dojo.byId('selectionCount');
                    if (countSpan) {
                        countSpan.innerHTML = listPanel.getTotalSelectionCount();
                    }
                });
        },

        _clearSelection: function(e){
            var listPanel = dijit.byId('list');
            if (listPanel) {
                 listPanel._listGrid.selection.clear();
             }            
          }

    });
    return activityTaskContents;  
});