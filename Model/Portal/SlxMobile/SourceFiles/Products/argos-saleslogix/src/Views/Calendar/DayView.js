define('Mobile/SalesLogix/Views/Calendar/DayView', [
    'dojo/_base/declare',
    'dojo/string',
    'dojo/query',
    'dojo/dom-class',
    'Sage/Platform/Mobile/ErrorManager',
    'Sage/Platform/Mobile/Convert',
    'Sage/Platform/Mobile/List'
], function(
    declare,
    string,
    query,
    domClass,
    ErrorManager,
    convert,
    List
) {

    return declare('Mobile.SalesLogix.Views.Calendar.DayView', [List], {
        // Localization
        titleText: 'Calendar',
        dateHeaderFormatText: 'dddd, MM/dd/yyyy',
        startTimeFormatText: 'h:mm',
        todayText: 'Today',
        dayText: 'Day',
        weekText: 'Week',
        monthText: 'Month',
        allDayText: 'All-Day',
        eventHeaderText: 'Events',
        activityHeaderText: 'Activities',
        eventMoreText: 'View ${0} More Event(s)',
        toggleCollapseText: 'toggle collapse',

        // Templates
        widgetTemplate: new Simplate([
            '<div id="{%= $.id %}" title="{%= $.titleText %}" class="list {%= $.cls %}" {% if ($.resourceKind) { %}data-resource-kind="{%= $.resourceKind %}"{% } %}>',
            '<div data-dojo-attach-point="searchNode"></div>',
            '<a href="#" class="android-6059-fix">fix for android issue #6059</a>',
            '{%! $.navigationTemplate %}',
            '<div style="clear:both"></div>',
            '<div class="event-content event-hidden" data-dojo-attach-point="eventContainerNode">',
                '<h2 data-action="toggleGroup">{%= $.eventHeaderText %}<button class="collapsed-indicator" aria-label="{%: $$.toggleCollapseText %}"></button></h2>',
                '<ul class="list-content" data-dojo-attach-point="eventContentNode"></ul>',
                '{%! $.eventMoreTemplate %}',
            '</div>',
            '<h2>{%= $.activityHeaderText %}</h2>',
            '<ul class="list-content" data-dojo-attach-point="contentNode"></ul>',
            '{%! $.moreTemplate %}',
            '</div>'
        ]),
        rowTemplate: new Simplate([
            '<li data-action="activateEntry" data-key="{%= $.$key %}" data-descriptor="{%: $.Description %}" data-activity-type="{%: $.Type %}">',
            '<table class="calendar-entry-table"><tr>',
            '<td class="entry-table-icon">',
            '<button data-action="selectEntry" class="list-item-selector button">',
                '<img src="{%= $$.activityIconByType[$.Type] || $$.icon || $$.selectIcon %}" class="icon" />',
            '</button>',
            '</td>',
            '<td class="entry-table-time">{%! $$.timeTemplate %}</td>',
            '<td class="entry-table-description">{%! $$.itemTemplate %}</td>',
            '</tr></table>',
            '</li>'
        ]),
        eventRowTemplate: new Simplate([
            '<li data-action="activateEntry" data-key="{%= $.$key %}" data-descriptor="{%: $.$descriptor %}" data-activity-type="Event">',
            '<table class="calendar-entry-table"><tr>',
            '<td class="entry-table-icon">',
            '<button data-action="selectEntry" class="list-item-selector button">',
            '<img src="{%= $$.eventIcon %}" class="icon" /></button>',
            '</td>',
            '<td class="entry-table-description">{%! $$.eventItemTemplate %}</td>',
            '</tr></table>',
            '</li>'
        ]),
        timeTemplate: new Simplate([
            '{% if ($.Timeless) { %}',
                '<span class="p-time">{%= $$.allDayText %}</span>',
            '{% } else { %}',
                '<span class="p-time">{%: Mobile.SalesLogix.Format.date($.StartDate, $$.startTimeFormatText) %}</span>',
                '<span class="p-meridiem">{%: Mobile.SalesLogix.Format.date($.StartDate, "tt") %}</span>',
            '{% } %}'
        ]),
        itemTemplate: new Simplate([
            '<h3 class="p-description">{%: $.Description %}</h3>',
            '<h4>{%= $$.nameTemplate.apply($) %}</h4>'
        ]),
        eventItemTemplate: new Simplate([
            '<h3 class="p-description">{%: $.Description %} ({%: $.Type %})</h3>',
            '<h4>{%! $$.eventNameTemplate %}</h4>'
        ]),
        nameTemplate: new Simplate([
            '{% if ($.ContactName) { %}',
            '{%: $.ContactName %} / {%: $.AccountName %}',
            '{% } else if ($.AccountName) { %}',
            '{%: $.AccountName %}',
            '{% } else { %}',
            '{%: $.LeadName %}',
            '{% } %}'
        ]),
        eventNameTemplate: new Simplate([
            '{%: Mobile.SalesLogix.Format.date($.StartDate, $$.eventDateFormatText) %}',
            '&nbsp;-&nbsp;',
            '{%: Mobile.SalesLogix.Format.date($.EndDate, $$.eventDateFormatText) %}'
        ]),
        navigationTemplate: new Simplate([
            '<div class="split-buttons">',
            '<button data-tool="today" data-action="getToday" class="button">{%: $.todayText %}</button>',
            '<button data-tool="selectdate" data-action="selectDate" class="button"><span></span></button>',
            '<button data-tool="day" class="button">{%: $.dayText %}</button>',
            '<button data-tool="week" data-action="navigateToWeekView" class="button">{%: $.weekText %}</button>',
            '<button data-tool="month" data-action="navigateToMonthView" class="button">{%: $.monthText %}</button>',
            '</div>',
            '<div class="nav-bar">',
            '<button data-tool="next" data-action="getNextDay" class="button button-next"><span></span></button>',
            '<button data-tool="prev" data-action="getPrevDay" class="button button-prev"><span></span></button>',
            '<h3 class="date-text" data-dojo-attach-point="dateNode"></h3>',
            '</div>'
        ]),
        eventMoreTemplate: new Simplate([
            '<div class="list-more" data-dojo-attach-point="eventMoreNode">',
            '<button class="button" data-action="activateEventMore">',
            '<span data-dojo-attach-point="eventRemainingContentNode">{%= $.eventMoreText %}</span>',
            '</button>',
            '</div>'
        ]),
        attributeMap:{
            listContent: {
                node: 'contentNode',
                type: 'innerHTML'
            },
            eventListContent: {
                node: 'eventContentNode',
                type: 'innerHTML'
            },
            dateContent: {
                node: 'dateNode',
                type: 'innerHTML'
            },
            eventRemainingContent: {
                node: 'eventRemainingContentNode',
                type: 'innerHTML'
            }
        },

        //View Properties
        id: 'calendar_daylist',
        cls: 'activities-for-day',
        icon: 'content/images/icons/Calendar_24x24.png',
        datePickerView: 'generic_calendar',
        monthView: 'calendar_monthlist',
        weekView: 'calendar_weeklist',
        activityDetailView: 'activity_detail',
        eventDetailView: 'event_detail',
        insertView: 'activity_types_list',
        enableSearch: false,
        currentDate: null,
        contractName: 'system',
        queryOrderBy: 'Timeless desc, StartDate',
        querySelect: [
            'Description',
            'StartDate',
            'Type',
            'AccountName',
            'ContactName',
            'LeadId',
            'LeadName',
            'UserId',
            'Timeless',
            'Recurring'
        ],
        eventFeed: null,
        eventPageSize: 3,
        eventQuerySelect: [
            'StartDate',
            'EndDate',
            'Description',
            'Type'
        ],
        activityIconByType: {
            'atToDo': 'content/images/icons/To_Do_24x24.png',
            'atPhoneCall': 'content/images/icons/Call_24x24.png',
            'atAppointment': 'content/images/icons/Meeting_24x24.png',
            'atLiterature': 'content/images/icons/Schedule_Literature_Request_24x24.gif',
            'atPersonal': 'content/images/icons/Personal_24x24.png',
            'atQuestion': 'content/images/icons/help_24.png',
            'atNote': 'content/images/icons/note_24.png',
            'atEMail': 'content/images/icons/letters_24.png'
        },
        eventIcon: 'content/images/icons/Holiday_schemes_24.png',

        resourceKind: 'activities',

        _onRefresh: function(o) {
            this.inherited(arguments);
            if (o.resourceKind === 'activities' || o.resourceKind === 'events')
            {
                this.refreshRequired = true;
            }
        },
        init: function() {
            this.inherited(arguments);
            this.currentDate = Date.today().clearTime();
        },
        toggleGroup: function(params) {
            var node = params.$source;
            if (node && node.parentNode) {
                domClass.toggle(node, 'collapsed');
                domClass.toggle(node.parentNode, 'collapsed-event');
            }
        },
        refresh: function() {
            this.clear();

            this.options = this.options || {};
            this.options['where'] = this.formatQueryForActivities();
            this.feed = null;
            this.eventFeed = null;
            this.set('dateContent', this.currentDate.toString(this.dateHeaderFormatText));

            this.requestData();
            this.requestEventData();
        },
        requestEventData: function() {
            var request = this.createEventRequest();
            request.read({
                success: this.onRequestEventDataSuccess,
                failure: this.onRequestEventDataFailure,
                aborted: this.onRequestEventDataAborted,
                scope: this
            });
        },
        onRequestEventDataFailure: function(response, o) {
            alert(string.substitute(this.requestErrorText, [response, o]));
            ErrorManager.addError(response, o, this.options, 'failure');
        },
        onRequestEventDataAborted: function(response, o) {
            this.options = false; // force a refresh
            ErrorManager.addError(response, o, this.options, 'aborted');
        },
        onRequestEventDataSuccess: function(feed) {
            this.processEventFeed(feed);
        },
        createEventRequest: function() {
            var eventSelect = this.eventQuerySelect,
                eventWhere = this.getEventQuery(),
                request = new Sage.SData.Client.SDataResourceCollectionRequest(this.getService())
                .setCount(this.eventPageSize)
                .setStartIndex(1)
                .setResourceKind('events')
                .setQueryArg(Sage.SData.Client.SDataUri.QueryArgNames.Select, this.expandExpression(eventSelect).join(','))
                .setQueryArg(Sage.SData.Client.SDataUri.QueryArgNames.Where, eventWhere);
            return request;
        },
        getEndOfDay: function() {
            return new Date(this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                this.currentDate.getDate(),
                23, 59, 59);
        },
        getEventQuery: function() {
            return string.substitute(
                    [
                        'UserId eq "${0}" and (',
                            '(StartDate gt @${1}@ or EndDate gt @${1}@) and ',
                            'StartDate lt @${2}@',
                        ')'
                    ].join(''),
                [
                    App.context['user'] && App.context['user']['$key'],
                    convert.toIsoStringFromDate(this.currentDate),
                    convert.toIsoStringFromDate(this.getEndOfDay())
                ]
                );
        },
        activateEventMore: function() {
            var view = App.getView("event_related"),
                where = this.getEventQuery();
            if (view)
                view.show({"where": where});
        },
        hideEventList: function() {
            domClass.add(this.eventContainerNode, 'event-hidden');
        },
        showEventList: function() {
            domClass.remove(this.eventContainerNode, 'event-hidden');
        },
        processEventFeed: function(feed) {
            var r = feed['$resources'],
                feedLength = r.length,
                o = [];
            this.eventFeed = feed;

            if (feedLength === 0)
            {
                this.hideEventList();
                return false;
            }
            else
            {
                this.showEventList();
            }

            for (var i = 0; i < feedLength; i++)
            {
                var row = r[i];
                row.isEvent = true;
                this.entries[row.$key] = row;
                o.push(this.eventRowTemplate.apply(row, this));
            }


            if (feed['$totalResults'] > feedLength)
            {
                domClass.add(this.eventContainerNode, 'list-has-more');
                this.set('eventRemainingContent', string.substitute(this.eventMoreText, [feed['$totalResults'] - feedLength]));
            }
            else
            {
                domClass.remove(this.eventContainerNode, 'list-has-more');
                this.set('eventRemainingContent', '');
            }

            this.set('eventListContent', o.join(''));
        },
        processFeed: function(feed) {
            var r = feed['$resources'],
                feedLength = r.length,
                o = [];

            this.feed = feed;
            for (var i = 0; i < feedLength; i++)
            {
                var row = r[i];
                row.isEvent = false;
                this.entries[row.$key] = row;
                o.push(this.rowTemplate.apply(row, this));
            }

            if (feedLength === 0)
            {
                this.set('listContent', this.noDataTemplate.apply(this));
                return false;
            }

            this.set('listContent', o.join(''));
        },

        show: function(options) {
            if (options)
                this.processShowOptions(options);

            options = options || {};
            options['where'] = this.formatQueryForActivities();

            this.set('dateContent', this.currentDate.toString(this.dateHeaderFormatText));
            this.inherited(arguments, [options]);
        },
        processShowOptions: function(options) {
            if (options.currentDate)
            {
                this.currentDate = Date.parseExact(options.currentDate,'yyyy-MM-dd').clearTime() || Date.today().clearTime();
                this.refreshRequired = true;
            }
        },
        isLoading: function() {
            return domClass.contains(this.domNode, 'list-loading');
        },
        getNextDay: function() {
            if (this.isLoading()) return;
            
            this.currentDate.add({day: 1});
            this.refresh();
        },
        getToday: function() {
            if (this.isLoading()) return;
            if (this.currentDate.equals(Date.today())) return;

            this.currentDate = Date.today().clearTime();
            this.refresh();
        },
        getPrevDay: function() {
            if (this.isLoading()) return;

            this.currentDate.add({day: -1});
            this.refresh();
        },
        formatQueryForActivities: function() {
            var queryWhere = [
                'UserActivities.UserId eq "${0}" and Type ne "atLiterature" and (',
                '(Timeless eq false and StartDate between @${1}@ and @${2}@) or ',
                '(Timeless eq true and StartDate between @${3}@ and @${4}@))'
            ].join('');

            return string.substitute(
                queryWhere,
                [App.context['user'] && App.context['user']['$key'],
                convert.toIsoStringFromDate(this.currentDate),
                convert.toIsoStringFromDate(this.currentDate.clone().add({day: 1, second: -1})),
                this.currentDate.toString('yyyy-MM-ddT00:00:00Z'),
                this.currentDate.toString('yyyy-MM-ddT23:59:59Z')]
            );
        },
        selectEntry: function(params) {
            var row = query(params.$source).closest('[data-key]')[0],
                key = row ? row.getAttribute('data-key') : false;

            this.navigateToDetailView(key);
        },
        selectDate: function() {
            var options = {
                date: this.currentDate,
                showTimePicker: false,
                timeless: false,
                tools: {
                    tbar: [{
                        id: 'complete',
                        fn: this.selectDateSuccess,
                        scope: this
                    },{
                        id: 'cancel',
                        side: 'left',
                        fn: ReUI.back,
                        scope: ReUI
                    }]
                    }
                },
                view = App.getView(this.datePickerView);
            if (view)
                view.show(options);
        },
        selectDateSuccess: function() {
            var view = App.getPrimaryActiveView();
            this.currentDate = view.getDateTime().clearTime();
            this.refresh();
            ReUI.back();
        },
        navigateToWeekView: function() {
            var view = App.getView(this.weekView),
                options = {currentDate: this.currentDate.toString('yyyy-MM-dd') || Date.today()};
            view.show(options);
        },
        navigateToMonthView: function() {
            var view = App.getView(this.monthView),
                options = {currentDate: this.currentDate.toString('yyyy-MM-dd') || Date.today()};
            view.show(options);
        },
        navigateToInsertView: function(el) {
            var view = App.getView(this.insertView || this.editView);

            this.options.currentDate = this.currentDate.toString('yyyy-MM-dd') || Date.today();
            if (view)
            {
                view.show({
                    negateHistory: true,
                    returnTo: this.id,
                    insert: true
                });
            }
        },
        navigateToDetailView: function(key, descriptor) {
            var entry = this.entries[key],
                detailView = (entry.isEvent) ? this.eventDetailView : this.activityDetailView,
                view = App.getView(detailView);
            descriptor = (entry.isEvent) ? descriptor : entry.Description;
            if (view)
                view.show({
                    descriptor: descriptor,
                    key: key
                });
        }
    });
});