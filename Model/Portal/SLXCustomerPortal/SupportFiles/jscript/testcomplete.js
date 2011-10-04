
function idTopLevelItems() {
    if ($("button.x-btn-text").length == 0) { //hasn't loaded yet
        window.setTimeout(idTopLevelItems, 500);
        return;
    }
    $("button.x-btn-text").map(function(index, elem) {
        if ((elem.id.indexOf("ext") == 0) || (elem.id == "")) {
            elem.id = "toolbar_" + elem.firstChild.nodeValue.replace(/ /g, "_");
        }
    });
    $(".NavBarItem > a").map(function(index, elem) {
        if ((elem.id.indexOf("ext") == 0) || (elem.id == ""))
            elem.id = "nav_" + elem.href.substring(elem.href.lastIndexOf("/") + 1, elem.href.lastIndexOf("."));
    });
    idRows();
}
$(document).ready(idTopLevelItems);

function idRows() {
    $(".x-grid3-cell-inner a").map(function(index, elem) {
        if (((elem.id.indexOf("ext") == 0) || (elem.id == "")) && (elem.href.indexOf("id=") > 0)) {
            var regexp = new RegExp("id=[^&]+");
            var matches = elem.href.match(regexp);
            if (matches && matches.length > 0) {
                var id = matches[0].split("=")[1];
            }
            elem.id = "gridLink_"
                + elem.href.substring(elem.href.lastIndexOf("/") + 1, elem.href.lastIndexOf(".aspx")) + "_"
                + id;
        }
    });
    return true;
}

function idMenuItems() {
    $(".x-menu-list-item a").map(function(index, elem) {
        setElemId(elem, elem, "menuLink_");
        return true;
    });
    return true;
}

function idPopupWindow() {
    $(".x-window button").map(function(index, elem) {
        setElemId(elem, elem, "buttonText_");
        return true;
    });
    $(".x-window input").map(function(index, elem) {
        setElemId(elem, elem.nextSibling, "inputLabel_");
        return true;
    });
    $(".x-window img").map(function (index, elem) {
        setElemId(elem, elem.previousSibling, "image_");
        return true;
    });
    return true;
}

function idComboBoxItems() {
    $(".x-combo-list-item").map(function (index, elem) {
        setElemId(elem, elem, "comboItem_");
        return true;
    });

}

function idLookup(cssclass) {
    $("." + cssclass + " .x-tool-help").map(function(index, elem) {
        if ((elem.id.indexOf("ext") == 0) || (elem.id == "")) {
            elem.id = $("." + cssclass + ":has(#" + elem.id + ")")[0].id + "_help";   //.x-tool-help
        }
    });
}

function idTemplates() {
    $("a.x-tree-node-anchor").map(function(index, elem) {
        setElemId(elem, elem.firstChild, "templateAnchor_");
        return true;
    });
}

function idWidgets(widgetId) {
    $("#" + widgetId + " a").map(function(index, elem) {
        setElemId(elem, elem.lastChild, "widgetlink_");
        return true;
    });
}

function idRefreshAndCloseButtons() {
    $(".x-tool-close").map(mapCloseAndRefreshFactory('close_'));
    $(".x-tool-refresh").map(mapCloseAndRefreshFactory('refresh_'));
    $(".x-tool-gear").map(mapCloseAndRefreshFactory('gear_'));
}

function mapCloseAndRefreshFactory(prefix) {
    return function(index, elem) {
        var title = elem.nextSibling;
        while ((title) && (title.tagName != "SPAN"))
            title = title.nextSibling;
        setElemId(elem, title, prefix);
    }
}

function setElemId(elem, idfrom, prefix) {
    if ((idfrom) && ((elem.id.indexOf("ext") == 0) || (elem.id == ""))) {
        var value = "";
        if (Ext.isIE) {
            value = idfrom.innerText || idfrom.id;
        } else {
            value = idfrom.textContent || idfrom.id;
        }
        if (value) {
            elem.id = prefix + value.replace(/ /g, "_").match(/^[a-zA-Z0-9_]+/);
        }
    }
}
