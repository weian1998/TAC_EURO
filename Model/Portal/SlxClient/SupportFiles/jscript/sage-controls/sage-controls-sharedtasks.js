Sage.namespace('TaskPane');
// ***** CommonTasksTasklet functionality *****
Sage.TaskPane.Shared = function () {
    this.isAdHoc = false;
    this.hasAdHoc = false;
    this.commonTaskContainer = $("ul[id$='CommonTasksTasklet']");
    this.determineAdHocStatus();
    this.groupInfoList = {};
    this.currentGroupInfo = {};
};
Sage.TaskPane.Shared.prototype.determineAdHocStatus = function () {
    var svc = Sage.Services.getService("GroupManagerService");
    this.groupInfoList = svc.findGroupInfoList();
    this.currentGroupInfo = getCurrentGroupInfo();
    if (this.currentGroupInfo) {
        this.isAdHoc = this.currentGroupInfo.isAdhoc; // notice lower case h in isAdhoc
        this.hasAdHoc = false;
        if (this.groupInfoList && this.groupInfoList.groupInfos) {
            var groupLen = this.groupInfoList.groupInfos.length;
            for (var i = 0; i < groupLen; i++) {
                // note: current implementation of common tasks does not check if current group isAdHoc.  It includes
                // the current group in the check for isAdHoc so you will see an "Add to Group" link even if you are
                // viewing the adHoc group and it is the only adHoc group for the current entity.  Having the ability
                // to add an item to the group to which it currently belongs does not make sense.
                // To make the functionality match the current common task functionality, just remove the first check
                // in the following if statement.
                if (this.groupInfoList.groupInfos[i].groupID != this.currentGroupInfo.Id && this.groupInfoList.groupInfos[i].isAdHoc) { // notice upper case H in isAdHoc
                    this.hasAdHoc = true;
                    break;
                }
            } // end for
        } // end if this.groupInfoList
    }// end if this.currentGroupInfo
}
Sage.TaskPane.Shared.prototype.showCommonLinks = function () {
    var that = this;
    var container = $("ul[id*='item_CommonTasksTasklet_CommonTasksTasklet']");

    //if there are already common task items, don't add these
    //if ($("ul[id*='item_CommonTasksTasklet_CommonTasksTasklet']:has(li)").size() == 0) {
    if (container.find("a").size() == 0) {
        if (that.hasAdHoc) {
            that.commonTaskContainer.append("<li><a href='#' onclick='showAdHocList(Ext.EventObject);'>" + Sage.TaskPane.SharedResources.addtogroup_linktext + "</a></li>");
        }
        if (that.isAdHoc) {
            that.commonTaskContainer.append("<li><a href='#' onclick='removeSelectionsFromGroup();'>" + Sage.TaskPane.SharedResources.removefromgroup_linktext + "</a></li>");
        }
        var utility = new Sage.TaskPane.Utility();
        var viewMode = utility.getCurrentViewMode();
        if (new RegExp("list", "i").test(viewMode)) {
            that.commonTaskContainer.append("<li><a href='#' onclick='saveSelectionsAsNewGroup();'>" + Sage.TaskPane.SharedResources.saveasnewgroup_linktext + "</a></li>");
            that.commonTaskContainer.append("<li><a href='#' onclick='exportToExcel();'>" + Sage.TaskPane.SharedResources.exporttofile_linktext + "</a></li>");
        }

        var hasVisibleChildren = container.find("a:visible").size() > 0;

        if (!hasVisibleChildren) {
            container.parents(".task-pane-item").css("display", "none");
        }
    }

};

Sage.TaskPane.Utility = function () {

};

Sage.TaskPane.Utility.prototype.getCurrentEntityType = function () {
    var entityType = "";

    if (Sage.Services.hasService("ClientEntityContext")) {
        var entitySvc = Sage.Services.getService("ClientEntityContext");
        if (entitySvc) {
            var context = entitySvc.getContext();
            if (context) {
                entityType = context.EntityType;
                if (entityType) {
                    entityType = entityType.split('.').pop();
                }
            }
        }
    }
    return entityType;
};

Sage.TaskPane.Utility.prototype.getCurrentViewMode = function () {
    var viewMode = "List";

    if (Sage.Services.hasService("ClientContextService")) {
        var contextSvc = Sage.Services.getService("ClientContextService");
        if (contextSvc) {
            if (contextSvc.containsKey("modeid")) {
                viewMode = contextSvc.getValue("modeid");
            }
        }
    }

    return viewMode;
};


// ***** End CommonTasksTasklet functionality *****

$(document).ready(function () {
    var sharedTasks = new Sage.TaskPane.Shared();
    sharedTasks.showCommonLinks();

    var svc = Sage.Services.getService("GroupManagerService");
    svc.addListener(Sage.GroupManagerService.CURRENT_GROUP_CHANGED, function (sender, evt) {
        try {
            //this.__doPostBack(clientID, "");
        } catch (e) { }
    });

    Sage.TaskPane.prm = Sys.WebForms.PageRequestManager.getInstance();
    Sage.TaskPane.prm.add_pageLoaded(function (sender, args) {
        var st = new Sage.TaskPane.Shared();
        st.showCommonLinks();
    });

});