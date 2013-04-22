/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/form/CheckBox',
    'dojo/_base/declare'
],
function (
    Checkbox,
    declare
    ) {
    var scope = declare('Sage.UI.GroupMenuFmtScope', null, {
        store : null,
        currentGroupId : '',
        constructor: function(args) {
            this.store = args.store;
            this.currentGroupId = '';
            var ctxService = Sage.Services.getService('ClientGroupContext');
            if (ctxService) {
                dojo.connect(ctxService, 'onCurrentGroupChanged', this, "onCurrentGroupChanged");
            }
        },
        fmtSelectedCol: function(value, idx) {
            if (this.currentGroupId === '') {
                var clGrpContextSvc = Sage.Services.getService("ClientGroupContext");
                if (clGrpContextSvc) {
                    var clGrpContext = clGrpContextSvc.getContext();
                    this.currentGroupId = (clGrpContext.CurrentGroupID === 'LOOKUPRESULTS') ? 'p6UJ9A00024G' : clGrpContext.CurrentGroupID;
                }
            }
            //return '<span class="dijitCheckedMenuItemIconChar">&#10003;</span>';
            //'<div style="width:20px;text-align:center"><img src="images/greendot.gif" alt="Selected" /></div>' : 
            return (value === this.currentGroupId)  
                ? ['<span id="', value, '" >&#10003;</span>'].join('') 
                : ['<span id="', value, '" >&nbsp;</span>'].join('');
        },
        fmtHideCol: function(value, idx, cell) {
            var grid = cell.grid,
                item = grid.getItem(idx),
                checkBox = new Checkbox();

            checkBox.set('checked', !value);
            checkBox.on('click', function() {
                var checked = checkBox.get('checked');
                if (checked) {
                    Sage.Groups.GroupManager.UnHideGroup(item['$key'], true);
                } else {
                    Sage.Groups.GroupManager.HideGroup(item['$key'], true);
                }
            });

            return checkBox; 
        },
        onCurrentGroupChanged: function() {
            this.currentGroupId = '';
            var groupContextSvc = Sage.Services.getService('ClientGroupContext');
            var context = groupContextSvc.getContext();
            //dijit.byId('grpMenuWithXGroup').set('label', dojo.string.substitute('For ${0} Group', [context.CurrentName])));
            if (dijit.byId('GroupTabs').selectedChildWidget.id !== context.CurrentGroupID) {
                dijit.byId('GroupTabs').selectChild(context.CurrentGroupID);
            }

        }
    });
    
    return scope;
});