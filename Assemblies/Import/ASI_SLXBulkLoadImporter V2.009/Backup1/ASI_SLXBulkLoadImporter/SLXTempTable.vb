Public Class SLXTempTable
    Public Sub New()

    End Sub
    Public TableName As String = String.Empty
    Public SourceSQLQuery As String = String.Empty
    Public SLXTables As SLX_FieldName_IDFieldTable() ' Array of Field Names
End Class

Public Class SLX_FieldName_IDFieldTable
    Public FieldName As String = String.Empty
    Public TableNameIDsCreated4 As String = String.Empty
End Class
