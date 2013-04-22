<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ReplaceTeamMember.ascx.cs" Inherits="ReplaceTeamMember" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register TagPrefix="SalesLogix" Namespace="Sage.Platform.WebPortal.SmartParts" Assembly="Sage.Platform.WebPortal" %>

<asp:HiddenField ID="hfMode" runat="server" Value="" /> 
<asp:HiddenField ID="hfContext" runat="server" Value="" /> 


<SalesLogix:SmartPartToolsContainer runat="server" ID="ReplaceTeamMember_RTools" ToolbarLocation="Right">
    <SalesLogix:PageLink ID="lnkReplaceTeamMemberHelp" runat="server" LinkType="HelpFileName"
        ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="Removing_or_Replacing_Team_Members.htm" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">&nbsp;&nbsp;&nbsp;&nbsp;</SalesLogix:PageLink>
</SalesLogix:SmartPartToolsContainer>
          
<table border="0" cellpadding="0" cellspacing="5" class="formtable">         
         <col width="85%" />     
       <tr>       
       <td>
         
         <div class=" lbl alignleft">
             <asp:Label ID="lblSelectedMember" AssociatedControlID="lueSelectedMember" runat="server" Text="<%$ resources: lueSelectedMember.Caption %>" ></asp:Label>
         </div>
          <div  class="textcontrol lookup"  >          
          <SalesLogix:LookupControl runat="server" ID="lueSelectedMember"  ToolTip="<%$ resources: lueSelectedMember.ToolTip %>" LookupEntityName="Owner" LookupEntityTypeName="Sage.Entity.Interfaces.IOwner, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null" LookupDisplayMode="Dialog" AutoPostBack="false" AddEmptyListItem="false"  lookupbindingmode="String" ReadOnly ="true">
             <LookupProperties>
             <SalesLogix:LookupProperty PropertyHeader="<%$ resources: OwnerDescription %>" PropertyName="OwnerDescription" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
             <SalesLogix:LookupProperty PropertyHeader="<%$ resources: OwnerType %>" PropertyName="Type" PropertyType="Sage.Entity.Interfaces.OwnerType" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
             </LookupProperties>
             <LookupPreFilters>
             </LookupPreFilters>
             </SalesLogix:LookupControl>
            </div>
       </td>      
     </tr>   
     <tr>       
       <td>
         <div class=" lbl alignleft">
           <asp:Label ID="lblUsers" AssociatedControlID="lueReplaceMember" runat="server" Text="<%$ resources: lueReplaceMember.Caption %>" ></asp:Label>
         </div>   
          <div  class="textcontrol lookup"  >          
          <SalesLogix:LookupControl runat="server" ID="lueReplaceMember"  ToolTip="<%$ resources: lueReplaceMember.ToolTip %>" LookupEntityName="Owner" LookupEntityTypeName="Sage.Entity.Interfaces.IOwner, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null" LookupDisplayMode="Dialog" AutoPostBack="true" AddEmptyListItem="false" lookupbindingmode="String" DialogTitle="<%$ resources:LookupMemberDialogTitle %>">
             <LookupProperties>
             <SalesLogix:LookupProperty PropertyHeader="<%$ resources: OwnerDescription %>" PropertyName="OwnerDescription" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
             <SalesLogix:LookupProperty PropertyHeader="<%$ resources: OwnerType %>" PropertyName="Type" PropertyType="Sage.Entity.Interfaces.OwnerType" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
             </LookupProperties>
             <LookupPreFilters>
             </LookupPreFilters>
             </SalesLogix:LookupControl>
            </div>
       </td>
      
     </tr>
     <tr>
        <td>
          <br />
        </td>
     </tr>      
    <tr>
      <td class="alignright" style="padding-right:20px">
         <asp:Button CssClass="slxbutton" runat="server" ID="btnOk" Text="<%$ resources: btnOk.Caption %>" OnClick="OK_Click"  />
         <asp:Button CssClass="slxbutton" runat="server" ID="btnCancel" Text="<%$ resources: btnCancel.Caption %>"  OnClick="CANCEL_Click"  />
       </td>
    </tr>
</table>

