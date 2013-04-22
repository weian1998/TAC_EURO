<%@ Control Language="C#" ClassName="TimelessActivitiesTasklet" %>

<div id="timelessTaskLet_Container" style="width:100%;height:100%;" class="">
    <%--When the Task Pane Workspace is refactored to assign real height values on resize, or to be completely dijit layout driven,
    change this BorderContainer height to 100% and the child elements will resize appropriately.--%>
    <div id="timelessTaskLet_BorderContainer" style="width:100%;height:212px;" data-dojo-type="dijit.layout.BorderContainer"></div>
</div>

<script type="text/javascript">
    var timelessActivitiesTasklet;
    require(['Sage/UI/TimelessActivitiesPane', 'dojo/ready'],
        function (timelessActivitiesTasklet, ready) {
            ready(function () {
                dojo.subscribe("/sage/ui/calendarUserList/loadedWithOptions", function loadCalendarUsers(data) {
                    timelessActivitiesTasklet = new Sage.UI.TimelessActivitiesPane({
                        Id: 'timelessTaskLet',
                        users: data,
                        gridNodeId: 'timelessTaskLet_BorderContainer'
                    });
                    timelessActivitiesTasklet.startup();
               // var userObj = { userId: Sage.Utility.getClientContextByKey('userID'), usercolor: "user1" };
                //dojo.publish('/sage/ui/calendarUser/selectionChanged/add', [userObj, null]);
                 });
            });
        }
    );
</script>