<%@ Control Language="C#" AutoEventWireup="true" CodeFile="AddUsers.ascx.cs" Inherits="AddUsers" %>
<%@ Register Assembly="Sage.SalesLogix.Client.GroupBuilder" Namespace="Sage.SalesLogix.Client.GroupBuilder" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Timeline" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="AddUsers_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkAddUsersHelp" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help"
            NavigateUrl="Adding_a_User" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">&nbsp;&nbsp;&nbsp;&nbsp;
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<div runat="server" ID="divStep1">
    <table border="0" cellpadding="0" cellspacing="0" class="formtable">
        <col width="20%"/>
        <col width="40%"/>
        <col width="40%"/>
        <tr>
            <td>
                <div class=" lbl alignleft">
                    <asp:Label ID="lbxUserType_lbl" AssociatedControlID="lbxUserType" runat="server" Text="<%$ resources: lbxUserType.Caption %>"></asp:Label>
                </div>
            </td>
            <td>
                <div class="textcontrol select">
                    <asp:ListBox runat="server" ID="lbxUserType" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1" AutoPostBack="true" OnTextChanged= "UserType_OnTextChanged"></asp:ListBox>
                </div>
            </td>
            <td></td>
        </tr>
        <tr>
            <td>
                <div class=" lbl alignleft">
                    <asp:Label ID="numQuantity_lbl" AssociatedControlID="ddlQuantity" runat="server" Text="<%$ resources: numQuantity.Caption %>"></asp:Label>
                </div>
            </td>
            <td>
                <div class="textcontrol numeric">
                    <asp:DropDownList runat="server" ID="ddlQuantity" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" AutoPostBack="true" EnableViewState="true">
                        <asp:ListItem Text="1" Value="1" Selected="true"></asp:ListItem>
                        <asp:ListItem Text="2" Value="2"></asp:ListItem>
                        <asp:ListItem Text="3" Value="3"></asp:ListItem>
                        <asp:ListItem Text="4" Value="4"></asp:ListItem>
                        <asp:ListItem Text="5" Value="5"></asp:ListItem>
                        <asp:ListItem Text="6" Value="6"></asp:ListItem>
                        <asp:ListItem Text="7" Value="7"></asp:ListItem>
                        <asp:ListItem Text="8" Value="8"></asp:ListItem>
                        <asp:ListItem Text="9" Value="9"></asp:ListItem>
                        <asp:ListItem Text="10" Value="10"></asp:ListItem>
                    </asp:DropDownList>
                </div>
            </td>
            <td></td>
        </tr>
        <tr>
            <td>
                <div>
                    <asp:Button CssClass="slxbutton" runat="server" ID="btnRefreshLic" Text="<%$ resources: btnRefreshLic.Caption %>" OnClick="RefreshLic_Click"/>
                </div>
            </td>
            <td>
                <div class="slxLabel">
                    <asp:Label runat="server" ID="lblAvailableLic" Text="<%$ resources: lblAvailableLic.Text %>" style="font-weight:bold"/>
                </div>
            </td>
            <td></td>
        </tr>
        <tr>
            <td></td>
        </tr>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" class="formtable">
        <col width="20%"/>
        <col width="40%"/>
        <col width="40%"/>
        <tr>
            <td colspan="3">
                <div class="mainContentHeader2">
                    <span id="QFHorizontalSeparator">
                        <asp:Localize ID="Localize1" runat="server" Text="<%$ resources: CreateFromProfile2.Caption %>"></asp:Localize>
                    </span>
                </div>
            </td>
            <td></td>
            <td></td>
         </tr>
         <tr>
            <td>
                <div class="slxlabel  alignleft checkbox">
                    <SalesLogix:SLXCheckBox runat="server" ID="chkCreateFromProfile" CssClass="checkbox" Text="<%$ resources: chkCreateFromProfile.Caption %>" shouldPublishMarkDirty="false" AutoPostBack="true" LabelPlacement="right" />
                </div>
            </td>
            <td style="padding-left: 0">
                <div>
                    <fieldset class="slxlabel radio" style="padding-left: 0">
                        <asp:RadioButtonList runat="server" ID="rdoProfileFrom" RepeatDirection="Vertical" AutoPostBack="true" CellPadding="0" CssClass="radioGroup">
                            <asp:ListItem Text="<%$ resources: rdoProfileFrom_item0.Text %>" Value="T" Selected="True"/>
                            <asp:ListItem Text="<%$ resources: rdoProfileFrom_item1.Text %>" Value="U"/>
                        </asp:RadioButtonList>
                    </fieldset>
                </div>
            </td>
            <td></td>
         </tr>
         <tr>
            <td><br /></td>
            <td></td>
            <td></td>
         </tr>
         <tr>
            <td>
                <div id="div_Templates_lbl" runat="server">
                    <div class=" lbl alignleft">
                        <asp:Label ID="lbxTemplates_lbl" AssociatedControlID="lbxTemplates" runat="server" Text="<%$ resources: lbxTemplates.Caption %>"></asp:Label>
                    </div>
                </div>
                <div id="div_Users_lbl" runat="server">
                    <div class=" lbl alignleft">
                        <asp:Label ID="User_lbl" AssociatedControlID="lueAddUser" runat="server" Text="<%$ resources: QFSLXUser.Caption %>"></asp:Label>
                    </div>
                </div>
            </td>
            <td>
                <div id="div_Templates_Ctrl" runat="server">
                    <div class="textcontrol select">
                        <asp:DropDownList runat="server" ID="lbxTemplates" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false"></asp:DropDownList>
                    </div>
                </div>
                <div id="div_Users_Ctrl" runat="server" class="textcontrol lookup">
                    <SalesLogix:LookupControl runat="server" ID="lueAddUser" AutoPostBack="true" OverrideSeedOnSearch="true" LookupBindingMode="string"
                        ButtonToolTip="<%$ resources: QFSLXUser.ButtonToolTip %>" LookupEntityName="User" InitializeLookup="true"
                        LookupEntityTypeName="Sage.Entity.Interfaces.IUser, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null">
                    <LookupProperties>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueAddUser.LookupProperties.UserInfo.UserName.PropertyHeader %>" PropertyName="UserInfo.UserName" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueAddUser.LookupProperties.UserInfo.Title.PropertyHeader %>" PropertyName="UserInfo.Title" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueAddUser.LookupProperties.UserInfo.Department.PropertyHeader %>" PropertyName="UserInfo.Department" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueAddUser.LookupProperties.UserInfo.Region.PropertyHeader %>" PropertyName="UserInfo.Region" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueAddUser.LookupProperties.Type.PropertyHeader %>" PropertyName="Type" PropertyType="Sage.Entity.Interfaces.UserType" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                    </LookupProperties>
                    <LookupPreFilters>
                        <SalesLogix:LookupPreFilter PropertyName="Type" PropertyType="Sage.Entity.Interfaces.UserType" OperatorCode="!=" FilterValue="5"></SalesLogix:LookupPreFilter>
                        <SalesLogix:LookupPreFilter PropertyName="Type" PropertyType="Sage.Entity.Interfaces.UserType" OperatorCode="!=" FilterValue="6"></SalesLogix:LookupPreFilter>
                        <SalesLogix:LookupPreFilter PropertyName="Type" PropertyType="Sage.Entity.Interfaces.UserType" OperatorCode="!=" FilterValue="7"></SalesLogix:LookupPreFilter>
                        <SalesLogix:LookupPreFilter PropertyName="Type" PropertyType="Sage.Entity.Interfaces.UserType" OperatorCode="!=" FilterValue="8"></SalesLogix:LookupPreFilter>
                    </LookupPreFilters>
                    </SalesLogix:LookupControl>
                </div>
                <div id="div_Req" runat="server" style="float:left; color:red; font-weight:bold; margin-right:2px">
                    <asp:Label ID="Label1" runat="server">*</asp:Label>
                </div>
            </td>
            <td></td>
        </tr>
        <tr>
            <td><br/></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>
                <div class="slxlabel"><asp:Label runat="server" ID="lblTabOptions" Text="<%$ resources: lblTabOptions.Text %>"/></div>
            </td>
            <td>
                <div class="slxlabel  alignleft checkbox">
                    <SalesLogix:SLXCheckBox runat="server" ID="chkGeneral" LabelPlacement="right" CssClass="checkbox" Text="<%$ resources: chkGeneral.Caption %>" shouldPublishMarkDirty="false" Checked="true"/>
                </div>
            </td>
            <td>
                <div class="slxlabel  alignleft checkbox">
                    <SalesLogix:SLXCheckBox runat="server" ID="chkCalender" LabelPlacement="right" CssClass="checkbox" Text="<%$ resources: chkCalender.Caption %>" shouldPublishMarkDirty="false" Checked="true"/>
                </div>
            </td>
        </tr>
        <tr>
            <td></td>
            <td>
                <div class="slxlabel  alignleft checkbox">
                    <SalesLogix:SLXCheckBox runat="server" ID="chkEmployee" LabelPlacement="right" CssClass="checkbox " Text="<%$ resources: chkEmployee.Caption %>" shouldPublishMarkDirty="false" Checked="true"/>
                </div>
            </td>
            <td>
                <div class="slxlabel  alignleft checkbox">
                    <SalesLogix:SLXCheckBox runat="server" ID="chkServiceAndSupport" LabelPlacement="right" CssClass="checkbox" Text="<%$ resources: chkServiceAndSupport.Caption %>" shouldPublishMarkDirty="false" Checked="true"/>
                </div>
            </td>
        </tr>
        <tr>
            <td></td>
            <td>
                <div class="slxlabel  alignleft checkbox">
                    <SalesLogix:SLXCheckBox runat="server" ID="chkSecurity" LabelPlacement="right" CssClass="checkbox" Text="<%$ resources: chkSecurity.Caption %>" shouldPublishMarkDirty="false" Checked="true"/>
                </div>
            </td>
            <td>
                <div class="slxlabel  alignleft checkbox">
                    <SalesLogix:SLXCheckBox runat="server" ID="chkClientOptions" LabelPlacement="right" CssClass="checkbox" Text="<%$ resources: chkClientOptions.Caption %>" shouldPublishMarkDirty="false" Checked="true"/>
                </div>
            </td>
        </tr>
        <tr>
            <td></td>
            <td>
                <div class="slxlabel  alignleft checkbox">
                    <SalesLogix:SLXCheckBox runat="server" ID="chkTeams" LabelPlacement="right" CssClass="checkbox" Text="<%$ resources: chkTeams.Caption %>" shouldPublishMarkDirty="false" Checked="true"/>
                </div>
            </td>
            <td></td>
        </tr>
        <tr>
            <td> <br /> </td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td align="left">
                <asp:Button CssClass="slxbutton" runat="server" ID="btnOk" Text="<%$ resources: btnOk.Caption %>"/>
                <asp:Button CssClass="slxbutton" runat="server" ID="btnCancel" Text="<%$ resources: btnCancel.Caption %>" OnClick="CANCEL_Click"/>
            </td>
        </tr>
    </table>
</div>

<div class="panel" runat="server" ID="divStep2" style="display:none; height:100%">
    <br />
    <br />
    <br />
    <br />
    <br />
</div>

<script type="text/javascript" language="javascript">
    dojo.require("Sage.UI.Dialogs");

    function addUser_OkClick(divStep1Id, divStep2Id, message) {
        var opts = { title: "Sage SalesLogix", pct: 10, maximum: 100, width: 325, height: 125, showmessage: true, message: message, canclose: false, indeterminate: true };
        Sage.UI.Dialogs.showProgressBar(opts);
    }

    function hideMask() {
        Sage.UI.Dialogs.closeProgressBar();
    }
    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(hideMask);
</script>