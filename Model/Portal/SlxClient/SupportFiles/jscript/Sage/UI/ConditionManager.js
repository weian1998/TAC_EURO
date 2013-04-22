/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'Sage/_Templated',
       'dijit/_Widget',
       'dijit/form/Select',
       'dijit/form/Button',
       'Sage/UI/ImageButton',
       'Sage/UI/SearchConditionWidget',
       'Sage/Utility',
       'dojo/i18n!./nls/ConditionManager',
       'dojo/_base/declare'
],
function (_Templated, _Widget, select, button, imageButton, SearchConditionWidget, util, nls, declare) {
    //dojo.requireLocalization('Sage.UI', 'ConditionManager');

    var widget = declare('Sage.UI.ConditionManager', [_Widget, _Templated], {
        widgetsInTemplate: true,
        srchBtnCaption: 'Search',
        addrowlabel: 'Lookup by:',
        hiderowlabel: 'And:',

        hideimgurl: 'images/icons/Find_Remove_16x16.gif',
        addimgurl: 'images/icons/Find_Add_16x16.gif',
        hideimgalttext: 'Remove Condition',
        addimgalttext: 'Add Condition',
        errorOperatorRequiresValue: 'The operator requires a value',

        equalTo: 'Equal to',
        notEqualTo: 'Not Equal to',
        startingWith: 'Starting With',
        contains: 'Contains',
        equalOrLessThan: 'Equal or Less than',
        equalOrGreaterThan: 'Equal or Greater than',
        lessThan: 'Less than',
        greaterThan: 'Greater than',
        //end localize

        operators: null,
        fields: null,
        fieldsHash: null,
        fieldNameProperty: 'fieldname',
        fieldDisplayNameProperty: 'displayname',
        fieldTypeProperty: 'propertyType',
        fieldPickListNameProperty: 'pickListName',
        conditionWidgets: null,
        widgetConnects: null,
        widgetTemplate: new Simplate([
            '<div id="{%= $.id %}" class="lookup-condition-manager">',
                '<table cellspacing="0" cellpadding="3">',
                    '<tr><td><div dojoAttachPoint="conditions"></div></td></tr>', 
                '</table>',
                '<div class="lookup-condition-actions">',
                '<button id="{%= $.id %}-Search" data-dojo-type="dijit.form.Button" type="button" dojoAttachPoint="searchButton" dojoAttachEvent="onClick:_doSearch">{%= $.srchBtnCaption %}</button>',
                '</div>',
            '</div>']),
        isSettingValues: false,
        id: '',
        constructor: function() {
            this.conditionWidgets = {};
            this.operators = {};
            this.fieldsHash = {};
            this.fields = [];
            this.widgetConnects = [];
        },
        destroy: function() {
            var wid,
                i;
            
            for (i = 0; i < this.widgetConnects.length; i++) {
                dojo.disconnect(this.widgetConnects[i]);
            }
            
            for (wid in this.conditionWidgets) {
                if(this.conditionWidgets.hasOwnProperty(wid)) {
                    if (this.conditionWidgets[wid].destroy) {
                        this.conditionWidgets[wid].destroy();
                    }
                }
            }
            
            this.inherited(arguments);
        },
        postMixInProperties: function () {
            dojo.mixin(this, nls);
            this.inherited(arguments);
        },
        getOperatorsByField: function(field) {
            var boolOptions,
                stringLikeOptions,
                basicOptions,
                picklistControlOptions,
                operators;
                
            //build this after localization has been applied:
            //these are in the format of: dijit.form.__SelectOption 
            boolOptions = [
                { value: 'eq', label: this.equalTo, selected: false, disabled: false },
                { value: 'ne', label: this.notEqualTo, selected: false, diabled: false }   
            ];

            stringLikeOptions = [
                { value: 'sw', label: this.startingWith, selected: false, disabled: false },
                { value: 'like', label: this.contains, selected: false, diabled: false },
                { value: 'eq', label: this.equalTo, selected: false, diabled: false },
                { value: 'ne', label: this.notEqualTo, selected: false, diabled: false },
                { value: 'le', label: this.equalOrLessThan, selected: false, diabled: false },
                { value: 'ge', label: this.equalOrGreaterThan, selected: false, diabled: false },
                { value: 'lt', label: this.lessThan, selected: false, diabled: false },
                { value: 'gt', label: this.greaterThan, selected: false, diabled: false }
            ];

            basicOptions = [
                { value: 'eq', label: this.equalTo, selected: false, diabled: false },
                { value: 'ne', label: this.notEqualTo, selected: false, diabled: false },
                { value: 'le', label: this.equalOrLessThan, selected: false, diabled: false },
                { value: 'ge', label: this.equalOrGreaterThan, selected: false, diabled: false },
                { value: 'lt', label: this.lessThan, selected: false, diabled: false },
                { value: 'gt', label: this.greaterThan, selected: false, diabled: false }
            ];

            picklistControlOptions = [
                 { value: 'eq', label: this.equalTo, selected: false, diabled: false },
                 { value: 'ne', label: this.notEqualTo, selected: false, diabled: false }
            ];
            
            operators = {
                "System.Boolean": {
                    options: boolOptions 
                },
                "Boolean": {
                    options: boolOptions 
                },
                "System.String": { 
                    options: stringLikeOptions
                },
                "SalesLogix.PickList": {
                    options: picklistControlOptions
                },
                "Sage.Entity.Interfaces.UserType": {
                    options: basicOptions
                },
                "Sage.Entity.Interfaces.OwnerType": {
                    options : basicOptions
                },
                "System.DateTime": {
                    options: basicOptions
                },
                "DateTime": {
                    options: basicOptions
                },
                "Phone": {
                    options: stringLikeOptions
                },
                "User": {
                    options: stringLikeOptions
                },
                "Owner": {
                    options: stringLikeOptions
                },
                "System.Double": {
                    options: basicOptions 
                },
                "System.Int32": {
                    options: basicOptions 
                },
                "System.Int16": {
                    options: basicOptions 
                },
                "System.Decimal": {
                    options: basicOptions 
                },
                "Fixed": {
                    options: basicOptions 
                },
                "Decimal": {
                    options: basicOptions 
                },
                "Integer": {
                    options: basicOptions 
                },
                "Positive Integer": {
                    options: basicOptions 
                },
                "Currency": {
                    options: basicOptions 
                },
                "Percent": {
                    options: basicOptions 
                },
                "defaultOperators": {
                    options: stringLikeOptions 
                },
                "None": {
                    options: stringLikeOptions
                }
            };

            if ((field.hasOwnProperty(this.fieldTypeProperty)) && (operators.hasOwnProperty(field[this.fieldTypeProperty]))) {
                return operators[field[this.fieldTypeProperty]].options;
            }
            return operators.defaultOperators && operators.defaultOperators.options;
        },
        getConditionsAsUrlWhereString : function () {
            //console.log('ConditionManager :: getConditionsAsUrlWhereString');
            //manipulate conditions to match SData requirements for where URL parameter...
            var conds = this.getConditions(),
                condString = [],
                condVal = null,
                i,
                tempCondition,
                lhd, rhd, lhs, rhs,
                dateFormat;
                
            for (i = 0; i < conds.length; i++) {
                condVal = conds[i].val;
                if (typeof condVal === 'string') {
                    condVal = condVal.replace(/%/g, '');
                }

                if (condVal.constructor === Date){
                    // Handle equal to and not equal to as a special case.
                    // - They need to be in a range from start to end of date
                    if (conds[i].operator === 'eq' || conds[i].operator === 'ne') {
                        lhd = condVal;
                        rhd = condVal;
                        
                        lhd.setHours(0);
                        lhd.setMinutes(0);
                        lhd.setSeconds(0);
                        lhs = util.Convert.toIsoStringFromDate(lhd);
                        
                        rhd.setHours(23);
                        rhd.setMinutes(59);
                        rhd.setSeconds(59);
                        rhs = util.Convert.toIsoStringFromDate(rhd);
                        
                        // eq:(somedate > lhs and somedate < rhs)
                        // ne: (somedate < lhs or somedate > rhs)
                        dateFormat = {
                            field: conds[i].fieldname,
                            leftOp: 'gt', 
                            leftVal: lhs,
                            rightOp: 'lt', 
                            rightVal: rhs,
                            join: 'and'
                        };
                        
                        // Switch operators for not equal
                        if (conds[i].operator === 'ne') {
                            dateFormat.leftOp = 'lt';
                            dateFormat.rightOp = 'gt';
                            dateFormat.join = 'or';
                        }
                        
                        condString.push(dojo.string.substitute("(${field} ${leftOp} '${leftVal}' ${join} ${field} ${rightOp} '${rightVal}')", dateFormat));
                        continue;
                    } else if (conds[i].operator === 'le' || conds[i].operator === 'gt') {
                        /* less than/equal, greater than */
                        condVal.setHours(23);
                        condVal.setMinutes(59);
                        condVal.setSeconds(59);
                        
                    } else if (conds[i].operator === 'ge' || conds[i].operator === 'lt') {
                        /* greater than/equal, less than */
                        condVal.setHours(0);
                        condVal.setMinutes(0);
                        condVal.setSeconds(0);
                    }
                    
                    condVal = util.Convert.toIsoStringFromDate(condVal);
                }

                tempCondition = {
                    field: conds[i].fieldname,
                    op: conds[i].operator,
                    val: condVal
                };

                var fld = this.getField(conds[i].fieldname);
                if (fld && fld.propertyType === "SalesLogix.PickList") {
                    if (typeof condVal === "object" && condVal[0]) {
                        tempCondition.val = condVal[0];
                    }
                }
                
                if (tempCondition.op === 'like') {
                    tempCondition.val = ['%', tempCondition.val, '%'].join('');
                } else if (tempCondition.op === 'sw') {
                    tempCondition.op = 'like';
                    tempCondition.val += '%';
                }

                if (typeof tempCondition.val === 'string') {
                    tempCondition.val = ['"', tempCondition.val.toUpperCase(), '"'].join('');// wrap string in quotes
                    tempCondition.field = ['upper(', tempCondition.field, ')'].join('');// make search case insensitive
                }
                
                condString.push([tempCondition.field, ' ', tempCondition.op, ' ', tempCondition.val].join(''));
            }
            
            return condString.join(' and ');
        },
        getField: function (fieldName) {
            if (this.fieldsHash && this.fieldsHash.hasOwnProperty(fieldName)) {
                return this.fieldsHash[fieldName];
            }
            return false;
        },
        getConditionsJSON : function () {
            var i = 0,
                conditions = this.getConditions(),
                condVal,
                currentCondition;
            for (i = 0; i < conditions.length; i++) {
                currentCondition = conditions[i];
                condVal = conditions[i].val;
                if(condVal.constructor === Date) {
                    condVal = util.Convert.toIsoStringFromDate(condVal);
                }

                conditions[i].val = condVal;
            }

            return Sys.Serialization.JavaScriptSerializer.serialize(conditions);
        },
        getConditions : function () {
            var conds = [],
                wid,
                c;
            
            for (wid in this.conditionWidgets) {
                if(this.conditionWidgets.hasOwnProperty(wid)) {
                    if (this.conditionWidgets[wid].getCondition) {
                        c = this.conditionWidgets[wid].getCondition();
                        if (c) {
                            conds.push(c);
                        }
                    }
                }
            }
            
            return conds;
        },
        resetConditions: function() {
            var wid,
                i;
                
            for (i = 0; i < this.widgetConnects.length; i++) {
                dojo.disconnect(this.widgetConnects[i]);
            }
            for (wid in this.conditionWidgets) {
                if (this.conditionWidgets.hasOwnProperty(wid)) {
                    if (this.conditionWidgets[wid].getCondition) {
                        this._removeCondition(this.conditionWidgets[wid]);
                    }
                }
            }

            this._setInitialCondition();
        },
        _doSearch: function() {
            this.onDoSearch(this.getConditions());
        },
        _setFieldsAttr: function(fields) {
            var i;
            this.fields = fields;
            this.fieldsHash = {};
            for (i = 0; i < fields.length; i++) {
                this.fieldsHash[fields[i][this.fieldNameProperty]] = fields[i];
            }
            this.resetConditions();
        },
        setFirstConditionValue: function(field, op, value) {
            var prop,
                wid;
            for(prop in this.conditionWidgets) {
                if(this.conditionWidgets.hasOwnProperty(prop)) {
                    wid = this.conditionWidgets[prop];
                    if(wid.isFirstCondition) {
                        wid.defaultOperator = op;
                        wid.defaultField = field;
                        wid.defaultValue = value;
                        wid.refreshDefaults();
                    }
                }
            }
        },
        addCondition: function(field, op, value, visible) {
            var count = this._conditionCount(),
                newWid = new SearchConditionWidget({
                    conditionManager: this,
                    label: this.hiderowlabel,
                    isFirstCondition: false,
                    defaultField: field,
                    defaultOperator: op,
                    defaultValue: value,
                    id: this.id + '-SearchCondition' + count,
                    visible: visible
                });

            this.widgetConnects.push(dojo.connect(newWid, 'onRemoveLookupCondition', this, '_removeCondition'));
            
            dojo.place(newWid.domNode, this.conditions);
            newWid.startup();
            this.conditionWidgets[newWid.id] = newWid;
        },
        _setInitialCondition: function() {
            var self = this,
                wid = new SearchConditionWidget({
                    conditionManager: self,
                    label: self.addrowlabel,
                    isFirstCondition: true,
                    id: self.id + '-SearchCondition0',
                    visible: true
                });
                
            this.widgetConnects.push(dojo.connect(wid, 'onAddLookupCondition', self, '_addCondition'));
            self.conditionWidgets[wid.id] = wid;
            dojo.place(wid.domNode, self.conditions);
            wid.startup();
        },
        _addCondition: function() {
            var count = this._conditionCount(),
                newWid = new SearchConditionWidget({
                    conditionManager: this,
                    label: this.hiderowlabel,
                    isFirstCondition: false,
                    id: this.id + '-SearchCondition' + count,
                    visible: true
                });
                
            this.widgetConnects.push(dojo.connect(newWid, 'onRemoveLookupCondition', this, '_removeCondition'));
            this.conditionWidgets[newWid.id] = newWid;
            dojo.place(newWid.domNode, this.conditions);
            newWid.startup();
        },
        _removeCondition: function(conditionWidget) {
            var id = conditionWidget.id;
            conditionWidget.destroyRecursive();
            delete(this.conditionWidgets[id]);
        },
        _conditionCount: function() {
            var count = 0,
                wid;
            for (wid in this.conditionWidgets) {
                if(this.conditionWidgets.hasOwnProperty(wid)) {
                    count += 1;
                }
            }

            return count;
        },
        onDoSearch: function(args) {
        }
    });

    return widget;
});
