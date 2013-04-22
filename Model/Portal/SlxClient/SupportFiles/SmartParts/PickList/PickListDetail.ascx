<%@ Control  Language="C#" AutoEventWireup="true" CodeFile="PickListDetail.ascx.cs" Inherits="PickListDetail" %>
<%@ Register Assembly="Sage.SalesLogix.Client.GroupBuilder" Namespace="Sage.SalesLogix.Client.GroupBuilder" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>

<style type="text/css">
    .lblMsg
    {
        margin-left: 20px;
        font-style: italic;
        float: left;
	    font-size: 85%;
	    padding-top: .3em;
        width: 100%;
    }
</style>

<SalesLogix:SmartPartToolsContainer runat="server" ID="PicklistDetail_LTools" ToolbarLocation="right">
   <SalesLogix:GroupNavigator runat="server" ID="QFSLXGroupNavigator" ></SalesLogix:GroupNavigator>
    <asp:ImageButton runat="server" ID="btnSave" ToolTip="<%$ resources: btnSave.Caption %>" AlternateText="<%$ resources: btnSave.Caption %>"
        OnClientClick="var x = new Sage.UI.Controls.PickList({});x.clear(x._storageNameSpace);"
        ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Save_16x16" />
    <asp:ImageButton runat="server" ID="btnNew" ToolTip="<%$ resources: btnNew.Caption %>" AlternateText="<%$ resources: btnNew.Caption %>"
        ImageUrl="~\images\icons\plus_16X16.gif" />
    <asp:ImageButton runat="server" ID="btnDelete" ToolTip= "<%$ resources: btnDelete.Caption %>"  AlternateText="<%$ resources: btnDelete.Caption %>"
        ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Delete_16x16" />
    <SalesLogix:PageLink ID="lnkPicklistDetailHelp" runat="server" LinkType="HelpFileName"  ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help"
        NavigateUrl="Pick_List_Detail_View" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
    </SalesLogix:PageLink>
</SalesLogix:SmartPartToolsContainer>

<table border="0" cellpadding="1" cellspacing="0" class="formtable" >
    <col width="20%" />
    <col width="40%" />
    <col width="40%" />
    <tr>
        <td>
            <div class="lbl alignleft">
                <asp:Label ID="txtPicklistName_lbl" AssociatedControlID="txtPicklistName" runat="server" Text="<%$ resources: txtPicklistName.Caption %>"></asp:Label>
            </div>
        </td>
        <td>
            <div class="textcontrol">
                <asp:TextBox runat="server" ID="txtPicklistName" dojoType="Sage.UI.Controls.TextBox"></asp:TextBox>
            </div>
        </td>
        <td rowspan="7">
            <table border="0" cellpadding="1" cellspacing="0" class="wizardArea">
                <col width="50%" />
                <tr>
                    <td>
                        <div class="lbl alignleft">
                            <asp:Label ID="lblDefaultValue" AssociatedControlID="txtDefaultValue" runat="server" Text="<%$ resources: txtCurrentDefaultValue.Caption %>"></asp:Label>
                        </div>
                        <div class="textcontrol">
                            <asp:TextBox runat="server" ID="txtDefaultValue" ReadOnly="true" Enabled="False" dojoType="Sage.UI.Controls.TextBox"></asp:TextBox>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span class="lbl">
                            <asp:Label ID="lblTest" AssociatedControlID="pklTest" runat="server" Text="<%$ resources: txtTestList.Caption %>"></asp:Label>
                        </span>
                        <span class="textcontrol picklist">
                            <SalesLogix:PickListControl runat="server" ID="pklTest" AutoPostBack="false" />
                        </span>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td>
            <div class="lbl alignleft">
                <asp:Label ID="lblOptions" AssociatedControlID="chkRequired" runat="server" Text="<%$ resources: lblOptions %>"></asp:Label>
            </div>
        </td>
        <td>
            <div class="slxlabel alignleft checkbox">
                <SalesLogix:SLXCheckBox runat="server" ID="chkRequired" Text="<%$ resources: chkRequired.Caption %>" TextAlign="right"/>
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
       <td></td>
        <td>
            <div class="slxlabel alignleft checkbox">
                <SalesLogix:SLXCheckBox runat="server" ID="chkAllowMulltiple" Text="<%$ resources: chkAllowMulltiple.Caption %>" TextAlign="right"/>
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td>
            <div class="slxlabel alignleft checkbox">
                <SalesLogix:SLXCheckBox runat="server" ID="chkMustMatch" Text="<%$ resources: chkMustMatch.Caption %>" TextAlign="right" />
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td>
            <div class="slxlabel alignleft checkbox">
                <SalesLogix:SLXCheckBox runat="server" ID="chkSorted" Text="<%$ resources: chkSorted.Caption %>" TextAlign="right"/>
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td>
            <div class="slxlabel alignleft checkbox">
                <SalesLogix:SLXCheckBox runat="server" ID="chkUsersCanEdit" Text="<%$ resources: chkUsersCanEdit.Caption %>" TextAlign="right" />
            </div>
            <div class="lblMsg">
                <asp:Label ID="lblWindowsMsg1" AssociatedControlID="chkUsersCanEdit" runat="server" Text="<%$ resources: lblWindowsMsg1 %>"></asp:Label>
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
        <td>
            <div class="lbl alignleft">
                <asp:Label ID="lblWebOnly" AssociatedControlID="chkIsManaged" runat="server" Text="<%$ resources: lblWebOnly %>"></asp:Label>
            </div>
        </td>
        <td>
            <div class="slxlabel checkbox">
                <SalesLogix:SLXCheckBox runat="server" ID="chkIsManaged" Text="<%$ resources: chkIsManaged.Caption %>" TextAlign="right" />
            </div>
            <div class="lblMsg">
                <asp:Label ID="lblMsg2" AssociatedControlID="chkIsManaged" runat="server" Text="<%$ resources: lblWindowsMsg2 %>"></asp:Label>
            </div>
        </td>
    </tr>
</table>