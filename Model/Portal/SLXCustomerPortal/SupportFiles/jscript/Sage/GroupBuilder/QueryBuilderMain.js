/*globals
dojo,
Sage,
queryBuilderMainResources,
SLXDataGrid,
joinInfo,
ShowAddCondition,
joinObjForEdit,
conditionInfo,
layoutInfo,
sortInfo,
sortInfo_asXML,
getXMLDoc,
getNodeText,
getNodeXML,
dijit,
dojox
*/

window.QueryBuilderMain = (function () {

    var queryBuilderMainResources = window.queryBuilderMainResources,
        QueryBuilderMain = {
            currentTab : 0, // c
            tabProperties : 0, // c
            tabConditions : 1, // c
            tabLayout : 2, //c
            tabSorting : 3, //c
            tabDefaults : 4, //c
            accessmode : "readwrite", //c
            gmgr : null, // this is set in init() it is a 'pointer' to the Group Manager object on mainpage; // c
            // TODO: Search in Visual Studio for these
            //dragField : null,
            //dropField : null,
            //dragSwapFields : [],
            
            currentLayoutIndex : null, //c
            
            //resource strings
            newQuery : queryBuilderMainResources.newQuery, //c
            createLocalJoinMessage : queryBuilderMainResources.createLocalJoinMessage,//c
            addDataToLayoutGridMessage : queryBuilderMainResources.addDataToLayoutGridMessage,//c
            jsAscending : queryBuilderMainResources.jsAscending, //c
            jsDescending : queryBuilderMainResources.jsDescending, //c
            QBMsg_ErrorMissingLayoutObject : queryBuilderMainResources.QBMsg_ErrorMissingLayoutObject,//c
            QBMsg_MustName : queryBuilderMainResources.QBMsg_MustName, //c
            QBMsg_NameCannotContain : Sage.Utility.htmlDecode(queryBuilderMainResources.QBMsg_NameCannotContain), //c
            QBMsg_DisplayNameCannotContain : Sage.Utility.htmlDecode(queryBuilderMainResources.QBMsg_DisplayNameCannotContain),//c
            QBMsg_NameEnteredAlreadyInUse : queryBuilderMainResources.QBMsg_NameEnteredAlreadyInUse,//c
            QB_EntityName : queryBuilderMainResources.QB_EntityName,//c
            QB_ParensDontBalance : queryBuilderMainResources.parensDontBalance,//c
            copyOfString : queryBuilderMainResources.CopyOf,//c
            localizeViewSQLText : queryBuilderMainResources.localizeViewSQLText,
            currentCondition: null, //c
            currentLayoutElem: null, //c
            dgConditions : new SLXDataGrid("grdConditions"), //c
            dgSorts : new SLXDataGrid("grdSorts"),//c
            areaManager: null,
            fieldsHidden : false,
            joinURL : null,
            datapath : null,
            joinXML : null,
            GetItemDataType: function(item) {
                dojo.require("Sage.Utility.Filters");
                return Sage.Utility.Filters.resolveDataTypeQB(item.dataTypeId);
            },
            InsertCondition: function (displayPath, dataPath, item) {
                QueryBuilderMain.currentCondition = new conditionInfo();
                QueryBuilderMain.currentCondition = dojo.mixin(QueryBuilderMain.currentCondition, {
                    alias: item.columnName,
                    displayname: item.columnName,
                    fieldtypename: QueryBuilderMain.GetItemDataType(item),
                    displaypath: displayPath,
                    datapath: dataPath + item.columnName,
                    connector: 'END',
                    isliteral: 'false',
                    isnegated: 'false',
                    casesens: 'true',
                    IsNew: true //flag a new condition
                });

                ShowAddCondition();
            },
            InsertLayoutItem: function (displayPath, dataPath, item) {
                var newlayout = new layoutInfo();
                newlayout = dojo.mixin(newlayout, {
                    alias: item.columnName,
                    displayname: item.columnName,
                    fieldtypename: QueryBuilderMain.GetItemDataType(item),
                    displaypath: displayPath,
                    datapath: dataPath + item.columnName,
                    caption: item.displayName || item.columnName,
                    width: '120',
                    align: 'Left',
                    captalign: 'Left',
                    format: 'None',
                    formatstring: '',
                    visible: true,
                    isHidden: false,
                    cssclass: ''
                });
                QueryBuilderMain.addDataToLayoutGrid(newlayout, "true");
            },
            InsertSort: function (displayPath, dataPath, item) {
                QueryBuilderMain.addDataToSortGrid({
                    alias: item.columnName,
                    displayname: item.columnName,
                    displaypath: displayPath,
                    datapath: dataPath + item.columnName
                });
            },
            tabClick: function (idx) {
                var tabview = dijit.byId("tabview"),
                    page = dijit.byId("tabpage" + idx);
                
                if (tabview && page) {
                    tabview.selectChild(page);
                }
                
                QueryBuilderMain.currentTab = idx;
                QueryBuilderMain.setButtonState(idx);
            },
            toggleMoveBtnCaptions : function (vMode) { //c
                switch (vMode) {
                    case 0 :
                        // hidden
                        document.getElementById("btnMoveUp").style.display = 'none';
                        document.getElementById("btnMoveDn").style.display = 'none';
                        break;
                    case 1 :
                        // display Move Up and Move Down
                        document.getElementById("btnMoveUp").value = queryBuilderMainResources.MoveUp;
                        document.getElementById("btnMoveDn").value = queryBuilderMainResources.MoveDown;
                        document.getElementById("btnMoveUp").style.display = 'inline';
                        document.getElementById("btnMoveDn").style.display = 'inline';
                        break;
                    case 2 :
                        // display Move left and Move right
                        document.getElementById("btnMoveUp").value = queryBuilderMainResources.MoveLeft;
                        document.getElementById("btnMoveDn").value = queryBuilderMainResources.MoveRight;
                        document.getElementById("btnMoveUp").style.display = 'inline';
                        document.getElementById("btnMoveDn").style.display = 'inline';
                        break;
                }
            },
            toggleEditDeleteButtons : function (bEd, bDel) {
                // true  = button is enabled
                // false = button is disabled
                bEd = ((QueryBuilderMain.accessmode !== "readonly") && (bEd)); // if the group is readonly, make sure these buttons stay disabled...
                bDel = ((QueryBuilderMain.accessmode !== "readonly") && (bDel));
                document.getElementById("btnEdit").disabled = !(bEd);
                document.getElementById("btnDel").disabled = !(bDel);
            },
            setButtonState : function (tabIdx) {
                switch(tabIdx) {
                    case QueryBuilderMain.tabProperties :
                        QueryBuilderMain.toggleEditDeleteButtons(false, false);
                        QueryBuilderMain.toggleMoveBtnCaptions(0);
                        if (document.getElementById("txtGrpName").disabled === false) {
                            document.getElementById("txtGrpName").focus();
                        }
                        break;
                    case QueryBuilderMain.tabConditions :
                        QueryBuilderMain.toggleEditDeleteButtons(true, true);
                        QueryBuilderMain.toggleMoveBtnCaptions(1);
                        break;
                    case QueryBuilderMain.tabLayout :
                        QueryBuilderMain.toggleEditDeleteButtons(true, true);
                        QueryBuilderMain.toggleMoveBtnCaptions(2);
                        break;
                    case QueryBuilderMain.tabSorting :
                        QueryBuilderMain.toggleEditDeleteButtons(false, true);
                        QueryBuilderMain.toggleMoveBtnCaptions(1);
                        break;
                    case QueryBuilderMain.tabDefaults :
                        QueryBuilderMain.toggleEditDeleteButtons(false, false);
                        QueryBuilderMain.toggleMoveBtnCaptions(0);
                        if (document.getElementById("chkUseDistinct").disabled === false) {
                            document.getElementById("chkUseDistinct").focus();
                        }
                        break;
                }
            },
            hideTab : function (idx) {
                var tab = dijit.byId('tabpage' + idx),
                    view = dijit.byId('tabview');
                
                if (view && tab) {
                    view.removeChild(tab);
                }
            },
            isValidGroupName : function () {
                var res = true,
                    msg = "",
                    re = /[\/\\:\*\?"<\>|\.'\r\n]/,
                    displayNameRe = /[<\>"]/,
                    tempname = document.getElementById(queryBuilderMainResources.family).value + ":" + document.getElementById("txtGrpName").value,
                    currentgroupid = document.getElementById(queryBuilderMainResources.groupID).value,
                    tempgroupid = QueryBuilderMain.gmgr.GetGroupId(tempname);
                
                // is the group name blank?
                if (document.getElementById("txtGrpName").value === '') {
                    msg = QueryBuilderMain.QBMsg_MustName;
                } else if (document.getElementById("txtGrpName").value.search(re) > -1) {
                    // does the group name contain illegal characters?
                    msg = QueryBuilderMain.QBMsg_NameCannotContain;
                } else if (document.getElementById("txtDisplayName").value.search(displayNameRe) > -1) {
                    // does the group name contain illegal characters?
                    msg = QueryBuilderMain.QBMsg_DisplayNameCannotContain;
                } else if (((document.getElementById(queryBuilderMainResources.loadMode).value === 'newGroup') || (document.getElementById(queryBuilderMainResources.loadMode).value === 'copyGroup')) && (tempgroupid !== '')) {
                    // is this a duplicate name for a new group?
                    msg = QueryBuilderMain.QBMsg_NameEnteredAlreadyInUse;
                } else if ((document.getElementById(queryBuilderMainResources.loadMode).value === 'editGroup') && (tempgroupid !== currentgroupid) && (tempgroupid !== '')) {
                    // is this a duplicate name for a new group?
                    msg = QueryBuilderMain.QBMsg_NameEnteredAlreadyInUse;
                }
                if (msg !== '') {
                    alert(msg);
                    if (document.getElementById("txtGrpName").disabled === false) {
                        QueryBuilderMain.tabClick(0);
                        document.getElementById("txtGrpName").focus();
                    }
                    res = false;
                }
                return res;
            },
            parensBalance : function () {
                var lpcount = 0,
                    rpcount = 0,
                    rows = QueryBuilderMain.dgConditions.gridElement.rows,
                    i,
                    cnd;
                    
                for (i = 1; i < rows.length; i++) {
                    QueryBuilderMain.rebuildConditionObj(rows[i]);
                    cnd = rows[i].conditionObj;
                    lpcount += cnd.leftparens.length;
                    rpcount += cnd.rightparens.length;
                }
                if (lpcount !== rpcount) {
                    alert(QueryBuilderMain.QB_ParensDontBalance);
                }
                return lpcount === rpcount;
            },
            GetGroupSQL : function (GroupID, GroupXML) {
                var vURL,
                    verb,
                    PostData = "dummy",
                    results = '';
               
                if (GroupXML !== "") {
                    PostData = GroupXML;
                }
                
                if (GroupID !== "") {
                    vURL = QueryBuilderMain.gmgr.GMUrl + "GetGroupSQL&gid=" + GroupID;
                    verb = "GET";
                    dojo.xhrGet({
                        url: vURL,
                        sync: true,
                        headers: {'Content-Type': 'application/xml'},
                        load: function (data) {
                            results = data;
                        },
                        error: function (err) {
                            console.error(err);
                        }
                    });
                } else {
                    vURL = QueryBuilderMain.gmgr.GMUrl + "GetGroupSQL";
                    verb = "POST";
                    dojo.xhrPost({
                        url: vURL,
                        postData: PostData,
                        sync: true,
                        headers: {'Content-Type': 'application/xml'},
                        load: function (data) {
                            results = data;
                        },
                        error: function (err) {
                            console.error(err);
                        }
                    });
                }
                
                if (results === "NOTAUTHENTICATED") {
                    if (window.opener) {
                        window.opener.location.reload(true);
                    }

                    window.location.reload(true);
                    return;
                }

                return results;
            },
            SaveGroup : function () {
                var vURL = QueryBuilderMain.gmgr.GMUrl + "SaveGroup",
                    groupId = document.getElementById(queryBuilderMainResources.groupID).value,
                    groupxml = QueryBuilderMain.makeGroupXML(),
                    results = '',
                    manager;

                try {
                    manager = window.opener.Sage.Groups.GroupManager; 
                    manager.ClearLocalStorageForGroup(groupId);
                } catch (err) {
                    console.error(err);
                } 

                dojo.xhrPost({
                    url: vURL,
                    postData: groupxml,
                    sync: true,
                    headers: {'Content-Type': 'application/xml'},
                    load: function (data) {
                        results = data;
                    },
                    error: function (err) {
                        console.error(err);
                    }
                });

                return results;
            },
            encodeXML : function (val) {
                var res = '',
                    i;
                for (i=0; i<val.length; i++) {
                    switch (val.charAt(i)) {
                        case("&") : res += "&amp;"; break;
                        case("<") : res += "&lt;"; break;
                        case(">") : res += "&gt;"; break;
                        case("'") : res += "&apos;"; break;
                        case('"') : res += "&quot;"; break;
                        default   : res += val.charAt(i);
                    }
                }
                return res;
            },
            makeGroupXML : function () {
                var retxml = '<SLXGroup>';
                retxml += '<plugindata id="';
                retxml += document.getElementById(queryBuilderMainResources.groupID).value;
                retxml += '" name="';
                retxml += QueryBuilderMain.encodeXML(document.getElementById("txtGrpName").value);
                retxml += '" displayname="';
                retxml += QueryBuilderMain.encodeXML(document.getElementById("txtDisplayName").value);
                retxml += '" family="';
                retxml += document.getElementById(queryBuilderMainResources.family).value;
                retxml += '" type="';
                retxml += document.getElementById(queryBuilderMainResources.groupType).value;
                retxml += '" system="F" />';
                retxml += '<groupid>';
                retxml += document.getElementById(queryBuilderMainResources.groupID).value;
                retxml += '</groupid>';
                retxml += '<description><![CDATA[';
                retxml += document.getElementById("txtGrpDescription").value;
                retxml += ']]></description>';

                retxml += QueryBuilderMain.conditionsAsXml();
                retxml += QueryBuilderMain.layoutsAsXml();
                retxml += QueryBuilderMain.sortsAsXml();

                if (QueryBuilderMain.joinXML) {
                    retxml += QueryBuilderMain.joinXML;
                }

                retxml += '<parameters />';
                retxml += '<selectsql /><fromsql /><wheresql /><orderbysql /><valuesql />';
                retxml += '<maintable>';
                retxml += document.getElementById(queryBuilderMainResources.mainTable).value;
                retxml += '</maintable><adhocgroup>';
                retxml += document.getElementById("isAdHoc").value;
                retxml += '</adhocgroup><adhocgroupid>';
                retxml += document.getElementById(queryBuilderMainResources.groupID).value;
                retxml += '</adhocgroupid>';

                retxml += QueryBuilderMain.defaultsAsXml();

                retxml += '</SLXGroup>';
                return retxml;
            },
            ok_Click : function () {
                var returnValue,
                    url;
                
                if (document.getElementById(queryBuilderMainResources.sqlonly).value === "T") {
                    returnValue = QueryBuilderMain.GetGroupSQL("", QueryBuilderMain.makeGroupXML());
                } else {
                    if (QueryBuilderMain.isValidGroupName()  && QueryBuilderMain.parensBalance()) {
                        returnValue = QueryBuilderMain.SaveGroup();
                        if (returnValue !== '') {
                            url = QueryBuilderMain.QB_EntityName + ".aspx?modeid=list&gid=" + returnValue;
                            window.opener.location.href = url;
                        }
                        else {
                            window.opener.location.reload(true);
                        }
                        
                        window.close();
                    }
                }
            },
            cancel_Click : function () {
                var vURL = QueryBuilderMain.gmgr.GMUrl + "CancelEdit&gid=" + document.getElementById(queryBuilderMainResources.groupID).value;
                dojo.xhrPost({
                    url: vURL,
                    sync: true,
                    headers: {'Content-Type': 'application/xml'},
                    postData: '',
                    load: function (data) {
                    },
                    error: function (err) {
                        console.error(err);
                    }
                });

                window.close();
            },
            viewSQL_Click : function () {
                Sage.Groups.GroupManager.GetGroupSQLFromXML(QueryBuilderMain.makeGroupXML(),
                    function (data) {
                        require(['dojo/_base/lang',
                            'dijit/registry',
                            'Sage/Link',
                            'Sage/UI/Controls/_DialogHelpIconMixin'
                            ],
                            function (lang, registry, Link, DialogHelpIconMixin) {
                                var dialog = registry.byId('queryDialog');
                                if (dialog) {
                                    dialog.setContent(data);
                                    dialog.show();
                                } else {
                                    Sage.UI.Dialogs.alert(data);
                                    dialog = registry.byId('queryDialog');
                                    dialog.set('title', QueryBuilderMain.localizeViewSQLText);
                                    lang.mixin(dialog, new DialogHelpIconMixin());
                                }
                                try {
                                    dialog.createHelpIconByTopic('viewquerysql');
                                } catch (err) { console.error(err); }
                            });
                        
                    },
                    function (a, b, c) {
                        console.log('Request for group sql failed: %o %o %o', a, b, c);
                    }
                );
            },
            calculations_Click : function () {
                //var vURL = "calcfieldsHost.aspx"
                var vURL = "calcfields.aspx";
                window.open(vURL, "calcFields","dialog=yes,centerscreen=yes,width=750,height=420,status=no,toolbar=no,scrollbars=yes,resizable=yes");
            },
            joins_Click : function () {
                  var vURL = "GlobalJoinManager.aspx";
                  window.open(vURL, "GlobalJoinManager","dialog=yes,centerscreen=yes,width=955,height=450,status=no,toolbar=no,scrollbars=yes,modal=yes,resizable=yes");
            },
            toggleHiddenFields : function () {
                /*if (QueryBuilderMain.fieldsHidden === true) {
                    document.getElementById("hiddenFieldSwitch").innerHTML = queryBuilderMainResources.Hide_Hidden_Fields;
                } else {
                    document.getElementById("hiddenFieldSwitch").innerHTML = queryBuilderMainResources.Show_Hidden_Fields;
                }
                QueryBuilderMain.fieldsHidden = (!QueryBuilderMain.fieldsHidden);*/
            },
            createLocalJoin : function () {
                //declared Globally
                var grid = dijit.byId("fieldGrid"),
                    tree = dijit.byId("divTableTree"),
                    joinObj,
                    item,
                    vURL;
                
                if (tree.selectedItem && grid.selection.selectedIndex >= 0) {
                    joinObj = new joinInfo();
                    item = grid.getItem(grid.selection.selectedIndex);
                    joinObj.joinid = "";
                    joinObj.fromtable = ""; //child
                    joinObj.fromfield = "";
                    joinObj.totable = (tree.selectedNode.item.root) ? tree.selectedNode.item.id : tree.selectedItem.toTable;  //parent
                    joinObj.tofield = item.columnName;
                    joinObj.totablepath = tree.selectedDataPath() + item.columnName;
                    joinObj.secondary = "";
                    joinObj.cascadetype = "X";
                    joinObj.usebydefault = "N";
                    joinObj.jointype = "=";
                    joinObj.islocaljoin = "T";
                    vURL = 'JoinEditor.aspx';
                    // this is done in a separate function so that the tree will expand during this blocking call
                    QueryBuilderMain.joinURL = vURL;
                    joinObjForEdit = joinObj;
                    window.setTimeout("QueryBuilderMain.showJoinEditor()", 100);
                } else {
                    alert(QueryBuilderMain.createLocalJoinMessage);
                }
            },
            HandleJoinEditor : function () {
                var joinObj = new joinInfo(QueryBuilderMain.joinXML),
                    tofieldpath = (joinObj.totablepath !== '') ? joinObj.totablepath : joinObj.totable + ":" + joinObj.tofield,
                    dpath = tofieldpath + joinObj.jointype + joinObj.fromfield + "." + joinObj.fromtable + "!",
                    tree = dijit.byId("divTableTree");
                tree.model.newItem(joinObj, tree.selectedNode);
            },
            showJoinEditor : function () {
                window.open(QueryBuilderMain.joinURL, "joinEditor","dialog=yes,centerscreen=yes,width=650,height=450,status=no,toolbar=no,scrollbars=no,modal=yes");
            },
            edit_Click : function (ev) {
                switch (QueryBuilderMain.currentTab) {
                case QueryBuilderMain.tabConditions:
                    QueryBuilderMain.editCondition();
                    break;
                case QueryBuilderMain.tabLayout:
                    QueryBuilderMain.editLayout(ev);
                    break;
                }
            },
            delete_Click : function () {
                switch (QueryBuilderMain.currentTab) {
                    case QueryBuilderMain.tabConditions:
                        QueryBuilderMain.dgConditions.deleteSelectedRow();
                        QueryBuilderMain.updateAndOrs();
                        break;
                    case QueryBuilderMain.tabLayout:
                        QueryBuilderMain.deleteLayout();
                        break;
                    case QueryBuilderMain.tabSorting :
                        QueryBuilderMain.dgSorts.deleteSelectedRow();
                        QueryBuilderMain.resetOrder();
                        break;
                }
            },
            resetCursor : function () {
                document.body.style.cursor = "auto";
                document.getElementById("btnMoveUp").style.cursor = "auto";
                document.getElementById("btnMoveDn").style.cursor = "auto";
            },
            moveup_Click : function () {
                QueryBuilderMain.moveup_ClickWorker();
            },
            SwapConditionRow : function (fromRow, toRow) {
                var fromHTML = fromRow.innerHTML,
                    fromOpIndex = dojo.query("select", fromRow)[0].selectedIndex;
                fromRow.innerHTML = toRow.innerHTML;
                dojo.query("select", fromRow)[0].selectedIndex = dojo.query("select", toRow)[0].selectedIndex;
                toRow.innerHTML = fromHTML;
                dojo.query("select", toRow)[0].selectedIndex = fromOpIndex;
            },
            moveup_ClickWorker : function () {
                var vRow;
                
                switch (QueryBuilderMain.currentTab) {
                    case QueryBuilderMain.tabConditions :
                        vRow = QueryBuilderMain.dgConditions.selectedIndex;
                        if (vRow > 1) {
                            QueryBuilderMain.dgConditions.selectRowByIndex(vRow);
                            if (document.all) {
                                QueryBuilderMain.dgConditions.gridElement.moveRow(vRow, vRow-1);
                            } else {
                                QueryBuilderMain.SwapConditionRow(QueryBuilderMain.dgConditions.gridElement.rows[vRow], QueryBuilderMain.dgConditions.gridElement.rows[vRow - 1]);
                            }
                            QueryBuilderMain.dgConditions.selectRowByIndex(vRow);
                            QueryBuilderMain.dgConditions.selectRowByIndex(vRow - 1);
                            QueryBuilderMain.updateAndOrs();
                        }
                        break;
                    case QueryBuilderMain.tabLayout :
                        QueryBuilderMain.moveLayoutLeft();
                        break;
                    case QueryBuilderMain.tabSorting :
                        vRow = QueryBuilderMain.dgSorts.selectedIndex;
                        if (vRow > 1) {
                            QueryBuilderMain.dgSorts.selectRowByIndex(vRow);
                            if (document.all) {
                                QueryBuilderMain.dgSorts.gridElement.moveRow(vRow, vRow-1);
                            } else {
                                QueryBuilderMain.SwapConditionRow(QueryBuilderMain.dgSorts.gridElement.rows[vRow], QueryBuilderMain.dgSorts.gridElement.rows[vRow - 1]);
                            }
                            QueryBuilderMain.dgSorts.selectRowByIndex(vRow);
                            QueryBuilderMain.dgSorts.selectRowByIndex(vRow - 1);
                            QueryBuilderMain.resetOrder();
                        }
                        break;
                }
                QueryBuilderMain.resetCursor();
            },
            waitCursor : function () {
                document.body.style.cursor = "wait";
            },
            movedown_Click : function () {
                QueryBuilderMain.movedown_ClickWorker();
            },
            movedown_ClickWorker : function () {
                var vRow;
                switch (QueryBuilderMain.currentTab) {
                    case QueryBuilderMain.tabConditions :
                        vRow = QueryBuilderMain.dgConditions.selectedIndex;
                        if ((vRow > 0) && (vRow < QueryBuilderMain.dgConditions.gridElement.rows.length - 1)) {
                            QueryBuilderMain.dgConditions.selectRowByIndex(vRow);
                            if (document.all) {
                                QueryBuilderMain.dgConditions.gridElement.moveRow(vRow, vRow+1);
                            } else {
                                QueryBuilderMain.SwapConditionRow(QueryBuilderMain.dgConditions.gridElement.rows[vRow], QueryBuilderMain.dgConditions.gridElement.rows[vRow + 1]);
                            }
                            QueryBuilderMain.dgConditions.selectRowByIndex(vRow);
                            QueryBuilderMain.dgConditions.selectRowByIndex(vRow + 1);
                        }
                        QueryBuilderMain.updateAndOrs();
                        break;
                    case QueryBuilderMain.tabLayout :
                        QueryBuilderMain.moveLayoutRight();
                        break;
                    case QueryBuilderMain.tabSorting :
                        vRow = QueryBuilderMain.dgSorts.selectedIndex;
                        if ((vRow > 0) && (vRow < QueryBuilderMain.dgSorts.gridElement.rows.length - 1)) {
                            QueryBuilderMain.dgSorts.selectRowByIndex(vRow);
                            if (document.all) {
                                QueryBuilderMain.dgSorts.gridElement.moveRow(vRow, vRow+1);
                            } else {
                                QueryBuilderMain.SwapConditionRow(QueryBuilderMain.dgSorts.gridElement.rows[vRow], QueryBuilderMain.dgSorts.gridElement.rows[vRow + 1]);
                            }
                            QueryBuilderMain.dgSorts.selectRowByIndex(vRow);
                            QueryBuilderMain.dgSorts.selectRowByIndex(vRow + 1);
                            QueryBuilderMain.resetOrder();
                        }
                        break;
                }
                QueryBuilderMain.resetCursor();
            },
            initConditionGrid : function () {
                QueryBuilderMain.dgConditions.resizeColTo(0, '40');
                QueryBuilderMain.dgConditions.resizeColTo(1, '60');
                QueryBuilderMain.dgConditions.resizeColTo(2, '150');
                QueryBuilderMain.dgConditions.resizeColTo(3, '160');
                QueryBuilderMain.dgConditions.resizeColTo(4, '70');
                QueryBuilderMain.dgConditions.resizeColTo(5, '60');
                QueryBuilderMain.dgConditions.resizeColTo(6, '60');
                QueryBuilderMain.dgConditions.resizeColTo(7, '60');
            },
            editCondition : function () {
                var selRow = QueryBuilderMain.dgConditions.selectedIndex,
                    row;
                if (selRow > 0) {
                    row = QueryBuilderMain.dgConditions.gridElement.rows[selRow];
                    QueryBuilderMain.rebuildConditionObj(row);
                    QueryBuilderMain.currentCondition = row.conditionObj;
                    QueryBuilderMain.currentCondition.IsNew = false;
                  
                    ShowAddCondition();
                }
            },
            addToConditionGrid : function () {
                var conditionObj = new conditionInfo(),
                    cells = document.getElementById("fieldList").getElementsByTagName('TD'),
                    i,
                    fieldObj;
                    
                for (i = 0; i < cells.length; i++) {
                    if (cells[i].sel === 'T') {
                        fieldObj = cells[i].fieldObj;
                        conditionObj.alias = fieldObj.alias;
                        conditionObj.displayname = fieldObj.displayname;
                        conditionObj.fieldtypecode = fieldObj.fieldtypecode;
                        conditionObj.fieldtypename = fieldObj.getTypeName();
                        conditionObj.displaypath = fieldObj.displaypath;
                        conditionObj.datapath = fieldObj.datapath;
                        conditionObj.connector = 'END';
                        conditionObj.isliteral = 'false';
                        conditionObj.isnegated = 'false';
                        conditionObj.casesens = 'true';
                        
                        conditionObj.IsNew = true; //flag a new condition
                        break;
                    }
                }
                
                QueryBuilderMain.currentCondition = conditionObj;
                ShowAddCondition();
            },
            rebuildConditionObj : function (rowObj) {
                /* pass the row object of the condition datagrid                           */
                /* This will update the conditionInfo object associated with that row      */
                /* with values the user can change in the grid.                            */
                var cnd = rowObj.conditionObj,
                    selObj,
                    chkIsNeg,
                    chkcase;
                    
                if (cnd) {
                    selObj = rowObj.cells[3].getElementsByTagName('SELECT');
                    cnd.operator = selObj[0].value;

                    chkIsNeg = rowObj.cells[0].getElementsByTagName("INPUT");
                    cnd.isnegated = (chkIsNeg[0].checked) ? 'true' : 'false';

                    selObj = rowObj.cells[7].getElementsByTagName('SELECT');
                    cnd.connector = selObj[0].value.trim();
                    cnd.leftparens = rowObj.cells[1].getElementsByTagName('TD')[1].firstChild.innerHTML;
                    cnd.rightparens = rowObj.cells[6].getElementsByTagName('TD')[1].firstChild.innerHTML;
                    
                    chkcase = rowObj.cells[5].getElementsByTagName("INPUT");
                    cnd.casesens = (chkcase[0].checked) ? 'true' : 'false';

                    rowObj.conditionObj = cnd;
                }
            },
            addDataToConditionGrid : function (conditionObj) {
                var row,
                    txt,
                    lpSpanID,
                    rpSpanID,
                    selObjs;
                    
                if (conditionObj) {
                    row = QueryBuilderMain.dgConditions.addNewRow();
                    txt = '<input type="checkbox" id="chkNot" ';
                    txt += (conditionObj.isnegated === 'true') ? 'checked ' : '';
                    txt += '/>';
                    row.cells[0].innerHTML = txt;
                    row.cells[2].firstChild.nodeValue = conditionObj.displaypath + '.' + conditionObj.displayname;
                    
                    //.operator
                    row.cells[3].innerHTML = conditionObj.buildOperatorSelectHTML('selOperator');
                    
                    //.value
                    if ((conditionObj.value === '') || (conditionObj.value === 'NULL')) {
                        row.cells[4].firstChild.nodeValue = ' ';
                    } else {
                        row.cells[4].firstChild.nodeValue = conditionObj.value;
                    }
                    
                    //.casesens
                    txt = '<input type="checkbox" id="chkCaseSens" ';
                    txt += (conditionObj.casesens === 'true') ? 'checked ' : '';
                    txt += '>';
                    row.cells[5].innerHTML = txt;
                    row.cells[5].align = 'center';

                    //.connector
                    txt = '<select id="selAndOr" name="selAndOr" onchange="QueryBuilderMain.updateAndOrs"()>';
                    txt += '<option value="AND">AND</option>';
                    txt += '<option value="OR">OR</option>';
                    txt += '<option value="END">END</option>';
                    row.cells[7].innerHTML = txt;
                    selObjs = row.cells[7].getElementsByTagName("SELECT");
                    selObjs[0].value = conditionObj.connector;
                    //QueryBuilderMain.updateAndOrs();  Do this from the calling function in case we are adding more than one (i.e. loading a group for edit)

                    //.leftparens
                    lpSpanID = "LP" + conditionObj.alias.replace(/\./g, "") + row.rowIndex;
                    txt = '<table cellpadding="0" cellspacing="0" border="0" ><tr><td style="padding-bottom:0px; padding-right:5px">';
                    txt += '<img src="images/groupbuilder/plus.gif" onclick="QueryBuilderMain.addlp(' + "'" + lpSpanID + "'" + ')" border="0" style="cursor:hand" />';
                    txt += '</td><td rowspan="2"><span id="' + lpSpanID + '">';
                    txt += conditionObj.leftparens;
                    txt += '</span></td></tr><tr><td>';
                    txt += '<img src="images/groupbuilder/minus.gif" onclick="QueryBuilderMain.dellp(' + "'" + lpSpanID + "'" + ')" border="0" style="cursor:pointer" />';
                    txt += '</td></tr></table>';
                    row.cells[1].style.paddingTop = '0px';
                    row.cells[1].style.paddingLeft = '0px';
                    row.cells[1].innerHTML = txt;

                    //.rightparens
                    rpSpanID = "RP" + conditionObj.alias.replace(/\./g, "") + row.rowIndex;
                    txt = '<table cellpadding="0" cellspacing="0" border="0" ><tr><td style="padding-bottom:0px; padding-right:5px">';
                    txt += '<img src="images/groupbuilder/plus.gif" onclick="QueryBuilderMain.addrp(' + "'" + rpSpanID + "'" + ')" border="0" style="cursor:pointer" />';
                    txt += '</td><td rowspan="2"><span id="' + rpSpanID + '">';
                    txt += conditionObj.rightparens;
                    txt += '</span></td></tr><tr><td>';
                    txt += '<img src="images/groupbuilder/minus.gif" onclick="QueryBuilderMain.delrp(' + "'" + rpSpanID + "'" + ')" border="0" style="cursor:pointer" />';
                    txt += '</td></tr></table>';
                    row.cells[6].style.paddingTop = '0px';
                    row.cells[6].style.paddingLeft = '0px';
                    row.cells[6].innerHTML = txt;
                    
                    // add the conditionObj to the row for safekeeping...
                    row.conditionObj = conditionObj;
                }
            },
            addlp : function (lpSpanId) {
                // add left parens
                if (QueryBuilderMain.accessmode === "readonly") {
                    return;
                }
                var obj = document.getElementById(lpSpanId);
                if (typeof obj !== "undefined") {
                    obj.innerHTML += '(';
                }
                
            },
            dellp : function (lpSpanId) {
                // remove left parens
                if (QueryBuilderMain.accessmode === "readonly") {
                    return;
                }
                var obj = document.getElementById(lpSpanId);
                if (typeof obj !== "undefined") {
                    obj.innerHTML = obj.innerHTML.replace(/\(/, '');
                }
            },
            addrp : function (rpSpanId) {
                // add right parens
                if (QueryBuilderMain.accessmode === "readonly") {
                    return;
                }
                var obj = document.getElementById(rpSpanId);
                if (typeof obj !== "undefined") {
                    obj.innerHTML += ')';
                }
            },
            delrp : function (rpSpanId) {
                // remove right parens
                if (QueryBuilderMain.accessmode === "readonly") {
                    return;
                }
                var obj = document.getElementById(rpSpanId);
                if (typeof obj !== "undefined") {
                    obj.innerHTML = obj.innerHTML.replace(/\)/, '');
                }
            },
            updateAndOrs : function () {
                // this just makes sure we don't have two "END" connectors
                var elems = document.getElementsByName("selAndOr"),
                    i;
                for (i = 0; i < elems.length; i++) {
                    if (i < elems.length - 1) {
                        if (elems[i].value === 'END') {
                            if ((i === (elems.length - 2)) && (elems[i+1].value !== 'END')) {
                                elems[i].value = elems[i+1].value;
                            } else {
                                elems[i].value = 'AND';
                            }
                        }
                    } else {
                        elems[i].value = 'END';
                    }
                }
            },
            conditionsAsXml : function () {
                var ret = '<conditions count="XputcounthereX">',
                    cnt = 0,
                    rows = QueryBuilderMain.dgConditions.gridElement.rows,
                    i;
                    
                for (i = 1; i < rows.length; i++) {
                    cnt++;
                    QueryBuilderMain.rebuildConditionObj(rows[i]);
                    ret += rows[i].conditionObj.asXML();
                }
                ret += '</conditions>';
                ret = ret.replace("XputcounthereX", cnt);
                return ret;
            },
            addToLayoutGrid : function () {
                var layoutObj = new layoutInfo(),
                    cells = document.getElementById("fieldList").getElementsByTagName('TD'),
                    i,
                    fieldObj,
                    layoutGrid,
                    lastLayoutObj;
                    
                for (i = 0; i < cells.length; i++) {
                    if (cells[i].sel === 'T') {
                        fieldObj = cells[i].fieldObj;
                        layoutObj.alias = fieldObj.alias;
                        layoutObj.displayname = fieldObj.displayname;
                        layoutObj.fieldtypecode = fieldObj.fieldtypecode;
                        layoutObj.fieldtypename = fieldObj.getTypeName();
                        layoutObj.displaypath = fieldObj.displaypath;
                        layoutObj.datapath = fieldObj.datapath;
                        //default layout settings...
                        layoutObj.caption = fieldObj.displayname;
                        layoutObj.width = '120';
                        layoutObj.align = ((layoutObj.fieldtypecode === '3') || (layoutObj.fieldtypecode === '6')) ? 'Right' : 'Left';
                        layoutObj.captalign = 'Left';
                        layoutObj.format = 'None';
                        if (fieldObj.alias.indexOf('SECCODEID') > -1) {
                            layoutObj.format = 'Owner';
                        }
                        
                        if ((fieldObj.alias.indexOf('ACCOUNTMANAGERID') > -1) || (fieldObj.alias.indexOf('USERID') > -1)) {
                            layoutObj.format = 'User';
                        }
                        
                        layoutObj.formatstring = '';
                        break;
                    }
                }
                
                layoutGrid = document.getElementById("grdLayout");
                if (layoutGrid) {
                    if (layoutGrid.rows[0].cells.length > 0) {
                        if (layoutGrid.rows[0].cells[layoutGrid.rows[0].cells.length - 1].getElementsByTagName('TABLE').length > 0) {
                            lastLayoutObj = layoutGrid.rows[0].cells[layoutGrid.rows[0].cells.length - 1].getElementsByTagName('TABLE')[0].layoutObj;
                            if (lastLayoutObj) {
                                if (lastLayoutObj.datapath === layoutObj.datapath) {
                                    return; // duplicate
                                }
                            }
                        }
                    }
                
                }
                
                QueryBuilderMain.addDataToLayoutGrid(layoutObj, "true");
            },
            addDataToLayoutGrid : function (layoutObj, strSelected) {
                var dispfieldpath = layoutObj.displaypath + '.' + layoutObj.displaypath,
                    lytID = dispfieldpath.replace(/[.]/g, ''),
                    elem = document.getElementById(lytID),
                    b,
                    fieldLayoutHtml,
                    layoutGrid,
                    cell,
                    elems;
                    
                if (elem) {
                    b = confirm(QueryBuilderMain.addDataToLayoutGridMessage);
                    if (b === false) {
                        return;
                    }
                }

                // Width must be set inline here or dojo will override it inline.
                fieldLayoutHtml = '<table class="dndItem QueryBuilderLayout" style="width: 150px; min-width: 150px; max-width: 150px" ';
                fieldLayoutHtml += 'ondblclick="QueryBuilderMain.editLayout(event);" onclick="QueryBuilderMain.toggleSelection(event);" ';
                fieldLayoutHtml += 'sel="F" ';
                fieldLayoutHtml += 'title="' + queryBuilderMainResources.LayoutTooltip + '" ';
                fieldLayoutHtml += '>';
                fieldLayoutHtml += '<tr><td style="BACKGROUND-COLOR: transparent" align="';
                fieldLayoutHtml += layoutObj.captalign + '">';
                fieldLayoutHtml += layoutObj.caption.replace(/ /g, '&nbsp;');
                fieldLayoutHtml += '</td></tr>';
                fieldLayoutHtml += QueryBuilderMain.makeLayoutRow(layoutObj.displaypath + '.' + layoutObj.displayname, 'title="' + layoutObj.displaypath + '.' + layoutObj.displayname + '"');
                fieldLayoutHtml += QueryBuilderMain.makeLayoutRow(layoutObj.width);
                fieldLayoutHtml += QueryBuilderMain.makeLayoutRow(layoutObj.align);
                fieldLayoutHtml += QueryBuilderMain.makeLayoutRow(layoutObj.format.replace("DateTime", "Date/Time"));
                fieldLayoutHtml += QueryBuilderMain.makeLayoutRow(layoutObj.formatstring);
                
                if (layoutObj.ishidden || !layoutObj.visible) {
                    fieldLayoutHtml += QueryBuilderMain.makeLayoutRow('Hidden');
                } else {
                    fieldLayoutHtml += QueryBuilderMain.makeLayoutRow('Visible');
                }
                
                if (layoutObj.weblink) {
                    fieldLayoutHtml += QueryBuilderMain.makeLayoutRow('Yes');
                } else {
                    fieldLayoutHtml += QueryBuilderMain.makeLayoutRow('No');
                }
                
                fieldLayoutHtml += QueryBuilderMain.makeLayoutRow(layoutObj.cssclass);
                fieldLayoutHtml += '</table>';
                layoutGrid = document.getElementById("grdLayout");
                
                if (QueryBuilderMain.currentLayoutIndex !== null) {
                    cell = layoutGrid.rows[0].insertCell(QueryBuilderMain.currentLayoutIndex);
                } else {
                    cell = layoutGrid.rows[0].insertCell(layoutGrid.rows[0].cells.length);
                }
                
                cell.innerHTML = fieldLayoutHtml;
                cell.setAttribute('style', 'min-width: 150px;position: relative;');
                cell.setAttribute('class', 'mdndArea');
                
                QueryBuilderMain.CreateAreaManager(cell);
                    
                elems = cell.getElementsByTagName('TABLE');
                elems[0].layoutObj = layoutObj;
                
                // TODO: Why is strSelect a string an not a boolean?
                if(strSelected === 'true') {
                    QueryBuilderMain.deselectAll();
                    QueryBuilderMain.selectLayoutItem(elems[0]);
                }
                QueryBuilderMain.UpdateLayoutElements();
            },
            UnregisterDndAreas : function () {
                var grid = dojo.byId('grdLayout'),
                    nodes = dojo.query('.mdndArea', grid);
                dojo.forEach(nodes, function(item) {
                    QueryBuilderMain.areaManager.unregister(item);
                });
            },
            RegisterDndAreas : function () {
                var grid = dojo.byId('grdLayout'),
                    nodes = dojo.query('.mdndArea', grid);
                dojo.forEach(nodes, function(item) {
                    QueryBuilderMain.areaManager.registerByNode(item);
                });
            },
            CreateAreaManager : function (areaNode) {
                if(!QueryBuilderMain.areaManager) {
                    QueryBuilderMain.areaManager = dojox.mdnd.areaManager();
                    QueryBuilderMain.areaManager.areaClass = "mdndArea";
                    QueryBuilderMain.areaManager.dragHandleClass = "dragHandle";

                    dojo.subscribe('/dojox/mdnd/drag/start', function(node, sourceArea, sourceDropIndex) {
                        dojo.attr(node, 'dragging', 'true');
                    });

                    dojo.subscribe('/dojox/mdnd/drop', function(node, targetArea, indexChild) {
                        var dropParent = node.parentNode,
                            dropIndex = dropParent.cellIndex,
                            startIndex, startParent,
                            dragLength = 0,
                            currentCell,
                            layoutGrid = dojo.byId('grdLayout'),
                            cells = layoutGrid.rows[0].cells,
                            i,
                            x,
                            y;
                            
                        for(i = 0; i < cells.length; i++) {
                            if(cells[i].childElementCount === 0 || cells[i].childNodes.length === 0) {
                                startIndex = cells[i].cellIndex;
                                startParent = cells[i].parentNode;
                                break;
                            }
                        }

                        // TODO: Refactor the dojo.place into one function, the code is duplicated in each if branch
                        QueryBuilderMain.UnregisterDndAreas();
                        if(startIndex > dropIndex) {
                            // We dragged to the left.
                            // Shift the cells right from drop to start.
                            dragLength = startIndex - dropIndex;
                            for(x = startIndex; x > dropIndex; x--) {
                                currentCell = cells[x-1];
                                if(currentCell.childNodes.length === 1) {
                                    dojo.place(currentCell.childNodes[0], cells[x]);
                                } else {
                                    // dropped node will have two children (dropped + existing)
                                    for(y = 0; y < currentCell.childNodes.length; y++) {
                                        if(dojo.attr(currentCell.childNodes[y], 'dragging') !== 'true') {
                                            dojo.place(currentCell.childNodes[y], cells[x]);
                                            break;
                                        }
                                    }
                                }
                            }
                        } else if (startIndex < dropIndex) {
                            // We dragged to the right.
                            // Shift the cells left from drop to start.
                            dragLength = dropIndex - startIndex;
                            for(x = startIndex; x < dropIndex; x++) {
                                currentCell = cells[x+1];
                                if(currentCell.childNodes.length === 1) {
                                    dojo.place(currentCell.childNodes[0], cells[x]);
                                } else {
                                    // dropped node will have two children (dropped + existing)
                                    for(y = 0; y < currentCell.childNodes.length; y++) {
                                        if(dojo.attr(currentCell.childNodes[y], 'dragging') !== 'true') {
                                            dojo.place(currentCell.childNodes[y], cells[x]);
                                            break;
                                        }
                                    }
                                }
                            }

                        }

                        QueryBuilderMain.RegisterDndAreas();
                        dojo.removeAttr(node, 'dragging');
                        dojo.style(node, 'width', '100%');
                    });
                }

                // TODO: This causes IE9 text inputs to not select text anymore
                QueryBuilderMain.areaManager.registerByNode(areaNode);
            },
            UpdateLayoutElements : function () {
                var layoutGrid = dojo.byId("grdLayout"),
                    cellcnt = layoutGrid.rows[0].cells.length,
                    totalWidth = 0,
                    i;
                    
                for (i = 0; i < cellcnt; i++) {
                    layoutGrid.rows[0].cells[i].id = "layout" + i;
                    totalWidth += parseInt(layoutGrid.rows[0].cells[i].width, 10);
                }
                
                if(!isNaN(totalWidth)) {
                    dojo.style(layoutGrid, 'width', totalWidth + 'px');
                }
            },
            makeLayoutRow : function (aDisp, custom) {
                if (!custom) {
                    custom = "";
                }
                var vRow = '<tr><td style="background-color: white; height:12px"' + custom + '>';
                if (aDisp === ' ') {
                    aDisp = '&nbsp;';
                }
                vRow += (aDisp !== '') ? aDisp : '&nbsp;';
                vRow += '</td></tr>';
                return vRow;
            },
            deselectAll : function () {
                var tbls = document.getElementById("grdLayout").getElementsByTagName('TABLE'),
                    i;
                for (i = 0; i < tbls.length; i++) {
                    if (tbls[i].sel === 'T') {
                        QueryBuilderMain.deselectLayoutItem(tbls[i]);
                    }
                }
            },
            toggleSelection: function (ev) {
               var elem = ev.target || window.event.srcElement,
                tempSel;
                   
                while (elem.tagName !== 'TABLE') {
                    elem = elem.parentNode;
                }
                
                tempSel = elem.sel; //hold in case this next changes it...
                
                QueryBuilderMain.deselectAll();
                elem.sel = tempSel;
                if (elem.sel === 'T') {
                    QueryBuilderMain.deselectLayoutItem(elem);
                } else {
                    QueryBuilderMain.selectLayoutItem(elem);
                }
            },
            selectLayoutItem : function (objItm) {
                var elems = objItm.getElementsByTagName('TD'),
                    i;
                objItm.sel = 'T';
                for (i = 1; i < elems.length; i++) {
                    elems[i].style.color = '#000000';
                    elems[i].style.backgroundColor = '#D6E3BF';
                }
            },
            deselectLayoutItem : function (objItm) {
                var elems = objItm.getElementsByTagName('TD'),
                    i;
                objItm.sel = 'F';
                for (i = 1; i < elems.length; i++) {
                    elems[i].style.color = 'black';
                    elems[i].style.backgroundColor = 'white';
                }
            },
            editLayout : function (ev) {
                var elem = ev.target || window.event.srcElement,
                    elems,
                    i;
                
                if (QueryBuilderMain.accessmode === "readonly") {
                    return;
                }
                
                
                if (elem.tagName === 'INPUT') {
                     elems = document.getElementById("grdLayout").getElementsByTagName('TABLE');
                    for (i = 0; i < elems.length; i++) {
                        if (elems[i].sel === 'T') {
                            QueryBuilderMain.ShowEditLayout(elems[i]);
                            break;
                        }
                    }
                } else {
                    while (elem.tagName !== 'TABLE') {
                        elem = elem.parentNode;
                    }
                    QueryBuilderMain.ShowEditLayout(elem);
                }
            },
            deleteLayout : function () {
                var elems = document.getElementById("grdLayout").getElementsByTagName('TABLE'),
                    i;
                    
                for (i = 0; i < elems.length; i++) {
                    if (elems[i].sel === 'T') {
                        if (elems[i].parentNode.removeNode) { //removeNode is IE only, but removeChild doesn't recalc correctly in IE
                            elems[i].parentNode.removeNode(true);
                        } else {
                            elems[i].parentNode.removeChild(elems[i]);
                            document.getElementById("grdLayout").rows[0].deleteCell(i);
                        }
                        QueryBuilderMain.UpdateLayoutElements();
                        return;
                    }
                }
            },
            SwapLayoutNode : function (fromLayout, toLayout) {
                // layout node is the <td> container for the layout <table>
                QueryBuilderMain.UnregisterDndAreas();
                var fromParent = fromLayout.parentNode,
                    replacedNode = toLayout.parentNode.replaceChild(fromLayout, toLayout);
                fromParent.appendChild(replacedNode);
                QueryBuilderMain.RegisterDndAreas();
            },
            moveLayoutLeft : function () {
                var elems = document.getElementById("grdLayout").getElementsByTagName('TABLE'),
                    i;
                for (i = 1; i < elems.length; i++) {
                    if (elems[i].sel === 'T') {
                        QueryBuilderMain.SwapLayoutNode(elems[i], elems[i-1]);
                        return;
                    }
                }
            },
            moveLayoutRight : function () {
                var elems = document.getElementById("grdLayout").getElementsByTagName('TABLE'),
                    i;
                for (i = 0; i < elems.length - 1; i++) {
                       if (elems[i].sel === 'T') {
                        QueryBuilderMain.SwapLayoutNode(elems[i], elems[i+1]);
                        return;
                    }
                }
            },
            layoutsAsXml : function () {
                var ret = '<layouts count="XputcounthereX">',
                    hidden = '<hiddenfields count="XputcounthereX">',
                    layoutcnt = 0,
                    hiddencnt = 0,
                    tbls = document.getElementById("grdLayout").getElementsByTagName('TABLE'),
                    i,
                    layoutObj;
                    
                for (i = 0; i < tbls.length; i++) {
                    layoutObj = tbls[i].layoutObj;
                    if (layoutObj.ishidden) {
                        hidden += layoutObj.asXML();
                        hiddencnt++;
                    } else {
                        ret += layoutObj.asXML();
                        layoutcnt++;
                    }
                }
                
                hidden += '</hiddenfields>';
                hidden = hidden.replace("XputcounthereX", hiddencnt);
                ret += '</layouts>';
                ret = ret.replace("XputcounthereX", layoutcnt);
                ret += hidden;
                return ret;
            },
            initSortsGrid : function () {
                QueryBuilderMain.dgSorts.resizeColTo(0, '40');
                QueryBuilderMain.dgSorts.resizeColTo(1, '200');
                QueryBuilderMain.dgSorts.resizeColTo(2, '200');
            },
            addSortToGrid : function () {
                var cells = document.getElementById("fieldList").getElementsByTagName('TD'),
                    sortObj = new sortInfo(),
                    i,
                    fieldObj,
                    isnew = true,
                    rows;
                    
                for (i = 0; i < cells.length; i++) {
                    if (cells[i].sel === 'T') {
                        fieldObj = cells[i].fieldObj;
                        sortObj.alias = fieldObj.alias;
                        sortObj.displayname = fieldObj.displayname;
                        sortObj.displaypath = fieldObj.displaypath;
                        sortObj.datapath = fieldObj.datapath;
                        break;
                    }
                }
                
                // make sure it isn't already there
                rows = QueryBuilderMain.dgSorts.gridElement.rows;
                for (i = 1; i < rows.length; i++) {
                    if (rows[i].sortObj) {
                        if (rows[i].sortObj.datapath === sortObj.datapath) {
                            isnew = false;
                        }
                    }
                }
                
                if (isnew) {
                    QueryBuilderMain.addDataToSortGrid(sortObj);
                }
            },
            addDataToSortGrid : function (sortObj) {
                var row = QueryBuilderMain.dgSorts.addNewRow(),
                    txtObj;
                
                row.cells[0].firstChild.nodeValue = QueryBuilderMain.dgSorts.gridElement.rows.length - 1;
                row.cells[1].firstChild.nodeValue = sortObj.displaypath + '.' + sortObj.displayname;
                
                txtObj = '<select name="selSort" >';
                txtObj += '<option value="ASC" ';
                txtObj += (sortObj.sortorder === 'ASC') ? 'selected' : '';
                txtObj += '>' + QueryBuilderMain.jsAscending + '</option>';
                txtObj += '<option value="DESC" ';
                txtObj += (sortObj.sortorder === 'DESC') ? 'selected' : '';
                txtObj += '>' + QueryBuilderMain.jsDescending + '</option></select>';
                row.cells[2].innerHTML = txtObj;
                row.sortObj = sortObj;
            },
            resetOrder : function () {
                var rows = QueryBuilderMain.dgSorts.gridElement.rows,
                    i;
                for (i = 1; i < rows.length; i++) {
                    rows[i].cells[0].innerHTML = i;
                }
            },
            sortsAsXml : function () {
                var ret = '<sorts count="XputcounthereX">',
                    cnt = 0,
                    rows = QueryBuilderMain.dgSorts.gridElement.rows,
                    i,
                    sortObj,
                    selObj;
                    
                for (i = 1; i < rows.length; i++) {
                    cnt++;
                    sortObj = rows[i].sortObj;
                    if (sortObj) {
                        selObj = rows[i].getElementsByTagName("SELECT");
                        sortObj.sortorder = selObj[0].value;
                        ret += sortInfo_asXML.call(sortObj);
                    }
                }
                ret += '</sorts>';
                ret = ret.replace("XputcounthereX", cnt);
                return ret;
            },
            defaultsAsXml : function () {
                var ret = '<adddistinct>';
                ret += (document.getElementById("chkUseDistinct").checked) ? 'true' : 'false';
                ret += '</adddistinct>';
                return ret;
            },
            checkReturn : function () {
                if (event.keyCode === 13) {
                    QueryBuilderMain.ok_Click();
                    event.returnValue = false;
                }
                if (event.keyCode === 27) {
                    QueryBuilderMain.cancel_Click();
                    event.returnValue = false;
                }
            },
            //--------------------------------------------QBEditLayout -----------------------------------------------------------------------
            // Client Side JavaScript for QBEditLayout.ascx
            QBEditLayout_Load : function (elem) {
                var layoutObj,
                    cells;
                QueryBuilderMain.currentLayoutElem = elem;
                if ((elem.layoutObj) && (elem.layoutObj.QBObjectType === "layoutInfo")) {
                    layoutObj = elem.layoutObj;
                    cells = elem.getElementsByTagName('TD');

                    document.getElementById("txtFieldName_EditLayout").value = layoutObj.displaypath + '.' + layoutObj.displayname;
                    document.getElementById("txtFieldName_EditLayout").disabled = true;
                    document.getElementById("txtCaption").value = layoutObj.caption;
                    document.getElementById("chkVisible").checked = layoutObj.visible;
                    document.getElementById("txtWidth").value = layoutObj.width;
                    document.getElementById("selCaptAlign").value = layoutObj.captalign;
                    document.getElementById("selTextAlign").value = layoutObj.align;
                    document.getElementById("selFormatType").value = layoutObj.format;
                    document.getElementById("txtFormat").value = layoutObj.formatstring;
                    document.getElementById("chkWebLink").checked = layoutObj.weblink;
                    document.getElementById("txtCssClass").value = layoutObj.cssclass;
                } else {
                    alert(QueryBuilderMain.QBMsg_ErrorMissingLayoutObject);
                }
            },
            QBEditLayout_Cancel_Click : function () {
                dijit.byId("dlgEditLayout").hide();
            },
            QBEditLayout_OK_Click : function () {
                var cells = QueryBuilderMain.currentLayoutElem.getElementsByTagName('TD'),
                    wdth = document.getElementById("txtWidth").value,
                    layoutObj;
                    
                if (!wdth) {
                    wdth = 120;
                }
                
                if (wdth === '') {
                    wdth = 120;
                }
                
                if (cells.length > 6) {
                    cells[1].firstChild.nodeValue = document.getElementById("txtFieldName_EditLayout").value;
                    cells[0].innerHTML = document.getElementById("txtCaption").value.replace(/ /g, '&nbsp;');
                    cells[0].align = document.getElementById("selCaptAlign").value;
                    cells[6].firstChild.nodeValue = (document.getElementById("chkVisible").checked) ? 'Visible' : 'Hidden';
                    cells[2].firstChild.nodeValue = wdth;
                    QueryBuilderMain.currentLayoutElem.captalign = document.getElementById("selCaptAlign").value;
                    cells[3].firstChild.nodeValue = document.getElementById("selTextAlign").value;
                    cells[4].firstChild.nodeValue = document.getElementById("selFormatType").value.replace("DateTime", "Date/Time");
                    cells[5].firstChild.nodeValue =  (document.getElementById("txtFormat").value === '') ? " " : document.getElementById("txtFormat").value;
                    cells[7].firstChild.nodeValue = (document.getElementById("chkWebLink").checked) ? 'Yes' : 'No';
                    cells[8].firstChild.nodeValue = document.getElementById("txtCssClass").value;
                }
                if (QueryBuilderMain.currentLayoutElem.layoutObj) {
                    layoutObj = QueryBuilderMain.currentLayoutElem.layoutObj;
                    layoutObj.caption = document.getElementById("txtCaption").value;
                    layoutObj.visible = document.getElementById("chkVisible").checked;
                    layoutObj.width = wdth;
                    layoutObj.captalign = document.getElementById("selCaptAlign").value;
                    layoutObj.align = document.getElementById("selTextAlign").value;
                    layoutObj.format = document.getElementById("selFormatType").value;
                    layoutObj.formatstring = document.getElementById("txtFormat").value;
                    
                    layoutObj.weblink = document.getElementById("chkWebLink").checked;
                    layoutObj.cssclass = document.getElementById("txtCssClass").value;
                    QueryBuilderMain.currentLayoutElem.layoutObj = layoutObj;
                }
                dijit.byId("dlgEditLayout").hide();
            },
            ShowEditLayout : function (element) {
                QueryBuilderMain.QBEditLayout_Load(element);
                dijit.byId("dlgEditLayout").show();
            },
            GetGroupManager : function (){
                var vGM = Sage.Groups.GroupManager,
                    str,
                    re;
                    
                vGM.CurrentUserID = queryBuilderMainResources.CurrentUserID;  //get user id
                str = queryBuilderMainResources.groupXML;  // set on server
                re = /&apos;/gi;
                vGM.GroupXML = str.replace(re, "'");
                vGM.ConfirmDeleteMessage = queryBuilderMainResources.ConfirmDeleteMessage;
                vGM.InvalidSortStringMessage = queryBuilderMainResources.InvalidSortStringMessage;
                vGM.InvalidConditionStringMessage = queryBuilderMainResources.InvalidConditionStringMessage;
                vGM.InvalidLayoutConditionStringMessage = queryBuilderMainResources.InvalidLayoutConditionStringMessage;
                return vGM;
            }
        };

    dojo.connect(QueryBuilderMain.dgConditions, 'onrendercomplete', QueryBuilderMain.dgConditions, QueryBuilderMain.initConditionGrid);

    QueryBuilderMain.dgConditions.HighlightBackgroundColor = "#e3f2ff";
    QueryBuilderMain.dgConditions.HighlightFontColor = "Black";

    QueryBuilderMain.dgSorts = new SLXDataGrid("grdSorts");
    dojo.connect(QueryBuilderMain.dgSorts, 'onrendercomplete', QueryBuilderMain.dgSorts, QueryBuilderMain.initSortsGrid);

    QueryBuilderMain.dgSorts.HighlightBackgroundColor = "#e3f2ff";
    QueryBuilderMain.dgSorts.HighlightFontColor = "Black";

    dojo.require('Sage.Groups.GroupManager');

    dojo.ready(function () {
        //set the gmgr variable - so that it can be used from here and dialogs this page opens...
        QueryBuilderMain.gmgr = QueryBuilderMain.GetGroupManager();

        // Make sure the buttons are set the way they need to be for the default tab (properties)
        QueryBuilderMain.setButtonState(0);
        var xmlDoc = getXMLDoc(QueryBuilderMain.gmgr.GroupXML),
            haveGroupInfo,
            errornode,
            ldMode,
            layoutNodes,
            i,
            layoutObj,
            sortNodes,
            sortObj,
            condNodes,
            paramNodes,
            conditionObj,
            plugindatanode,
            copyPrefix,
            GroupUserID,
            elems;
            
        if (xmlDoc) {

            haveGroupInfo = true;
            errornode = xmlDoc.getElementsByTagName('error');
            if (errornode.length > 0) {
                haveGroupInfo = false;
            }
            ldMode = document.getElementById(queryBuilderMainResources.loadMode).value;
            if ((ldMode === "newGroup") || (ldMode === "editGroup") || (ldMode === "copyGroup")) {
                // for new and existing groups, we want to load the layouts and sorts
                // (new groups have the XML for the Latest or All group to copy the layouts and sorts)
                if (haveGroupInfo === true) {
                    layoutNodes = xmlDoc.getElementsByTagName('layout');
                    for (i = 0; i < layoutNodes.length; i++) {
                        if (getNodeText(layoutNodes[i].getElementsByTagName('width')[0]) !== '0') {
                            layoutObj = new layoutInfo(getNodeXML(layoutNodes[i]));
                            QueryBuilderMain.addDataToLayoutGrid(layoutObj);
                        }
                    }

                    sortNodes = xmlDoc.getElementsByTagName('sort');
                    for (i = 0; i < sortNodes.length; i++) {
                        sortObj = new sortInfo(getNodeXML(sortNodes[i]));
                        QueryBuilderMain.addDataToSortGrid(sortObj);
                    }
                }
            }
            if ((ldMode === "editGroup") || (ldMode === "copyGroup")) {
                // if we are editing the group, we want to also load the conditions
                condNodes = xmlDoc.getElementsByTagName('condition');
                paramNodes = xmlDoc.getElementsByTagName('parameters')[0];
                for (i = 0; i < condNodes.length; i++) {
                    conditionObj = new conditionInfo(getNodeXML(condNodes[i]), getNodeXML(paramNodes));
                    QueryBuilderMain.addDataToConditionGrid(conditionObj);
                }
                QueryBuilderMain.updateAndOrs();
                plugindatanode = xmlDoc.getElementsByTagName('plugindata')[0];

                if (ldMode === "copyGroup") {
                    copyPrefix = [QueryBuilderMain.copyOfString];
                    document.getElementById("txtGrpName").value = copyPrefix.push(plugindatanode.getAttribute('name')).join(' ');
                    document.getElementById("txtDisplayName").value = copyPrefix.push(plugindatanode.getAttribute('displayname')).join(' ');
                } else {
                    document.getElementById("txtGrpName").value = plugindatanode.getAttribute('name');
                    document.getElementById("txtDisplayName").value = plugindatanode.getAttribute('displayname');
                }

                document.getElementById("txtGrpDescription").value = getNodeText(xmlDoc.getElementsByTagName('description')[0]);
                document.getElementById("chkUseDistinct").checked = (getNodeText(xmlDoc.getElementsByTagName('adddistinct')[0]) === 'true');
                // See if this "group" is editable by this user...
                GroupUserID = (plugindatanode.getAttribute('userid') === "") ? QueryBuilderMain.gmgr.CurrentUserID : plugindatanode.getAttribute('userid');

                if ((GroupUserID !== QueryBuilderMain.gmgr.CurrentUserID) && (QueryBuilderMain.gmgr.CurrentUserID !== 'ADMIN') && (ldMode !== "copyGroup")) {
                    document.getElementById(queryBuilderMainResources.btnCalc).style.display = 'none';
                    document.getElementById(queryBuilderMainResources.btnJoins).style.display = 'none';
                    elems = document.forms[0].elements;
                    for (i = 0; i < elems.length; i++) {
                        if ((elems[i].id !== 'btnViewSQL') && (elems[i].id !== 'btnCancel')) {
                            elems[i].disabled = true;
                        }
                    }
                    var lnkCreateLocalJoin = document.getElementById("lnkCreateLocalJoin");
                    if(lnkCreateLocalJoin) {
                        lnkCreateLocalJoin.style.display = 'none';
                    }
                    QueryBuilderMain.accessmode = "readonly";
                } else {
                    QueryBuilderMain.accessmode = "readwrite";
                }
                document.getElementById("isAdHoc").value = getNodeText(xmlDoc.getElementsByTagName('adhocgroup')[0]);
                if (document.getElementById("isAdHoc").value === "true") {
                    // hide condition tab
                    QueryBuilderMain.hideTab(QueryBuilderMain.tabConditions);
                }
            }
        }


        if (document.getElementById(queryBuilderMainResources.sqlonly).value === "T") {
            QueryBuilderMain.hideTab(QueryBuilderMain.tabProperties);
            QueryBuilderMain.hideTab(QueryBuilderMain.tabLayout);
            QueryBuilderMain.hideTab(QueryBuilderMain.tabSorting);
            QueryBuilderMain.tabClick(QueryBuilderMain.tabConditions);
        } else {
            if (document.getElementById("txtGrpName").value === "") {
                document.getElementById("txtGrpName").value = QueryBuilderMain.newQuery;
            }
            if (document.getElementById("txtGrpName").disabled === false) {
                document.getElementById("txtGrpName").focus();
            }
        }

        if (QueryBuilderMain.gmgr.CurrentUserID === 'ADMIN') {
            //QueryBuilderMain.toggleHiddenFields();
            //document.getElementById("hiddenFieldSwitch").style.display = 'inline'; // show the button so that admin can toggle.
        }
    });
    
    return QueryBuilderMain;
})(this);