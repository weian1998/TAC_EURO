//if (!Sage.UI) {
//    Sage.namespace("UI");
//}
//if (!Sage.UI.Controls) {
//    Sage.UI.namespace("Controls");
//}
//Sage.UI.
dojo.provide('Sage.UI.ConditionManager');
ConditionManager = function (options) {
    this._options = options;
    this.win = '';
    this.conditions = [];
    this.fields = [];
    // gather the select and include parts from the columns passed in...
    this.lookupTpl = new Simplate([
        '<div id="lookupCondition_{%= index %}" class="lookup-condition-row">',
        '<label class="slxlabel" style="width:75px;clear:left;display:block;float:left;position:relative;padding:4px 0px 0px 0px">',
            '{% if (index < 1 ) { %} {%= addrowlabel %} {% } %}',
            '{% if (index > 0 ) { %} {%= hiderowlabel %} {% } %}',
        '</label>',
        '<div style="padding-left:75px;position:relative;">',
            '<select id="fieldnames_{%= index %}" class="lookup-fieldnames-list" onchange="dijit.byId(\'{%= slcId %}\').conditionMgr.operatorChange({%= index %}); ">',
                '{% for (var i=0;i<fields.length;i++) { %}',
                    '<option value="{%= fields[i].fieldname %}"  {% if (selectedFieldIndex == i ) { %} selected {% } %} >{%= fields[i].displayname %}</option>',
                '{% } %}',
            '</select>',
            '<select id="operators_{%= index %}" class="lookup-operators-list">',
                '{% selectedFieldType = (operators.hasOwnProperty(fields[selectedFieldIndex].propertyType)) ? fields[selectedFieldIndex].propertyType : "default"  ; %}',
                '{% for (var i=0;i<operators[selectedFieldType].length;i++) { %}',
                    '<option value="{%= operators[selectedFieldType][i].symbol %}">{%= operators[selectedFieldType][i].display %}</option>',
                '{% } %}',
            '</select>',
            '<input type="text" id="value_{%= index %}" class="lookup-value" />',
            '{% if (index < 1 ) { %}',
    //TODO: Add a callback method in the cofiguration options coming from the LookupControl that is the 'DoSearch' method
                '<img src="{%= addimgurl %}" alt="{%= addimgalttext %}" style="cursor:pointer;padding:0px 5px;" onclick="dijit.byId(\'{%= slcId %}\').conditionMgr.addLookupCondition();" />',
                '<input type="button" id="lookupButton" onclick="dijit.byId(\'{%= slcId %}\').doLookup(); " value="{%= srchBtnCaption %}" />',
            '{% } %}',
        '{% if (index > 0 ) { %}',
            '<img src="{%= hideimgurl %}" alt="{%= hideimgalttext %}" style="cursor:pointer;padding:0px 5px;" onclick="dijit.byId(\'{%= slcId %}\').conditionMgr.removeLookupCondition({%= index %});" />',
        '{% } %}',
        '</div>']);

    //TODO: Move Sage.Utilities
    function AddToFieldsUnique(fieldName, displayName, propertyType, list) {
        for (var i = 0; i < list.length; i++) {
            if (fieldName === list[i].fieldname) {
                return;
            }
        }
        list.push({ fieldname: fieldName, displayname: displayName, propertyType: propertyType });
    }

    this.initFields = function () {
        var cols = this._options.structure[0];
        var fields = this.fields;
        var fieldName;
        var displayName;
        var propertyType;
        for (var i = 0; i < cols.cells.length; i++) {
            if (cols.cells[i].hidden != true && cols.cells[i].excludeFromFilters != true) {
                if (cols.cells[i].field) {
                    fieldName = cols.cells[i].field;
                    propertyType = cols.cells[i].propertyType;
                    if (cols.cells[i].displayField) {
                        displayName = cols.cells[i].displayField;
                    }
                    else {
                        displayName = cols.cells[i].name;
                    }
                    AddToFieldsUnique(fieldName, displayName, propertyType, fields);
                }
            }
        }
    };

    this.initFields();

    this.setupTemplateObj = {
        fields: this.fields,
        operators: {
            "System.Boolean": [
                  { symbol: 'eq', display: 'Equal to' },
                  { symbol: 'ne', display: 'Not Equal to' },
            //  {name: "LookupControl_Operator_Equal", value: "eq"},
            //  {name: "LookupControl_Operator_NotEqual", value: "ne"}        
            ],
            "System.String": [
                { symbol: 'sw', display: 'Starting With' },
                { symbol: 'like', display: 'Contains' },
                { symbol: 'eq', display: 'Equal to' },
                { symbol: 'ne', display: 'Not Equal to' },
                { symbol: 'le', display: 'Equal or Less than' },
                { symbol: 'ge', display: 'Equal or Greater than' },
                { symbol: 'lt', display: 'Less than' },
                { symbol: 'gt', display: 'Greater than' }
            ],
            "default": [ //numericoperators  System.Decimal, System.Int32
                {symbol: "eq", "display": "Equal to" },
                { symbol: "ne", "display": "Not Equal to" },
                { symbol: "le", "display": "Equal or Less than" },
                { symbol: "ge", "display": "Equal or Greater than" },
                { symbol: "lt", "display": "Less than" },
                { symbol: "gt", "display": "Greater than" }
            ]
        },
        index: 0,
        selectedFieldIndex: 0,
        selectedFieldType: '',
        hideimgurl: 'images/icons/Find_Remove_16x16.gif',
        addimgurl: 'images/icons/Find_Add_16x16.gif',
        hideimgalttext: 'Remove Condition',
        addimgalttext: 'Add Condition',
        addrowlabel: 'Lookup by:',
        hiderowlabel: 'And:',
        srchBtnCaption: 'Search',
        errorOperatorRequiresValue: 'The operator requires a value',
        slcId: options.id
    };
}

//Sage.UI.
ConditionManager.prototype.addLookupCondition = function () {
    this.setupTemplateObj.index++;
    divContainer = dojo.byId([this._options.id, '-Condition-container'].join(''));
    newRow = this.lookupTpl.apply(this.setupTemplateObj);
    dojo.place(newRow, divContainer)
}

//Sage.UI.
ConditionManager.prototype.removeLookupCondition = function (idx) {
    dojo.html.set(dojo.byId(["lookupCondition_", idx].join('')), '');
}

//Sage.UI.
ConditionManager.prototype.operatorChange = function (index) {
    //Find the selected value of the condition.
    var fields = dojo.byId(['fieldnames_', index].join(''));
    //Find the field type of the selected value and make sure it is different from the current field type.
    for (var i = 0; i < this.fields.length; i++) {
        if (this.fields[i].fieldname === fields.value) {
            if (this.fields[i].propertyType !== this.setupTemplateObj.selectedFieldType) {
                //Reload the operators with ones that match the newly selected value.
                this.reloadOperators(fields.selectedIndex, index)
            }
        }
    }
}
ConditionManager.prototype.reloadOperators = function (selectedFieldIndex, rowIndex) {
    this.setupTemplateObj.selectedFieldIndex = selectedFieldIndex;
    this.setupTemplateObj.index = rowIndex;
    newRow = this.lookupTpl.apply(this.setupTemplateObj);
    //Replace old operators with new ones at the same index point.
    dojo.place(newRow, ['lookupCondition_', rowIndex].join(''), 'replace');
}

//Sage.UI.
    ConditionManager.prototype.reloadConditions = function () {
    this.conditions = [];
    var filterRows = dojo.query('.lookup-condition-row');
    for (var i = 0; i < filterRows.length; i++) {
        var row = filterRows[i];
        var fieldname = dojo.query('.lookup-fieldnames-list', filterRows[i]);
        var operator = dojo.query('.lookup-operators-list', filterRows[i]);
        var val = dojo.query('.lookup-value', filterRows[i]);
        if (fieldname[0]) {
            if ((fieldname[0].value) && (operator[0].value)) {  
                if ((!val[0].value) && ((operator[0].value != 'like') && (operator[0].value != 'sw'))) {
                    return false; //must have a value for numeric comparisons
                }
                var condition = {
                    fieldname: fieldname[0].value,
                    operator: operator[0].value,
                    val: val[0].value.replace(/%/g, '')
                }
                //Must manipulate conditions to match Sdata requirements
                if (operator[0].value === 'like') {
                    condition.val = ['%', val[0].value, '%'].join('');
                }
                else if (operator[0].value === 'sw') {
                    condition.operator = 'like'
                    condition.val = [val[0].value, '%'].join('');
                } 
                this.conditions.push(condition);
                this.operatorChange(0);
            }
        }
    }
    return true;
}

//Sage.UI.
ConditionManager.prototype.getConditionsString = function () {
    var conditionsString = [];
    if (typeof this.conditions === 'string') {
        return this.conditions;
    } else {
        for (i = 0; i < this.conditions.length; i++) {
            conditionsString.push(this.conditions[i].fieldname + ' ' + this.conditions[i].operator + ' ' + '"' + this.conditions[i].val + '"');
        }
    }
    return conditionsString.join(' and ');
}

ConditionManager.prototype.getConditionsJSON = function () {
    return Sys.Serialization.JavaScriptSerializer.serialize(this.conditions);
}

//Sage.UI.
ConditionManager.prototype.getConditions = function () {
    return this.conditions;
}

