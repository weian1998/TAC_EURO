Type.registerNamespace("SmartParts.AppIdMapping");

SmartParts.AppIdMapping.Matching = function(configOptions) {
    this.ConfigOptions = configOptions;
};

SmartParts.AppIdMapping.Matching.create = function(id, configOptions) {
    window[id] = new SmartParts.AppIdMapping.Matching(configOptions);
};

SmartParts.AppIdMapping.Matching.prototype.init = function() {
};

Sage.MatchFilterManager = function() {
    this.win = '';
    this.matchesIsOpen = false;
    this.conditions = [];

    this.filterTpl = new Ext.XTemplate(
    '<div id="entitylookupdiv_{index}" class="lookup-condition-row" style="padding-left:20px">',
        '<select style="width:160px" id="fieldnames_{index}" class="lookup-fieldnames-list" onchange="var mgr = Sage.Services.getService(\'MatchFilterManager\');if (mgr) { mgr.operatorChange({index}); }">',
            '<tpl for="fields"><option value="{FieldName}">{DisplayName}</option></tpl>',
        '</select>',
        '<select style="width:160px; margin-left:130px" id="operators_{index}" class="lookup-operators-list">',
            '<tpl for="operators"><option value="{symbol}">{display}</option></tpl>',
        '</select>',
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

Sage.MatchFilterManager.prototype.getTemplateObj = function() {
    var mgr = Sage.Services.getService("MatchFilterManager")
    mgr.setupTemplateObj = (window.matchSetupObject) ? window.matchSetupObject : {
        fields: [{ FieldName: '', DisplayName: ''}],
        operators: [{ symbol: 'Equal To', display: 'Equal To'}],
        index: 0,
        hideimgurl: 'images/icons/Find_Remove_16x16.gif',
        addimgurl: 'images/icons/Find_Add_16x16.gif',
        hideimgalttext: MatchingResources.Filter_RemoveCondition,
        addimgalttext: MatchingResources.Filter_AddCondition,
        headerlabel: MatchingResources.Filter_SpecifyCriteria,
        hiderowlabel: MatchingResources.Filter_AndText,
        srchBtnCaption: MatchingResources.Filter_SearchText,
        errorOperatorRequiresValue: MatchingResources.Filter_OperatorValueRequred
    }
}

function onEditMatchConfig(matchType, resourceDisplayName) {
    Matching.ConfigOptions.resourceKind = matchType;
    Matching.ConfigOptions.resourceDisplayName = resourceDisplayName;
    var mgr = Sage.Services.getService("MatchFilterManager");
    if (mgr) {
        mgr.buildDialog();
    } else {
        mgr = new Sage.MatchFilterManager();
        Sage.Services.addService("MatchFilterManager", mgr);
        mgr.buildDialog();
    }
}

Sage.MatchFilterManager.prototype.buildDialog = function() {
    var mgr = Sage.Services.getService("MatchFilterManager");
    if (mgr) {
        if (mgr.matchesIsOpen) { return; }
        mgr.matchesIsOpen = true;
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: String.format("slxdata.ashx/slx/crm/-/resources/getmatchproperties?resourceKind={0}&_dc={1}", Matching.ConfigOptions.resourceKind,
                new Date().getTime()),
            dataType: 'json',
            success: handleReturnedItems,
            data: {},
            error: function(request, status, error) {
                alert(MatchingResources.Error_InvalidEndpoint);
            }
        })
    }
}

function handleReturnedItems(data) {
    window.properties = data;
    var mgr = Sage.Services.getService("MatchFilterManager");
    mgr.setupFilterElements();
    showDialog();
}

function showDialog() {
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
    }
    $(document).bind("keydown", mgr.checkKeys);
    $("#value_0").focus();
    window.setTimeout(function() { $("#value_0").focus(); }, 500);
}

function getSelections() {
    var mgr = Sage.Services.getService("MatchFilterManager");
    var filters = [];
    $(".lookup-fieldnames-list").each(function(i, filter) {
        var operator = $(String.format("#operators_{0}", i)).get(0);
        filters.push({ "property": filter.value, "operator": operator.value });
    });
    return Ext.encode(filters);
}

Sage.MatchFilterManager.prototype.setupFilterElements = function () {
    var mgr = Sage.Services.getService("MatchFilterManager");
    if (mgr) {
        mgr.getTemplateObj();
        mgr.setupTemplateObj.fields = window.properties.fields;
        mgr.setupTemplateObj.operators = window.properties.operators;
        mgr.selectedFilters = window.properties.filters;
        var contentHtml = String.format('<div><label class="wizardsectiontitle boldText padBottom">{0}<span class="boldtext">{1}</span></label><br /><br /></div>',
            MatchingResources.DefaultCriteria_Header, Matching.ConfigOptions.resourceDisplayName);
        contentHtml = contentHtml + String.format('<div><label class="wizardsectiontext padBottom" style="padding-left:20px">{0}</label></div>',
            MatchingResources.DefaultCriteria_Description);
        contentHtml = contentHtml + String.format('<div><br /><label class="slxlabel" style="padding-left:20px">{0}</label><label class="slxlabel" style="padding-left:240px">{1}</label></div>',
            MatchingResources.DefaultCriteria_PropertyValue, MatchingResources.DefaultCriteria_OperatorValue);
        contentHtml = contentHtml + '<div id="entitylookupdiv-container"></div>';
        var pnl = new Ext.Panel({
            id: 'matchesPanel',
            layout: 'fit',
            style: 'padding:5px',
            stateful: false,
            html: contentHtml
        });
        
        mgr.win = new Ext.Window({
            title: MatchingResources.DefaultCriteria_DialogCaption,
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
            tools: [{ id: 'help', handler: function () { window.open(Link.getHelpUrl('Matching_Tab')); } }],
            buttons: [{
                text: MatchingResources.DefaultCriteria_OKButton,
                handler: function () {
                    $.ajax({
                        type: "POST",
                        url: "slxdata.ashx/slx/crm/-/resources/updateconfiguration",
                        contentType: "application/json",
                        data: getSelections(),
                        dataType: "json",
                        processData: false,
                        error: function (request, status, error) {
                            Ext.Msg.alert(error);
                        },
                        success: function () {
                            mgr.win.close();
                        }
                    });
                }
            }, {
                text: MatchingResources.DefaultCriteria_CancelButton,
                handler: function () {
                    mgr.win.close();
                }
            }]
        });
    }
}

Sage.MatchFilterManager.prototype.resetMatchFilters = function(data) {
    var x = data;
    var mgr = Sage.Services.getService("MatchFilterManager");
    if (mgr) {
        mgr.setupTemplateFields(data);
        mgr.setupTemplateObj.index = 0;
        if (mgr.win != '') {
            mgr.filterTpl.overwrite('entitylookupdiv-container', mgr.setupTemplateObj);
            //set lookup controls to match current conditions
            if (mgr.conditions.length > 0) {
                for (var i = 1; i < mgr.conditions.length; i++) {
                    mgr.addFilter();
                }
                var filterRows = $('.lookup-condition-row');
                if (filterRows) {
                    for (var i = 0; i < filterRows.length; i++) {
                        var row = filterRows[i];
                        if ((row) && (mgr.conditions[i])) {
                            var cond = mgr.conditions[i];
                            var fld = $('.lookup-fieldnames-list', row);
                            var op = $('.lookup-operators-list', row);
                            var val = $('.lookup-value', row);
                            if (fld[0]) fld[0].value = cond.fieldname;
                            if (op[0]) op[0].value = cond.operator;
                            if (val[0]) val[0].value = cond.val;
                            mgr.operatorChange(i);
                        }
                    }
                }
            }
            mgr.adjustInputHeight();
        }
    }
}

Sage.MatchFilterManager.prototype.onLookupHide = function() {
    this.matchesIsOpen = false;
    $(document).unbind("keydown", this.checkKeys);
}

Sage.MatchFilterManager.prototype.checkKeys = function(e) {
    if (e.keyCode == 13) {
        var mgr = Sage.Services.getService("MatchFilterManager");
        if (mgr) {
            //mgr.doLookup();
        }
    }
}

Sage.MatchFilterManager.prototype.reloadSelect = function(sel, items) {
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

Sage.MatchFilterManager.prototype.operatorChange = function(index) {
    var mgr = Sage.Services.getService("MatchFilterManager");
    if (mgr) {
        var operators = $('#operators_' + index)[0];
        var fields = $('#fieldnames_' + index)[0];
        if ((fields.selectedIndex >= 0) &&
        (fields.selectedIndex < mgr.setupTemplateObj.fields.length) &&
        (mgr.setupTemplateObj.fields[fields.selectedIndex].isNumeric)) {
            //if (operators.length != mgr.setupTemplateObj.numericoperators.length) {
            //  mgr.reloadSelect(operators, mgr.setupTemplateObj.numericoperators);
            //}
        } else {
            if (operators.length != mgr.setupTemplateObj.operators.length) {
                mgr.reloadSelect(operators, mgr.setupTemplateObj.operators);
            }
        }
    }
}

Sage.MatchFilterManager.prototype.adjustInputHeight = function() {
    $(".lookup-value").height($(".lookup-operators-list").height());
}

Sage.MatchFilterManager.prototype.addFilter = function() {
    var mgr = Sage.Services.getService("MatchFilterManager");
    if (mgr) {
        mgr.filterTpl.append('entitylookupdiv-container', mgr.setupTemplateObj);
        mgr.adjustInputHeight();
        mgr.setupTemplateObj.index++;
    }
}

Sage.MatchFilterManager.prototype.removeLookupCondition = function(idx) {
    var rowid = "#entitylookupdiv_" + idx;
    $(rowid).html('');
}
if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();