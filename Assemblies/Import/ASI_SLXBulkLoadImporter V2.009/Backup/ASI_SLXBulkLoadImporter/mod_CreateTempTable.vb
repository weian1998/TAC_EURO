Imports System.Data.OleDb
Imports System.Threading
Imports System.ComponentModel
Imports System.Windows.Forms
Imports System.Math
Module mod_CreateTempTable

#Region "Generate Temp Table Rountines"
    Public Function GenerateTempTable(ByVal SLXTable As SLXTempTable, _
                                 ByRef objMap As clsMap, _
                                 ByVal worker As BackgroundWorker, _
                                 ByVal e As DoWorkEventArgs) As String
        Try
            '========================================================
            'Create the Column Arrays
            '========================================================
            Dim SourceColumnArray() As String
            Dim SLXColumnArray As New ArrayList(0)
            Dim iNumSourceRecords As Integer
            Dim i As Integer
            Dim percentComplete As Integer = 0
            'Get Record Count And Source Columns
            SourceColumnArray = GetSourceColumns(SLXTable.SourceSQLQuery, iNumSourceRecords, objMap)
            worker.ReportProgress(25) ' Report Progress if Needed

            '==========================
            ' Get the SLX Columns
            '==========================
            For i = 0 To SLXTable.SLXTables.Length - 1
                SLXColumnArray.Add(SLXTable.SLXTables(i).FieldName)
            Next
            'SLXColumnArray = SLXTable.SLXTables

            '======================================================
            'Initializing
            'StatusBar1.Panels(3).Text = "Initializing"
            '======================================================
            Cursor.Current = System.Windows.Forms.Cursors.WaitCursor ' Assign the Cursor
            Dim SLXIDArray(,) As String 'Multidementional Array to Handle SLXID's
            Dim SourceIDs(,) As String 'Two Dimentional Array. Each Array Element Holds an Array of SourceIDs
            'Initialize the Array Length
            ReDim Preserve SourceIDs(SourceColumnArray.Length - 1, iNumSourceRecords - 1)
            ReDim Preserve SLXIDArray(SLXTable.SLXTables.Length - 1, iNumSourceRecords - 1)


            '===============================================
            ' Get the Source dataIds from the Source Database
            ' And Populate into the SoureceIDs Array.
            '==============================================
            Dim myconn As New OleDb.OleDbConnection(objMap.m_SourceConnection) 'txtSourceNative.Text)
            myconn.Open()
            Dim SQL As String = SLXTable.SourceSQLQuery
            '==========================================================
            ' Create SQL to get the Array of ID's From the Source Table
            '==========================================================
            '======================================================
            'Loading ID's
            'StatusBar1.Panels(3).Text = "Creating ID Arrays"
            '======================================================
            Dim objCMD As New OleDbCommand
            objCMD.Connection = myconn
            objCMD.CommandText = SQL
            Dim x As Integer
            i = 0 'Intialize
            Dim objReader As OleDbDataReader = objCMD.ExecuteReader()
            If objReader.HasRows Then
                Do While objReader.Read()
                    For x = 0 To SourceColumnArray.Length - 1
                        Try
                            SourceIDs(x, i) = CStr(objReader.GetValue(x))
                        Catch ex As Exception

                        End Try

                    Next
                    percentComplete = CSng(i) / CSng(iNumSourceRecords) * 100
                    If percentComplete > 100 Then percentComplete = 100
                    worker.ReportProgress(percentComplete) ' Report Progress if Needed
                    i += 1
                Loop
            End If
            objReader.Close()
            myconn.Close()
            SQL = Nothing
            objCMD = Nothing
            myconn = Nothing
            objReader = Nothing
            worker.ReportProgress(50) ' Report Progress if Needed

            Dim iNumIdstoCreate As Integer = iNumSourceRecords
            '================================================================
            'Load the SLXID Arrays
            '================================================================
            For x = 0 To SLXTable.SLXTables.Length - 1
                '=====================================================================
                'ParseOut the TableName
                '====================================================================
                Dim tmps As String
                'tmps = Mid(SLXColumnArray(x), 5)  'This Parses OUt the SLX_
                'tmps = Mid(tmps, 1, tmps.Length - 2) 'this Parses out the ID to get the Table Name
                tmps = SLXTable.SLXTables(x).TableNameIDsCreated4
                '=================================================================================
                Dim TempSLXIDs() As String = CreateSLXID(tmps, objMap.m_SLXProviderConnection, iNumIdstoCreate, worker)
                For i = 0 To iNumIdstoCreate - 1
                    'Load the MultiDimentionalArray
                    SLXIDArray(x, i) = TempSLXIDs(i)
                    percentComplete = CSng(i) / CSng(iNumIdstoCreate) * 100
                    If percentComplete > 100 Then percentComplete = 100
                    worker.ReportProgress(percentComplete) ' Report Progress if Needed
                Next
            Next

            '==================================================
            ' CED Import of Individual %%%%%%%%%%%%%%%%%%  Modified by Scott Sommerfeld this is for a 1 off Import of the Account table.
            ' This is really bad form to hard code this but it works for this as time is something I don't have 
            'If SLXColumnArray.Length = 5 Then
            '    If SLXColumnArray(0) = "SLX_ADDRESSID" And SLXColumnArray(4) = "SLX_ADDRESSID" Then
            '        SLXColumnArray(4) = "SLX_ADDRESSID2"
            '    End If
            'End If
            '======================================================
            'Creating the TempData Tabe
            'StatusBar1.Panels(3).Text = "Creating TempDataTable as XML"
            '======================================================
            'MsgBox("Done Load of Arrays")
            Dim ds As New System.Data.DataSet
            Dim TempTable As Data.DataTable
            TempTable = ds.Tables.Add(objMap.m_TempTableName) '======= September 29, 2005 SWS ========================
            '=====================================
            'Add the Source Columns to the DataTable
            '====================================='
            For i = 0 To SourceColumnArray.Length - 1
                TempTable.Columns.Add(SourceColumnArray(i), System.Type.GetType("System.String"))
            Next
            '=====================================
            'Add the SLX Columns to the DataTable
            ' Get Num SLX Columns
            '====================================='
            '=======================================================================
            ' Hard Coded Crap... for lack of Time I needed to get this working...
            '======================================================================
            'If SLXColumnArray.Length > 5 Then
            '    If SLXColumnArray(0) = "SLX_ADDRESSID" And SLXColumnArray(4) = "SLX_ADDRESSID" Then
            '        SLXColumnArray(4) = "SLX_ADDRESSID2"
            '    End If
            'End If
            'End Crap
            '==================================
            For i = 0 To SLXColumnArray.Count - 1
                TempTable.Columns.Add(SLXColumnArray(i), System.Type.GetType("System.String"))
            Next
            '================================================================================
            'Next we need to Specify in the Row Where the SLXID's Start and End
            '================================================================================
            Dim iSLXColumnStart, iSLXColumnEnd As Integer
            iSLXColumnStart = SourceColumnArray.Length
            iSLXColumnEnd = iSLXColumnStart + (SLXColumnArray.Count - 1)
            Dim myrow As DataRow
            Dim j As Integer = 0
            Dim tmpRowItem As String
            Dim tmpDate As Date
            Dim tdate As Date
            Dim Elapsed As Double
            Dim iSLXTicketColumnIndex As Integer
            Dim iContExtraCount As Integer
            Try
                For i = 0 To iNumIdstoCreate - 1
                    '===================================================
                    myrow = TempTable.NewRow
                    '===============================================================
                    'Add the Rows to the Data Set... First the Source, then the SLX
                    '===============================================================
                    For x = 0 To SourceColumnArray.Length - 1
                        '=======================================================================================
                        'This is Where you Might put in Conditional Logic to Massage the DataGoing into the Row
                        '=======================================================================================
                        'This Section Ensure AnyDates In Source Data Are Converted to UTC and have Correct ISO Format
                        Select Case SourceColumnArray(x)
                            Case "MYCUSTOM_AddHours_DATETIME"
                                tmpDate = CDate(SourceIDs(x, i))
                                tdate = CDate(tmpDate.ToUniversalTime)
                                Elapsed = CType(SourceIDs(0, i), Double) 'this Assumes the FirstCloumn is the Source ElapsedTime

                                tmpRowItem = tdate.AddHours(Elapsed).ToString("yyyyMMdd HH:mm:ss")
                            Case "ALTERNATEKEYSUFFIX"
                                'Get the Ticket ID
                                Dim mySLXTicketID As String
                                Dim myPrettySuffix As String
                                'For iSLXTicketColumnIndex = 0 To SLXColumnArray.Count - 1
                                iSLXTicketColumnIndex = 0 ' Use the FirstID in the ID Array
                                'If InStr(SLXColumnArray(iSLXTicketColumnIndex), "TicketID", CompareMethod.Text) > 1 Then
                                'If InStr(SLXColumnArray(iSLXTicketColumnIndex), "TicketID", CompareMethod.Text) > 1 Then
                                'Match Found in the SLXArray
                                ' Get the ID and Exit LOOP
                                mySLXTicketID = SLXIDArray(iSLXTicketColumnIndex, i)
                                'Exit For
                                'MsgBox("SLXTicketID = " & mySLXTicketID)
                                'End If
                                'Next
                                myPrettySuffix = PRETTYALTERNATEKEYSUFFIX(mySLXTicketID)
                                tmpRowItem = myPrettySuffix
                                'Case "IGS_PRACTICEAREA"
                                '    '=============================================================
                                '    'Unique Case where I will Add and Multiple Rows to the Temp Table
                                '    '==============================================================
                                '    Dim TempString As String = SourceIDs(x, i)
                                '    '=============================================================
                                '    Dim separators As String = "," 'used for parsing out the parameters
                                '    Dim args() As String = TempString.Split(separators.ToCharArray)
                                '    '===============================================================
                                '    Dim iCount As Integer
                                '    Dim myRow2 As DataRow
                                '    Dim myTempStringID As String

                                '    'Dim ContactidIndex As Integer = i - 1
                                '    Try

                                '        For iContExtraCount = 0 To args.Length - 1
                                '            'Add A Row to the Dataset
                                '            'Very Specific here
                                '            'ParseField, SLXID, SourceContactID, CreateDate, ModifyDate
                                '            myRow2 = TempTable.NewRow
                                '            myTempStringID = Create1SLXID("ACustomTable", txtSLXProvider.Text) 'SLXID 
                                '            myRow2.Item(0) = SourceIDs(x - 1, i) 'SourceContactID 
                                '            myRow2.Item(1) = args(iContExtraCount) 'ParsedField
                                '            myRow2.Item(2) = Now.ToUniversalTime.ToString("yyyyMMdd HH:mm:ss") 'CreateDate
                                '            myRow2.Item(3) = Now.ToUniversalTime.ToString("yyyyMMdd HH:mm:ss") 'ModifyDate
                                '            myRow2.Item(4) = myTempStringID
                                '            TempTable.Rows.Add(myRow2)
                                '        Next
                                '    Catch ex As Exception
                                '        tmpRowItem = (SourceIDs(x, i))
                                '    End Try

                                'Case "CEDGROUPS"
                                '    '=============================================================
                                '    'Unique Case where I will Add and Multiple Rows to the Temp Table
                                '    '==============================================================
                                '    Dim TempString As String = SourceIDs(x, i)

                                '    If TempString Is Nothing Then
                                '        tmpRowItem = TempString
                                '    Else
                                '        If Len(TempString) > 2 Then
                                '            '==========================
                                '            'Clean the Trailing Comma
                                '            '===========================
                                '            TempString = Mid(TempString, 1, Len(TempString) - 1)
                                '            '=============================================================
                                '            Dim separators As String = "," 'used for parsing out the parameters
                                '            Dim args() As String = TempString.Split(separators.ToCharArray)
                                '            '===============================================================
                                '            Dim iCount As Integer
                                '            Dim myRow2 As DataRow
                                '            Dim myTempStringID As String

                                '            'Dim ContactidIndex As Integer = i - 1
                                '            Try
                                '                If args.Length > 1 Then

                                '                    For iContExtraCount = 0 To args.Length - 1
                                '                        'Add A Row to the Dataset
                                '                        'Very Specific here
                                '                        'ParseField, SLXID, SourceContactID, CreateDate, ModifyDate
                                '                        myRow2 = TempTable.NewRow
                                '                        myTempStringID = Create1SLXID("ACustomTable", txtSLXProvider.Text) 'SLXID 


                                '                        myRow2.Item(0) = SourceIDs(0, i) 'Record_id
                                '                        myRow2.Item(1) = Now.ToUniversalTime.ToString("yyyyMMdd HH:mm:ss") ' Createdate
                                '                        myRow2.Item(2) = Now.ToUniversalTime.ToString("yyyyMMdd HH:mm:ss") ' Modifydate
                                '                        myRow2.Item(3) = SourceIDs(3, i) ' Client_id
                                '                        myRow2.Item(4) = SourceIDs(4, i) ' Contact_number
                                '                        myRow2.Item(5) = SourceIDs(5, i) ' MaxContactid
                                '                        myRow2.Item(6) = SourceIDs(6, i) ' Boards
                                '                        myRow2.Item(7) = SourceIDs(7, i) ' Agencies
                                '                        myRow2.Item(8) = SourceIDs(8, i) ' Commitees
                                '                        myRow2.Item(9) = SourceIDs(9, i) ' Initiatives
                                '                        myRow2.Item(10) = args(iContExtraCount) ' Parsed Column in args
                                '                        myRow2.Item(11) = myTempStringID

                                '                        TempTable.Rows.Add(myRow2)
                                '                    Next
                                '                Else
                                '                    tmpRowItem = (SourceIDs(x, i))
                                '                End If
                                '            Catch ex As Exception
                                '                tmpRowItem = (SourceIDs(x, i))
                                '            End Try

                                '        Else
                                '            tmpRowItem = (SourceIDs(x, i))
                                '        End If
                                '    End If

                                'Case "CityCount"
                                '    CityMax += 1
                                '    tmpRowItem = CityMax

                                'Case "MAX_ACCOUNT_MAINPHONE"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_ACCOUNT_Phone("MAINPHONE", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)

                                'Case "MAX_ACCOUNT_ALTERNATEPHONE"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_ACCOUNT_Phone("ALTERNATEPHONE", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)

                                'Case "MAX_ACCOUNT_FAX"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_ACCOUNT_Phone("FAX", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)
                                'Case "MAX_ACCOUNT_TOLLFREE"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_ACCOUNT_Phone("TOLLFREE", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)
                                'Case "MAX_ACCOUNT_TOLLFREE2"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_ACCOUNT_Phone("TOLLFREE2", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)
                                'Case "MAX_ACCOUNT_OTHERPHONE1"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_ACCOUNT_Phone("OTHERPHONE1", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)
                                'Case "MAX_ACCOUNT_OTHERPHONE2"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_ACCOUNT_Phone("OTHERPHONE2", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)
                                'Case "MAX_ACCOUNT_OTHERPHONE3"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_ACCOUNT_Phone("OTHERPHONE3", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)

                                'Case "MAX_CONTACT_WORKPHONE"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_CONTACT_Phone("WORKPHONE", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)
                                'Case "MAX_CONTACT_HOMEPHONE"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_CONTACT_Phone("HOMEPHONE", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)
                                'Case "MAX_CONTACT_FAX"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_CONTACT_Phone("FAX", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)
                                'Case "MAX_CONTACT_MOBILE"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_CONTACT_Phone("MOBILE", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)
                                'Case "MAX_CONTACT_PAGER"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_CONTACT_Phone("PAGER", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)
                                'Case "MAX_CONTACT_OTHERPHONE"
                                '    Dim p1 As String = SourceIDs(0, i) ' The First Index of SourceiDs
                                '    Dim p1_desc As String = SourceIDs(1, i)
                                '    Dim p2 As String = SourceIDs(2, i)
                                '    Dim p2_desc As String = SourceIDs(3, i)
                                '    Dim p3 As String = SourceIDs(4, i)
                                '    Dim p3_desc As String = SourceIDs(5, i)
                                '    Dim p4 As String = SourceIDs(6, i)
                                '    Dim p4_desc As String = SourceIDs(7, i)

                                '    tmpRowItem = MAX_CONTACT_Phone("OTHERPHONE", p1, p1_desc, p2, p2_desc, p3, p3_desc, p4, p4_desc)


                            Case Else
                                If IsDate(SourceIDs(x, i)) Then
                                    'Checks if the Source is a DateFormat
                                    'If so Then Conver to ISO Format. and GMT
                                    tmpDate = CDate(SourceIDs(x, i))
                                    tmpRowItem = tmpDate.ToUniversalTime.ToString("yyyyMMdd HH:mm:ss")
                                Else
                                    tmpRowItem = (SourceIDs(x, i))
                                End If
                        End Select

                        '========================================================================
                        'MYNEWID
                        '=======================================================================
                        myrow.Item(x) = tmpRowItem
                    Next
                    'Add the SLX Rows.
                    j = 0
                    For x = iSLXColumnStart To iSLXColumnEnd
                        'Test and Try to Add SLXIDs1 Ect....
                        myrow.Item(x) = SLXIDArray(j, i)
                        j += 1
                    Next

                    TempTable.Rows.Add(myrow)

                    '======================================================
                    ' Report the Status ...Note this is not Thread Safe
                    'objCurrentForm.lblRecordCountStatus.Text = i & "  of  " & iNumIdstoCreate
                    ' Report progress as a percentage of the total task.
                    percentComplete = CSng(i) / CSng(iNumIdstoCreate) * 100
                    If percentComplete > 100 Then percentComplete = 100
                    worker.ReportProgress(percentComplete) ' Report Progress if Needed
                    '======================================================
                Next
            Catch ex As Exception
                MsgBox("An Error Occured" & ex.Message & ex.TargetSite.Name.ToString)
            End Try

            'Me.Refresh() 'Refresh the Form
            '        MsgBox("Done createing Table")
            'Dim mystream As System.IO.Stream
            'ds.WriteXml("C:\TempContact2.xml")
            'ds.WriteXml("TempTable.xml")
            'Dim OutputFilepath As String = SLXTable.TableName & ".xml"
            'ds.WriteXml(OutputFilepath)
            ''ds.WriteXmlSchema("TempTableSchema.xsd") 'This doens't create a correct Schema
            ''MsgBox("Successfully Created XML")
            'StatusBar1.Panels(3).Text = "Successfully Created XML"
            'StatusBar1.Refresh()
            '======================================
            'TempTable.Dispose()
            'TempTable.Dispose()
            'TempTable = Nothing
            ''ds.Dispose()
            'ds.Dispose()
            'ds = Nothing ' dim managed variable
            '=====================================
            SLXIDArray = Nothing ' Clean Up Memory
            SourceIDs = Nothing ' Clean Up Memory


            '=========================================================================================
            'Drop the Table it Currently Exists in the Database
            '=========================================================================================
            'DropTable(SLXTable.TableName, objMap) ' Create Table handles this now
            '====================================================================================================
            ' CREATE SQL TABLE
            'THE TABLE Must Exist and have the Same Schema
            '====================================================================================================
            CreateTable(objMap, ds.Tables(0))
            worker.ReportProgress(50) ' Report Progress if Needed
            '========================================================================================================
            ' Create SqlBulkCopy  Using the New Method
            '===================================================================================================
            Dim strSQLConnString As String = ""  'Need to Modify the OleDB Connection String to remove the Provider Portion because
            strSQLConnString = objMap.m_SLXNativeConnection   ' The SQLClient Assumes your using the SQL server Provider and it will error if you have it there.
            'Dim i As Integer = 0
            i = InStr(strSQLConnString, ";")
            strSQLConnString = Mid(strSQLConnString, i + 1)

            Try
                Dim bulkData As System.Data.SqlClient.SqlBulkCopy = New System.Data.SqlClient.SqlBulkCopy(strSQLConnString)
                bulkData.BulkCopyTimeout = 3600 'BulkCopy for 1 Hour
                ' Set destination table name
                bulkData.DestinationTableName = objMap.m_TempTableName
                ' Write data
                bulkData.WriteToServer(ds.Tables.Item(0))
                ' Close objects
                bulkData.Close()
                worker.ReportProgress(75) ' Report Progress if Needed
            Catch ex As Exception
                MsgBox(ex.Message)
            End Try



            '========================================================================================================
            ' Create SqlBulkCopy  
            '===================================================================================================
            'Dim strSQLConnString As String = ""  'Need to Modify the OleDB Connection String to remove the Provider Portion because
            'strSQLConnString = objMap.m_SLXNativeConnection  ' The SQLClient Assumes your using the SQL server Provider and it will error if you have it there.
            ''Dim i As Integer = 0
            'i = InStr(strSQLConnString, ";")
            'strSQLConnString = Mid(strSQLConnString, i + 1)

            'Try
            '    Dim bulkData As System.Data.SqlClient.SqlBulkCopy = New System.Data.SqlClient.SqlBulkCopy(strSQLConnString)
            '    ' Set destination table name
            '    bulkData.DestinationTableName = "ZZTmpUserSubscription"
            '    ' Write data
            '    bulkData.WriteToServer(ds.Tables.Item(0))
            '    ' Close objects
            '    bulkData.Close()
            'Catch ex As Exception
            '    MsgBox(ex.Message)
            'End Try

            'StatusBar1.Panels(3).Text = "Creating XML Schema"
            'StatusBar1.Refresh()
            'CreateXDS(SourceColumnArray, SLXColumnArray, SLXTable.TableName)

            'StatusBar1.Panels(3).Text = "SQLXML Bulk Loading " & SLXTable.TableName & "  ... Please Wait"
            'StatusBar1.Refresh()
            'BulKLoad(SourceColumnArray, SLXColumnArray, SLXTable.TableName)

            'StatusBar1.Panels(3).Text = "Updating TempTable... Please Wait"
            'StatusBar1.Refresh()
            FixDateColumns(SourceColumnArray, SLXTable.TableName, objMap)
            worker.ReportProgress(100) ' Report Progress if Needed

            'Cursor.Current = System.Windows.Forms.Cursors.Default ' Assign the Cursor
            'StatusBar1.Panels(3).Text = SLXTable.TableName & " Created Successfully"
        Catch ex As Exception
            MsgBox(ex.Message & ex.StackTrace)
            'ErrorLogfile.WriteLine("Error Occured Loading " & SLXTable.TableName & "  =  " & ex.Message.ToString)
        End Try
    End Function

    Public Sub CreateTable(ByVal objMap As clsMap, ByRef objTempTable As DataTable)
        '====================================================================================================
        ' CREATE SQL TABLE
        'THE TABLE Must Exist and have the Same Schema
        '====================================================================================================
        Dim strSQL As String
        strSQL = "if exists (select * from dbo.sysobjects where id = object_id(N'[sysdba].[" & objMap.m_TempTableName & "]') and OBJECTPROPERTY(id, N'IsUserTable') = 1) "
        strSQL = strSQL & " drop table [sysdba].[" & objMap.m_TempTableName & "] "
        '            GO()
        Dim cn As New OleDb.OleDbConnection(objMap.m_SLXNativeConnection)
        Try
            cn.Open()
            Dim objCmd As New OleDbCommand(strSQL, cn)
            objCmd.ExecuteNonQuery()

        Catch ex As Exception
            MsgBox(ex.Message & ex.StackTrace)
        Finally
            If cn.State = ConnectionState.Open Then
                cn.Close()
            End If
        End Try
        strSQL = "CREATE TABLE [sysdba].[" & objMap.m_TempTableName & "] ( "
        Dim myColumn As DataColumn
        For Each myColumn In objTempTable.Columns
            strSQL = strSQL & "	[" & myColumn.ColumnName & "] [varchar] (8000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL , "
        Next
        strSQL = strSQL & " ) ON [PRIMARY] "
        Try
            cn.Open()
            Dim objCMD As New OleDbCommand(strSQL, cn)
            objCMD.ExecuteScalar()
        Catch ex As Exception
            MsgBox(ex.Message & ex.StackTrace)
        Finally
            If cn.State = ConnectionState.Open Then
                cn.Close()
            End If

        End Try
    End Sub

    Public Function CreateSLXID(ByVal Table As String, _
                                ByVal strConnection As String, _
                                ByVal NumIDs As Integer, _
                                ByRef worker As BackgroundWorker) As String()
        'Dim strConnection
        ' ===================================================
        ' = You will Need to Create a Valid Connction String
        ' = Easiest way is to create a UDL File
        '====================================================
        'strConnection = "Provider=SLXOLEDB.1;Password=password;Persist Security Info=True;User ID=admin;Initial Catalog=SALESLOGIX_SERVER;Data Source=SALESLOGIX;Extended Properties=PORT=1706;LOG=ON"
        Dim executestring As String
        Dim sEntityAlias As String
        sEntityAlias = Table
        Select Case UCase(Table)
            Case "ATTACHMENT"
                sEntityAlias = "FILEATTACH"

            Case "USERNOTIFICATION"
                sEntityAlias = "USERNOTIFY"

            Case "AGENTS"
                sEntityAlias = "HOSTTASK"

            Case "RESOURCELIST"
                sEntityAlias = "RESOURCE"

            Case "USEROPTION"
                sEntityAlias = "USERVIEW"

            Case "JOINDATA"
                sEntityAlias = "JOIN"

            Case "PROCEDURES"
                sEntityAlias = "PROCEDURE"

            Case "SEC_FUNCTIONOWNER"
                sEntityAlias = "FUNCTIONHANDLER"

        End Select

        executestring = "slx_DBIDs(" & Chr(39) & sEntityAlias & Chr(39) & " , " & NumIDs & "  )"
        Dim myconn As New OleDb.OleDbConnection(strConnection)
        myconn.Open()
        Dim strTempString() As String
        Dim i As Integer = 0
        Dim objCMD As OleDbCommand = New OleDbCommand(executestring, myconn)
        Dim objReader As OleDbDataReader = objCMD.ExecuteReader()
        ReDim Preserve strTempString(objReader.RecordsAffected - 1)
        Dim percentComplete As Integer
        If objReader.HasRows Then
            Do While objReader.Read()
                strTempString(i) = objReader.GetString(0)
                '======================================================
                ' Report the Status ...Note this is not Thread Safe
                'objCurrentForm.lblRecordCountStatus.Text = i & "  of  " & iNumIdstoCreate
                ' Report progress as a percentage of the total task.
                percentComplete = CSng(i) / CSng(NumIDs) * 100
                If percentComplete > 100 Then percentComplete = 100
                worker.ReportProgress(percentComplete) ' Report Progress if Needed
                '======================================================
                i += 1
            Loop
        End If
        objReader.Close()
        myconn.Close()
        Return strTempString
    End Function

    Public Function Create1SLXID(ByVal Table As String, ByVal strConnection As String) As String
        'Dim strConnection
        ' ===================================================
        ' = You will Need to Create a Valid Connction String
        ' = Easiest way is to create a UDL File
        '====================================================
        'strConnection = "Provider=SLXOLEDB.1;Password=password;Persist Security Info=True;User ID=admin;Initial Catalog=SALESLOGIX_SERVER;Data Source=SALESLOGIX;Extended Properties=PORT=1706;LOG=ON"
        Dim executestring
        executestring = "slx_DBIDs(" & Chr(39) & Table & Chr(39) & " , 1  )"
        Dim myconn As New OleDb.OleDbConnection(strConnection)
        myconn.Open()
        Dim strTempString As String
        Dim i As Integer = 0
        Dim objCMD As OleDbCommand = New OleDbCommand(executestring, myconn)
        strTempString = objCMD.ExecuteScalar
        myconn.Close()
        Return strTempString
    End Function
    Public Sub CreateXDS(ByVal SourceColumnArray, ByVal SLXColumnArray, ByVal TableName)
        'Dim file As New System.IO.StreamWriter("TempTableSchema.xsd", False) ' if the file exist and Append is False, The file is overwritten
        Dim OutputFilepath As String = TableName & ".xsd"
        Dim file As New System.IO.StreamWriter(OutputFilepath, False) ' if the file exist and Append is False, The file is overwritten
        Dim content As String
        content = "<xsd:schema xmlns:xsd=" & Chr(34) & "http://www.w3.org/2001/XMLSchema" & Chr(34) & " xmlns:sql=" & Chr(34) & "urn:schemas-microsoft-com:mapping-schema" & Chr(34) & " >" '& _
        '" xmlns:dt=" & Chr(34) & "urn:schemas-microsoft-com:datatypes" & Chr(34) & ">"
        file.WriteLine(content)
        content = "<xsd:element name=" & Chr(34) & "NewDataSet" & Chr(34) & " sql:is-constant=" & Chr(34) & "1" & Chr(34) & " >"
        file.WriteLine(content)
        file.WriteLine("<xsd:complexType>")
        file.WriteLine("<xsd:sequence>")
        content = "<xsd:element name=" & Chr(34) & TableName & Chr(34) & " sql:relation=" & Chr(34) & TableName & Chr(34) & " maxOccurs=" & Chr(34) & "unbounded" & Chr(34) & ">"
        file.WriteLine(content)
        content = "<xsd:complexType>"
        file.WriteLine(content)
        content = "<xsd:sequence>"
        file.WriteLine(content)
        '=========================================================
        Dim i, iInstr As Integer
        Dim strTemp As String
        Dim strDefautHeader As String
        strDefautHeader = "<xsd:element name=" & Chr(34)
        For i = 0 To SourceColumnArray.Length - 1
            strTemp = SourceColumnArray(i)
            iInstr = InStr(strTemp, "Date", CompareMethod.Text)
            If iInstr = 0 Then 'Date Not Found in ColumnName'
                content = strDefautHeader & strTemp & Chr(34) & " type=" & Chr(34) & "xsd:string" & Chr(34) & " />"
                file.WriteLine(content)
            Else
                content = strDefautHeader & strTemp & Chr(34) & " type=" & Chr(34) & "xsd:string" & Chr(34) & " />"
                file.WriteLine(content)
            End If
        Next
        For i = 0 To SLXColumnArray.Length - 1
            strTemp = SLXColumnArray(i)
            content = strDefautHeader & strTemp & Chr(34) & " type=" & Chr(34) & "xsd:string" & Chr(34) & " />"
            file.WriteLine(content)

        Next
        '<xsd:element name="CustomerID"  type="xsd:integer" />
        '<xsd:element name="CompanyName" type="xsd:string" />
        '<xsd:element name="City"        type="xsd:string" />
        '========================================================
        file.WriteLine("</xsd:sequence>")
        file.WriteLine("</xsd:complexType>")
        file.WriteLine("</xsd:element>")
        file.WriteLine("</xsd:sequence>")
        file.WriteLine("</xsd:complexType>")
        file.WriteLine("</xsd:element>")
        file.WriteLine("</xsd:schema>")
        file.Close()
    End Sub
    Public Sub BulKLoad(ByVal SourceColumnArray, ByVal SLXColumnArray, ByVal TableName)
        ''=========================================================================
        '' Create the SQL Server Table
        ''=========================================================================
        'Dim i As Integer
        'Dim iInstr As Integer
        'Dim strTemp As String
        ''CREATE TABLE Customer (
        ''CustomerId INT PRIMARY KEY,
        ''CompanyName NVARCHAR(20),
        ''City NVARCHAR(20))
        'Dim SQL As String
        'SQL = "CREATE TABLE " & TableName & "("
        'For i = 0 To SourceColumnArray.Length - 1
        '    strTemp = SourceColumnArray(i)
        '    iInstr = InStr(strTemp, "Date", CompareMethod.Text)
        '    If iInstr = 0 Then 'Date Not Found in ColumnName'
        '        SQL = SQL & strTemp & " varchar(80),"
        '    Else
        '        SQL = SQL & strTemp & " varchar(80)," '" datetime," BulkLoading was not working with the DateTime format
        '    End If
        'Next
        'For i = 0 To SLXColumnArray.Length - 1
        '    strTemp = SLXColumnArray(i)
        '    SQL = SQL & strTemp & " char(12),"
        'Next
        ''Clean the Last Comma and Space from the SQL String parameters  
        'i = SQL.Length
        'SQL = Mid(SQL, 1, SQL.Length - 1)
        'SQL = SQL & ")"
        'Dim myConn As New OleDbConnection(txtSLXNative.Text)
        'Try
        '    myConn.Open()
        '    Dim CMD As New OleDb.OleDbCommand(SQL, myConn)
        '    CMD.ExecuteNonQuery()
        'Catch ex As Exception
        '    'MsgBox(ex.Message)
        '    ErrorLogfile.WriteLine("Error Occured Loading " & TableName & "  =  " & ex.Message.ToString)
        'Finally
        '    If myConn.State = ConnectionState.Open Then myConn.Close()
        'End Try
        'myConn = Nothing

        ''===========================================================================

        ''Dim objBL As SQLXMLBULKLOADLib.SQLXMLBulkLoad3 = New SQLXMLBULKLOADLib.SQLXMLBulkLoad3Class
        'Dim objBL As SQLXMLBulkLoad3 = New SQLXMLBulkLoad3 'SQLXMLBULKLOADLib.SQLXMLBulkLoad3 = New SQLXMLBULKLOADLib.SQLXMLBulkLoad3Class
        'objBL.XMLFragment = True
        'objBL.KeepIdentity = False
        ''= CreateObject("SQLXMLBulkLoad.SQLXMLBulkLoad.3.0")
        'objBL.ConnectionString = txtSLXNative.Text '"provider=SQLOLEDB.1;data source=MySQLServer;database=MyDatabase;uid=MyAccount;pwd=MyPassword"
        'objBL.ErrorLogFile = "c:\error.log"
        'objBL.KeepNulls = True
        'Dim OutputFilepathXSD As String = TableName & ".xsd"
        'Dim OutputFilepathXML As String = TableName & ".xml"
        ''objBL.Execute("TempTableSchema.xsd", "TempTable.xml")
        'objBL.Execute(OutputFilepathXSD, OutputFilepathXML)
        'objBL = Nothing

    End Sub
    Public Sub FixDateColumns(ByVal SourceColumnArray As String(), ByVal TableName As String, ByVal objMap As clsMap)
        Dim i As Integer
        Dim iInstr As Integer
        Dim strTemp As String
        Dim SQLHeader As String
        Dim SQL As String
        Dim oConn As New OleDb.OleDbConnection(objMap.m_SLXNativeConnection)
        Dim oCmd As New OleDb.OleDbCommand
        oCmd.Connection = oConn
        SQLHeader = "ALTER TABLE " & TableName & " ALTER COLUMN "
        For i = 0 To SourceColumnArray.Length - 1
            strTemp = SourceColumnArray(i)
            iInstr = InStr(strTemp, "Date", CompareMethod.Text)
            If iInstr = 0 Then 'Date Not Found in ColumnName'
                'DO NOTHING
            Else
                SQL = SQLHeader & strTemp & " DATETIME "
                Try
                    oConn.Open()
                    oCmd.CommandText = SQL
                    oCmd.CommandTimeout = 3600 ' Wait 1 hour before timeout error
                    oCmd.ExecuteNonQuery()
                    SQL = ""
                Catch ex As Exception
                    MsgBox(ex.Message & ex.StackTrace)
                    'ErrorLogfile.WriteLine("Error Occured Loading " & TableName & "  =  " & ex.Message.ToString)
                Finally
                    If oConn.State = ConnectionState.Open Then oConn.Close()
                End Try

            End If
        Next
    End Sub
    Public Sub DropTable(ByVal TableName As String, ByVal objMap As clsMap)
        Dim conn As New OleDbConnection(objMap.m_SLXNativeConnection)
        Dim SQL As String
        'SQL = "if exists (select * from dbo.sysobjects where id = object_id(N'[sysdba].[" & TableName & "]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)"
        SQL = SQL & " drop table " & TableName
        'MsgBox(SQL)
        Try
            conn.Open()
            Dim cmd As New OleDbCommand(SQL, conn)
            cmd.ExecuteNonQuery()
        Catch ex As Exception
        Finally
            If conn.State = ConnectionState.Open Then conn.Close()
        End Try
    End Sub
    Public Function GetSourceColumns(ByVal SourceQuery As String, ByRef Count As Integer, ByVal objMap As clsMap) As String()
        Dim tmpStringArray() As String
        Dim conn As New OleDb.OleDbConnection(objMap.m_SourceConnection)
        Dim SQL As String = SourceQuery
        Try
            Dim myCmd As New OleDb.OleDbCommand(SQL, conn)
            Dim ds As New Data.DataSet
            Dim myAdapter As New OleDb.OleDbDataAdapter
            myAdapter.SelectCommand = myCmd
            conn.Open()
            Cursor.Current = System.Windows.Forms.Cursors.WaitCursor ' Assign the Cursor
            myAdapter.Fill(ds, "SourceTable")
            Cursor.Current = System.Windows.Forms.Cursors.Default
            '===============================================================
            ' Now we have a Filled Dataset will all the Columns from the SLX
            '===============================================================
            Dim myTable As Data.DataTable
            myTable = ds.Tables(0)
            Dim i As Integer
            For i = 0 To myTable.Columns.Count - 1
                ReDim Preserve tmpStringArray(i)
                tmpStringArray(i) = myTable.Columns(i).ToString()
            Next
            '============================================================================
            ' Get the Record Count
            '============================================================================
            Dim strCountSQL As String
            Dim iFound As Integer
            iFound = InStr(SourceQuery, "FROM")
            strCountSQL = "SELECT COUNT(*) " & Mid(SourceQuery, iFound)
            Try
                Dim objCountCmd As New OleDbCommand(strCountSQL, conn)
                Count = CInt(objCountCmd.ExecuteScalar)
            Catch ex As Exception
                MsgBox(ex.Message & ex.StackTrace)
            End Try

            'Dim myReader As OleDbDataReader = objCountCmd.ExecuteReader
            'Dim iCount As Integer = 0
            'If myReader.HasRows Then
            '    Do While myReader.Read()
            '        iCount += 1
            '        'Used Simply to Get a Count of the Number of Records
            '    Loop
            'Else

            '    'Console.WriteLine("No rows returned.")
            'End If
            'myReader.Close()
            'Count = iCount 'Set the Value that is used by Reference to Capture the Record Count
            '================================================
        Catch ex As Exception
            'MsgBox(ex.Message)
            'ErrorLogfile.WriteLine("Error Occured Loading DataSet = " & "   " & ex.Message.ToString)
        Finally
            If conn.State = ConnectionState.Open Then
                conn.Close()
            End If
        End Try
        Return tmpStringArray
    End Function



#End Region

End Module
