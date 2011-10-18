Public Class ASI_ConnectionInfo

    'Provider=SQLOLEDB.1;Password=Masterkey;Persist Security Info=True;User ID=sysdba;Initial Catalog=SLX_test;Data Source=Karate
    Private m_ConnectionString As String
    Private m_Database As String
    Private m_User As String
    Private m_Password As String
    Private m_DataSource As String
    Public Sub New(ByVal strConn As String)
        Dim separators As String = ";" 'used for parsing out the parameters
        'Dim commands As String = Microsoft.VisualBasic.Command()
        m_ConnectionString = strConn
        Dim args() As String = strConn.Split(separators.ToCharArray)
        Dim i As Integer
        Try
            For i = 0 To args.Length - 1
                SetConnectionPrivateMember(args(i))
            Next
        Catch ex As Exception
            MsgBox(ex.Message)
        End Try
    End Sub
    Private Sub SetConnectionPrivateMember(ByVal strPartOfConString As String)
        Dim i As Integer
        i = InStr(strPartOfConString, "=", CompareMethod.Text)
        Select Case Mid(strPartOfConString, 1, i - 1)
            Case "Password"
                m_Password = Mid(strPartOfConString, i + 1)
            Case "User ID"
                m_User = Mid(strPartOfConString, i + 1)
            Case "Initial Catalog"
                m_Database = Mid(strPartOfConString, i + 1)
            Case "Data Source"
                m_DataSource = Mid(strPartOfConString, i + 1)
            Case Else
        End Select
    End Sub


    Property ConnectionString()
        Get
            Return m_ConnectionString
        End Get
        Set(ByVal value)
            m_ConnectionString = value
        End Set
    End Property
    Property Database()
        Get
            Return m_Database
        End Get
        Set(ByVal value)
            m_Database = value
        End Set
    End Property
    Property User()
        Get
            Return m_User
        End Get
        Set(ByVal value)
            m_User = value
        End Set
    End Property
    Property Password()
        Get
            Return m_Password
        End Get
        Set(ByVal value)
            m_Password = value
        End Set
    End Property
    Property DataSource()
        Get
            Return m_DataSource
        End Get
        Set(ByVal value)
            m_DataSource = value
        End Set
    End Property
End Class

