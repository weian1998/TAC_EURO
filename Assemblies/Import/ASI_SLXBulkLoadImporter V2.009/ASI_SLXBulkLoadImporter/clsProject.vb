Public Class clsProject
    Public ProjectName As String
    Public m_SourceConnection As String
    Public m_SLXNativeConnection As String
    Public m_SLXProviderConnection As String
    Public m_FilePath As String
    Public m_MapArray() As clsMap 'New ArrayList(1) 'Can grow Dyanmically' Can't persist this object
    '                                   Throught XMLSerialization Too Bad :-(



    Public Sub New()
        m_FilePath = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments) & " \NewBulkLoadProject1.ASIP"
        Dim objMap As New clsMap
        objMap.m_MapName = "Map1"
        ReDim Preserve m_MapArray(0)
        m_MapArray(0) = objMap
        'AddMap(objMap)
    End Sub
    Public Sub AddMap(ByVal objMap As clsMap)
        'm_MapArray.Add(objMap)
        Dim iLength As Integer
        iLength = m_MapArray.Length
        ReDim Preserve m_MapArray(iLength)
        m_MapArray(iLength) = objMap
    End Sub
    Public Sub DeleteMap(ByVal Index As Integer)
        'm_MapArray.RemoveAt(Index)
        '================================================================
        ' Create Temp Array
        '  Copy all Valid Items except the Item you want to Remove here
        '================================================================
        Dim tmp As New ArrayList
        Dim i As Integer
        For i = 0 To m_MapArray.Length - 1
            If i = Index Then
                ' Skip it
            Else
                ' Add the Item to the Temp Array
                tmp.Add(m_MapArray(i))
            End If
        Next
        '======================================
        ' ReCreate the Public Array
        '======================================
        If tmp.Count > 0 Then
            ReDim m_MapArray(tmp.Count - 1) ' DO NoT Preserve because we are receating this Array
            For i = 0 To tmp.Count - 1
                m_MapArray(i) = tmp(i)
            Next
        Else
            ReDim m_MapArray(0) ' a Clean Zero sized Map Array
        End If


    End Sub



End Class
