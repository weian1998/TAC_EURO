<%@ Control Language="C#" ClassName="CalendarUsersTasklet" %>

<style type="text/css">
   #grid {
    width: 100%;
    height: 14em;    
}
</style>


<div id="calUserTasklet"></div>

<script type="text/javascript">
    var calendarUsersList;
    require([
        'Sage/UI/CalendarUsersListPane',
        'dojo/ready'
    ], function (calendarUsersListPane, ready) {
        ready(function () {
            dojo.subscribe("/entity/activity/schedulerLoaded", function loadCalendarUsers(data) {
                calendarUsersListPane = new Sage.UI.CalendarUsersListPane({
                    Id: "calUserTasklet",
                    options : data
                });
            });
        });
    });
</script>

