Imports System.Data.OleDb
Imports System.IO
Imports MSDASC 'Used to Create DataLinks
Imports System.Data
Imports ADODB
Public Class frmMainConnections

    Private Sub cmdSearchSourceConnection_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdSearchSourceConnection.Click
        '==============================================================================
        ' Instead of Using UDL Files this App Uses the DataLink Class
        '==============================================================================
        Dim Instance As DataLinksClass = New DataLinksClass
        Dim connection As ConnectionClass = New ConnectionClass
        If txtSourceConnection.Text <> "" Then
            connection.ConnectionString = txtSourceConnection.Text
        End If
        If (Instance.PromptEdit(connection)) Then
            txtSourceConnection.Text = connection.ConnectionString
        End If
    End Sub

    Private Sub cmdSLXnativeConnection_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdSLXnativeConnection.Click
        '==============================================================================
        ' Instead of Using UDL Files this App Uses the DataLink Class
        '==============================================================================
        Dim Instance As DataLinksClass = New DataLinksClass
        Dim connection As ConnectionClass = New ConnectionClass
        If txtSLXNativeConnection.Text <> "" Then
            connection.ConnectionString = txtSLXNativeConnection.Text
        End If
        If (Instance.PromptEdit(connection)) Then
            txtSLXNativeConnection.Text = connection.ConnectionString
        End If
    End Sub

    Private Sub cmdSLXProviderConnection_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles cmdSLXProviderConnection.Click
        '==============================================================================
        ' Instead of Using UDL Files this App Uses the DataLink Class
        '==============================================================================
        Dim Instance As DataLinksClass = New DataLinksClass
        Dim connection As ConnectionClass = New ConnectionClass
        If txtSLXProviderConnection.Text <> "" Then
            connection.ConnectionString = txtSLXProviderConnection.Text
        End If
        If (Instance.PromptEdit(connection)) Then
            txtSLXProviderConnection.Text = connection.ConnectionString
        End If
    End Sub

    Private Sub frmMainConnections_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
        Me.ActiveControl = cmdSearchSourceConnection
    End Sub
End Class