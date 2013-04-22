<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ErrorPage.aspx.cs" Inherits="WebReporting.ErrorPage" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <link rel="stylesheet" type="text/css" href="css/sageStyles.css" />
    <style type="text/css">
        .msg { padding: 50px 50px; width: 700px; }
        .header { font-size : 150%; color: #01795E; }
    </style>
    <title meta:resourcekey="ErrorPageTitle">Sage SalesLogix Web Reporting</title>
</head>
<body>
    <form id="form1" runat="server">
    <div class="msg">
        <asp:Label CssClass="header" ID="lblTitle" runat="server" meta:resourcekey="CannotCompleteRequest" Text="We're sorry, your request could not be completed."></asp:Label>
        <br />
        <br />
        <asp:Label ID="lblMessage" runat="server" Text="We're sorry, you've encountered an error. If applicable, please try again."></asp:Label>
    </div>
    </form>
</body>
</html>
