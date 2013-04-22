<%@ Control Language="C#" AutoEventWireup="true" CodeFile="UserClientSystem.ascx.cs" Inherits="UserClientSystem" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="Saleslogix" %>

<div style="display:none">
    <asp:Panel ID="UserClientSystem_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="UserClientSystem_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="UserClientSystem_RTools" runat="server">
        <asp:ImageButton runat="server" ID="btnSave" OnClick="Save_OnClick" OnClientClick="sessionStorage.clear();" ToolTip="<%$ resources: btnSave.ToolTip %>" 
            ImageUrl="~/images/icons/Save_16x16.gif" />
        <SalesLogix:PageLink ID="lnkUserClientSystemHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources:Portal, Help_ToolTip %>" Target="Help" NavigateUrl="User_Detail_View_Client_System_Tab.htm"
            ImageUrl="~/ImageResource.axd?scope=global&amp;type=Global_Images&amp;key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
</div>
         
<table border="0" cellpadding="1" cellspacing="0" class="formtable">
	<col width="50%" />
	<col width="50%" />
	<tr>
        <td colspan="2">
            <div class="mainContentHeader"><span id="hzsDefaultOwner">
            <asp:Localize ID="Localize1" runat="server" Text="<%$ resources: hzsDefaultOwner.Caption %>">Default Owner</asp:Localize></span></div>
            <br />
        </td>
    </tr>
    <tr>
        <td>
            <div class=" lbl alignleft">
                <asp:Label ID="ownAccount_lbl" AssociatedControlID="ownAccount" runat="server" Text="<%$ resources: ownAccount.Caption %>" ></asp:Label>
            </div>
            <div class="textcontrol owner">
                <SalesLogix:OwnerControl runat="server" ID="ownAccount" ButtonTooltip="<%$ resources: ownAccount.ButtonToolTip %>" Types="STU" />
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <div class="slxlabel alignleft checkbox">
                <SalesLogix:SLXCheckBox runat="server" ID="chkbxAllowChange" CssClass="checkbox"
                    Text="<%$ resources: chkbxAllowChange.Caption %>" TextAlign="right" />
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <br />
        </td>
    </tr>
    <tr>
        <td colspan="2">
            <div class="mainContentHeader"><span id="hzsTemplates">
                <asp:Localize ID="Localize2" runat="server" Text="<%$ resources: hzsTemplates.Caption %>">Base Templates</asp:Localize></span>
            </div>
            <br />
        </td>
    </tr>    
    <tr>
        <td>
			<span class="lbl"><asp:Label ID="lblType" runat="server" Text="Type:" 
                meta:resourcekey="lblTypeResource"></asp:Label></span>
            <span class="textcontrol"> 
            <asp:DropDownList ID="cboTemplateType" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" runat="server"
                AutoPostBack="True">
                <asp:ListItem Selected="True" Value="CONTACT" Text="Contact" meta:resourcekey="listItemContactResource">Contact</asp:ListItem>
                <asp:ListItem Value="LEAD" Text="Lead" meta:resourcekey="listItemLeadResource">Lead</asp:ListItem>
            </asp:DropDownList>
            </span>
        </td>
    </tr>
        <tr>
            <td>
				<span class="lbl"><asp:Label ID="lblEmailBaseTemplate" runat="server" Text="<%$ resources: EmailTemplate.Caption %>"></asp:Label></span>
                <span class="textcontrol">
					<span runat="server" id="EmailSpan">
						<asp:TextBox ID="txtEmailBaseTemplate" runat="server"></asp:TextBox>
						<img ID="txtEmailBaseTemplateImg" runat="server" alt="<%$ resources: txtEmailBaseTemplate.Caption %>" title="<%$ resources: txtEmailBaseTemplate.Caption %>" src="~/images/icons/find_16x16.png" class="optionsImageClass" onclick="javascript:getTemplate('Email');"  />
						<asp:HiddenField ID="txtEmailBaseTemplateId" runat="server"></asp:HiddenField>
					</span>
                </span>
            </td>
        </tr>
        <tr>
            <td>
				<span class="lbl"><asp:Label ID="lblLetterBaseTemplate" runat="server" Text="<%$ resources: LetterTemplate.Caption %>"></asp:Label></span>
				<span class="textcontrol">
					<span runat="server" id="LetterSpan">
						<asp:TextBox ID="txtLetterBaseTemplate" runat="server"></asp:TextBox>
						<img ID="txtLetterBaseTemplateImg" runat="server" alt="<%$ resources: txtLetterBaseTemplate.Caption %>" title="<%$ resources: txtLetterBaseTemplate.Caption %>" src="~/images/icons/find_16x16.png" class="optionsImageClass" onclick="javascript:getTemplate('Letter');" />
						<asp:HiddenField ID="txtLetterBaseTemplateId" runat="server"></asp:HiddenField>
					</span>
				</span>
            </td>
        </tr>
        <tr>
            <td>
				<span class="lbl"><asp:Label ID="lblFaxBaseTemplate" runat="server" Text="<%$ resources: FaxTemplate.Caption %>"></asp:Label></span>
				<span class="textcontrol">
					<span runat="server" id="FaxSpan">
						<asp:TextBox ID="txtFaxBaseTemplate" runat="server"></asp:TextBox>
						<img ID="txtFaxBaseTemplateImg" runat="server" alt="<%$ resources: txtFaxBaseTemplate.Caption %>" title="<%$ resources: txtFaxBaseTemplate.Caption %>" src="~/images/icons/find_16x16.png" class="optionsImageClass" onclick="javascript:getTemplate('Fax');"  />					
						<asp:HiddenField ID="txtFaxBaseTemplateId" runat="server"></asp:HiddenField>
					</span>
			   </span>
			</td>
			<td></td>
        </tr>
     <tr>
        <td>
            <div class="slxlabel alignleft checkbox">
                <SalesLogix:SLXCheckBox runat="server" ID="chkbxAllowChangeTemplates" CssClass="checkbox"
                    Text="<%$ resources: chkbxAllowChange.Caption %>" TextAlign="right" />
            </div>
        </td>
    </tr>
</table>