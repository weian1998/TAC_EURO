<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ImportActionAddTarget.ascx.cs" Inherits="ImportActionAddTarget" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="ImportActionAddTarget_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="ImportActionAddTarget_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="ImportActionAddTarget_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkAddActionTargetHelp" runat="server" LinkType="HelpFileName" Target="Help" NavigateUrl="leadimporttarget.htm"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<table border="0" cellpadding="1" cellspacing="0" class="formtable">
    <tr>
        <td>
            <span class="lbl">
                <asp:Label ID="lblCampaign" runat="server" Text="<%$ resources: lblCampaign.Caption %>"></asp:Label>
            </span>
            <div class="textcontrol lookup">
                <SalesLogix:LookupControl runat="server" ID="lueCampaigns" LookupEntityName="Campaign" AutoPostBack="false" ButtonToolTip="<%$ resources: lueCampaign.ToolTip %>"
                    LookupEntityTypeName="Sage.Entity.Interfaces.ICampaign, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null" >
                    <LookupProperties>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueCampaign.LookupProperties.Status.PropertyHeader %>"
                            PropertyName="Status" PropertyType="System.String" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueCampaign.LookupProperties.CampaignCode.PropertyHeader %>"
                            PropertyName="CampaignCode" PropertyType="System.String" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueCampaign.LookupProperties.CampaignName.PropertyHeader %>"
                            PropertyName="CampaignName" PropertyType="System.String" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueCampaign.LookupProperties.StartDate.PropertyHeader %>" UseAsResult="True"
                            PropertyName="StartDate" PropertyType="System.DateTime" PropertyFormat="DateTime" ExcludeFromFilters="False">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueCampaign.LookupProperties.EndDate.PropertyHeader %>" UseAsResult="True"
                            PropertyName="EndDate" PropertyType="System.DateTime" PropertyFormat="DateTime" ExcludeFromFilters="False">
                        </SalesLogix:LookupProperty>
                    </LookupProperties>
                    <LookupPreFilters>
                    </LookupPreFilters>
                </SalesLogix:LookupControl>
            </div>
        </td>
    </tr>
</table>
<div style="padding-right:20px; text-align:right">
    <asp:Panel runat="server" ID="pnlCancel" CssClass="controlslist qfActionContainer">
        <asp:Button runat="server" ID="btnSave" CssClass="slxbutton" Text="<%$ resources: cmdSave.Caption %>" />
        <asp:Button runat="server" ID="btnCancel" CssClass="slxbutton" Text="<%$ resources: cmdCancel.Caption %>" />
    </asp:Panel>
</div>