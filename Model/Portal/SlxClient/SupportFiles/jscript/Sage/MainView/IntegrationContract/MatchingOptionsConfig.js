/*globals dojo, define, Sage, dijit, Simplate, $ */
define([
    'dojo/_base/declare',
    'dojo/i18n!./nls/MatchingOptionsConfig',
    'dojo/_base/array',
    'dijit/_Widget',
    'Sage/_Templated',
    'Sage/UI/Dialogs',
    'dojo/text!./templates/MatchingOptionsConfig.html',
    'Sage/UI/Controls/_DialogHelpIconMixin',
    'dojo/_base/lang',
    'dijit/Dialog',
    'dijit/_Widget',
    'Sage/_Templated',
    'dijit/Dialog'
],
function (declare, i18nStrings, array, _Widget, _Templated, Dialogs, template) {
    var matchingOptionsConfig = declare('Sage.MainView.IntegrationContract.MatchingOptionsConfig', [_Widget, _Templated], {
        resourceKind: '',
        resourceDisplayName: '',
        id: '',
        index: 0,
        selectedFieldIndex: 0,
        matchingId: '',
        fields: [{ FieldName: '', DisplayName: ''}],
        operators: [],
        selectedFilters: [],
        hideimgurl: 'images/icons/Find_Remove_16x16.gif',
        addimgurl: 'images/icons/Find_Add_16x16.gif',
        widgetsInTemplate: true,
        widgetTemplate: new Simplate(eval(template)),
        constructor: function () {
            dojo.mixin(this, i18nStrings);
        },
        init: function (workSpace) {
            this.id = workSpace.Id;
        },
        conditionTemplate: new Simplate(['<div>',
            '<div id="filterCondition_{%= $.index %}" class="lookup-condition-row" style="padding-left:12px">',
                '<select dojoType="dijit.form.select" id="fieldnames_{%= $.index %}" class="lookup-fieldnames-list" style="width:160px" >',
                    '{% for (var i=0; i < $.fields.length; i++) { %}',
                        '<option value="{%= $.fields[i].FieldName %}" {% if ($.selectedFieldIndex == i ) { %} selected {% } %} >{%= $.fields[i].DisplayName %}</option>',
                    '{% } %}',
                '</select>',
                '<select dojoType="dijit.form.select" id="operators_{%= $.index %}" class="lookup-operators-list" style="width:160px; margin-left:130px">',
                    '{% for (var i=0;i<$.operators.length;i++) { %}',
                        '<option value="{%= $.operators[i].symbol %}"  {% if ($.selectedFieldIndex == i ) { %} selected {% } %} >{%= $.operators[i].display %}</option>',
                    '{% } %}',
                '</select>',
                '{% if ($.index == 1 ) { %}',
                    '<img id="addCondition_{%= $.index %}" src="{%= $.addimgurl %}" alt="{%= $.filter_AddCondition %}" style="cursor:pointer;padding:0px 5px;" onclick="dijit.byId(\'{%= $.matchingId %}\').matchingObject.addLookupCondition();" />',
                '{% } %}',
                '{% if ($.index > 1 ) { %}',
                    '<img src="{%= $.hideimgurl %}" alt="{%= $.filter_RemoveCondition %}" style="cursor:pointer;padding:0px 5px;" onclick="dijit.byId(\'{%= $.matchingId %}\').matchingObject.removeLookupCondition({%= $.index %});" />',
                '{% } %}',
            '</div>',
        '</div>']),
        onEditMatchConfig: function (resourceKind, resourceDisplayName) {
            this.resourceDisplayName = resourceDisplayName;
            this.resourceKind = resourceKind;
            this.showDialog();
        },
        showDialog: function () {
            this.index = 0;
            var matchDialog = new dijit.Dialog({
                title: this.matchingCaption,
                id: [this.id, '-Dialog'].join(''),
                style: ['height:', 300, 'px;width:', 600, 'px;'].join(''),
                matchingObject: this
            });
            matchDialog.attr("content", this.widgetTemplate.apply(this));
            this.connect(matchDialog, 'onCancel', this.destroyDialog);
            this.matchingId = matchDialog.id;
            matchDialog.show();
            this.getMatchProperties();
        },
        getMatchProperties: function () {
            var self = this;
            dojo.xhrGet({
                url: dojo.string.substitute("slxdata.ashx/slx/crm/-/resources/getmatchproperties?resourceKind=${0}", [self.resourceKind]),
                cache: false,
                preventCache: true,
                handleAs: 'json',
                load: function (data) {
                    self.fields = data.fields;
                    self.operators = data.operators;
                    self.selectedFilters = data.filters;
                    dojo.query(dojo.byId([self.id, "-Loading-container"].join(''))).orphan();
                    self.loadMatchingFilters();
                },
                error: function (request, status, error) {
                    dojo.byId([self.id, "-Loading-container"].join('')).innerHTML = self.error_InvalidEndpoint;
                }
            });
        },
        loadMatchingFilters: function () {
            for (var i = 0; i < this.selectedFilters.length; i++) {
                this.addLookupCondition();
                var field = dojo.byId(['fieldnames_', this.index].join(''));
                if (field != null) {
                    field.value = this.selectedFilters[i].Property;
                }
                operator = dojo.byId(['operators_', this.index].join(''));
                if (operator != null) {
                    operator.value = this.selectedFilters[i].Operator;
                    operator.symbol = this.selectedFilters[i].Operator;
                }
            }
        },
        dialogResize: function () {
            dojo.style([this.id, '-Dialog'].join(''), 'height', 'auto');
        },
        addLookupCondition: function () {
            this.index++;
            var divContainer = dojo.byId([this.id, '-Condition-container'].join(''));
            var newRow = this.conditionTemplate.apply(this);
            dojo.place(newRow, divContainer);
            this.dialogResize();
        },
        removeLookupCondition: function (idx) {
            dojo.query(dojo.byId(["filterCondition_", idx].join(''))).orphan();
        },
        updateMatchProperties: function () {
            var self = this;
            dojo.xhrPost({
                url: "slxdata.ashx/slx/crm/-/resources/updateconfiguration",
                sync: true,
                postData: self.getSelections(),
                load: function () {
                    self.destroyDialog();
                },
                error: function (request, status, error) {
                    Dialogs.showError(error);
                }
            });
        },
        getSelections: function () {
            var conditions = [];
            var filterRows = dojo.query('.lookup-condition-row');
            for (var i = 0; i < filterRows.length; i++) {
                var fieldName = dojo.query('.lookup-fieldnames-list', filterRows[i]);
                var operator = dojo.query('.lookup-operators-list', filterRows[i]);
                var condition = {
                    fieldName: fieldName[0].value,
                    operator: operator[0].value
                };
                conditions.push(condition);
            }
            return Sys.Serialization.JavaScriptSerializer.serialize(conditions);
        },
        reloadOperators: function (selectedFieldIndex, rowIndex) {
            this.selectedFieldIndex = selectedFieldIndex;
            this.index = rowIndex;
            var newRow = this.conditionTemplate.apply(this);
            //Replace old operators with new ones at the same index point.
            dojo.place(newRow, ['filterCondition_', rowIndex].join(''), 'replace');
        },
        destroyDialog: function () {
            //remove all existing conditions
            var rows = dojo.query('.lookup-condition-row');
            if (rows != null) {
                array.forEach(rows, "dojo.query(item).orphan();");
            }
            var matchingDialog = dijit.byId([this.id, '-Dialog'].join(''));
            if (matchingDialog) {
                matchingDialog.destroy();
            }
        }
    });
    return matchingOptionsConfig;
});