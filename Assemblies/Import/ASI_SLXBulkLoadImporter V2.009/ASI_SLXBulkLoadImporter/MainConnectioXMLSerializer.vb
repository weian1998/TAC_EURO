Imports System.IO
Public Class MainConnectioXMLSerializer

    Public Function WriteXML(ByVal objConfig As clsMainConnectionSettings) As String
        'Create a new instance of an XMLSerialized object passing a reference to SalesLogix Login ypte ot the constructo
        Dim strPath As String
        strPath = "C:\Documents and Settings\All Users\Application Data\ASI"
        If Not IO.Directory.Exists(strPath) Then
            IO.Directory.CreateDirectory(strPath)
        End If
        strPath = strPath & "\ASI_BulkLoad_Settings.xml"
        '===================================================================
        If System.IO.File.Exists(strPath) Then
        Else
            'MsgBox("Create the File")
            Dim objFile As System.IO.FileStream '(sb.ToString, IO.FileMode.Truncate, FileAccess.ReadWrite) 
            objFile = System.IO.File.Create(strPath)
            objFile.Close()
            objFile = Nothing
        End If
        Dim fs As New System.IO.FileStream(strPath, IO.FileMode.Truncate, FileAccess.ReadWrite)     ' if the file exist and Append is False, The file is overwritten
        Dim s As New System.IO.StreamWriter(fs)
        Dim oSerializer As New System.Xml.Serialization.XmlSerializer(GetType(clsMainConnectionSettings))
        Dim oStringWriter As New System.IO.StringWriter
        oSerializer.Serialize(oStringWriter, objConfig)
        s.Write(oStringWriter.ToString)
        s.Close() 'Clean UP
        fs.Close()

        Return oStringWriter.ToString
    End Function

    Public Function LoadXML(ByRef objConfig As clsMainConnectionSettings) As Boolean
        '=============================================
        ' Get the File
        '============================================
        Dim strPath As String
        strPath = "C:\Documents and Settings\All Users\Application Data\ASI"
        If Not IO.Directory.Exists(strPath) Then
            IO.Directory.CreateDirectory(strPath)
        End If
        strPath = strPath & "\ASI_BulkLoad_Settings.xml"
        If System.IO.File.Exists(strPath) Then
            ' Do Nothing and Use the Existing File
        Else
            'MsgBox("Create the File")
            Dim objFile As System.IO.FileStream '(sb.ToString, IO.FileMode.Truncate, FileAccess.ReadWrite) 
            objFile = System.IO.File.Create(strPath)
            objFile.Close()
            objFile = Nothing
        End If
        '===================================================================

        Dim oSerializer As New System.Xml.Serialization.XmlSerializer(GetType(clsMainConnectionSettings))
        If System.IO.File.Exists(strPath) Then
            'Serialize the XML
            Dim fs As New System.IO.FileStream(strPath, IO.FileMode.Open)     ' if the file exist and Append is False, The file is overwritten
            Dim s As New System.IO.StreamReader(fs)
            Try
                objConfig = CType(oSerializer.Deserialize(s), clsMainConnectionSettings)
                Return True
            Catch ex As Exception

            Finally
                s.Close() 'Clean up
                fs.Close()
            End Try

        Else
            Return False
        End If
    End Function

End Class


