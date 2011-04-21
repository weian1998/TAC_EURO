<%@ Control Language="C#" AutoEventWireup="true" CodeFile="CopyProfileParameters.ascx.cs" Inherits="CopyProfileParameters" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls"
    TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes"
    TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts"
    TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>    
<p>&nbsp;</p>
<div>
    <asp:Literal ID="litDialogInfo" runat="server" Text="<%$ resources: dialogInfo %>"></asp:Literal>
</div>
<p>&nbsp;</p>
<div>
    <asp:Literal ID="litSourceLabel" runat="server" Text="<%$ resources: sourceLabel %>"></asp:Literal>
    <asp:RadioButton GroupName="UserTypeRadioGroup" runat="server" ID="userOption" 
        onclick='$("#ctl00_DialogWorkspace_CopyUserProfile_copyProfileParameter_userListContainer").css("display","inline"); 
        $("#ctl00_DialogWorkspace_CopyUserProfile_copyProfileParameter_templateListContainer").css("display","none"); 
        $("#ctl00_DialogWorkspace_CopyUserProfile_copyProfileParameter_lblMessage").css("display", "none");' 
        Text="<%$ resources: SourceSelectionContainer_item0.Text %>" />
    <asp:RadioButton GroupName="UserTypeRadioGroup" runat="server" ID="templateOption" 
    onclick='$("#ctl00_DialogWorkspace_CopyUserProfile_copyProfileParameter_userListContainer").css("display","none"); 
    $("#ctl00_DialogWorkspace_CopyUserProfile_copyProfileParameter_templateListContainer").css("display","inline"); 
    $("#ctl00_DialogWorkspace_CopyUserProfile_copyProfileParameter_lblMessage").css("display", "none");' 
    Text="<%$ resources: SourceSelectionContainer_item1.Text %>" />
 </div>
<p>&nbsp;</p>
<div id="sourceTypeContainer">
    <div id="userListContainer" runat="server" style="display: inline">
        <asp:Literal ID="Literal3" runat="server" Text="<%$ resources: SourceUserList.Caption %>"></asp:Literal>&nbsp;
           <SalesLogix:LookupControl runat="server" ID="lueUser" LookupEntityName="User" LookupEntityTypeName="Sage.Entity.Interfaces.IUser, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null" LookupDisplayMode="Dialog" AutoPostBack="true" AddEmptyListItem="false" DialogTitle="<%$ resources:LookupUserDialogTitle %>"  >
                <LookupProperties>
                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueUser.LookupProperties.UserInfo.UserName.PropertyHeader %>" PropertyName="UserInfo.UserName" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueUser.LookupProperties.UserInfo.Title.PropertyHeader %>" PropertyName="UserInfo.Title" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueUser.LookupProperties.UserInfo.Department.PropertyHeader %>" PropertyName="UserInfo.Department" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueUser.LookupProperties.UserInfo.Region.PropertyHeader %>" PropertyName="UserInfo.Region" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                </LookupProperties>
                <LookupPreFilters>
                    <SalesLogix:LookupPreFilter PropertyName="Type" PropertyType="Sage.Entity.Interfaces.UserType" OperatorCode="!=" FilterValue="'P'"></SalesLogix:LookupPreFilter>
                    <SalesLogix:LookupPreFilter PropertyName="Type" PropertyType="Sage.Entity.Interfaces.UserType" OperatorCode="!=" FilterValue="'R'"></SalesLogix:LookupPreFilter>
                    <SalesLogix:LookupPreFilter PropertyName="Id" OperatorCode="!=" FilterValue="'ADMIN       '"></SalesLogix:LookupPreFilter>
                </LookupPreFilters>
            </SalesLogix:LookupControl>
    </div>
    <div id="templateListContainer" runat="server" style="display: none">
        <asp:Literal ID="Literal4" runat="server" Text="<%$ resources: SourceTemplateList.Caption %>"></asp:Literal>&nbsp;
            <SalesLogix:LookupControl runat="server" ID="lueTemplate" LookupEntityName="User" LookupEntityTypeName="Sage.Entity.Interfaces.IUser, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null" LookupDisplayMode="Dialog" AutoPostBack="true" AddEmptyListItem="false" DialogTitle="<%$ resources:LookupTemplateDialogTitle %>"  >
                <LookupProperties>
                    <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueUser.LookupProperties.UserInfo.UserName.PropertyHeader %>" PropertyName="UserInfo.UserName" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                </LookupProperties>
                <LookupPreFilters>
                    <SalesLogix:LookupPreFilter PropertyName="Type" PropertyType="Sage.Entity.Interfaces.UserType" OperatorCode="="
                     FilterValue="'P'"></SalesLogix:LookupPreFilter>
                </LookupPreFilters>
            </SalesLogix:LookupControl>
    </div>
    &nbsp;<asp:Label ID="lblMessage" runat="server" style="color: #E32F0B; display: none;" Text="<%$ resources: ValidationMsgNoSource %>"></asp:Label>
</div>
<p>&nbsp;</p>
<div>
    <table>
        <colgroup>
            <col width="40%" />
            <col width="60%" />
        </colgroup>
        <tr>
            <td><asp:CheckBox id="chkGeneral" runat="server" Text="<%$ resources: chkGeneral.Caption %>" Checked="true" /></td>
            <td><asp:CheckBox id="chkCalendar" runat="server" Text="<%$ resources: chkCalendar.Caption %>" Checked="true" /></td>
        </tr>
         <tr>
            <td><asp:CheckBox id="chkEmployee" runat="server" Text="<%$ resources: chkEmployee.Caption %>" Checked="true" /></td>
            <td><asp:CheckBox id="chkClientOptions" runat="server" Text="<%$ resources: chkClientOptions.Caption %>" Checked="true" /></td>
        </tr>
        <tr>
            <td><asp:CheckBox id="chkSecurity" runat="server" Text="<%$ resources: chkSecurity.Caption %>" Checked="true" /></td>
            <td><asp:CheckBox id="chkServiceSupport" runat="server" Text="<%$ resources: chkServiceSupport.Caption %>" Checked="true" /></td>
        </tr>
        <tr>
            <td><asp:CheckBox id="chkTeams" runat="server" Text="<%$ resources: chkTeams.Caption %>" Checked="true" /></td>
            <td>&nbsp;</td>
        </tr>
    </table>
</div>            