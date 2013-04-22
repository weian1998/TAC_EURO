<%@ Control Language="C#" AutoEventWireup="true" CodeFile="AddEditAccountAssociation.ascx.cs" Inherits="SmartParts_Association_AddEditAccountAssociation" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="AssociationForm_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="AssociationForm_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="AssociationForm_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkAddEditAssociationHelp" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>"
            Target="Help" NavigateUrl="associnfoa.aspx" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>        
    </asp:Panel>
    <asp:HiddenField runat="server" ID="Mode" />
    <asp:HiddenField runat="server" ID="hdtAccountId" />
    <asp:ImageButton runat="server" ID="cmdClose" OnClick="cmdClose_OnClick" ImageUrl="~/images/clear.gif"/>
</div>

<table id="tblAssoc" border="0" cellpadding="1" cellspacing="2">
    <col width="50%" />
    <col width="50%" />
    <tr>
        <td>
            <div runat="server" id="divFromIDDialog">
                <div class="textcontrol lookup">
                    <SalesLogix:LookupControl runat="server" ID="luFromIDDialog" LookupDisplayMode="Dialog" LookupEntityName="Account" LookupBindingMode="String"
                        LookupEntityTypeName="Sage.Entity.Interfaces.IAccount, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                        ReturnPrimaryKey="true">
                        <LookupProperties>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_AccountName.PropertyHeader %>" PropertyName="AccountName"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_City.PropertyHeader %>" PropertyName="Address.City"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_State.PropertyHeader %>" PropertyName="Address.State"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_MainPhone.PropertyHeader %>" PropertyName="MainPhone"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Type.PropertyHeader %>" PropertyName="Type"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_SubType.PropertyHeader %>" PropertyName="SubType"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Status.PropertyHeader %>" PropertyName="Status"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_AccountManager.PropertyHeader %>" PropertyType="System.String"
                                PropertyName="AccountManager.UserInfo.UserName" PropertyFormat="None" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Owner.PropertyHeader %>" PropertyName="Owner.OwnerDescription"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                        </LookupProperties>
                        <LookupPreFilters></LookupPreFilters>
                    </SalesLogix:LookupControl>
                </div>
            </div>
            <div runat="server" id="divFromIDText">
                <b>
                    <SalesLogix:LookupControl runat="server" ID="luFromIDText" LookupDisplayMode="Text" LookupEntityName="Account" LookupBindingMode="String"
                        LookupEntityTypeName="Sage.Entity.Interfaces.IAccount, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                        ReturnPrimaryKey="true" >
                        <LookupProperties>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_AccountName.PropertyHeader %>" PropertyName="AccountName"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                        </LookupProperties>
                        <LookupPreFilters></LookupPreFilters>
                    </SalesLogix:LookupControl>
                </b>
           </div>
        </td>
        <td>
            <div runat="server" id="divToIDDialog">
                <div class="textcontrol lookup" style="width: 90%">
                    <SalesLogix:LookupControl runat="server" ID="luToIDDialog" LookupEntityName="Account" LookupDisplayMode="Dialog" LookupBindingMode="String"
                        LookupEntityTypeName="Sage.Entity.Interfaces.IAccount, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                        ReturnPrimaryKey="true">
                        <LookupProperties>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_AccountName.PropertyHeader %>" PropertyName="AccountName"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_City.PropertyHeader %>" PropertyName="Address.City"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_State.PropertyHeader %>" PropertyName="Address.State"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_MainPhone.PropertyHeader %>" PropertyName="MainPhone"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Type.PropertyHeader %>" PropertyName="Type"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_SubType.PropertyHeader %>" PropertyName="SubType"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Status.PropertyHeader %>" PropertyName="Status"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_AccountManager.PropertyHeader %>" PropertyType="System.String"
                                PropertyName="AccountManager.UserInfo.UserName" PropertyFormat="None" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Owner.PropertyHeader %>" PropertyName="Owner.OwnerDescription"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                        </LookupProperties>
                        <LookupPreFilters></LookupPreFilters>
                    </SalesLogix:LookupControl>
                </div>
            </div>
            <div runat="server" id="divToIDText">
                <b>
                    <SalesLogix:LookupControl runat="server" ID="luToIDText" LookupEntityName="Account" LookupDisplayMode="Text" LookupBindingMode="String"
                        LookupEntityTypeName="Sage.Entity.Interfaces.IAccount, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                        ReturnPrimaryKey="true">
                        <LookupProperties>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_AccountName.PropertyHeader %>" PropertyName="AccountName"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                        </LookupProperties>
                        <LookupPreFilters></LookupPreFilters>
                    </SalesLogix:LookupControl>
                </b>
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="lblFromIsa" AssociatedControlID="luFromIDText" runat="server" Text="<%$ resources: lblIsA.Text %>"></asp:Label>
        </td>
        <td>
            <asp:Label ID="lblToIsa" AssociatedControlID="luToIDText" runat="server" Text="<%$ resources: lblIsA.Text %>"></asp:Label>
        </td>
    </tr>
    <tr>
        <td>
            <div class="textcontrol picklist">
                <SalesLogix:PickListControl runat="server" ID="pklForwardRelation" PickListId="kSYST0000011" PickListName="Association Types - Account"
                    MustExistInList="false" ValueStoredAsText="true" AlphaSort="true" />
            </div>
        </td>
        <td>
            <span class="textcontrol picklist">
                <SalesLogix:PickListControl runat="server" ID="pklBackRelation" PickListId="kSYST0000011" PickListName="Association Types - Account"
                    MustExistInList="false" ValueStoredAsText="true" AlphaSort="true" />
            </span>
        </td>
    </tr>
    <tr>
        <td>
            <div runat="server" id="divBackRelationToEdit">
                <span class="textcontrol lookup">
                    <asp:Label ID="lblBackRelatedTo_OfTo1" AssociatedControlID="luBackRelatedTo" runat="server" Text="<%$ resources: lblOfTo.Text %>"></asp:Label>
                    <b>
                    <SalesLogix:LookupControl runat="server" ID="luBackRelatedTo" Enabled="true" LookupEntityName="Account" LookupDisplayMode="Text"
                        LookupEntityTypeName="Sage.Entity.Interfaces.IAccount, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                        LookupBindingMode="String" ReturnPrimaryKey="true">
                        <LookupProperties>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_AccountName.PropertyHeader %>" PropertyName="AccountName"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Type.PropertyHeader %>" PropertyName="Type"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Status.PropertyHeader %>" PropertyName="Status"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                        </LookupProperties>
                        <LookupPreFilters></LookupPreFilters>
                    </SalesLogix:LookupControl>
                    </b>
                </span>
            </div>
            <div runat="server" id="divBackRelationToAdd">
                <span>
                    <asp:Label ID="lblBackRelatedTo_OfTo2" AssociatedControlID="lblBackRelationTo_Account" runat="server"
                        Text="<%$ resources: lblOfTo.Text %>">
                    </asp:Label>
                    <b>
                    <asp:Label ID="lblBackRelationTo_Account" runat="server"></asp:Label>
                    </b>
                </span>
            </div>
        </td>
        <td>
            <div class="textcontrol lookup">
                <asp:Label ID="lblFowardRelatedTo_OfTo" AssociatedControlID="luFowardRelatedTo" runat="server" Text="<%$ resources: lblOfTo.Text %>"></asp:Label>
                <b>
                <SalesLogix:LookupControl runat="server" ID="luFowardRelatedTo" Enabled="true" LookupEntityName="Account" LookupDisplayMode="Text"
                    LookupEntityTypeName="Sage.Entity.Interfaces.IAccount, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                    LookupBindingMode="String" ReturnPrimaryKey="true">
                    <LookupProperties>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_AccountName.PropertyHeader %>" PropertyName="AccountName"
                            PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Status.PropertyHeader %>" PropertyName="Status" PropertyFormat="None"
                            PropertyType="System.String" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                    </LookupProperties>
                    <LookupPreFilters></LookupPreFilters>
                </SalesLogix:LookupControl>
                </b>
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <div class="lbltop">
                <asp:Label ID="lblForwardNotes" AssociatedControlID="txtForwardNotes" runat="server" Text="<%$ resources: lblDescription.Text %>"></asp:Label>
            </div>
            <div class="textcontrol" style="width: 90%">
                <asp:TextBox runat="server" ID="txtForwardNotes" Rows="4" TextMode="MultiLine" Columns="40" dojoType="Sage.UI.Controls.SimpleTextarea" MaxLength="4" />
            </div> 
        </td>
        <td>
            <div class="lbltop">
                <asp:Label ID="lblBackNotes" AssociatedControlID="txtBackNotes" runat="server" Text="<%$ resources: lblDescription.Text %>"></asp:Label>
            </div>
            <div class="textcontrol" style="width: 90%">
                <asp:TextBox runat="server" ID="txtBackNotes" Rows="4" TextMode="MultiLine" Columns="40" dojoType="Sage.UI.Controls.SimpleTextarea" MaxLength="128" />
            </div> 
        </td>
    </tr>
</table>
<br/>
<div style="padding-right:20px; text-align:right" >
   <asp:Panel runat="server" ID="ctrlstButtons" CssClass="controlslist qfActionContainer">
        <asp:Button runat="server" ID="btnSave" CssClass="slxbutton" Text="<%$ resources: btnSave.Text %>" />
        <asp:Button runat="server" ID="btnCancel" CssClass="slxbutton" Text="<%$ resources: btnCancel.Text %>" />
    </asp:Panel>
</div>