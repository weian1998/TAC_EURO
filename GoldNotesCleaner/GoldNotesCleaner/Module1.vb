Imports System.Text.RegularExpressions
Imports HtmlAgilityPack
Imports System.IO

Module Module1

    Sub Main()
        CleanOppNotes()
        'CleanAddress()

        'AddContactEmails()
    End Sub
    'Public Function ConvertHtml(ByVal html As String) As String
    '    Dim doc As New HtmlDocument()
    '    doc.LoadHtml(html)

    '    Dim sw As New StringWriter()
    '    ConvertTo(doc.DocumentNode, sw)
    '    sw.Flush()
    '    Return sw.ToString()
    'End Function
    Public Sub AddContactEmails()
        Dim objConn As New ADODB.Connection()
        Dim objRS As New ADODB.Recordset
        Dim strSQL As String = "SELECT     CONTACT_2.CONTACTID, sysdba.GOLDEMAIL.EMAIL"
        strSQL = strSQL & " FROM         sysdba.CONTACT AS CONTACT_2 INNER JOIN"
        strSQL = strSQL & "              sysdba.GOLDEMAIL ON CONTACT_2.ACCOUNTID = sysdba.GOLDEMAIL.ACCOUNTID"
        strSQL = strSQL & " WHERE     (CONTACT_2.ACCOUNTID IN"
        strSQL = strSQL & "                  (SELECT     ACCOUNTID"
        strSQL = strSQL & "                    FROM          sysdba.CONTACT AS CONTACT_1"
        strSQL = strSQL & "                    GROUP BY ACCOUNTID"
        strSQL = strSQL & "                    HAVING      (COUNT(*) = 1)))"
        strSQL = strSQL & " ORDER BY CONTACT_2.CONTACTID"
        '============================================================================================
        ' Use Native provider Connection as SLX Provider Cant handle the Query with SubQuieries
        '============================================================================================
        Dim strConstring As String = "Provider=SQLOLEDB.1;Password=masterkey;Persist Security Info=True;User ID=sysdba;Initial Catalog=EurOptimumSLX;Data Source=TACWEB" 'Extended Properties=""PORT=1706;LOG=ON;CASEINSENSITIVEFIND=ON;AUTOINCBATCHSIZE=1;SVRCERT=;"""

        Dim i As Integer = 0
        Dim iEmailcount As Integer = 0
        Dim strTempContactid As String = ""
        Try
            objConn.Open(strConstring)
            With objRS
                .CursorLocation = ADODB.CursorLocationEnum.adUseClient
                .CursorType = ADODB.CursorTypeEnum.adOpenDynamic
                .LockType = ADODB.LockTypeEnum.adLockOptimistic
                .Open(strSQL, objConn)
                For i = 0 To objRS.RecordCount - 1


                    If .EOF Then
                        'adding
                       
                    Else
                        If .Fields("CONTACTID").Value <> strTempContactid Then
                            'Intialzie Email Counter
                            iEmailcount = 0
                            strTempContactid = .Fields("CONTACTID").Value

                        Else

                        End If
                        If iEmailcount = 0 Then
                            Update_CONTACT_Field("EMAIL", .Fields("EMAIL").Value, strTempContactid)
                        End If
                        If iEmailcount = 1 Then
                            Update_CONTACT_Field("SECONDARYEMAIL", .Fields("EMAIL").Value, strTempContactid)
                        End If
                        If iEmailcount = 2 Then
                            Update_CONTACT_Field("EMAIL3", .Fields("EMAIL").Value, strTempContactid)
                        End If
                        If iEmailcount > 2 Then
                            InsertContactEmailExtra(.Fields("EMAIL").Value, strTempContactid)
                        End If

                        ''===========================================
                        ' Increment Counter
                        '=============================================
                        iEmailcount = iEmailcount + 1
                        Console.WriteLine(strTempContactid & "  " & .Fields("EMAIL").Value)

                        

                    End If

                    '.Update()
                    .MoveNext()
                Next
            End With
            objConn.Close()
            objRS = Nothing
            objConn = Nothing

        Catch ex As Exception
            'MsgBox(ex.Message)
            'Dim ErrorMessage As String = ""
            'ErrorMessage = " SubjectID =" & SubjectID & " RecordID=" & ID & "  Error Updating " & Field & " Value= " & Value & "....." & ex.Message & " " & Now
            'WriteErrorLog(SubjectID, ID, Field, Value, ex.Message)

        End Try
        Console.WriteLine("Complete")
    End Sub
    Public Sub Update_CONTACT_Field(ByVal Field As String, ByVal Value As String, ByVal ID As String)
        Dim objConn As New ADODB.Connection()
        Dim objRS As New ADODB.Recordset
        Dim strSQL As String = "SELECT * FROM CONTACT WHERE CONTACTID ='" & ID & "'" 'Get A Blank Recordset
        Dim strConstring As String = "Provider=SLXOLEDB.1;Password=;Persist Security Info=True;User ID=admin;Initial Catalog=EUROSLX;Data Source=TACWEB" 'Extended Properties=""PORT=1706;LOG=ON;CASEINSENSITIVEFIND=ON;AUTOINCBATCHSIZE=1;SVRCERT=;"""
        Try
            objConn.Open(strConstring)
            With objRS
                .CursorLocation = ADODB.CursorLocationEnum.adUseClient
                .CursorType = ADODB.CursorTypeEnum.adOpenDynamic
                .LockType = ADODB.LockTypeEnum.adLockOptimistic
                .Open(strSQL, objConn)
                If .EOF Then
                    'adding

                    '.Fields("HRVStudyGroup_2006").Value = True
                Else
                    'updating
                    .Fields(Field).Value = Value
                End If

                .Update()
                .Close()
            End With
            objConn.Close()
            objRS = Nothing
            objConn = Nothing

        Catch ex As Exception
            'MsgBox(ex.Message)
            'Dim ErrorMessage As String = ""
            'ErrorMessage = " SubjectID =" & SubjectID & " RecordID=" & ID & "  Error Updating " & Field & " Value= " & Value & "....." & ex.Message & " " & Now
            'WriteErrorLog(SubjectID, ID, Field, Value, ex.Message)
            Console.WriteLine(ex.Message)
        End Try
    End Sub
   
    Public Sub InsertContactEmailExtra(ByVal Value As String, ByVal ID As String)
        Dim objConn As New ADODB.Connection()
        Dim objRS As New ADODB.Recordset
        Dim strSQL As String = "SELECT * FROM EMAILEXTRA WHERE 1=2" 'Get A Blank Recordset"
        Dim strConstring As String = "Provider=SLXOLEDB.1;Password=;Persist Security Info=True;User ID=admin;Initial Catalog=EUROSLX;Data Source=TACWEB" 'Extended Properties=""PORT=1706;LOG=ON;CASEINSENSITIVEFIND=ON;AUTOINCBATCHSIZE=1;SVRCERT=;"""
        Try
            objConn.Open(strConstring)
            With objRS
                .CursorLocation = ADODB.CursorLocationEnum.adUseClient
                .CursorType = ADODB.CursorTypeEnum.adOpenDynamic
                .LockType = ADODB.LockTypeEnum.adLockOptimistic
                .Open(strSQL, objConn)
                If .EOF Then
                    .AddNew()
                    'adding
                    '.Fields("EMAILEXTRAID").Value = Application.BasicFunctions.GetIDFor("EMAILEXTRA")
                    .Fields("CONTACTID").Value = ID
                    '.Fields("CREATEUSER").Value = ""
                    '.Fields("CREATEDATE").Value = ""
                    '.Fields("MODIFYUSER").Value = ""
                    '.Fields("MODIFYDATE").Value = ""
                    .Fields("EMAIL").Value = Value
                    '.Fields("HRVStudyGroup_2006").Value = True
                Else
                    'updating
                    '.Fields(Field).Value = Value
                End If

                .Update()
                .Close()
            End With
            objConn.Close()
            objRS = Nothing
            objConn = Nothing

        Catch ex As Exception
            'MsgBox(ex.Message)
            'Dim ErrorMessage As String = ""
            'ErrorMessage = " SubjectID =" & SubjectID & " RecordID=" & ID & "  Error Updating " & Field & " Value= " & Value & "....." & ex.Message & " " & Now
            'WriteErrorLog(SubjectID, ID, Field, Value, ex.Message)
            Console.WriteLine(ex.Message)
        End Try
    End Sub
    Public Sub CleanOppNotes()
        Dim objConn As New ADODB.Connection()
        Dim objRS As New ADODB.Recordset
        Dim strSQL As String = "Select * from sysdba.Opportunity where Notes is not null"
        Dim strConstring As String = "Provider=SLXOLEDB.1;Password=;Persist Security Info=True;User ID=admin;Initial Catalog=EUROSLX;Data Source=TACWEB" 'Extended Properties=""PORT=1706;LOG=ON;CASEINSENSITIVEFIND=ON;AUTOINCBATCHSIZE=1;SVRCERT=;"""
        Dim strStripped As String
        Dim i As Integer = 0
        Try
            objConn.Open(strConstring)
            With objRS
                .CursorLocation = ADODB.CursorLocationEnum.adUseClient
                .CursorType = ADODB.CursorTypeEnum.adOpenDynamic
                .LockType = ADODB.LockTypeEnum.adLockOptimistic
                .Open(strSQL, objConn)
                For i = 0 To objRS.RecordCount - 1


                    If .EOF Then
                        'adding

                        '.Fields("HRVStudyGroup_2006").Value = True
                    Else
                        'updating
                        strStripped = StripHTML(.Fields("Notes").Value)
                        strStripped = StripUnprintable(strStripped)
                        strStripped = strStripped.Trim()
                        'strStripped = StripTags(.Fields("Notes").Value)
                        Console.WriteLine(strStripped)
                        .Fields("Notes").Value = strStripped

                    End If

                    .Update()
                    .MoveNext()
                Next
            End With
            objConn.Close()
            objRS = Nothing
            objConn = Nothing

        Catch ex As Exception
            'MsgBox(ex.Message)
            'Dim ErrorMessage As String = ""
            'ErrorMessage = " SubjectID =" & SubjectID & " RecordID=" & ID & "  Error Updating " & Field & " Value= " & Value & "....." & ex.Message & " " & Now
            'WriteErrorLog(SubjectID, ID, Field, Value, ex.Message)

        End Try
        Console.WriteLine("Complete")
    End Sub

    Public Sub CleanAddress()
        Dim objConn As New ADODB.Connection()
        Dim objRS As New ADODB.Recordset
        Dim strSQL As String = "Select * from sysdba.Address"
        Dim strConstring As String = "Provider=SLXOLEDB.1;Password=;Persist Security Info=True;User ID=admin;Initial Catalog=EUROSLX;Data Source=TACWEB" 'Extended Properties=""PORT=1706;LOG=ON;CASEINSENSITIVEFIND=ON;AUTOINCBATCHSIZE=1;SVRCERT=;"""
        Dim strStripped As String
        Dim i As Integer = 0
        Try
            objConn.Open(strConstring)
            With objRS
                .CursorLocation = ADODB.CursorLocationEnum.adUseClient
                .CursorType = ADODB.CursorTypeEnum.adOpenDynamic
                .LockType = ADODB.LockTypeEnum.adLockOptimistic
                .Open(strSQL, objConn)
                For i = 0 To objRS.RecordCount - 1


                    If .EOF Then
                        'adding

                        '.Fields("HRVStudyGroup_2006").Value = True
                    Else
                        'updating
                        '===================================================
                        'Address 1
                        '====================================================
                        If Not DBNull.Value.Equals(.Fields("ADDRESS1").Value) Then
                            strStripped = StripHTML(.Fields("ADDRESS1").Value)
                            strStripped = StripUnprintable(strStripped)
                            strStripped = strStripped.Trim()
                            'strStripped = StripTags(.Fields("Notes").Value)
                            Console.WriteLine(strStripped)
                            .Fields("ADDRESS1").Value = strStripped
                        End If
                        '===================================================
                        'Address 2
                        '====================================================
                        If Not DBNull.Value.Equals(.Fields("ADDRESS2").Value) Then
                            strStripped = StripHTML(.Fields("ADDRESS2").Value)
                            strStripped = StripUnprintable(strStripped)
                            strStripped = strStripped.Trim()
                            'strStripped = StripTags(.Fields("Notes").Value)
                            Console.WriteLine(strStripped)
                            .Fields("ADDRESS2").Value = strStripped
                        End If

                        '===================================================
                        'Address 3
                        '====================================================
                        If Not DBNull.Value.Equals(.Fields("ADDRESS3").Value) Then
                            strStripped = StripHTML(.Fields("ADDRESS3").Value)
                            strStripped = StripUnprintable(strStripped)
                            strStripped = strStripped.Trim()
                            'strStripped = StripTags(.Fields("Notes").Value)
                            Console.WriteLine(strStripped)
                            .Fields("ADDRESS3").Value = strStripped
                        End If

                        '===================================================
                        'CITY
                        '====================================================
                        If Not DBNull.Value.Equals(.Fields("CITY").Value) Then
                            strStripped = StripHTML(.Fields("CITY").Value)
                            strStripped = StripUnprintable(strStripped)
                            strStripped = strStripped.Trim()
                            'strStripped = StripTags(.Fields("Notes").Value)
                            Console.WriteLine(strStripped)
                            .Fields("CITY").Value = strStripped
                        End If

                        '===================================================
                        'PROVINCE
                        '====================================================
                        If Not DBNull.Value.Equals(.Fields("STATE").Value) Then
                            strStripped = StripHTML(.Fields("STATE").Value)
                            strStripped = StripUnprintable(strStripped)
                            strStripped = strStripped.Trim()
                            'strStripped = StripTags(.Fields("Notes").Value)
                            Console.WriteLine(strStripped)
                            .Fields("STATE").Value = strStripped
                        End If

                        '===================================================
                        'POSTALCODE
                        '====================================================
                        If Not DBNull.Value.Equals(.Fields("POSTALCODE").Value) Then
                            strStripped = StripHTML(.Fields("POSTALCODE").Value)
                            strStripped = StripUnprintable(strStripped)
                            strStripped = strStripped.Trim()
                            'strStripped = StripTags(.Fields("Notes").Value)
                            Console.WriteLine(strStripped)
                            .Fields("POSTALCODE").Value = strStripped
                        End If

                        End If

                        .Update()
                        .MoveNext()
                Next
            End With
            objConn.Close()
            objRS = Nothing
            objConn = Nothing

        Catch ex As Exception
            Console.WriteLine(ex.Message)
            'Dim ErrorMessage As String = ""
            'ErrorMessage = " SubjectID =" & SubjectID & " RecordID=" & ID & "  Error Updating " & Field & " Value= " & Value & "....." & ex.Message & " " & Now
            'WriteErrorLog(SubjectID, ID, Field, Value, ex.Message)

        End Try
        Console.WriteLine("Complete")
    End Sub


    Private Function StripHTML(ByVal source As String) As String
        Try
            Dim result As String

            ' Remove HTML Development formatting
            ' Replace line breaks with space
            ' because browsers inserts space
            result = source.Replace(vbCr, " ")
            ' Replace line breaks with space
            ' because browsers inserts space
            result = result.Replace(vbLf, " ")
            ' Remove step-formatting
            result = result.Replace(vbTab, String.Empty)
            ' Remove repeating spaces because browsers ignore them
            result = System.Text.RegularExpressions.Regex.Replace(result, "( )+", " ")

            ' Remove the header (prepare first by clearing attributes)
            result = System.Text.RegularExpressions.Regex.Replace(result, "<( )*head([^>])*>", "<head>", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "(<( )*(/)( )*head( )*>)", "</head>", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "(<head>).*(</head>)", String.Empty, System.Text.RegularExpressions.RegexOptions.IgnoreCase)

            ' remove all scripts (prepare first by clearing attributes)
            result = System.Text.RegularExpressions.Regex.Replace(result, "<( )*script([^>])*>", "<script>", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "(<( )*(/)( )*script( )*>)", "</script>", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            'result = System.Text.RegularExpressions.Regex.Replace(result,
            '         @"(<script>)([^(<script>\.</script>)])*(</script>)",
            '         string.Empty,
            '         System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            result = System.Text.RegularExpressions.Regex.Replace(result, "(<script>).*(</script>)", String.Empty, System.Text.RegularExpressions.RegexOptions.IgnoreCase)

            ' remove all styles (prepare first by clearing attributes)
            result = System.Text.RegularExpressions.Regex.Replace(result, "<( )*style([^>])*>", "<style>", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "(<( )*(/)( )*style( )*>)", "</style>", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "(<style>).*(</style>)", String.Empty, System.Text.RegularExpressions.RegexOptions.IgnoreCase)

            ' insert tabs in spaces of <td> tags
            result = System.Text.RegularExpressions.Regex.Replace(result, "<( )*td([^>])*>", vbTab, System.Text.RegularExpressions.RegexOptions.IgnoreCase)

            ' insert line breaks in places of <BR> and <LI> tags
            result = System.Text.RegularExpressions.Regex.Replace(result, "<( )*br( )*>", vbCr, System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "<( )*li( )*>", vbCr, System.Text.RegularExpressions.RegexOptions.IgnoreCase)

            ' insert line paragraphs (double line breaks) in place
            ' if <P>, <DIV> and <TR> tags
            result = System.Text.RegularExpressions.Regex.Replace(result, "<( )*div([^>])*>", vbCr & vbCr, System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "<( )*tr([^>])*>", vbCr & vbCr, System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "<( )*p([^>])*>", vbCr & vbCr, System.Text.RegularExpressions.RegexOptions.IgnoreCase)

            ' Remove remaining tags like <a>, links, images,
            ' comments etc - anything that's enclosed inside < >
            result = System.Text.RegularExpressions.Regex.Replace(result, "<[^>]*>", String.Empty, System.Text.RegularExpressions.RegexOptions.IgnoreCase)

            ' replace special characters:
            result = System.Text.RegularExpressions.Regex.Replace(result, " ", " ", System.Text.RegularExpressions.RegexOptions.IgnoreCase)

            result = System.Text.RegularExpressions.Regex.Replace(result, "&bull;", " * ", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "&lsaquo;", "<", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "&rsaquo;", ">", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "&trade;", "(tm)", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "&frasl;", "/", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "&lt;", "<", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "&gt;", ">", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "&copy;", "(c)", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "&reg;", "(r)", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            ' Remove all others. More can be added, see
            ' http://hotwired.lycos.com/webmonkey/reference/special_characters/
            result = System.Text.RegularExpressions.Regex.Replace(result, "&(.{2,6});", String.Empty, System.Text.RegularExpressions.RegexOptions.IgnoreCase)

            ' for testing
            'System.Text.RegularExpressions.Regex.Replace(result,
            '       this.txtRegex.Text,string.Empty,
            '       System.Text.RegularExpressions.RegexOptions.IgnoreCase);

            ' make line breaking consistent
            result = result.Replace(vbLf, vbCr)

            ' Remove extra line breaks and tabs:
            ' replace over 2 breaks with 2 and over 4 tabs with 4.
            ' Prepare first to remove any whitespaces in between
            ' the escaped characters and remove redundant tabs in between line breaks
            result = System.Text.RegularExpressions.Regex.Replace(result, "(" & vbCr & ")( )+(" & vbCr & ")", vbCr & vbCr, System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "(" & vbTab & ")( )+(" & vbTab & ")", vbTab & vbTab, System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "(" & vbTab & ")( )+(" & vbCr & ")", vbTab & vbCr, System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            result = System.Text.RegularExpressions.Regex.Replace(result, "(" & vbCr & ")( )+(" & vbTab & ")", vbCr & vbTab, System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            ' Remove redundant tabs
            result = System.Text.RegularExpressions.Regex.Replace(result, "(" & vbCr & ")(" & vbTab & ")+(" & vbCr & ")", vbCr & vbCr, System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            ' Remove multiple tabs following a line break with just one tab
            result = System.Text.RegularExpressions.Regex.Replace(result, "(" & vbCr & ")(" & vbTab & ")+", vbCr & vbTab, System.Text.RegularExpressions.RegexOptions.IgnoreCase)
            ' Initial replacement target string for line breaks
            Dim breaks As String = vbCr & vbCr & vbCr
            ' Initial replacement target string for tabs
            Dim tabs As String = vbTab & vbTab & vbTab & vbTab & vbTab
            For index As Integer = 0 To result.Length - 1
                result = result.Replace(breaks, vbCr & vbCr)
                result = result.Replace(tabs, vbTab & vbTab & vbTab & vbTab)
                breaks = breaks & vbCr
                tabs = tabs & vbTab
            Next

            ' That's it.
            Return result
        Catch
            'MessageBox.Show("Error")
            Return source
        End Try
    End Function


    Public Function StripUnprintable(ByVal mystring As String) As String
        ' Removes tags from passed HTML
        Dim objRegEx As System.Text.RegularExpressions.Regex

        'Return objRegEx.Replace(HTML, "<[^>]*>", "")
        '"   QNS-FF-091 Magnetic CB
        Return objRegEx.Replace(mystring, "[\x00-\x1f]", "")
    End Function

End Module
