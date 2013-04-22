/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dojo/i18n',
       'dijit/layout/ContentPane',
       'dijit/layout/TabContainer',
       'Sage/UI/Dashboard/DashboardTabController',
       'Sage/UI/Dashboard/DashboardPage',
       'Sage/Utility',
       "dijit/Menu",
       "dijit/MenuItem",
       'dojo/_base/declare',
       'dojo/i18n!./nls/DashboardTabController',
       'dojo/i18n!./nls/Dashboard'
],
function (i18n, contentPane, tabContainer, dashboardTabController, dashboardPage, Utility, menu, menuItem, declare) {
    //    dojo.requireLocalization("Sage.UI.Dashboard", "DashboardTabController");
    //    dojo.requireLocalization("Sage.UI.Dashboard", "Dashboard");
    //    dojo.requireLocalization("dijit", "common");

    var widget = declare('Sage.UI.Dashboard.Dashboard', tabContainer, {
        //summary:
        //		Initialize a container class to manage functionality for a user's 
        //		dashboard. The Dashboard class will manage the implementation of
        //		the tab container dijit as well as functions which affect the 
        //		dashboard as a whole. Individual tab pages will manage themselves
        //		through the DashboardPage class which Dashboard will consume
        //options: Object 
        //		information about to the Dashboard/pages:
        controllerWidget: 'Sage.UI.Dashboard.DashboardTabController',
        // for the show tabs dialog
        _stTableOuter: new Simplate([
            '<div id="stTable" class="show-tab-table"><table>',
            '{%= $.content %}',
            '</table><div class="button-bar alignright"><button data-dojo-type="dijit.form.Button" type="button"',
            ' id="btnSTOk" title="{%= $.buttonOk %}">{%= $.buttonOk %}</button>',
            '</div></div>'
        ]),
        _stTableInner: new Simplate([
            '<tr id="row_{%= $.id %}"><td><button data-dojo-type="dijit.form.Button"',
            'type="button" id="btn_{%= $.id %}" class="btn-show-tab">{%= $.showText %}</button></td>',
            '<td><span>{%= $.title %}</span></td></tr>'
        ]),
        _copyNameForm: new Simplate([
            '<div id="copyNameForm"><table width="100%">',
            '<tr><td>{%= $.titleText %}</td><td><div data-dojo-type="dijit.form.ValidationTextBox" id="txtCopyName"',
            ' regExp="[^<>;]*" value="" required="true" invalidMessage="{%= $.invalidMessage %}"></div></td></tr>',
            '<tr><td colspan="2" align="right"><div class="button-bar"><button data-dojo-type="dijit.form.Button" type="button"',
            ' id="btnCNOK" title="{%= $.buttonOk %}">{%= $.buttonOk %}</button>',
            '<button data-dojo-type="dijit.form.Button" type="button"',
            ' id="btnCNCancel" title="{%= $.buttonCancel %}" >{%= $.buttonCancel %}</button>',
            '</div></td></tr></table></div>'
        ]),
        resources: {}, // TODO: move the other resource calls in Dashboard.js into here
        // Since the context menu is pinned to tabs, if there are none
        // then the user can't add new ones. Call this to make a context menu that just has add/show
        // appear on the page OR remove it if a tab is added (it will override tab context menus otherwise)
        addRemovePageContextMenu: function () {
            var addContext = true;

            for (var i = 0; i < this._childPages.length; i++) {
                if (!this._childPages[i]._beingDestroyed) {
                    var childTab = dijit.byId('Dashboard_tablist_' + this._childPages[i].id);

                    addContext = false;

                    if (childTab && childTab.tabContent.style.display == 'none') {
                        addContext = true;
                    }
                    else {
                        break;
                    }
                }
            }

            if (addContext) {
                if (this._contextMenu) {
                    this._contextMenu.destroyRecursive();
                }

                this._contextMenu = new menu({
                    id: this.id + "_ContextMenu",
                    dir: this.dir,
                    targetNodeIds: [this.domNode]
                });

                this._contextMenu.addChild(new menuItem({
                    label: this.newTabText,  //'New Tab'
                    dir: this.dir,
                    onClick: function () {
                        // get the dashboard
                        var db = dijit.byId('Dashboard');
                        db._createPage(true, db.newTabText); //'New Tab'
                    }
                }));

                this._contextMenu.addChild(new menuItem({
                    label: this.showTabText, // 'Show Tab'
                    dir: this.dir,
                    onClick: dojo.hitch(this, function () {
                        var d = dijit.byId('Dashboard');
                        d._showTabMenu();
                    })
                }));

                this.selectShownTab = true;
            }
            else if (this._contextMenu) {
                // TO-DO: Figure out how to remove the context menu when children (widgets, for instance)
                //          are right-clicked, and this won't have to be destroyed
                this._contextMenu.destroyRecursive();
                this.selectShownTab = false;
            }
        },
        postCreate: function () {
            // ensure that a widgetDefinitions object exists by this point
            if (!Sage.UI.WidgetDefinitions) {
                Sage.UI.WidgetDefinitions = {};
            }
            this._getUserOptions();

            this.subscribe('/ui/dashboard/pageDelete', function (pg) {
                // close (and destroy?) the UI
                this.closeChild(pg);
                // remove from db
                this._deletePage(pg);

                this.addRemovePageContextMenu();
            });

            this.inherited(arguments);
        },
        postMixInProperties: function () {
            dojo.mixin(this, i18n.getLocalization("Sage.UI.Dashboard", "Dashboard"));
            dojo.mixin(this, i18n.getLocalization("Sage.UI.Dashboard", "DashboardTabController"));
            dojo.mixin(this.resources, i18n.getLocalization("Sage.UI.Dashboard", "WidgetDefinition"));
            dojo.mixin(this, i18n.getLocalization("dijit", "common"));
            this.inherited(arguments);
        },
        _childPages: [],
        _createPage: function (ans, name) {
            if (!ans) { return; }
            var obj = {
                closable: true,
                onClose: function () { return true; },
                name: name,
                title: name,
                family: 'System',
                acceptTypes: ['Portlet'],
                hasResizableColumns: false,
                _columns: [],
                // will add to the total
                _page: this._childPages.length,
                _parentId: this.id,
                permission: true,
                _childWidgets: []
            };
            var newPage = new dashboardPage(obj);
            this._childPages.push(newPage);
            this.addChild(this._childPages[this._childPages.length - 1]);
            // go to the new page
            this.selectChild(this._childPages[this._childPages.length - 1]);
            newPage.isNew = true;
            newPage._editOptionsMenu();
        },
        // Look through tabs until a matching title is found and make that tab visible
        _showPage: function (hiddenId) {
            var hidden = Sage.UI.DataStore.Dashboard.userOptions.hidden,
                pg = hidden[hiddenId],
                found = false;

            for (var i = 0; i < this._childPages.length; i++) {
                if (this._childPages[i].title == pg) {
                    var childTab = dijit.byId('Dashboard_tablist_' + this._childPages[i].id);

                    if (childTab) {
                        dojo.style(childTab.tabContent, 'display', 'block');
                        found = true;

                        if (this.selectShownTab) {
                            this.selectChild(this._childPages[i]);
                            this._showChild(this._childPages[i]);
                        }

                        break;
                    }
                }
            }

            if (!found) {
                var closeConfirm = function () { return true; };
                for (var i = 0, len = this.info.userPages.length; i < len; i++) {
                    var ttl = Sage.Utility.htmlDecode(this.pages[i]['@title']);
                    var _id = ttl;
                    while (_id.indexOf(' ') !== -1) { _id = _id.replace(' ', '_'); }
                    _id = _id.replace(/'/g, '_').replace(/"/g, '_');
                    if (ttl == pg) {
                        var columnCount;

                        if (this.pages[i]['@colWidths']) {
                            columnCount = this.pages[i]['@colWidths'].split(',').length;
                        }

                        var permission = this.info.permissions[_id];

                        // If there is only 1 column, it may not be an array, which causes nothing to get rendered later
                        this.pages[i].Columns.Column = Utility.Convert.toArrayFromObject(this.pages[i].Columns.Column);
                        this._childPages.push(new dashboardPage({
                            id: _id,
                            closable: true,
                            onClose: closeConfirm,
                            name: ttl,
                            title: this.resources[_id] || ttl,
                            family: this.pages[i]['@family'] || 'System',
                            nbZones: columnCount || 1,
                            acceptTypes: ['Portlet'],
                            hasResizableColumns: false,
                            firstButNotDefault: false,
                            colWidths: this.pages[i]['@colWidths'],
                            _columns: this.pages[i].Columns.Column,
                            _page: i,
                            _parentId: this.id,
                            permission: permission,
                            _childWidgets: []
                        }));
                        // save the column widths if present
                        if (this.pages[i]['@colWidths']) {
                            // unfortunately we cant set these here, we have to wait 
                            // until the tab is visible (init)
                            this._childPages[this._childPages.length - 1]._colWidths = this.pages[i]['@colWidths'];
                        }

                        this.addChild(this._childPages[this._childPages.length - 1]);

                        if (this.selectShownTab) {
                            this.selectChild(this._childPages[this._childPages.length - 1]);
                        }

                        break;
                    }
                }
            }

            if (hiddenId in hidden) {
                delete hidden[hiddenId];
                this._updateUserOptions();
            }
        },
        _copyPageContent: function (pg, new_title) { // new_title for copy()
            var page = pg.Dashboard;
            var len = this._childPages.length;
            var ttl = new_title ? new_title : page['@title'];
            var _id = page['@id'];
            // cannot have whitespace
            while (_id.indexOf(' ') !== -1) { _id = _id.replace(' ', '_'); }
            var columnCount;
            if (page['@colWidths']) {
                columnCount = page['@colWidths'].split(',').length;
            }
            var permission = false;
            if (new_title) {
                permission = true;
            }
            else if (page['@permission']) {
                permission = page['@permission'];
            }
            this._childPages.push(new dashboardPage({
                closable: true,
                onClose: function () { return true; },
                name: ttl, // name is the plugin name in the database
                title: ttl,
                family: page['@family'] || 'System',
                nbZones: columnCount || 1,
                acceptTypes: ['Portlet'],
                hasResizableColumns: false,
                colWidths: page['@colWidths'],
                _columns: page.Columns.Column,
                _page: len, // make it the new last page
                _parentId: this.id,
                permission: permission,
                _childWidgets: []
            }));
            // save the column widths if present
            if (page['@colWidths']) {
                // unfortunately we cant set these here, we have to wait 
                // until the tab is visible (init)
                this._childPages[len]._colWidths = page['@colWidths'];
            }
            this.addChild(this._childPages[len]); // NOT len-1
            // go to the page so we can save it correctly
            this._childPages[len]._init();
            this._childPages[len].copyNotDrawn = true;
            //remove this from the hidden hash
            var uo = Sage.UI.DataStore.Dashboard.userOptions;
            if (uo.hidden && _id in uo.hidden) {
                delete uo.hidden[_id];
                this._updateUserOptions();
            }

            this._childPages[len]._save();
        },
        _copyPage: function (pg) {
            var d = new dijit.Dialog({
                title: this.copyTabText,
                style: "width:250px"
            });
            d.set('content', this._copyNameForm.apply({
                titleText: this.titleText,
                buttonOk: this.okButton,
                buttonCancel: this.buttonCancel,
                invalidMessage: this.invalidMessage
            }));

            var fnDestroy = function () {
                dojo.disconnect(_closed);
                dojo.disconnect(ok);
                dojo.disconnect(cancel);
                d.destroyRecursive();
            };

            var ok = dojo.connect(dijit.byId('btnCNOK'), 'onClick', this,
                function () {
                    var txtCopyName = dijit.byId('txtCopyName');
                    if (!txtCopyName.isValid() || !this._isTitleUnique(txtCopyName.value)) {
                        return false;
                    }

                    if (!pg.pageRendered) {
                        pg.copyNotDrawn = true; // Flag to redraw widgets if this tab is selected
                        pg._init();
                    }

                    var ttl = txtCopyName.value;
                    var clone = pg._copy();
                    this._copyPageContent(clone, ttl);
                    d.hide();
                });

            var cancel = dojo.connect(dijit.byId('btnCNCancel'), 'onClick', this,
                function () {
                    d.hide();
                });

            var _closed = dojo.connect(d, "hide", this, fnDestroy);

            d.show();
        },
        _createPages: function () {
            //summary:
            //		Parse the user's pages into JSON objects
            //		and append them to this as pages.1 pages.2 etc...
            //		Then create the pages in the tab container
            this.pages = {};
            var def = this.info.userOptions.defaultTab;
            var uo = Sage.UI.DataStore.Dashboard.userOptions;
            var defIndex;
            var childPageIndex = 0;
            var closeConfirm = function () { return true; };
            for (var i = 0, len = this.info.userPages.length; i < len; i++) {
                var page = dojo.fromJson(this.info.userPages[i]);
                this.pages[i] = page.Dashboard;
                var ttl = Sage.Utility.htmlDecode(this.pages[i]['@title']);
                var _id = ttl;
                while (_id.indexOf(' ') !== -1) { _id = _id.replace(' ', '_'); }
                _id = _id.replace(/'/g, '_').replace(/"/g, '_');

                if (!uo.hidden || !uo.hidden[_id]) {
                    var columnCount;

                    if (this.pages[i]['@colWidths']) {
                        columnCount = this.pages[i]['@colWidths'].split(',').length;
                    } else {

                        this.pages[i]['@colWidths'] = 0;
                        columnCount = 1;
                    }

                    var permission = this.info.permissions[_id];

                    // If there is only 1 column, it may not be an array, which causes nothing to get rendered later
                    this.pages[i].Columns.Column = Utility.Convert.toArrayFromObject(this.pages[i].Columns.Column);
                    this._childPages.push(new dashboardPage({
                        id: _id,
                        closable: true,
                        onClose: closeConfirm,
                        name: ttl,
                        title: this.resources[_id] || ttl,
                        family: this.pages[i]['@family'] || 'System',
                        nbZones: columnCount || 1,
                        acceptTypes: ['Portlet'],
                        hasResizableColumns: false,
                        firstButNotDefault: i === 0 && ttl !== def,
                        colWidths: this.pages[i]['@colWidths'],
                        _columns: this.pages[i].Columns.Column,
                        _page: i,
                        _parentId: this.id,
                        permission: permission,
                        _childWidgets: []
                    }));
                    // save the column widths if present
                    if (this.pages[i]['@colWidths']) {
                        // unfortunately we cant set these here, we have to wait 
                        // until the tab is visible (init)
                        this._childPages[childPageIndex]._colWidths = this.pages[i]['@colWidths'];
                    }

                    this.addChild(this._childPages[childPageIndex]);

                    if (ttl === def) {
                        defIndex = childPageIndex;
                    }

                    childPageIndex++;
                }
            }
            // select the default tab if there was one
            // (don't call selectChild() to do this, as the tabs not yet being
            //  rendered results in failure)
            if (defIndex) {
                this._childPages[defIndex].selected = true;
                this._childPages[defIndex]._init();
            } else if (this._childPages.length > 0) {
                this._childPages[0].selected = true;
                this._childPages[0]._init();
            }

            this.addRemovePageContextMenu();
        },
        _deletePage: function (pg, no_update) {
            // prevent 'deleted-my-default-tab-no-init'
            var uo = Sage.UI.DataStore.Dashboard.userOptions;
            if (pg.title === uo.defaultTab) {
                uo.defaultTab = '';
                if (!no_update) { this._updateUserOptions(); }
            }
            var vURL = "SLXGroupBuilder.aspx?method=GetGroupIdFromNameFamilyAndType&name=" + pg.name + "&family=System&type=36";
            dojo.xhrGet({
                url: vURL,
                error: dojo.hitch(this, function (pluginData) { console.log(['Page ', pg.id, ' not deleted.'].join('')); }),
                load: dojo.hitch(this, function (pluginData) {
                    Sage.Groups.GroupManager.GetFromServer(Sage.Groups.GroupManager.GMUrl + 'DeleteGroup&gid=' + pluginData,
                        'text',
                        function () { },
                        function (req) { }
                    );
                })
            });
        },
        _hidePage: function (pg) {
            var uo = Sage.UI.DataStore.Dashboard.userOptions;
            // same as _delete but store the data item (36) intact so that
            // the page can be 'shown'
            var tabToHide = dijit.byId('Dashboard_tablist_' + pg.id);
            dojo.style(tabToHide.tabContent, 'display', 'none');

            if (this.selectedChildWidget == pg) {
                this.selectFirstVisible();
            }

            // add the json representation of the page to _userOptions.hidden
            if (!uo.hidden) { uo.hidden = {}; }
            uo.hidden[pg.id] = pg._hide();
            // update the userOptions
            this._updateUserOptions();

            this.addRemovePageContextMenu();
        },
        _showTabMenu: function () {
            // get a reference to the hidden tabs
            var hidden = Sage.UI.DataStore.Dashboard.userOptions.hidden;
            var inner = [];
            // need content if there are objects in the hash
            if (hidden && Sage.Utility.size(hidden)) {
                for (var id in hidden) {
                    inner.push(this._stTableInner.apply({
                        title: hidden[id],
                        id: id,
                        buttonCancel: this.buttonCancel,
                        showText: this.showText
                    }));
                }
            }
            // build a dialog
            var d = new dijit.Dialog({
                title: this.showTabText,
                style: "width:350px"
            });
            d.set('content', this._stTableOuter.apply({
                content: inner.join(''),
                buttonOk: this.buttonOk // this should be 'close' and not cancel
            }));

            d.show();
            var listeners = []; // so we can disconnect them
            if (hidden) {
                for (var id in hidden) {
                    var showButton = dijit.byId('btn_' + id);
                    listeners.push(dojo.connect(showButton, 'onClick',
                        showButton, function () {
                            var db = dijit.byId('Dashboard'),
                                hiddenId = this.id.replace('btn_', ''),
                                thisRow = dojo.byId('row_' + hiddenId);
                            db._showPage(hiddenId);
                            db.addRemovePageContextMenu();
                            dojo.style(thisRow, 'display', 'none');
                        }));
                }
            }
            var ok = dojo.connect(dijit.byId('btnSTOk'), 'onClick', null,
                function () {
                    d.hide();
                });
            var cancel = dojo.connect(d, 'hide', null,
                function () {
                    dojo.disconnect(ok);
                    dojo.disconnect(cancel);
                    dojo.forEach(listeners, dojo.disconnect);
                    d.destroyRecursive();
                });
        },
        _isTitleUnique: function (title, tabId) {
            var isUnique = true;
            var dashboardPages = this._childPages;
            var checkId = '';

            if (tabId) {
                checkId = tabId;
            }

            for (var i = 0; i < dashboardPages.length; i++) {
                if (dashboardPages[i].id != checkId && !dashboardPages[i]._destroyed && dashboardPages[i].title === title) {
                    isUnique = false;

                    var opts = {
                        title: this.warningText,
                        query: this.invalidDuplicateMessage,
                        yesText: this.okButton,
                        style: { width: '300px' }
                    }
                    Sage.UI.Dialogs.raiseQueryDialogExt(opts);

                    break;
                }
            }

            return isUnique;
        },
        selectFirstVisible: function () {
            var found = false;

            for (var i = 0; i < this._childPages.length; i++) {
                var childTab = dijit.byId('Dashboard_tablist_' + this._childPages[i].id);

                if (childTab && childTab.tabContent.style.display != 'none') {
                    found = true;
                    this.selectChild(this._childPages[i]);
                    break;
                }
            }

            if (!found) {
                try {
                    this.selectChild();
                }
                catch (err) {
                    // This will happen when we're setting selected to null
                }
            }
        },
        selectChild: function (child) {
            this.inherited(arguments);
            if (child._init) {
                child._init();
            }
            if (child.copyNotDrawn) {
                child.copyNotDrawn = false;
                child._redrawWidgets();
            }
        },
        _getUserOptions: function () {
            //summary:
            //		If the data is not there, subscribe to the event
            //		published by the Sage.UI.DataStore.Dashboard
            if (Sage.UI.DataStore.Dashboard) {
                this.info = Sage.UI.DataStore.Dashboard;
                this._createPages();
            } else {
                this.subscribe('/ui/dashboard/info', function (info) {
                    this.info = info;
                    this._createPages();
                });
            }
        },
        /*_updateUserOptions: function () {
        var uo = dojo.toJson(Sage.UI.DataStore.Dashboard.userOptions);
            
        var svc = Sage.Services.getService("UserOptions");
        if (svc) {
        svc.set('Options', 'Dashboard', uo, function (data) {
                
        });
        } else {
        console.log('Error updating user options service');
        }
        }*/
        _updateUserOptions: function () {
            var uo = Sage.UI.DataStore.Dashboard.userOptions;
            var uri = 'slxdata.ashx/slx/crm/-/dashboard/useroption?name=Options&category=Dashboard';

            var def = dojo.xhrPut({
                url: uri,
                handleAs: 'text',
                postData: dojo.toJson(uo),
                load: function (data) {

                },
                error: function (error) {
                    console.log('error updating userOptions');
                }
            });
        }
    });

    return widget;
});