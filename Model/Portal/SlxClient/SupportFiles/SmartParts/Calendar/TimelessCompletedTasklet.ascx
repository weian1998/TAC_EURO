<%@ Control Language="C#" ClassName="TimelessCompletedTasklet" %>

<div id="timelessCompletedTaskLet_Container" style="width:100%;height:100%;" class="">
    <%--When the Task Pane Workspace is refactored to assign real height values on resize, or to be completely dijit layout driven,
    change this BorderContainer height to 100% and the child elements will resize appropriately.--%>
    <div id="timelessCompletedTaskLet_BorderContainer" style="width:100%;height:212px;" data-dojo-type="dijit.layout.BorderContainer"></div>
</div>

<script type="text/javascript">
    var timelessCompletedTasklet;
    require(['Sage/UI/TimelessActivitiesPane', 'dojo/ready'],
        function (timelessCompletedTasklet, ready) {
            ready(function () {
                dojo.subscribe("/sage/ui/calendarUserList/loadedWithOptions", function loadCalendarUsers(data) {
                    timelessCompletedTasklet = new Sage.UI.TimelessActivitiesPane({
                        Id: 'timelessCompletedTaskLet',
                        mode : 'completed',
                        users: data,
                        gridNodeId: 'timelessCompletedTaskLet_BorderContainer'
                    });
                    timelessCompletedTasklet.startup();
                    // var userObj = { userId: Sage.Utility.getClientContextByKey('userID'), usercolor: "user1" };
                    //dojo.publish('/sage/ui/calendarUser/selectionChanged/add', [userObj, null]);
                });
            });
        }
    );
</script>