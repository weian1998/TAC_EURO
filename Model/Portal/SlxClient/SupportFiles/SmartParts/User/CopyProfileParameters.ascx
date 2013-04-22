<%@ Control Language="C#" AutoEventWireup="true" CodeFile="CopyProfileParameters.ascx.cs" Inherits="CopyProfileParameters" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls"
    TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes"
    TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts"
    TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>    
<div>
    <asp:Literal ID="litDialogInfo" runat="server" Text="<%$ resources: dialogInfo %>"></asp:Literal>
</div>
<br />
<div>
    <asp:Literal ID="litSourceLabel" runat="server" Text="<%$ resources: sourceLabel %>"></asp:Literal>
    <asp:RadioButton GroupName="UserTypeRadioGroup" runat="server" ID="userOption" 
        onclick="javascript:SwitchLookup(true)" 
        Text="<%$ resources: SourceSelectionContainer_item0.Text %>" />
    <asp:RadioButton GroupName="UserTypeRadioGroup" runat="server" ID="templateOption" 
    onclick="javascript:SwitchLookup(false)" 
    Text="<%$ resources: SourceSelectionContainer_item1.Text %>" />
 </div>
<br />
<div id="sourceTypeContainer">
    <div id="userListContainer" runat="server" style="display: inline">
        <table><tr>
            <td style="padding-right:5px">
            <asp:Literal ID="Literal3" runat="server" Text="<%$ resources: SourceUserList.Caption %>"></asp:Literal>
            </td>
            <td style="width: 100%">
                <SalesLogix:LookupControl runat="server" ID="lueUser" Width="100%"  LookupEntityName="User" LookupEntityTypeName="Sage.Entity.Interfaces.IUser, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null" LookupDisplayMode="Dialog" AutoPostBack="true" AddEmptyListItem="false" DialogTitle="<%$ resources:LookupUserDialogTitle %>"  >
                <LookupProperties>
                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueUser.LookupProperties.UserInfo.UserName.PropertyHeader %>" PropertyName="UserInfo.UserName" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueUser.LookupProperties.UserInfo.Title.PropertyHeader %>" PropertyName="UserInfo.Title" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueUser.LookupProperties.UserInfo.Department.PropertyHeader %>" PropertyName="UserInfo.Department" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueUser.LookupProperties.UserInfo.Region.PropertyHeader %>" PropertyName="UserInfo.Region" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                </LookupProperties>
                <LookupPreFilters>
                    <SalesLogix:LookupPreFilter PropertyName="Type" PropertyType="Sage.Entity.Interfaces.UserType" OperatorCode="!=" FilterValue="6"></SalesLogix:LookupPreFilter>
                    <SalesLogix:LookupPreFilter PropertyName="Type" PropertyType="Sage.Entity.Interfaces.UserType" OperatorCode="!=" FilterValue="5"></SalesLogix:LookupPreFilter>
                    <SalesLogix:LookupPreFilter PropertyName="Type" PropertyType="Sage.Entity.Interfaces.UserType" OperatorCode="!=" FilterValue="8"></SalesLogix:LookupPreFilter>
                </LookupPreFilters>
            </SalesLogix:LookupControl>
            </td>
        </tr></table>
    </div>
    <div id="templateListContainer" runat="server" style="display: none">  
        <table><tr>
            <td style="padding-right:5px">
            <asp:Literal ID="Literal1" runat="server" Text="<%$ resources: SourceTemplateList.Caption %>"></asp:Literal>
            </td>
            <td style="width: 100%">
                <SalesLogix:LookupControl runat="server" ID="lueTemplate" Width="100%" LookupEntityName="User" LookupEntityTypeName="Sage.Entity.Interfaces.IUser, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null" LookupDisplayMode="Dialog" AutoPostBack="true" AddEmptyListItem="false" DialogTitle="<%$ resources:LookupTemplateDialogTitle %>"  >
                    <LookupProperties>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueUser.LookupProperties.UserInfo.UserName.PropertyHeader %>" PropertyName="UserInfo.UserName" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
                    </LookupProperties>
                    <LookupPreFilters>
                        <SalesLogix:LookupPreFilter PropertyName="Type" PropertyType="Sage.Entity.Interfaces.UserType" OperatorCode="=" FilterValue="6"></SalesLogix:LookupPreFilter>
                    </LookupPreFilters>
                </SalesLogix:LookupControl>
            </td>
        </tr></table>
       
            
    </div>
    &nbsp;<asp:Label ID="lblMessage" runat="server" style="color: #E32F0B; display: none; padding-left: 300px;" Text="<%$ resources: ValidationMsgNoSource %>"></asp:Label>
</div>
<br />
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