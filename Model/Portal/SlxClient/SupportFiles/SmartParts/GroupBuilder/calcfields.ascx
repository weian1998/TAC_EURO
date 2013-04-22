<%@ Control language="c#"  Inherits="Sage.SalesLogix.Client.GroupBuilder.calcfields" Codebehind="calcfields.ascx.cs" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>

<input type="hidden" name="newCalcFieldXML" id="newCalcFieldXML" value="" />
<input type="hidden" name="postType" id="postType" value="" />
<input type="hidden" name="calcFieldID" id="calcFieldID" value="" />
<input type="hidden" name="sortcol" id="sortcol" value="0" />
<input type="hidden" name="sortdir" id="sortdir" value="ASC" />

<table cellpadding="0" cellspacing="0" class="tbodylt">
<tr>
    <td colspan="2">
	    <div style="position:relative;">
        <div style="position:absolute; top:-23px; right:45px; ">
			        <SalesLogix:PageLink ID="McfHelpLink" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="querycalcfields.aspx" ImageUrl="~/images/icons/Help_16x16.png"></SalesLogix:PageLink>
			</div>
            </div>
    </td>
</tr>
<tr>
    <td class="padded">
	    <div id="calcFieldGrid" >
		    <table id="grdCalcFields" groupid="calculations"  xmlns:v="urn:schemas-microsoft-com:vml" onrowselect="rowSelected()" onrowdeselect="rowDeSelected()" onrendercomplete="buildTable()" onbeforecolsort="sortTable()" >
			    <tr class="nodojoTableHeader">
				    <td align="left"><asp:Localize ID="localizeBaseTable" runat="server" Text="<%$ resources: localizeBaseTable.Text %>" /></td>
				    <td align="left"><asp:Localize ID="localizeName" runat="server" Text="<%$ resources: localizeName.Text %>" /></td>
				    <td align="left"><asp:Localize ID="localizeAlias" runat="server" Text="<%$ resources: localizeAlias.Text %>" /></td>
			    </tr>
		    </table>
	    </div>
    </td>
    <td valign="top" class="padded">
	    <input type="button" value='<asp:Localize ID="localizeClose" runat="server" Text="<%$ resources: localizeClose.Text %>" />' id="btnClose" onclick="closeWin()" /><br />
	    <br />
	    <input type="button" value='<asp:Localize ID="localizeAdd" runat="server" Text="<%$ resources: localizeAdd.Text %>" />' id="bthAdd" onclick="addItem()" /><br />
	    <input type="button" value='<asp:Localize ID="localizeEdit" runat="server" Text="<%$ resources: localizeEdit.Text %>" />' id="btnEdit" onclick="editItem()" /><br />
	    <input type="button" value='<asp:Localize ID="localizeDelete" runat="server" Text="<%$ resources: localizeDelete.Text %>" />' id="btnDelete" onclick="deleteItem()" />
    </td>
</tr>
<tr>
    <td class="padded">
	    <div id="displayText"></div>
    </td>
</tr>
</table>

<script src="jscript/Sage/GroupBuilder/querybuilder.js" type="text/javascript"></script>
<script src="jscript/Sage/GroupBuilder/calcFields.js" type="text/javascript"></script>