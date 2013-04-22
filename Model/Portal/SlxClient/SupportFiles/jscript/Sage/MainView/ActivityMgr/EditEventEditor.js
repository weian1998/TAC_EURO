/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */

define([
    'dijit/_Widget',
    'Sage/_Templated',
    'dijit/Toolbar',
    'dijit/layout/TabContainer',
    'dijit/layout/ContentPane',
    'dijit/form/Textarea',
    'dijit/form/ComboBox',
    'Sage/UI/TextBox',
    'Sage/UI/Controls/DateTimePicker',
    'Sage/UI/SDataLookup',
    'dojox/layout/TableContainer',
    'Sage/Data/SingleEntrySDataStore',
    'Sage/MainView/BindingsManager',
    'dijit/Dialog',
    'Sage/UI/Dialogs',
    'Sage/Utility',
    'Sage/Data/SDataServiceRegistry',
    'Sage/UI/Controls/_DialogHelpIconMixin',
    'dojo/_base/lang',
    'dojo/_base/declare',
    'dojo/i18n!./nls/EditEventEditor',
    'dijit/focus',
    'dojo/_base/lang'
],

function (
    _Widget,
    _Templated,
    Toolbar,
    TabContainer,
    ContentPane,
    Textarea,
    ComboBox,
    TextBox,
    DateTimePicker,
    SDataLookup,
    TableContainer,
    SingleEntrySDataStore,
    BindingsManager,
    Dialog,
    sageDialogs,
    utility,
    sDataServiceRegistry,
    _DialogHelpIconMixin,
    dojoLang,
    declare,
    eventEditorStrings,
    focusUtil,
    lang
) {

    var editEventEditor = declare('Sage.MainView.ActivityMgr.EditEventEditor', [_Widget, _Templated], {
        eventId: null,
        mode: false,
        _dialog: false,
        _currentUserId: null,
        _eventService: false,
        _eventData: false,
        _eventStore: false,
        _bindingMgr: false,
        _eventChangeConnection: false,
        lup_User: false,
        eventDefaultValues: {},
        eventConnections: [],
        widgetsInTemplate: true,

        widgetTemplate: new Simplate([
            '<div>', //root
                '<div data-dojo-type="dijit.Dialog" id="eventDialog" title="" dojoAttachPoint="_dialog" >', //dialog
                    '<div class="event-dialog">', //body
                     '<div data-dojo-type="dijit.layout.ContentPane" id="{%= $.id%}_cp_event" title="" dojoAttachPoint="cp_Event" class="tabContent">',
                        '<div data-dojo-type="dojox.layout.TableContainer" orientation="horiz" cols="1" labelWidth="140">',
                              '<div data-dojo-type="Sage.UI.Controls.DateTimePicker" shouldPublishMarkDirty="false" label="{%= $.lblStartDateText %}" id="{%= $.id%}_tb_StartDate" name="tb_StartDateName" dojoAttachPoint="tb_StartDate" displayDate="true" displayTime="false"  ></div>',
                              '<div data-dojo-type="Sage.UI.Controls.DateTimePicker" shouldPublishMarkDirty="false" label="{%= $.lblEndDateText %}" id="{%= $.id%}_tb_EndDate" name="tb_EndDateName" dojoAttachPoint="tb_EndDate" displayDate="true" displayTime="false" ></div>',
                              '<select  dojoAttachPoint="tb_DayType" data-dojo-type="dijit.form.ComboBox" required="false" name="tb_DayType"  label="{%= $.lblDayTypeText %}" id="{%= $.id%}_tb_DayType" >',
                                  '<option value="Active" >{%=$.eventTypeActiveText %}</option>',
                                  '<option value="Business Trip" >{%=$.eventTypeBusinessTripText %}</option>',
                                  '<option value="Conference" >{%=$.eventTypeConferenceText%}</option>',
                                  '<option value="Holiday" selected="selected" >{%=$.eventTypeHolidayText%}</option>',
                                  '<option value="Off" >{%=$.eventTypeOffText%}</option>',
                                  '<option value="Trade Show" >{%=$.eventTypeTradeShowText%}</option>',
                                  '<option value="Unavailable" >{%=$.eventTypeUnavailableText%}</option>',
                                  '<option value="Vacation" >{%=$.eventTypeVacationText%}</option>',
                               '</select>',
                               '<input data-dojo-type="dijit.form.TextBox" id="{%= $.id %}_tb_Location" label="{%= $.lblLocationText %}" dojoAttachPoint="tb_Location" maxLength="255" />',
                               '<textarea data-dojo-type="dijit.form.SimpleTextarea" label="{%= $.lblDescriptionText %}" id="{%= $.id%}_tb_Description" name="tb_Description" dojoAttachPoint="tb_Description" rows="4" cols="1"  maxLength="128"  ></textarea>',
                               '<div class="event-dialog remove-padding">',
                               '<div dojoType="dijit.layout.ContentPane" label="{%= $.lblUserText %}" dojoAttachPoint="container_UserLup" class="remove-padding lookup-container"></div>',
                                '</div>',
                           '</div>',
                      '</div>',
                       '<div class="button-bar alignright">',
                          '<div data-dojo-type="dijit.form.Button"  id="{%= $.id%}_btn_OK" name="btn_OK" dojoAttachPoint="btn_OK" dojoAttachEvent="onClick:_okClick">{%= $.btnOkayText %}</div>',
                          '<div data-dojo-type="dijit.form.Button"  id="{%= $.id%}_btn_Cancel" name="btn_Cancel" dojoAttachPoint="btn_Cancel" dojoAttachEvent="onClick:_cancelClick">{%= $. btnCancelText %}</div>',
                       '</div>',
                  '</div>', //body                     
                '</div>',  //dialog        
           '</div>' //root                       
        ]),
        constructor: function () {
            dojo.mixin(this, eventEditorStrings);
            this._eventService = sDataServiceRegistry.getSDataService('dynamic');
            this._setEventStore();
            this._currentUserId = utility.getClientContextByKey('userID') || '';
        },
        //postMixInProperties: function() {
        //    this.inherited(arguments); 
        //},
        //startup: function(){
        //    this.inherited(arguments);
        //    this._loadData();             

        //},
        destroy: function () {

            if (this._eventChangeConnection) {
                dojo.disconnect(this._eventChangeConnection);
                this._eventChangeConnection = false;
            }
            if (this._bindingMgr) {
                this._bindingMgr.destroy();
            }
            if (this.lup_User) {
                this.lup_User.destroy();
            }
            this.inherited(arguments);
        },
        show: function (mixinProperties) {
            if (!this.lup_User) {
                this._createUserLookup();
            }

            if (this.mode === 'New') {
                this._dialog.set('title', this.titleScheduleText);
            }
            else {
                this._dialog.set('title', this.titleEditText);
            }
            this.eventDefaultValues = mixinProperties || {};
            this._loadData();
            this._dialog.set('refocus', false);
            this._dialog.show();
            // Create help icon
            if (!this._dialog.helpIcon) {
                dojoLang.mixin(this._dialog, new _DialogHelpIconMixin());
                this._dialog.createHelpIconByTopic('addevent');
            }
        },
        hide: function () {
            this._dialog.hide();
        },
        resize: function () {

        },

        _setModeAttr: function (mode) {
            this.mode = mode;
            if (mode.indexOf('New') === 0) {
                this.mode = 'New';
                this._eventData = false;
                //this._loadData();
            }
        },
        _setEventIdAttr: function (eventId) {
            if (this.eventId !== eventId) {
                this.eventId = eventId;
                this._eventData = false;
                //this._loadData();
            }
        },
        _getEventIdAttr: function () {
            return this.eventId;
        },

        _setEventStore: function () {
            if (!this._eventStore) {
                this._eventStore = new SingleEntrySDataStore({
                    include: [],
                    select: ['StartDate', 'EndDate', 'Description', 'Type', 'Location', 'UserId'],
                    resourceKind: 'events',
                    service: this._eventService
                });
            }
        },

        onChange: function (/* control */control,
        /*attribute-name-string*/attribute,
        /*object | array*/oldValue,
        /*object | array*/newValue) {

        },
        setMode: function (mode) {
            this._mode = mode;
        },

        _loadData: function () {
            this._eventData = false;
            if (this._eventStore) {
                if (this.mode !== 'New') {
                    this._eventStore.fetch({
                        predicate: "'" + this.eventId + "'",
                        onComplete: this._receivedEvent,
                        onError: this._requestFailure,
                        scope: this
                    });
                } else {
                    this._eventStore.newItem({
                        onComplete: function (event) {
                            utility.setValue(event, 'UserId', this._currentUserId);
                            this._receivedEvent(event);
                        },
                        scope: this
                    });
                }
            }
        },

        _receivedEvent: function (event) {
            if (this.mode === 'New') {
                this._eventData = (dojo.mixin(event, this.eventDefaultValues));
            }
            else {
                this._eventData = event;
            }
            this._bind();
        },
        _requestFailure: function (msg, request, opts) {
            console.warn('error requesting data');
        },
        _bind: function () {

            if (this._eventData) {
                if (!this._bindingMgr) {
                    this._bindingMgr = new BindingsManager({
                        defaultBinding: { boundEntity: this._eventData },
                        items: [{
                            boundWidget: this.tb_StartDate,
                            entityProperty: 'StartDate',
                            dataType: 'date'
                        }, {
                            boundWidget: this.tb_EndDate,
                            entityProperty: 'EndDate',
                            dataType: 'date'
                        }, {
                            boundWidget: this.tb_DayType,
                            entityProperty: 'Type'
                        }, {
                            boundWidget: this.tb_Description,
                            entityProperty: 'Description'
                        }, {
                            boundWidget: this.tb_Location,
                            entityProperty: 'Location'
                        }]
                    });

                    this._eventChangeConnection = dojo.connect(this._bindingMgr, 'onChange', this, 'onChange');
                } else {
                    if (!this._bindingMgr.boundEntity || (this._eventData['$key'] !== this._bindingMgr.boundEntity['$key'])) {
                        this._bindingMgr.setBoundEntity(this._eventData);
                    } else {
                        this._bindingMgr.bind();
                    }
                }
                this._bindUserLookup();
            }
        },
        _bindUserLookup: function () {
            if (this._eventData.UserId) {
                if (this._eventData.UserId === this._currentUserId) {
                    var mockUser = {
                        '$key': this._currentUserId,
                        '$descriptor': utility.getClientContextByKey('userPrettyName')
                    };
                    this.lup_User.set('selectedObject', mockUser);
                } else {
                    this._getUserInfoFor(this._eventData.UserId, function (user) {
                        this.lup_User.set('selectedObject', user);
                    });
                }
            } else {
                this.lup_User.set('selectedObject', null);
            }
        },
        _getUserInfoFor: function (userId, callback) {
            var request = new Sage.SData.Client.SDataSingleResourceRequest(sDataServiceRegistry.getSDataService('dynamic', false, true, true)); //go ahead and cache this...
            request.setResourceKind('userInfo');
            request.setResourceSelector("'" + userId + "'");
            //using precedence of 0 we only get $descriptor which is <lastname, firstname>, 
            //...but do we want the UserName property which is <firstname lastname>???
            request.setQueryArg('precedence', '0');
            request.read({
                success: callback,
                scope: this,
                failure: function () { }
            });
        },
        _createUserLookup: function () {
            var userLookupConfig = {
                id: '_eventUser',
                structure: [
                    {
                        cells:
                            [
                                {
                                    name: this.nameText,
                                    field: 'Name',
                                    sortable: true,
                                    width: "400px",
                                    editable: false,
                                    propertyType: "System.String",
                                    excludeFromFilters: false,
                                    defaultValue: ""
                                }
                            ]
                    }
                ],
                gridOptions: {
                    contextualCondition: function () {
                        return 'AllowAdd AND (AccessId eq \'' + utility.getClientContextByKey('userID') + '\' OR AccessId eq \'EVERYONE\') AND Type eq \'User\'';
                    },
                    contextualShow: '',
                    selectionMode: 'single'
                },
                storeOptions: {
                    resourceKind: 'activityresourceviews',
                    sort: [{ attribute: 'Name'}]
                },
                isModal: true,
                preFilters: [],
                returnPrimaryKey: true,
                dialogTitle: this.lookupUserText,
                dialogButtonText: this.btnOkayText
            };
            this.lup_User = new Sage.UI.Controls.Lookup({
                id: 'event_lu_user',
                config: userLookupConfig
            });
            this.eventConnections.push(dojo.connect(this.lup_User, 'onChange', this, '_userChanged'));
            dojo.place(this.lup_User.domNode, this.container_UserLup.domNode, 'only');
        },
        _userChanged: function (newUser) {
            utility.setValue(this._eventData, 'UserId', (newUser) ? newUser['$key'].substr(0, 12) : '');
        },
        datesValid: function () {
            var startDate = this.tb_StartDate.value;
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0,0);
            var endDate = this.tb_EndDate.value;
            endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0);
            if (startDate > endDate) {
                sageDialogs.showError(this.invaildDatesText);
                return false;
            }
            return true;
        },
        // ... region click/action handlers
        _okClick: function () {
            var activeElement = focusUtil.curNode;
            if(activeElement){
                activeElement.blur();
            }
            // IE8 has an issue where the value is saved before the blur realizes the value has changed
            //  and setting a timeout of 1 is enough for the change to be seen after the blur
            setTimeout(lang.hitch(this, function() {
            if (!this.datesValid()) {
                return;
            }

            if (this.mode === 'New') {
                this._eventStore.saveNewEntity(this._eventData, this._successEventCreated, this._failedEventCreated, this);
            }
            else {
                this._eventStore.save({
                    scope: this,
                    success: this._successEventUpdated,
                    failure: this._failedEventUpdated
                });
            }
            }), 1);
        },
        _cancelClick: function () {
            this.hide();
        },

        _successEventCreated: function (event) {
            dojo.publish('/entity/event/create', [event, this]);
            //dojo.publish('/entity/event/change', [event, this]);
            this.hide();
        },

        _failedEventCreated: function (request) {

            console.log('an error occured saving event %o', request);
            sageDialogs.showError(this.errorText);

        },
        _successEventUpdated: function (event) {

            dojo.publish('/entity/event/change', [event, this]);
            this.hide();
        },

        _failedEventUpdated: function (request) {
            console.log('an error occured saving event %o', request);
            sageDialogs.showError(this.errorText);
        }
        // ... endregion      

    });
    return editEventEditor;
});
