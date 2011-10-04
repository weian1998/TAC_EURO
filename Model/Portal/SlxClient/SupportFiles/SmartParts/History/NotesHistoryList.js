//////////////////////////// History List Specific

Sage.namespace("Sage.UI.Forms");
dojo.require('Sage.UI.Columns.DateTime');
dojo.require('Sage.UI.SLXPreviewGrid');
dojo.require('Sage.Utility');

Sage.UI.Forms.HistoryList = {

    init: function (placeholderNode, contextualConditionFunction, runtimeConfig) {
        // summary:
        //  Create the grid with preview panel.
        // placeholderNode:
        //  DOM Node or id where the object should be placed
        // contextualConditionFunction:
        //  Optional function to be evaluated to restrict the query according to the current context (e.g. for a SalesLogix tab, it
        //  should usually filter according to the parent entity id)
        // runtimeConfig: 
        //  SalesLogix context to be passed to SLXTabGrid.  Usually should have the "workspace" and "tabId" (for SLX tabs) properties

        // These strings are localized in NotesHistoryResources, but there is a fallback in case something blows up...
        var localeStrings = NotesHistoryResources || {
            chkShowDbChangesLabel: "Show Database Changes",
            optSelectAll: "All",
            PleaseSelectRecords: "Please select one or more records",
            /// <reference path="../../Filters/" />
            UnableToFindWord: "Cannot start Microsoft Word.  Please check your security settings.",
            SendEmail: "Send via E-Mail",
            SendWord: "Send to Word",
            AddNote: "Add Note",
            AddActivity: "Complete an Activity",
            colUser: "User",
            colAccount: "Account",
            colContact: "Contact",
            colDescription: "Description",
            colDate: "Date",
            colType: "Type",
            AccountName: "Account Name",
            PrintedOn: "Printed On",
            Notes: "Notes"
        };

        /////////////// Support for Activity Type - specific to this HistoryList grid

        var hmstring = Sage.Utility.getClientContextByKey("HistoryTypeMap");  // filled from server side
        var historyTypeMap = Sage.UI.Forms.HistoryList.buildHistoryMap(hmstring);
        dojo.declare("HistoryTypeCell", dojox.grid.cells.Cell, {
            // summary:
            //  custom column used for display of history type (also acts as a link for edit)
            format: function (inRowIndex, inItem) {
                var type = this.get(inRowIndex, inItem);
                var key = Sage.Utility.getValue(inItem, "$key");
                return "<a href='javascript:Link.editHistory(\"" + key + "\")' class='activityType " + type + "'>" + historyTypeMap[type] + "</a>";
            }
        });

        var filterTypeWidget = dojo.declare([dijit._Widget, dijit._Templated], {
            // summary:
            //  Filter widget for the history type.   Combination of a dropdown (note the available types are hard-coded)
            //  and a checkbox to enable showing the DB changes
            templateString: "<div>" +
                 "<div>" +
                "<select dojoAttachPoint='selType'><option value='' selected='selected'>" + localeStrings.optSelectAll + "</option></select>" +
                "</div>" +
                "<div class='chkShowDBChanges'>" +
                "<input id='chkShowDbChanges' type='checkbox' dojoAttachPoint='chkShowDbChanges'/>" +
                "&nbsp;<label for='chkShowDbChanges'>" + localeStrings.chkShowDbChangesLabel + "</label>" +
                "</div>" +
            "</div>",

            buildRendering: function () {
                this.inherited(arguments);
                var sel = this.selType;
                dojo.forEach(["atAppointment", "atPhoneCall", "atToDo", "atNote", "atPersonal", "atInternal", "atSchedule", "atEMail", "atDoc", "atFax", "atLiterature", "atDatabaseChange"], function (item) {
                    var opt = document.createElement("option");
                    opt.value = item;
                    opt.text = historyTypeMap[item];
                    sel.options.add(opt);
                });
            },
            getQuery: function () {
                if (this.selType.value) {
                    var c = "(Type eq '" + this.selType.value + "'";
                    if (this.chkShowDbChanges.checked) {
                        c += " or Type eq 'atDatabaseChange'";
                    }
                    c += ")";
                    return c;
                } else if (!this.chkShowDbChanges.checked) {
                    return "Type ne 'atDatabaseChange'";
                }
                return "";
            },
            reset: function () {
                this.selType.value = '';
                this.chkShowDbChanges.checked = false;
            }
        });

        var completedDateRangeFilter = dojo.declare(Sage.UI.SLXPreviewGrid.Filter.DateRange, {
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
                    return Sage.Utility.Convert.toIsoStringFromDate(value);
                };
                var toTimelessIsoString = function (value, isUpperBound) {
                    if (!value)
                        return '';
                    if (value.constructor !== Date)
                        value = Date.parse(value);
                    var pad = function (n) { return n < 10 ? '0' + n : n };
                    return [
                        value.getFullYear(),
                        '-',
                        pad(value.getMonth() + 1),
                        '-',
                        pad(value.getDate()),
                        (isUpperBound) ? 'T23:59:59Z' : 'T00:00:00Z'
                    ].join('');
                }

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
                    qry = dojo.string.substitute(fmt, [ toTimelessIsoString(dFrom), toTimelessIsoString(dTo, true), toIsoStringFromDate(dFrom), toIsoStringFromDate(dTo, true)]);
                } else if (dFrom && !dTo) {
                    fmt = [
                        '((((Timeless eq true and CompletedDate eq OriginalDate) and CompletedDate ge \'${0}\')) or',
                        '(((Timeless eq false) or (Timeless eq true and CompletedDate ne OriginalDate)) and CompletedDate ge \'${1}\'))'
                    ].join('');
                    qry = dojo.string.substitute(fmt, [toTimelessIsoString(dFrom), toIsoStringFromDate(dFrom)]);
                } else if (dTo && !dFrom) {
                    fmt = [
                        '((((Timeless eq true and CompletedDate eq OriginalDate) and CompletedDate lt \'${0}\')) or',
                        '(((Timeless eq false) or (Timeless eq true and CompletedDate ne OriginalDate)) and CompletedDate lt \'${1}\'))'
                    ].join('');
                    qry = dojo.string.substitute(fmt, [toTimelessIsoString(dTo, true), toIsoStringFromDate(dTo, true)]);
                }
                //console.log('query is: ' + qry);
                return qry;
            }

        });


        var onSendToWordClick = function () {
            // handler for send to word button
            dojo.require("dojo.date.locale");

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

            var notes = grid.getSelectedRecords(["Description", "LongNotes", "AccountName", "ContactName", "CompletedDate", "UserName", "Type"]);
            if (notes.length == 0) {
                alert(localeStrings.PleaseSelectRecords);
                return;
            }

            var wordApp = getWordApplication();
            if (!wordApp) {
                alert(localeStrings.UnableToFindWord);
                return;
            }

            // header
            var wdSeekCurrentPageHeader = 9;
            var wdSeekMainDocument = 0;

            var doc = wordApp.Documents.Add();
            wordApp.PrintPreview = true;
            wordApp.Visible = true;
            wordApp.ActiveWindow.ActivePane.View.SeekView = wdSeekCurrentPageHeader;
            wordApp.Selection.TypeText(localeStrings.AccountName + ": " + notes[0].AccountName + "            " +
                    localeStrings.PrintedOn + ": " + dojo.date.locale.format(new Date(), { selector: "date" }));
            wordApp.ActiveWindow.ActivePane.View.SeekView = wdSeekMainDocument;


            dojo.forEach(notes, function (note) {
                wordApp.Selection.TypeText("___________________________________________________________");
                wordApp.Selection.TypeParagraph();
                wordApp.Selection.TypeParagraph();

                if (note.ContactName) {
                    wordApp.Selection.TypeText(localeStrings.colContact + ":        ");
                    wordApp.Selection.TypeText(note.ContactName);
                    wordApp.Selection.TypeParagraph();
                }

                if (note.CompletedDate) {
                    var dateObject = Sage.Utility.Convert.toDateFromString(note.CompletedDate);
                    wordApp.Selection.TypeText(localeStrings.colDate + ":        ");
                    wordApp.Selection.TypeText(dojo.date.locale.format(dateObject));
                    wordApp.Selection.TypeParagraph();
                }

                if (note.UserName) {
                    wordApp.Selection.TypeText(localeStrings.colUser + ":        ");
                    wordApp.Selection.TypeText(note.UserName);
                    wordApp.Selection.TypeParagraph();
                }

                wordApp.Selection.TypeText(localeStrings.colType + ":        ");
                wordApp.Selection.TypeText(historyTypeMap[note.Type]);
                wordApp.Selection.TypeParagraph();

                if (note.Description) {
                    wordApp.Selection.TypeText(localeStrings.colDescription + ":        ");
                    wordApp.Selection.TypeText(note.Description);
                    wordApp.Selection.TypeParagraph();
                }

                if (note.LongNotes) {
                    wordApp.Selection.TypeText(localeStrings.Notes + ":        ");
                    wordApp.Selection.TypeText(note.LongNotes);
                    wordApp.Selection.TypeParagraph();
                }
            });

            wordApp.Selection.TypeText("___________________________________________________________");
            wordApp.Selection.TypeParagraph();
            wordApp.Visible = true;
        };


        var onSendEmailClick = function () {
            // handler for send email button
            var notes = grid.getSelectedRecords(["Description", "LongNotes", "AccountName", "ContactName", "CompletedDate", "UserName"]);
            if (notes.length == 0) {
                alert(localeStrings.PleaseSelectRecords);
                return;
            }
            var body = dojo.map(notes, function (n) {
                var txt = localeStrings.colAccount + ": " + n.AccountName + "\n";
                if (n.ContactName)
                    txt += localeStrings.colContact + ": " + n.ContactName + "\n";
                var dateObject = Sage.Utility.Convert.toDateFromString(n.CompletedDate);
                txt += localeStrings.colDate + ": ";
                txt += dojo.date.locale.format(dateObject) + "\n";
                txt += localeStrings.colUser + ": " + n.UserName + "\n";
                txt += localeStrings.colDescription + ": " + n.Description + "\n\n";
                txt += localeStrings.Notes + ":\n" + n.LongNotes;
                return txt;
            }).join("\n\n---------------------------------------------\n\n");

            var subject = dojo.map(notes, function (n) { return n.Description }).join("; ");
            Sage.Utility.writeEmail("", subject, body);
        };

        var toolConfig = [
                { id: 'SendEmail', icon: 'images/icons/Send_Write_email_16x16.gif', alternateText: localeStrings.SendEmail, handler: onSendEmailClick },
                { id: 'SendWord', icon: 'images/icons/Document_Type_16x16.png', alternateText: localeStrings.SendWord, handler: onSendToWordClick },
                { id: 'NewNote', icon: 'images/icons/new_note_16x16.gif', alternateText: localeStrings.AddNote, handler: Link.newNote, scope: Link },
                { id: 'CompleteActivity', icon: 'images/icons/complete_activity_16x16.gif', alternateText: localeStrings.AddActivity, handler: Link.scheduleCompleteActivity, scope: Link }
            ];
        var columnConfig = [
                    { field: 'Type', name: localeStrings.colType, type: HistoryTypeCell, width: '90px', filterConfig: { widgetType: filterTypeWidget} },
                    { field: 'CompletedDate', name: localeStrings.colDate, type: Sage.UI.Columns.DateTime, useFiveSecondRuleToDetermineTimeless: true, width: '100px', filterConfig: { widgetType: completedDateRangeFilter} },
                    { field: 'UserName', name: localeStrings.colUser, width: '90px', filterConfig: { widgetType: Sage.UI.SLXPreviewGrid.Filter.Text} },
                    { field: 'AccountName', name: localeStrings.colAccount, width: '100px' },
                    { field: 'ContactName', name: localeStrings.colContact, width: '100px' },
                    { field: 'Description', name: localeStrings.colDescription, width: '*', filterConfig: { widgetType: Sage.UI.SLXPreviewGrid.Filter.Text} }
                ];

        var grid = new Sage.UI.SLXPreviewGrid.Grid({
            toolConfig: toolConfig,
            columnConfig: columnConfig,
            previewField: "LongNotes",
            storeOptions: {
                select: [],
                resourceKind: "history"
            },
            slxContext: runtimeConfig,
            contextualConditionFunction: contextualConditionFunction,
            dblClickAction: Link.editHistory
        }, placeholderNode);

        Sage.DragDropWatcher.addListener(Sage.DragDropWatcher.FILESDROPPED, function () { setTimeout(function () { grid.refresh() }, 750) });
        //grid.setSortIndex(1, false);
        grid.setSortColumn('CompletedDate', false);
        grid.startup();
        return grid;
    },

    buildHistoryMap: function (hm) {
        var items = hm.split(',');
        var map = {};
        for (var i = 0; i < items.length; i++) {
            var item = items[i].split(':');
            if (item.length === 2) {
                map[item[0]] = item[1];
            }
        }
        return map;
    }

}


/////////////////////////////////////////////////////////////////////////////
if (typeof (Sys) !== 'undefined') { Sys.Application.notifyScriptLoaded(); }
/*
--------------------------------------------------------
DO NOT PUT SCRIPT BELOW THE CALL TO notifyScriptLoaded()
--------------------------------------------------------
*/