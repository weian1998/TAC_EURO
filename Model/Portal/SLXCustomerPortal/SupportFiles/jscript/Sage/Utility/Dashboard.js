/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/i18n',
        'dojox/grid/DataGrid',
        'Sage/Groups/GroupManager',
        'Sage/UI/Dialogs',
        'dojo/data/ItemFileReadStore',
        'Sage/UI/Controls/_DialogHelpIconMixin',
		'dojo/i18n!./nls/Dashboard',
        'dojo/i18n!../UI/Dashboard/nls/WidgetDefinition',
        'dojo/i18n!dijit/nls/common'
],
function (i18n, DataGrid, GroupManager, Dialogs, ItemFileReadStore, _DialogHelpIconMixin, Dashboard, WidgetDefinition, CommonResource) {
    Sage.namespace('Utility.Dashboard');
    dojo.mixin(Sage.Utility.Dashboard, {
        // Promotes the current group to a 'Group List' widget on the Dashbaord.
        promoteGroupToDashboard: function () {
            var widgetOptions = '<Widget name="Group List" family="System"><options><name>Group List</name><title>{0}</title><entity>{1}</entity><resource>{7}</resource><groupname>{2}</groupname><limit>{3}</limit><visiblerows>{6}</visiblerows><datasource>slxdata.ashx/slx/crm/-/analytics?entity=Sage.Entity.Interfaces.I{4}&amp;groupname={5}</datasource></options></Widget>';

            var dialogContent = new Simplate(['<div>',
                '<div">{%= $.headerText %}</div>',
                '<div id="{%= $.id %}-grid" style="width:auto;height:150px;"></div>',
                '<div align="right"><button data-dojo-type="dijit.form.Button" type="submit" class="okButton" ',
            //TODO: Add button bar feature to a Sage.UI.Dialogs option.
                'style="margin-top:5px;" data-dojo-props="onClick:function(){dijit.byId(\'promoteDialog\').promote();}"',
                '>{%= $.okText %}</button>',
                '<button data-dojo-type="dijit.form.Button" type="button" class="cancelButton" ',
            //TODO: Add button bar feature to a Sage.UI.Dialogs option.
                'style="margin-top:5px; margin-left:10px;" data-dojo-props="onClick:function(){dijit.byId(\'promoteDialog\').hide();}"',
                '>{%= $.cancelText %}</button></div>',
                '</div> ']);

            var dialog = null;
            if (dijit.byId('promoteDialog')) {
                dialog = dijit.byId('promoteDialog');
            }
            else {
                dialog = new dijit.Dialog({
                    id: 'promoteDialog',
                    title: MasterPageLinks.PromoteTitle,
                    promote: function (a, b, c) {
                        var cgi = GroupManager.GetCurrentGroupInfo();
                        var groupGrid = dijit.byId('promoteDialog-grid');
                        var items = groupGrid.selection.getSelected();                       
                        if (items.length === 0) {
                            Dialogs.showInfo(MasterPageLinks.PromotePageNoneSelected, MasterPageLinks.PromoteTitle);
                            return;
                        }
                        else {
                            var pagesList = [],
                                unlocalizedName = items[0].Name,
                                tabEntity = dijit.byId(cgi.Id);

                            if (WidgetDefinition.My_Dashboard == items[0].Name) {
                                unlocalizedName = 'My Dashboard';
                            }
                            else if (WidgetDefinition.Sales == items[0].Name) {
                                unlocalizedName = 'Sales';
                            }

                            var widgetstring = String.format(widgetOptions, tabEntity ? tabEntity.title : cgi.Name, "Sage.Entity.Interfaces.I" + cgi.Entity,
                                cgi.Name, 10, $('<div/>').text(cgi.Entity).html(), $('<div/>').text(cgi.Name).html(), 10, cgi.Entity);

                            dojo.xhrPost({
                                url: String.format("slxdata.ashx/slx/crm/-/dashboard/page?action=addwidget&name={0}&family={1}",
                                    encodeURIComponent(unlocalizedName),
                                    encodeURIComponent(items[0].Family)
                                ),
                                headers: { 'Content-Type': 'application/json' },
                                postData: widgetstring,
                                error: function (request, status, error) {
                                    Dialogs.showInfo(MasterPageLinks.Warning, request.responseText);
                                },
                                load: function (data, status) {
                                    Dialogs.showInfo(String.format(MasterPageLinks.PromotionNotification, items[0].Name, tabEntity ? tabEntity.title : cgi.Name));
                                    if (typeof callback === "function") callback(data, status);
                                }
                            });
                        }
                        //Our link is in a Repeater so there is a postback happening each time the dialog is launched.
                        //Destroy recursive to start over and avoid any dom corruption.        
                        this.destroyRecursive();
                    }
                });

                dojo.mixin(dialog, new _DialogHelpIconMixin());
                dialog.createHelpIconByTopic("PromoteGroup");
            }
            var grid = null;
            grid = new DataGrid({
                id: 'promoteDialog-grid',
                structure: [
                { field: 'Name', name: Dashboard.pageText, width: '200px' }
            ],
                selectionMode: 'single',
                height: '100px'
            }, document.createElement('div'));

            var onHide = function () {
                dojo.disconnect(hideEvent);

                setTimeout((function (dialog) {
                    return function () {
                        dialog.destroyDescendants();
                        dialog.destroy(false);
                    };
                })(dialog), 1);
            };         

            var hideEvent = dojo.connect(dialog, "hide", this, onHide);

            dojo.xhrGet({
                url: "slxdata.ashx/slx/crm/-/dashboard/page",
                cache: false,
                preventCache: true,
                handleAs: 'json',
                load: function (data, xhr) {
                    var storeData = { items: data };
                    var gridStore = new ItemFileReadStore({
                        data: storeData
                    });
                    dialog.set('content', dialogContent.apply({
                        id: dialog.id,
                        okText: CommonResource.buttonOk,
                        cancelText: CommonResource.buttonCancel,
                        headerText: MasterPageLinks.PromoteDescription
                    }));
                    dialog.show();
                    dojo.place(grid.domNode, 'promoteDialog-grid', 'replace');
                    grid.setStore(gridStore);
                },
                error: function (e) {
                    alert(MasterPageLinks.Warning + e.responseText);
                    if (console.log) {
                        console.log(e);
                    }
                }
            });
        }
    });

    return Sage.Utility.Dashboard;
});