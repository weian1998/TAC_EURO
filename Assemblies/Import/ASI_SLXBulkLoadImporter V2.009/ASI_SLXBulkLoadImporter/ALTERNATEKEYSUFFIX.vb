Module ALTERNATEKEYSUFFIX
    Public Function PRETTYALTERNATEKEYSUFFIX(ByVal TicketID As String) As String
        Dim sBase36Key As String
        Dim sBase10Suffix As String
        sBase36Key = Right(TicketID, 5)
        sBase10Suffix = baseN2dec(sBase36Key, 36)
        If sBase10Suffix.Length < 6 Then
            Dim i As Integer
            For i = 0 To (6 - sBase10Suffix.Length) - 1
                'Add a Zero to the Beginning
                sBase10Suffix = "0" & sBase10Suffix
            Next
        End If
        'MsgBox("Key Suffix is " & sBase10Suffix)
        Return sBase10Suffix
    End Function
    Function baseN2dec(ByVal value, ByVal inBase)
        'Converts any base to base 10

        Dim strValue, i, x, y

        strValue = StrReverse(CStr(UCase(value)))

        For i = 0 To len(strValue) - 1
            x = mid(strValue, i + 1, 1)
            If Not isNumeric(x) Then
                y = y + ((Asc(x) - 65) + 10) * (inBase ^ i)
            Else
                y = y + ((inBase ^ i) * CInt(x))
            End If
        Next

        baseN2dec = y

    End Function

End Module
