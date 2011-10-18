Imports System.Data.OleDb
Imports System.IO
Imports MSDASC 'Used to Create DataLinks
Imports System.Data
Imports ADODB
Imports System.Threading
Imports System.ComponentModel
Public Class frmMain
    Public m_Project As New clsProject
    Public m_CurrentMapIndex As Integer = 0
    Public m_SelectedColor As System.Drawing.Color = Color.PowderBlue
    Public m_objMainConnectionSettings As clsMainConnectionSettings


    Public Sub IntializeMapControls()
        'm_Project.m_MapArray(m_CurrentMapIndex).m_Initialized = False
        '=============
        'Connection
        '=============
        txtSourceNative.Text = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection
        txtSLXNative.Text = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXNativeConnection
        txtSLXProvider.Text = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXProviderConnection

        '==============
        'Mapping
        '==============
        'Source Mapping
        LoadTableComboBox(cboSourceTable, m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection)
        cboSourceTable.Text = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName

        Try
            'LoadSourceDatagridTableStyle()
            'Load Source DataSet
            LoadSourceDatset(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset, _
                             m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection, _
                              m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName)

            'dgSource.DataSource= m_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset
            'dgSource.Refresh()
        Catch ex As Exception

        End Try

        cboSourcePK.Text = m_Project.m_MapArray(m_CurrentMapIndex).m_SourcePK
        Try
            chkUseQuery.Checked = m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuery
        Catch ex As Exception
        End Try
        '==============================================
        '  Target Mapping SLX
        '==============================================
        'cboSLXTable
        LoadTableComboBox(cboSLXTable, m_Project.m_MapArray(m_CurrentMapIndex).m_SLXNativeConnection)
        cboSLXTable.Text = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName

        Try
            'LoadTargetDatagridTableStyle()
            LoadTargetDataset(m_Project.m_MapArray(m_CurrentMapIndex).m_SLXDestinationDataSet, _
                                            m_Project.m_MapArray(m_CurrentMapIndex).m_SLXNativeConnection, _
                                            m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName)
            'dgTarget.DataSource = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXDestinationDataSet '.Tables(m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName)
            'dgTarget.Refresh()
        Catch ex As Exception

        End Try


        '==============================================
        '  SourceTarget Mapping SLX
        '==============================================
        Dim strSourceTable As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName
        Dim strSLXTable As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName
        Dim strSourceTargetTableName As String = m_Project.m_MapArray(m_CurrentMapIndex).m_Source_Target_TableName

        If strSourceTable = "" Or strSLXTable = "" Then
            ' Do Not Load the Grid.
            ' Clear it out
            dgSourceTargetMapping.DataSource = Nothing
        Else
            ' Valid So Populate the Grid
            Try
                'LoadTargetDatagridTableStyle()
                LoadSourceTargetMappingDataset(m_Project.m_MapArray(m_CurrentMapIndex).m_Source_TargetMappingDataset, _
                                               m_Project.m_MapArray(m_CurrentMapIndex).m_Source_Target_TableName)
                
            Catch ex As Exception

            End Try


        End If


        
        '==============
        'TempTable
        '==============
        txtTempTableName.Text = m_Project.m_MapArray(m_CurrentMapIndex).m_TempTableName

        '==============
        'View
        '==============
        txtViewName.Text = m_Project.m_MapArray(m_CurrentMapIndex).m_ViewName
        txtIntialViewScript.Text = m_Project.m_MapArray(m_CurrentMapIndex).m_ViewInitialScript
        txtEditedViewSQL.Text = m_Project.m_MapArray(m_CurrentMapIndex).m_ViewEditedScript

        '==============
        'DTS
        '==============
        txtDTSscript.Text = m_Project.m_MapArray(m_CurrentMapIndex).m_DTSScript

        '==============
        'SQL fixes
        '==============
        txtSQLScript.Text = m_Project.m_MapArray(m_CurrentMapIndex).m_SQLFixesScript

        'm_Project.m_MapArray(m_CurrentMapIndex).m_Initialized = True


    End Sub

    Public Function GetSLXConnectionString(ByVal constr As String) As String
        'Microsoft OLE DB Service Component Data Links
        Dim dlink, cn As Object
        dlink = CreateObject("Datalinks")
        ' Microsoft AxtiveX Data Objects Connection
        cn = CreateObject("ADODB.Connection")
        If constr = "" Then
            cn.ConnectionString = "Provider=SLXOLEDB.1;"
        Else
            cn.ConnectionString = constr
        End If

        ' Pass the connection to the datalinks PromptEdit
        ' - this opens the Data Link Properties window
        Dim ConnectionString As String = ""
        If dlink.PromptEdit((cn)) Then

            ' Read the resulting Connection String
            ConnectionString = cn.ConnectionString

            ' release the connection
            cn = Nothing
        Else
            '' User Canceled
            ConnectionString = constr

        End If
        Return ConnectionString


    End Function
    Public Function GetConnectionString(ByVal constr As String) As String
        'Microsoft OLE DB Service Component Data Links
        Dim dlink, cn As Object
        dlink = CreateObject("Datalinks")
        ' Microsoft AxtiveX Data Objects Connection
        cn = CreateObject("ADODB.Connection")
        If constr = "" Then
            cn.ConnectionString = "Provider=SQLOLEDB.1;Persist Security Info=True;User ID=sysdba;"
        Else
            cn.ConnectionString = constr
        End If

        ' Pass the connection to the datalinks PromptEdit
        ' - this opens the Data Link Properties window
        Dim ConnectionString As String = ""
        If dlink.PromptEdit((cn)) Then

            ' Read the resulting Connection String
            ConnectionString = cn.ConnectionString

            ' release the connection
            cn = Nothing

        End If
        Return ConnectionString


    End Function

    Public Sub ReLoadMapList()
        Dim i As Integer
        lstMaps.Items.Clear()
        For i = 0 To m_Project.m_MapArray.Length - 1
            lstMaps.Items.Add(m_Project.m_MapArray(i).m_MapName, 0)
            m_CurrentMapIndex = i
            lblStatus.Text = "Editing " & m_Project.m_MapArray(m_CurrentMapIndex).m_MapName & "  Map"
        Next
        lstMaps.Items(i - 1).BackColor = m_SelectedColor
    End Sub


#Region " Mapping DataGrid Section "


    Public Sub LoadSourceDatset(ByRef ds As DataSet, ByVal strConnection As String, ByVal TableName As String)

        '=======================================================
        ' If the Map has not been Itialized yet then Hold off
        '=======================================================
        'If m_Project.m_MapArray(m_CurrentMapIndex).m_Initialized = False Then
        ' Exit Sub
        ' End If

        Dim TempTable As Data.DataTable
        Try
            If ds Is Nothing Then
                ds = New DataSet
                'TempTable = ds.Tables.Add(TableName)
                'TempTable.TableName = TableName
                'LoadSourceTempTable(TempTable, ds, TableName)
            Else
                '==========================
                'Find the Existing Table.
                '==========================
                Dim j As Integer = 0
                For j = 0 To ds.Tables.Count - 1
                    'ds.Tables.Remove(ds.Tables(j))
                    If ds.Tables(j).TableName = TableName Then
                        TempTable = ds.Tables(j)
                    End If
                Next


            End If
            ' Load the TempTable Information
            If TempTable Is Nothing Then
                LoadSourceTempTable(TempTable, ds, TableName)
            End If
            'LoadSourceDatagridTableStyle()
            'Set the DataSource
            dgSource.DataSource = TempTable 'm_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset.Tables(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName)
            dgSource.Columns(0).ReadOnly = True ' Mapping
            dgSource.Columns(1).ReadOnly = True ' Column Name
            dgSource.Refresh()
        Catch ex As Exception
            'MsgBox(ex.Message & ex.StackTrace)
        End Try
    End Sub
    Public Sub LoadSourceTempTable(ByRef TempTable As Data.DataTable, ByRef ds As DataSet, ByRef TableName As String)
        TempTable = ds.Tables.Add(TableName)
        TempTable.TableName = TableName
        '=====================================
        'Add the Source Columns to the DataTable
        '====================================='
        TempTable.Columns.Add("Mapped", System.Type.GetType("System.Boolean"))
        TempTable.Columns.Add("Column", System.Type.GetType("System.String"))
        TempTable.Columns.Add("Tmp", System.Type.GetType("System.Boolean"))
        'TempTable.Columns.Add("PK", System.Type.GetType("System.Boolean"))

        Dim myrow As DataRow
        'Dim j As Integer = 0
        Dim FieldList() As String
        Dim SQL As String
        If m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuery Then
            SQL = m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuerySQL
        Else
            SQL = "Select * From " & m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName & " Where 1=2"
        End If
        FieldList = LoadFieldList(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection, m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName, SQL)
        If FieldList Is Nothing Then
            Exit Sub

        End If
        Try
            Dim i As Integer = 0
            For i = 0 To FieldList.Length - 1
                '===================================================
                myrow = TempTable.NewRow
                '===============================================================
                'Add the Rows to the Data Set... First the Source, then the SLX
                '===============================================================
                myrow.Item(0) = False 'Mapped Column
                myrow.Item(1) = FieldList(i) ' Column
                myrow.Item(2) = False 'Tmp Column
                'myrow.Item(3) = False 'PK Column

                TempTable.Rows.Add(myrow)
            Next
        Catch ex As Exception

        End Try
    End Sub

    Public Sub LoadSourceTargetMappingDataset(ByRef ds As DataSet, ByVal TableName As String)

        Dim TempTable As Data.DataTable
        Try
            If ds Is Nothing Then
                ds = New DataSet

            Else
                '==========================
                'Find the Existing Table.
                '==========================
                Dim j As Integer = 0
                For j = 0 To ds.Tables.Count - 1
                    'ds.Tables.Remove(ds.Tables(j))
                    If ds.Tables(j).TableName = TableName Then
                        TempTable = ds.Tables(j)
                    End If
                Next


            End If
            ' Load the TempTable Information
            If TempTable Is Nothing Then
                TempTable = ds.Tables.Add(TableName)
                TempTable.TableName = TableName
                '=====================================
                'Add the Source Columns to the DataTable
                '====================================='
                TempTable.Columns.Add("Source", System.Type.GetType("System.String"))
                'TempTable.Columns.Add("To", System.Type.GetType("System.String"))
                TempTable.Columns.Add("SLX", System.Type.GetType("System.String"))
            End If
            'LoadSourceDatagridTableStyle()
            'Set the DataSource
            dgSourceTargetMapping.DataSource = TempTable 'm_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset.Tables(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName)
            dgSource.Refresh()

        Catch ex As Exception
            'MsgBox(ex.Message & ex.StackTrace)
        End Try
        'End If

    End Sub

    Public Sub AddSourceTargetRow(ByRef ds As DataSet, _
                                  ByRef TableName As String, _
                                  ByVal SourceRowVal As String, _
                                  ByVal TargetRowVal As String)



        Dim TempTable As Data.DataTable
        If ds Is Nothing Then
            Exit Sub
        Else
            '==========================
            'Find the Existing Table.
            '==========================
            Dim j As Integer = 0
            For j = 0 To ds.Tables.Count - 1
                'ds.Tables.Remove(ds.Tables(j))
                If ds.Tables(j).TableName = TableName Then
                    TempTable = ds.Tables(j)
                End If
            Next
        End If
        '=============================================================
        ' Ensure the SLX Field Is Not Allready Mapped
        '=============================================================
        Dim myrow As DataRow
        For Each myrow In TempTable.Rows
            If myrow.Item(1) = TargetRowVal Then ' Cannot have more than One Mapped SLX Column
                MsgBox("SLX Column allready Mapped", MsgBoxStyle.Information)
                Exit Sub
            End If

        Next


        Try
            '===================================================
            myrow = TempTable.NewRow
            '===============================================================
            'Add the Rows to the Data Set... First the Source, then the SLX
            '===============================================================
            myrow.Item(0) = SourceRowVal 'Source
            myrow.Item(1) = TargetRowVal 'Target
            TempTable.Rows.Add(myrow)

            dgSourceTargetMapping.DataSource = TempTable
            dgSourceTargetMapping.Refresh()

            '==================================================
            ' Set Source and Target Rows to Mapped
            '==================================================
            SetSourceRow2_Mapped(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset, _
                                 m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName, _
                                 SourceRowVal, True)
            SetSLXRow2_Mapped(m_Project.m_MapArray(m_CurrentMapIndex).m_SLXDestinationDataSet, _
                                m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName, _
                                TargetRowVal, True)

        Catch ex As Exception

        End Try
    End Sub
    Public Sub SetSourceRow2_Mapped(ByRef ds As DataSet, _
                                ByVal TableName As String, _
                                ByVal SourceRowVal As String, _
                                ByVal blnValue As Boolean)

        Try
            Dim TempTable As Data.DataTable

            If ds Is Nothing Then
                ds = New DataSet

            Else
                '==========================
                'Find the Existing Table.
                '==========================
                Dim j As Integer = 0
                For j = 0 To ds.Tables.Count - 1
                    'ds.Tables.Remove(ds.Tables(j))
                    If ds.Tables(j).TableName = TableName Then
                        TempTable = ds.Tables(j)
                    End If
                Next


            End If
            ' Load the TempTable Information
            If Not TempTable Is Nothing Then
                'Loop Through and Find the Row.
                Dim myRow As DataRow
                For Each myRow In TempTable.Rows
                    If myRow.Item(1) = SourceRowVal Then
                        '===============================
                        ' Found ... then set to Mapped
                        '===============================
                        myRow.Item(0) = blnValue
                    End If
                Next

            End If
            dgSource.DataSource = TempTable
            dgSource.Refresh()
        Catch ex As Exception

        End Try
    End Sub
    Public Sub SetSLXRow2_Mapped(ByRef ds As DataSet, _
                                ByVal TableName As String, _
                                ByVal SourceRowVal As String, _
                                ByVal blnValue As Boolean)

        Try
            Dim TempTable As Data.DataTable

            If ds Is Nothing Then
                ds = New DataSet

            Else
                '==========================
                'Find the Existing Table.
                '==========================
                Dim j As Integer = 0
                For j = 0 To ds.Tables.Count - 1
                    'ds.Tables.Remove(ds.Tables(j))
                    If ds.Tables(j).TableName = TableName Then
                        TempTable = ds.Tables(j)
                    End If
                Next


            End If
            ' Load the TempTable Information
            If Not TempTable Is Nothing Then
                'Loop Through and Find the Row.
                Dim myRow As DataRow
                For Each myRow In TempTable.Rows
                    If myRow.Item(1) = SourceRowVal Then
                        '===============================
                        ' Found ... then set to Mapped
                        '===============================
                        myRow.Item(0) = blnValue
                    End If
                Next

            End If
            dgTarget.DataSource = TempTable
            dgTarget.Refresh()
        Catch ex As Exception

        End Try
    End Sub

    Public Sub RemoveSourceTargetRow(ByRef ds As DataSet, _
                                 ByRef TableName As String, _
                                 ByVal strSourceVal As String, _
                                 ByVal strSLXVal As String)
        Try


            Dim TempTable As Data.DataTable
            If ds Is Nothing Then
                Exit Sub
            Else
                '==========================
                'Find the Existing Table.
                '==========================
                Dim j As Integer = 0
                For j = 0 To ds.Tables.Count - 1
                    'ds.Tables.Remove(ds.Tables(j))
                    If ds.Tables(j).TableName = TableName Then
                        TempTable = ds.Tables(j)
                    End If
                Next
            End If
            '=============================================================
            ' Remove the Row from the Table
            '=============================================================
            Dim myrow As DataRow
            For Each myrow In TempTable.Rows
                If myrow.Item(0) = strSourceVal And myrow.Item(1) = strSLXVal Then ' Find the Row with the Corresponding Source and Target Values.
                    ' Remove the Row.
                    TempTable.Rows.Remove(myrow)
                    Exit For ' Break out of the Loop
                End If

            Next
            dgSourceTargetMapping.DataSource = TempTable
            dgSourceTargetMapping.Refresh()

            '==================================================
            ' Set Source and Target Rows to Mapped
            '==================================================
            SetSourceRow2_Mapped(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset, _
                                 m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName, _
                                 strSourceVal, False)
            SetSLXRow2_Mapped(m_Project.m_MapArray(m_CurrentMapIndex).m_SLXDestinationDataSet, _
                                m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName, _
                                strSLXVal, False)
        Catch ex As Exception
            MsgBox(ex.Message & ex.StackTrace)
        End Try


    End Sub

    Public Sub LoadTargetDataset(ByRef ds As DataSet, ByVal strConnection As String, ByVal TableName As String)

        '=======================================================
        ' If the Map has not been Itialized yet then Hold off
        '=======================================================
        'If m_Project.m_MapArray(m_CurrentMapIndex).m_Initialized = False Then
        ' Exit Sub
        ' End If
        If TableName Is Nothing Or TableName = "" Then
            dgTarget.DataSource = Nothing
            dgTarget.Refresh()
            Exit Sub
        End If

        Dim TempTable As Data.DataTable
        If ds Is Nothing Then
            ds = New DataSet
            'TempTable = ds.Tables.Add(TableName)
            'TempTable.TableName = TableName
            'LoadTargetTempTable(TempTable, ds, TableName)
        Else
            '==========================
            'Find the Existing Table.
            '==========================
            Dim j As Integer = 0
            For j = 0 To ds.Tables.Count - 1
                'ds.Tables.Remove(ds.Tables(j))
                If ds.Tables(j).TableName = TableName Then
                    TempTable = ds.Tables(j)
                End If
            Next
        End If
        If TempTable Is Nothing Then
            LoadTargetTempTable(TempTable, ds, TableName)
        End If
        dgTarget.DataSource = TempTable 'm_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset.Tables(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName)
        dgTarget.Columns(0).ReadOnly = True ' Mapping
        dgTarget.Columns(1).ReadOnly = True ' Column Name
        dgTarget.Columns(4).Visible = True ' CreateID4Table 

       
        dgTarget.Refresh()
        'LoadTargetDatagridTableStyle()
    End Sub
    Public Sub LoadTargetTempTable(ByRef TempTable As Data.DataTable, ByRef ds As DataSet, ByRef TableName As String)
        TempTable = ds.Tables.Add(TableName)
        TempTable.TableName = TableName
        '=====================================
        'Add the Source Columns to the DataTable
        '====================================='
        TempTable.Columns.Add("Mapped", System.Type.GetType("System.Boolean"))
        TempTable.Columns.Add("Column", System.Type.GetType("System.String"))
        TempTable.Columns.Add("CreateID", System.Type.GetType("System.Boolean"))
        TempTable.Columns.Add("Add2View", System.Type.GetType("System.Boolean"))
        ''============================================
        '' Create combobox Column Doesn't Seem to Work
        ''=================================
        'Dim tmpcolumn As New DataGridViewComboBoxColumn
        'tmpcolumn.HeaderText = "CreateID4Table"
        'Dim i As Integer
        'tmpcolumn.Items.Clear()
        'For i = 0 To cboSLXTable.Items.Count - 1
        '    tmpcolumn.Items.Add(cboSLXTable.Items(i))
        'Next
        'dgTarget.Columns.Add(tmpcolumn)
        TempTable.Columns.Add("CreateID4Table", System.Type.GetType("System.String"))



        Dim myrow As DataRow
        'Dim j As Integer = 0
        Dim FieldList() As String
        Dim SQL As String
        'If m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuery Then
        '    SQL = m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuerySQL
        'Else
        '    SQL = "Select * From " & m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName & " Where 1=2"
        'End If
        SQL = "Select * From " & m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName & " Where 1=2"
        FieldList = LoadFieldList(m_Project.m_MapArray(m_CurrentMapIndex).m_SLXNativeConnection, m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName, SQL)
        If FieldList Is Nothing Then
            Exit Sub

        End If
        Try
            Dim i As Integer = 0
            For i = 0 To FieldList.Length - 1
                '===================================================
                myrow = TempTable.NewRow
                '===============================================================
                'Add the Rows to the Data Set... First the Source, then the SLX
                '===============================================================
                myrow.Item(0) = False 'Mapped Column
                myrow.Item(1) = FieldList(i) ' Column
                myrow.Item(2) = False 'CreateID Column
                myrow.Item(3) = True 'Add2View Column ' Default True
                myrow.Item(4) = "" ' CreateID4Column

                TempTable.Rows.Add(myrow)
            Next
        Catch ex As Exception

        End Try
    End Sub

    Private Function LongestField(ByVal DataGrid1 As DataGrid, ByVal ds As DataSet, ByVal TableName As String, ByVal ColumnName As String) As Integer

        Dim maxlength As Integer = 0
        Dim g As Graphics = DataGrid1.CreateGraphics()

        ' Take width of one blank space and add to the new width of the Column.
        Dim offset As Integer = Convert.ToInt32(Math.Ceiling(g.MeasureString(" ", DataGrid1.Font).Width))

        Dim i As Integer = 0
        Dim intaux As Integer
        Dim straux As String
        Dim tot As Integer
        tot = ds.Tables.Item(0).Rows.Count()

        For i = 0 To (tot - 1)
            straux = ds.Tables.Item(0).Rows(i)(ColumnName).ToString()
            ' Get the width of Current Field String according to the Font.
            intaux = Convert.ToInt32(Math.Ceiling(g.MeasureString(straux, DataGrid1.Font).Width))
            If (intaux > maxlength) Then
                maxlength = intaux
            End If
        Next

        Return maxlength + offset

    End Function

    Public Function LoadFieldList(ByVal StrConnection As String, ByVal TableName As String, ByVal SQL As String) As String()

        '=====================================================================================
        ' Get the Schema for Tables in the Database from a DataReader
        '=====================================================================================
        Dim ReturnString() As String
        'SQL = "Select * From " & CStr(TableName)
        Dim cn As New OleDbConnection(StrConnection)
        Dim i As Integer = 0
        Try
            cn.Open()
            Dim objCMD As OleDb.OleDbCommand = New OleDbCommand(SQL, cn)
            Dim objReader As OleDbDataReader = objCMD.ExecuteReader()
            Dim SchemaTable As DataTable = objReader.GetSchemaTable
            Dim myCol As DataColumn
            Dim myRow As DataRow

            For Each myRow In SchemaTable.Rows
                'For Each myCol In SchemaTable.Columns
                'Console.WriteLine(myCol.ColumnName & " = " & myRow(myCol).ToString())
                'ListBox.Items.Add(myRow.ItemArray(0))
                'Next
                ReDim Preserve ReturnString(i)
                ReturnString(i) = myRow.ItemArray(0)
                i += 1
            Next
            objReader.Close()
        Catch ex As Exception
            'MsgBox(ex.Message)
        Finally
            If cn.State = ConnectionState.Open Then cn.Close()
        End Try

        Return ReturnString

        ''====================================================================================
    End Function

    Public Sub LoadTableComboBox(ByRef ComboBox, ByVal StrConnection)
        'Initialize the ComboBox
        ComboBox.items.clear()
        '=====================================================================================
        ' Get the Schema for Tables in the Database
        '=====================================================================================
        Dim schemaTable_Column As DataTable
        Dim cn As New OleDbConnection
        Dim schemaTable As DataTable
        Dim i As Integer
        Dim j As Integer
        'Be sure to use an account that has permission to list tables.
        cn.ConnectionString = StrConnection

        Try
            cn.Open()
            'Retrieve schema information about tables.
            'Because tables include tables, views, and other objects,
            'restrict to just TABLE in the Object array of restrictions.
            schemaTable = cn.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, _
                          New Object() {Nothing, Nothing, Nothing, "TABLE"})
            'List the table name from each row in the schema table.
            Dim TableArray() As String
            Dim strColumnName As String
            Dim strTableName As String
            ReDim Preserve TableArray(schemaTable.Rows.Count) 'Initialize the Size
            For i = 0 To schemaTable.Rows.Count - 1
                'Console.WriteLine(schemaTable.Rows(i)!TABLE_NAME.ToString)
                '===========================================================
                ' This Adds the Table Names
                '===========================================================
                'TableArray(i) = schemaTable.Rows(i)!TABLE_NAME.ToString
                ComboBox.Items.Add(schemaTable.Rows(i)!TABLE_NAME.ToString)
            Next i
            cn.Close()
        Catch ex As Exception
            MsgBox(ex.Message)
        Finally
            If cn.State = ConnectionState.Open Then
                cn.Close()
            End If
        End Try
        '====================================================================================
    End Sub

    Public Sub LoadFieldComboBox(ByRef ComboBox As ComboBox, ByVal StrSLXConnection As String, ByVal SQL As String)

        'Initialize the ListBox
        ComboBox.Text = ""
        ComboBox.Items.Clear()
        '=====================================================================================
        ' Get the Schema for Tables in the Database from a DataReader
        '=====================================================================================
        'Dim SQL As String
        'SQL = "Select * From " & CStr(TableName)
        Dim cn As New OleDbConnection(StrSLXConnection)
        Try
            cn.Open()
            Dim objCMD As OleDb.OleDbCommand = New OleDbCommand(SQL, cn)
            Dim objReader As OleDbDataReader = objCMD.ExecuteReader()
            Dim SchemaTable As DataTable = objReader.GetSchemaTable
            Dim myCol As DataColumn
            Dim myRow As DataRow

            For Each myRow In SchemaTable.Rows
                'For Each myCol In SchemaTable.Columns
                'Console.WriteLine(myCol.ColumnName & " = " & myRow(myCol).ToString())
                ComboBox.Items.Add(myRow.ItemArray(0))
                'Next
            Next
            ComboBox.Text = ComboBox.Items(0).ToString


            objReader.Close()
        Catch ex As Exception
            MsgBox(ex.Message)
        Finally
            If cn.State = ConnectionState.Open Then cn.Close()
        End Try


        ''====================================================================================
    End Sub
#End Region



#Region " Form Plumbing"

    Private Sub cmdToolSave_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdToolSave.Click
        Dim objSerializer As New ProjectXMLSerializer
        objSerializer.WriteXML(m_Project)
    End Sub


    Private Sub EditToolStripMenuItem_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles EditToolStripMenuItem.Click
        Dim MapName As String = ""
        MapName = InputBox("Enter Map Name:", "Please Enter Map Name", "NewMap1")
        Dim Map As New clsMap
        If MapName <> "" Then
            Dim currentindex As Integer
            currentindex = lstMaps.SelectedIndices(0)
            lstMaps.Items(currentindex).Text = MapName
            m_Project.m_MapArray(currentindex).m_MapName = MapName
            '=== Set the Status 
            lblStatus.Text = "Editing " & m_Project.m_MapArray(currentindex).m_MapName & "  Map"
            lstMaps.Items(currentindex).BackColor = m_SelectedColor
            m_CurrentMapIndex = currentindex
        End If
    End Sub


    Private Sub cmdSearchSourceNativeConnection_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdSearchSourceNativeConnection.Click
        txtSourceNative.Text = GetConnectionString(txtSourceNative.Text)
        '==============================================================================
        ' Instead of Using UDL Files this App Uses the DataLink Class
        '==============================================================================
        'Dim Instance As DataLinksClass = New DataLinksClass
        'Dim connection As ConnectionClass = New ConnectionClass
        'If txtSourceNative.Text <> "" Then
        '    connection.ConnectionString = txtSourceNative.Text
        'End If
        'If (Instance.PromptEdit(connection)) Then
        '    txtSourceNative.Text = connection.ConnectionString
        'End If
    End Sub

    Private Sub cmdSearchSLXNativeConnection_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdSearchSLXNativeConnection.Click
        txtSLXNative.Text = GetConnectionString(txtSLXNative.Text)
        ''==============================================================================
        '' Instead of Using UDL Files this App Uses the DataLink Class
        ''==============================================================================
        'Dim Instance As DataLinksClass = New DataLinksClass
        'Dim connection As ConnectionClass = New ConnectionClass
        'If txtSLXNative.Text <> "" Then
        '    connection.ConnectionString = txtSLXNative.Text
        'End If
        'If (Instance.PromptEdit(connection)) Then
        '    txtSLXNative.Text = connection.ConnectionString
        'End If
    End Sub

    Private Sub cmdSearchSLXProviderConnection_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdSearchSLXProviderConnection.Click
        txtSLXProvider.Text = GetSLXConnectionString(txtSLXProvider.Text) ' Get the SLX Connection String
        '==============================================================================
        ' Instead of Using UDL Files this App Uses the DataLink Class
        '==============================================================================
        'Dim Instance As DataLinksClass = New DataLinksClass
        'Dim connection As ConnectionClass = New ConnectionClass
        'If txtSLXProvider.Text <> "" Then
        '    connection.ConnectionString = txtSLXProvider.Text
        'End If
        'If (Instance.PromptEdit(connection)) Then
        '    txtSLXProvider.Text = connection.ConnectionString
        'End If
    End Sub

    Private Sub AboutToolStripMenuItem_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles AboutToolStripMenuItem.Click
        Dim frmAbout As New AboutBox1
        frmAbout.ShowDialog()

    End Sub

    Private Sub MainConnectionToolStripMenuItem_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MainConnectionToolStripMenuItem.Click
        Dim frmMainConn As New frmMainConnections
        frmMainConn.txtSourceConnection.Text = m_Project.m_SourceConnection
        frmMainConn.txtSLXProviderConnection.Text = m_Project.m_SLXProviderConnection
        frmMainConn.txtSLXNativeConnection.Text = m_Project.m_SLXNativeConnection
        If frmMainConn.ShowDialog = Windows.Forms.DialogResult.OK Then
            '===================================
            'Set the Main Connection String 
            '===================================
            m_Project.m_SourceConnection = frmMainConn.txtSourceConnection.Text
            m_Project.m_SLXProviderConnection = frmMainConn.txtSLXProviderConnection.Text
            m_Project.m_SLXNativeConnection = frmMainConn.txtSLXNativeConnection.Text
        End If
    End Sub

    Private Sub OpenProjectToolStripMenuItem_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles OpenProjectToolStripMenuItem.Click
        OpenFileDialog1.FileName = ""
        OpenFileDialog1.ShowDialog()
        Dim objSerializer As New ProjectXMLSerializer
        If OpenFileDialog1.FileName <> "" Then
            If objSerializer.LoadXML(m_Project, OpenFileDialog1.FileName) Then
                '=========================
                'Intialize the Maps
                '=========================
                Dim i As Integer
                lstMaps.Items.Clear()
                For i = 0 To m_Project.m_MapArray.Length - 1
                    lstMaps.Items.Add(m_Project.m_MapArray(i).m_MapName, 0)
                    m_CurrentMapIndex = i
                    lblStatus.Text = "Editing " & m_Project.m_MapArray(m_CurrentMapIndex).m_MapName & "  Map"
                Next
                lstMaps.Items(i - 1).BackColor = m_SelectedColor

            Else
                ' Failed to Open Properly
                MsgBox(" The File was not a Vaild Project or it has become corrupted", MsgBoxStyle.Critical, "Cannot Open Project")
            End If

        End If


    End Sub

    Private Sub SaveProjectToolStripMenuItem_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles SaveProjectToolStripMenuItem.Click
        Dim objSerializer As New ProjectXMLSerializer
        objSerializer.WriteXML(m_Project)
    End Sub

    Private Sub SaveProjectAsToolStripMenuItem_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles SaveProjectAsToolStripMenuItem.Click
        SaveFileDialog1.FileName = m_Project.m_FilePath
        If SaveFileDialog1.ShowDialog() = Windows.Forms.DialogResult.OK Then
            m_Project.m_FilePath = SaveFileDialog1.FileName
            Dim objSerializer As New ProjectXMLSerializer
            objSerializer.WriteXML(m_Project)
        End If


    End Sub

    Private Sub NewProjectToolStripMenuItem_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles NewProjectToolStripMenuItem.Click
        Dim ProjectName As String = ""
        ProjectName = InputBox("Enter Project Name:", "Please Enter Project Name", "NewBulkLoadProject1")
        m_Project = New clsProject
        m_Project.ProjectName = ProjectName
        m_Project.m_FilePath = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments) & "\" & ProjectName & ".ASIP"
        Me.Text = ProjectName

    End Sub

    Private Sub frmMain_FormClosing(ByVal sender As Object, ByVal e As System.Windows.Forms.FormClosingEventArgs) Handles Me.FormClosing
        ' Save and Persist your  Settings.
        '===============================================
        ' Create the Object that will Hold our Settings
        '===============================================
        Try
            If IsNothing(m_objMainConnectionSettings) Then
                m_objMainConnectionSettings = New clsMainConnectionSettings
            End If
            With m_objMainConnectionSettings 'Global Form Variable
                .SourceNativeConnection = m_Project.m_SourceConnection
                .SLXNativeConnection = m_Project.m_SLXNativeConnection
                .SLXProviderConnection = m_Project.m_SLXProviderConnection
            End With


            Dim objSerializer As New MainConnectioXMLSerializer
            objSerializer.WriteXML(m_objMainConnectionSettings)
        Catch ex As Exception
            MsgBox(ex.Message & ex.StackTrace)
        End Try

    End Sub

    Private Sub frmMain_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        ReLoadMapList()
        'Dim i As Integer
        'For i = 0 To m_Project.m_MapArray.Count - 1
        ' lstMaps.Items.Add(m_Project.m_MapArray(i).m_MapName, 0)
        ' Next
        '=========================================================
        ' Get the Stored Main Connection String Information
        '=========================================================
        Dim objSerializer As New MainConnectioXMLSerializer
        objSerializer.LoadXML(m_objMainConnectionSettings) 'Load Settings into Global Variable
        Try
            With m_objMainConnectionSettings
                m_Project.m_SourceConnection = .SourceNativeConnection
                m_Project.m_SLXNativeConnection = .SLXNativeConnection
                m_Project.m_SLXProviderConnection = .SLXProviderConnection
            End With
        Catch ex As Exception

        End Try

    End Sub

    Private Sub AddMapToolStripMenuItem_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles AddMapToolStripMenuItem.Click
        Dim MapName As String = ""
        MapName = InputBox("Enter Map Name:", "Please Enter Map Name", "NewMap1")
        Dim Map As New clsMap
        If MapName <> "" Then
            Map.m_MapName = MapName
            Map.m_SourceConnection = m_Project.m_SourceConnection
            Map.m_SLXNativeConnection = m_Project.m_SLXNativeConnection
            Map.m_SLXProviderConnection = m_Project.m_SLXProviderConnection
            Dim iLength As Integer = 0
            Try
                m_Project.AddMap(Map)
                iLength = m_Project.m_MapArray.Length - 1
                'ReDim Preserve m_Project.m_MapArray(iLength)
                'm_Project.m_MapArray(iLength) = Map
                'lstMaps.Items.Add(m_Project.m_MapArray(iLength).m_MapName, 0)
                ReLoadMapList()
                lstMaps.FindItemWithText(MapName) ' Set the Active Control
                m_CurrentMapIndex = iLength
                '= Set the Status Lable
                lblStatus.Text = "Editing " & m_Project.m_MapArray(m_CurrentMapIndex).m_MapName & "  Map"
            Catch
                '=================================
                'Means there was no Maps assigned
                '=================================
                'ReDim Preserve m_Project.m_MapArray(iLength)
                'm_Project.m_MapArray(iLength) = Map
                'lstMaps.Items.Add(m_Project.m_MapArray(iLength).m_MapName, 0)
            End Try
        Else
            MsgBox("Must Enter a Map name")
        End If
        'm_Project = New clsProject
        'm_Project.ProjectName = ProjectName
        'm_Project.m_FilePath = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments) & "\" & ProjectName & ".ASIP"
        'Me.Text = ProjectName
    End Sub

    Private Sub lstMaps_SelectedIndexChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles lstMaps.SelectedIndexChanged
        '======================================
        ' Initialize the Datagrids
        '======================================
        dgSource.DataSource = Nothing
        dgSource.Refresh()
        Try
            Dim i As Integer
            '==================
            'Clears the Color out
            '====================
            For i = 0 To lstMaps.Items.Count - 1
                lstMaps.Items.Item(i).BackColor = Color.FromKnownColor(KnownColor.ButtonFace)
            Next
        Catch ex As Exception

        End Try
        Try
            Dim CurrentIndex As Integer = 0
            CurrentIndex = lstMaps.SelectedIndices(0)
            lstMaps.Items(CurrentIndex).BackColor = m_SelectedColor
            lblStatus.Text = "Editing " & m_Project.m_MapArray(CurrentIndex).m_MapName & "  Map"
            m_CurrentMapIndex = CurrentIndex

            '==============================================
            ' Intilize the Map Controls
            '==============================================
            IntializeMapControls()
        Catch ex As Exception

        End Try




    End Sub

    Private Sub cboSourceTable_SelectedIndexChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cboSourceTable.SelectedIndexChanged
        m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName = cboSourceTable.Text
        LoadSourceDatset(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset, _
                                m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection, _
                                m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName)
        '=========================================================================
        ' Set Map SourceTarget_TableName
        '=========================================================================
        Dim strSourceTableName As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName
        Dim strSLXTableName As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName
        Dim strSourceTargetTableName As String = strSourceTableName & "." & strSLXTableName
        If strSourceTableName = "" Or strSLXTableName = "" Then
            'Skip it as One as we cannot create a Valid Link

        Else
            '============================================
            ' Attempt to Create a Source_Target Datamap
            '============================================
            m_Project.m_MapArray(m_CurrentMapIndex).m_Source_Target_TableName = strSourceTargetTableName
            LoadSourceTargetMappingDataset(m_Project.m_MapArray(m_CurrentMapIndex).m_Source_TargetMappingDataset, _
                                            strSourceTargetTableName)

        End If



    End Sub

    Private Sub cmdQuery_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdQuery.Click
        Dim frm As New frmSourceQuery
        frm.m_strConnectionString = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection
        frm.m_strQUERY = m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuerySQL
        If frm.ShowDialog = Windows.Forms.DialogResult.OK Then
            m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuerySQL = frm.m_strQUERY
        End If

    End Sub

    Private Sub cboSourcePK_SelectedIndexChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cboSourcePK.SelectedIndexChanged

        m_Project.m_MapArray(m_CurrentMapIndex).m_SourcePK = cboSourcePK.Text

    End Sub


    Private Sub chkUseQuery_CheckedChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles chkUseQuery.CheckedChanged
        If chkUseQuery.Checked = True Then
            cboSourceTable.Enabled = False 'Disable the Combobox


            If m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuerySQL = "" Then
                MsgBox("Please Enter Source Query...", MsgBoxStyle.Information)
                chkUseQuery.Checked = False
            Else
                '=========================================
                ' Set the PK Combobox and Source Data Grid
                '=========================================
                Dim strConn As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection
                Dim strSQL As String = m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuerySQL
                LoadFieldComboBox(cboSourcePK, strConn, strSQL)
                Try
                    cboSourcePK.Text = cboSourcePK.Items(0).ToString
                    m_Project.m_MapArray(m_CurrentMapIndex).m_SourcePK = cboSourcePK.Text
                Catch ex As Exception

                End Try
                '=================================================
                ' Load the Datagrid with the Fields we need
                '==================================================
                m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName = "UseSourceSQLQuery"
                m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuery = chkUseQuery.Checked
                LoadSourceDatset(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset, _
                                 m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection, _
                                 "UseSourceSQLQuery")

            End If
        Else
            cboSourceTable.Enabled = True
        End If
        m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuery = chkUseQuery.Checked

    End Sub

    Private Sub cmdSourceRefresh_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdSourceRefresh.Click
        m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName = cboSourceTable.Text
        LoadSourceDatset(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset, _
                         m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection, _
                         m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName)

        '====================================
        'Load the PK Fields comboBox
        '====================================
        Dim SQL As String
        SQL = "SELECT * FROM " & cboSourceTable.Text & " WHERE 1=2 "
        Dim strConn As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection
        LoadFieldComboBox(cboSourcePK, strConn, SQL)
        Try
            cboSourcePK.Text = cboSourcePK.Items(0).ToString
            m_Project.m_MapArray(m_CurrentMapIndex).m_SourcePK = cboSourcePK.Text
        Catch ex As Exception

        End Try
    End Sub


    Private Sub dgSource_DragLeave(ByVal sender As Object, ByVal e As System.EventArgs)
        MsgBox("I'm draged over")
    End Sub

    Private Sub cboSLXTable_SelectedIndexChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cboSLXTable.SelectedIndexChanged
        m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName = cboSLXTable.Text
        LoadTargetDataset(m_Project.m_MapArray(m_CurrentMapIndex).m_SLXDestinationDataSet, _
                                m_Project.m_MapArray(m_CurrentMapIndex).m_SLXNativeConnection, _
                                m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName)
        '=========================================================================
        ' Set Map SourceTarget_TableName
        '=========================================================================
        Dim strSourceTableName As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName
        Dim strSLXTableName As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName
        Dim strSourceTargetTableName As String = strSourceTableName & "." & strSLXTableName
        If strSourceTableName = "" Or strSLXTableName = "" Then
            'Skip it as One as we cannot create a Valid Link

        Else
            '============================================
            ' Attempt to Create a Source_Target Datamap
            '============================================
            m_Project.m_MapArray(m_CurrentMapIndex).m_Source_Target_TableName = strSourceTargetTableName
            LoadSourceTargetMappingDataset(m_Project.m_MapArray(m_CurrentMapIndex).m_Source_TargetMappingDataset, _
                                            strSourceTargetTableName)
        End If
    End Sub

    Private Sub dgTarget_Click(ByVal sender As Object, ByVal e As System.EventArgs)
        'If (dgTarget.CurrentCell.ColumnNumber = 2 Or _
        '        dgTarget.CurrentCell.ColumnNumber = 3) Then
        '    Try
        '        If CType(dgTarget.Item(dgTarget.CurrentRowIndex, dgTarget.CurrentCell.ColumnNumber), Boolean) Then
        '            '====================================================
        '            'Evaluated to True Meaning it is Checked  so Uncheck
        '            '====================================================
        '            dgTarget.Item(dgTarget.CurrentRowIndex, dgTarget.CurrentCell.ColumnNumber) = False
        '            dgTarget.Refresh()
        '        Else
        '            dgTarget.Item(dgTarget.CurrentRowIndex, dgTarget.CurrentCell.ColumnNumber) = True
        '            dgTarget.Refresh()

        '        End If
        '    Catch ex As Exception

        '    End Try

        'End If
    End Sub


    Private Sub cmdMap_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdMap.Click
        '=========================================================================
        ' Set Map SourceTarget_TableName
        '=========================================================================
        Dim strSourceTableName As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName
        Dim strSLXTableName As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName
        Dim strSourceTargetTableName As String = m_Project.m_MapArray(m_CurrentMapIndex).m_Source_Target_TableName
        If strSourceTableName = "" Or strSLXTableName = "" Then
            'Skip it as One as we cannot create a Valid Link
            MsgBox("Cannot Create Link")

        Else
            '============================================
            ' Attempt to Create a Source_Target Datamap
            '============================================
            Dim strSourceValue As String
            Dim strTargetValue As String

            '===================================
            ' Get Source Target Value
            '===================================
            strSourceValue = dgSource.CurrentRow.Cells(1).Value
            strTargetValue = dgTarget.CurrentRow.Cells(1).Value

            If strSourceValue = "" Or strTargetValue = "" Then
                Exit Sub
            End If
            '================================================
            AddSourceTargetRow(m_Project.m_MapArray(m_CurrentMapIndex).m_Source_TargetMappingDataset, _
                                strSourceTargetTableName, _
                                strSourceValue, _
                                strTargetValue)


        End If


    End Sub


    Private Sub dgSource_DragDrop(ByVal sender As System.Object, ByVal e As System.Windows.Forms.DragEventArgs)
        MsgBox("drag Dop")
    End Sub

    Private Sub DeleteToolStripMenuItem_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles DeleteToolStripMenuItem.Click
        Try
            Dim CurrentIndex As Integer = 0
            CurrentIndex = lstMaps.SelectedIndices(0)
            m_Project.DeleteMap(CurrentIndex)
            ReLoadMapList()
            IntializeMapControls()
        Catch ex As Exception

        End Try

    End Sub


    Private Sub cmdRemove_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdRemove.Click
        Try


            '===================================
            ' Get Source Target Value
            '===================================
            Dim strSourceTargetTableName As String = m_Project.m_MapArray(m_CurrentMapIndex).m_Source_Target_TableName
            Dim strSourceValue As String
            Dim strTargetValue As String
            strSourceValue = dgSourceTargetMapping.CurrentRow.Cells(0).Value ' Source
            strTargetValue = dgSourceTargetMapping.CurrentRow.Cells(1).Value ' SLX

            If strSourceValue = "" Or strTargetValue = "" Then
                Exit Sub
            End If
            '================================================
            RemoveSourceTargetRow(m_Project.m_MapArray(m_CurrentMapIndex).m_Source_TargetMappingDataset, _
                                strSourceTargetTableName, _
                                strSourceValue, _
                                strTargetValue)
        Catch ex As Exception
            MsgBox(ex.Message & ex.StackTrace)
        End Try

    End Sub


    Private Sub cmdGenerateTempTable_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdGenerateTempTable.Click
       
        BackgroundWorker1.RunWorkerAsync()
       
    End Sub

    Private Sub dgTarget_CurrentCellChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles dgTarget.CurrentCellChanged
        Try
            If dgTarget.CurrentCell.ColumnIndex = 2 Then
                If dgTarget.CurrentCell.Value = False Then
                    ' It is False Meaning the User Just Click here
                    Dim TableName As String = ""
                    Dim iLength As Integer
                    TableName = dgTarget.CurrentRow.Cells(1).Value
                    TableName = Mid(TableName, 1, TableName.Length - 2) 'Parse out the ID
                    TableName = InputBox("Enter Map Name:", "Please Enter BaseTable Name to CreateID For", TableName)
                    If TableName <> "" Then
                        ' Add the TableName to the Target Database
                        Dim DSTableName As String
                        Dim tmpTable As DataTable
                        DSTableName = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName
                        tmpTable = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXDestinationDataSet.Tables(DSTableName)
                        Dim myRow As DataRow
                        For Each myRow In tmpTable.Rows
                            If myRow.Item(1) = dgTarget.CurrentRow.Cells(1).Value Then ' Ensure the We Find the Correct Row
                                myRow.Item(2) = True ' Set the CreateID checkbox
                                myRow.Item(4) = TableName ' Set the CreateIDForTable Value
                                dgTarget.DataSource = tmpTable
                                dgTarget.Refresh()
                                Exit For
                            End If
                        Next

                    End If
                End If
            End If
        Catch ex As Exception

        End Try
    End Sub

    Private Sub BackgroundWorker1_DoWork(ByVal sender As System.Object, ByVal e As System.ComponentModel.DoWorkEventArgs) Handles BackgroundWorker1.DoWork
        ' Get the BackgroundWorker object that raised this event.
        Dim worker As BackgroundWorker = _
            CType(sender, BackgroundWorker)

        ' Assign the result of the computation
        ' to the Result property of the DoWorkEventArgs
        ' object. This is will be available to the 
        ' RunWorkerCompleted eventhandler.
        '====================================================================================================
        m_Project.m_MapArray(m_CurrentMapIndex).m_TempTableName = txtTempTableName.Text

        Dim objSLXTempTable As New SLXTempTable
        Dim strSourceQuery As String
        Dim myRow As DataRow
        Dim tmpTable As DataTable
        Dim TableName As String
        '=========================================================
        ' Generate SourceSQL Query
        '=========================================================
        If m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuery Then
            strSourceQuery = m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuerySQL
            '====================
            ' Use Query Checked
            '====================
        Else
            '=====================================
            ' Loop Through and Create the Query
            '=====================================
            TableName = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName
            tmpTable = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset.Tables(TableName)
            strSourceQuery = "SELECT "
            For Each myRow In tmpTable.Rows
                If myRow.Item(2) = True Then ' tmp Column Checkbox Meaning Create in a TempTable
                    strSourceQuery = strSourceQuery & " " & myRow.Item(1) & ","
                End If
            Next
            'cLEAN UP THE LAST cOLUMN
            strSourceQuery = Mid(strSourceQuery, 1, strSourceQuery.Length - 1)
            '===========================
            ' Add the From Query
            '===========================
            strSourceQuery = strSourceQuery & " FROM " & m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName

        End If
        objSLXTempTable.SourceSQLQuery = strSourceQuery
        '===========================================================================================================
        ' Get the SLXID Columns to Create
        '===========================================================================================================
        Dim tmpSLXIDArrayList As New ArrayList(0)
        TableName = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName
        tmpTable = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXDestinationDataSet.Tables(TableName)

        Dim i As Integer
        For Each myRow In tmpTable.Rows
            If myRow.Item(2) = True Then
                '=============================
                ' Checked to CreateID For
                '=============================
                Dim tmpSLX_FieldName_IDFieldTable As New SLX_FieldName_IDFieldTable
                tmpSLX_FieldName_IDFieldTable.FieldName = myRow.Item(1) ' ColumnName
                tmpSLX_FieldName_IDFieldTable.TableNameIDsCreated4 = myRow.Item(4) ' Nameof SLXTable to CreateID For
                tmpSLXIDArrayList.Add(tmpSLX_FieldName_IDFieldTable) ' Add Item to The Array List
                'Intialize 
                tmpSLX_FieldName_IDFieldTable = Nothing

            End If
        Next
        Dim SLXFieldArray() As SLX_FieldName_IDFieldTable
        If tmpSLXIDArrayList.Count > 0 Then
            ReDim Preserve SLXFieldArray(tmpSLXIDArrayList.Count - 1) ' Size the Array correctly
            For i = 0 To tmpSLXIDArrayList.Count - 1
                SLXFieldArray(i) = tmpSLXIDArrayList(i) 'Add Ojbect to the Array from the ArrayList
                ' Must Use Arrays because arraylists cannot be persisted through XML Serialization.
            Next

        End If
        objSLXTempTable.SLXTables = SLXFieldArray
        objSLXTempTable.TableName = m_Project.m_MapArray(m_CurrentMapIndex).m_TempTableName ' Set TempTableName
        '==================================================================================================================
        ' FINALLY GENERATE THE TEMPTABLE
        '==================================================================================================================
        e.Result = GenerateTempTable(objSLXTempTable, _
                                     m_Project.m_MapArray(m_CurrentMapIndex), _
                                     worker, e)
                     
    End Sub

    Private Sub BackgroundWorker1_ProgressChanged(ByVal sender As Object, ByVal e As System.ComponentModel.ProgressChangedEventArgs) Handles BackgroundWorker1.ProgressChanged
        Me.pgbarTempTable.Value = e.ProgressPercentage
    End Sub
    Private Sub BackgroundWorker1_RunWorkerCompleted(ByVal sender As Object, ByVal e As System.ComponentModel.RunWorkerCompletedEventArgs) Handles BackgroundWorker1.RunWorkerCompleted
        ' First, handle the case where an exception was thrown.
        If (e.Error IsNot Nothing) Then
            MessageBox.Show(e.Error.Message)
        ElseIf e.Cancelled Then
            ' Next, handle the case where the user canceled the 
            ' operation.
            ' Note that due to a race condition in 
            ' the DoWork event handler, the Cancelled
            ' flag may not have been set, even though
            ' CancelAsync was called.
            'resultLabel.Text = "Canceled"
        Else
            ' Finally, handle the case where the operation succeeded.

            'Me.cmdGo.Enabled = True
            MsgBox("Temp Table Created")

        End If
    End Sub

    
    Private Sub cmdGenerateView_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdGenerateView.Click
        '=========================================================
        ' Drop View if it Allready Exists
        '========================================================
        Dim objCon As New OleDbConnection(m_Project.m_MapArray(m_CurrentMapIndex).m_SLXNativeConnection)
        Try
            objCon.Open()
            '=========================================================
            ' Set the SQL 
            '=========================================================
            Dim SQL As String
            If rdoUseIntialView.Checked Then
                SQL = m_Project.m_MapArray(m_CurrentMapIndex).m_ViewInitialScript
            Else
                ' Use Edited CreateView Script
                SQL = m_Project.m_MapArray(m_CurrentMapIndex).m_ViewEditedScript
            End If

            Dim objCMD As New OleDbCommand(SQL, objCon)
            MsgBox(objCMD.ExecuteNonQuery())
        Catch ex As Exception
            MsgBox(ex.Message & ex.StackTrace)
        Finally
            If objCon.State = ConnectionState.Open Then
                objCon.Close()
            End If
        End Try
    End Sub

    Private Sub cmdCreateIntialViewSQL_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdCreateIntialViewSQL.Click
        Try

       
            m_Project.m_MapArray(m_CurrentMapIndex).m_ViewName = txtViewName.Text ' Set the Project View Name
            Dim SQL As String = ""
            SQL = "CREATE VIEW sysdba." & m_Project.m_MapArray(m_CurrentMapIndex).m_ViewName & vbCrLf
            SQL = SQL & "AS SELECT" & vbCrLf
            '============================================================
            'Loop Through All Columns for SLX Table
            '============================================================
            Dim myRow As DataRow
            Dim tmpTableSLXTarget As DataTable
            Dim tmpTableSource As DataTable
            Dim tmpTableMapping As DataTable
            Dim strTableSourceName As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName
            Dim strTableSLXTargetName As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName
            Dim strTableMappingName As String = m_Project.m_MapArray(m_CurrentMapIndex).m_Source_Target_TableName
            '==================================
            ' Get the DataTables
            '==================================
            tmpTableSLXTarget = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXDestinationDataSet.Tables(strTableSLXTargetName)
            tmpTableSource = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset.Tables(strTableSourceName)
            tmpTableMapping = m_Project.m_MapArray(m_CurrentMapIndex).m_Source_TargetMappingDataset.Tables(strTableMappingName)

            For Each myRow In tmpTableSLXTarget.Rows
                '============================================================
                ' IS Add2View Checked
                '============================================================
                If myRow.Item("Add2View") Then

                    '============================================================
                    ' IS SLX MAPPED Checked
                    '============================================================
                    If myRow.Item("Mapped") Then
                        '============================================================
                        '  MAPPED
                        '============================================================
                        ' Get Mapped Values
                        '============================================================
                        Dim strSourceVal As String = ""
                        Dim strSLXVal As String = ""
                        strSLXVal = myRow.Item("Column")
                        Dim tmpRow As DataRow
                        For Each tmpRow In tmpTableMapping.Rows
                            If tmpRow.Item("SLX") = strSLXVal Then ' Find the SLX value in the Mapping Dataset
                                strSourceVal = tmpRow.Item("Source") ' Set the Source value
                                Exit For ' exit the Loop  Item found
                            End If
                        Next
                        '==================================================
                        ' Source Record in zzTempTable
                        '==================================================
                        If Is_inZZ_TempTable(tmpTableSource, strSourceVal) Then
                            '=============================================
                            ' Add Row from Z1 Table (Created TempTable)
                            '=============================================
                            SQL = SQL & " Z1." & strSourceVal & " AS " & myRow.Item("Column") & ","
                        Else
                            '=============================================
                            ' Add Row from Source Table 
                            '=============================================
                            SQL = SQL & " tmpSource." & strSourceVal & " AS " & myRow.Item("Column") & ","

                        End If
                    Else
                        '============================================================
                        ' NOT MAPPED
                        '============================================================
                        ' CreateID Checked
                        '============================================================
                        If myRow.Item("CreateID") Then
                            '=========================================================
                            ' Use TempTable Z1 ID Field
                            '=========================================================
                            SQL = SQL & " Z1." & myRow.Item("Column") & " AS " & myRow.Item("Column") & ","
                        Else
                            '=========================================================
                            ' Use Default Value 1
                            '=========================================================
                            SQL = SQL & " 1 AS " & myRow.Item("Column") & ","
                        End If
                    End If
                End If
            Next

            '===============================================================================================
            ' Clean the Last Comma from the SQL Statement
            '===============================================================================================
            SQL = Mid(SQL, 1, SQL.Length - 1)

            '===============================================================================================
            ' Build the From Clause
            '===============================================================================================
            SQL = SQL & " FROM sysdba." & m_Project.m_MapArray(m_CurrentMapIndex).m_TempTableName & " Z1 INNER JOIN " & vbCrLf
            SQL = SQL & GenerateSourceOpenRowsetQuery() & vbCrLf
            Dim strPK As String = m_Project.m_MapArray(m_CurrentMapIndex).m_SourcePK
            SQL = SQL & " ON Z1." & strPK & " = tmpSource." & strPK



            m_Project.m_MapArray(m_CurrentMapIndex).m_ViewInitialScript = SQL
            txtIntialViewScript.Text = SQL

        Catch ex As Exception
            MsgBox(ex.Message & ex.StackTrace)
        End Try

    End Sub
    Public Function GenerateSourceOpenRowsetQuery() As String
        Dim ReturnSQL As String = ""
        Dim SourceDatabase As New ASI_ConnectionInfo(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection)
        If m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuery Then
            '===============================================================================
            ' Will Likely have to be Hand Tweaked to Work if you use the Predefined Query
            '   as the Source Query was not orginally designed to work with OpenRowset
            '===============================================================================
            ReturnSQL = "OPENROWSET('SQLOLEDB','" & SourceDatabase.DataSource & _
                                          "';'" & SourceDatabase.User & "';'" & SourceDatabase.Password & "'," & _
                                      "'" & m_Project.m_MapArray(m_CurrentMapIndex).m_UseQuerySQL & "') AS tmpSource "


        Else
            ReturnSQL = "OPENROWSET('SQLOLEDB','" & SourceDatabase.DataSource & _
                                           "';'" & SourceDatabase.User & "';'" & SourceDatabase.Password & "'," & _
                                       "'SELECT  "
            '========================
            ' Add the Source rows
            '========================
            'Dim tmpTable As DataTable
            'Dim tmpRow As DataRow
            'tmpTable = m_Project.m_MapArray(m_CurrentMapIndex).m_SourceDataset.Tables(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName)
            'For Each tmpRow In tmpTable.Rows
            '    ReturnSQL = ReturnSQL & tmpRow.Item("Column") & ","
            'Next
            '' Clean Last Comma
            'ReturnSQL = Mid(ReturnSQL, 1, ReturnSQL.Length - 1)
            '==============================================================
            ' Finnish the From Clause
            '===============================================================
            ReturnSQL = ReturnSQL & " * FROM " & SourceDatabase.Database & "." & Trim(GetSourceTableSchema_Owner) & "." & _
                                       m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName & "') AS tmpSource "


        End If
        Return ReturnSQL
    End Function
    Public Function GetSourceTableSchema_Owner() As String
        Dim SQL As String
        Dim strOwner As String = ""
        SQL = "SELECT Table_schema FROM	INFORMATION_SCHEMA.COLUMNS WHERE	TABLE_NAME = '" & m_Project.m_MapArray(m_CurrentMapIndex).m_SourceTableName & "'"
        Dim objCon As New OleDbConnection(m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection)
        Try
            objCon.Open()
            Dim objCMD As New OleDbCommand(SQL, objCon)
            strOwner = objCMD.ExecuteScalar
        Catch ex As Exception
            MsgBox(ex.Message & ex.StackTrace)
        Finally
            If objCon.State = ConnectionState.Open Then objCon.Close()
        End Try
        Return strOwner
    End Function
    Public Function Is_inZZ_TempTable(ByRef tmpTable As DataTable, ByVal strRecordValue As String) As Boolean
        Dim tmpRow As DataRow
        Dim blnReturn As Boolean = False
        For Each tmpRow In tmpTable.Rows
            If tmpRow.Item("Column") = strRecordValue Then
                If tmpRow.Item("tmp") Then
                    blnReturn = True ' Record Found in zzTempTable
                Else
                    blnReturn = False ' Record NOT Found in zzTempTable
                End If

            End If
        Next
        Return blnReturn
    End Function

    
    Private Sub cmdSaveView_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdSaveView.Click
        m_Project.m_MapArray(m_CurrentMapIndex).m_ViewName = txtViewName.Text
        m_Project.m_MapArray(m_CurrentMapIndex).m_ViewInitialScript = txtIntialViewScript.Text
        m_Project.m_MapArray(m_CurrentMapIndex).m_ViewEditedScript = txtEditedViewSQL.Text
    End Sub

    Private Sub cmdSaveFixes_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdSaveFixes.Click
        m_Project.m_MapArray(m_CurrentMapIndex).m_SQLFixesScript = txtSQLScript.Text
    End Sub


    Private Sub cmdCreateDTSScript_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdCreateDTSScript.Click
        Dim tmpTable As DataTable
        Dim tmpRow As DataRow
        tmpTable = m_Project.m_MapArray(m_CurrentMapIndex).m_SLXDestinationDataSet.Tables(m_Project.m_MapArray(m_CurrentMapIndex).m_SLXTableName)
        Dim strDTSScript As String = ""
        For Each tmpRow In tmpTable.Rows
            If tmpRow.Item("Add2View") Then
                strDTSScript = strDTSScript & "DTSDestination(" & Chr(34) & tmpRow.Item("Column") & Chr(34) & ")  =  DTSSource(" & Chr(34) & tmpRow.Item("Column") & Chr(34) & ")" & vbCrLf
            End If


        Next
        txtDTSscript.Text = strDTSScript
    End Sub

    Private Sub cmdSaveDTSScript_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdSaveDTSScript.Click
        m_Project.m_MapArray(m_CurrentMapIndex).m_DTSScript = txtDTSscript.Text
    End Sub

    Private Sub cmdSaveTempTable_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdSaveTempTable.Click
        m_Project.m_MapArray(m_CurrentMapIndex).m_TempTableName = txtTempTableName.Text
    End Sub
#End Region

    Private Sub cmdExecuteSQLScript_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdExecuteSQLScript.Click
        Dim objCon As New OleDbConnection(m_Project.m_MapArray(m_CurrentMapIndex).m_SLXNativeConnection)
        Try
            objCon.Open()
            '=========================================================
            ' Set the SQL 
            '=========================================================
            Dim SQL As String

            SQL = m_Project.m_MapArray(m_CurrentMapIndex).m_SQLFixesScript
           

            Dim objCMD As New OleDbCommand(SQL, objCon)
            MsgBox(objCMD.ExecuteNonQuery())
        Catch ex As Exception
            MsgBox(ex.Message & ex.StackTrace)
        Finally
            If objCon.State = ConnectionState.Open Then
                objCon.Close()
            End If
        End Try
    End Sub

    
    Private Sub cmdSaveMapConnections_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdSaveMapConnections.Click
        m_Project.m_MapArray(m_CurrentMapIndex).m_SourceConnection = txtSourceNative.Text
        m_Project.m_MapArray(m_CurrentMapIndex).m_SLXNativeConnection = txtSLXNative.Text
        m_Project.m_MapArray(m_CurrentMapIndex).m_SLXProviderConnection = txtSLXProvider.Text
    End Sub
End Class
