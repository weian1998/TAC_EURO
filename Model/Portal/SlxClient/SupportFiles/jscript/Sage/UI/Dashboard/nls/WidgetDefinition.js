define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            defaultWidgetText: 'Edit Widget Settings',
            settingsText: 'Settings',
            viewGroupText: 'View Group',
            Bar_Chart: 'Bar Chart',
            Column_Chart: 'Column Chart',
            Group_List: 'Group List',
            Pie_Chart: 'Pie Chart',
            Funnel_Chart: 'Funnel Chart',
            Line_Chart: 'Line Chart',
            Default: 'Default',
            Links: 'Link',
            Recently_Viewed: 'Recently Viewed',
            Todays_Activities: 'Today\'s Activities',
            Today_s_Activities: 'Today\'s Activities',
            Welcome: 'Welcome',
            Closing_Opportunities: 'Closing Opportunities',
            Quick_Actions: 'Quick Actions',
            Do_You_Know___: 'Do You Know...',
            All_Leads: 'All Leads',
            My_Notes: 'My Notes',
            Open_Opportunities: 'Open Opportunities',
            My_Top_Opportunities: 'My Top Opportunities',
            My_Pipeline: 'My Pipeline',
            Recent_Lead_Creation_History: 'Recent Lead Creation History',
            My_Activity_trend: 'My Activity trend',
            My_Completed_Activities_by_Type: 'My Completed Activities by Type',
            Active_Campaigns: 'Active Campaigns',
            All_Open_Opportunities: 'All Open Opportunities',
            Top_Opportunities: 'Top Opportunities',
            Open_Defect_Distribution: 'Open Defect Distribution',
            My_Dashboard: 'My Dashboard',
            Sales: 'Sales',
            Group_List_Description: 'Displays a list of group records by entity. For example, a group of active campaigns.',
            Welcome_Description: 'Displays an introduction to Sage SalesLogix with a link to the help topic Introducing Sage SalesLogix for Web.',
            Line_Chart_Description: 'Displays data as a series of data points connected by a line. Useful when the data represents many groups or categories.',
            Bar_Chart_Description: 'Displays data as a set of horizontal bars. Useful for comparing several sets of data.',
            Column_Chart_Description: 'Displays data as a set of vertical bars grouped by category. Useful for showing data changes over a period of time or for illustrating comparisons among items.',
            Funnel_Chart_Description: 'Displays data as progressive proportions in a funnel shape. The data is represented as portions of 100%, and there are no axes.',
            Pie_Chart_Description: 'Displays data as proportions of the whole. Each value is calculated as a percentage of the total. This chart has no axes.',
            Recently_Viewed_Description: 'Displays links to recently viewed records with an icon that identifies the type. For example, Account or Contact.',
            Todays_Activities_Description: 'Displays links to your activities for today.',
            Links_Description: 'Displays links you create. For example, to a detail view in Sage SalesLogix or to an external Web site.'
        }
    };
    return lang.mixin(LanguageList, nls);
});
