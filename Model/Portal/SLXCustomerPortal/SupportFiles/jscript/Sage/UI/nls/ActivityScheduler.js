define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            tooltipTime: 'Time',
            tooltipContactName: 'Contact',
            tooltipAccountName: 'Account',
            tooltipCompanyName: 'Company',
            tooltipLeadName: 'Lead',
            tooltipPhoneNumber: 'Phone',
            tooltipRegarding: 'Regarding',
            tooltipPriority: 'Priority',
            tooltipNotes: 'Notes',
            tooltipType: 'Type',
            tooltipDayType: 'Day Type',
            tooltipStartDate: 'Start Date',
            tooltipEndDate: 'End Date',
            tooltipLocation: 'Location',
            tooltipDescription: 'Description',
            completedText: '(Completed)',
            tooltipMoreActivities: 'Click for more activities',
            scheduler_dates:{
		        month_full:["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		        month_short:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		        day_full:["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    	        day_short:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            },
            scheduler_labels: {
                dhx_cal_today_button: "Today",
                day_tab: "Day",
                week_tab: "Week",
                workweek_tab : "Work week",
                month_tab: "Month",
                new_event: "New event",
                icon_save: "Save",
                icon_cancel: "Cancel",
                icon_details: "Details",
                icon_edit: "Edit",
                icon_delete: "Delete",
                confirm_closing: "", //Your changes will be lost, are your sure ?
                confirm_deleting: "Event will be deleted permanently, are you sure?",
                section_description: "Description",
                section_time: "Time period",
                full_day: "Full day",

                /*recurring events*/
                confirm_recurring: "Do you want to edit the whole set of repeated events?",
                section_recurring: "Repeat event",
                button_recurring: "Disabled",
                button_recurring_open: "Enabled",

                /*agenda view extension*/
                agenda_tab: "Agenda",
                date: "Date",
                description: "Description",

                /*year view extension*/
                year_tab: "Year",

                /* week agenda extension */
                week_agenda_tab: "Agenda"
            }
        }
    };
    return lang.mixin(LanguageList, nls);
});