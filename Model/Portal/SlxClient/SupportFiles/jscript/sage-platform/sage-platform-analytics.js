/*global Sage Ext ConvertToPhpDateTimeFormat getContextByKey window*/
Sage.Analytics = {
    //our colors
    colorPalette: {
        'blue 0': 'dfe8f6', //widget bg color. will not be returned in getColors()
        'blue 6': '00a1de',
        'green 3': 'c1d59f',
        'pink 5': 'a44e81',
        'orange 2': 'f8d6aa',
        'blue 4': '55c0e9',
        'green 6': '69923a',
        'pink 2': 'e2afcd',
        'orange 7': 'af6200',
        'blue 3': '80d0ef',
        'green 8': '35491d',
        'pink 4': 'c55e9b',
        'orange 3': 'f4c180',
        'blue 7': '0079a7',
        'green 5': '86a85c',
        'pink 8': '421f34',
        'orange 6': 'e98300',
        'blue 2': 'aae0f4',
        'green 7': '4f6e2c',
        'pink 3': 'd486b4',
        'orange 8': '754200',
        'blue 5': '2bb1e4',
        'green 2': 'd6e3bf',
        'pink 6': '833f67',
        'orange 5': 'ed982b',
        'blue 8': '00516f',
        'green 4': 'a4bf7d',
        'pink 7': '632f4e',
        'orange 4': 'f0ac55'
    },

    //method used by individual widgets display() methods
    //to dictate differential inheritance
    //@param base is the base type used for the new object
    createObject: function (base) {
        var O = function () { };
        O.prototype = base;
        return new O();
    },
    now: function () {
        var minutes, value = new Date(),
        renderer = Ext.util.Format.dateRenderer(ConvertToPhpDateTimeFormat(getContextByKey('userDateFmtStr') +
            " " + getContextByKey('userTimeFmtStr')));
        return renderer(value);
    },
    //create a function to return an array object
    //populated with the color items in our palette
    //@param num is the number of colors you want back (in an array)
    getColors: function (num) {

        if (!num) { return; }

        var lookupLg = ['blue 6', 'green 3', 'pink 5', 'orange 2', 'blue 4', 'green 6',
            'pink 2', 'orange 7', 'blue 3', 'green 8', 'pink 4', 'orange 3',
            'blue 7', 'green 5', 'pink 8', 'orange 6', 'blue 2', 'green 7',
            'pink 3', 'orange 8', 'blue 5', 'green 2', 'pink 6', 'orange 5',
            'blue 8', 'green 4', 'pink 7', 'orange 4'],

        lookupSm = ['green 5', 'blue 3', 'green 7', 'blue 6',
            'green 3', 'blue 7'],
        ret = [], i, j;

        //the palette for num <= 6 is different than a larger set.
        if (num <= 6) {
            for (i = 0; i < num; i++) {
                ret[i] = Sage.Analytics.colorPalette[lookupSm[i]];
            }
        }
        else {
            for (j = 0; j < num; j++) {
                ret[j] = Sage.Analytics.colorPalette[lookupLg[j]];
            }
        }
        return ret;
    },

    //looping template functions need to get a single color at a time
    //by passing in an Int
    //@param idx the index passed in by the looping function
    getColor: function (idx) {
        var lookup = ['blue 6', 'green 3', 'pink 5', 'orange 2', 'blue 4', 'green 6',
            'pink 2', 'orange 7', 'blue 3', 'green 8', 'pink 4', 'orange 3',
            'blue 7', 'green 5', 'pink 8', 'orange 6', 'blue 2', 'green 7',
            'pink 3', 'orange 8', 'blue 5', 'green 2', 'pink 6', 'orange 5',
            'blue 8', 'green 4', 'pink 7', 'orange 4'];
        return Sage.Analytics.colorPalette[lookup[idx]];
    },
    //an incremental counter used by generateString()
    counter: 1,
    //so that dynamically generated elements can get a 
    //unique number appended to their name, ie 'wgt1', 'wgt2'...
    //@param str a string passed in to which a number will be appended
    generateString: function (str) {
        return str + Sage.Analytics.counter++;
    },
    //objects methods will return various repetitive html/javascript elements
    //for our widget types
    markup: {
        //@param ttl is the title for the editor window
        //@param editorFields is an object containing the fields on the editor
        //@param scope is 'this' from the editor's perspective
        //@param ok is an optional callback function for custom fields
        //to fire when the OK button is pressed
        //@param urls is an object containing urls for data call
        //any/all of these will be in the init object
        editorWindow: function (init) {
            var $items = [], prop, cust,
            //hoist the most referred to...
            editorFields = init.editorFields,
            urls = init.urls,
            scope = init.scope;
            //generate the markup for the items array
            for (prop in editorFields) {
                if (editorFields.hasOwnProperty(prop)) {
                    switch (prop) {
                        case 'entityField':
                            //entityField requires a different signature
                            $items.push(this[prop](editorFields[prop], editorFields.groupField,
                                editorFields.dimensionField, editorFields.metricField,
                                urls.group, urls.dimension, urls.metric, scope));
                            break;
                        case 'customFields':
                            for (cust in editorFields.customFields) {
                                if (editorFields.customFields.hasOwnProperty(cust)) {
                                    // note scope not needed as callbacks defined in the widget
                                    $items.push(this.customField(editorFields.customFields[cust]));
                                }
                            }
                            break;
                        //radioNames should set disabled state of truncate fields   
                        case 'radioNames':
                            $items.push(this[prop](editorFields[prop], editorFields.radioTruncate,
                                editorFields.truncField, scope));
                            break;
                        case 'radioTruncate':
                            $items.push(this[prop](editorFields[prop],
                                editorFields.truncField, scope));
                            break;
                        default:
                            $items.push(this[prop](editorFields[prop], scope));
                    }
                }
            }
            //send the window back to editor()
            return new Ext.Window({
                id: scope.config.editorWindow,
                title: init.title,
                tools: [{
                    id: 'help',
                    handler: function () {
                        window.open(String.format(getContextByKey('WebHelpUrlFmt'), 'Using_Widgets'), 'MCWebHelp');
                    }
                }],
                width: init.width || 500,
                //IE8 is wrapping labels in ext 2.* radiogroups. This will adjust for that
                //until a better fix is found
                height: init.height || (function () {
                    return Ext.isIE8 ? 400 : 350;
                } ()),
                layout: init.layout || 'fit',
                closeAction: init.closeAction || 'close',
                items: new Ext.FormPanel({
                    labelAlign: init.labelAlign || 'left',
                    labelWidth: init.labelWidth || 125,
                    layout: 'form',
                    border: init.border || false,
                    style: init.style || 'padding:5px',
                    items: $items,
                    buttons: [{
                        text: 'OK',
                        handler: function () {
                            //if OK callback exists, call it and return
                            if (init.ok && typeof (init.ok) === 'function') {
                                return init.ok(scope);
                            }
                            //get references to the required fields
                            var win = Ext.getCmp(scope.config.editorWindow),
                            eField = Ext.getCmp(editorFields.entityField),
                            gField = Ext.getCmp(editorFields.groupField),
                            dField = Ext.getCmp(editorFields.dimensionField),
                            mField = Ext.getCmp(editorFields.metricField),
                            callWidget = Ext.getCmp(scope.config.panel), //return focus here
                            att, prop, uri = [], flag = true;
                            //set the flag if needed fields are blank
                            if (!eField.validate() || !gField.validate() ||
                                !dField.validate() || !mField.validate()) {
                                flag = false;
                            }
                            //get the input VALUE of present fields
                            if (editorFields.titleField) { scope.config.title = Ext.getCmp(editorFields.titleField).getValue(); }
                            if (editorFields.captionField) { scope.config.subtitle = Ext.getCmp(editorFields.captionField).getValue(); }
                            if (editorFields.xAxisField) { scope.config.xAxisName = Ext.getCmp(editorFields.xAxisField).getValue(); }
                            if (editorFields.yAxisField) { scope.config.yAxisName = Ext.getCmp(editorFields.yAxisField).getValue(); }
                            if (editorFields.goalField) { scope.config.goal = Ext.getCmp(editorFields.goalField).getValue(); }
                            if (editorFields.truncField) { scope.config.truncNum = Ext.getCmp(editorFields.truncField).getValue(); }

                            //assemble the url ['datasource'] to call for the data
                            uri.push('slxdata.ashx/slx/crm/-/analytics?');
                            if (scope.config.entity) { uri.push('entity=', scope.config.entity, '&'); }
                            if (scope.config.groupname) { uri.push('groupname=', scope.config.groupname, '&'); }
                            if (scope.config.dimension) { uri.push('dimension=', scope.config.dimension, '&'); }
                            if (scope.config.metric) { uri.push('metric=', scope.config.metric, '&'); }
                            if (scope.config.limit) { uri.push('limit=', scope.config.limit, '&'); }
                            //for pie...
                            if (scope.config.combineother === 'true') {
                                uri.push('combineother=true');
                            }
                            //check for user overrides here
                            for (prop in scope.definition.qsParams) {
                                if (scope.definition.qsParams.hasOwnProperty(prop)) {
                                    uri.push('&', prop, '=', scope.definition.qsParams[prop]);
                                }
                            }
                            //join the finished datasource
                            scope.config.datasource = uri.join('');
                            //call to init() for changes if required fields aren't blank
                            if (flag) {
                                //keep the _options object up to date for persisting
                                //the reverse of the setData for-in loop
                                for (att in scope.config) {
                                    //filter out unwanted...
                                    if (scope.config.hasOwnProperty(att)) {
                                        if (!scope.definition.filterList[att]) {
                                            scope._options[att] = scope.config[att];
                                        }
                                    }
                                }
                                scope.config.edited = true;
                                //save the page
                                scope.fireEvent('persist');
                                //redraw
                                scope.init();
                                //close the editor
                                win.close();
                                //return focus to the calling widget panel
                                callWidget.focus();
                            }
                            //when the if() is skipped the first offending field will be shown
                        },
                        scope: scope
                    },
                    {
                        text: 'Cancel',
                        handler: function () {
                            var win = Ext.getCmp(scope.config.editorWindow),
                            callWidget = Ext.getCmp(scope.config.panel);
                            win.close();
                            callWidget.focus();
                        }
                    }] //end buttons              
                })
            });
        },
        titleField: function (id, scope) {
            return {
                id: id,
                xtype: 'textfield',
                fieldLabel: Sage.Analytics.WidgetResource.lblTitle,
                anchor: '97%',
                listeners: {
                    'render': {
                        fn: function () {
                            //need a ref to the textfield
                            var txtField = Ext.getCmp(id);
                            //check if a title exists
                            if (scope.config.title) {
                                txtField.setRawValue(scope.config.title);
                            }
                        },
                        scope: scope
                    }
                }
            };
        }, //end titlefield
        //allow for user defined field types
        //@param obj is an object containing
        //setup info for the custom field being made
        customField: function (obj) {
            var ret = {}, prop;
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    ret[prop] = obj[prop];
                }
            }
            return ret;
        }, //end custom field
        entityField: function (id, gcid, dcid, mcid, groupListURL, dimensionURL, metricURL, scope) {
            return {
                id: id,
                xtype: 'combo',
                forceSelection: true,
                triggerAction: 'all',
                fieldLabel: Sage.Analytics.WidgetResource.lblEntity,
                anchor: '97%',
                allowBlank: false,
                emptyText: Sage.Analytics.WidgetResource.emptyEntity,
                store: new Ext.data.JsonStore({
                    autoLoad: true,
                    url: 'slxdata.ashx/slx/crm/-/groups/context/entityList?filter=analytics',
                    root: 'items',
                    totalProperty: 'total_count',
                    fields: ['fullName', 'displayName'],
                    listeners: {
                        'load': {
                            fn: function ($this, records, options) {
                                //is there data for entity here?
                                var ent, win = Ext.getCmp(scope.config.editorWindow),
                                //get a ref to the combo box
                                combo = Ext.getCmp(id),
                                //the @len var will save lookup time for large datasets 
                                len = records.length, i;
                                win.el.unmask();
                                ent = scope.config.entity;
                                if (ent) {
                                    //iterate over records[].data and locate entity k:v
                                    for (i = 0; i < len; i++) {
                                        if (records[i].data.fullName === ent) {
                                            //set the display name of the matching fullname
                                            combo.el.removeClass('x-form-empty-field');
                                            combo.setRawValue(records[i].data.displayName);
                                            combo.fireEvent('change', combo, ent);
                                        }
                                    }
                                }
                            },
                            scope: scope
                        }
                    }
                }),
                valueField: 'fullName',
                displayField: 'displayName',
                mode: 'local',
                listeners: {
                    'change': function (combo, newVal, oldVal) {
                        var entityName = newVal.replace("Sage.Entity.Interfaces.I", ""),
                        grpCombo = Ext.getCmp(gcid),
                        gstore = grpCombo.getStore(),
                        dimensionCombo = Ext.getCmp(dcid),
                        dstore = dimensionCombo.getStore(),
                        metricCombo = Ext.getCmp(mcid),
                        mstore = metricCombo.getStore();
                        gstore.proxy.conn.url = String.format(groupListURL, entityName);
                        gstore.load();
                        dstore.proxy.conn.url = String.format(dimensionURL, entityName);
                        dstore.load();
                        mstore.proxy.conn.url = String.format(metricURL, entityName);
                        mstore.load();
                    },
                    'select': {
                        fn: function (combo, record, index) {
                            var gCombo = Ext.getCmp(gcid),
                            dCombo = Ext.getCmp(dcid),
                            mCombo = Ext.getCmp(mcid);
                            scope.config.entity = record.get(combo.valueField);
                            gCombo.setValue('');
                            dCombo.setValue('');
                            mCombo.setValue('');
                        },
                        scope: scope
                    } //end select
                } //end ecid listeners
            };
        }, //end entityfield
        groupField: function (id, scope) {
            return {
                id: id,
                xtype: 'combo',
                forceSelection: true,
                triggerAction: 'all',
                fieldLabel: Sage.Analytics.WidgetResource.lblGroup,
                anchor: '97%',
                allowBlank: false,
                emptyText: Sage.Analytics.WidgetResource.emptyGroup,
                store: new Ext.data.JsonStore({
                    autoLoad: false,
                    url: 'slxdata.ashx/slx/crm/-/groups/context/grouplist/Account',
                    root: 'items',
                    totalProperty: 'total_count',
                    fields: ['groupId', 'groupName', 'displayName', 'isAdHoc'],
                    listeners: {
                        'load': {
                            fn: function ($this, records, options) {
                                //is there data for entity here?
                                var grp,
                                //get a ref to the combo box
                                combo = Ext.getCmp(id),
                                //the @len var will save lookup time for large datasets 
                                len = records.length, i;
                                grp = scope._options.groupname;
                                if (grp) {
                                    //iterate over records[].data and locate entity k:v
                                    for (i = 0; i < len; i++) {
                                        if (records[i].data.groupName === grp) {
                                            //set the display name of the matching fullname
                                            combo.el.removeClass('x-form-empty-field');
                                            combo.setRawValue(records[i].data.displayName);
                                            combo.fireEvent('change', combo, grp);
                                        }
                                    }
                                }
                            },
                            scope: scope
                        }
                    }
                }),
                valueField: 'groupName',
                displayField: 'displayName',
                mode: 'local',
                listeners: {
                    'select': {
                        fn: function (combo, record, index) {
                            //the VALUES will be stored not the display names
                            scope.config.groupname = record.get(combo.valueField);
                            scope.config.groupid = record.get('groupId');
                        },
                        scope: scope
                    }
                } //end listeners
            };
        }, //end groupfield
        dimensionField: function (id, scope) {
            return {
                id: id,
                xtype: 'tooltipcombo',
                forceSelection: true,
                triggerAction: 'all',
                fieldLabel: Sage.Analytics.WidgetResource.lblDimension,
                anchor: '97%',
                allowBlank: false,
                emptyText: Sage.Analytics.WidgetResource.emptyDimension,
                store: new Ext.data.JsonStore({
                    autoLoad: false,
                    url: 'slxdata.ashx/slx/crm/-/analytics/dimension/Opportunity',
                    root: 'items',
                    totalProperty: 'total_count',
                    fields: ['name', 'displayName', 'analyticsDescription'],
                    listeners: {
                        'load': {
                            fn: function ($this, records, options) {
                                //is there data for entity here?
                                var dim,
                                //get a ref to the combo box
                                combo = Ext.getCmp(id),
                                //the @len var will save lookup time for large datasets
                                len = records.length, i;
                                dim = scope._options.dimension;
                                if (dim) {
                                    //iterate over records[].data and locate entity k:v
                                    for (i = 0; i < len; i++) {
                                        if (records[i].data.name === dim) {
                                            //set the display name of the matching fullname
                                            combo.el.removeClass('x-form-empty-field');
                                            combo.setRawValue(records[i].data.displayName);
                                            combo.fireEvent('change', combo, dim);
                                        }
                                    }
                                }
                            },
                            scope: scope
                        }
                    }
                }),
                valueField: 'name',
                displayField: 'displayName',
                tooltipField: 'analyticsDescription',
                mode: 'local',
                tipDisplayMode: 'inline',
                listeners: {
                    'select': {
                        fn: function (combo, record, index) {
                            //the VALUES will be stored not the display names
                            scope.config.dimension = record.get(combo.valueField);
                        },
                        scope: scope
                    }
                }
            };
        }, //end dimensionField
        metricField: function (id, scope) {
            return {
                id: id,
                xtype: 'tooltipcombo',
                forceSelection: true,
                triggerAction: 'all',
                fieldLabel: Sage.Analytics.WidgetResource.lblMetric,
                anchor: '97%',
                allowBlank: false,
                emptyText: Sage.Analytics.WidgetResource.emptyMetric,
                store: new Ext.data.JsonStore({
                    autoLoad: false,
                    url: 'slxdata.ashx/slx/crm/-/analytics/metric/Opportunity',
                    root: 'items',
                    totalProperty: 'total_count',
                    fields: ['name', 'displayName', 'analyticsDescription'],
                    listeners: {
                        'load': {
                            fn: function ($this, records, options) {
                                //is there data for entity here?
                                var met,
                                //get a ref to the combo box
                                combo = Ext.getCmp(id),
                                //the @len var will save lookup time for large datasets 
                                len = records.length, i;
                                met = scope._options.metric;
                                if (met) {
                                    //iterate over records[].data and locate entity k:v
                                    for (i = 0; i < len; i++) {
                                        if (records[i].data.name === met) {
                                            //set the display name of the matching fullname
                                            combo.el.removeClass('x-form-empty-field');
                                            combo.setRawValue(records[i].data.displayName);
                                            combo.fireEvent('change', combo, met);
                                        }
                                    }
                                }
                            },
                            scope: scope
                        }
                    }
                }),
                valueField: 'name',
                displayField: 'displayName',
                tooltipField: 'analyticsDescription',
                mode: 'local',
                tipDisplayMode: 'inline',
                listeners: {
                    'select': {
                        fn: function (combo, record, index) {
                            //the VALUES will be stored not the display names
                            scope.config.metric = record.get(combo.valueField);
                        },
                        scope: scope
                    }
                }
            };
        }, //end metricfield
        captionField: function (id, scope) {
            return {
                id: id,
                xtype: 'textfield',
                fieldLabel: Sage.Analytics.WidgetResource.lblCaption,
                anchor: '97%',
                listeners: {
                    'render': {
                        fn: function () {
                            //need a ref to the textfield
                            var txtField = Ext.getCmp(id);
                            //check if a title exists
                            if (scope.config.subtitle) {
                                txtField.setRawValue(scope.config.subtitle);
                            }
                        },
                        scope: scope
                    }
                }
            };
        }, //end captionfield
        xAxisField: function (id, scope) {
            return {
                id: id,
                xtype: 'textfield',
                fieldLabel: Sage.Analytics.WidgetResource.lblXaxis,
                anchor: '97%',
                listeners: {
                    'render': {
                        fn: function () {
                            //need a ref to the textfield
                            var txtField = Ext.getCmp(id);
                            //check if a title exists
                            if (scope.config.xAxisName) {
                                txtField.setRawValue(scope.config.xAxisName);
                            }
                        },
                        scope: scope
                    }
                }
            };
        }, //end xAxis
        yAxisField: function (id, scope) {
            return {
                id: id,
                xtype: 'textfield',
                fieldLabel: Sage.Analytics.WidgetResource.lblYaxis,
                anchor: '97%',
                listeners: {
                    'render': {
                        fn: function () {
                            //need a ref to the textfield
                            var txtField = Ext.getCmp(id);
                            //check if a title exists
                            if (scope.config.yAxisName) {
                                txtField.setRawValue(scope.config.yAxisName);
                            }
                        },
                        scope: scope
                    }
                }
            };
        }, //end yaxis
        goalField: function (id, scope) {
            return {
                id: id,
                xtype: 'numberfield',
                fieldLabel: Sage.Analytics.WidgetResource.lblGoal,
                anchor: '97%',
                listeners: {
                    'render': {
                        fn: function () {
                            //need a ref to the textfield
                            var txtField = Ext.getCmp(id);
                            //check if a title exists
                            if (scope.config.goal) {
                                txtField.setRawValue(scope.config.goal);
                            }
                        }
                    },
                    scope: scope
                }
            };
        }, //end goalField
        truncField: function (id, scope) {
            return {
                id: id,
                xtype: 'numberfield',
                fieldLabel: Sage.Analytics.WidgetResource.lblMaxLength,
                anchor: '97%',
                listeners: {
                    'render': {
                        fn: function () {
                            //need a ref to the textfield
                            var txtField = Ext.getCmp(id);
                            //check if a title exists
                            if (scope.config.truncNum) {
                                txtField.setRawValue(scope.config.truncNum);
                            }
                        }
                    },
                    scope: scope
                }
            };
        }, //end goalField
        radioNames: function (id, rdo, txt, scope) {
            return {
                xtype: 'radiogroup',
                id: id,
                fieldLabel: Sage.Analytics.WidgetResource.lblNames,
                items: [
                    { boxLabel: Sage.Analytics.WidgetResource.yes, name: 'rdLabels', inputValue: 'true' },
                    { boxLabel: Sage.Analytics.WidgetResource.no, name: 'rdLabels', inputValue: 'false' }
                ],
                listeners: {
                    'change': {
                        fn: function ($this, checked, loaded) {
                            scope.config.showLabels = checked.inputValue;
                            var rdoTrunc = Ext.getCmp(rdo),
                            txtTrunc = Ext.getCmp(txt);
                            if (checked.inputValue === 'true') {
                                rdoTrunc.enable();
                                txtTrunc.enable();
                            } else {
                                rdoTrunc.disable();
                                txtTrunc.disable();
                            }
                        },
                        scope: scope
                    },
                    'render': {
                        fn: function () {
                            var rdoGroup = Ext.getCmp(id),
                            rdoTrunc = Ext.getCmp(rdo),
                            txtTrunc = Ext.getCmp(txt);
                            if (scope._options.showLabels === 'true') {
                                rdoGroup.setValue([true, false]);
                                if (rdoTrunc.disabled) { rdoTrunc.enable(); }
                                if (txtTrunc.disabled) { txtTrunc.enable(); }
                            }
                            else {
                                rdoGroup.setValue([false, true]);
                                if (!rdoTrunc.disabled) { rdoTrunc.disable(); }
                                if (!txtTrunc.disabled) { txtTrunc.disable(); }
                            }
                        },
                        scope: scope
                    }
                }
            };
        }, //end radioNames
        radioTruncate: function (id, txt, scope) {
            return {
                xtype: 'radiogroup',
                id: id,
                fieldLabel: Sage.Analytics.WidgetResource.lblTruncate,
                items: [
                    { boxLabel: Sage.Analytics.WidgetResource.yes, name: 'rdTrunc', inputValue: 'true' },
                    { boxLabel: Sage.Analytics.WidgetResource.no, name: 'rdTrunc', inputValue: 'false' }
                ],
                listeners: {
                    'change': {
                        fn: function ($this, checked, loaded) {
                            var txtTrunc = Ext.getCmp(txt);
                            scope.config.truncLabels = checked.inputValue;
                            if (checked.inputValue === 'true') {
                                txtTrunc.enable();
                            } else {
                                txtTrunc.disable();
                            }
                        },
                        scope: scope
                    },
                    'render': {
                        fn: function () {
                            var rdoGroup = Ext.getCmp(id),
                            txtTrunc = Ext.getCmp(txt);
                            if (scope._options.truncLabels === 'true') {
                                rdoGroup.setValue([true, false]);
                                txtTrunc.enable();
                            }
                            else {
                                rdoGroup.setValue([false, true]);
                                txtTrunc.disable();
                            }
                        },
                        scope: scope
                    }
                }
            };
        }, //end radioTrunc
        radioSlices: function (id, scope) {
            return {
                xtype: 'radiogroup',
                id: id,
                fieldLabel: Sage.Analytics.WidgetResource.lblSlices,
                items: [
                    { boxLabel: Sage.Analytics.WidgetResource.five, name: 'rdSlices', inputValue: '5' },
                    { boxLabel: Sage.Analytics.WidgetResource.ten, name: 'rdSlices', inputValue: '10' }
                ],
                listeners: {
                    'change': {
                        fn: function ($this, checked, loaded) {
                            scope.config.limit = checked.inputValue;
                        },
                        scope: scope
                    },
                    'render': {
                        fn: function () {
                            var rdoGroup = Ext.getCmp(id);
                            rdoGroup.setValue(scope._options.limit);
                        },
                        scope: scope
                    }
                } //end listeners
            };
        }, //end radioSlices
        radioOther: function (id, scope) {
            return {
                xtype: 'radiogroup',
                id: id,
                fieldLabel: Sage.Analytics.WidgetResource.lblOther,
                items: [
                    { boxLabel: Sage.Analytics.WidgetResource.yes, name: 'rdOther', inputValue: 'true' },
                    { boxLabel: Sage.Analytics.WidgetResource.no, name: 'rdOther', inputValue: 'false' }
                ],
                listeners: {
                    'change': {
                        fn: function ($this, checked, loaded) {
                            scope.config.combineother = checked.inputValue;
                        },
                        scope: scope
                    },
                    'render': {
                        fn: function () {
                            var rdoGroup = Ext.getCmp(id);
                            if (scope.config.combineother === 'true') {
                                rdoGroup.setValue([true, false]);
                            }
                            else {
                                rdoGroup.setValue([false, true]);
                            }
                        },
                        scope: scope
                    }
                } //end listeners
            };
        },
        radioLegend: function (id, scope) {
            return {
                xtype: 'radiogroup',
                id: id,
                fieldLabel: Sage.Analytics.WidgetResource.lblLegend,
                items: [
                    { boxLabel: Sage.Analytics.WidgetResource.yes, name: 'rdLegend', inputValue: 'true' },
                    { boxLabel: Sage.Analytics.WidgetResource.no, name: 'rdLegend', inputValue: 'false' }
                ],
                listeners: {
                    'change': {
                        fn: function ($this, checked, loaded) {
                            scope.config.showLegend = checked.inputValue;
                        },
                        scope: scope
                    },
                    'render': {
                        fn: function () {
                            var rdoGroup = Ext.getCmp(id);
                            if (scope.config.showLegend === 'true') {
                                rdoGroup.setValue([true, false]);
                            }
                            else {
                                rdoGroup.setValue([false, true]);
                            }
                        },
                        scope: scope
                    }
                } //end listeners
            };
        } //end radiolegend
    }, //end markup object
    //@param coll is either an array of strings or a single string
    //@param num is the max length desired for the string(s)
    //return it/them at max length with '...'
    truncate: function (val, num) {
        var i = 0, len = val.length, res = [];
        //num needs to be an int
        if (typeof num === 'string') {
            num = parseInt(num, 10);
        }
        //we might just be truncating a string, not an array of them
        if (typeof val === 'string') {
            //don't slice and append to strings smaller than num
            return val.length > num ? val.slice(0, num) + '...' : val;
        }
        //good browsers will provide higher-order functions (fast)
        if (val.map && typeof val.map === 'function') {
            //map calls the anon func with val[i], i, and val
            return val.map(function (v, i, c) {
                return v.length > num ? v.slice(0, num) + '...' : v;
            });
        }
        //fallback for IE
        else {
            for (i; i < len; i++) {
                res.push(val[i].slice(0, num) + '...');
            }
            return res;
        }
    }, //end truncate
    //return a localized value if it exists
    localize: function (val) {
        function keyify(key) {
            return key ? key.replace(/[^a-zA-Z0-9]/g, '_') : "";
        }
        return Sage.Analytics.WidgetResource[keyify(val)] ? Sage.Analytics.WidgetResource[keyify(val)] : val;
    }, //end localize
    //stored definitions of widgets 
    WidgetDefinitions: {}
};   //end Sage.Analytics
