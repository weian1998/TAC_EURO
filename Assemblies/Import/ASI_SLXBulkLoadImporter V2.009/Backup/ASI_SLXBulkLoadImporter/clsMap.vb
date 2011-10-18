Imports System.Data
Public Class clsMap
    Public m_MapName As String
    '===========================================
    ' Connection Settings
    '===========================================
    Public m_SourceConnection As String
    Public m_SLXNativeConnection As String
    Public m_SLXProviderConnection As String

    '==========================================
    ' Data Sets
    '===========================================
    Public m_SourceDataset As DataSet
    Public m_SLXDestinationDataSet As DataSet
    Public m_Source_TargetMappingDataset As DataSet

    '===========================================
    ' Table Names
    '===========================================
    Public m_Source_Target_TableName As String
    Public m_SLXTableName As String
    Public m_SourceTableName As String

    '===========================================
    ' Source Specific Properties
    '===========================================
    Public m_UseQuery As Boolean
    Public m_UseQuerySQL As String
    Public m_SourcePK As String

    '===========================================
    ' Target Specific Properties
    '===========================================

    '===========================================
    ' View Specific
    '===========================================
    Public m_ViewName As String
    Public m_ViewInitialScript As String
    Public m_ViewEditedScript As String

    '===========================================
    ' Other
    '===========================================
    Public m_DTSScript As String
    Public m_SQLFixesScript As String
    Public m_TempTableName As String
    Public m_TempTableDataset As String
    Public m_Initialized As Boolean = False

End Class
