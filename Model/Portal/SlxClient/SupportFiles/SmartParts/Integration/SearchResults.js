Type.registerNamespace("SmartParts.Integration");

SmartParts.Integration.SearchResults = function (searchOptions) {
    this.SearchOptions = searchOptions;
};

SmartParts.Integration.SearchResults.create = function (id, searchOptions) {
    window[id] = new SmartParts.Integration.SearchResults(searchOptions);
};

SmartParts.Integration.SearchResults.prototype.init = function () {
};

Sage.MatchFilterManager = function () {
    this.win = '';
    this.matchesIsOpen = false;
    this.saveFilters = false;
    this.sourceAccountId = '';

    this.filterTpl = new Ext.XTemplate(
        '<div id="entitylookupdiv_{index}" class="lookup-condition-row" style="padding-left:20px">',
            '<select style="width:160px" id="fieldnames_{index}" class="lookup-fieldnames-list" onchange="var mgr = Sage.Services.getService(\'MatchFilterManager\');if (mgr) { mgr.onPropertyChange({index}); }">',
                '<tpl for="fields"><option value="{FieldName}">{DisplayName}</option></tpl>',
            '</select>',
            '<select style="width:160px; margin-left:10px" id="operators_{index}" class="lookup-operators-list">',
                '<tpl for="operators"><option value="{symbol}">{display}</option></tpl>',
            '</select>',
            '<input style="width:160px; margin-left:5px" id="searchvalues_{index}" class="search-value-list"></input>',
            '<tpl if="index &lt; 1"><img src="{addimgurl}" alt="{addimgalttext}" style="cursor:pointer;padding:0px 5px;" onclick="var mgr = Sage.Services.getService(\'MatchFilterManager\');if (mgr){mgr.addFilter();}" /></tpl>',
            '<tpl if="index &gt; 0"><img src="{hideimgurl}" alt="{hideimgalttext}" style="cursor:pointer;padding:0px 5px;" onclick="var mgr = Sage.Services.getService(\'MatchFilterManager\');if (mgr) { mgr.removeLookupCondition({index});}" /></tpl>',
        '</div>'
        );

    if (window.matchSetupObject) {
        this.setupTemplateObj = window.matchSetupObject;
    } else {
        window.setTimeout(this.getTemplateObj, 100); //otherwise this is a race
    }
}

Sage.MatchFilterManager.prototype.getTemplateObj = function () {
    var mgr = Sage.Services.getService("MatchFilterManager")
    mgr.setupTemplateObj = (window.matchSetupObject) ? window.matchSetupObject : {
        fields: [{ FieldName: '', DisplayName: ''}],
        operators: [{ symbol: 'Equal To', display: 'Equal To'}],
        index: 0,
        hideimgurl: 'images/icons/Find_Remove_16x16.gif',
        addimgurl: 'images/icons/Find_Add_16x16.gif',
        hideimgalttext: 'Remove Condition',
        addimgalttext: 'Add Condition',
        headerlabel: 'Search for Matches in ',
        hiderowlabel: 'And:',
        srchBtnCaption: 'Search',
        errorOperatorRequiresValue: 'The operator requires a value.'
    }
}

Sage.MatchFilterManager.prototype.buildDialog = function () {
    var mgr = Sage.Services.getService("MatchFilterManager");
    if (mgr) {
        if (mgr.matchesIsOpen) { return; }
        mgr.matchesIsOpen = true;
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: String.format("slxdata.ashx/slx/crm/-/resources/getmatchproperties?resourceTypeName={0}&targetMapping={1}&_dc={2}",
                SearchResults.SearchOptions.resourceTypeName, true, new Date().getTime()),
            dataType: 'json',
            success: handleReturnedItems,
            data: {},
            error: function (request, status, error) {
                alert("request: " + request + " \nstatus: " + status + " \nerror: " + error);
            }
        })
    }
}

Sage.MatchFilterManager.prototype.setupFilterElements = function () {
    var mgr = Sage.Services.getService("MatchFilterManager");
    if (mgr) {
        mgr.getTemplateObj();
        mgr.setupTemplateObj.fields = window.properties.fields;
        mgr.setupTemplateObj.operators = window.properties.operators;
        var contentHtml = String.format('<div><label class="wizardsectiontitle boldText padBottom">{0}<span class="boldtext">{1}</span></label><br /><br /></div>',
            SearchResults.SearchOptions.headerText, SearchResults.SearchOptions.targetAccount);
        contentHtml = contentHtml + String.format('<div><label class="wizardsectiontext padBottom" style="padding-left:20px">{0}</label></div>',
            SearchResults.SearchOptions.descriptionText);
        contentHtml = contentHtml + String.format('<div><br /><label class="slxlabel" style="padding-left:20px">{0}</label><label class="slxlabel" style="padding-left:120px">{1}</label><label class="slxlabel" style="padding-left:120px">{2}</label></div>',
            SearchResults.SearchOptions.propertyValue, SearchResults.SearchOptions.operatorValue, SearchResults.SearchOptions.searchValue);
        contentHtml = contentHtml + '<div id="entitylookupdiv-container"></div>';
        var pnl = new Ext.Panel({
            id: 'matchesPanel',
            layout: 'fit',
            style: 'padding:5px',
            stateful: false,
            html: contentHtml
        });

        mgr.win = new Ext.Window({
            title: SearchResults.SearchOptions.dialogCaption,
            header: false,
            footer: false,
            hideBorders: true,
            resizable: false,
            draggable: true,
            shadow: false,
            bodyStyle: 'padding:5px',
            buttonAlign: 'right',
            closeAction: 'close',
            modal: true,
            stateful: false,
            items: pnl,
            tools: [{ id: 'help', handler: function () { window.open(Link.getHelpUrl('Search_for_Matches')); } }],
            buttons: [{
                text: SearchResults.SearchOptions.OKButton,
                handler: function () {
                    mgr.saveFilters = true;
                    mgr.win.close();
                }
            }, {
                text: SearchResults.SearchOptions.cancelButton,
                handler: function () {
                    mgr.win.close();
                }
            }]
        });
    }
    mgr.win.addListener("beforeclose", mgr.getSelections, mgr);
}

Sage.MatchFilterManager.prototype.getSelections = function () {
    var mgr = Sage.Services.getService("MatchFilterManager");
    if (mgr.saveFilters) {
        mgr.updateDisplay();
        var filters = [];
        $(".lookup-fieldnames-list").each(function (i, filter) {
            var field = $(String.format("#fieldnames_{0}", i)).get(0);
            var operator = $(String.format("#operators_{0}", i)).get(0);
            var searchValue = $(String.format("#searchvalues_{0}", i)).get(0);
            filters.push({ "Property": field.value, "Operator": operator.value, "SearchValue": searchValue.value });
        });
        mgr.selectedFilters = filters;
        var filterCriteria = document.getElementById(SearchResults.SearchOptions.filtersId);
        if (filterCriteria != null) {
            filterCriteria.value = Ext.encode(filters);
        }
        InvokeClickEvent(document.getElementById(SearchResults.SearchOptions.refreshGridId));
    }
    mgr.saveFilters = false;
}

Sage.MatchFilterManager.prototype.updateDisplay = function () {
    var control = document.getElementById(SearchResults.SearchOptions.resultsMsgId);
    if (control != null) {
        control.innerText = SearchResults.SearchOptions.loadingDisplay;
    }
    control = document.getElementById(SearchResults.SearchOptions.rowSearchResultsId);
    if (control != null) {
        control.style.display = "none";
    }
    control = document.getElementById(SearchResults.SearchOptions.rowLinkToId);
    if (control != null) {
        control.style.display = "none";
    }
}

Sage.MatchFilterManager.prototype.onLookupHide = function () {
    this.matchesIsOpen = false;
    $(document).unbind("keydown", this.checkKeys);
}

Sage.MatchFilterManager.prototype.checkKeys = function (e) {
    if (e.keyCode == 13) {
        var mgr = Sage.Services.getService("MatchFilterManager");
        if (mgr) {
            //mgr.doLookup();
        }
    }
}

Sage.MatchFilterManager.prototype.reloadSelect = function (sel, items) {
    while (sel.options.length > 0) {
        sel.remove(0);
    }
    var opt;
    for (var i = 0; i < items.length; i++) {
        opt = document.createElement("option");
        opt.value = items[i].symbol;
        opt.text = items[i].display;
        try {
            sel.add(opt);
        } catch (e) {
            sel.appendChild(opt);
        }
    }
}

Sage.MatchFilterManager.prototype.onPropertyChange = function (index) {
    var mgr = Sage.Services.getService("MatchFilterManager");
    if (mgr) {
        var operators = $('#operators_' + index)[0];
        var fields = $('#fieldnames_' + index)[0];
        var searchValue = document.getElementById(String.format("searchvalues_{0}", index));
        if (searchValue != null) {
            searchValue.value = "";
        }
    }
}

Sage.MatchFilterManager.prototype.adjustInputHeight = function () {
    $(".lookup-value").height($(".lookup-operators-list").height());
}

Sage.MatchFilterManager.prototype.addFilter = function () {
    var mgr = Sage.Services.getService("MatchFilterManager");
    if (mgr) {
        mgr.filterTpl.append('entitylookupdiv-container', mgr.setupTemplateObj);
        mgr.adjustInputHeight();
        mgr.setupTemplateObj.index++;
    }
}

Sage.MatchFilterManager.prototype.removeLookupCondition = function (index) {
    var mgr = Sage.Services.getService("MatchFilterManager");
    var rowid = "#entitylookupdiv_" + index;
    $(rowid).html('');
}

function handleReturnedItems(data) {
    window.properties = data;
    var mgr = Sage.Services.getService("MatchFilterManager");
    mgr.selectedFilters = data.filters;
    mgr.setupFilterElements();
    showSearchResults();
}

function showSearchResults() {
    var mgr = Sage.Services.getService("MatchFilterManager");
    mgr.win.setWidth(600);
    mgr.win.addListener("beforehide", mgr.onLookupHide, mgr);
    mgr.win.show();
    for (var i = 0; i < mgr.selectedFilters.length; i++) {
        mgr.addFilter();
        var field = document.getElementById(String.format("fieldnames_{0}", i));
        if (field != null) {
            field.value = mgr.selectedFilters[i].Property;
        }
        var operator = document.getElementById(String.format("operators_{0}", i));
        if (operator != null) {
            operator.value = mgr.selectedFilters[i].Operator;
        }
        var searchValue = document.getElementById(String.format("searchvalues_{0}", i));
        if (searchValue != null) {
            searchValue.value = mgr.selectedFilters[i].SearchValue;
        }
    }
    $(document).bind("keydown", mgr.checkKeys);
    $("#value_0").focus();
    window.setTimeout(function () { $("#value_0").focus(); }, 500);
}

function onRefineSearch() {
    var refineSearchId = document.getElementById(SearchResults.SearchOptions.optionRefineSearchId);
    if (refineSearchId != null) {
        if (refineSearchId.checked) {
            var mgr = Sage.Services.getService("MatchFilterManager");
            if (mgr == null) {
                mgr = new Sage.MatchFilterManager();
            }
            if (mgr.sourceAccountId === SearchResults.SearchOptions.sourceAccountId) {
                mgr.setupFilterElements();
                showSearchResults();
            } else {
                mgr.sourceAccountId = SearchResults.SearchOptions.sourceAccountId;
                if (!Sage.Services.hasService("MatchFilterManager")) {
                    Sage.Services.addService("MatchFilterManager", mgr);
                }
                mgr.buildDialog();
            }
            return true;
        }
    }
    return false;
}

function OnMatchSelection(linkToId) {
    var linkToControl = document.getElementById(linkToId);
    if (linkToControl != null) {
        linkToControl.checked = true;
    }
}

function ClearTargetSelection() {
    var targetsGroup = document.getElementsByName('TargetsGroup');
    if (targetsGroup != null) {
        for (var i = 0; i < targetsGroup.length; i++) {
            targetsGroup[i].checked = false;
        }
    }
}

function InvokeClickEvent(control) {
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
}

if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();