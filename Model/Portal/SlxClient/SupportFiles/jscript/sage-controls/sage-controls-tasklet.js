/*global Sage Sys $*/
// ***** General Task Pane Functionality *****
// to be used as base functionality for tasklets
Sage.namespace('TaskPane');

Sage.TaskPane.Tasklet = function (config) {
    this.config = config || {};

    this.linkContainer = config.linkContainer;
    var that = this;

    var svc = Sage.Services.getService("GroupManagerService");
    if (svc) {
        svc.addListener(Sage.GroupManagerService.CURRENT_GROUP_CHANGED, function () {
            that.showLinks();
        });
    }
};

Sage.TaskPane.Tasklet.prototype.showLinks = function () {

    if (!this.config) {
        return;
    }

    // get current entity type
    var utility = new Sage.TaskPane.Utility();
    var entityType = utility.getCurrentEntityType();

    // hide panel if current entity type is not listed in config file
    // or if there are no links defined.
    if (this.config.entityType) {
        var entitiesExpr = this.getEntitiesExpression(this.config.entityType);
        if (!entitiesExpr.test(entityType) || !this.config.links) {
            this.linkContainer.parents(".task-pane-item").css("display", "none");
            this.linkContainer.css("display", "none");
            this.linkContainer.find("li").css("display", "none");
            this.linkContainer.find("a").css("display", "none");
            return;
        }
    }
    else {
        this.linkContainer.parents(".task-pane-item").css("display", "none");
        this.linkContainer.css("display", "none");
        this.linkContainer.find("li").css("display", "none");
        this.linkContainer.find("a").css("display", "none");
        return;
    }

    //this.linkContainer.empty();

    // get current viewMode
    var viewMode = utility.getCurrentViewMode();

    // check applied security and display mode for each link to determine
    // if the link should be shown
    var linkLen = this.config.links.length;
    for (var i = 0; i < linkLen; i++) {
        var link = this.config.links[i];
        var canAccess = link.hasAccess;
        var viewModesExpr = this.getViewModeExpression(link.viewModes);

        if (canAccess && viewModesExpr.test(viewMode)) {
            link.parent = this;
            var anchor = new Sage.TaskPane.TaskPaneItem(link);
        }
        else {
            $("#" + link.id).css("display", "none");
        }
    }
    var hasVisibleChildren = this.linkContainer.find("a:visible").size() > 0;

    if (!hasVisibleChildren) {
        this.linkContainer.parents(".task-pane-item").css("display", "none");
    }
};

Sage.TaskPane.Tasklet.prototype.getViewModeExpression = function (viewModes) {
    var regex = new RegExp();
    if (viewModes) {
        var viewModesLen = viewModes.length;
        var builder = [];
        for (var i = 0; i < viewModesLen; i++) {
            builder.push(viewModes[i]);
        }
        var expr = ['(', builder.join('|'), ')'];
        regex = regex.compile(expr.join(''), "i");
    }

    return regex;
};
Sage.TaskPane.Tasklet.prototype.getEntitiesExpression = function (configEntityType) {
    var regex = new RegExp();
    if (configEntityType) {
        regex = regex.compile(configEntityType, "i");
    }
    return regex;
};

// ***** End General Task Pane Functionality *****

