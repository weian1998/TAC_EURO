<%@ Control Language="C#" ClassName="AccountDetails" Inherits="Sage.Platform.WebPortal.SmartParts.EntityBoundSmartPartInfoProvider" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register TagPrefix="Saleslogix" Namespace="Sage.Platform.WebPortal.SmartParts" Assembly="Sage.Platform.WebPortal" %>
<%@ Import Namespace="Sage.Entity.Interfaces" %>
<%@ Import Namespace="Sage.Platform" %>
<%@ Import Namespace="Sage.Platform.Application" %>
<%@ Import Namespace="Sage.Platform.Application.Services" %>
<%@ Import Namespace="Sage.Platform.Application.UI" %>
<%@ Import Namespace="Sage.Platform.EntityBinding" %>
<%@ Import Namespace="Sage.Platform.WebPortal.SmartParts" %>
<%@ Import Namespace="Sage.SalesLogix.Security" %>
<%@ Import Namespace="Sage.SalesLogix.Entities" %>
<%@ Import Namespace="Sage.Platform.Security" %>

<Saleslogix:SmartPartToolsContainer runat="server" ID="WebAccess_Tools" ToolbarLocation="Right">
    <asp:ImageButton runat="server" ID="Save" Text="Save" ToolTip="Save" ImageUrl="~/images/icons/Save_16x16.gif" meta:resourcekey="SaveResource1" />
    <SalesLogix:PageLink ID="WebAccessHelpLink" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="csrconwebaccesstab.aspx" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16"></SalesLogix:PageLink>
</Saleslogix:SmartPartToolsContainer>

<table border="0" cellpadding="1" cellspacing="0" class="formtable">
  <col width="50%" /><col width="50%" /><tr>
<td >
           <span class="lbl"><asp:Label ID="lblWebAccess" AssociatedControlID="chkWebAccess" runat="server" Text="Web Access" meta:resourcekey="lblWebAccessResource1"></asp:Label></span>
<span >
<asp:CheckBox runat="server" ID="chkWebAccess" meta:resourcekey="chkWebAccessResource1" />
</span>
</td>
  <td >
           <span class="lbl"><asp:Label ID="lblNewPassword" AssociatedControlID="txtNewPassword" runat="server" Text="New Password:" meta:resourcekey="lblNewPasswordResource1"></asp:Label></span>
<span   class="textcontrol">
<asp:TextBox runat="server" ID="txtNewPassword" TextMode="Password" meta:resourcekey="txtNewPasswordResource1" />

</span>
</td>
  </tr>
<tr><td >
           <span class="lbl"><asp:Label ID="lblUserName" AssociatedControlID="txtWebUserName" runat="server" Text="User Name:" meta:resourcekey="lblUserNameResource1"></asp:Label></span>
<span   class="textcontrol">
<asp:TextBox runat="server" ID="txtWebUserName" MaxLength="30" meta:resourcekey="txtWebUserNameResource1" />

</span>
</td>
  <td >
           <span class="lbl"><asp:Label ID="lblRepeatNewPassword" AssociatedControlID="txtRepeatNewPassword" runat="server" Text="Repeat New Password:" meta:resourcekey="lblRepeatNewPasswordResource1"></asp:Label></span>
<span   class="textcontrol">
<asp:TextBox runat="server" ID="txtRepeatNewPassword" TextMode="Password" meta:resourcekey="txtRepeatNewPasswordResource1" />

</span>
</td>
  </tr>
<tr><td colspan="2" style="padding:5px 0px;">

<span >
<hr />


</span>
</td>
  </tr>
<tr><td colspan="2" >
           <span class="twocollbl"><asp:Label ID="lblPasswordHint" AssociatedControlID="txtWebPasswordHint" runat="server" Text="Password Hint:" meta:resourcekey="lblPasswordHintResource1"></asp:Label></span>
<span  class="twocoltextcontrol" >
<asp:TextBox runat="server" ID="txtWebPasswordHint" MaxLength="64" meta:resourcekey="txtWebPasswordHintResource1" />

</span>
</td>
  </tr>
<tr><td >


</td>
  </tr>
</table>

<script runat="server" type="text/C#">

    /// <summary>
    /// Gets or sets the role security service.
    /// </summary>
    /// <value>The role security service.</value>
    [ServiceDependency]
    public IRoleSecurityService RoleSecurityService { get; set; }

    public override Type EntityType
    {
        get { return typeof (IContact); }
    }

    protected override void OnAddEntityBindings()
    {
        BindingSource.AddBindingProvider(txtWebUserName as IEntityBindingProvider);
        BindingSource.Bindings.Add(new PropertyBinding("WebUserName", txtWebUserName, "Text"));
        BindingSource.AddBindingProvider(txtWebPasswordHint as IEntityBindingProvider);
        BindingSource.Bindings.Add(new PropertyBinding("WebPasswordHint", txtWebPasswordHint, "Text"));
    }

    protected void Save_ClickAction(object sender, EventArgs e)
    {
        object[] objarray = new object[]
        {
            BindingSource.Current,
            chkWebAccess.Checked,
            txtNewPassword.Text,
            txtRepeatNewPassword.Text
        };
        object passthru = EntityFactory.Execute<Contact>("Contact.SaveWebAccess", objarray);
        if (passthru != null)
        {
            WebActionEventArgs args = new WebActionEventArgs(passthru);
            Save_ClickActionBRC(sender, args);
        }
        else
        {
            Save_ClickActionBRC(sender, e);
        }
    }

    protected void Save_ClickActionBRC(object sender, EventArgs e)
    {
        WebActionEventArgs args = e as WebActionEventArgs;
        if (args != null && !string.IsNullOrEmpty(args.PassThroughObject.ToString()))
        {
            if (DialogService != null)
            {
                DialogService.ShowMessage(args.PassThroughObject.ToString());
            }
        }
    }

    protected void quickformload0(object sender, EventArgs e)
    {
        Boolean bIsAdmin;
        Boolean bIsWebAdmin;
        Boolean bEnableControl;
        string strOption;
        SLXUserService userService = ApplicationContext.Current.Services.Get<IUserService>() as SLXUserService;
        var userOptions = ApplicationContext.Current.Services.Get<IUserOptionsService>(true);
        strOption = userOptions.GetPlatformOption("CONTEXT:webticketcust", "", false, "n", "", EntityContext.EntityID.ToString());
        if (!string.IsNullOrEmpty(strOption))
        {
            chkWebAccess.Checked = (strOption.Trim().ToUpper() == "Y");
        }
        else
        {
            chkWebAccess.Checked = false;
        }

        txtNewPassword.Text = "";
        txtRepeatNewPassword.Text = "";

        bIsAdmin = (userService.UserId.Trim().ToUpper() == "ADMIN");
        bIsWebAdmin = false;
        bEnableControl = false;
        if (!bIsAdmin)
        {
            IUser userContext = userService.GetUser();
            if (userContext != null)
            {
                bIsWebAdmin = userContext.IsWebAdmin ?? false;
            }
        }
        /* Users can make changes only if they are the Admin or if they are a Web Admin. */
        bEnableControl = (bIsAdmin || bIsWebAdmin);
        chkWebAccess.Enabled = bEnableControl;
        txtNewPassword.Enabled = bEnableControl;
        txtRepeatNewPassword.Enabled = bEnableControl;
        txtWebPasswordHint.Enabled = bEnableControl;
        txtWebUserName.Enabled = bEnableControl;
    }

    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        if (RoleSecurityService != null)
            if (RoleSecurityService.HasAccess("ENTITIES/CONTACT/EDIT"))
                Save.Click += Save_ClickAction;
            else
                Save.Visible = false;
    }

    protected override void OnFormBound()
    {
        object sender = this;
        EventArgs e = EventArgs.Empty;
        quickformload0(sender, e);
        base.OnFormBound();
    }

    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in WebAccess_Tools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

</script>

