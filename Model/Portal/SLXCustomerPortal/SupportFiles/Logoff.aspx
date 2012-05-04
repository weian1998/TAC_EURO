<%@ Page Title="SalesLogix Logoff" Language="C#" MasterPageFile="~/Masters/Login.master" %>

<script runat="server">

    protected void Page_Load(object sender, EventArgs e)
    {
        btnLogin.Focus();
    }
</script>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolderArea" Runat="Server">

<div id="LogoffContainer">
    <div id="splashimg">
        <div id="LogoffForm">
	        <div id="LogoffTitle"><%= GetLocalResourceObject("LogoffTitle") %></div>
            <div id="LogoffMessage"><%= GetLocalResourceObject("LogoffMessage") %></div>
            <div id="LogoffFormButtonPanel">
                <asp:Button ID="btnLogin" runat="server" PostBackUrl="~/Login.aspx" 
                    Text="<%$ resources: LogOn %>" ValidationGroup="slxLogin" />
            </div>
        </div>
    </div>
</div>      
</asp:Content>

