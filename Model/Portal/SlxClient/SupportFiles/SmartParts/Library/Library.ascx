<%@ Control Language="C#" AutoEventWireup="true" CodeFile="Library.ascx.cs" Inherits="SmartParts_Library_Library" %>
<%@ Register Assembly="Sage.SalesLogix.Web" Namespace="Sage.SalesLogix.Web" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls"
    TagPrefix="SalesLogix" %>
<%@ Register Assembly="System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35"
    Namespace="System.Web.UI" TagPrefix="asp" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="Saleslogix" %>    

<!-- this control allows the client to read values from a resource file 
Never is referenced in the script below as LibraryResources.Never -->
<SalesLogix:ScriptResourceProvider ID="LibraryResources" runat="server">
    <Keys>
        <SalesLogix:ResourceKeyName Key="File" />
        <SalesLogix:ResourceKeyName Key="Size" />
        <SalesLogix:ResourceKeyName Key="Created" />
        <SalesLogix:ResourceKeyName Key="Revised" />
        <SalesLogix:ResourceKeyName Key="Expires" />
        <SalesLogix:ResourceKeyName Key="Description" />
        <SalesLogix:ResourceKeyName Key="Library" />
        <SalesLogix:ResourceKeyName Key="Never" />
        <SalesLogix:ResourceKeyName Key="AddFiles" />
        <SalesLogix:ResourceKeyName Key="FileProperties" />
        <SalesLogix:ResourceKeyName Key="DeleteSelectedFile" />
        <SalesLogix:ResourceKeyName Key="Help" />
        <SalesLogix:ResourceKeyName Key="AddFolder" />
        <SalesLogix:ResourceKeyName Key="EditFolder" />
        <SalesLogix:ResourceKeyName Key="DeleteFolder" />
        <SalesLogix:ResourceKeyName Key="PleaseWait" />
        <SalesLogix:ResourceKeyName Key="UploadingFiles" />
        <SalesLogix:ResourceKeyName Key="Complete" />
        <SalesLogix:ResourceKeyName Key="FileUploadComplete" />
        <SalesLogix:ResourceKeyName Key="PctCompleteFmt" />
        <SalesLogix:ResourceKeyName Key="FileName" />
        <SalesLogix:ResourceKeyName Key="Directory" />
        <SalesLogix:ResourceKeyName Key="Status" />
        <SalesLogix:ResourceKeyName Key="DoNotExpire" />
        <SalesLogix:ResourceKeyName Key="Abstract" />
        <SalesLogix:ResourceKeyName Key="ForceDistribution" />
        <SalesLogix:ResourceKeyName Key="DocumentProperties" />
        <SalesLogix:ResourceKeyName Key="Submitting" />
        <SalesLogix:ResourceKeyName Key="OK" />
        <SalesLogix:ResourceKeyName Key="Cancel" />
        <SalesLogix:ResourceKeyName Key="Loading" />
        <SalesLogix:ResourceKeyName Key="DeleteFileCnfmFmt" />
        <SalesLogix:ResourceKeyName Key="Confirm" />
        <SalesLogix:ResourceKeyName Key="PleaseSelectFile" />
        <SalesLogix:ResourceKeyName Key="DefaultDeleteFileErrorMsg" />
        <SalesLogix:ResourceKeyName Key="DontDeleteRoot" />
        <SalesLogix:ResourceKeyName Key="DeleteFolderCnfmFmt" />
        <SalesLogix:ResourceKeyName Key="FolderNotDeleted" />
        <SalesLogix:ResourceKeyName Key="PleaseSelectFolder" />
        <SalesLogix:ResourceKeyName Key="NewFolder" />
        <SalesLogix:ResourceKeyName Key="EnterFolderName" />
        <SalesLogix:ResourceKeyName Key="EnterNewFolderName" />
        <SalesLogix:ResourceKeyName Key="DontEditRoot" />
        <SalesLogix:ResourceKeyName Key="NoAccessMessage" />
        <SalesLogix:ResourceKeyName Key="NoAccessTitle" />
        <SalesLogix:ResourceKeyName Key="Yes" />
        <SalesLogix:ResourceKeyName Key="No" />
    </Keys>
</SalesLogix:ScriptResourceProvider>

<script type="text/javascript">
    var CanManageLibrary = true;
    
    $(document).ready(function() {
        //............................................................................................................
        //uncomment the following line to make library management functionality available only to the administrator...
        CanManageLibrary = <%= AdministrationView %>;
        //............................................................................................................

        Ext.QuickTips.init();

        var container = mainViewport.findById('center_panel_center');
        var toFixed = function(n, d) {
            if (typeof d !== "number")
                d = 2;

            var m = Math.pow(10, d);
            var v = Math.floor(parseFloat(n) * m) / m;
            return v;
        };
        sizeRenderer = function(value, meta, record, rowIndex, columnIndex, store) {
            if (value / (1024*1024) > 0.5) return toFixed(value / (1024*1024), 1) + " MB";
            if (value / (1024) > 0.05) return toFixed(value / (1024), 1) + " KB";
            return value + " B";
        };
        var expiresRenderer = function(value, meta, record, rowIndex, columnIndex, store) {
            if (record.data['expires'] !== true) return LibraryResources.Never; //'Never';            
            if (value) return Ext.util.Format.date(value, ConvertToPhpDateTimeFormat(getContextByKey('userDateFmtStr'))); //Ext.util.Format.date(value, 'Y-m-d');
        };
        var makeRenderer = function(tpl) {
            var t;
            var reported = false;
            try
            {
                t = new Ext.XTemplate(arguments.length > 1 ? Array.prototype.join.call(arguments, '') : tpl.isArray(tpl) ? tpl.join('') : tpl);
                t.compile();
            }
            catch (e)
            {
                Ext.Msg.alert("Error Compiling Template", e.message || e.description);
            }
            return function(value, meta, record, rowIndex, columnIndex, store) {
                var o = {value: value, row: record};
                try
                {
                    /* we need to catch any errors here as they will not be presented in a friendly manner otherwise */
                    /* which makes it very difficult to track them down */
                    return t.apply(o);
                }
                catch (e)
                {
                    if (!reported)
                        Ext.Msg.alert("Error Applying Template", e.message || e.description);
                    reported = true;
                    return value;
                }
            };
        };

        var library = new Ext.Panel({
            layout: 'border',
            border: false,            
            items: [{
                id: 'library-tree',
                xtype: 'treepanel',
                region: 'west',                
                split: true,            
                width: 150,
                collapsible: false,
                autoScroll: true,
                collapseMode: "mini", 
                border: false,
                tbar: new Ext.Toolbar({
                    items: [{
                        xtype: 'tbfill'
                    }, {
                        id: "btnAddFolder",
                        icon: "images/icons/Folder_add.png",
                        text: false,
                        cls: "x-btn-text-icon x-btn-icon-only",
                        tooltip: LibraryResources.AddFolder,
                        handler: Sage.LibraryFolderManager.handleAddFolder,
                        hidden: !CanManageLibrary,
                        hideMode: 'visibility'
                    }, {
                        id: "btnEditFolder",
                        icon: "images/icons/Folder_edit.png",
                        text: false,
                        cls: "x-btn-text-icon x-btn-icon-only",
                        tooltip: LibraryResources.EditFolder,
                        handler: Sage.LibraryFolderManager.handleEditFolderName,
                        disabled: true,
                        hidden: !CanManageLibrary,
                        hideMode: 'visibility'
                    }, {
                        id: "btnDeleteFolder",
                        icon: "images/icons/Folder_delete.png",
                        text: false,
                        cls: "x-btn-text-icon x-btn-icon-only",
                        tooltip: LibraryResources.DeleteFolder,
                        handler: Sage.LibraryFolderManager.handleDeleteFolderClicked,
                        disabled: true,
                        hidden: !CanManageLibrary,
                        hideMode: 'visibility'
                    }]
                }),
                root: new Ext.tree.AsyncTreeNode({
                    id: 'root',
                    text: LibraryResources.Library,
                    expanded: true,
                    listeners: {
                        // this was added to create an id for the automated testing tool
                        load: function(node) {
                            var nodeEl = node.getUI().getAnchor();
                            if (nodeEl != undefined && $(nodeEl).attr("id") != undefined) {
                                $(nodeEl).attr("id", ("node_" + node.id));
                            }
                        }
                    }                    
                }),
                loader: new Ext.tree.TreeLoader({
                    url: 'slxdata.ashx/slx/crm/-/library/directories',
                    requestMethod: 'GET',
                    listeners: {
                        // this was added to create an id for the automated testing tool
                        load: function(loader, node, response) {
                            for (var i = 0; i < node.childNodes.length; i++) {
                                var child = node.childNodes[i];
                                var el = child.getUI().getAnchor();
                                if (el != undefined) {
                                    $(el).attr("id", ("node_" + child.id));
                                }
                            }

                        }
                    }                    
                }),
                listeners: {
                    click: function(node, e) {
                        var l = Ext.getCmp('library-list');
                        // ext 2 mode:
                        l.store.proxy.conn.original = l.store.proxy.conn.original || l.store.proxy.conn.url;
                        // ext 3 mode:
                        //l.store.proxy.conn.original = l.store.proxy.conn.original || l.store.proxy.url;
                        l.store.proxy.conn.url = [l.store.proxy.conn.original,'?',Ext.urlEncode({node: node.id})].join('');
                        l.store.load();
                        if (CanManageLibrary)
                            Sage.LibraryFolderManager.handleFolderClicked(node, e);
                    },
                    render: function() {
                        this.selectPath.defer(10, this, ['root', 'id']);

                        var l = Ext.getCmp('library-list');
                        
                        // ext 2 mode:
                        l.store.proxy.conn.original = l.store.proxy.conn.original || l.store.proxy.conn.url;
                        // ext 3 mode:
                        //l.store.proxy.conn.original = l.store.proxy.conn.original || l.store.proxy.url;
                        l.store.proxy.conn.url = [l.store.proxy.conn.original,'?',Ext.urlEncode({node: 'root'})].join('');
                        l.store.load();
                    }
                }
            },{
                id: 'library-list',
                xtype: 'grid',
                region: 'center',   
                layout: 'fit',             
                border: false,
                autoExpandColumn: 'description',
                sm : new Ext.grid.RowSelectionModel({singleSelect : true}),
                tbar: new Ext.Toolbar({
                    items: [{
                        xtype: 'tbfill'
                    }, {
                        id: "btnAddFiles",
                        icon: "~/ImageResource.axd?scope=global&type=Global_Images&key=plus_16x16",
                        text: false,
                        cls: "x-btn-text-icon x-btn-icon-only",
                        tooltip: LibraryResources.AddFiles,
                        handler: Sage.LibraryFileManager.handleAddButtonClicked,
                        hidden: !CanManageLibrary
                    }, {
                        id: "btnEditFile",
                        icon: "~/ImageResource.axd?scope=global&type=Global_Images&key=Edit_Item_16x16",
                        text: false,
                        cls: "x-btn-text-icon x-btn-icon-only",
                        tooltip: LibraryResources.FileProperties,
                        handler: Sage.LibraryFileManager.editLibraryFileProps,
                        hidden: !CanManageLibrary
                    }, {
                        id: "btnDeleteFile",
                        icon: "~/ImageResource.axd?scope=global&type=Global_Images&key=Delete_16x16",
                        text: false,
                        cls: "x-btn-text-icon x-btn-icon-only",
                        tooltip: LibraryResources.DeleteSelectedFile,
                        handler: Sage.LibraryFileManager.handleDeleteButtonClicked,
                        hidden: !CanManageLibrary
                    }, {
                        id: "btnHelp",
                        icon: "~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16",
                        text: false,
                        cls: "x-btn-text-icon x-btn-icon-only",
                        tooltip: LibraryResources.Help,
                        handler: function() {window.open(Link.getHelpUrl('library'), Link.getHelpUrlTarget()); }
                    }]}),
                viewConfig: {
                    forceFit: false
                },
                columns: [{
                    dataIndex: 'fileName', 
                    header: LibraryResources.File,
                    width: 200,
                    sortable: true,
                    renderer: makeRenderer(
                        '<a href="SmartParts/Attachment/ViewAttachment.aspx?FileId={values.row.id}&amp;Filename={[encodeURIComponent(values.row.data.fileName)]}&amp;DataType=FS" target="FileWin">',
                        '{value}',
                        '</a>'
                    )
                },{
                    dataIndex: 'fileSize', 
                    header: LibraryResources.Size, 
                    width: 100, 
                    sortable: true, 
                    renderer: sizeRenderer
                },{
                    dataIndex: 'createDate',
                    header: LibraryResources.Created,
                    width: 100,
                    sortable: true,
                    renderer: Ext.util.Format.dateRenderer(ConvertToPhpDateTimeFormat(getContextByKey('userDateFmtStr'))) //Ext.util.Format.dateRenderer('Y-m-d')
                },{
                    dataIndex: 'revisionDate',
                    header: LibraryResources.Revised,
                    width: 100,
                    sortable: true,
                    renderer: Ext.util.Format.dateRenderer(ConvertToPhpDateTimeFormat(getContextByKey('userDateFmtStr'))) //Ext.util.Format.dateRenderer('Y-m-d')
                },{
                    dataIndex: 'expireDate', 
                    header: LibraryResources.Expires, 
                    width: 100, 
                    sortable: true, 
                    renderer: expiresRenderer
                },{
                    id: 'description',
                    dataIndex: 'description',
                    width: 200,
                    sortable: true,
                    header: LibraryResources.Description
                }],
                store: new Ext.data.JsonStore({
                    autoLoad: false,
                    url: 'slxdata.ashx/slx/crm/-/library/documents',
                    root: 'items',
                    id: 'id',
                    totalProperty: 'count',
                    fields: ['id', 'fileName', 'fileSize', 'found', 'expires', 'expireDate', 'createDate', 'revisionDate', 'description'],
                    listeners: {
                        // this was added to create an id for the automated testing tool
                        load: function(store, records, index) {
                            for (var i = 0; i < records.length; i++) {
                                var row = Ext.getCmp('library-list').getView().getRow(i);
                                if (row != undefined)
                                    row.id = 'row_' + records[i].id;
                            }
                        }
                    }
                })                             
            }]
        });

        $(container.getEl().dom).find(".x-panel-body").children().hide();        
        
        container.add(library);
        container.doLayout();
        if (Sage.DragDropWatcher) {
            Sage.DragDropWatcher.removeListener("slxDefaultFileAction");      
            if (CanManageLibrary)
                Sage.DragDropWatcher.addListener(Sage.DragDropWatcher.FILESDROPPED, Sage.LibraryFileManager.handleFilesDropped, "libraryFileHandling");   
            else 
                Sage.DragDropWatcher.addListener(Sage.DragDropWatcher.FILESDROPPED, Sage.LibraryFileManager.handleFilesDroppedWithNoAccess, "libraryFileHandling");
        }
        
    });  
    
    Sage.LibraryFileManager = {
        handleAddButtonClicked : function(event) {
            if (window.Sage && Sage.gears) {
                var desktop = Sage.gears.factory.create('beta.desktop');
                desktop.openFiles(Sage.LibraryFileManager.browseFilesCallback);
            } else {
                if (Sage.DragDropWatcher && Sage.DragDropWatcher.defaultNoGearsHandler) {
                    Sage.DragDropWatcher.defaultNoGearsHandler();
                }
            }
            var dirid = Sage.LibraryFileManager.findDirectoryId();
        },
        browseFilesCallback : function(files) {
            if (files.length > 0) {
                var url = 'SLXAttachments.ashx?type=library&dirid=' + Sage.LibraryFileManager.findDirectoryId();
                Sage.LibraryFileManager.uploadFiles(files, url);
            }
        },
        handleFilesDroppedWithNoAccess : function(args) {
            Ext.Msg.alert(LibraryResources.NoAccessTitle, LibraryResources.NoAccessMessage);
        },
        handleFilesDropped : function(args) {
            var target = null;
            if (Sage.DragDropWatcher.isIE) {
                target = args.event.srcElement;
            } else if (Sage.DragDropWatcher.isFirefox) {
                target = args.event.target;
            }
            var url = 'SLXAttachments.ashx?type=library&dirid=' + Sage.LibraryFileManager.findDirectoryId(target);
            Sage.LibraryFileManager.uploadFiles(args.files, url);
        },
        uploadFiles : function(files, url) {
            Ext.MessageBox.show({
                title : LibraryResources.PleaseWait,
                msg: LibraryResources.UploadingFiles,
                progressText: LibraryResources.Uploading,
                width: 300,
                progress: true,
                closable: true
            }); 
            Sage.FileUploader.uploadFiles(files, url, Sage.LibraryFileManager.onUploadProgress, Sage.LibraryFileManager.uploadComplete);
        },
        findDirectoryId : function(dropTarget) {
            if (!dropTarget) {
                return Sage.LibraryFolderManager.getOpenFolderId();   
            }
            var dropTreeNode = null;
            if ($(dropTarget).hasClass('x-tree-node-el')) {
                dropTreeNode = dropTarget;
            } else {
                var parents = $(dropTarget).parents();
                for (var i = 0; i < parents.length; i++) {
                    if ($(parents[i]).hasClass('x-tree-node-el')) {
                        dropTreeNode = parents[i];
                        break;
                    }
                }
            }
            if (dropTreeNode == null) {
                return Sage.LibraryFolderManager.getOpenFolderId();
            } else {
                return $(dropTreeNode).attr('ext:tree-node-id');
            }
        },
        uploadProgress : function(args) {
            if ((args.lengthComputable == true)&&(args.total > 0)) {
                var pct = (args.loaded / args.total) * 100;
                Ext.MessageBox.updateProgress(pct, String.format(LibraryResources.PctCompleteFmt, Math.round(pct)));
            }
        },
        uploadComplete : function(args) {
            Ext.MessageBox.hide();
            Ext.MessageBox.alert(LibraryResources.Complete, LibraryResources.FileUploadComplete);
            Sage.LibraryFileManager.refreshGrid();
        },
        refreshGrid : function() {
            var libGrid = Ext.getCmp('library-list'),
            nodeid = Sage.LibraryFolderManager.getOpenFolderId();
            if (libGrid) {
                // ext 2 mode:
                libGrid.store.proxy.conn.original = libGrid.store.proxy.conn.original || libGrid.store.proxy.conn.url;
                // ext 3 mode:
                //libGrid.store.proxy.conn.original = libGrid.store.proxy.conn.original || libGrid.store.proxy.url;
                libGrid.store.proxy.conn.url = [libGrid.store.proxy.conn.original,'?',Ext.urlEncode({node: nodeid})].join('');
                libGrid.store.load();
            }
        },
        editLibraryFileProps : function() {
            var libGrid = Ext.getCmp("library-list");
            if (libGrid) {
                var selrow = libGrid.selModel.getSelected();
                if (selrow) {
                    Sage.LibraryFileManager.showPropertiesDialog(selrow.id);   
                }
            }             
        },
        showPropertiesDialog : function(docId) {
            if (docId) {
                var form =  new Ext.FormPanel({
                    id: 'libraryDocPropsForm',
                    frame: true,
                    labelAlign: 'left',
                    labelWidth: 105,
                    autoScroll : false,
                    border : false,
                    items : [{
                        layout:'column',
                        items: [{
                            columnWidth: .5,
                            layout: 'form',
                            items: [{
                                xtype : 'hidden',
                                id: 'hidID',
                                name: 'Id'
                            }, {
                                xtype : 'textfield',
                                id: 'txtFilename',
                                fieldLabel : LibraryResources.FileName,
                                name: 'FileName',
                                anchor:'95%'
                            }, {
                                xtype : 'textfield',
                                id: 'txtDirectory',
                                fieldLabel : LibraryResources.Directory,
                                name: 'Directory',
                                readOnly : true,
                                style : { color : '#999999' },
                                anchor:'95%'
                            }, {
                                xtype : 'textfield',
                                id: 'txtStatus',
                                fieldLabel : LibraryResources.Status,
                                name : 'Status',
                                readOnly : true,
                                style : { color : '#999999' },
                                anchor:'95%'
                            }, {
                                xtype : 'textfield',
                                id: 'txtSize',
                                fieldLabel: LibraryResources.Size,
                                name: 'FileSize',
                                anchor: '95%',
                                readOnly: true,
                                style : { color : '#999999' },
                                listeners : {
                                    change : function(field, val) {
                                        //alert(sizeRenderer(val)); 
                                    }
                                }
                            }]
                        }, {
                            columnWidth: .5,
                            layout: 'form',
                            items: [{
                                xtype : 'datefield',
                                id: 'dtCreated',
                                fieldLabel : LibraryResources.Created,
                                name: 'CreateDate',
                                readOnly : true,
                                disabled : true,
                                style : { color : '#999999' },
                                anchor:'100%'
                            }, {
                                xtype : 'datefield',
                                id: 'dtRevised',
                                fieldLabel : LibraryResources.Revised,
                                name: 'RevisionDate',
                                anchor:'100%'
                            }, {
                                xtype : 'datefield',
                                id: 'dtExpireDate',
                                fieldLabel : LibraryResources.Expires,
                                name: 'ExpireDate',
                                anchor:'100%',
                                disabledClass : 'x-item-disabled'
                            }, {
                                xtype : 'checkbox',
                                id: 'chkExpire',
                                boxLabel : LibraryResources.DoNotExpire,
                                name: 'DoNotExpire',
                                labelSeparator : '',
                                anchor:'95%',
                                listeners: { check: function(chbox, checked) {
                                        if (checked) {
                                            Ext.getCmp('dtExpireDate').disable();
                                        } else {
                                            Ext.getCmp('dtExpireDate').enable();
                                        }
                                    }
                                }
                            }]
                        }]
                    }, {
                        layout: 'form',
                        labelAlign: 'top',
                        items: [{
                            xtype: 'textarea',
                            fieldLabel: LibraryResources.Description,
                            id: 'txtDescription',
                            name: 'Description',
                            //width: 506,
                            anchor:'100%'
                        }, {
                            xtype: 'textarea',
                            fieldLabel: LibraryResources.Abstract,
                            id: 'txtAbstract',
                            name: 'Abstract',
                            anchor:'100%'
                        }, {
                            xtype: 'checkbox',
                            boxLabel: LibraryResources.ForceDistribution,
                            id: 'chkForceDist',
                            name: 'ForceDistribution',
                            hideLabel : true
                        }]
                    }]
                });
                var win = new Ext.Window({
                    id : 'libraryDocPropsWin',
                    title : LibraryResources.DocumentProperties,
                    width : 600,
                    height : 400,
                    minWidth : 600,
                    minHeight : 400,
                    layout : 'fit',
                    closeAction: 'close',
                    resizable : true,
                    plain : true,
                    modal : true,
                    items : form,
                    tools: [{
                        id: 'help',
                        handler: function() { window.open(Link.getHelpUrl('libraryfileproperties'), Link.getHelpUrlTarget()); }
                    }],
                    buttons : [{
                        text: LibraryResources.OK,
                        handler: function() {
                            var frm = Ext.getCmp('libraryDocPropsForm').getForm();
                            var id = Ext.getCmp('hidID').getValue();
                            frm.submit({
                                //url: 'slxdata.ashx/slx/crm/-/library/document/' + id,
                                url: 'SLXAttachments.ashx?type=librarydoc&docid=' + id, 
                                waitMsg: LibraryResources.Submitting,
                                method: 'POST',
                                success: function(form, action) {
                                    //Ext.Msg.alert('Success', action.result.msg);
                                    Ext.getCmp('library-list').store.load();
                                    win.close();
                                }
                            });
                        }
                    }, {
                        text: LibraryResources.Cancel,
                        handler: function() {
                            win.close();
                        }
                    }]
                });
                win.show();
                form.load({
                    //url: 'slxdata.ashx/slx/crm/-/library/document/' + docId, 
                    url: 'SLXAttachments.ashx?type=librarydoc&docid=' + docId, 
                    waitMsg: LibraryResources.Loading,
                    method:'GET',
                    failure: function(fm, actn) {
                        //alert(actn.response);
                        //debugger;
                    }
                });
            }
        },
        handleDeleteButtonClicked : function(button, event) {
            var libGrid = Ext.getCmp("library-list");
            if (libGrid) {
                var selrow = libGrid.selModel.getSelected();
                if (selrow) {
                    var msg = String.format(LibraryResources.DeleteFileCnfmFmt, selrow.data.fileName);
                    Ext.Msg.show({
                        title: LibraryResources.Confirm,
                        msg: msg,
                        buttons: {yes : LibraryResources.Yes, no : LibraryResources.No },
                        fn: Sage.LibraryFileManager.handleDeleteConfirmed,
                        icon: Ext.MessageBox.QUESTION
                    });
                } else {
                    Ext.MessageBox.alert(LibraryResources.Delete, LibraryResources.PleaseSelectFile);
                }
            } 
        },
        handleDeleteConfirmed : function(btn) {
            if (btn == 'yes') {
                var libGrid = Ext.getCmp("library-list");
                if (libGrid) {
                    var selrow = libGrid.selModel.getSelected();
                    if (selrow) {
                        $.ajax({
                            url: String.format('SLXAttachments.ashx?type=deleteLibraryFile&docid={0}', selrow.id),
                            type: 'GET',
                            dataType: 'json',
                            success: function(data) {
                                if (data && typeof(data.success) !== 'undefined') {
                                    if (data.success == true) {
                                        Sage.LibraryFileManager.refreshGrid();
                                    } else {
                                        var msgService = Sage.Services.getService("WebClientMessageService");       
                                        if (msgService) { msgService.showClientMessage((typeof (data.error) !== 'undefined') ? data.error : LibraryResources.DefaultDeleteFileErrorMsg); }
                                    }
                                }
                            }
                        });  
                    }
                }
            }
        }
    }
    
    Sage.LibraryFolderManager = {
        getOpenFolderId : function() {
            var libTree = Ext.getCmp('library-tree');
            return libTree.selModel.selNode.id;
        },
        getOpenFolderName : function() {
            var libTree = Ext.getCmp('library-tree');
            return libTree.selModel.selNode.text;
        },
        handleDeleteFolderClicked : function(button, event) {
            if (Sage.LibraryFolderManager.getOpenFolderId() == "root") {
                Ext.MessageBox.alert(LibraryResources.DeleteFolder, LibraryResources.DontDeleteRoot);
                return;
            }
            var dirName = Sage.LibraryFolderManager.getOpenFolderName();
            if (dirName != '') {
                //var msg = String.format("Are you sure you want to delete the folder {0}?<br/>This will delete all files in this folder and all folders beneath it.", dirName);
                var msg = String.format(LibraryResources.DeleteFolderCnfmFmt, dirName);
                Ext.Msg.show({
                    title: LibraryResources.Confirm,
                    msg: msg,
                    buttons: { yes: LibraryResources.Yes, no : LibraryResources.No },
                    fn: Sage.LibraryFolderManager.handleDeletefolderConfirmed,
                    icon: Ext.MessageBox.QUESTION
                });
            } else {
                Ext.MessageBox.alert(LibraryResources.DeleteFolder, LibraryResources.PleaseSelectFolder);
            }
        },
        handleDeletefolderConfirmed : function(btn) {
            if ((btn == 'ok') || (btn == 'yes')) {
                var dirId = Sage.LibraryFolderManager.getOpenFolderId();
                $.ajax({
                    url: String.format('SLXAttachments.ashx?type=deletelibraryfolder&dirid={0}', dirId),
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        if (data && typeof(data.success) !== 'undefined') {
                            if (data.success == true) {
                                //Ext.MessageBox.alert("Folder Deleted", data.data.message);
                                var tree = Ext.getCmp('library-tree');
                                var parent = tree.selModel.selNode.parentNode;
                                var loader = tree.getLoader();
                                loader.load(parent, function(request, loadedNode) { 
                                	loadedNode.select(); 
                                	if (!loadedNode.isExpanded()) { 
                                		loadedNode.expand();
                                		if (loadedNode.childNodes.length == 0) {
                                		    //for whatever reason, when the node re-draws itself when there aren't any children, 
                                		    // it draws as a leaf - even though if you ask it if it is a leaf, it says it isn't.
                                		    //So, I'll manually change the style to a closed folder - which is what matches the other folders.
                                		    var uielem = loadedNode.getUI();
                                		    uielem.removeClass('x-tree-node-leaf');
                                		    uielem.addClass('x-tree-node-collapsed');
                                		}
                                	} 
                                	loadedNode.fireEvent('click', loadedNode);
                                });
                            } else {
                                Ext.MessageBox.show({
                                    icon: Ext.MessageBox.ERROR,
                                    msg: data.error,
                                    title: LibraryResources.FolderNotDeleted,
                                    buttons: { ok: LibraryResources.OK }
                                });
                            }
                        }                        
                    }
                });
            }
        },
        handleAddFolder : function(button, event) {
            Ext.Msg.show({
                title: LibraryResources.NewFolder,
                msg: LibraryResources.EnterFolderName,
                buttons: { ok: LibraryResources.OK, cancel : LibraryResources.Cancel },
                fn: Sage.LibraryFolderManager.handleAddFolderCallback,
                prompt: true
            });
        },
        handleAddFolderCallback : function(btn, text) {
            if (btn == 'ok') {
                var dirid = Sage.LibraryFolderManager.getOpenFolderId();
                $.ajax({
                    url: String.format('SLXAttachments.ashx?type=newlibraryfolder&dirid={0}&dirname={1}', dirid, encodeURIComponent(text)),
                    type: 'GET',
                    cache:false,
                    dataType: 'json',
                    success: function(data) {
                        if (data && typeof(data.success) !== 'undefined') {
                            if (data.success == true) {
                                var tree = Ext.getCmp('library-tree');
                                var node = tree.getNodeById(dirid);
                                var loader = tree.getLoader();
                                loader.load(node, function(request, loadedNode) { loadedNode.expand(); });
                            } else {
                                var msgService = Sage.Services.getService("WebClientMessageService");       
                                if (msgService) { msgService.showClientMessage((typeof (data.error) !== 'undefined') ? data.error : "An unknown error happened trying to create the new folder."); }
                            }
                        }
                    },
                    error : function(request, status, error) {
                        var msgService = Sage.Services.getService("WebClientMessageService");       
                        if (msgService) { msgService.showClientMessage(error); }
                    }
                });
            }
        },
        handleEditFolderName : function(button, event) {
            if (Sage.LibraryFolderManager.getOpenFolderId() == "root") {
                Ext.MessageBox.alert(LibraryResources.EditFolder, LibraryResources.DontEditRoot);
                return;
            }
            var dirName = Sage.LibraryFolderManager.getOpenFolderName();
            Ext.Msg.show({
                title: LibraryResources.NewFolder,
                msg: LibraryResources.EnterNewFolderName,
                buttons: { ok: LibraryResources.OK, cancel : LibraryResources.Cancel },
                fn: Sage.LibraryFolderManager.handleEditFolderNameCallback,
                prompt: true,
                value: dirName
            });
        },
        handleEditFolderNameCallback : function(btn, text) {
            if (btn == 'ok') {
                var dirid = Sage.LibraryFolderManager.getOpenFolderId();
                $.ajax({
                    url: String.format('SLXAttachments.ashx?type=changelibfoldername&dirid={0}&dirname={1}', dirid, encodeURIComponent(text)),
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        if (data && typeof(data.success) !== 'undefined') {
                            if (data.success == true) {
                                var tree = Ext.getCmp('library-tree');
                                var node = tree.getNodeById(dirid);
                                var loader = tree.getLoader();
                                loader.load(node.parentNode, function(request, loadedNode) { loadedNode.expand(); });
                            } else {
                                var msgService = Sage.Services.getService("WebClientMessageService");       
                                if (msgService) { msgService.showClientMessage((typeof (data.error) !== 'undefined') ? data.error : "An unknown error happened trying to change the folder name."); }
                            }
                        }
                    },
                    error : function(request, status, error) {
                        var msgService = Sage.Services.getService("WebClientMessageService");       
                        if (msgService) { msgService.showClientMessage(error); }
                    }
                });
            }        
        },
        handleFolderClicked: function(node, e) {
            var nodeid = (typeof node == 'undefined') ? Sage.LibraryFolderManager.getOpenFolderId() : node.id;
            var delBtn = Ext.getCmp("btnDeleteFolder");
            var editBtn = Ext.getCmp("btnEditFolder");
            if ((delBtn != null) && (editBtn != null)) {
                if (nodeid == 'root') {
                    delBtn.disable();
                    editBtn.disable();
                } else {
                    delBtn.enable();
                    editBtn.enable();
                }
            }
        }
    }
</script>

