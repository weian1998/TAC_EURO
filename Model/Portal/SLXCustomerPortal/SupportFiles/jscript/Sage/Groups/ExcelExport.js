/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
/* -------------------------------------------------------------------------                  
Sage SalesLogix Desktop Integration
Sage.Groups.ExcelExport
Copyright(c) 2010-2011, Sage Software                         
------------------------------------------------------------------------- */

define([
        "Sage/Groups/CustomExport",
        "Sage/MailMerge/Helper",
        "Sage/UI/Dialogs",
        "dojo/string",
        "dojo/_base/declare"
    ],
// ReSharper disable InconsistentNaming
    function (CustomExport, Helper, Dialogs, dString, declare) {
        // ReSharper restore InconsistentNaming
        var oGroupsExcelExport = declare("Sage.Groups.ExcelExport", Sage.Groups.CustomExport, {
            // ReSharper disable UnusedParameter
            constructor: function (groupId, useGroupContext) {
                // ReSharper restore UnusedParameter
                this.inherited(arguments);
                this.ColumnCount = null;
                this.EndingRow = null;
                this.ExcelApp = null;
                this.FileName = null;
                this.GroupDisplayName = null;
                this.GroupSheet = null;
                this.LayoutSheet = null;
                this.LCID = this.Service.MailMergeGUI().UserDefaultLCID;
                this.ShowExcelAfterExport = true;
                this.StartingColumn = null;
                this.StartingRow = null;
                this.TotalRecords = null;
                this.WorkBook = null;
            },
            Execute: function () {
                this.inherited(arguments);
                return this.DoExport();
            },
            LoadGroupData: function () {
                this.inherited(arguments);
                this.ClearVars(true);
            },
            ClearVars: function (quit) {
                /* Note: do [not] clear this.FileName or this.LastError. */
                this.ColumnCount = null;
                this.EndingRow = null;
                this.GroupSheet = null;
                this.LayoutSheet = null;
                this.ShowExcelAfterExport = true;
                this.StartingColumn = null;
                this.StartingRow = null;
                this.TotalRecords = null;
                if (typeof quit === "boolean" && quit) {
                    if (this.WorkBook != null) {
                        try {
                        }
                        catch (e) {
                            this.WorkBook.Close();
                        }
                        this.WorkBook = null;
                    }
                    if (this.ExcelApp != null) {
                        try {
                            this.ExcelApp.Quit();
                        }
                        catch (e) {
                        }
                        this.ExcelApp = null;
                    }
                }
                else {
                    this.WorkBook = null;
                    this.ExcelApp = null;
                }
            },
            DoExport: function () {
                if (!this.SageGearsFactoryAvailable) {
                    throw new Error(Helper.DesktopErrors().DesktopHelperUnavailable);
                }
                if (this.ShowProgress) {
                    this.HideProgress();
                    this.UpdateProgress(0, Helper.MailMergeInfoStore().Resources.ExportProcessing);
                }
                if (!this.DataLoaded) {
                    this.UpdateProgress(5, Helper.MailMergeInfoStore().Resources.ExportLoadingData);
                    this.Service.MailMergeGUI().ProcessMessages();
                    this.LoadGroupData();
                }
                if (this.InnerExportGroup()) {
                    if (this.ExportGroup()) {
                        return true;
                    }
                }
                if (this.LastError != null) {
                    this.HideProgress();
                    throw this.LastError;
                }
                return false;
            },
            ExportGroup: function () {
                /* Constants for enum Constants */
                var xlAutomatic = -4105;
                var xlDouble = -4119;
                var xlNone = -4142;

                /* Constants for enum XlBordersIndex */
                var xlInsideHorizontal = 12;
                var xlInsideVertical = 11;
                var xlDiagonalDown = 5;
                var xlDiagonalUp = 6;
                var xlEdgeBottom = 9;
                var xlEdgeLeft = 7;
                var xlEdgeRight = 10;
                var xlEdgeTop = 8;

                /* Constants for enum XlLineStyle */
                var xlContinuous = 1;

                /* Constants for enum XlBorderWeight */
                var xlThin = 2;
                var xlThick = 4;

                /* Constants for enum XlPivotTableSourceType */
                // ReSharper disable UnusedLocals
                var xlDatabase = 1;

                /* Constants for enum XlPivotFieldOrientation */
                var xlHidden = 0;
                var xlRowField = 1;
                var xlColumnField = 2;
                var xlPageField = 3;
                var xlDataField = 4;

                /* Constants for enum XlConsolidationFunction */
                var xlSum = -4157;
                var xlCount = -4112;
                var xlAverage = -4106;

                /* Constants for enum XlCalculation */
                var xlCalculationAutomatic = 4294963191;

                /* Constants for enum XlApplicationInternational */
                var xlYearCode = 19;
                var xlMonthCode = 20;
                var xlDayCode = 21;
                // ReSharper restore UnusedLocals                
                try {
                    try {

                        var bCreatePivot = false;

                        this.UpdateProgress(80, Helper.MailMergeInfoStore().Resources.ExportFormattingWorksheet);

                        /* Format the heading. */
                        var oCellStart = this.GroupSheet.Cells.Item(this.StartingRow - 1, this.StartingColumn);
                        var oCellEnd = this.GroupSheet.Cells.Item(this.StartingRow - 1, this.ColumnCount - (this.StartingColumn - 1));

                        this.GroupSheet.Range(oCellStart, oCellEnd).Select();
                        this.ExcelApp.ActiveWindow.SplitRow = 1;
                        this.ExcelApp.ActiveWindow.FreezePanes = true;

                        this.GroupSheet.Range(oCellStart, oCellEnd).Font.Bold = true;

                        // ReSharper disable UseOfImplicitGlobalInFunctionScope
                        // ReSharper disable AssignToImplicitGlobalInFunctionScope
                        with (this.GroupSheet.Range(oCellStart, oCellEnd)) {

                            Borders.Item(xlDiagonalDown).LineStyle = xlNone;
                            Borders.Item(xlDiagonalUp).LineStyle = xlNone;
                            Borders.Item(xlEdgeLeft).LineStyle = xlNone;
                        }
                        // ReSharper restore UseOfImplicitGlobalInFunctionScope

                        with (this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlEdgeTop)) {
                            LineStyle = xlContinuous;
                            Weight = xlThin;
                            ColorIndex = xlAutomatic;
                        }

                        with (this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlEdgeLeft)) {
                            LineStyle = xlContinuous;
                            Weight = xlThin;
                            ColorIndex = xlAutomatic;
                        }

                        with (this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlEdgeBottom)) {
                            LineStyle = xlContinuous;
                            Weight = xlThick;
                            ColorIndex = xlAutomatic;
                        }

                        this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlEdgeRight).LineStyle = xlNone;
                        this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlInsideVertical).LineStyle = xlNone;
                        this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlInsideHorizontal).LineStyle = xlNone;
                        this.GroupSheet.Range("A1").Select();

                        /* Set the total records && format the last row. */
                        this.GroupSheet.Cells.Item(this.EndingRow + 1, this.StartingColumn).Value = "=ROWS(A" + this.StartingRow + ":A" + this.EndingRow + ")"; /*DNL*/
                        this.GroupSheet.Cells.Item(this.EndingRow + 1, this.StartingColumn).Font.Bold = true;

                        oCellStart = this.GroupSheet.Cells.Item(this.EndingRow + 1, this.StartingColumn);
                        oCellEnd = this.GroupSheet.Cells.Item(this.EndingRow + 1, this.ColumnCount - (this.StartingColumn - 1));

                        with (this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlEdgeTop)) {
                            LineStyle = xlDouble;
                            Weight = xlThin;
                            ColorIndex = xlAutomatic;
                        }
                        // ReSharper restore AssignToImplicitGlobalInFunctionScope

                        /* Format the Data for each column from format in Layout Sheet. */
                        var sColumnFormat;
                        var sColumnName;
                        var sColumnName2;
                        var sColumnFormatString;

                        this.UpdateProgress(83, Helper.MailMergeInfoStore().Resources.ExportFormattingColumns);

                        var i;
                        for (i = 1; i < this.ColumnCount + 1; i++) {
                            this.UpdateProgress((85 + i), Helper.MailMergeInfoStore().Resources.ExportFormattingColumns);
                            this.Service.MailMergeGUI().ProcessMessages();
                            sColumnName = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 2).Value);
                            sColumnFormat = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 3).Value);
                            sColumnName2 = String(this.GroupSheet.Cells.Item(this.StartingRow - 1, i).Value);
                            sColumnFormatString = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 4).Value);
                            if (sColumnName.toUpperCase() == sColumnName2.toUpperCase()) {
                                switch (sColumnFormat.toUpperCase()) {
                                    case "CURRENCY":
                                        /*DNL*/
                                    case "FIXED":
                                        /*DNL*/
                                        if (sColumnFormatString != "%2.0f%%") {
                                            this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow + 1, i)).NumberFormat = "#,##0.00";
                                            this.GroupSheet.Cells.Item(this.EndingRow + 1, i).Font.Bold = true;
                                            /* Bug in Excel 2003 where data dumped into spreedsheet is formated as text, although we change the format type of the column,
                                            * the value itself remains text. This will convert each value in every cell to a number. */
                                            if (Number(this.ExcelApp.Version) < 12) {
                                                var oCells = this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow + 1, i));
                                                /* This takes a very long time to process. */
                                                for (var x = 1; x < oCells.Count + 1; x++) {
                                                    oCells.Item(x).Value = Number(oCells.Item(x).Value);
                                                }
                                            }
                                            /* Create Total at the bottom Row. */
                                            try {
                                                this.GroupSheet.Cells.Item(this.EndingRow + 1, i).FormulaR1C1 = "=SUM(R[-" + this.EndingRow + "]C:R[-1]C)"; /*DNL*/
                                                bCreatePivot = true;
                                            }
                                            catch (e) {
                                                if (window.console) console.log(e.message);
                                            }
                                        }
                                        break;
                                    case "INTEGER":
                                        /*DNL*/
                                        bCreatePivot = true;
                                        break;
                                    case "PHONE":
                                        /*DNL*/
                                        var xlCellValue = 1;
                                        var xlBetween = 1;
                                        this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow, i)).NumberFormat = "##########################";
                                        this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow, i)).HorizontalAlignment = 2;
                                        this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow, i)).FormatConditions.Add(xlCellValue, xlBetween, 999999999, 10000000000);

                                        /* The FormatCondition.NumberFormat property is only available beginning with Excel 2007. */
                                        if (Number(this.ExcelApp.Version) >= 12) {
                                            this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow, i)).FormatConditions.Item(1).NumberFormat = "(###) ###-####";
                                        }
                                        else {
                                            this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow, i)).NumberFormat = "[<=9999999]###-####;(###) ###-####";
                                        }
                                        break;
                                    case "DATETIME":
                                        /*DNL*/
                                        try {
                                            var format = this.Service.MailMergeGUI().GetFormatSetting(7);
                                            var sYearCode = this.Service.MailMergeGUI().GetExcelInternationalValue(this.ExcelApp, xlYearCode);
                                            var sMonthCode = this.Service.MailMergeGUI().GetExcelInternationalValue(this.ExcelApp, xlMonthCode);
                                            var sDayCode = this.Service.MailMergeGUI().GetExcelInternationalValue(this.ExcelApp, xlDayCode);
                                            format = format.replace(/y/g, sYearCode || "y");
                                            format = format.replace(/M/g, sMonthCode || "M");
                                            format = format.replace(/d/g, sDayCode || "d");
                                            this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow, i)).NumberFormatLocal = format;
                                        }
                                        catch (e) {
                                            if (window.console) {
                                                console.log(e.message);
                                            }
                                        }
                                        break;
                                }
                            }
                        }
                        var oPivotTable;
                        var oPivotSheet;
                        /* Create the pivot table if set from above. */
                        if (bCreatePivot) {
                            this.UpdateProgress(95, Helper.MailMergeInfoStore().Resources.ExportPivotTable);
                            var sPivotSourceName = "DataList"; /*DNL*/
                            var sPivotTableName = "GroupPivotTable"; /*DNL*/
                            this.WorkBook.Names.Add(sPivotSourceName, this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow - 1, this.StartingColumn), this.GroupSheet.Cells.Item(this.EndingRow, (1 + (this.ColumnCount - this.StartingColumn)))));
                            this.LayoutSheet.Activate();
                            var bUseNativeActiveX = (Helper.MailMergeInfoStore().ExportToExcel.UseNativeActiveX && dojo.isIE);
                            if (bUseNativeActiveX) {
                                var oHelper = new ActiveXObject("SLXMMGUIW.MailMergeGUI"); /*DNL*/
                                oPivotTable = oHelper.PivotCachesAdd(this.WorkBook, sPivotSourceName, sPivotTableName);
                            }
                            else {
                                oPivotTable = this.Service.MailMergeGUI().PivotCachesAdd(this.WorkBook, sPivotSourceName, sPivotTableName);
                            }
                            oPivotSheet = this.WorkBook.Sheets.Item(2);
                            oPivotSheet.Name = this.GroupSheet.Name + " Pivot"; /*DNL*/

                            this.GroupSheet.Activate();

                            /* Add fields to the pivot table. */
                            /* First row is a pivot row. */
                            oPivotTable.PivotFields(this.GroupSheet.Cells.Item(this.StartingRow - 1, this.StartingColumn).Value).Orientation = xlRowField;
                            var iDataFields = 0;
                            for (i = 1; i < this.ColumnCount + 1; i++) {
                                sColumnName = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 2).Value);
                                sColumnFormat = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 3).Value);
                                sColumnName2 = String(this.GroupSheet.Cells.Item(this.StartingRow - 1, i).Value);
                                sColumnFormatString = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 4).Value);
                                if (sColumnName.toUpperCase() == sColumnName2.toUpperCase()) {
                                    switch (String(sColumnFormat).toUpperCase()) {
                                        case "CURRENCY":
                                            /*DNL*/
                                        case "FIXED":
                                            /*DNL*/
                                            if (sColumnFormatString != "%2.0f%%") { /* This is to exclude percent columns. */
                                                iDataFields++;
                                                oPivotTable.PivotFields(sColumnName2).Orientation = xlDataField;
                                                oPivotTable.DataFields.Item(iDataFields).Function = xlSum;
                                                oPivotTable.DataFields.Item(iDataFields).NumberFormat = "#,##0.00";
                                            }
                                            break;
                                        case "INTEGER":
                                            /*DNL*/
                                            iDataFields++;
                                            oPivotTable.PivotFields(sColumnName2).Orientation = xlDataField;
                                            oPivotTable.DataFields.Item(iDataFields).Function = xlSum;
                                            oPivotTable.DataFields.Item(iDataFields).NumberFormat = "#,##0";
                                            break;
                                        case "OWNER":
                                            /*DNL*/
                                            if (i != 1) {
                                                oPivotTable.PivotFields(sColumnName2).Orientation = xlPageField;
                                            }
                                            break;
                                        case "USER":
                                            /*DNL*/
                                            if (i != 1) {
                                                oPivotTable.PivotFields(sColumnName2).Orientation = xlPageField;
                                            }
                                            break;
                                    }

                                }
                            }
                            if (iDataFields > 1) {
                                oPivotTable.PivotFields("Data").Orientation = xlColumnField; /*DNL*/
                                oPivotTable.DataLabelRange.Font.Bold = true;
                            }
                        }

                        this.UpdateProgress(98, Helper.MailMergeInfoStore().Resources.ExportSaving);

                        /* Let Excel define the extension (.xls [or] .xlsx). */
                        this.FileName = dString.substitute("${0}\\${1} (${2})", [this.Service.GetPersonalDataPath(), this.CleanGroupName(this.GroupDisplayName), String(this.Service.MailMergeGUI().DateToISO(new Date())).replace(/:/g, "")]); /*DNL*/
                        this.WorkBook.SaveAs(this.FileName);
                        this.FileName = this.WorkBook.FullName; /* <-- This FileName will contain the file extension. */

                        this.UpdateProgress(100, Helper.MailMergeInfoStore().Resources.ExportFinished);

                        if (this.ShowExcelAfterExport) {
                            this.ExcelApp.UserControl = true;
                            this.LayoutSheet.Visible = false;
                            this.ExcelApp.ScreenUpdating = true;
                            this.ExcelApp.Calculation[this.LCID] = xlCalculationAutomatic;
                            this.ExcelApp.Visible = true;
                            this.ExcelApp.DisplayAlerts = true;
                        }

                        // ReSharper disable AssignedValueIsNeverUsed
                        oCellStart = null;
                        oCellEnd = null;
                        oPivotSheet = null;
                        oPivotTable = null;
                        // ReSharper restore AssignedValueIsNeverUsed                    

                        this.HideProgress();

                        return true;
                    }
                    finally {
                        var bQuit = false;
                        try {
                            if (this.ExcelApp != null && !this.ExcelApp.Visible) {
                                bQuit = true;
                            }
                        }
                        catch (e) {
                            bQuit = true;
                        }
                        this.ClearVars(bQuit);
                    }
                }
                catch (err) {
                    this.LastError = err;
                }
                return false;
            },
            GetColumnCharacters: function (number) {
                var result;
                var iNumber = Number(number);
                if (iNumber < 1) {
                    result = "A";
                }
                else {
                    if (iNumber > 702) {
                        result = "ZZ";
                    }
                    else {
                        if (iNumber > 26) {
                            if ((iNumber % 26) == 0) {
                                result = String.fromCharCode(64 + (iNumber / 26) - 1) + String.fromCharCode(64 + 26);
                            }
                            else {
                                result = String.fromCharCode(64 + (iNumber / 26)) + String.fromCharCode(64 + (iNumber % 26));
                            }
                        }
                        else {
                            result = String.fromCharCode(64 + iNumber);
                        }
                    }
                }
                return result;
            },
            InnerExportGroup: function () {
                try {

                    /* Constants for enum XlWBATemplate */
                    // ReSharper disable InconsistentNaming
                    var xlWBATWorksheet = -4167;
                    // ReSharper restore InconsistentNaming

                    /* Constants for enum XlCalculation */
                    var xlCalculationManual = 4294963161;

                    if (this.GroupName == null || this.GroupTable == null) {
                        this.GroupName = this.GroupReader.selectSingleNode("//SLXGroup/plugindata").attributes.item(1).nodeValue;
                        this.GroupTable = this.GroupReader.selectSingleNodeText("//SLXGroup/maintable");
                    }

                    this.GroupDisplayName = this.GroupReader.selectSingleNode("//SLXGroup/plugindata").attributes.item(2).nodeValue;
                    if (this.GroupDisplayName === null || this.GroupDisplayName === "") {
                        this.GroupDisplayName = this.GroupName;
                    }
                    var oDataset = this.GroupDatasetReader.selectChildNodes("//NewDataSet/Table");

                    var iRecordCount = 0;
                    if (oDataset != null) {
                        iRecordCount = oDataset.length;
                    }

                    if (iRecordCount == 0) {
                        var sMsg = dString.substitute(Helper.DesktopErrors().GroupEmptyError, [this.GroupDisplayName, this.GroupId]);
                        if (!this.RaiseErrorWhenNoRecords) {
                            this.HideProgress();
                            Dialogs.showInfo(sMsg);
                            return false;
                        }
                        else {
                            throw new Error(sMsg);
                        }
                    }

                    this.UpdateProgress(10, Helper.MailMergeInfoStore().Resources.ExportStartingExcel);

                    this.ExcelApp = this.NewActiveXObject("Excel.Application");
                    this.ExcelApp.Visible = false;
                    this.ExcelApp.ScreenUpdating = false;
                    this.ExcelApp.DisplayAlerts = false;

                    this.UpdateProgress(15, Helper.MailMergeInfoStore().Resources.ExportCreatingWorksheet);

                    this.WorkBook = this.ExcelApp.Workbooks.Add(xlWBATWorksheet);
                    this.ExcelApp.Calculation[this.LCID] = xlCalculationManual;
                    this.ExcelApp.CalculateBeforeSave = true;

                    this.LayoutSheet = this.WorkBook.ActiveSheet;
                    this.LayoutSheet.Name = "Layout"; /*DNL*/
                    this.GroupSheet = this.WorkBook.Sheets.Add();
                    this.GroupSheet.Name = this.GroupDisplayName;
                    this.GroupSheet.Activate();

                    this.LayoutSheet.Cells.Item(3, 2).Value = "ColName:"; /*DNL*/
                    this.LayoutSheet.Cells.Item(3, 3).Value = "ColType:"; /*DNL*/

                    var iColumns = 0;
                    var oLayoutNode;
                    var i;
                    var oLayouts = this.GroupReader.selectChildNodes("//SLXGroup/layouts/layout");
                    for (i = 0; i < oLayouts.length; i++) {
                        oLayoutNode = oLayouts[i];
                        if (this.GetGroupNodeText("width", oLayoutNode) != "0" && this.GetGroupNodeText("visible", oLayoutNode) != "F") {
                            iColumns++;
                            var sCaption = this.GetGroupNodeText("caption", oLayoutNode);
                            if (sCaption == "") {
                                this.GroupSheet.Cells.Item(1, iColumns).Value = "unknown -" + iColumns; /*DNL*/
                                this.LayoutSheet.Cells.Item(iColumns + 3, 2).Value = "unknown -" + iColumns; /*DNL*/
                            }
                            else {
                                this.GroupSheet.Cells.Item(1, iColumns).Value = sCaption;
                                this.LayoutSheet.Cells.Item(iColumns + 3, 2).Value = sCaption;
                            }
                            this.LayoutSheet.Cells.Item(iColumns + 3, 3).Value = this.GetGroupNodeText("format", oLayoutNode);
                            this.LayoutSheet.Cells.Item(iColumns + 3, 4).Value = this.GetGroupNodeText("formatstring", oLayoutNode);
                        }
                    }

                    var iColumnCount = iColumns;
                    var iRecord = 0;
                    var iColumn = 0;

                    var oArray = this.NewActiveXObject("SLXMMGUIW.MultidimensionalArray");
                    oArray.Resize(iRecordCount, iColumnCount);

                    var iProgressPosition = 20;
                    this.UpdateProgress(iProgressPosition, Helper.MailMergeInfoStore().Resources.ExportProcessingData);

                    var iStep = Math.round(iRecordCount / 54);
                    if (iStep == 0) iStep = 1;
                    var iStepPosition = 0;

                    for (i = 0; i < oDataset.length; i++) {
                        var oRecordNode = oDataset[i];
                        iColumn = 0;
                        for (var x = 0; x < oLayouts.length; x++) {
                            oLayoutNode = oLayouts[x];
                            if (this.GetGroupNodeText("width", oLayoutNode) != "0" && this.GetGroupNodeText("visible", oLayoutNode) != "F") {
                                var sAlias = String(this.GetGroupNodeText("alias", oLayoutNode));
                                var sFormat = String(this.GetGroupNodeText("format", oLayoutNode));
                                var sValue;
                                switch (sFormat.toUpperCase()) {
                                    case "PHONE":
                                        /*DNL*/
                                        sValue = this.GetGroupDatasetNodeText(sAlias, oRecordNode);
                                        oArray.SetValue(i, iColumn, sValue);
                                        break;
                                    case "USER":
                                        /*DNL*/
                                        sValue = this.GetGroupDatasetNodeText(sAlias + "NAME", oRecordNode); /*DNL*/
                                        oArray.SetValue(i, iColumn, sValue);
                                        break;
                                    case "OWNER":
                                        /*DNL*/
                                        sValue = this.GetGroupDatasetNodeText(sAlias + "NAME", oRecordNode); /*DNL*/
                                        oArray.SetValue(i, iColumn, sValue);
                                        break;
                                    case "DATETIME":
                                        /*DNL*/
                                        sValue = this.GetGroupDatasetNodeText(sAlias, oRecordNode);
                                        sValue = String(sValue).substring(0, 16);
                                        sValue = String(sValue).replace(/T/, " ");
                                        oArray.SetValue(i, iColumn, sValue);
                                        break;
                                    default:
                                        sValue = this.GetGroupDatasetNodeText(sAlias, oRecordNode);
                                        oArray.SetValue(i, iColumn, sValue);
                                        break;
                                }
                                iColumn++;
                            }
                        }
                        iRecord++;
                        iStepPosition++;
                        if (iStepPosition == iStep) {
                            iStepPosition = 0;
                            this.UpdateProgress(iProgressPosition++, Helper.MailMergeInfoStore().Resources.ExportProcessingData);
                            this.Service.MailMergeGUI().ProcessMessages();
                        }
                    }

                    for (i = 0; i < iColumn; i++) {
                        var sColumnFormat = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 3).Value);
                        if ((sColumnFormat == "0") || (sColumnFormat == "3")) {
                            this.GroupSheet.Range(this.GroupSheet.Cells.Item(2, i), this.GroupSheet.Cells.Item(0, i)).NumberFormat = "@";
                        }
                    }

                    this.UpdateProgress(75, Helper.MailMergeInfoStore().Resources.ExportPopulating);

                    this.GroupSheet.Range("A2", this.GetColumnCharacters(iColumn) + (iRecordCount + 1)).Value = oArray.OleArray;
                    this.GroupSheet.Range("A1").Select();
                    this.GroupSheet.Cells.Select();
                    this.GroupSheet.Cells.EntireColumn.AutoFit();
                    this.GroupSheet.Range("A1").Select();

                    this.StartingRow = 2;
                    this.EndingRow = (iRecordCount + 1);
                    this.TotalRecords = (this.EndingRow - this.StartingRow) + 1;
                    this.StartingColumn = 1;
                    this.ColumnCount = iColumn;

                    this.LayoutSheet.Cells.Item(1, 1).Value = this.StartingRow;
                    this.LayoutSheet.Cells.Item(1, 2).Value = this.EndingRow;
                    this.LayoutSheet.Cells.Item(1, 3).Value = this.StartingColumn;
                    this.LayoutSheet.Cells.Item(1, 4).Value = this.ColumnCount;
                    this.LayoutSheet.Cells.Item(1, 5).Value = this.GroupSheet.Name;

                    return true;
                }
                catch (err) {
                    this.LastError = err;
                    this.ClearVars(true);
                    return false;
                }
            },
            NewActiveXObject: function (progid) {
                var bUseNativeActiveX = (Helper.MailMergeInfoStore().ExportToExcel.UseNativeActiveX && dojo.isIE);
                this.Service.Debug("ExportToExcel.UseNativeActiveX = " + bUseNativeActiveX); /* DNL */
                return (bUseNativeActiveX) ? new ActiveXObject(progid) : this.Service.NewActiveXObject(progid);
            }
        });

        return oGroupsExcelExport;
    }
);

        
