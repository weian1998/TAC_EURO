<%@ Page Language="C#" AutoEventWireup="true" EnableSessionState="False" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title><asp:Literal ID="Literal1" runat="server" Text="<%$ Resources:Title%>" /></title>
    <script type="text/javascript" src="https://www.google.com/jsapi?autoload=%7B%22modules%22%3A%5B%7B%22name%22%3A%22gdata%22%2C%22version%22%3A%222%22%7D%5D%7D"></script>
    <script type="text/javascript">
    (function () {
        if (!window.opener) {
            close();
            return;
        }
        var googleAuth = window.opener.googleAuthModule;
        if (typeof googleAuth == "undefined") {
            // this could happen if they got logged from SLX in the meantime.
            // don't bother reporting the error, just close the window.
            close();
            return;
        }
        var scope = googleAuth.scope;

        google.setOnLoadCallback(function () {
            var status = google.accounts.user.getStatus();
            if (status == google.accounts.AuthSubStatus.LOGGING_IN) {
                // User is in the process of logging in, do nothing.
                return;
            } else if (status == google.accounts.AuthSubStatus.LOGGED_OUT || !google.accounts.user.checkLogin(scope)) {
                google.accounts.user.login(scope);
            } else {
                if (google.accounts.user.checkLogin(scope)) {
                    googleAuth.onLoggedIn();
                    window.close();
                }
            }
        });
    })();
    </script>
</head>
<body>
    <form id="form1" runat="server">
    <div>
        <asp:Label runat="server" Text="<%$ Resources:LoadingGoogleAuth %>" />
    </div>
    </form>
</body>
</html>
