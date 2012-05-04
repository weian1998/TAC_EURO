<%@ Page Language="C#" MasterPageFile="~/Masters/Login.master" AutoEventWireup="true" Culture="auto" UICulture="auto" EnableEventValidation="false"%>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="SalesLogix" %>
<%@ Import Namespace="Sage.Platform.Application"%>

<asp:Content ID="Content1" runat="server" ContentPlaceHolderID="ContentPlaceHolderArea" >

<script type="text/javascript">
$(document).ready(function() {
    initGears();
    if (Sage.gears) {
        //to disable the Enhance SalesLogix button, remove the comments from the following line:
        //$(".enhanceButton").attr('disabled', 'disabled');
        
        //to hide the whole thing...
        //$('#ExtFeatures').css('visibility','hidden');
        
        //to hide the "click to download" message:
        //$('.clicktodownload').css('visibility', 'hidden');
        //change the message:
        $('.clicktodownload').text(LoginStrings.EnhancementsAreInstalled || 'Enhancements have been installed');
    }
});

</script>
<SalesLogix:ScriptResourceProvider runat="server" ID="LoginStrings" >
    <Keys>
        <SalesLogix:ResourceKeyName Key="EnhancementsAreInstalled" />
    </Keys>
</SalesLogix:ScriptResourceProvider>


    <asp:Login ID="slxLogin" runat="server" CssClass="slxlogin"
        DestinationPageUrl="Default.aspx" OnPreRender="PreRender"
        Font-Names="Arial,Verdana,Sans-sarif" Font-Size="0.8em" ForeColor="#000000" >

        <LayoutTemplate>
            <div id="splashimg">
                <div id="LoginForm">
                    <div id="LoginLeftCol">
                        <div>
                            <asp:Label ID="UserNameLabel" runat="server" AssociatedControlID="UserName" Text="<%$ resources: UserName %>" ></asp:Label>
                        </div>
                        <asp:Label ID="PasswordLabel" runat="server" AssociatedControlID="Password" Text="<%$ resources: Password %>" ></asp:Label>
                    </div>
                    <div id="LoginRightCol">
                        <asp:TextBox ID="UserName" runat="server" CssClass="editCtl" ></asp:TextBox>
                        <asp:RequiredFieldValidator ID="UserNameRequired" runat="server" ControlToValidate="UserName"
                            ErrorMessage="<%$ resources: UserNameRequired %>" ToolTip="<%$ resources: UserNameRequired %>" ValidationGroup="slxLogin" Text="<%$ resources: asterisk %>"></asp:RequiredFieldValidator>
                        <br />
                        <asp:TextBox ID="Password" runat="server" CssClass="editCtl" TextMode="Password" AutoComplete="off"></asp:TextBox>
                        <asp:Button ID="btnLogin" runat="server"  CommandName="Login" CssClass="okButton" Text="<%$ resources: LogOn %>" ValidationGroup="slxLogin" />
                        <div id="RememberMe">
                            <asp:CheckBox ID="chkRememberMe" runat="server" Checked="false" Text="<%$ resources: RememberMe %>" />
                        </div>
                        <div id="loginMsgRow" class="loginmsg">
                            <asp:Literal ID="FailureText" runat="server" EnableViewState="False" ></asp:Literal>
                            &nbsp;
                        </div>
                        <div id="ExtFeatures">
                            <asp:Button ID="btnEnhance" runat="server" CssClass="enhanceButton" UseSubmitBehavior="false" Text="<%$ resources: EnhanceSalesLogix %>"
                                OnClientClick="Sage.installDesktopFeatures(); return false;//" />
                            <SalesLogix:PageLink runat="server" ID="findoutmorelink" LinkType="HelpFileName" NavigateUrl="desktopintegration" Text="<%$ resources: FindOutMore %>" CssClass="findoutmoretext" Target="MCWebHelp" ></SalesLogix:PageLink>
                            <div class="settings">
                                <asp:Label ID="clicktodownload" runat="server" Text="<%$ resources: ClickToDownload %>" CssClass="clicktodownload"></asp:Label>
                            </div>
                        </div>                 
                        <div id="VersionSection">
                            <asp:Label ID="VersionLabel" runat="server" Text="Version"></asp:Label>
                            <div class="info">
                                <div><asp:Label ID="Copyright" runat="server" Text="<%$ resources: Copyright %>"></asp:Label></div>
                                <div><asp:Label ID="Sage" runat="server" Text="<%$ resources: SageSoftwareInc %>"></asp:Label></div>
                                <div><asp:Label ID="Rights" runat="server" Text="<%$ resources: AllRightsReserved %>"></asp:Label></div>
                            </div>					    
                        </div> 
                    </div>
                </div>          
            </div>
        </LayoutTemplate>
    </asp:Login>
</asp:Content>

<script type="text/C#" runat="server">
    protected void Page_Load(object sender, EventArgs e)
    {
 
        System.Web.UI.WebControls.CheckBox rememberMe = (System.Web.UI.WebControls.CheckBox)slxLogin.Controls[0].FindControl("chkRememberMe");
        System.Web.UI.WebControls.TextBox userName = (System.Web.UI.WebControls.TextBox)slxLogin.Controls[0].FindControl("UserName");
        if (IsPostBack)
        {
            HttpCookie cookieRememberMe = new HttpCookie("SLXRememberMe");
            cookieRememberMe.Value = (rememberMe.Checked ? "T" : "F");
            cookieRememberMe.Expires = DateTime.Now.AddDays(14);
            Response.Cookies.Add(cookieRememberMe);
            
            if (rememberMe.Checked)
            {
                HttpCookie cookieUserName = new HttpCookie("SLXUserName");
                cookieUserName.Value = Server.UrlEncode(userName.Text);
                cookieUserName.Expires = DateTime.Now.AddDays(14);
                Response.Cookies.Add(cookieUserName);
            }
        }
        else
        {
            CheckClearListViewState();
            
            if (Request.Cookies["SLXRememberMe"] != null)
            {
                rememberMe.Checked = (Request.Cookies["SLXRememberMe"].Value == "T");
                if ((rememberMe.Checked) && (Request.Cookies["SLXUserName"] != null))
                {
                    userName.Text = Server.UrlDecode(Request.Cookies["SLXUserName"].Value);
                }
            }
            ClearOldSession();
        }
        SetVersion();

        userName.Focus();
    }

    private void ClearOldSession()
    {
        string[] cookiesToDelete = {"SlxCalendar", "SlxCalendarASP"};
        foreach (string val in cookiesToDelete)
        {
            HttpCookie delCookie = new HttpCookie(val);
            delCookie.Expires = DateTime.Now.AddDays(-1d);
            Response.Cookies.Add(delCookie);
            Request.Cookies.Remove(val);
        }
        Session.Abandon();
    }

    protected new void PreRender(object sender, EventArgs e)
    {
        object msg = Sage.Platform.Application.ApplicationContext.Current.State["AuthError"];
        if (msg != null)
        {
            Sage.Platform.Application.ApplicationContext.Current.State.Remove("AuthError");
            
            Literal FailureText = (Literal)slxLogin.FindControl("FailureText");
            FailureText.Text = msg.ToString();
        }
    }
    private void SetVersion()
    {
        Version version = typeof(Sage.SalesLogix.Web.SLXMembershipProvider).Assembly.GetName().Version;
        Label lblVersion = (Label)slxLogin.FindControl("VersionLabel");
        lblVersion.Text = String.Format("{0} {1}", GetLocalResourceObject("VersionLabelResource1.Text").ToString(), version.ToString());
    }
    private void CheckClearListViewState()
    {
        var setting = System.Web.Configuration.WebConfigurationManager.AppSettings["ClearListViewPersonalizationOnLogin"];
        if (setting != null && setting == "true")
        {
            Page.ClientScript.RegisterClientScriptInclude("extJQueryAdapter", "Libraries/ext/adapter/jquery/ext-jquery-adapter.js");
            Page.ClientScript.RegisterClientScriptInclude("extAll", "Libraries/ext/ext-all.js");
            var script = @"
$(document).ready(function() {
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
    var cookies = document.cookie.split('; ');
    for (var i = 0; i < cookies.length; i++) {
        var cookieName = cookies[i].split('=')[0];
        if (cookieName.indexOf('MainList_list_') > -1) {
            Ext.state.Manager.clear(cookieName.replace('ys-', ''));
        }
    }
});";
            Page.ClientScript.RegisterClientScriptBlock(GetType(), "clearListSettings", script, true);
        }
    }
    
    
</script>