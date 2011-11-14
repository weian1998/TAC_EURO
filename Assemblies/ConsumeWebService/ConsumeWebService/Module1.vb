

Module Module1

    Sub Main()

        Dim s1 As New MyService.Service1SoapClient

        Dim response As String = s1.ProcessEmailArchiveID("MyIDToTheWorld")

        Console.WriteLine(response)
        Console.Read()




    End Sub

End Module
