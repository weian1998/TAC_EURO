/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */

define([
       'dijit/_Widget',
       'dijit/_TemplatedMixin',
       'dojo/_base/declare'
],
 
function(
   _Widget,
   _Templated,
   declare
){
   
var activityTaskPaneItem = declare("Sage.TaskPane.ActivityTaskPaneItem", [_Widget, _Templated], {
        securedAction: '',
        linkText: '',
        action:'',
        postCreate: function () {
            this.checkSecurityAccess();        
        },
        templateString: '<a dojoAttachPoint="linkTextNode" href="#"></a>',
        attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
            linkText: { node: 'linkTextNode', type: 'innerHTML' }, 
            action: { node: 'linkTextNode', type: 'attribute', attribute: 'href' }                   
        }),
   
       // this section relates to showing the link
        _getCurrentUserId: function () {
            var userid = '';
            var ctxService = Sage.Services.getService('ClientContextService');
            if (ctxService) {
                userid = ctxService.getValue('userID');
            }
            return userid;
        },
        checkSecurityAccess: function () {
            if (this.securedAction.length > 0) {
                var userid = this._getCurrentUserId();
                var targetlinknode = this.linkTextNode;
                var roleSecuritySvc = Sage.Services.getService('RoleSecurityService');
                roleSecuritySvc.hasAccess(this.securedAction, function(callbackResult){
                    var displayMode = "none";
                    if (callbackResult) {
                       displayMode = "inline";
                    }
                    dojo.style(targetlinknode, { "display": displayMode }); 
                
                });
           }
            else {
                dojo.style(this.linkTextNode, { "display": "inline" });
           }

        }
   
    });
    
    return activityTaskPaneItem;  
});