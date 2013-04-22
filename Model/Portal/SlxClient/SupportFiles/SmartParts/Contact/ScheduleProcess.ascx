<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ScheduleProcess.ascx.cs" Inherits="SmartParts_Process_ScheduleProcess" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="ScheduleProcess_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="ScheduleProcess_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="ScheduleProcess_RTools" runat="server">
        <SalesLogix:PageLink ID="ScheduleProcessHelpLink" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources:Portal, Help_ToolTip %>"
            Target="Help" NavigateUrl="processschedule.aspx" ImageUrl="~/ImageResource.axd?scope=global&amp;type=Global_Images&amp;key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<table border="0" cellpadding="1" cellspacing="0" class="SPformtable">
<col width="100%" />
	<tr>
		<td>
			<span class="lbl">
			    <asp:Label ID="lblScheduleFor" runat="server" Text="<%$ resources: lblScheduleFor.Text %>"></asp:Label>
			</span>
			<span class="SPcontrol">
				<SalesLogix:LookupControl runat="server" ID="lueContactToScheduleFor" LookupEntityName="Contact" EnableHyperLinking="false"
                    AutoPostBack="false" LookupEntityTypeName="Sage.SalesLogix.Entities.Contact, Sage.SalesLogix.Entities" >
				<LookupProperties>
				    <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueContactToScheduleFor.LookupProperties.NameLF.PropertyHeader %>"
                        PropertyName="NameLF" PropertyFormat="None" UseAsResult="True">
				    </SalesLogix:LookupProperty>
				    <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueContactToScheduleFor.LookupProperties.Account.PropertyHeader %>"
                        PropertyName="AccountName" PropertyFormat="None" UseAsResult="True">
				    </SalesLogix:LookupProperty>
				    <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueContactToScheduleFor.LookupProperties.Address.City.PropertyHeader %>"
                        PropertyName="Address.City" PropertyFormat="None" UseAsResult="True">
				    </SalesLogix:LookupProperty>
				    <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueContactToScheduleFor.LookupProperties.Address.State.PropertyHeader %>"
                        PropertyName="Address.State" PropertyFormat="None" UseAsResult="True">
				    </SalesLogix:LookupProperty>
				    <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueContactToScheduleFor.LookupProperties.Work.PropertyHeader %>"
                        PropertyName="WorkPhone" PropertyFormat="None" UseAsResult="True">
				    </SalesLogix:LookupProperty>
				    <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueContactToScheduleFor.LookupProperties.Email.PropertyHeader %>"
                        PropertyName="Email" PropertyFormat="None" UseAsResult="True">
				    </SalesLogix:LookupProperty>
				</LookupProperties>
				<LookupPreFilters>
				</LookupPreFilters>
				</SalesLogix:LookupControl>
			</span>
		</td>
	</tr>
	<tr>
		<td>
			<span class="lbl">
			    <asp:Label ID="lblProcessType" runat="server" Text="<%$ resources: lblProcessType.Text %>"></asp:Label>
			</span>
			<span class="SPcontrol">
			    <asp:DropDownList ID="cboProcessType" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"></asp:DropDownList>
			</span>
		</td>
	</tr>
	<tr>
		<td>
			<span class="lbl">
			    <asp:Label ID="lblProcessOwner" runat="server" Text="<%$ resources: lblProcessOwner.Text %>" ></asp:Label>
			</span>
			<span class="SPcontrol">
			    <SalesLogix:SlxUserControl runat="server" ID="ownProcessOwner" AutoPostBack="false" ButtonToolTip="<%$ resources: ownProcessOwner.ToolTip %>"></SalesLogix:SlxUserControl>
            </span>
		</td>
	</tr>
</table>
<div style="padding-right:20px; text-align:right" >
   <asp:Panel runat="server" ID="Panel1" CssClass="controlslist qfActionContainer">
        <asp:Button runat="server" ID="cmdSchedule" CssClass="slxbutton" Text="<%$ resources: cmdScheduleResource.Text %>" />
    </asp:Panel>
</div>