<%@ Control Language="C#" ClassName="CalendarNavigatorTasklet" %>

<style type="text/css">
.task-pane-item-body {
    width: 100%;
}
.claro .dijitCalendar 
{
    width: 100%;
}
    
</style>
   
     
<div id="timeless-Calendar"></div>

<script type="text/javascript">
    require([
        'dojo/ready'
    ], function (ready) {
        ready(function () {

            dojo.subscribe("/sage/ui/calendarUserList/loadedNavigationCalendar", function initCalendar(weekStart) {

                dojo.cldr.supplemental.getFirstDayOfWeek = function () {
                    return parseInt(weekStart);
                };

                var c = new Sage.UI.Calendar({}, "timeless-Calendar");
            });
        });
    });
</script>
     
     