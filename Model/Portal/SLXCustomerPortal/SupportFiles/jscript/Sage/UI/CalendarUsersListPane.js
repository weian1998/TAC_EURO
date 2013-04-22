/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/Data/SDataServiceRegistry',
         'Sage/Data/WritableSDataStore',
        'Sage/Utility',
        'dojo/_base/lang',
        'dojo/_base/array',
        'dojo/i18n',
        'dojo/query',
        'dojo/_base/declare',
        'dojo/data/ItemFileWriteStore',
        'dojox/grid/enhanced/plugins/IndirectSelection',
        'dojox/grid/EnhancedGrid',
        'dojox/grid/enhanced/plugins/Pagination',
        'dojo/i18n!./nls/CalendarUsersListPane'

    ], function (sDataServiceRegistry, writableSDataStore, sUtility, dojoLang, array, i18n, dojoQuery, declare) {
        var calendarUsersListPane = declare('Sage.UI.CalendarUsersListPane', null, {
            Id: null,
            _store: null,
            _grid: null,
            _colors: {},
            _selectedUsers: {},
            _maxUserCount: 4,
            _checkedUsersCount: 0,
            _initialLoad: false,
            _storeItems: [],
            _maxUserCountReached: false,
            _userOptions: {},
            constructor: function (options) {
                this.Id = options.Id;
                this._userOptions = options.options;
                //Predefine these colors and assign to users, when selecting
                this._colors = [{
                    "usercolor": "user2",
                    "set": false
                }, {
                    "usercolor": "user3",
                    "set": false
                },
                {
                    "usercolor": "user4",
                    "set": false
                },
                {
                    "usercolor": "user5",
                    "set": false
                }];
                this._nlsResources = i18n.getLocalization("Sage.UI", "CalendarUsersListPane");
                this._initializeList();
            },
            _where: function () {
                var currentUserId = Sage.Utility.getClientContextByKey('userID');
                if (dojoLang.trim(currentUserId) === 'ADMIN') {
                    return dojo.string.substitute('(AccessId eq \'${0}\' OR AccessId eq \'${1}\' OR AccessId eq \'EVERYONE\') AND Type eq \'User\'', [currentUserId, dojoLang.trim(currentUserId)]);
                }else {
                    return dojo.string.substitute('(AccessId eq \'${0}\' OR AccessId eq \'EVERYONE\') AND Type eq \'User\'', [dojoLang.trim(currentUserId)]);
                }
               
            },
            _getSort: function () {
                var sort = [
                        { attribute: 'Name' }
                    ];
                return sort;
            },
            _getUserColor: function (userId) {
                var color = "";
                if (this._selectedUsers[userId]) {
                    color = this._selectedUsers[userId].usercolor;
                }
                return color;
            },
            _initializeList: function () {
                var headerUserName = this._nlsResources.header_user || 'User';
                var maxUsersErrorMessage = this._nlsResources.maxUsersErrorMessage || 'Sorry, you cannot view more than ${0} calendars (including your own) at one time.  Clear one of the currently-selected calendars and try again.';

                maxUsersErrorMessage = dojo.string.substitute(maxUsersErrorMessage, [this._maxUserCount]);
                var self = this;

                var onComplete = function (data, context) {
                    array.forEach(data, function (item, i) {
                        dojoLang.mixin(item, { usercolor: "", username: item['Name'], userId: item['$key'].substr(0, 12) });
                        self._storeItems.push(item);
                    });
                    //  self._storeItems = data;
                };

                var store = this._store = new Sage.Data.WritableSDataStore({
                    service: sDataServiceRegistry.getSDataService('dynamic'),
                    resourceKind: 'activityresourceviews',
                    //resourcePredicate: this.formatPredicate(entry),
                    //queryName: 'execute',
                    select: ['$key', 'Name'],
                    include: [],
                    sort: [{ attribute: 'Name'}],
                    query: { conditions: this._where() },
                    onComplete: onComplete
                });

                var structure = [
                    {
                        field: 'userId',
                        width: '20px',
                        name: ' ',
                        formatter: function (value) {
                            // var userId = value.substr(0, 12);
                            return "<div class='userStyles " + self._getUserColor(value) + "'></div>";
                        }
                    },
                    {
                        field: 'Name',
                        width: '100%',
                        name: headerUserName
                    }
                ];

                var grid = this._grid = new dojox.grid.EnhancedGrid({
                    id: 'grid',
                    store: store,
                    structure: structure,
                    layout: 'layout',
                    noDataMessage: "<span class='dojoxGridNoData'>No users</span>",
                    keepSelection: true,
                    plugins: { indirectSelection: { headerSelector: false, width: "20px", styles: "text-align: center;"} }

                },
                dojo.byId(this.Id));

                dojo.connect(grid.selection, 'onSelected', function (rowIndex) {
                    if (!self._initialLoad) {
                        if (self._checkedUsersCount < self._maxUserCount) {
                            var item = grid.getItem(rowIndex);
                            self._checkedUsersCount++;
                            var selectedItemUserId = item['$key'].substr(0, 12);
                            var selectedItemUserColor = "";

                            if (self._selectedUsers[selectedItemUserId]) {
                                //item['usercolor'] = self._selectedUsers[item["userId"]]["usercolor"];
                            } else {
                                if (selectedItemUserId === dojoLang.trim(sUtility.getClientContextByKey('userID'))) {
                                    selectedItemUserColor = "user1";
                                } else {
                                    if (!selectedItemUserColor || selectedItemUserColor == "") {
                                        for (var j = 0; j < self._colors.length; j++) {
                                            if (!self._colors[j]['set']) {
                                                selectedItemUserColor = self._colors[j]['usercolor'];

                                                self._colors[j]['set'] = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                                var userObj = {};
                                userObj["userId"] = selectedItemUserId;
                                userObj["usercolor"] = selectedItemUserColor;
                                self._selectedUsers[selectedItemUserId] = userObj;
                                var newUserObj = dojoLang.clone(userObj);

                                //Save the selected user to useroptions
                                self._saveUserOption();
                                //self._store.setValue(item, 'usercolor', userObj["usercolor"]);
                                grid.update();

                                //Refresh schduler and timeless activities list
                                dojo.publish('/sage/ui/calendarUser/selectionChanged/add', [newUserObj, null]);
                            }


                        } else {
                            self._maxUserCountReached = true;
                            grid.rowSelectCell.toggleRow(rowIndex, false);
                            Sage.UI.Dialogs.showError(maxUsersErrorMessage);
                        }
                    } else {
                        if (self._checkedUsersCount < self._maxUserCount) {
                            //  self._checkedUsersCount++;
                        }
                    }

                });
                dojo.connect(grid.selection, 'onDeselected', function (rowIndex) {
                    if (self._maxUserCountReached) {
                        self._maxUserCountReached = false;
                        return;
                    }
                    var item = grid.getItem(rowIndex);
                    var inSelected = false;
                    var selectedItemUserId = item['$key'].substr(0, 12);
                    var selectedItemUserColor = self._selectedUsers[selectedItemUserId].usercolor;
                    if (self._selectedUsers[selectedItemUserId]) {
                        inSelected = true;
                    }
                    if (inSelected) {

                        for (var j = 0; j < self._colors.length; j++) {
                            if (self._colors[j]['usercolor'] === selectedItemUserColor) {
                                self._colors[j]['set'] = false;
                                break;
                            }
                        }
                        delete self._selectedUsers[selectedItemUserId];
                        self._checkedUsersCount--;
                        //Update the useroptions value
                        self._saveUserOption();
                        grid.update();
                        var userObj = {};
                        userObj["userId"] = selectedItemUserId;
                        //Refresh schduler and timeless activities list
                        dojo.publish('/sage/ui/calendarUser/selectionChanged/remove', [userObj, this]);
                    }
                });

                dojo.connect(grid, "_onFetchComplete", function () {
                    self._initialLoad = true;
                    var usersChanged = false;
                    var calendarUsersToAccess = [];
                    var tempSelectedUsers = dojoLang.clone(self._selectedUsers);
                    var rowCount = self._grid.rowCount > self._grid.rowsPerPage ? self._grid.rowsPerPage : self._grid.rowCount;

                    for (var i = 0; i < rowCount; i++) {
                        var item = self._storeItems[i];
                        var userId = item['$key'].substr(0, 12);
                        if (self._selectedUsers[userId]) {
                            calendarUsersToAccess.push(userId);
                            if (!self._grid.selection.selected[i]) {
                                if (self._checkedUsersCount < self._maxUserCount) {
                                    self._grid.rowSelectCell.toggleRow(i, true);
                                    self._checkedUsersCount++;
                                }
                            }
                        }
                    }

                    //Validate the selected users list based on the calendar security
                    for (var j in tempSelectedUsers) {
                        var uId = dojoLang.trim(tempSelectedUsers[j]["userId"].toString());
                        var userColor = dojoLang.trim(tempSelectedUsers[j]["usercolor"].toString());
                        if (array.indexOf(calendarUsersToAccess, uId) < 0) {
                            delete self._selectedUsers[uId];
                            //Make the deleted user's color available for to assign
                            for (var k = 0; k < self._colors.length; k++) {
                                if (self._colors[k]['usercolor'] === userColor) {
                                    self._colors[k]['set'] = false;
                                    break;
                                }
                            }
                            usersChanged = true;
                        }
                    }

                    if (usersChanged) {
                        //Update the useroptions value
                        self._saveUserOption();
                    }

                    self._initialLoad = false;

                    if (self._selectedUsers) {
                        var newObj = dojoLang.clone(self._selectedUsers);
                        dojo.publish('/sage/ui/calendarUserList/loaded', [newObj, null]);
                        self._grid.update();
                    }


                });

                //Disable column sorting for color legend column
                self._grid.canSort = function (col) {
                    if (Math.abs(col) == 2) { return false; } else { return true; }
                };
                if (this._userOptions["rememberusers"]) {
                    this._loadCalendarUserListOptions();
                } else {
                    var data = {};
                    data["value"] = null;
                    this._receivedCalendarUserListOptions(data);
                }

            },
            _loadCalendarUserListOptions: function () {
                var optionsSvc = Sage.Services.getService('UserOptions');
                if (optionsSvc) {
                    optionsSvc.get('CalendarUsers', 'Calendar', this._receivedCalendarUserListOptions, null, this);
                }
            },
            _receivedCalendarUserListOptions: function (data) {
                if (data != null) {
                    if (data) {
                        var userListOption = data['value'];
                        //By Default, the current user will be added to the list with default color set to "user1"
                        var currentUserId = sUtility.getClientContextByKey('userID');
                        currentUserId = dojoLang.trim(currentUserId);
                        if (userListOption == null || userListOption == "") {
                            userListOption = currentUserId + "|" + "user1";
                        } else if (userListOption.indexOf(currentUserId) < 0) {
                            userListOption += "," + currentUserId + "|" + "user1";
                        }
                        dojo.cookie('selectedCalendarUsers', userListOption);
                        this._setSelectedUsers(userListOption);
                    }
                }
                if (this._selectedUsers) {
                    this._grid.startup();
                }
            },
            _saveUserOption: function (value) {
                var optionsSvc = Sage.Services.getService('UserOptions');
                if (optionsSvc) {
                    var userIds = "";
                    if (this._selectedUsers) {
                        for (var i in this._selectedUsers) {
                            if (userIds != "") userIds += ",";
                            userIds += dojoLang.trim(this._selectedUsers[i]["userId"].toString());
                            userIds += "|";
                            if (this._selectedUsers[i]["usercolor"])
                                userIds += this._selectedUsers[i]["usercolor"].toString();
                        }
                    }
                    optionsSvc.set('CalendarUsers', 'Calendar', userIds, null, null, this);

                }
            },
            _setSelectedUsers: function (userListOption) {
                if (userListOption != null) {
                    var userOptions = userListOption.split(",");
                    var userItem;
                    var userId, userColor;
                    for (var i = 0; i < userOptions.length; i++) {
                        userItem = userOptions[i];
                        if (userItem) {
                            userId = userItem.split("|")[0];
                            userColor = userItem.split("|")[1];

                            if (!userColor) {
                                for (var j = 0; j < this._colors.length; j++) {
                                    if (!this._colors[j]['set']) {
                                        userColor = this._colors[j]['usercolor'];
                                        this._colors[j]['set'] = true;
                                        break;
                                    }
                                }
                            } else {
                                for (var k = 0; k < this._colors.length; k++) {
                                    if (this._colors[k]['usercolor'] === userColor) {
                                        this._colors[k]['set'] = true;
                                        break;
                                    }
                                }
                            }
                            var userObj = {};
                            userObj["userId"] = userId;
                            userObj["usercolor"] = userColor;
                            this._selectedUsers[userId] = userObj;
                        }

                    }

                }
            }
        });
        return calendarUsersListPane;
    });

