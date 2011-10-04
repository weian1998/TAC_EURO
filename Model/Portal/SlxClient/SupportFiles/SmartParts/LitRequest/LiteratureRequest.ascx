<%@ Control Language="C#" AutoEventWireup="true" CodeFile="LiteratureRequest.ascx.cs" Inherits="SmartParts_LitRequest_LiteratureRequest" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="Saleslogix" %>

<div style="display:none">
    <asp:Panel ID="LitRequest_LTools" runat="server" meta:resourcekey="LitRequest_LToolsResource1"></asp:Panel>
    <asp:Panel ID="LitRequest_CTools" runat="server" meta:resourcekey="LitRequest_CToolsResource1"></asp:Panel>
    <asp:Panel ID="LitRequest_RTools" runat="server" meta:resourcekey="LitRequest_RToolsResource1">
        <asp:ImageButton runat="server" ID="btnSave" OnClick="Save" ToolTip="Schedule Literature Request" 
            ImageUrl="~/images/icons/Save_16x16.gif" meta:resourcekey="btnSaveLitRequest_rsc" />
        <SalesLogix:PageLink ID="lnkLiteratureRequestHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources:Portal, Help_ToolTip %>" Target="Help" NavigateUrl="litreqadd1.aspx"
            ImageUrl="~/ImageResource.axd?scope=global&amp;type=Global_Images&amp;key=Help_16x16" meta:resourcekey="lnkLiteratureRequestHelpResource1"></SalesLogix:PageLink>
    </asp:Panel>
</div>
         
<table border="0" cellpadding="1" cellspacing="0" class="formtable">
	<col width="50%" />
	<col width="50%" />
	<tr>
		<td>
			<div class="slxlabel alignleft">
				<asp:label ID="lblRequestedBy" runat="server" meta:resourcekey="lblRequestedByResource1" />
			</div>
	
		</td> 
		
		<td rowspan="6">
			<div class="lbltop alignleft"> 
				<asp:Label ID="lblPrintLiteratureList" runat="server" AssociatedControlID="PrintLiteratureList" Text="Print Literature List:"
					meta:resourcekey="PrintLiteratureList_label"></asp:Label>
			</div>
			<div>
				<asp:RadioButtonList runat="server" ID="PrintLiteratureList" meta:resourcekey="PrintLiteratureListResource1">
					<asp:ListItem Text="<%$ resources:WithCoverLetter.Text %>" Value="withcover" Selected="true" />
					<asp:ListItem Text="<%$ resources:SeparatePage.Text %>" Value="separate" />
					<asp:ListItem Text="<%$ resources:AttachmentList.Text %>" Value="attachmentonly" />
					<asp:ListItem Text="<%$ resources:OnlyCoverLetter.Text %>" Value="coveronly" />
				</asp:RadioButtonList>
			</div>		
		</td>
	</tr>
	<tr>
		<td>
			<div class="lbl alignleft">
				<asp:Label ID="lblRequestedFor" runat="server" AssociatedControlID="RequestedFor" Text="Requested for:" meta:resourcekey="RequestedFor_label" ></asp:Label>
			</div>
			<div class="textcontrol lookup">
				<SalesLogix:LookupControl runat="server" ID="RequestedFor" ToolTip="Find" LookupEntityName="Contact" LookupEntityTypeName="Sage.SalesLogix.Entities.Contact, Sage.SalesLogix.Entities" meta:resourcekey="RequestFor_rsc" >
					<LookupProperties>
						<SalesLogix:LookupProperty PropertyName="NameLF" PropertyFormat="None"  UseAsResult="True" meta:resourcekey="Lookup_NameLF" ></SalesLogix:LookupProperty>
						<SalesLogix:LookupProperty PropertyName="AccountName" PropertyFormat="None"  UseAsResult="True" meta:resourcekey="Lookup_Account" ></SalesLogix:LookupProperty>
						<SalesLogix:LookupProperty PropertyName="Address.City" PropertyFormat="None"  UseAsResult="True" meta:resourcekey="Lookup_City" ></SalesLogix:LookupProperty>
						<SalesLogix:LookupProperty PropertyName="Address.State" PropertyFormat="None"  UseAsResult="True" meta:resourcekey="Lookup_State" ></SalesLogix:LookupProperty>				
						<SalesLogix:LookupProperty PropertyName="WorkPhone" PropertyFormat="None"  UseAsResult="True" meta:resourcekey="Lookup_Work" ></SalesLogix:LookupProperty>
						<SalesLogix:LookupProperty PropertyName="Email" PropertyFormat="None"  UseAsResult="True" meta:resourcekey="Lookup_Email" ></SalesLogix:LookupProperty>
					</LookupProperties>
					<LookupPreFilters>
					</LookupPreFilters>
				</SalesLogix:LookupControl>			
			</div>
        </td>    
     </tr>
     <tr>
		<td>
			<div class="lbl alignleft">
				<asp:Label ID="lblDescription" runat="server" AssociatedControlID="Description" Text="Description:"
					meta:resourcekey="Description_label" ></asp:Label>
            </div>
            <div class="textcontrol">
				<asp:TextBox ID="Description" runat="server" meta:resourcekey="DescriptionResource1"></asp:TextBox>
			</div>
		</td>
     </tr>
     <tr>
		<td>
			<div class="lbl ">
				<asp:Label ID="lblSendBy" runat="server" AssociatedControlID="SendBy" Text="Send by:"
					meta:resourcekey="SendBy_label" ></asp:Label>
			</div>
			<div class="textcontrol datepicker">
				 <SalesLogix:DateTimePicker id="SendBy" runat="server" displaytime="False" AutoPostBack="False" DisplayDate="True" DisplayMode="AsControl" Enable24HourTime="False" IncludeSecondsInTimeFormat="False"></SalesLogix:DateTimePicker>
			</div>
		</td>
     </tr>
     <tr>
		<td>
			<div class="lbl ">
				<asp:Label ID="lblSendVia" runat="server" AssociatedControlID="SendVia" Text="Send via:"
		            meta:resourcekey="SendVia_label"></asp:Label>
			</div>
			<div class="textcontrol picklist">
		        <SalesLogix:PickListControl id="SendVia" picklistname="Delivery Methods"  runat="server" MustExistInList="True" AlphaSort="True" AutoPostBack="False" DefaultPickListItem="" DisplayMode="AsControl" LeftMargin="" MaxLength="0" meta:resourcekey="SendViaResource1" NoneEditable="True"></SalesLogix:PickListControl>
			</div>
		</td>
     </tr>
     <tr>
		<td>
			<div class="lbl ">
				<asp:Label ID="lblPriority" runat="server" AssociatedControlID="Priority" Text="Priority:"
					meta:resourcekey="Priority_label" ></asp:Label>
			</div>
			<div class="textcontrol picklist">
				<SalesLogix:PickListControl id="Priority" picklistname="Lit. Request Priority" runat="server" MustExistInList="True" AlphaSort="True" AutoPostBack="False" DefaultPickListItem="" DisplayMode="AsControl" LeftMargin="" MaxLength="0" meta:resourcekey="PriorityResource1" NoneEditable="True"></SalesLogix:PickListControl>
			</div>
		</td>
     </tr>     
     <tr>
		<td>
			<div class="lbl ">
				<asp:Label ID="lblTemplate" runat="server" Text="Template:" meta:resourcekey="Template_label" ></asp:Label>
			</div>
			<div class="textcontrol">
				<input runat="server" type="text" id="TemplateName" />
				<asp:image runat="server" AlternateText="<%$ resources:TemplateFindIcon.AlternateText %>" id="TemplateFindIcon" ImageUrl="~/images/icons/find_16x16.gif" />
				<input runat="server" type="hidden" id="TemplateId" />
			</div>
		</td>
		<td><asp:CheckBox id="chkHandleLocal" runat="server" Text="<%$ resources:HandleFulfillmentLocally.Text %>" /></td>
     </tr>
     <tr>
        <td colspan="2" align="right" style="padding-right: 60px;">
        <label>Total:</label>&nbsp;<label id="lblTotalCost" class="TotalCost"><%= string.Format("{0:C}", 0.00) %></label>
        </td>
     </tr>
     <tr>
		<td colspan="2" style="padding-top:20px;">
        <div id="TemplatePanel" style="display:none">
            <div class="hd"><asp:Label ID="lblSelectTemplate" runat="server" Text="Select Template:" meta:resourcekey="SelectTemplate_label"></asp:Label></div> 
	        <div id="treeDiv1" class="LitTree"></div>
	    </div> 
        <asp:TextBox ID="templateXml" style="display:none" runat="server"></asp:TextBox>
		
    <SalesLogix:SlxGridView ID="LiteratureItems" CssClass="datagrid" AlternatingRowStyle-CssClass="rowdk" RowStyle-CssClass="rowlt" GridLines="None" 
        runat="server" AutoGenerateColumns="False" ForeColor="#333333" DataKeyNames="Id" CellPadding="4" ShowEmptyTable="True" 
        meta:resourcekey="EmptyRow_lz" EmptyTableRowText="No records match the selection criteria." CurrentSortDirection="Ascending" CurrentSortExpression="" ExpandableRows="True" ResizableColumns="True" RowSelect="True" ShowSortIcon="True" SortAscImageUrl="" SortDescImageUrl="" >
        <Columns>
            <asp:TemplateField meta:resourcekey="QuantityRequested_lz" HeaderText="Quantity Requested" >
                <itemTemplate>
                 <input type="text" class="quantity" onkeypress="return forceNumInput(event)" onchange="updateTotal(event);" id="<%# "QRFOR" + Eval("LiteratureId") %>" />
            </itemTemplate>
            </asp:TemplateField>
           <asp:BoundField DataField="ItemName" meta:resourcekey="Name_lz" HeaderText="Name" ReadOnly="True" >
                <headerstyle width="130px" />
            </asp:BoundField>
            <asp:BoundField DataField="ItemFamily" HeaderText="Family" ReadOnly="True" meta:resourcekey="BoundFieldResource1"/>
            <asp:TemplateField HeaderText="Cost"  meta:resourcekey="BoundFieldResource2">
                <itemTemplate>
                    <label id="lblCost"><%# string.Format("{0:C}", Eval("Cost")) %></label>
                    <input type="hidden" class="cost" value="<%# Eval("Cost") %>" />
                </itemTemplate>    
            </asp:TemplateField>
            <asp:BoundField DataField="LiteratureId" HeaderText="LiteratureID" SortExpression="LiteratureId" Visible="False" meta:resourcekey="BoundFieldResource3" />
        </Columns>
        <RowStyle CssClass="rowlt" />
        <AlternatingRowStyle CssClass="rowdk" />
    </SalesLogix:SlxGridView>
    <input type="hidden" id="clientdata" runat="server" />		
		</td>
     </tr>
     
</table>

<SalesLogix:ScriptResourceProvider ID="LitRequestScriptResource" runat="server">
    <Keys>
        <SalesLogix:ResourceKeyName Key="FulfillCanceled" />       
        <SalesLogix:ResourceKeyName Key="FulfillFailed" />          
    </Keys>
</SalesLogix:ScriptResourceProvider>

<input type="hidden" id="hidUSDecSep" value="<%= new System.Globalization.CultureInfo("en-US").NumberFormat.CurrencyDecimalSeparator %>" />
<input type="hidden" id="hidDecSep" value="<%= System.Globalization.CultureInfo.CurrentCulture.NumberFormat.CurrencyDecimalSeparator %>" />
<input type="hidden" id="hidGroupSep" value="<%= System.Globalization.CultureInfo.CurrentCulture.NumberFormat.CurrencyGroupSeparator %>" />
<input type="hidden" id="hidDecDigits" value="<%= System.Globalization.CultureInfo.CurrentCulture.NumberFormat.CurrencyDecimalDigits %>" />
<input type="hidden" id="hidNegPattern" value="<%= System.Globalization.CultureInfo.CurrentCulture.NumberFormat.CurrencyNegativePattern %>" />
<input type="hidden" id="hidPosPattern" value="<%= System.Globalization.CultureInfo.CurrentCulture.NumberFormat.CurrencyPositivePattern %>" />
<input type="hidden" id="hidSymbol" value="<%= System.Globalization.CultureInfo.CurrentCulture.NumberFormat.CurrencySymbol %>" />
<input type="hidden" id="hidNegSign" value="<%= System.Globalization.CultureInfo.CurrentCulture.NumberFormat.NegativeSign %>" />

<script type="text/javascript">

function forceNumInput(event) {
    if (Ext.isIE) {
	    if ((event.keyCode < 48) || (event.keyCode > 57)) {
		    event.returnValue = false;
	    }
	} else {
	    if (((event.which < 48) || (event.which > 57)) && (event.which != 8)) {
		    return false;
	    }
	}
    return true;
}
function LocalizeCost(numText) {
    var dec = $('#hidDecSep').val();
    var decUS = $('#hidUSDecSep').val();
    numText = numText.replace(decUS, dec);
    return numText;
}
function deLocalizeCost(numText) {
    var decUS = $('#hidUSDecSep').val();
    var dec = $('#hidDecSep').val();
    var group = $('#hidGroupSep').val();
    numText = numText.replace(group, "");
    numText = numText.replace(dec, decUS);
    return numText;
}
function updateTotal(event) {
    var totalCost = 0;
    $('#ctl00_MainContent_LiteratureRequest_LiteratureItems TR').each(function () {
        var quantity = $(this).find(".quantity").val();
        if (quantity != undefined && quantity != "") {
            var itemCost = $(this).find(".cost").val();
            if (itemCost != undefined) {
                itemCost = deLocalizeCost(itemCost);

                totalCost = totalCost + (itemCost * quantity);
            }
        }
    });
    var costControl = $("#lblTotalCost");
    totalCost = LocalizeCost(totalCost.toString());
    var curObj = new Currency('', "lblTotalCost", $("#hidDecSep").val(), $("#hidGroupSep").val(), $("#hidSymbol").val(), $("#hidGroupDigits").val(), 1 * $("#hidDecDigits").val(), "", totalCost, false, "", 1 * $("#hidPosPattern").val(), 1 * $("#hidNegPattern").val(), $("#hidNegSign").val());

    var formattedCost = curObj.FormatLocalizedCurrency(totalCost);
    costControl.text(formattedCost);
    
    costControl.onchange();
}
function SetLocaleInfo(decimalPoint, thousandsSep) {
    _decimalPoint = decimalPoint;
    _thousandsSep = thousandsSep;
}
function fulfillLitRequestLocally(litRequestId) {
    var bCanceled = false;
    var bSuccess = false;
    var sError = "";
    var oService = GetMailMergeService();
    if (oService) {
        var arrResult = oService.FulfillLitRequest(litRequestId);
        if (Ext.isArray(arrResult)) {
            bSuccess = arrResult[LitReqResult.lrSuccess];
            if (bSuccess) {
                parent.__doPostBack('UpdateFulfillStatus', litRequestId);
                return;
            }
            bCanceled = arrResult[LitReqResult.lrCanceled];
            if (bCanceled)
                sError = LitRequestScriptResource.FulfillCanceled;
            else
                sError = arrResult[LitReqResult.lrError];
        }
    }
    if (!bSuccess) {
        if (Ext.isEmpty(sError)) {
            sError = LitRequestScriptResource.FulfillFailed;
        }
        Ext.Msg.alert("Sage SalesLogix", sError);
        location.href = 'Literature.aspx?modeid=Insert';
    }
}
</script>
