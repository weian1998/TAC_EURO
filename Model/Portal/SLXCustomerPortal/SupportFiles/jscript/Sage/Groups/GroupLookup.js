/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/_Widget',
        'Sage/_Templated',
        'dijit/Dialog',
        'Sage/UI/ConditionManager',
        'Sage/Data/SDataServiceRegistry',
        'Sage/Groups/GroupContextService',
        'dojo/_base/lang',
        'dojo/_base/declare',
        'Sage/UI/Controls/_DialogHelpIconMixin',
        'dojo/_base/array',
        'dojo/topic',
        'dojo/aspect',
        'Sage/Data/GroupLayoutSingleton'
    ],
function (
        _Widget,
        _Templated,
        Dialog,
        ConditionManager,
        sDataServiceRegistry,
        GroupContextService,
        lang,
        declare,
        _DialogHelpIconMixin,
        array,
        topic,
        aspect,
        GroupLayoutSingleton
    ) {
    var lookupDialog = declare('Sage.Groups.GroupLookupDialog', [_Widget, _Templated], {
        widgetsInTemplate: true,
        conditionMgr: false,
        title: '',
        widgetTemplate: new Simplate([
            '<div>',
                '<div data-dojo-type="dijit.Dialog" id="groupLookupDialog" title="&nbsp;" dojoAttachPoint="dlg" >',
                '</div>',
            '</div>'
        ]),
        constructor: function (o) {
        },
        show: function () {
            if (this.conditionMgr) {
                var userOptions = Sage.Services.getService('UserOptions');
                if (userOptions){
                    userOptions.get('defaultLookupCondition', 'DefaultLookupCondition', lang.hitch(this, function(option){
                        this.conditionMgr.setFirstConditionValue('', option.value, '');
                    }));
                }
                
                // mixin help icon
                lang.mixin(this.dlg, new _DialogHelpIconMixin());
                this.dlg.createHelpIconByTopic('lookup');
                
                this.dlg.show();
            }
        },
        hide: function () {
            this.dlg.hide();
        },
        _setConditionMgrAttr: function (conditionMgr) {
            this.conditionMgr = conditionMgr;
            dojo.place(this.conditionMgr.domNode, this.dlg.containerNode, 'only');
        },
        _setTitleAttr: function (title) {
            this.title = title;
            this.dlg.set('title', title);
        }
    });

    var groupLookup = declare('Sage.Groups.GroupLookup', null, {
        conditions: [],
        _layouts: {},
        _currentLayoutFamily: false,
        service: false,
        _dlgWindow: false,
        _conditionMgr: false,
        _doSearchConnection: false,
        _onSearchNavTo: false,
        id: 'GroupLookup',
        constructor: function () {
            this.isInitialized = false;
        },
        //public API
        //show the lookup dialog
        showLookup: function (opts) {
            if (typeof opts === 'undefined') {
                var cSvc = Sage.Services.getService("ClientGroupContext");
                this._currentLayoutFamily = cSvc.getContext().CurrentFamily;
                opts = { family: this._currentLayoutFamily };
            }
            this._onSearchNavTo = (opts.returnTo) ? opts.returnTo : false;
            if (!this._layouts.hasOwnProperty(opts.family)) {
                this._currentLayoutFamily = opts.family;
                //get the layout for this family...
                this._requestLayout({
                    family: opts.family,
                    success: this._showInitializedLookup
                });
                return;
            }
            
            if (this._currentLayoutFamily !== opts.family) {
                this._currentLayoutFamily = opts.family;
            }
            
            this._resetConditionManager();
            this._showInitializedLookup();
        },
        _showInitializedLookup: function () {
            var svc = Sage.Services.getService('ClientEntityContext'),
                context = svc && svc.getContext(),
                displayName = context && context.DisplayName,
                tableNameFromContext = context && context.EntityTableName,
                tableNameFromLayout = this._layouts[this._currentLayoutFamily]['mainTable'],
                entityName = this._layouts[this._currentLayoutFamily]['entityName'];
                
            if (!this._dlgWindow) {
                this._dlgWindow = new lookupDialog({ conditionMgr: this._conditionMgr });
            }
            if (!this._dlgWindow.conditionMgr) {
                this._dlgWindow.set('conditionMgr', this._conditionMgr);
            }

            if (tableNameFromContext !== tableNameFromLayout) {
                displayName = entityName;
            }
            
            this._dlgWindow.set('title', displayName);
            this._dlgWindow.show();
        },
        //connected to the Search button click handler for lookup dialog
        doLookup: function (args) {
            this._ensureService();
            this._dlgWindow.hide();
            var request = new Sage.SData.Client.SDataServiceOperationRequest(this.service);
            request.setOperationName('setGroupLookupConditions');
            request.execute({
                request: {
                    family: this._currentLayoutFamily,
                    conditions: this.getConditionsString(),
                    includeConditionsFrom: ''  // can put another group ID here to include conditions from that group...
                }
            }, {
                success: function (response) {
                    var navTo = this._onSearchNavTo + "?modeid=list&gid=LOOKUPRESULTS",
                        path = document.location.toString().toLowerCase(),
                        comp = this._onSearchNavTo && this._onSearchNavTo.toLowerCase();
                    
                    var grpCtxService = Sage.Services.getService('ClientGroupContext');
                    var context = grpCtxService.getContext();
                    if (context.CurrentFamily === this._currentLayoutFamily) {
                        aspect.after(grpCtxService, 'onCurrentGroupChanged', lang.hitch(this, function() {
                            topic.publish("/group/lookup/success", { 'conditions': this.getConditionsString() });
                        }));

                        grpCtxService.setCurrentGroup('LOOKUPRESULTS');
                    }

                    if (this._onSearchNavTo) {
                        if (path.indexOf(comp) === -1) {
                            document.location = navTo;
                            return;
                        }
                    }
                },
                scope: this
            });
        },
        // do we need this?
        resetLookup: function (data) {

        },
        //returns json string of the "conditions"
        getConditionsString: function () {
            return this._conditionMgr.getConditionsJSON();
        },
        _ensureService: function () {
            if (!this.service) {
                this.service = sDataServiceRegistry.getSDataService('system');
            }
        },
        //'private' internal helper methods
        _requestLayout: function (options) {
            this._ensureService();
            if (!options.family) {
                var grpContextSvc = Sage.Services.getService('ClientGroupContext');
                options[family] = grpContextSvc.getContext().CurrentFamily || 'ACCOUNT';
            }
            var predicate = dojo.string.substitute('name eq \'Lookup Results\' and upper(family) eq \'${0}\'', [options.family.toUpperCase()]),
                onSuccess = lang.hitch(this, this._onReadSuccess, options),
                singleton = new GroupLayoutSingleton();
            singleton.getGroupLayout(predicate, onSuccess, null, 'LOOKUPRESULTS'); 
        },
        _onReadSuccess: function (options, data) {
            this._layouts[options.family] = data;
            this._currentLayoutFamily = options.family;
            this._resetConditionManager();

            if (typeof options.success === 'function') {
                options.success.call(options.scope || this, data);
            }
        },
        _resetConditionManager: function () {
            if (!this._currentLayoutFamily) {
                return;
            }
            
            if (this._conditionMgr) {
                this._conditionMgr.destroy(false);
                this._conditionMgr = null;
            }
            
            var fields = array.filter(this._layouts[this._currentLayoutFamily]['layout'], function (field) {
                return field.caption && field.caption !== '' && field.visible;
            });
            
            // The format field is used by the condition manager to determine the type.
            // If it is set to None, attempt to use the fieldType property instead.
            // Unfortunately we can't switch to fieldType for User/DateTime, etc.
            fields = array.map(fields, function(field) {
                if (field.format && field.format === 'None') {
                    field.format = field.fieldType;
                }
                
                return field;
            });
            
            this._conditionMgr = new ConditionManager({
                fields: fields,
                fieldNameProperty: 'alias',
                fieldDisplayNameProperty: 'caption', // 'displayName',
                fieldTypeProperty: 'format',
                id: this.id + '-ConditionManager'
            });
            
            if (this._dlgWindow) {
                this._dlgWindow.set('conditionMgr', this._conditionMgr);
            }
            
            this._doSearchConnection = dojo.connect(this._conditionMgr, "onDoSearch", this, "doLookup");
        },
        destroy: function () {
            if (this._doSearchConnection) {
                dojo.disconnect(this._doSearchConnection);
                this._doSearchConnection = false;
            }
            this.inherited(arguments);
        }
    });

    Sage.Services.addService('GroupLookupManager', new Sage.Groups.GroupLookup());
    return groupLookup;
});