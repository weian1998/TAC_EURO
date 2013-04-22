<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ManageTargets.ascx.cs" Inherits="ManageTargets" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>
<%@ Register TagPrefix="radU" Namespace="Telerik.Web.UI" Assembly="Telerik.Web.UI" %>

<style type="text/css">
.filterLayout
{
    padding-left: 2px;
	width : 50%;
}
</style>

<SalesLogix:SmartPartToolsContainer runat="server" ID="ManageTargets_RTools" ToolbarLocation="right">
    <SalesLogix:PageLink ID="lnkHelp" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" 
        Target="Help" NavigateUrl="campaignmanagetargets.aspx" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        &nbsp;
    </SalesLogix:PageLink>
</SalesLogix:SmartPartToolsContainer>

<div class="tws tws-main-section">
    <div class="tws tws-main-section tws-main-tab-buttons">
        <ul>
            <li runat="server" class="tws-tab-button tws-active-tab-button" id="tabLookupTarget">
                <a class="tws-tab-button-left" href="#" click="return false;">
                    <em class="tws-tab-button-right">
                        <span class="tws-tab-button-middle">
                            <span>
                                <asp:Localize ID="lclTabLookupTarget" runat="server" Text="<%$ resources:tabLookupTarget.Caption %>"></asp:Localize>
                            </span>
                        </span>
                    </em>
                </a>
            </li>
            <li runat="server" class="tws-tab-button" id="tabAddFromGroup">
                <a class="tws-tab-button-left" href="#" click="return false;">
                    <em class="tws-tab-button-right">
                        <span class="tws-tab-button-middle">
                            <span>
                                <asp:Localize ID="lclTabAddFromGroup" runat="server" Text="<%$ resources:tabAddFromGroup.Caption %>"></asp:Localize>
                            </span>
                        </span>
                    </em>
                </a>
            </li>
        </ul>
    </div>
</div>
<div style="clear: both;"></div>

<radU:RadProgressManager ID="radProcessProgressMgr" runat="server" SuppressMissingHttpModuleError="true" />
<div runat="server" id="divLookupTargets">
    <table border="0" cellpadding="1" cellspacing="0" class="Bevel ExtendWidth">
        <col width="14%" /> 
        <col width="32%" />
        <col width="3%" />
        <col width="14%" />
        <col width="32%" />
        <col width="1%" />
        <tr id="row1">
            <td colspan="6">
                <span class="slxlabel">
                    <asp:Label runat="server" ID="lblCaption" Text="<%$ resources: lblCaption.Text %>" />
                </span>
                <br/>
            </td>
        </tr>
        <tr id="row2">
            <td id="row2col1">
                <span class="slxlabel">
                    <asp:Label runat="server" ID="lblIncludeType" Text="<%$ resources: lblIncludeType.Caption %>" />
                </span>
            </td>
            <td colspan="5" id="row2col2">
                <fieldset class="slxlabel radio" style="margin-top: 5px;">
                    <asp:RadioButtonList runat="server" ID="rdgIncludeType" RepeatDirection="Horizontal" >
                        <asp:ListItem Text="<%$ resources: rdgIncludeType_Leads.Text %>" Value="<%$ resources: rdgIncludeType_Leads.Value %>" />
                        <asp:ListItem Text="<%$ resources: rdgIncludeType_Accounts.Text %>" Selected="True" Value="<%$ resources: rdgIncludeType_Accounts.Value %>" />
                        <asp:ListItem Text="<%$ resources: rdgIncludeType_AccountsAll.Text %>" Value="<%$ resources: rdgIncludeType_AccountsAll.Value %>" />
                        <asp:ListItem Text="<%$ resources: rdgIncludeType_Contacts.Text %>" Value="<%$ resources: rdgIncludeType_Contacts.Value %>" />
                    </asp:RadioButtonList>
                </fieldset>
            </td>
        </tr>
        <tr id="row3">
            <td id="row3col1">
                <div class="slxlabel alignleft">
                    <asp:CheckBox runat="server" ID="chkCompany" CssClass="checkbox" Text="<%$ resources: chkCompany.Caption %>" />
                </div>
            </td>
            <td id="row3col2">
                <div class="textcontrol select" style="width:45%">
                    <asp:ListBox runat="server" ID="lbxCompany" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1">
                        <asp:ListItem Text="<%$ resources: filter_StartingWith.Text %>" Value="<%$ resources: filter_StartingWith.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_Contains.Text %>" Value="<%$ resources: filter_Contains.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualTo.Text %>" Value="<%$ resources: filter_EqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_NotEqualTo.Text %>" Value="<%$ resources: filter_NotEqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualLessThan.Text %>" Value="<%$ resources: filter_EqualLessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualGreaterThan.Text %>" Value="<%$ resources: filter_EqualGreaterThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_LessThan.Text %>" Value="<%$ resources: filter_LessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_GreaterThan.Text %>" Value="<%$ resources: filter_GreaterThan.Value %>" />
                    </asp:ListBox>
                </div>
                <div class="textcontrol filterLayout">
                    <asp:TextBox runat="server" ID="txtCompany" dojoType="Sage.UI.Controls.TextBox" />
                </div>
            </td>
            <td id="row3col3"></td>
            <td id="row3col4">
                <div class="slxlabel alignleft">
                    <asp:CheckBox runat="server" ID="chkCity" CssClass="checkbox" Text="<%$ resources: chkCity.Caption %>" />
                </div>
            </td>
            <td id="row3col5">
                <div class="textcontrol select" style="width:45%">
                    <asp:ListBox runat="server" ID="lbxCity" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1">
                        <asp:ListItem Text="<%$ resources: filter_StartingWith.Text %>" Value="<%$ resources: filter_StartingWith.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_Contains.Text %>" Value="<%$ resources: filter_Contains.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualTo.Text %>" Value="<%$ resources: filter_EqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_NotEqualTo.Text %>" Value="<%$ resources: filter_NotEqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualLessThan.Text %>" Value="<%$ resources: filter_EqualLessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualGreaterThan.Text %>" Value="<%$ resources: filter_EqualGreaterThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_LessThan.Text %>" Value="<%$ resources: filter_LessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_GreaterThan.Text %>" Value="<%$ resources: filter_GreaterThan.Value %>" />
                    </asp:ListBox>
                </div>
                <div class="textcontrol filterLayout">
                    <asp:TextBox runat="server" ID="txtCity" dojoType="Sage.UI.Controls.TextBox"></asp:TextBox>
                </div>
            </td>
            <td></td>
        </tr>
        <tr id="row4">
            <td id="row4col1">
                <div class="slxlabel alignleft">
                    <asp:CheckBox runat="server" ID="chkIndustry" CssClass="checkbox" Text="<%$ resources: chkIndustry.Caption %>" />
                </div>
            </td>
            <td id="row4col2">
                <div class="textcontrol select" style="width:45%">
                    <asp:ListBox runat="server" ID="lbxIndustry" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1">
                        <asp:ListItem Text="<%$ resources: filter_StartingWith.Text %>" Value="<%$ resources: filter_StartingWith.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_Contains.Text %>" Value="<%$ resources: filter_Contains.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualTo.Text %>" Value="<%$ resources: filter_EqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_NotEqualTo.Text %>" Value="<%$ resources: filter_NotEqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualLessThan.Text %>" Value="<%$ resources: filter_EqualLessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualGreaterThan.Text %>" Value="<%$ resources: filter_EqualGreaterThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_LessThan.Text %>" Value="<%$ resources: filter_LessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_GreaterThan.Text %>" Value="<%$ resources: filter_GreaterThan.Value %>" />
                    </asp:ListBox>
                </div>
                <div class="textcontrol picklist filterLayout">
                    <SalesLogix:PickListControl runat="server" ID="pklIndustry" PickListName="Industry" MustExistInList="false" ValueStoredAsText="true"
                        NoneEditable="true" AlphaSort="true" />
                </div>
            </td>
            <td id="row4col3"></td>
            <td id="row4col4">
                <div class="slxlabel alignleft">
                    <asp:CheckBox runat="server" ID="chkState" CssClass="checkbox" Text="<%$ resources: chkState.Caption %>" />
                </div>
            </td>
            <td id="row4col5">
                <div class="textcontrol select" style="width:45%">
                    <asp:ListBox runat="server" ID="lbxState" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1">
                        <asp:ListItem Text="<%$ resources: filter_StartingWith.Text %>" Value="<%$ resources: filter_StartingWith.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_Contains.Text %>" Value="<%$ resources: filter_Contains.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualTo.Text %>" Value="<%$ resources: filter_EqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_NotEqualTo.Text %>" Value="<%$ resources: filter_NotEqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualLessThan.Text %>" Value="<%$ resources: filter_EqualLessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualGreaterThan.Text %>" Value="<%$ resources: filter_EqualGreaterThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_LessThan.Text %>" Value="<%$ resources: filter_LessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_GreaterThan.Text %>" Value="<%$ resources: filter_GreaterThan.Value %>" />
                    </asp:ListBox>
                </div>
                <div class="textcontrol filterLayout">
                    <asp:TextBox runat="server" ID="txtState" dojoType="Sage.UI.Controls.TextBox"></asp:TextBox>
                </div>
            </td>
            <td></td>
        </tr>
        <tr id="row5">
            <td id="row5col1">
                <div class="slxlabel alignleft">
                    <asp:CheckBox runat="server" ID="chkSIC" CssClass="checkbox" Text="<%$ resources: chkSIC.Caption %>" />
                </div>
            </td>
            <td id="row5col2">
                <div class="textcontrol select" style="width:45%">
                    <asp:ListBox runat="server" ID="lbxSIC"  data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1">
                        <asp:ListItem Text="<%$ resources: filter_StartingWith.Text %>" Value="<%$ resources: filter_StartingWith.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_Contains.Text %>" Value="<%$ resources: filter_Contains.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualTo.Text %>" Value="<%$ resources: filter_EqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_NotEqualTo.Text %>" Value="<%$ resources: filter_NotEqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualLessThan.Text %>" Value="<%$ resources: filter_EqualLessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualGreaterThan.Text %>" Value="<%$ resources: filter_EqualGreaterThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_LessThan.Text %>" Value="<%$ resources: filter_LessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_GreaterThan.Text %>" Value="<%$ resources: filter_GreaterThan.Value %>" />
                    </asp:ListBox>
                </div>
                <div class="textcontrol filterLayout">
                    <asp:TextBox runat="server" ID="txtSIC" dojoType="Sage.UI.Controls.TextBox"></asp:TextBox>
                </div>
            </td>
            <td id="row5col3"></td>
            <td id="row5col4">
                <div class="slxlabel alignleft">
                    <asp:CheckBox runat="server" ID="chkZip" CssClass="checkbox" Text="<%$ resources: chkZip.Caption %>" />
                </div>
            </td>
            <td id="row5col5">
                <div class="textcontrol select" style="width:45%">
                    <asp:ListBox runat="server" ID="lbxZip" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1">
                        <asp:ListItem Text="<%$ resources: filter_StartingWith.Text %>" Value="<%$ resources: filter_StartingWith.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_Contains.Text %>" Value="<%$ resources: filter_Contains.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualTo.Text %>" Value="<%$ resources: filter_EqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_NotEqualTo.Text %>" Value="<%$ resources: filter_NotEqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualLessThan.Text %>" Value="<%$ resources: filter_EqualLessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualGreaterThan.Text %>" Value="<%$ resources: filter_EqualGreaterThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_LessThan.Text %>" Value="<%$ resources: filter_LessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_GreaterThan.Text %>" Value="<%$ resources: filter_GreaterThan.Value %>" />
                    </asp:ListBox>
                </div>
                <div class="textcontrol filterLayout">
                    <asp:TextBox runat="server" ID="txtZip" dojoType="Sage.UI.Controls.TextBox"></asp:TextBox>
                </div>
            </td>
            <td></td>
        </tr>
        <tr id="row6">
            <td id="row6col1">
                <div class="slxlabel alignleft">
                    <asp:CheckBox runat="server" ID="chkTitle" CssClass="checkbox" Text="<%$ resources: chkTitle.Caption %>" />
                </div>
            </td>
            <td id="row6col2">
                <div class="textcontrol select" style="width:45%">
                    <asp:ListBox runat="server" ID="lbxTitle" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1">
                        <asp:ListItem Text="<%$ resources: filter_StartingWith.Text %>" Value="<%$ resources: filter_StartingWith.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_Contains.Text %>" Value="<%$ resources: filter_Contains.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualTo.Text %>" Value="<%$ resources: filter_EqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_NotEqualTo.Text %>" Value="<%$ resources: filter_NotEqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualLessThan.Text %>" Value="<%$ resources: filter_EqualLessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualGreaterThan.Text %>" Value="<%$ resources: filter_EqualGreaterThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_LessThan.Text %>" Value="<%$ resources: filter_LessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_GreaterThan.Text %>" Value="<%$ resources: filter_GreaterThan.Value %>" />
                    </asp:ListBox>
                </div>
                <div class="textcontrol picklist filterLayout">
                    <SalesLogix:PickListControl runat="server" ID="pklTitle" PickListName="Title" MustExistInList="false" AlphaSort="true" />
                </div>
            </td>
            <td id="row6col3"></td>
            <td id="row6col4">
                <div class="slxlabel alignleft">
                    <asp:CheckBox runat="server" ID="chkLeadSource" CssClass="checkbox" Text="<%$ resources: chkLeadSource.Caption %>" />
                </div>
            </td>
            <td id="row6col5">
                <div class="textcontrol select" style="width:45%">
                    <asp:ListBox runat="server" ID="lbxLeadSource" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1">
                        <asp:ListItem Text="<%$ resources: filter_StartingWith.Text %>" Value="<%$ resources: filter_StartingWith.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_Contains.Text %>" Value="<%$ resources: filter_Contains.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualTo.Text %>" Value="<%$ resources: filter_EqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_NotEqualTo.Text %>" Value="<%$ resources: filter_NotEqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualLessThan.Text %>" Value="<%$ resources: filter_EqualLessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualGreaterThan.Text %>" Value="<%$ resources: filter_EqualGreaterThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_LessThan.Text %>" Value="<%$ resources: filter_LessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_GreaterThan.Text %>" Value="<%$ resources: filter_GreaterThan.Value %>" />
                    </asp:ListBox>
                </div>
                <div class="textcontrol lookup filterLayout">
                    <SalesLogix:LookupControl runat="server" ID="lueLeadSource" LookupEntityName="LeadSource"
                        LookupEntityTypeName="Sage.Entity.Interfaces.ILeadSource, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null" >
                        <LookupProperties>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueLeadSource.LookupProperties.Type.PropertyHeader %>"
                                PropertyType="System.String" PropertyName="Type" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueLeadSource.LookupProperties.Description.PropertyHeader %>"
                                PropertyType="System.String" PropertyName="Description" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueLeadSource.LookupProperties.AbbrevDescription.PropertyHeader %>"
                                PropertyType="System.String" PropertyName="AbbrevDescription" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                            </SalesLogix:LookupProperty>
                        </LookupProperties>
                        <LookupPreFilters>
                            <SalesLogix:LookupPreFilter PropertyName="Status" PropertyType="System.String" OperatorCode="=" FilterValue="<%$ resources: LeadSource.LUPF.Status %>" ></SalesLogix:LookupPreFilter>
                        </LookupPreFilters>
                    </SalesLogix:LookupControl>
                </div>
            </td>
            <td></td>
        </tr>
        <tr id="row7">
            <td id="row7col1">
                <div class="slxlabel alignleft">
                    <asp:CheckBox runat="server" ID="chkProducts" CssClass="checkbox" Text="<%$ resources: chkProducts.Caption %>" />
                </div>
            </td>
            <td id="row7col2">
                <div runat="server" id="divProducts" >
                    <div class="textcontrol select" style="width:45%">
                        <asp:ListBox runat="server" ID="lbxProducts" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1">
                            <asp:ListItem Text="<%$ resources: filter_StartingWith.Text %>" Value="<%$ resources: filter_StartingWith.Value %>" />
                            <asp:ListItem Text="<%$ resources: filter_Contains.Text %>" Value="<%$ resources: filter_Contains.Value %>" />
                            <asp:ListItem Text="<%$ resources: filter_EqualTo.Text %>" Value="<%$ resources: filter_EqualTo.Value %>" />
                            <asp:ListItem Text="<%$ resources: filter_NotEqualTo.Text %>" Value="<%$ resources: filter_NotEqualTo.Value %>" />
                            <asp:ListItem Text="<%$ resources: filter_EqualLessThan.Text %>" Value="<%$ resources: filter_EqualLessThan.Value %>" />
                            <asp:ListItem Text="<%$ resources: filter_EqualGreaterThan.Text %>" Value="<%$ resources: filter_EqualGreaterThan.Value %>" />
                            <asp:ListItem Text="<%$ resources: filter_LessThan.Text %>" Value="<%$ resources: filter_LessThan.Value %>" />
                            <asp:ListItem Text="<%$ resources: filter_GreaterThan.Text %>" Value="<%$ resources: filter_GreaterThan.Value %>" />
                        </asp:ListBox>
                    </div>
                    <div class="textcontrol lookup filterLayout">
                        <SalesLogix:LookupControl runat="server" ID="lueProducts" LookupEntityName="Product"
                            LookupEntityTypeName="Sage.Entity.Interfaces.IProduct, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null">
                            <LookupProperties>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueProducts.LookupProperties.ActualId.PropertyHeader %>" PropertyName="ActualId"
                                    PropertyType="System.String" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueProducts.LookupProperties.Name.PropertyHeader %>"
                                    PropertyType="System.String" PropertyName="Name" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueProducts.LookupProperties.Vendor.PropertyHeader %>"
                                    PropertyType="System.String" PropertyName="Vendor" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                                </SalesLogix:LookupProperty>
                            </LookupProperties>
                            <LookupPreFilters>
                            </LookupPreFilters>
                        </SalesLogix:LookupControl>
                    </div>
                </div>
            </td>
            <td id="row7col3"></td>
            <td id="row7col4">
                <div class="slxlabel alignleft">
                    <asp:CheckBox runat="server" ID="chkImportSource" CssClass="checkbox" Text="<%$ resources: chkImportSource.Caption %>" />
                </div>
            </td>
            <td id="row7col5">
                <div class="textcontrol select" style="width:45%">
                    <asp:ListBox runat="server" ID="lbxImportSource" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1">
                        <asp:ListItem Text="<%$ resources: filter_StartingWith.Text %>" Value="<%$ resources: filter_StartingWith.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_Contains.Text %>" Value="<%$ resources: filter_Contains.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualTo.Text %>" Value="<%$ resources: filter_EqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_NotEqualTo.Text %>" Value="<%$ resources: filter_NotEqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualLessThan.Text %>" Value="<%$ resources: filter_EqualLessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualGreaterThan.Text %>" Value="<%$ resources: filter_EqualGreaterThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_LessThan.Text %>" Value="<%$ resources: filter_LessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_GreaterThan.Text %>" Value="<%$ resources: filter_GreaterThan.Value %>" />
                    </asp:ListBox>
                </div>
                <div class="textcontrol picklist filterLayout">
                    <SalesLogix:PickListControl runat="server" ID="pklImportSource" PickListName="Source" NoneEditable="true" AlphaSort="true" />
                </div>
            </td>
            <td></td>
        </tr>
        <tr id="row8">
            <td id="row8col1">
                <div class="slxlabel alignleft">
                    <asp:CheckBox runat="server" ID="chkStatus" CssClass="checkbox" Text="<%$ resources: chkStatus.Caption %>" />
                </div>
            </td>
            <td id="row8col2">
                <div class="textcontrol select" style="width:45%">
                    <asp:ListBox runat="server" ID="lbxStatus" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1">
                        <asp:ListItem Text="<%$ resources: filter_StartingWith.Text %>" Value="<%$ resources: filter_StartingWith.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_Contains.Text %>" Value="<%$ resources: filter_Contains.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualTo.Text %>" Value="<%$ resources: filter_EqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_NotEqualTo.Text %>" Value="<%$ resources: filter_NotEqualTo.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualLessThan.Text %>" Value="<%$ resources: filter_EqualLessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_EqualGreaterThan.Text %>" Value="<%$ resources: filter_EqualGreaterThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_LessThan.Text %>" Value="<%$ resources: filter_LessThan.Value %>" />
                        <asp:ListItem Text="<%$ resources: filter_GreaterThan.Text %>" Value="<%$ resources: filter_GreaterThan.Value %>" />
                    </asp:ListBox>
                </div>
                <div class="textcontrol picklist filterLayout" style="display:inline">
                    <SalesLogix:PickListControl runat="server" ID="pklStatus" PickListName="Lead Status" AlphaSort="true"
                        MustExistInList="false" ValueStoredAsText="true" NoneEditable="true" EnableViewState="true" />
                </div>        
            </td>
            <td id="row8col3"></td>
            <td id="row8col4">
                <div class="slxlabel alignleft">
                    <asp:CheckBox runat="server" ID="chkCreateDate" CssClass="checkbox" Text="<%$ resources: chkCreateDate.Caption %>" />
                </div>
            </td>
            <td id="row8col5">
                <div class="textcontrol datepicker" style="width:40%;padding-right:20px;">
                    <SalesLogix:DateTimePicker runat="server" ID="dtpCreateFromDate" DisplayTime="true"></SalesLogix:DateTimePicker>               
                </div>
                <div class="lbl" style="width:8%">
                    <asp:Label ID="dtpCreateToDate_lz" runat="server" AssociatedControlID="dtpCreateToDate"
                        Text="<%$ resources: dtpCreateToDate.Caption %>">
                    </asp:Label>
                </div>
                <div class="textcontrol datepicker" style="width:40%">
                    <SalesLogix:DateTimePicker runat="server" ID="dtpCreateToDate" DisplayTime="true"></SalesLogix:DateTimePicker>
                </div>
            </td>
            <td></td>
        </tr>
        <tr id="row9">
            <td id="row9col1">
                <div class="lbl">
                    <asp:Label runat="server" ID="lblDoNotIncludes"  Text="<%$ resources: lblDoNotIncludes.Caption %>"></asp:Label>
                </div>
            </td>
            <td id="row9col2" colspan="4">
                <div class="lbl" style="width:30%">
                    <asp:CheckBox runat="server" ID="chkSolicit" CssClass="checkbox" Text="<%$ resources: chkSolicit.Caption %>" />
                </div>
                <div class="lbl" style="width:30%">
                    <asp:CheckBox runat="server" ID="chkEmail" CssClass="checkbox" Text="<%$ resources: chkEmail.Caption %>" />
                </div>
                <div class="lbl" style="width:30%">
                    <asp:CheckBox runat="server" ID="chkCall" CssClass="checkbox" Text="<%$ resources: chkCall.Caption %>" />
                </div>
            </td>
            <td id="row9col4">
            </td>
            <td id="row9col5">
            </td>
            <td></td>
        </tr>
        <tr id="row10">
            <td id="row10col1"></td>
            <td id="row10col2" colspan="4">
                <div class="lbl" style="width:30%">
                    <asp:CheckBox runat="server" ID="chkMail" CssClass="checkbox" Text="<%$ resources: chkMail.Caption %>" />
                </div>
                <div class="lbl" style="width:30%">
                    <asp:CheckBox runat="server" ID="chkFax" CssClass="checkbox" Text="<%$ resources: chkFax.Caption %>" />
                </div>
            </td>
            <td id="row10col3"></td>
            <td id="row10col4"></td>
            <td id="row10col5"></td>
        </tr>
        <tr id="row11">
            <td id="row11col1"></td>
            <td id="row11col2"></td>
            <td id="row11col3" colspan="2">
                <asp:Panel runat="server" ID="ctrlstHowMany" CssClass="controlslist qfActionContainer">
                    <asp:Button runat="server" ID="cmdHowMany" OnClick="HowMany_OnClick" Text="<%$ resources: cmdHowMany.Caption %>" CssClass="slxbutton" />
                    <asp:Label ID="lblHowMany" runat="server" ></asp:Label>
                </asp:Panel>
            </td>
            <td id="row11col4">
                <asp:Panel runat="server" ID="ctrlstSearchClear" CssClass="controlslist qfActionContainer">
                    <asp:Button runat="server" ID="cmdSearch" OnClick="Search_OnClick" Text="<%$ resources: cmdSearch.Caption %>" CssClass="slxbutton" />
                    <asp:Button runat="server" ID="cmdClearAll" Text="<%$ resources: cmdClearAll.Caption %>" CssClass="slxbutton" />
                </asp:Panel>
            </td>
        </tr>
        <tr id="row12">
            <td colspan="5">
            </td>
        </tr>
    </table>
</div>

<div runat="server" id="divAddFromGroup" style="display:none">
    <table border="0" cellpadding="1" cellspacing="0" class="Bevel ExtendWidth">
        <col width="35%" />
        <col width="65%" />
        <tr>
            <td colspan="2">
                <span class="slxlabel">
                    <asp:Label runat="server" ID="lblAddFromGroup" Text="<%$ resources: lblAddFromGroup.Text %>" />
                </span>
                <br />
                <br />
            </td>
        </tr>
        <tr>
            <td rowspan="2">
                <fieldset class="slxlabel radio" >
                    <asp:RadioButtonList runat="server" ID="rdgAddFromGroup" RepeatDirection="vertical" >
                        <asp:ListItem Text="<%$ resources: rdgLeadGroup.Text %>" Value="<%$ resources: rdgLeadGroup.Value %>" />
                        <asp:ListItem Text="<%$ resources: rdgContactGroup.Text %>" Selected="True" Value="<%$ resources: rdgContactGroup.Value %>" />
                    </asp:RadioButtonList>
                </fieldset>                
            </td>
            <td>
                <div class="textcontrol select">
                    <asp:ListBox runat="server" ID="lbxLeadGroups" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1"></asp:ListBox>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="textcontrol select">
                    <asp:ListBox runat="server" ID="lbxContactGroups" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" SelectionMode="Single" Rows="1"></asp:ListBox>
                </div>
            </td>
        </tr>
        <tr>
            <td></td>
            <td>
                <br />
                <asp:Button runat="server" ID="cmdAddFromGroup" OnClick="AddFromGroup_OnClick" Text="<%$ resources: cmdSearch.Caption %>" CssClass="slxbutton" />
                <br />
                <br />
            </td>
        </tr>                        
    </table>
</div>
<br />

<table border="0" cellpadding="1" cellspacing="0" class="Bevel ExtendWidth">
    <col width="100%" />
    <tr>
        <td>
            <radu:radprogressarea ProgressIndicators="TotalProgressBar, TotalProgress" id="radInsertProcessArea" runat="server" EnableEmbeddedSkins="False"
                Skin="Slx" SkinsPath="~/Libraries/RadControls/upload/skins">
                <progresstemplate>
                    <table width="100%">
                        <tr>
                            <td align="center">
                                <div class="RadUploadProgressArea">
                                    <table class="RadUploadProgressTable" style="height:100;width:100%;">
                                        <tr>
                                            <td class="RadUploadTotalProgressData"  align="center">
                                                <asp:Label ID="Primary" runat="server" Text="<%$ resources: lblPrimary.Caption %>"></asp:Label>&nbsp;
                                                <!-- Percent of the Targets processed -->
                                                <asp:Label ID="PrimaryPercent" runat="server"></asp:Label>%&nbsp;
                                                <!-- Current record count of the Targets being processed -->
                                                <asp:Label ID="PrimaryValue" runat="server"></asp:Label>&nbsp;
                                                <!-- Total number of records to insert -->
                                                <asp:Label ID="PrimaryTotal" runat="server"></asp:Label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="RadUploadProgressBarHolder">
                                                <!-- Insert Targets primary progress bar -->
                                                <asp:Image ID="PrimaryProgressBar" runat="server" ImageUrl="~/images/icons/progress.gif" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <!-- Total number of records successfully inserted -->
                                            <td class="RadUploadFileCountProgressData">
                                                <asp:Label ID="lblInserted" runat="server" Text="<%$ resources: lblInserted.Caption %>"></asp:Label>&nbsp;
                                                <asp:Label ID="SecondaryValue" runat="server"></asp:Label>
                                            </td>
                                        </tr>
                                        <tr>
                                            <!-- Total number of records which failed to insert -->
                                            <td class="RadUploadFileCountProgressData">
                                                <asp:Label ID="lblFailed" runat="server" Text="<%$ resources: lblFailed.Caption %>"></asp:Label>&nbsp;
                                                <asp:Label ID="SecondaryTotal" runat="server"></asp:Label>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </table>
                </progresstemplate>
            </radu:radprogressarea>
            <SalesLogix:SlxGridView runat="server" ID="grdTargets" GridLines="None" AutoGenerateColumns="false" CellPadding="4" Height="230px"
                CssClass="datagrid" PagerStyle-CssClass="gridPager" AlternatingRowStyle-CssClass="rowdk" RowStyle-CssClass="rowlt"
                SelectedRowStyle-CssClass="rowSelected" EnableViewState="false" AllowPaging="true" ResizableColumns="True"
                PageSize="20" OnPageIndexChanging="grdTargetspage_changing" ExpandableRows="True" AllowSorting="true"
                OnSorting="grdTargets_Sorting" ShowEmptyTable="true" EmptyTableRowText="<%$ resources: grdTargets.EmptyTableRowText %>" >
                <Columns>
                    <asp:BoundField DataField="FirstName" HeaderText="<%$ resources: grdTargets.FirstName.ColumnHeading %>"
                        SortExpression="FirstName" />
                    <asp:BoundField DataField="LastName" HeaderText="<%$ resources: grdTargets.LastName.ColumnHeading %>"
                        SortExpression="LastName" />
                    <asp:BoundField DataField="Company" HeaderText="<%$ resources: grdTargets.Company.ColumnHeading %>"
                        SortExpression="Company" />
                    <asp:TemplateField HeaderText="<%$ resources: grdTargets.Email.ColumnHeading %>" SortExpression="Email">
                        <itemtemplate>
                            <SalesLogix:Email ID="Email1" runat="server" DisplayMode="AsHyperlink" Text='<%# Eval("Email") %>'></SalesLogix:Email>
                        </itemtemplate>
                    </asp:TemplateField>
                    <asp:BoundField DataField="City" HeaderText="<%$ resources: grdTargets.City.ColumnHeading %>"
                        SortExpression="City" />
                    <asp:BoundField DataField="State" HeaderText="<%$ resources: grdTargets.State.ColumnHeading %>"
                        SortExpression="State" />
                    <asp:BoundField DataField="Zip" HeaderText="<%$ resources: grdTargets.Zip.ColumnHeading %>"
                        SortExpression="Zip" />
                    <asp:TemplateField HeaderText="<%$ resources: grdTargets.WorkPhone.ColumnHeading %>" SortExpression="WorkPhone" >
                        <itemtemplate>
                            <SalesLogix:Phone ID="Phone1" runat="server" DisplayAsLabel="True" Text='<%# Eval("WorkPhone") %>' />
                        </itemtemplate>
                    </asp:TemplateField>
                    <asp:BoundField DataField="EntityId" Visible="False" />
                </Columns>
                <PagerSettings Mode="NumericFirstLast" FirstPageImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Start_16x16.gif"
                    LastPageImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=End_16x16" />
            </SalesLogix:SlxGridView>
        </td>
    </tr>
</table>
<div style="padding-right:20px; text-align:right" >
   <asp:Panel runat="server" ID="ctrlstAddCancel" CssClass="controlslist qfActionContainer">
        <asp:Button runat="server" ID="cmdAddTargets" Text="<%$ resources: cmdAdd.Caption %>" CssClass="slxbutton"/>
        <asp:Button runat="server" ID="cmdCancel" Text="<%$ resources: cmdCancel.Caption %>" CssClass="slxbutton" />
    </asp:Panel>
</div>