Imports System.Web.Services
Imports System.Web.Services.Protocols
Imports System.ComponentModel
Imports System.IO
Imports System.Data.OleDb
Imports System.Threading


' To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line.
' <System.Web.Script.Services.ScriptService()> _
<System.Web.Services.WebService(Namespace:="http://tempuri.org/")> _
<System.Web.Services.WebServiceBinding(ConformsTo:=WsiProfiles.BasicProfile1_1)> _
<ToolboxItem(False)> _
Public Class Service1
    Inherits System.Web.Services.WebService
    Private _SLXConnectionString As String



    <WebMethod()> _
    Public Function HelloWorld() As String
        Return "Hello World"
    End Function
    <WebMethod()> _
    Public Function ReProcessAllUnlinkedEmailArchives()

        Dim t As New Thread(AddressOf ReprocessALL)
        t.Start()
        Return True

    End Function
    Private Sub ReprocessALL()
        GetSLXConnectionString()
        Dim strMessage As String = "Complete"
        Dim oConnection As New OleDbConnection(_SLXConnectionString)
        Try
            oConnection.Open()
            Dim objCmd As New OleDbCommand("SELECT EMAILARCHIVEID FROM sysdba.EMAILARCHIVE WHERE isnull(ISLINKEDHISTORY,'F') = 'F' order by createdate desc", oConnection)
            Dim objReader As OleDbDataReader = objCmd.ExecuteReader
            While objReader.Read()
                ProcessEmailArchiveID(objReader.GetString(0))

            End While
            objReader.Close()
        Catch ex As OleDbException
            strMessage = "Error " & ex.Message
        Finally
            If oConnection.State = ConnectionState.Open Then oConnection.Close()
        End Try

    End Sub
    <WebMethod()> _
    Public Function ReProcessContactEmailArchives(ByVal ID As String)

        GetSLXConnectionString()
        Dim strMessage As String = "Complete"
        Dim UserName As String = ""
        Dim UserID As String = ""
        Dim ContactID As String = ""
        Dim ContactName As String = ""
        Dim AccountID As String = ""
        Dim AccountName As String = ""
        Dim ContactType As String = ""

        Dim strToAddress As String = ""
        Dim strFromAddress As String = ""

        strToAddress = GetField(Of String)("TOADDRESS", "EMAILARCHIVE", " EMAILARCHIVEID = '" & ID & "'")
        strFromAddress = GetField(Of String)("FROMADDRESS", "EMAILARCHIVE", " EMAILARCHIVEID = '" & ID & "'")

        If IsUserFound(strToAddress, UserName, UserID) Then
            If IsContactFound(strFromAddress, ContactID, ContactName, AccountID, AccountName, ContactType) Then
                ' ReProcess by Email Address 
                strMessage = ReProcessContactEmailAddressEmailArchives(strFromAddress)
            End If
        Else
            If IsUserFound(strFromAddress, UserName, UserID) Then
                If IsContactFound(strToAddress, ContactID, ContactName, AccountID, AccountName, ContactType) Then
                    ' ReProcess by Email Address 
                    strMessage = ReProcessContactEmailAddressEmailArchives(strToAddress)
                End If
            End If
        End If

        Return strMessage
    End Function

    <WebMethod()> _
    Public Function ProcessEmailArchiveID(ByVal ID As String)
        '===============================================================
        ' TAC Code to Process a Single Email Archive
        '===============================================================
        Dim EmailArchiveID As String = String.Empty
        Dim UserID As String = String.Empty
        Dim UserName As String = String.Empty
        Dim blnIsUserFoundinFrom As Boolean = False
        Dim blnIsUserFoundinTo As Boolean = False

        Dim histContactID As String = String.Empty
        Dim histAccountID As String = String.Empty
        Dim histContactName As String = String.Empty
        Dim histAccountName As String = String.Empty
        Dim histContactType As String = String.Empty
        Dim histCategory As String = String.Empty
        Dim histSeccodeID As String = String.Empty
        Dim histLongNotes As String = String.Empty
        Dim histNotes As String = String.Empty
        Dim histDescription As String = String.Empty
        Dim histArchiveDate As DateTime
        Dim histTORECIPIENTS As String = String.Empty
        Dim histCCRECIPIENTS As String = String.Empty
        Dim histBCCRECIPIENTS As String = String.Empty
        Dim histFROM As String = String.Empty

        Dim ReProcessNote As String = String.Empty


        GetSLXConnectionString()
        '===========================================================================
        ' Proceed as This is not In the Exception List
        '===========================================================================
        If IsEmailArchiveInExceptionList(ID) Then
            'Write the Reprocess Log for Duplicate Emails
            ReProcessNote = "Email in Exclude List"
            Call UpdateEmailArchiveLinked(ID, ReProcessNote, False)
            Exit Function
        End If


        '===========================================================================
        ' Proceed as This is not In the Duplicate EMAIL List
        '===========================================================================
        If IsEmailArchiveInDuplicateEmailList(ID) Then
            'Write the Reprocess Log for Duplicate Emails
            ReProcessNote = "Duplicate Email Address"
            Call UpdateEmailArchiveLinked(ID, ReProcessNote, False)
            Exit Function
        End If



        Dim objConn As ADODB.Connection
        Dim objRS As ADODB.Recordset
        Dim Sql As String = "Select * from EMAILARCHIVE WHERE EMAILARCHIVEID ='" & ID & "'"

        objConn = New ADODB.Connection()
        'objConn.Open(System.Variables("SLXConnString"))
        objConn.Open(_SLXConnectionString, "", "", -1)

        On Error Resume Next ' ignore error and continue if necessary

        objRS = New ADODB.Recordset() ' Create an object (onjRS) containing result set of sql supplied


        With objRS ' Work with object - means you can just use . instead of entire name

            'set cursor and lock information for the RecordSet
            .CursorType = 3 'adOpenStatic
            .CursorLocation = 3 'adUseClient
            .LockType = 4 'adLockBatchOptimistic
            .Open(Sql, objConn) ' Open a connection, execute SQL and name it objRS

            blnIsUserFoundinFrom = False 'Intialize
            blnIsUserFoundinTo = False 'Intialize
            '==============================================================================
            ' Do Not Loop Through Because there is only 1 EmailArchive Created at a time
            '===============================================================================
            If Not (.BOF And .EOF) Then ' Check not at end/beginning
                'Variables("SLXUSER") = .Fields("USERID").Value
                'Variables("SLXUSERNAME") = .Fields("USERNAME").Value
                '.Fields("EMAIL").Value = ""
                'Variables("hist_Category") = "EMail Sent"
                '.MoveNext() ' Move to next record
                ' Category EMail Sent
                'Variables("UserFoundinFromEmailAddress") = "T"
                '=======================================================
                ' code From Reprocess .NET Assembly
                '=======================================================

                ' Intialize
                '===>>>>>>>>>>>>>>  ADD TASKCENTER VARIABLE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                EmailArchiveID = .Fields("EMAILARCHIVEID").Value
                histDescription = .Fields("SUBJECT").Value
                histLongNotes = .Fields("MESSAGEBODY").Value
                histNotes = .Fields("SHORTNOTES").Value
                histTORECIPIENTS = .Fields("TORECIPIENTS").Value
                'histCCRECIPIENTS = .Fields("CCRECIPIENTS ").Value
                histCCRECIPIENTS = .Fields(15).Value
                histBCCRECIPIENTS = .Fields("BCCRECIPIENTS").Value
                histFROM = .Fields("ORIGFROMADDRESS").Value

                '===========================================================================
                ' Special Case for Now all Single reprocess will Clear out existing History
                '===========================================================================
                RemoveHistoryLinkedtoEmailArchive(EmailArchiveID) ' Not Nessary.

                histArchiveDate = .Fields("CREATEDATE").Value
                '===========================================
                ' Check to See if the User Is Found
                '===========================================

                If IsUserFound(.Fields("FROMADDRESS").Value, UserName, UserID) Then
                    blnIsUserFoundinTo = True
                    histCategory = "EMail Sent"
                    '==================================================================================
                    ' Get Contact Information
                    '==================================================================================
                    If IsContactFound(.Fields("TOADDRESS").Value, histContactID, histContactName, histAccountID, histAccountName, histContactType) Then
                        '=========================================================
                        ' Set Remaining History record Information
                        '=========================================================
                        'histDescription = .Fields("SUBJECT").Value
                        'histLongNotes = .Fields("MESSAGEBODY").Value
                        'histNotes = .Fields("SHORTNOTES").Value
                        'histTORECIPIENTS = .Fields("TORECIPIENTS").Value
                        'histCCRECIPIENTS = .Fields("CCRECIPIENTS ").Value
                        'histBCCRECIPIENTS = .Fields("BCCRECIPIENTS").Value

                        '=====================================
                        ' Is Contact Employee
                        '===================================
                        If histContactType = "EMPL" Then
                            'Get User Private Team
                            histSeccodeID = GetUserPrivateSeccode(UserID)
                            If IsDuplicateHistoryItemExist(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                    UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                    histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS) Then
                                '=============================================
                                ' Check if Duplicate History allready Exists 
                                ' Skip if one Does
                                '=============================================
                                ' Exit Sub
                                Call UpdateEmailArchiveLinked(EmailArchiveID, "Duplicate History Exists", False)
                            Else
                                Call CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                     UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                     histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS, histFROM)
                                Call UpdateEmailArchiveLinked(EmailArchiveID, "Linked", True)
                            End If
                            '======================================================
                            ' Create Accompanying History record Employee Contact
                            '======================================================

                            If IsContactFound(.Fields("FROMADDRESS").Value, histContactID, histContactName, histAccountID, histAccountName, histContactType) Then
                                histSeccodeID = GetUserPrivateSeccode(UserID)

                                If IsDuplicateHistoryItemExist(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                    UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                    histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS) Then
                                    '=============================================
                                    ' Check if Duplicate History allready Exists 
                                    ' Skip if one Does
                                    '=============================================
                                    ' Exit Sub
                                    Call UpdateEmailArchiveLinked(EmailArchiveID, "Duplicate History Exists", False)
                                Else
                                    Call CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                         UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                         histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS, histFROM)
                                    Call UpdateEmailArchiveLinked(EmailArchiveID, "Linked", True)
                                End If



                            End If
                        Else
                            ' Not an Employee so Default Everyone
                            'histSeccodeID = "SYST00000001"
                            'histSeccodeID = GetField(Of String)("SECCODEID", "ACCOUNT", "ACCOUNTID='" & histAccountID & "'")
                            '==================================================================
                            ' First Check if User is ExecutiveTeam where All Emails ArePrivate
                            '===================================================================
                            If IsUserPartOfExcecutiveTeam(UserID) Then
                                histSeccodeID = GetUserPrivateSeccode(UserID)
                            Else
                                'Get AccountXHistory Mapp Team
                                Dim strXHistoryMappedTeam As String
                                Dim strAccountTeam As String
                                strAccountTeam = GetField(Of String)("SECCODEID", "ACCOUNT", "(ACCOUNTID = '" & histAccountID & "')")
                                strXHistoryMappedTeam = GetField(Of String)("XHISTORYSECCODEID", "EUROXHISTORYMAPPING", "(MAINACCOUNTSECCODEID = '" & strAccountTeam & "')")
                                If strXHistoryMappedTeam Is Nothing Then
                                    'No Mapped Team Found so Default to Account Ownership
                                    histSeccodeID = strAccountTeam
                                Else
                                    'FOUND!! 
                                    histSeccodeID = strXHistoryMappedTeam
                                End If

                            End If

                            If IsDuplicateHistoryItemExist(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                    UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                    histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS) Then
                                '=============================================
                                ' Check if Duplicate History allready Exists 
                                ' Skip if one Does
                                '=============================================
                                ' Exit Sub
                                Call UpdateEmailArchiveLinked(EmailArchiveID, "Duplicate History Exists", False)
                            Else
                                Call CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                     UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                     histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS, histFROM)
                                Call UpdateEmailArchiveLinked(EmailArchiveID, "Linked", True)
                            End If

                        End If
                    Else
                        '=======================================================================================================================================
                        ' Contact Not Found
                        ' May 25, 2012 changed the Logic so if a Contact is not found then record the Email under the contact for the user that was found
                        '=======================================================================================================================================
                        If IsContactFound(.Fields("FROMADDRESS").Value, histContactID, histContactName, histAccountID, histAccountName, histContactType) Then
                            '=====================================
                            ' Is Contact Employee (Should BE)
                            '===================================
                            If histContactType = "EMPL" Then
                                'Get User Private Team
                                histSeccodeID = GetUserPrivateSeccode(UserID)
                                If IsDuplicateHistoryItemExist(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                        UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                        histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS) Then
                                    '=============================================
                                    ' Check if Duplicate History allready Exists 
                                    ' Skip if one Does
                                    '=============================================
                                    ' Exit Sub
                                    Call UpdateEmailArchiveLinked(EmailArchiveID, "Duplicate History Exists", False)
                                Else
                                    Call CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                         UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                         histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS, histFROM)
                                    Call UpdateEmailArchiveLinked(EmailArchiveID, "Linked...Contact Not Found", True)
                                End If
                            End If
                        Else
                            ReProcessNote = "Contact Not Found"
                            Call UpdateEmailArchiveLinked(EmailArchiveID, ReProcessNote, False)
                        End If
                    End If
                End If

                '=======================================================================================
                ' Process Both user in To And From
                '=======================================================================================
                If IsUserFound(.Fields("TOADDRESS").Value, UserName, UserID) Then
                    blnIsUserFoundinFrom = True
                    histCategory = "EMail History Added"
                    '==================================================================================
                    ' Get Contact Information
                    '==================================================================================
                    If IsContactFound(.Fields("FROMADDRESS").Value, histContactID, histContactName, histAccountID, histAccountName, histContactType) Then
                        '=========================================================
                        ' Set Remaining History record Information
                        '=========================================================
                        'histDescription = .Fields("SUBJECT").Value
                        'histLongNotes = .Fields("MESSAGEBODY").Value
                        'histNotes = .Fields("SHORTNOTES").Value
                        'histTORECIPIENTS = .Fields("TORECIPIENTS").Value
                        'histCCRECIPIENTS = .Fields("CCRECIPIENTS ").Value
                        'histBCCRECIPIENTS = .Fields("BCCRECIPIENTS").Value

                        '=====================================
                        ' Is Contact Employee
                        '===================================
                        If histContactType = "EMPL" Then
                            'Get User Private Team
                            histSeccodeID = GetUserPrivateSeccode(UserID)
                            If IsDuplicateHistoryItemExist(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                    UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                    histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS) Then
                                '=============================================
                                ' Check if Duplicate History allready Exists 
                                ' Skip if one Does
                                '=============================================
                                ' Exit Sub
                                Call UpdateEmailArchiveLinked(EmailArchiveID, "Duplicate History Exists", False)
                            Else
                                Call CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                     UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                     histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS, histFROM)
                                Call UpdateEmailArchiveLinked(EmailArchiveID, "Linked", True)
                            End If
                            '======================================================
                            ' Create Accompanying History record Employee Contact
                            '======================================================

                            If IsContactFound(.Fields("TOADDRESS").Value, histContactID, histContactName, histAccountID, histAccountName, histContactType) Then
                                histSeccodeID = GetUserPrivateSeccode(UserID)
                                If IsDuplicateHistoryItemExist(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                    UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                    histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS) Then
                                    '=============================================
                                    ' Check if Duplicate History allready Exists 
                                    ' Skip if one Does
                                    '=============================================
                                    ' Exit Sub
                                    Call UpdateEmailArchiveLinked(EmailArchiveID, "Duplicate History Exists", False)
                                Else
                                    Call CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                         UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                         histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS, histFROM)
                                    Call UpdateEmailArchiveLinked(EmailArchiveID, "Linked", True)
                                End If



                            End If
                        Else
                            ' Not an Employee so Default Everyone
                            'histSeccodeID = "SYST00000001"
                            '==================================================================
                            ' First Check if User is ExecutiveTeam where All Emails ArePrivate
                            '===================================================================
                            If IsUserPartOfExcecutiveTeam(UserID) Then
                                histSeccodeID = GetUserPrivateSeccode(UserID)
                            Else
                                'Get AccountXHistory Mapp Team
                                Dim strXHistoryMappedTeam As String
                                Dim strAccountTeam As String
                                strAccountTeam = GetField(Of String)("SECCODEID", "ACCOUNT", "(ACCOUNTID = '" & histAccountID & "')")
                                strXHistoryMappedTeam = GetField(Of String)("XHISTORYSECCODEID", "EUROXHISTORYMAPPING", "(MAINACCOUNTSECCODEID = '" & strAccountTeam & "')")
                                If strXHistoryMappedTeam Is Nothing Then
                                    'No Mapped Team Found so Default to Account Ownership
                                    histSeccodeID = strAccountTeam
                                Else
                                    'FOUND!! 
                                    histSeccodeID = strXHistoryMappedTeam
                                End If

                            End If

                            If IsDuplicateHistoryItemExist(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                     UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                     histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS) Then
                                '=============================================
                                ' Check if Duplicate History allready Exists 
                                ' Skip if one Does
                                '=============================================
                                ' Exit Sub
                                Call UpdateEmailArchiveLinked(EmailArchiveID, "Duplicate History Exists", False)
                            Else
                                Call CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                     UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                     histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS, histFROM)
                                Call UpdateEmailArchiveLinked(EmailArchiveID, "Linked", True)
                            End If

                        End If

                    Else
                        '=======================================================================================================================================
                        ' Contact Not Found
                        ' May 25, 2012 changed the Logic so if a Contact is not found then record the Email under the contact for the user that was found
                        '=======================================================================================================================================
                        If IsContactFound(.Fields("TOADDRESS").Value, histContactID, histContactName, histAccountID, histAccountName, histContactType) Then
                            '=====================================
                            ' Is Contact Employee (Should BE)
                            '===================================
                            If histContactType = "EMPL" Then
                                'Get User Private Team
                                histSeccodeID = GetUserPrivateSeccode(UserID)
                                If IsDuplicateHistoryItemExist(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                        UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                        histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS) Then
                                    '=============================================
                                    ' Check if Duplicate History allready Exists 
                                    ' Skip if one Does
                                    '=============================================
                                    ' Exit Sub
                                    Call UpdateEmailArchiveLinked(EmailArchiveID, "Duplicate History Exists", False)
                                Else
                                    Call CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, _
                                                         UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, _
                                                         histSeccodeID, histTORECIPIENTS, histCCRECIPIENTS, histBCCRECIPIENTS, histFROM)
                                    Call UpdateEmailArchiveLinked(EmailArchiveID, "Linked...Contact Not Found", True)
                                End If
                            End If
                        Else
                            ReProcessNote = "Contact Not Found"
                            Call UpdateEmailArchiveLinked(EmailArchiveID, ReProcessNote, False)
                        End If

                    End If
                End If
                '=========================================================================
                '===============================================================
                'Check if User is found
                '===============================================================
                If blnIsUserFoundinTo = False And blnIsUserFoundinFrom = False Then
                    ReProcessNote = "User Not Found"
                    Call UpdateEmailArchiveLinked(EmailArchiveID, ReProcessNote, False)
                End If



            Else
                'EmailArchive Record Not Found... Something Went wrong..
            End If
            'thisstep.Loginfo "Category " & Variables("hist_Category") & " " & Variables("UserFoundinFromEmailAddress")
            '.MoveNext() ' Move to next record

        End With


        objRS.Close()

        Return ID
    End Function

    Private Function IsUserPartOfExcecutiveTeam(ByVal userid) As Boolean
        Dim blnReturn As Boolean = False 'Intialize
        Dim strResult As String = "" 'Intialize
        strResult = GetField(Of String)("SECRIGHTSID", "SECRIGHTS", "(SECCODEID = 'FEUROA00003E') AND (ACCESSID = '" & userid & "')")
        If strResult = Nothing Then
            blnReturn = False ' User Not Found
        Else
            blnReturn = True ' User Found
        End If
        Return blnReturn
    End Function







    Private Function GetSLXConnectionString() As String
        If _SLXConnectionString <> "" Then
            Return _SLXConnectionString
        End If
        Dim rootWebConfig As System.Configuration.Configuration
        rootWebConfig = System.Web.Configuration.WebConfigurationManager.OpenWebConfiguration("/")
        Dim connString As System.Configuration.ConnectionStringSettings
        If (rootWebConfig.ConnectionStrings.ConnectionStrings.Count > 0) Then
            connString = rootWebConfig.ConnectionStrings.ConnectionStrings("SLX")
            If Not (connString.ConnectionString = Nothing) Then
                _SLXConnectionString = connString.ConnectionString
            Else
                _SLXConnectionString = ""
            End If
        End If
        _SLXConnectionString = _SLXConnectionString.Replace("'", """")
        Return _SLXConnectionString
    End Function
    Private Function GetField(Of T)(ByVal Field As String, ByVal Table As String, ByVal Where As String) As T
        Dim sql As String = String.Format("select {0} from {1} where {2}", Field, Table, (If(Where.Equals(String.Empty), "1=1", Where)))
        Dim objReturn
        Using conn As New OleDbConnection(_SLXConnectionString)
            conn.Open()
            Using cmd As New OleDbCommand(sql, conn)
                Dim fieldval As Object = cmd.ExecuteScalar()

                If (fieldval Is DBNull.Value) Then
                    objReturn = Nothing
                Else
                    objReturn = DirectCast(fieldval, T)
                End If

            End Using
        End Using
        Return objReturn
    End Function

    Private Function IsEmailArchiveInExceptionList(ByVal EmailArchiveID As String)
        Dim blnResult As Boolean = False
        Dim strResult As String

        '=========================================================
        ' TOADDRESS
        '=========================================================
        strResult = GetField(Of String)("EMAILARCHIVEID", "EMAILARCHIVE", "(EMAILARCHIVEID = '" & EmailArchiveID & "') AND (TOADDRESS  IN (SELECT     EMAILADDRESS  FROM EMAILEXCLUDELIST)) ")
        If strResult = Nothing Then

        Else
            blnResult = True ' Record Found
        End If
        '=========================================================
        ' FROMADDRESS
        '=========================================================
        strResult = GetField(Of String)("EMAILARCHIVEID", "EMAILARCHIVE", "(EMAILARCHIVEID = '" & EmailArchiveID & "') AND (FROMADDRESS  IN (SELECT     EMAILADDRESS  FROM EMAILEXCLUDELIST)) ")
        If strResult = Nothing Then

        Else
            blnResult = True ' Record Found
        End If

        Return blnResult
    End Function
    Private Function IsEmailArchiveInDuplicateEmailList(ByVal EmailArchiveID As String)
        Dim blnResult As Boolean = False
        Dim strResult As String

        '=========================================================
        ' TOADDRESS
        '=========================================================
        strResult = GetField(Of String)("EMAILARCHIVEID", "EMAILARCHIVE", "(EMAILARCHIVEID = '" & EmailArchiveID & "') AND (TOADDRESS  IN (SELECT     EMAIL  FROM V_DuplicateEmails)) ")
        If strResult = Nothing Then

        Else
            blnResult = True ' Record Found
        End If
        '=========================================================
        ' FROMADDRESS
        '=========================================================
        strResult = GetField(Of String)("EMAILARCHIVEID", "EMAILARCHIVE", "(EMAILARCHIVEID = '" & EmailArchiveID & "') AND (FROMADDRESS  IN (SELECT     EMAIL  FROM V_DuplicateEmails)) ")
        If strResult = Nothing Then

        Else
            blnResult = True ' Record Found
        End If

        Return blnResult
    End Function

    Public Function IsUserFound(ByVal Emailaddress As String, ByRef UserName As String, ByRef UserID As String) As Boolean
        Dim returnValue 'As [Boolean] = False
        returnValue = False
        ' Initialize
        UserName = "" '[String].Empty
        UserID = "" '[String].Empty
        Dim objConn As ADODB.Connection
        Dim objRS As ADODB.Recordset
        Dim strSQL As String
        Dim objParams As Object
        Dim objCmd As ADODB.Command

        objConn = New ADODB.Connection()
        'objConn.Open(System.Variables("SLXConnString"))
        objConn.Open(_SLXConnectionString)
        Dim strCommand

        objCmd = New ADODB.Command   'DNL
        objCmd.ActiveConnection = objConn
        objCmd.CommandType = 1 'adCmdText
        objCmd.Prepared = True
        strSQL = "Select USERID,USERNAME  from USERINFO where EMAIL = ? "
        objCmd.CommandText = strSQL

        objCmd.Parameters.Refresh()
        objParams = objCmd.Parameters
        objParams.Item(0).Value = Emailaddress

        objRS = New ADODB.Recordset  ' Create an object (onjRS) containing result set of sql supplied

        objRS = objCmd.Execute
        On Error Resume Next ' ignore error and continue if necessary

        With objRS ' Work with object - means you can just use . instead of entire name
            'set cursor and lock information for the RecordSet
            '.CursorType = 3 'adOpenStatic
            '.CursorLocation = 3 'adUseClient
            '.LockType = 4 'adLockBatchOptimistic
            '.Open strSQL, objConn ' Open a connection, execute SQL and name it objRS


            If Not (.BOF And .EOF) Then ' Check not at end/beginning
                UserID = .Fields("USERID").Value
                UserName = .Fields("USERNAME").Value
                returnValue = True
            Else
                'Not Found
                returnValue = False

            End If
            'thisstep.Loginfo "Category " & Variables("hist_Category") & " " & Variables("UserFoundinFromEmailAddress")

        End With

        objRS.Close()
        objConn.Close()

        objRS = Nothing
        objParams = Nothing
        objCmd = Nothing


        IsUserFound = returnValue
    End Function

    Private Sub RemoveHistoryLinkedtoEmailArchive(ByVal EmailArchiveID As String)

        Dim sql As String = "DELETE FROM HISTORY WHERE EMAILARCHIVEID ='" & EmailArchiveID & "'"

        Using conn As New OleDbConnection(_SLXConnectionString)
            conn.Open()
            Using cmd As New OleDbCommand(sql, conn)
                cmd.ExecuteNonQuery()
            End Using
        End Using

    End Sub

    Public Function IsContactFound(ByVal Emailaddress, ByRef ContactID, ByRef ContactName, ByRef AccountID, ByRef Account, ByRef ContactType)
        Dim returnValue 'As [Boolean] = False
        returnValue = False
        ' Initialize

        Dim objConn As ADODB.Connection
        Dim objRS As ADODB.Recordset
        Dim strSQL As String
        Dim objParams
        Dim objCmd As ADODB.Command

        objConn = New ADODB.Connection
        'objConn.Open(System.Variables("SLXConnString"))
        objConn.Open(_SLXConnectionString)
        Dim strCommand

        objCmd = New ADODB.Command
        objCmd.ActiveConnection = objConn
        objCmd.CommandType = 1 'adCmdText
        objCmd.Prepared = True
        strSQL = "SELECT CONTACT.TYPE, CONTACT.ACCOUNTID, CONTACT.ACCOUNT, CONTACT.CONTACTID, " & _
                        "ISNULL(CONTACT.FIRSTNAME, '') + ', ' + ISNULL(CONTACT.LASTNAME, '') AS CNAME" & _
                " FROM CONTACT LEFT OUTER JOIN" & _
                            " EMAILEXTRA ON CONTACT.CONTACTID = EMAILEXTRA.CONTACTID" & _
                " WHERE (CONTACT.EMAIL = ? ) OR (CONTACT.SECONDARYEMAIL = ?) OR  (CONTACT.EMAIL3 = ? ) OR (EMAILEXTRA.EMAIL = ? )"
        objCmd.CommandText = strSQL

        objCmd.Parameters.Refresh()
        objParams = objCmd.Parameters
        objParams.Item(0).Value = Emailaddress
        objParams.Item(1).Value = Emailaddress
        objParams.Item(2).Value = Emailaddress
        objParams.Item(3).Value = Emailaddress

        objRS = New ADODB.Recordset  ' Create an object (onjRS) containing result set of sql supplied

        objRS = objCmd.Execute
        On Error Resume Next ' ignore error and continue if necessary

        With objRS ' Work with object - means you can just use . instead of entire name

            If Not (.BOF And .EOF) Then ' Check not at end/beginning
                ContactID = .Fields("CONTACTID").Value
                ContactName = .Fields("CNAME").Value
                AccountID = .Fields("ACCOUNTID").Value
                Account = .Fields("ACCOUNT").Value
                ContactType = .Fields("TYPE").Value
                returnValue = True
            Else
                'Not Found
                returnValue = False

            End If
            'thisstep.Loginfo "Category " & Variables("hist_Category") & " " & Variables("UserFoundinFromEmailAddress")

        End With

        objRS.Close()
        objConn.Close()

        objRS = Nothing
        objParams = Nothing
        objCmd = Nothing


        IsContactFound = returnValue
    End Function

    Public Function GetUserPrivateSeccode(ByVal UserID As String)
        Dim returnValue As String
        returnValue = "SYST00000001" ' Initialize to Everyone team
        '=========================================================
        '  Get the Users Private Seccodeid
        '=========================================================
        returnValue = GetField(Of String)("PRIVATESECCODEID", "EUROUSERPRIVATEMAP", "(USERID = '" & UserID & "') ")
        If returnValue = Nothing Then
            returnValue = "SYST00000001" 'Not Found
        End If


        Return returnValue
    End Function

    Public Sub CreateHistoryRecord(ByVal histAccountID As String, _
                                   ByVal histAccountName As String, _
                                   ByVal histContactID As String, _
                                   ByVal histContactName As String, _
                                   ByVal histCategory As String, _
                                   ByVal UserID As String, _
                                   ByVal UserName As String, _
                                   ByVal histArchiveDate As String, _
                                   ByVal Description As String, _
                                   ByVal LongNotes As String, _
                                   ByVal ShortNotes As String, _
                                   ByVal EmailArchiveID As String, _
                                   ByVal SeccodeId As String, _
                                   ByVal histTORECIPIENTS As String, _
                                   ByVal histCCRECIPIENTS As String, _
                                   ByVal histBCCRECIPIENTS As String, _
                                   ByVal histFROM As String)



        Dim objConn As ADODB.Connection
        Dim objRS As ADODB.Recordset
        Dim SQL
        SQL = "Select * from HISTORY WHERE 1=2"

        objConn = New ADODB.Connection()
        'objConn.Open(System.Variables("SLXConnString"))
        objConn.Open(_SLXConnectionString)

        On Error Resume Next ' ignore error and continue if necessary

        objRS = New ADODB.Recordset()  ' Create an object (onjRS) containing result set of sql supplied()
        Dim HistoryID
        HistoryID = GetNewID("HISTORY")

        With objRS ' Work with object - means you can just use . instead of entire name
            'set cursor and lock information for the RecordSet
            .CursorType = 3 'adOpenStatic
            .CursorLocation = 3 'adUseClient
            .LockType = 4 'adLockBatchOptimistic
            .Open(SQL, objConn) ' Open a connection, execute SQL and name it objRS
            ' Open an Empty record set for Inserting


            If (.BOF And .EOF) Then ' Check not at end/beginning
                .AddNew()

                .Fields("HISTORYID").Value = HistoryID
                '.Fields("ACTIVITYID").Value = ""
                .Fields("TYPE").Value = "262154"
                .Fields("ACCOUNTID").Value = histAccountID
                .Fields("CONTACTID").Value = histContactID
                '.Fields("OPPORTUNITYID").Value = ""
                .Fields("ACCOUNTNAME").Value = histAccountName
                .Fields("CONTACTNAME").Value = histContactName
                '.Fields("OPPORTUNITYNAME").Value = ""
                '.Fields("PRIORITY").Value = ""
                .Fields("CATEGORY").Value = histCategory
                .Fields("STARTDATE").Value = histArchiveDate
                .Fields("DURATION").Value = "1"
                .Fields("DESCRIPTION").Value = Left(Description, 64)
                '.Fields("PROCESSID").Value = ""
                '.Fields("PROCESSNODE").Value = ""
                .Fields("TIMELESS").Value = "F"
                '.Fields("RECURRING").Value = ""
                '.Fields("ACTIVITYBASEDON").Value = ""
                .Fields("USERID").Value = UserID
                .Fields("USERNAME").Value = UserName
                .Fields("ORIGINALDATE").Value = histArchiveDate
                .Fields("RESULT").Value = "Complete"
                '.Fields("RESULTCODE").Value = "Complete"
                .Fields("CREATEDATE").Value = histArchiveDate
                .Fields("CREATEUSER").Value = UserID
                .Fields("MODIFYDATE").Value = histArchiveDate
                .Fields("MODIFYUSER").Value = UserID
                .Fields("COMPLETEDDATE").Value = histArchiveDate
                .Fields("COMPLETEDUSER").Value = UserID
                .Fields("NOTES").Value = ShortNotes
                .Fields("LONGNOTES").Value = LongNotes
                .Fields("ATTACHMENT").Value = "F"
                '.Fields("USERDEF1").Value = ""
                '.Fields("USERDEF2").Value = ""
                '.Fields("USERDEF3").Value = ""
                '.Fields("TICKETID").Value = ""
                '.Fields("LEADID").Value = ""
                '.Fields("TICKETNUMBER").Value = ""
                '.Fields("LEADNAME").Value = ""
                '.Fields("ATTACHMENTCOUNT").Value = ""
                .Fields("EMAILARCHIVEID").Value = EmailArchiveID
                .Fields("SECCODEID").Value = SeccodeId
                .Fields("TORECIPIENTS").Value = histTORECIPIENTS
                .Fields("CCRECIPIENTS").Value = histCCRECIPIENTS
                .Fields("BCCRECIPIENTS").Value = histBCCRECIPIENTS
                .Fields("FROMRECIPIENT").Value = histFROM
                .UpdateBatch()

            Else
                ' Do Nothing



            End If

            'thisstep.Loginfo "Category " & Variables("hist_Category") & " " & Variables("UserFoundinFromEmailAddress")

        End With

        objRS.Close()
        objRS = Nothing
        objConn.Close()
        objConn = Nothing


    End Sub

    Private Function GetNewID(ByVal table)

        Dim objConn As ADODB.Connection
        objConn = New ADODB.Connection()
        'objConn.Open(System.Variables("SLXConnString"))
        objConn.Open(_SLXConnectionString)

        On Error Resume Next ' ignore error and continue if necessary
        Dim objRS As ADODB.Recordset
        objRS = New ADODB.Recordset  ' Create an object (onjRS) containing result set of sql supplied

        objRS = objConn.Execute("slx_dbids('" & table & "', 1)")

        GetNewID = objRS.Fields(0).Value & ""

        objRS.Close()
        objRS = Nothing
        objConn.Close()
        objConn = Nothing
    End Function

    Public Sub UpdateEmailArchiveLinked(ByVal EmailArchiveID As String, ByVal ReProcessNote As String, ByVal IsLinkedHistory As Boolean)

        Dim objConn As ADODB.Connection
        Dim objRS As ADODB.Recordset
        Dim SQL As String
        SQL = "Select * from EMAILARCHIVE WHERE EMAILARCHIVEID='" & EmailArchiveID & "'"

        objConn = New ADODB.Connection()
        'objConn.Open(System.Variables("SLXConnString"))
        objConn.Open(_SLXConnectionString)

        On Error Resume Next ' ignore error and continue if necessary

        objRS = New ADODB.Recordset() ' Create an object (onjRS) containing result set of sql supplied

        With objRS ' Work with object - means you can just use . instead of entire name
            'set cursor and lock information for the RecordSet
            .CursorType = 3 'adOpenStatic
            .CursorLocation = 3 'adUseClient
            .LockType = 4 'adLockBatchOptimistic
            .Open(SQL, objConn) ' Open a connection, execute SQL and name it objRS
            ' Open an Empty record set for Inserting


            If Not (.BOF And .EOF) Then ' Check not at end/beginning
                '.Fields("EMAILARCHIVEID").Value = Application.BasicFunctions.GetIDFor("EMAILARCHIVE")
                '.Fields("CREATEUSER").Value = ""
                '.Fields("CREATEDATE").Value = ""
                .Fields("MODIFYUSER").Value = "ADMIN"
                .Fields("MODIFYDATE").Value = Now
                '.Fields("FROMADDRESS").Value = ""
                '.Fields("TOADDRESS").Value = ""
                '.Fields("MESSAGEBODY").Value = ""
                '.Fields("SUBJECT").Value = ""
                If IsLinkedHistory Then
                    .Fields("ISLINKEDHISTORY").Value = "T"
                Else
                    .Fields("ISLINKEDHISTORY").Value = "F"
                End If

                '.Fields("ORIGTOADDRESS").Value = ""
                '.Fields("ORIGFROMADDRESS").Value = ""
                '.Fields("SHORTNOTES").Value = ""
                .Fields("REPROCESSNOTE").Value = ReProcessNote
                .UpdateBatch()

            Else
                ' Do Nothing



            End If

            'thisstep.Loginfo "Category " & Variables("hist_Category") & " " & Variables("UserFoundinFromEmailAddress")

        End With

        objRS.Close()
        objRS = Nothing
        objConn.Close()
        objConn = Nothing


    End Sub

    Public Function ReProcessContactEmailAddressEmailArchives(ByVal EmailAddress As String)
        GetSLXConnectionString()
        Dim strMessage As String = "Complete"
        Dim oConnection As New OleDbConnection(_SLXConnectionString)
        Try
            oConnection.Open()
            Dim objCmd As New OleDbCommand("SELECT EMAILARCHIVEID FROM sysdba.EMAILARCHIVE WHERE isnull(ISLINKEDHISTORY,'F') = 'F' AND (TOADDRESS ='" & EmailAddress & "') OR (FROMADDRESS ='" & EmailAddress & "') order by createdate desc", oConnection)
            Dim objReader As OleDbDataReader = objCmd.ExecuteReader
            While objReader.Read()
                ProcessEmailArchiveID(objReader.GetString(0))

            End While
            objReader.Close()
        Catch ex As OleDbException
            strMessage = "Error " & ex.Message
        Finally
            If oConnection.State = ConnectionState.Open Then oConnection.Close()
        End Try
        Return strMessage
    End Function

    Public Function IsDuplicateHistoryItemExist(
                                   ByVal histAccountID As String, _
                                   ByVal histAccountName As String, _
                                   ByVal histContactID As String, _
                                   ByVal histContactName As String, _
                                   ByVal histCategory As String, _
                                   ByVal UserID As String, _
                                   ByVal UserName As String, _
                                   ByVal histArchiveDate As String, _
                                   ByVal Description As String, _
                                   ByVal LongNotes As String, _
                                   ByVal ShortNotes As String, _
                                   ByVal EmailArchiveID As String, _
                                   ByVal SeccodeId As String, _
                                   ByVal histTORECIPIENTS As String, _
                                   ByVal histCCRECIPIENTS As String, _
                                   ByVal histBCCRECIPIENTS As String) As Boolean

        Dim returnValue 'As [Boolean] = False
        returnValue = False
        ' Initialize 

        Dim objConn As ADODB.Connection
        Dim objRS As ADODB.Recordset
        Dim strSQL As String
        Dim objParams As Object
        Dim objCmd As ADODB.Command
        Try


            objConn = New ADODB.Connection()
            'objConn.Open(System.Variables("SLXConnString"))
            objConn.Open(_SLXConnectionString)
            Dim strCommand

            objCmd = New ADODB.Command   'DNL
            objCmd.ActiveConnection = objConn
            objCmd.CommandType = 1 'adCmdText
            objCmd.Prepared = True
            strSQL = "SELECT    HISTORYID "
            strSQL = strSQL & "        FROM sysdba.HISTORY "
            strSQL = strSQL & " WHERE     (ACCOUNTID = ?) AND (CONTACTID = ?) AND "
            strSQL = strSQL & " (CATEGORY = ?) AND (USERID = ?)  "
            strSQL = strSQL & " AND (DESCRIPTION = ?) AND (SECCODEID = ?) AND (NOTES like ?) AND (CREATEDATE > ?) AND (CREATEDATE < ?)"
            'strSQL = strSQL & " AND (CREATEDATE = ?) "

            '    strSQL = strSQL & "   (SECCODEID = ?) AND (TORECIPIENTS = ?) AND "
            'strSQL = strSQL & " (CCRECIPIENTS = ?)"
            objCmd.CommandText = strSQL

            objCmd.Parameters.Refresh()
            objParams = objCmd.Parameters
            '==================================================================================================
            ' Get dates ready Dates are very inconsistent so test for Duplicate on the day and not by time
            '===================================================================================================
            Dim myDateTime As Date
            myDateTime = CDate(histArchiveDate)
            Dim StartDate As Date = CDate(myDateTime.ToString("d"))
            Dim EndDate As Date = CDate(myDateTime.AddDays(1).ToString("d"))

            objParams.Item(0).Value = histAccountID
            'objParams.Item(1).Value = histAccountName
            objParams.Item(1).Value = histContactID
            'objParams.Item(3).Value = histContactName
            objParams.Item(2).Value = histCategory
            objParams.Item(3).Value = UserID
            'objParams.Item(6).Value = UserName
            'objParams.Item(7).Value = histArchiveDate
            objParams.Item(4).Value = Description

            '    
            objParams.Item(5).Value = SeccodeId
            'objParams.Item(6).Value = LongNotes
            objParams.Item(6).Value = ShortNotes
            objParams.Item(7).Value = StartDate
            objParams.Item(8).Value = EndDate
            '    objParams.Item(10).Value = histTORECIPIENTS
            '    objParams.Item(11).Value = histCCRECIPIENTS

            'Dim strTest As String
            'strTest = "SELECT    HISTORYID "
            'strTest = strTest & "        FROM sysdba.HISTORY "
            'strTest = strTest & " WHERE     (ACCOUNTID = '" & histAccountID & "') AND (CONTACTID = '" & histContactID & "')  AND "
            'strTest = strTest & " (CATEGORY = '" & histCategory & "') AND (USERID = '" & UserID & "') AND (USERNAME = '" & UserName & "') "
            'strTest = strTest & " AND (CREATEDATE = '" & myDateTime.ToUniversalTime.ToString & "') "



            objRS = New ADODB.Recordset  ' Create an object (onjRS) containing result set of sql supplied

            objRS = objCmd.Execute
            'On Error Resume Next ' ignore error and continue if necessary

            With objRS ' Work with object - means you can just use . instead of entire name
                'set cursor and lock information for the RecordSet
                '.CursorType = 3 'adOpenStatic
                '.CursorLocation = 3 'adUseClient
                '.LockType = 4 'adLockBatchOptimistic
                '.Open strSQL, objConn ' Open a connection, execute SQL and name it objRS


                If Not (.BOF And .EOF) Then ' Check not at end/beginning

                    returnValue = True
                Else
                    'Not Found
                    returnValue = False

                End If
                'thisstep.Loginfo "Category " & Variables("hist_Category") & " " & Variables("UserFoundinFromEmailAddress")

            End With
        Catch ex As Exception
            Dim msg = ex.Message
        End Try

        Try
            objRS.Close()
            objConn.Close()
        Catch ex As Exception

        End Try


        objRS = Nothing
        objParams = Nothing
        objCmd = Nothing


        Return returnValue


    End Function


End Class

