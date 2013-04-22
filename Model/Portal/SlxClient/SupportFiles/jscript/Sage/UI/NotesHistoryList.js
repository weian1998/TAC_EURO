/*globals Sage, dojo define */
define([
        'dijit/_Widget',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'Sage/Utility/Activity',
        'Sage/Utility/Email',        
        'Sage/Utility',
        'Sage/UI/SLXPreviewGrid',
        'Sage/UI/Columns/DateTime',
        'Sage/UI/Columns/SlxLink',
        'Sage/UI/SLXPreviewGrid/Filter/Text',
        'Sage/UI/SLXPreviewGrid/Filter/_previewGridFilterMixin',
        'dojo/data/ItemFileReadStore',
        'dijit/form/FilteringSelect',
        'dijit/form/CheckBox',
        'Sage/UI/Dialogs',
        'dojo/string',
        'dojo/date/locale',
        'dojo/i18n!./nls/NotesHistoryList',
        'dojo/_base/declare'
], function (_Widget,
    _Templated,
    _WidgetsInTemplateMixin,
    activityUtility,
    email,
    utility,
    PreviewGrid,
    DateTimeColumn,
    LinkColumn,
    textFilter,
    filterMixin,
    ItemFileReadStore,
    FilteringSelect,
    CheckBox,
    sageDialogs,
    dojoString,
    dateLocale,
    notesHistoryListStrings,
    declare) {
    var filterTypeWidget = declare('Sage.UI.HistoryTypeFilterWidget', [_Widget, _Templated, _WidgetsInTemplateMixin, filterMixin], {
        // summary:
        //  Filter widget for the history type.   Combination of a dropdown (note the available types are hard-coded)
        //  and a checkbox to enable showing the DB changes
        templateString: ['<div>',
            '<div dojoAttachPoint="selectContainer"></div>',
            '<div class="chkShowDBChanges">',
            '<input id="chkShowDbChanges" type="checkbox" dojoType="dijit.form.CheckBox" dojoAttachPoint="chkShowDbChanges" />',
            '<label for="chkShowDbChanges">',
                notesHistoryListStrings.showDbChangesText,
            '</label>',
            '</div>',
        '</div>'].join(''),

        buildRendering: function () {
            this.inherited(arguments);
            var options = [];
            dojo.forEach(["atAppointment", "atPhoneCall", "atToDo", "atNote", "atPersonal", "atInternal", "atSchedule", "atEMail", "atDoc", "atFax", "atLiterature", "atDatabaseChange"], function (item) {
                options.push({ name: activityUtility.getActivityTypeName(item), id: item });
            });
            var store = new ItemFileReadStore({
                data: {
                    items: options,
                    label: 'name',
                    identifier: 'id'
                }
            });
            this._select = new FilteringSelect({
                store: store,
                required: false
            }, this.selectContainer);
        },
        getQuery: function () {
            var showDb = this.chkShowDbChanges.get('checked');
            var type = this._select.get('value');
            if (type) {
                var c = '(Type eq "' + type + '"';
                if (showDb) {
                    c += ' or Type eq "atDatabaseChange"';
                }
                c += ')';
                return c;
            } else if (!showDb) {
                return 'Type ne "atDatabaseChange"';
            }
            return '';
        },
        reset: function () {
            this._select.set('value', '');
            this.chkShowDbChanges.set('checked', false);
        },
        getState: function () {
            return {
                'value': this._select.get('value'),
                'showDBChanges': this.chkShowDbChanges.get('checked')
            };
        },
        applyState: function (state) {
            if (state) {
                this._select.set('value', state['value'] || '');
                this.chkShowDbChanges.set('checked', state['showDBChanges']);
            }
        }
    });
    var completedDateRangeFilter = declare(Sage.UI.SLXPreviewGrid.Filter.DateRange, {
        //to override getQuery on base DateRange filter...
        getQuery: function () {
            var toIsoStringFromDate = function (value, isUpperBound) {
                // format to ISO
                // if isUpperBound is true it will add 1 day (used for upper bound in date range)
                if (!value)
                    return '';
                if (value.constructor !== Date)
                    value = Date.parse(value);
                if (isUpperBound) {
                    value.setUTCDate(value.getUTCDate() + 1);
                }
                return utility.Convert.toIsoStringFromDate(value);
            };
            var toTimelessIsoString = function (value, isUpperBound) {
                if (!value)
                    return '';
                if (value.constructor !== Date)
                    value = Date.parse(value);
                var pad = function (n) { return n < 10 ? '0' + n : n; };
                return [
                    value.getFullYear(),
                    '-',
                    pad(value.getMonth() + 1),
                    '-',
                    pad(value.getDate()),
                    (isUpperBound) ? 'T23:59:59Z' : 'T00:00:00Z'
                ].join('');
            };

            /*

            Logic for CompletedDate:
            Since the timeless flag only kindof indicates CompletedDate is a timeless value, we have to have additional logic.

            To see if it really is timeless you need:
            Timeless = true and CompletedDate = OriginalDate

            (((Timeless = false) or (Timeless = true and CompletedDate != OriginalDate)) and CompletedDate between <localgmtvalue fromdate> and <localgmtvalue todate>)
            or
            ((Timeless = true and CompletedDate = OriginalDate) and CompletedDate between <from00:00:00Z> and <to23:59:59Z>)

            */

            var dFrom = this.dteFrom.get('value');
            var dTo = this.dteTo.get('value');
            var fmt;
            var qry = '';
            if (!dFrom && !dTo) {
                return '';
            }
            if (dTo && dFrom) {
                fmt = [
                        '((((Timeless eq true and CompletedDate eq OriginalDate) and (CompletedDate ge \'${0}\' and CompletedDate lt \'${1}\'))) or',
                        '(((Timeless eq false) or (Timeless eq true and CompletedDate ne OriginalDate)) and (CompletedDate ge \'${2}\' and CompletedDate lt \'${3}\')))'
                    ].join('');
                qry = dojoString.substitute(fmt, [toTimelessIsoString(dFrom), toTimelessIsoString(dTo, true), toIsoStringFromDate(dFrom), toIsoStringFromDate(dTo, true)]);
            } else if (dFrom && !dTo) {
                fmt = [
                        '((((Timeless eq true and CompletedDate eq OriginalDate) and CompletedDate ge \'${0}\')) or',
                        '(((Timeless eq false) or (Timeless eq true and CompletedDate ne OriginalDate)) and CompletedDate ge \'${1}\'))'
                    ].join('');
                qry = dojoString.substitute(fmt, [toTimelessIsoString(dFrom), toIsoStringFromDate(dFrom)]);
            } else if (dTo && !dFrom) {
                fmt = [
                        '((((Timeless eq true and CompletedDate eq OriginalDate) and CompletedDate lt \'${0}\')) or',
                        '(((Timeless eq false) or (Timeless eq true and CompletedDate ne OriginalDate)) and CompletedDate lt \'${1}\'))'
                    ].join('');
                qry = dojoString.substitute(fmt, [toTimelessIsoString(dTo, true), toIsoStringFromDate(dTo, true)]);
            }
            return qry;
        }
    });
    var notesHistoryList = declare('Sage.UI.NotesHistoryList', [_Widget], {
        placeholder: '',
        parentRelationshipName: '',
        workspace: '',
        tabId: '',
        connections: [],
        constructor: function () {
            this.connections = [];
        },
        startup: function () {
            var columnConfig = [
                {
                    field: '$key',
                    editable: false,
                    hidden: true,
                    id: 'id',
                    formatter: function (value, rowIdx, cel) {
                        var insertId = [cel.grid.id, '-row', rowIdx].join('');
                        var id = (utility.getModeId() === 'insert') ? insertId : value;
                        var anchor = ['<div id=', id, ' >', id, '</ div>'].join('');
                        return anchor;
                    }
                }, {
                    field: 'Type',
                    name: notesHistoryListStrings.typeText,
                    type: activityUtility.historyTypeCell,
                    width: '90px',
                    filterConfig: { widgetType: filterTypeWidget }
                }, {
                    field: 'CompletedDate',
                    name: notesHistoryListStrings.dateTimeText,
                    type: DateTimeColumn,
                    useFiveSecondRuleToDetermineTimeless: true,
                    width: '100px',
                    filterConfig: {
                        widgetType: completedDateRangeFilter,
                        label: notesHistoryListStrings.dateRangeText
                    }
                }, {
                    field: 'UserName',
                    name: notesHistoryListStrings.userText,
                    width: '90px',
                    filterConfig: { widgetType: textFilter }
                }
            ];

            this._addEntitySpecificColumns(columnConfig);

            columnConfig.push({
                field: 'Description',
                name: notesHistoryListStrings.regardingText,
                width: '200px',
                filterConfig: { widgetType: textFilter }
            });
            columnConfig.push({
                field: 'Result',
                name: notesHistoryListStrings.resultText,
                width: '90px'
            });
            columnConfig.push({
                field: 'Category',
                name: notesHistoryListStrings.categoryText,
                width: '90px'
            });

            var toolConfig = [
                {
                    id: 'SendEmail',
                    imageClass: 'icon_Send_Write_email_16x16',
                    tooltip: notesHistoryListStrings.sendEmailText,
                    handler: this.onSendEmailClick,
                    scope: this
                }, {
                    id: 'SendWord',
                    imageClass: 'icon_Document_Type_16x16',
                    tooltip: notesHistoryListStrings.sendToWordText,
                    handler: this.onSendToWordClick,
                    scope: this
                }, {
                    id: 'NewNote',
                    imageClass: 'icon_New_Note_16x16',
                    tooltip: notesHistoryListStrings.addNoteText,
                    handler: Sage.Link.newNote,
                    scope: Sage.Link
                }, {
                    id: 'CompleteActivity',
                    imageClass: 'icon_complete_activity_16x16',
                    tooltip: notesHistoryListStrings.completeAnActivityText,
                    handler: Sage.Link.scheduleCompleteActivity,
                    scope: Sage.Link
                }, {
                    id: 'Help',
                    imageClass: 'icon_Help_16x16',
                    handler: function () { utility.openHelp('noteshistory'); },
                    tooltip: notesHistoryListStrings.helpText
                }
            ];

            var parentRelationshipName = this.parentRelationshipName;
            var options = {
                tools: toolConfig,
                columns: columnConfig,
                previewField: 'LongNotes',
                storeOptions: {
                    select: ['Type', 'CompletedDate', 'UserName', 'AccountName', 'ContactName', 'ContactId', 'OpportunityName', 'OpportunityId', 'Description', 'LongNotes', 'Timeless', 'Result'],
                    resourceKind: 'history',
                    sort: [{ attribute: 'CompletedDate'}]
                },
                //specifying sort here ^ means that this is always applied.  For example,
                //  when the user sorts by Result, the items are grouped by sorted results, but
                //  they are also sorted by CompletedDate within each Result value.
                slxContext: { workspace: this.workspace, tabId: this.tabId },
                contextualCondition: function () {
                    var fmt = '${0} eq \'${1}\'';
                    return dojoString.substitute(fmt, [parentRelationshipName, utility.getCurrentEntityId()]);
                },
                dblClickAction: Sage.Link.editHistory
            };
            
            //fire this so that customizations can change these options without overriding the whole thing
            this.onBeforeCreateGrid(options);
            var grid = new Sage.UI.SLXPreviewGrid.Grid(options, this.placeHolder);
            grid.startup();
            var localTC = dijit.byId('tabContent');
            localTC.resize();
            localTC.resize();

            this.connections.push(dojo.subscribe('/entity/history/create', this, this.onHistoryChanges));
            this.connections.push(dojo.subscribe('/entity/history/change', this, this.onHistoryChanges));
            this.connections.push(dojo.subscribe('/entity/history/delete', this, this.onHistoryChanges));
            dojo.connect(grid, 'destroy', this, this.destroy);
            this._grid = grid;
        },
        onHistoryChanges: function (history) {
            this._grid.refresh();
        },
        destroy: function () {
            for (var i = 0; i < this.connections.length; i++) {
                dojo.unsubscribe(this.connections.pop());
            }
            this.inherited(arguments);
        },
        _addEntitySpecificColumns: function (list) {
            var entityType = Sage.Services.getService('ClientEntityContext').getContext().EntityType;
            switch (entityType) {
                case "Sage.Entity.Interfaces.IAccount":
                case "Sage.Entity.Interfaces.IOpportunity":
                    list.push({
                        field: 'ContactName',
                        name: notesHistoryListStrings.contactText,
                        width: '100px',
                        type: LinkColumn,
                        idField: 'ContactId',
                        pageName: 'Contact'
                    });
                    break;
                case "Sage.Entity.Interfaces.IContact":
                    list.push({
                        field: 'OpportunityName',
                        name: notesHistoryListStrings.opportunityText,
                        width: '100px',
                        type: LinkColumn,
                        idField: 'OpportunityId',
                        pageName: 'Opportunity'
                    });
                    break;
            }
        },
        onSendEmailClick: function () {
            // handler for send email button
            var notes = this._grid.getSelectedRecords(["Description", "LongNotes", "AccountName", "ContactName", "CompletedDate", "UserName"]);
            if (notes.length == 0) {
                sageDialogs.showWarning(notesHistoryListStrings.pleaseSelectRecordsText);
                return;
            }
            var body = dojo.map(notes, function (n) {
                var txt = notesHistoryListStrings.accountText + ": " + n.AccountName + "\n";
                if (n.ContactName)
                    txt += notesHistoryListStrings.contactText + ": " + n.ContactName + "\n";
                var dateObject = utility.Convert.toDateFromString(n.CompletedDate);
                txt += notesHistoryListStrings.dateText + ": ";
                txt += dateLocale.format(dateObject) + "\n";
                txt += notesHistoryListStrings.userText + ": " + n.UserName + "\n";
                txt += notesHistoryListStrings.regardingText + ": " + n.Description + "\n\n";
                txt += notesHistoryListStrings.notesText + ":\n" + n.LongNotes;
                return txt;
            }).join("\n\n---------------------------------------------\n\n");

            var subject = dojo.map(notes, function (n) { return n.Description; }).join("; ");
            email.writeEmail("", subject, body);
        },
        onSendToWordClick: function () {
            // handler for send to word button
            var getWordApplication = function () {
                if (Sage.gears) {
                    // Sage - this is prefered, if available, because it will bypass the security dialog
                    try {
                        var cf = Sage.gears.factory.create("com.factory");
                        return cf.newActiveXObject("Word.Application");
                    } catch (e) { }
                }
                // IE
                if (typeof ActiveXObject != "undefined") {
                    try {
                        return new ActiveXObject("Word.Application");
                    } catch (e) { }
                }
                return null;
            };

            var notes = this._grid.getSelectedRecords(["Description", "LongNotes", "AccountName", "ContactName", "CompletedDate", "UserName", "Type"]);
            if (notes.length == 0) {
                sageDialogs.showWarning(notesHistoryListStrings.pleaseSelectRecordsText);
                return;
            }

            var wordApp = getWordApplication();
            if (!wordApp) {
                sageDialogs.showWarning(notesHistoryListStrings.UnableToFindWordMsg);
                return;
            }

            // header
            var wdSeekCurrentPageHeader = 9;
            var wdSeekMainDocument = 0;
            var doc = wordApp.Documents.Add();
            wordApp.PrintPreview = true;
            wordApp.Visible = true;
            wordApp.ActiveWindow.ActivePane.View.SeekView = wdSeekCurrentPageHeader;
            wordApp.Selection.TypeText(notesHistoryListStrings.accountText + ": " + notes[0].AccountName + "            " +
                    notesHistoryListStrings.printedOnText + ": " + dateLocale.format(new Date(), { selector: 'date', fullYear: true }));
            wordApp.ActiveWindow.ActivePane.View.SeekView = wdSeekMainDocument;

            dojo.forEach(notes, function (note) {
                wordApp.Selection.TypeText("___________________________________________________________");
                wordApp.Selection.TypeParagraph();
                wordApp.Selection.TypeParagraph();

                if (note.ContactName) {
                    wordApp.Selection.TypeText(notesHistoryListStrings.contactText + ":        ");
                    wordApp.Selection.TypeText(note.ContactName);
                    wordApp.Selection.TypeParagraph();
                }

                if (note.CompletedDate) {
                    var dateObject = utility.Convert.toDateFromString(note.CompletedDate);
                    wordApp.Selection.TypeText(notesHistoryListStrings.dateText + ":        ");
                    wordApp.Selection.TypeText(dateLocale.format(dateObject));
                    wordApp.Selection.TypeParagraph();
                }

                if (note.UserName) {
                    wordApp.Selection.TypeText(notesHistoryListStrings.userText + ":        ");
                    wordApp.Selection.TypeText(note.UserName);
                    wordApp.Selection.TypeParagraph();
                }

                wordApp.Selection.TypeText(notesHistoryListStrings.typeText + ":        ");
                wordApp.Selection.TypeText(activityUtility.getActivityTypeName(note.Type));
                wordApp.Selection.TypeParagraph();

                if (note.Description) {
                    wordApp.Selection.TypeText(notesHistoryListStrings.regardingText + ":        ");
                    wordApp.Selection.TypeText(note.Description);
                    wordApp.Selection.TypeParagraph();
                }

                if (note.LongNotes) {
                    wordApp.Selection.TypeText(notesHistoryListStrings.notesText + ":        ");
                    wordApp.Selection.TypeText(note.LongNotes);
                    wordApp.Selection.TypeParagraph();
                }
            });

            wordApp.Selection.TypeText("___________________________________________________________");
            wordApp.Selection.TypeParagraph();
            wordApp.Visible = true;
        },
        onBeforeCreateGrid: function (options) { }
    });
    return notesHistoryList;
});