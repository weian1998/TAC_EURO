<%@ Control language="c#" AutoEventWireup="true" Inherits="Sage.SalesLogix.Client.GroupBuilder.ShowGroups" Codebehind="ShowGroups.ascx.cs" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>

<table cellpadding="0" cellspacing="0" class="tbodylt">
	
     <tr>
    <td colspan="2">
	    <div style="position:relative;">
        <div style="position:absolute; top:-23px; right:45px; ">
			      <SalesLogix:PageLink ID="ShowGroupsHelpLink" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="showgroup.aspx" ImageUrl="~/images/icons/Help_16x16.png"></SalesLogix:PageLink>
			</div>
            </div>
    </td>
</tr> 
	<tr>
		<td class="padding">
			<div id="groupsGrid" runat="server" >
			</div>
		</td>
		<td valign="top" class="padding">
            <asp:Button runat="server" ID="btnOk" Text="<%$ resources: btnOk.Text %>" ToolTip="<%$ resources: btnOk.ToolTip %>" OnClientClick="ShowGroups_save()" style="width:60px"  />
			<br />
		</td>
	</tr>
</table>

<script src="jscript/Sage/GroupBuilder/querybuilder.js" type="text/javascript"></script>
<script src="jscript/Sage/GroupBuilder/mainlib.js" type="text/javascript"></script>
<script src="jscript/Sage/GroupBuilder/ShowGroups.js" type="text/javascript"></script>