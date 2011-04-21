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
        <asp:ImageButton runat="server" ID="btnSave" OnClick="Save_OnClick" ToolTip="<%$ resources: btnSave.ToolTip %>" 
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
                <SalesLogix:OwnerControl runat="server" ID="ownAccount" Types="STU" />
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
			<div class="lbl">
				<asp:Label ID="lblEmailTemplate" runat="server" Text="<%$ resources: EmailTemplate.Caption %>" ></asp:Label>
			</div>
			<div class="textcontrol">
				<input runat="server" type="text" id="txtEmailTemplateName" />
				<asp:image runat="server" id="EmailTemplateFindIcon" ImageUrl="~/images/icons/find_16x16.gif" />
				<input runat="server" type="hidden" id="txtEmailTemplateId" />
			</div>
		</td>
     </tr>
     <tr>
        <td>
			<div class="lbl">
				<asp:Label ID="lblLetterTemplate" runat="server" Text="<%$ resources: LetterTemplate.Caption %>" ></asp:Label>
			</div>
			<div class="textcontrol">
				<input runat="server" type="text" id="txtLetterTemplateName" />
				<asp:image runat="server" id="LetterTemplateFindIcon" ImageUrl="~/images/icons/find_16x16.gif" />
				<input runat="server" type="hidden" id="txtLetterTemplateId" />
			</div>
		</td>
     </tr>
    <tr>
		<td>
			<div class="lbl">
				<asp:Label ID="lblFaxTemplate" runat="server" Text="<%$ resources: FaxTemplate.Caption %>" ></asp:Label>
			</div>
			<div class="textcontrol">
				<input runat="server" type="text" id="txtFaxTemplateName" />
				<asp:image runat="server" id="FaxTemplateFindIcon" ImageUrl="~/images/icons/find_16x16.gif" />
				<input runat="server" type="hidden" id="txtFaxTemplateId" />
			</div>
		</td>
     </tr>
     <tr>
        <td>
            <div class="slxlabel alignleft checkbox">
                <SalesLogix:SLXCheckBox runat="server" ID="chkbxAllowChangeTemplates" CssClass="checkbox"
                    Text="<%$ resources: chkbxAllowChange.Caption %>" TextAlign="right" />
            </div>
        </td>
    </tr>
     <tr>
		<td colspan="2" style="padding-top:20px;">
            <div id="TemplatePanel" style="display:none">
                <div class="hd"><asp:Label ID="lblSelectTemplate" runat="server" Text="<%$ resources: SelectTemplate.Caption %>"></asp:Label></div> 
	            <div id="treeDiv1" class="LitTree"></div>
	        </div> 
            <asp:TextBox ID="templateXml" style="display:none" runat="server"></asp:TextBox>
            <input type="hidden" id="clientdata" runat="server" />		
		</td>
     </tr>
</table>