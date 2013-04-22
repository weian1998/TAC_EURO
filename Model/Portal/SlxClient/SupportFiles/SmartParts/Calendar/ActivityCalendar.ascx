<%@ Control Language="C#" CodeFile="ActivityCalendar.ascx.cs" 
    Inherits="SmartParts_Calendar_ActivityCalendar" 
    AutoEventWireup="true" %>
<%@ Register TagPrefix="Saleslogix" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" 
    Assembly="Sage.SalesLogix.Web.Controls" %>    
<%@ Register TagPrefix="SalesLogix" Namespace="Sage.SalesLogix.Web.Controls" Assembly="Sage.SalesLogix.Web.Controls" %>
<%@ Register Assembly="System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35"
    Namespace="System.Web.UI" TagPrefix="asp" %>

<Saleslogix:ScriptResourceProvider ID="ActivityResources" runat="server">
    <Keys>
        <Saleslogix:ResourceKeyName Key="CompleteText" />
        <Saleslogix:ResourceKeyName Key="TypeText" />
        <Saleslogix:ResourceKeyName Key="ContactText" />
        <Saleslogix:ResourceKeyName Key="RegardingText" />
    </Keys>
</Saleslogix:ScriptResourceProvider>

<style type="text/css">

.calendar-container
{
    height: 100%;
    width:100%;
    float:left;
    /* position:absolute;
    top: 30px;
    left:400px;
    background-color: Gray;  */
}

.calendar-container .dhx_cal_container 
{    
    border: 1px solid #A4BED4;

}



.userStyles {height:15px; width:15px; margin:4px;}
.user1 {border:1px solid #A4BF7D; background-color:#D5E2BD;}
.user2 {border:1px solid #6887B7; background-color:#CFDEF5;}
.user3 {border:1px solid #C0915A; background-color:#FBDBB5;}
.user4 {border:1px solid #A079C8; background-color:#DFC9F6;}
.user5 {border:1px solid #C1B93F; background-color:#F5F1B1;}
  


</style>

<script type="text/javascript">
    require([
        'dojo/ready'
    ], function (ready) {
        ready(function () {

            var resizeIframe = function () {
                try {
                    var newheight = parseInt(dojo.byId('centerContent').style.height) - 35;
                    dojo.byId('mainContentDetails').style.height = parseInt(dojo.byId('centerContent').style.height) + "px";
                    dojo.byId('tabContent').style.display = 'none';
                    dojo.byId('scheduler_iframe').height = newheight + "px";
                } catch (e) {
                }
            };

            dojo.connect(window, "onload", this, resizeIframe);
            dojo.connect(window, "onresize", this, resizeIframe);



            dojo.connect(dojo.byId("scheduler_iframe"), "onload", this, function () {
                

                dojo.subscribe("/entity/activity/SchedulerCreated", function update(userOptions) {
                   
                    var ac = new Sage.MainView.ActivityMgr.ActivityCalendar(window);

                    
                    dojo.subscribe("/sage/ui/calendarUserList/loaded", function loadCalendarUsers(data) {
                        
                        if (data) {
                            for (var i in data) {
                                data[i]["defaultcalendarview"] = userOptions['defaultcalendarview'];
                                data[i]["weekstartdate"] = _scheduler._week_min_date; // userOptions['weekstartdate'];
                                data[i]["weekenddate"] = _scheduler._week_max_date; //userOptions["weekenddate"];
                                data[i]["workweekstartdate"] = _scheduler._workweek_min_date; //userOptions['workweekstartdate'];
                                data[i]["workweekenddate"] = _scheduler._workweek_max_date; //userOptions['workweekenddate'];
                                data[i]["date"] = _scheduler.date;


                                data[i]["loadHistoryOnStart"] = userOptions['loadhistoryonstart'];


                                //data[i]["schedulerDate"] = ac._getSchedulerDate();
                            }
                            ac._updateSelectedUsers(data);

                            var dataObj = {};
                            dataObj.mode = userOptions['defaultcalendarview'];
                            dataObj.date = new Date();

                            ac._updateDateRange(dataObj, true);

                            dojo.publish('/sage/ui/calendarUserList/loadedNavigationCalendar', [userOptions['weekstart'], this]);

                            dojo.publish('/sage/ui/calendarUserList/loadedWithOptions', [data, this]);
                        }
                    });

                    dojo.subscribe("/sage/ui/calendarUser/selectionChanged/add", function addUser(data) {
                        
                        var userAr = [];
                        var userObj = {};
                        userObj["userId"] = data.userId.toString();
                        userObj["usercolor"] = data.usercolor.toString();
                        userAr[data.userId.toString()] = userObj;

                        ac._updateSelectedUsers(userAr, false, userOptions['loadhistoryonstart']);

                    });
                    dojo.subscribe("/sage/ui/calendarUser/selectionChanged/remove", function removeUser(data) {

                        var userAr = [];
                        var userObj = {};
                        userObj["userId"] = data.userId.toString();
                        userAr[data.userId.toString()] = userObj;

                        ac._updateSelectedUsers(userAr, true);

                        ac._updateCalendarUsers(data.userId.toString(), "remove");
                        ac._reloadUserCalendars(data.userId);
                    });


                    dojo.subscribe("/entity/activity/calendar/schedulerDateChanged", function (data) {
                        if (data) {
                            ac._updateDateRange(data, false);
                        }
                    });

                    dojo.publish('/entity/activity/schedulerLoaded', [userOptions, this]);
                });


                var sc = dojo.byId('scheduler_iframe').contentWindow.scheduler;
                
                var acs = new Sage.UI.ActivityScheduler(sc, 'slxLogixScheduler', dojo.byId("scheduler_iframe").contentWindow, "scheduler_iframe");
                
                dojo.subscribe("/entity/activity/loadScheduler", function loadMe(data) {                    
                    acs._loadAllEvents(data);
                });
                dojo.subscribe("/entity/activity/calendar/navigationCalendarDateChanged", function setDate(date) {
                    acs._setCurrentDate(date);
                });
                dojo.subscribe("/entity/activity/clearSchedulerEvents", function clear(data) {
                    acs._clearSchedulerEvents(data);
                });


            });

            var titleContentPane = dijit.byId('titlePane');
            titleContentPane._hideEmptyTabBar();

        });
    });
</script>

<div style="display: none">
    <asp:Panel ID="wnTools" runat="server">
        <SalesLogix:PageLink ID="ActivityCalendarHelpLink" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="caldailyforact" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16"></SalesLogix:PageLink>
    </asp:Panel>
</div>
<%--   <br/>
<span id="ScheduleToolBar" class="" dojoType="Sage.UI.ScheduleContextMenuBar"> <br/></span> 
<br/>--%>
<%--<div id="timelessDiv" class="" style="height:100%;">--%>
    <%--  We need a "container" div --%>
    <%--<div id="placeholder" runat="server" class="timeless-container" ></div>--%>
    <div id="tempCalendarDiv" class="formtable" style="display:none;"></div>
    <div id="calendar" class="calendar-container">
        
        <IFRAME SRC="SmartParts/Calendar/scheduler.htm" 
                id="scheduler_iframe" 
                title="Scheduler"
                width = "100%" 
                height="900" 
                frameborder="0"                
                scrolling="auto">
       
            <!-- Alternate content for non-supporting browsers -->
            <H2>Iframe</H2>
        </IFRAME>

    </div>
<%--</div>--%>
