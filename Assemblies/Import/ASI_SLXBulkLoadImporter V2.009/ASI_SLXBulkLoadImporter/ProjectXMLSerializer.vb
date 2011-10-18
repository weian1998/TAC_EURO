Imports System.IO
Public Class ProjectXMLSerializer

    Public Function WriteXML(ByVal objProject As clsProject) As String
        'Create a new instance of an XMLSerialized object passing a reference to SalesLogix Login ypte ot the constructo
        Dim FileName As String
        FileName = objProject.m_FilePath
        '===================================================================
        If System.IO.File.Exists(FileName) Then
        Else
            'MsgBox("Create the File")
            Dim objFile As System.IO.FileStream '(sb.ToString, IO.FileMode.Truncate, FileAccess.ReadWrite) 
            objFile = System.IO.File.Create(FileName)
            objFile.Close()
            objFile = Nothing
        End If
        Try
            Dim fs As New System.IO.FileStream(FileName, IO.FileMode.Truncate, FileAccess.ReadWrite)     ' if the file exist and Append is False, The file is overwritten
            Dim s As New System.IO.StreamWriter(fs)
            Dim oSerializer As New System.Xml.Serialization.XmlSerializer(GetType(clsProject))
            Dim oStringWriter As New System.IO.StringWriter
            oSerializer.Serialize(oStringWriter, objProject)
            s.Write(oStringWriter.ToString)
            s.Close() 'Clean UP
            fs.Close()

            MsgBox(" Saved Successfully ", MsgBoxStyle.Information, "Save Project")
            Return oStringWriter.ToString

        Catch ex As Exception
            MsgBox(ex.Message & ex.StackTrace)

        End Try
       

    End Function

    Public Function LoadXML(ByRef objProject As clsProject, ByVal FilePath As String) As Boolean

        Dim oSerializer As New System.Xml.Serialization.XmlSerializer(GetType(clsProject))
        If System.IO.File.Exists(FilePath) Then
            'Serialize the XML
            Dim fs As New System.IO.FileStream(FilePath, IO.FileMode.Open)     ' if the file exist and Append is False, The file is overwritten
            Dim s As New System.IO.StreamReader(fs)
            Try
                objProject = CType(oSerializer.Deserialize(s), clsProject)
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


