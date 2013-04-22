/*globals dojo, define, Sage, dijit, Simplate, $ */
define([
    'dojo/_base/declare',
    'dojo/i18n!./nls/AdvancedSearchOptions',
    'dijit/_Widget',
    'Sage/_Templated',
    'Sage/UI/Dialogs',
    'dojo/text!./templates/AdvancedSearchOptions.html',
    'Sage/UI/Controls/_DialogHelpIconMixin',
    'dojo/_base/lang',
    'dijit/Dialog',
    'dijit/_Widget',
    'Sage/_Templated',
    'dijit/Dialog'
],
function (declare, i18nStrings, _Widget, _Templated, Dialogs, templateString) {
    var advancedSearchOptions = declare('Sage.MainView.IntegrationContract.AdvancedSearchOptions', [_Widget, _Templated], {
        configOptions: [],
        id: '',
        refineSearchId: '',
        index: 0,
        selectedFieldIndex: 0,
        fields: [{ FieldName: '', DisplayName: ''}],
        operators: [],
        selectedFilters: [],
        hideimgurl: 'images/icons/Find_Remove_16x16.gif',
        addimgurl: 'images/icons/Find_Add_16x16.gif',
        widgetsInTemplate: true,
        constructor: function () {
            dojo.mixin(this, i18nStrings);
        },
        init: function (workSpace) {
            this.id = workSpace.Id; ;
            this.configOptions = workSpace;
        },
        conditionTemplate: new Simplate(['<div >',
            '<div id="filterCondition_{%= $.index %}" class="lookup-condition-row" style="padding-left:10px">',
                '<select id="fieldnames_{%= $.index %}" class="lookup-fieldnames-list" style="width:160px" onchange="dijit.byId(\'{%= $.refineSearchId %}\').refineSearchObject.onPropertyChange({%= $.index %});" >',
                    '{% for (var i=0;i<$.fields.length;i++) { %}',
                        '<option value="{%= $.fields[i].FieldName %}" {% if ($.selectedFieldIndex == i ) { %} selected {% } %} >{%= $.fields[i].DisplayName %}</option>',
                    '{% } %}',
                '</select>',
                '<select id="operators_{%= $.index %}" class="lookup-operators-list" style="width:160px; margin-left:20px">',
                    '{% for (var i=0;i<$.operators.length;i++) { %}',
                        '<option value="{%= $.operators[i].symbol %}"  {% if ($.selectedFieldIndex == i ) { %} selected {% } %} >{%= $.operators[i].display %}</option>',
                    '{% } %}',
                '</select>',
                '<input type="text" id="searchValue_{%= $.index %}" class="search-value-list" style="width:160px;margin-left:5px" />',
                '{% if ($.index == 1 ) { %}',
                    '<img id="addCondition_{%= $.index %}" src="{%= $.addimgurl %}" alt="{%= $.addImgAltText %}" style="cursor:pointer;padding:0px 5px;" onclick="dijit.byId(\'{%= $.id %}-Dialog\').refineSearchObject.addLookupCondition();" />',
                '{% } %}',
                '{% if ($.index > 1 ) { %}',
                    '<img src="{%= $.hideimgurl %}" alt="{%= $.hideImgAltText %}" style="cursor:pointer;padding:0px 5px;" onclick="dijit.byId(\'{%= $.id %}-Dialog\').refineSearchObject.removeLookupCondition({%= $.index %});" />',
                '{% } %}',
            '</div>',
        '</div>']),
        onRefineSearch: function () {
            var refineSearchOptId = dojo.byId(this.configOptions.optionRefineSearchId);
            if (refineSearchOptId != null && refineSearchOptId.checked) {
                this.getDefaultMatchProperties();
                return true;
            }
            return false;
        },
        getDefaultMatchProperties: function () {
            var self = this;
            var refineSearchDialog = dijit.byId([this.id, '-Dialog'].join(''));
            if (!refineSearchDialog) {
                dojo.xhrGet({
                    url: dojo.string.substitute("slxdata.ashx/slx/crm/-/resources/getmatchproperties?resourceKind=${0}&targetMapping=${1}",
                            [this.configOptions.resourceKind, true]),
                    cache: false,
                    preventCache: true,
                    handleAs: 'json',
                    load: function (data) {
                        self.fields = data.fields;
                        self.operators = data.operators;
                        self.selectedFilters = data.filters;
                        self.showDialog();
                    },
                    error: function (request, status, error) {
                        Dialogs.ShowError("request: " + request + " \nstatus: " + status + " \nerror: " + error);
                    }
                });
            }
            else {
                self.showDialog();
            }
        },
        showDialog: function () {
            this.index = 0;
            var refineSearchDialog = dijit.byId([this.id, '-Dialog'].join(''));
            if (!refineSearchDialog) {
                refineSearchDialog = new dijit.Dialog({
                    title: this.dialogCaption,
                    id: [this.id, '-Dialog'].join(''),
                    style: ['height:', 300, 'px;width:', 600, 'px;'].join(''),
                    closable: true,
                    loadingMessage: this.loadingText,
                    refineSearchObject: this
                });
                var template = new Simplate(eval(templateString));
                refineSearchDialog.attr("content", template.apply(this));
            }
            this.refineSearchId = refineSearchDialog.id;
            refineSearchDialog.show();
            this.loadMatchingFilters();
            dojo.style(refineSearchDialog.domNode, 'zIndex', 9050);
        },
        loadMatchingFilters: function () {
            for (var i = 0; i < this.selectedFilters.length; i++) {
                this.addLookupCondition();
                var field = dojo.byId(['fieldnames_', this.index].join(''));
                if (field != null) {
                    field.value = this.selectedFilters[i].Property;
                }
                var operator = dojo.byId(['operators_', this.index].join(''));
                if (operator != null) {
                    operator.value = this.selectedFilters[i].Operator;
                    operator.symbol = this.selectedFilters[i].Operator;
                }
                var searchValue = dojo.byId(['searchValue_', this.index].join(''));
                if (searchValue != null) {
                    searchValue.value = this.selectedFilters[i].SearchValue;
                }
            }
        },
        getSelections: function () {
            var conditions = [];
            this.updateDisplay();
            var filterRows = dojo.query('.lookup-condition-row');
            for (var i = 0; i < filterRows.length; i++) {
                var fieldName = dojo.query('.lookup-fieldnames-list', filterRows[i]);
                var operator = dojo.query('.lookup-operators-list', filterRows[i]);
                var searchValue = dojo.query('.search-value-list', filterRows[i]);
                var condition = {
                    fieldName: fieldName[0].value,
                    operator: operator[0].value,
                    searchValue: searchValue[0].value
                };
                conditions.push(condition);
            }
            var filterCriteria = dojo.byId(this.configOptions.filtersId);
            if (filterCriteria != null) {
                filterCriteria.value = Sys.Serialization.JavaScriptSerializer.serialize(conditions);
            }
            this.invokeClickEvent(dojo.byId(this.configOptions.refreshGridId));
        },
        updateDisplay: function () {
            var control = dojo.byId(this.configOptions.resultsMsgId);
            if (control != null) {
                control.innerHTML = this.loadingDisplay;
            }
            control = dojo.byId(this.configOptions.rowSearchResultsId);
            if (control != null) {
                control.style.display = "none";
            }
            control = dojo.byId(this.configOptions.rowLinkToId);
            if (control != null) {
                control.style.display = "none";
            }
        },
        invokeClickEvent: function (control) {
            if (document.createEvent) {
                // FireFox
                var e = document.createEvent("MouseEvents");
                e.initEvent("click", true, true);
                control.dispatchEvent(e);
            }
            else {
                // IE
                control.click();
            }
        },
        onPropertyChange: function (index) {
            var searchValue = dojo.byId(['searchValue_', index].join(''));
            if (searchValue != null) {
                searchValue.value = "";
            }
        },
        addLookupCondition: function () {
            this.index++;
            var divContainer = dojo.byId([this.id, '-Condition-container'].join(''));
            var newRow = this.conditionTemplate.apply(this);
            dojo.place(newRow, divContainer);
            this.dialogResize();
        },
        dialogResize: function () {
            dojo.style([this.id, '-Dialog'].join(''), 'height', 'auto');
        },
        removeLookupCondition: function (idx) {
            dojo.query(dojo.byId(["filterCondition_", idx].join(''))).orphan();
        },
        reloadOperators: function (selectedFieldIndex, rowIndex) {
            this.selectedFieldIndex = selectedFieldIndex;
            this.index = rowIndex;
            var newRow = this.conditionTemplate.apply(this);
            //Replace old operators with new ones at the same index point.
            dojo.place(newRow, ['filterCondition_', rowIndex].join(''), 'replace');
        },
        clearTargetSelection: function () {
            var targetsGroup = document.getElementsByName('TargetsGroup');
            if (targetsGroup != null) {
                for (var i = 0; i < targetsGroup.length; i++) {
                    targetsGroup[i].checked = false;
                }
            }
        },
        onMatchSelection: function (linkToId) {
            var linkToControl = document.getElementById(linkToId);
            if (linkToControl != null) {
                linkToControl.checked = true;
            }
        },
        closeDetailsDialog: function () {
            //remove all existing conditions
            //            var rows = dojo.query('.lookup-condition-row');
            //            if (rows != null) {
            //                dojo.forEach(rows, "dojo.query(item).orphan();");
            //            }
        }
    });
    return advancedSearchOptions;
});