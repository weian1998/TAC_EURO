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
   var snoozeButton = declare('Sage.MainView.ActivityMgr.SnoozeButton',  [_Widget, _Templated], {
        widgetsInTemplate: true,
        _started: false,
        widgetTemplate: new Simplate([
            '<span class="alarm-button">', // 
                '<button data-dojo-type="dijit.form.ComboButton" data-dojo-attach-point="_snoozeButton" data-dojo-attach-event="onClick:_cboClick" class="" >',
                    '<div data-dojo-type="Sage.MainView.ActivityMgr.SnoozeOptions" data-dojo-attach-point="_snoozeOptions"></div>',
                '</button>',
            '</span>'
        ]),
        startup: function() {
           
            if (this._started) {
                return;
            }
            this.inherited(arguments);
            
            //dojo.addClass(this.domNode, 'displaynone');
            this._started = true;
        },
        _cboClick: function() {
           
             this._snoozeButton.openDropDown();
        },
        
        destroy:function(){
            
            this._snoozeButton.destroyRecursive();
        }
        
    });

    return snoozeButton;     
    
});