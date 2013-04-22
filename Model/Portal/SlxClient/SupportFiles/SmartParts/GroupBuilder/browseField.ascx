<%@ Control language="c#" Inherits="Sage.SalesLogix.Client.GroupBuilder.browseField" Codebehind="browseField.ascx.cs" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>

<table cellpadding="0" cellspacing="0" class="tbodylt">
	
    <tr>
    <td colspan="2">
	    <div style="position:relative;">
        <div style="position:absolute; top:-23px; right:45px; ">
			       <SalesLogix:PageLink ID="SelectHelpLink" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="queryconditionvalue.aspx" ImageUrl="~/images/icons/Help_16x16.png"></SalesLogix:PageLink>
			</div>
            </div>
    </td>
</tr>
    
   
	<tr>
		<td>
			<table cellpadding="2" cellspacing="0">
				<tr>
					<td valign="top"><asp:Localize ID="localizeSelectValueFromList" runat="server" Text="<%$ resources: localizeSelectValueFromList.Text %>" /></td>
					<td rowspan="2" class="padded" valign="top">
						<input type="button" id="btnOK" value='<asp:Localize ID="localizeOK" runat="server" Text="<%$ resources: localizeOK.Text %>" />' onclick="browseField_valueSelected();" class="button" style="width:60px" /><br> 
						<input type="button" id="btnCancel" value='<asp:Localize ID="localizeCancel" runat="server" Text="<%$ resources: localizeCancel.Text %>" />' onclick="window.close()" class="button" style="width:60px" /><br>
					</td>
				</tr>
				<tr>
					<td>
						<asp:ListBox ID="listValues" Height="180px" Runat="server" Width="180px"></asp:ListBox>
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>

<script src="jscript/Sage/GroupBuilder/querybuilder.js" type="text/javascript"></script>
<script src="jscript/Sage/GroupBuilder/browseField.js" type="text/javascript"></script>