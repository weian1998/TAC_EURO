/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dojo/parser',
       'dojo/i18n',
       'dojo/_base/lang',
       'dojo/has',
       'dojo/_base/array',
       'dijit/_Widget',
       'dijit/form/Button',
       'dijit/form/TextBox',
       'dijit/form/NumberTextBox',
       'dijit/form/Select',
       'dijit/form/DateTextBox',
       'Sage/_Templated',
       'Sage/UI/ImageButton',
       'Sage/UI/Controls/DropDownSelectPickList',
       'Sage/UI/Controls/DropDownSelectUser',
       'Sage/UI/Controls/Phone',
       'dojo/i18n!./nls/SearchConditionWidget',
       'dojo/_base/declare'
],
function (
    parser, 
    i18n,
    lang,
    has,
    array,
    _Widget, 
    Button, 
    TextBox, 
    NumberTextBox, 
    Select, 
    DateTextBox, 
    _Templated, 
    ImageButton, 
    DropDownSelectPickList, 
    DropDownSelectUser, 
    Phone,
    resource,
    declare) {
    var searchWidget = declare('Sage.UI.SearchConditionWidget', [_Widget, _Templated], {
        widgetsInTemplate: true,
        isFirstCondition: false,
        conditionManager: false,
        label: '',
        defaultOperator: null,
        defaultField: null,
        defaultValue: null,
        id: '',
        _valueBox: null,
        visible: true,
        
        _loaded: false,
        
        // localized strings
        trueText: 'true',
        falseText: 'false',
        networkText: 'Network',
        remoteText: 'Remote',
        webText: 'Web',
        webViewerText: 'Web Viewer',
        concurrentText: 'Concurrent',
        retiredText: 'Retired',
        templateText: 'Template',
        addonText: 'Addon',
        adminText: 'Admin',
        userText: 'User',
        teamText: 'Team',
        departmentText: 'Department',
        systemText: 'System',
        // end localized strings

        // Static
        propertyTypeHandler: {},
        widgetTemplate: new Simplate([
            '<div id="{%= $.id %}" class="lookup-condition-row" dojoAttachPoint="_conditionRow">',
                '<label class="slxlabel lookupLabel">',
                    '{%= $.label %}',
                '</label>',
                '<select id="{%= $.id %}_fieldName" name="{%= $.id %}_fieldName" dojoAttachPoint="_fieldNameSelect" data-dojo-type="dijit.form.Select" style="width:150px">',
                    '{% for (var i=0; i < $.conditionManager.fields.length;i++) { %}',
                        '<option id="{%= $.id %}_fieldOption{%= i %}" value="{%= $.conditionManager.fields[i][$.conditionManager.fieldNameProperty] %}">{%= $.conditionManager.fields[i][$.conditionManager.fieldDisplayNameProperty] %}</option>',
                    '{% } %}',
                '</select>',
                '<select id="{%= $.id %}_operators" name="{%= $.id %}_operators" dojoAttachPoint="_operatorSelect" data-dojo-type="dijit.form.Select" style="width:130px">',
                '</select>',
                '<div style="display: inline;" class="searchConditionInput" dojoAttachPoint="_inputWidgetPlaceHolder"></div>',
                '<div class="conditionButton">',
                '{% if ( $.isFirstCondition ) { %}',
                    '<div id="{%= $.id %}-AddImageButton" data-dojo-type="Sage.UI.ImageButton" icon="{%= $.conditionManager.addimgurl %}" tooltip="{%= $.conditionManager.addimgalttext %}" dojoAttachPoint="_addConditionButton" dojoAttachEvent="onClick:_addLookupCondition"></div>',
                '{% } else { %}',
                    '<div id="{%= $.id %}-RemoveImageButton" data-dojo-type="Sage.UI.ImageButton" icon="{%= $.conditionManager.hideimgurl %}" tooltip="{%= $.conditionManager.hideimgalttext %}" dojoAttachPoint="_removeConditionButton" dojoAttachEvent="onClick:_removeLookupCondition"></div>',
                '{% } %}',
                '</div>',
            '</div>']),
        constructor: function(options) {
            if(resource) {
                this.trueText = resource.trueText;
                this.falseText = resource.falseText;
                this.networkText = resource.networkText;
                this.remoteText = resource.remoteText;
                this.webText = resource.webText;
                this.webViewerText = resource.webViewerText;
                this.concurrentText = resource.concurrentText;
                this.retiredText = resource.retiredText;
                this.templateText = resource.templateText;
                this.addonText = resource.addonText;
                this.adminText = resource.adminText;
                this.userText = resource.userText;
                this.teamText = resource.teamText;
                this.departmentText = resource.departmentText;
                this.systemText = resource.systemText;
            }
            
            this.registerTypeHandlers();
        },
        registerTypeHandlers: function () {
            this.propertyTypeHandler['default'] = {
                getValue: function () {
                    var value = this._valueBox.get('value');
                    return value;
                },
                getTemplate: function () {
                    return ['<input id="{%= $.id %}-TextValue" data-dojo-type="dijit.form.TextBox" dojoAttachPoint="_valueBox" />'];
                }
            };
            
            this.propertyTypeHandler['System.Boolean'] = {
                getValue: function () {
                    var value;
                    if(this._valueBox.value === 'true') {
                        value = true;
                    } else {
                        value = false;
                    }
                    
                    return value;
                },
                getTemplate: function () {
                    return [
                        '<select id="{%= $.id %}-SelectValue" class="dijitDropDown" data-dojo-type="dijit.form.Select" dojoAttachPoint="_valueBox">',
                        '<option id="{%= $.id %}-BooleanOptionTrue" value="true">{%= $.trueText %}</option>',
                        '<option id="{%= $.id %}-BooleanOptionFalse" value="false">{%= $.falseText %}</option>',
                        '</select>'
                    ];
                }
            };
            
            this.propertyTypeHandler['Boolean'] = {
                getValue: function () {
                    var value;
                    if(this._valueBox.value === 'true') {
                        value = 'T';
                    } else {
                        value = 'F';
                    }
                    return value;
                },
                getTemplate: function () {
                    return lang.hitch(this, this.propertyTypeHandler['System.Boolean'].getTemplate)();
                }
            };
            
            this.propertyTypeHandler['SalesLogix.PickList'] = {
                getValue: function () {
                    return lang.hitch(this, this.propertyTypeHandler['default'].getValue)();
                },
                getTemplate: function () {
                    return [
                        '<select id="{%= $.id %}-PickValue" class="dijitDropDown" ',
                        'data-dojo-type="Sage.UI.Controls.DropDownSelectPickList" ',
                        'dojoAttachPoint="_valueBox" ',
                        'pickListName="{%= $.pickListName %}" ',
                        'storeMode="{%= $.pickListStorageMode %}" ',
                        'style="display: inline-block"',
                        '/>'
                    ];
                }
            };
            
            this.propertyTypeHandler['System.DateTime'] = {
                getValue: function () {
                    var value = this._valueBox.value;// returns a Date object
                    return value;
                },
                getTemplate: function () {
                    return [
                        '<input data-dojo-type="dijit.form.DateTextBox" id="{%= $.id %}-Date" dojoAttachPoint="_valueBox"',
                        '/>'
                    ];
                }
            };
            this.propertyTypeHandler['DateTime'] = this.propertyTypeHandler['System.DateTime'];
            
            this.propertyTypeHandler['Fixed'] = {
                getValue: function () {
                    var value = this._valueBox.get('value');
                    return value;
                },
                getTemplate: function () {
                    return ['<input id="{%= $.id %}-NumericValue" data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-point="_valueBox" constraints="{ type: \'decimal\' }" value="0" name="{%= $.id %}-NumberValue" />'];
                }
            };
            
            this.propertyTypeHandler['Integer'] = this.propertyTypeHandler['Fixed'];
            this.propertyTypeHandler['Positive Integer'] = this.propertyTypeHandler['Fixed'];
            this.propertyTypeHandler['Percent'] = this.propertyTypeHandler['Fixed'];
            this.propertyTypeHandler['Currency'] = this.propertyTypeHandler['Fixed'];
            this.propertyTypeHandler['System.Int32'] = this.propertyTypeHandler['Fixed'];
            this.propertyTypeHandler['System.Double'] = this.propertyTypeHandler['Fixed'];
            this.propertyTypeHandler['System.Decimal'] = this.propertyTypeHandler['Fixed'];
            this.propertyTypeHandler['System.Int16'] = this.propertyTypeHandler['Fixed'];
            
            this.propertyTypeHandler['Phone'] = {
                getValue: function () {
                    var value = this._valueBox.get('unformattedValue');
                    return value;
                },
                getTemplate: function () {
                    return ['<input id="{%= $.id %}-PhoneValue" data-dojo-type="Sage.UI.Controls.Phone" shouldPublishMarkDirty="false" dojoAttachPoint="_valueBox" />'];
                }
            };
            
            this.propertyTypeHandler['User'] = {
                getValue: function () {
                    var value = this._valueBox.get('value');
                    return value;
                },
                getTemplate: function () {
                    return [
                        '<select id="{%= $.id %}-UserValue" ',
                        'data-dojo-type="Sage.UI.Controls.DropDownSelectUser" ',
                        'dojoAttachPoint="_valueBox" ',
                        'style="display: inline-block;" ',
                        '></select>'
                    ];
                }
            };
            
            this.propertyTypeHandler['Sage.Entity.Interfaces.UserType'] = {
                getValue: function () {
                    var value = parseInt(this._valueBox.get('value'), 10);
                    return value;
                },
                getTemplate: function () {
                    return [
                        '<select id="{%= $.id %}-UserTypeValue" class="dijitDropDown" data-dojo-type="dijit.form.Select" dojoAttachPoint="_valueBox">',
                        '<option id="{%= $.id %}-UserTypeOption0" value="0">{%= $.networkText %}</option>',
                        '<option id="{%= $.id %}-UserTypeOption1" value="1">{%= $.remoteText %}</option>',
                        '<option id="{%= $.id %}-UserTypeOption2" value="2">{%= $.webText %}</option>',
                        '<option id="{%= $.id %}-UserTypeOption3" value="3">{%= $.webViewerText %}</option>',
                        '<option id="{%= $.id %}-UserTypeOption4" value="4">{%= $.concurrentText %}</option>',
                        '<option id="{%= $.id %}-UserTypeOption5" value="5">{%= $.retiredText %}</option>',
                        '<option id="{%= $.id %}-UserTypeOption6" value="6">{%= $.templateText %}</option>',
                        '<option id="{%= $.id %}-UserTypeOption7" value="7">{%= $.addonText %}</option>',
                        '<option id="{%= $.id %}-UserTypeOption8" value="8">{%= $.adminText %}</option>',
                        '</select>'
                    ];
                }
            };
            
            this.propertyTypeHandler['Sage.Entity.Interfaces.OwnerType'] = {
                getValue: function () {
                    var value = parseInt(this._valueBox.get('value'), 10);
                    return value;
                },
                getTemplate: function () {
                    return [
                        '<select id="{%= $.id %}-OwnerTypeValue" class="dijitDropDown" data-dojo-type="dijit.form.Select" dojoAttachPoint="_valueBox">',
                        '<option id="{%= $.id %}-OwnerTypeOption0" value="1">{%= $.userText %}</option>',
                        '<option id="{%= $.id %}-OwnerTypeOption1" value="2">{%= $.teamText %}</option>',
                        '<option id="{%= $.id %}-OwnerTypeOption2" value="3">{%= $.departmentText %}</option>',
                        '<option id="{%= $.id %}-OwnerTypeOption3" value="0">{%= $.systemText %}</option>',
                        '</select>'
                    ];
                }
            };
            
            this.propertyTypeHandler['Owner'] = this.propertyTypeHandler['default'];
            this.propertyTypeHandler['None'] = this.propertyTypeHandler['default'];
            this.propertyTypeHandler['System.String'] = this.propertyTypeHandler['default'];
            this.propertyTypeHandler['defaultOperators'] = this.propertyTypeHandler['default'];
        },
        postCreate: function() {
            //set up the operators based on default field selection...
            this.refreshDefaults();
            if(!this.visible) {
                dojo.style(this._conditionRow, 'display', 'none');
            }

            this._fieldNameSelect.on('change', lang.hitch(this, this._fieldChanged));
            this.inherited(arguments);
        },
        getCondition: function() {
            var results = false;
            if (this.isValidCondition()) {
                results = {
                    fieldname: this._fieldNameSelect.get('value'),
                    operator: this._operatorSelect.get('value'),
                    val: this._getFieldValue()
                };
            }
            
            return results;
        },
        isValidCondition: function() {
            var val = this._getFieldValue(),
                results = false;
            if(typeof val === 'string') {
                results = (val.trim() !== '');
            } else {
                results = (val !== null && val !== undefined);
            }

            return results;
        },
        _getFieldValue: function() {
            var fieldName = this._fieldNameSelect.get('value'),
                operator = this._operatorSelect.get('value'),
                field = this._getField(fieldName),
                value,
                fieldPropertyType,
                mapper;

            if (field) {
                fieldPropertyType = this._getFieldPropertyTypeValue(field);
                mapper = this.propertyTypeHandler[fieldPropertyType];
                if (typeof mapper === 'undefined') {
                    console.warn('Property ' + fieldPropertyType + ' has no mapping.');
                    mapper = this.propertyTypeHandler['default'];
                }
                value = lang.hitch(this, mapper.getValue)();
            }

            return value;
        },
        _renderFieldTemplates: function() {
            var operators, templateArray, simplate, template,
                val = this._fieldNameSelect.get('value'),
                field = this._getField(val),
                fieldPropertyType,
                temp,
                mapper;
                
            if (field) {
                fieldPropertyType = this._getFieldPropertyTypeValue(field);
                mapper = this.propertyTypeHandler[fieldPropertyType];
                if (typeof mapper === 'undefined') {
                    console.warn('Property ' + fieldPropertyType + ' has no mapping.');
                    mapper = this.propertyTypeHandler['default'];
                }
                
                templateArray = lang.hitch(this, mapper.getTemplate)();

                // Create widget for user input based on type of field.
                simplate = new Simplate(templateArray);

                // Copy 'this' into a temp object for the simplate.apply call
                temp = {};
                dojo.mixin(temp, this);
                dojo.mixin(temp, { pickListName: field.pickListName });
                dojo.mixin(temp, { pickListStorageMode: field.pickListStorageMode });
                template = simplate.apply(temp);

                if (template) {
                    dojo.forEach(dijit.findWidgets(this._inputWidgetPlaceHolder), function(wid) {
                        wid.destroy();
                    }, this);

                    this._inputWidgetPlaceHolder.innerHTML = '';
                    dojo.place(template, this._inputWidgetPlaceHolder);
                    parser.parse(this._inputWidgetPlaceHolder);
                    dojo.forEach(dijit.findWidgets(this._inputWidgetPlaceHolder), function(wid) {
                        wid.startup();
                        this._valueBox = wid;
                        dojo.connect(this._valueBox, 'onKeyDown', this, '_onKeyDown');
                    }, this);
                }
            }
        },
        uninitialize: function() {
            if (this._inputWidgetPlaceHolder) {
                dojo.forEach(dijit.findWidgets(this._inputWidgetPlaceHolder), function(wid) {
                    wid.destroy();
                }, this);
            }
            this.inherited(arguments);
        },
        _fieldChanged: function(newValue) {
            var val = this._fieldNameSelect.get('value'),
                field = this._getField(val),
                operators,
                opSel,
                len,
                i;

            if (field) {
                this._renderFieldTemplates();

                operators = this.conditionManager.getOperatorsByField(field);
                // reset ops
                if (operators) {
                    opSel = this._operatorSelect;
                    len = opSel.options.length;
                    for (i = len - 1; i >= 0; i--) {
                        opSel.removeOption(i);
                    }
                    
                    // Ensure none are selected
                    for (i = 0; i < operators.length; i++) {
                        operators[i].selected = false;
                    }
                    
                    opSel.addOption(operators);
                }
                
                this._setToDefaultOperator();
                this._setToDefaultValue();
            }
        },
        _onKeyDown: function(event) {
            if (event.keyCode === 13) {
                this.conditionManager._doSearch();

            }
        },
        _getField: function(fieldName) {
            if (this.conditionManager.fieldsHash.hasOwnProperty(fieldName)) {
                return this.conditionManager.fieldsHash[fieldName];
            }
            
            return false;
        },
        _getFieldPropertyTypeValue: function(field) {
            if(field && field.hasOwnProperty(this.conditionManager.fieldTypeProperty)) {
                return field[this.conditionManager.fieldTypeProperty];
            }
            
            return null;
        },
        _addLookupCondition: function() {
            this.onAddLookupCondition();
            dojo.publish('onAddLookupCondition', this);
        },
        onAddLookupCondition: function() {
        },
        _removeLookupCondition: function() {
            this.onRemoveLookupCondition(this);
            dojo.publish('onRemoveLookupCondition', this);
        },
        onRemoveLookupCondition: function(widget) {

        },
        _setToDefaultValue: function() {
            if (!this._isOnDefaultField()) {
                return;
            }
            
            if(this.defaultValue) {
                // Set the condition value
                this._valueBox.set('value', this.defaultValue);
            }
        },
        _setToDefaultField: function() {
            var i, fieldOptions;
            
            if(this.defaultField) {
                // Set the condition field
                fieldOptions = this._fieldNameSelect.getOptions();
                for(i = 0; i < fieldOptions.length; i++) {
                    if(fieldOptions[i].value === this.defaultField) {
                        this._fieldNameSelect.set('value', fieldOptions[i].value);
                        break;
                    }
                }
            }
        },
        _setToDefaultOperator: function() {
            var operatorOptions,
                j;
                
            if (!this._isOnDefaultField()) {
                return;
            }
            
            if(this.defaultOperator && typeof this.defaultOperator === 'string') {
                // Set the condition operator
                operatorOptions = this._operatorSelect.getOptions();
                for(j = 0; j < operatorOptions.length; j++) {
                    if(operatorOptions[j].label === this.defaultOperator ||
                        operatorOptions[j].value === this.defaultOperator) {
                        this._operatorSelect.set('value', operatorOptions[j].value);
                        break;
                    }
                }
            }
        },
        _isOnDefaultField: function () {
            var results = false,
                fieldOptions;
                
            if (this.defaultField) {
                // Set the condition field
                fieldOptions = this._fieldNameSelect.get('value');
                results = (fieldOptions === this.defaultField);
            } else {
                results = true;
            }
            
            return results;
        },
        refreshDefaults: function() {
            // Order is important here.
            // 1.) _setToDefaultField will set the default field search condition
            // 2.) _fieldChanged depends on this to get the operator
            this._setToDefaultField();
            this._fieldChanged();
        }
    });

    return searchWidget;
});
