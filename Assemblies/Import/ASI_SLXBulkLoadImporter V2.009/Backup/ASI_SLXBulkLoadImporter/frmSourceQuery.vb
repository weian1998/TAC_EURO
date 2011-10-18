Public Class frmSourceQuery
    Public m_strConnectionString As String
    Public m_strQUERY As String
    
    Private Sub cmdTest_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdTest.Click
        If m_strConnectionString = "" Then
            MsgBox("Source Connection string not Set", MsgBoxStyle.Critical)
            Exit Sub
        End If
        If txtSourceQuery.Text = "" Then
            MsgBox("Please Enter Query...", MsgBoxStyle.Information)
            Exit Sub
        End If
        Dim con As New OleDb.OleDbConnection(m_strConnectionString)
        Try
            con.Open()
            Dim cmd As New OleDb.OleDbCommand(txtSourceQuery.Text, con)
            Dim objReader As OleDb.OleDbDataReader = cmd.ExecuteReader
            Dim counter As Integer = 0

            While objReader.Read()
                counter += 1
            End While


            MsgBox(" Test Succeeded with " & counter & " Rows")
            objReader.Close()
        Catch ex As Exception
            MsgBox(ex.Message)
        Finally
            If con.State = ConnectionState.Open Then
                con.Close()
            End If
        End Try
    End Sub

    Private Sub cmdOK_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdOK.Click
        m_strQUERY = txtSourceQuery.Text
    End Sub

    Private Sub frmSourceQuery_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        txtSourceQuery.Text = m_strQUERY
    End Sub
End Class