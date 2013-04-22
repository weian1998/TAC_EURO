<%@ Page Language="C#" AutoEventWireup="true" CodeFile="WinAuthLoad.aspx.cs" Inherits="WinAuthLoad" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="SalesLogix" %>

<SalesLogix:ScriptResourceProvider runat="server" ID="WinAuthLoadStrings" >
    <Keys>
        <SalesLogix:ResourceKeyName Key="Err_TimeZone" />
    </Keys>
</SalesLogix:ScriptResourceProvider>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" >
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>Sage SalesLogix</title>

    <style type="text/css">
        #splashimg 
        {
            border: 1px solid #cccccc;
            background-image : url(images/icons/base_splash_screen.jpg);
            background-repeat:no-repeat;
            width:600px;
            height:400px;
            z-index:0;
            margin-left: auto;
            margin-right : auto;
            margin-top : 50px;
        }        
        #lblLoading 
        {
            margin-left: 45px;
            margin-top: 120px;
            left: inherit;
            top: inherit;         
            height: 20px;            
            position: absolute;
            font-weight:  bolder;
            font-family: "Arial Unicode MS", Arial, Helvetica, sans-serif;
            color: #2a405b;
            font-size: 110%;
            font-weight : normal;
        }     
    </style>

    <script pin="pin" type="text/javascript" src="Libraries/dojo/dojo/dojo.js"></script>
    <%--jQuery is required by timezone.js--%>
    <script pin="pin" src="Libraries/jQuery/jquery.js" type="text/javascript"></script>  
    <%--timezone.js calls SetWinAuthTimeZone() in $(document).ready()--%> 
    <script pin="pin" src="jscript/timezone.js" type="text/javascript"></script>
    <script type="text/javascript">
        function SetWinAuthTimeZone(tzInfo) {
            var sTzInfo = tzInfo || '';
            if (dojo.isString(sTzInfo) && sTzInfo.length > 0) {
                sTzInfo = encodeURIComponent(sTzInfo);
            }
            var fnGoToSlxClient = function () {
                var btn = document.getElementById('Button1');
                btn.click();
            };
            dojo.xhrGet({
                url: 'SLXWinAuthenication.aspx?loadtz=true&tz_info=' + sTzInfo,
                preventCache: true,
                load: function (data) {
                    fnGoToSlxClient();
                },
                error: function (err) {
                    alert(WinAuthLoadStrings.Err_TimeZone + ' ' + err.message);
                    fnGoToSlxClient();
                    return err;
                }
            });
        }
    </script>
</head>
<body>
    <form id="form1" runat="server">
        <div id="splashimg">
        <asp:Label ID="lblLoading" Text="<%= resources: Msg_Loading %>" runat="server">Loading...</asp:Label>
        <asp:HiddenField ID="HiddenField1" runat="server" />
        <asp:Button ID="Button1" runat="server" OnClick="Button1_Click" Text="Button" style="display:none"/>
        </div>
    </form>
</body>
</html>

