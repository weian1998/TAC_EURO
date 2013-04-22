<%@ Control Language="C#" AutoEventWireup="true" CodeFile="AddToTeam.ascx.cs" Inherits="AddToTeam" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register TagPrefix="SalesLogix" Namespace="Sage.Platform.WebPortal.SmartParts" Assembly="Sage.Platform.WebPortal" %>

<asp:HiddenField ID="hfMode" runat="server" Value="" /> 
<asp:HiddenField ID="hfContext" runat="server" Value="" /> 

<SalesLogix:SmartPartToolsContainer runat="server" ID="AddUsers_Tools" ToolbarLocation="Right">
    <SalesLogix:PageLink ID="lnkAddUsersHelp" runat="server" LinkType="HelpFileName"
        ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="Adding_Team_Members.htm" 
        ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16"></SalesLogix:PageLink>
 </SalesLogix:SmartPartToolsContainer>           

<asp:Panel  runat="server" ID="pnlTarget">
<table border="0" cellpadding="0" cellspacing="0" class="formtable">         
         <col width="85%" />           
      <tr>
        <td style="font-size:12px">
            <asp:Label ID="lblDescription"  runat="server" Text="" ></asp:Label>
         </td>
     </tr>            
         
</table>
</asp:Panel>   
           
<table border="0" cellpadding="0" cellspacing="0" class="formtable">         
         <col width="85%" />     
        
     <tr>       
       <td>
         <div class=" lbl alignleft">
             <asp:Label ID="Label1" AssociatedControlID="lueTeam" runat="server" Text="<%$ resources: luTeam.Caption %>" ></asp:Label>
         </div>   
         <div  class="textcontrol lookup"  >
         <SalesLogix:LookupControl runat="server" ID="lueTeam"  ToolTip="" LookupEntityName="Team" LookupEntityTypeName="Sage.Entity.Interfaces.ITeam, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null" LookupBindingMode="String" DialogTitle="<%$ resources:LookupTeamDialogTitle %>" AutoPostBack="true" >
           <LookupProperties>
             <SalesLogix:LookupProperty PropertyHeader="<%$ resources: LookupTeamPropertyHeader %>" PropertyName="Owner.OwnerDescription" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True" ExcludeFromFilters="False"></SalesLogix:LookupProperty>
           </LookupProperties>
           <LookupPreFilters>
           </LookupPreFilters>
         </SalesLogix:LookupControl>
        </div>
       </td>
       
     </tr>
     <tr>
        <td><asp:CheckBox ID="chkAddManager" runat="server" Checked="true" AutoPostBack="false" Text="<%$ resources: chkAddManager.Label %>" /></td>
     </tr>
     <tr>
        <td>
          <br />
        </td>
     </tr>      
    <tr>
      <td class="qfActionContainer">
         <asp:Button CssClass="slxbutton" runat="server" ID="btnOk" Text="<%$ resources: btnOk.Caption %>" OnClick="OK_Click"  />
         <asp:Button CssClass="slxbutton" runat="server" ID="btnCancel" Text="<%$ resources: btnCancel.Caption %>"  OnClick="CANCEL_Click"  />
       </td>
    </tr>  
</table>

