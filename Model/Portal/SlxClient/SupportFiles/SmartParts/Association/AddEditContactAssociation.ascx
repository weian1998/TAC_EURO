<%@ Control Language="C#" AutoEventWireup="true" CodeFile="AddEditContactAssociation.ascx.cs" Inherits="SmartParts_Association_AddEditContactAssociation" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="AssociationForm_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="AssociationForm_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="AssociationForm_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkAssociationHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="associnfoc.aspx"
            ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
    <asp:HiddenField runat="server" ID="Mode" />
    <asp:HiddenField runat="server" ID="hdtContactId" />
    <asp:ImageButton runat="server" ID="cmdClose" OnClick="cmdClose_OnClick" ImageUrl="~/images/clear.gif" />
</div>

<table border="0" cellpadding="0" cellspacing="2">
    <col width="50%" /><col width="50%" />
    <tr>
        <td>  
            <div runat="server" id="divFromIDDialog">
                <SalesLogix:LookupControl runat="server" ID="luFromIDDialog" LookupDisplayMode="Dialog" LookupEntityName="Contact" LookupBindingMode="String"
                    LookupEntityTypeName="Sage.Entity.Interfaces.IContact, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                    ReturnPrimaryKey="true">
                    <LookupProperties>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Name.PropertyHeader %>" PropertyName="NameLF" PropertyFormat="None"
                            PropertyType="System.String" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_AccountName.PropertyHeader %>" PropertyName="AccountName"
                            PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_City.PropertyHeader %>" PropertyName="Address.City"
                            PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_State.PropertyHeader %>" PropertyName="Address.State"
                            PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_WorkPhone.PropertyHeader %>" PropertyName="WorkPhone"
                            PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Email.PropertyHeader %>" PropertyName="Email"
                            PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                    </LookupProperties>
                    <LookupPreFilters></LookupPreFilters>
                </SalesLogix:LookupControl>
            </div>
            <div runat="server" id="divFromIDText" class="boldtext">

                    <SalesLogix:LookupControl runat="server" ID="luFromIDText" LookupDisplayMode="Text" LookupEntityName="Contact" LookupBindingMode="String"
                        LookupEntityTypeName="Sage.Entity.Interfaces.IContact, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                        ReturnPrimaryKey="true">
                        <LookupProperties>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_LastName.PropertyHeader %>" PropertyName="LastName"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_FirstName.PropertyHeader %>" PropertyName="FirstName"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                        </LookupProperties>
                    <LookupPreFilters></LookupPreFilters>
                    </SalesLogix:LookupControl>

            </div>
        </td>
        <td> 
            <div runat="server" id="divToIDDialog">
                <div class="textcontrol lookup" style="width: 90%">
                    <SalesLogix:LookupControl runat="server" ID="luToIDDialog" LookupDisplayMode="Dialog" LookupEntityName="Contact" LookupBindingMode="String"
                        LookupEntityTypeName="Sage.Entity.Interfaces.IContact, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                        ReturnPrimaryKey="true">
                        <LookupProperties>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Name.PropertyHeader %>" PropertyName="NameLF"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_AccountName.PropertyHeader %>" PropertyName="AccountName"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_City.PropertyHeader %>" PropertyName="Address.City"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_State.PropertyHeader %>" PropertyName="Address.State"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_WorkPhone.PropertyHeader %>" PropertyName="WorkPhone"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Email.PropertyHeader %>" PropertyName="Email"
                                PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                            </SalesLogix:LookupProperty>  
                        </LookupProperties>
                        <LookupPreFilters></LookupPreFilters>
                    </SalesLogix:LookupControl>
                </div>
            </div>
            <div runat="server" id="divToIDText">
                <b>
                <SalesLogix:LookupControl runat="server" ID="luToIDText" LookupDisplayMode="Text" LookupEntityName="Contact" LookupBindingMode="String"
                    LookupEntityTypeName="Sage.Entity.Interfaces.IContact, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                    ReturnPrimaryKey="true">
                    <LookupProperties>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_LastName.PropertyHeader %>" PropertyName="LastName"
                            PropertyType="System.String" PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_FirstName.PropertyHeader %>" PropertyName="FirstName"
                            PropertyType="System.String" PropertyFormat="None" UseAsResult="True">
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
            <asp:Label ID="lblFromIsA" AssociatedControlID="luFromIDDialog" runat="server" Text="<%$ resources: lblIsA.Text %>"></asp:Label>
        </td>
        <td>
            <asp:Label ID="lblToIsA" AssociatedControlID="luToIDDialog" runat="server" Text="<%$ resources: lblIsA.Text %>"></asp:Label>
        </td>
    </tr>
    <tr>
        <td>  
            <div class="textcontrol picklist">
                <SalesLogix:PickListControl runat="server" ID="pklForwardRelation" PickListId="kSYST0000012" PickListName="Association Types - Contact"
                    MustExistInList="false" ValueStoredAsText="true" AlphaSort="true" />
            </div> 
        </td>
        <td>
            <div class="textcontrol lookup">
                <SalesLogix:PickListControl runat="server" ID="pklBackRelation" PickListId="kSYST0000012" PickListName="Association Types - Contact"
                    MustExistInList="false" ValueStoredAsText="true" AlphaSort="true" />
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <div runat="server" id="divBackRelationToEdit">
                <div class="textcontrol lookup">
                    <asp:Label ID="lblBackRelatedTO_OfTo1" AssociatedControlID="luBackRelatedTo" runat="server" Text="<%$ resources: lblOfTo.Text %>"></asp:Label>
                    <b>
                        <SalesLogix:LookupControl runat="server" ID="luBackRelatedTo" LookupDisplayMode="Text" Enabled="true" LookupEntityName="Contact" LookupBindingMode="String"
                            LookupEntityTypeName="Sage.Entity.Interfaces.IContact, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                            ReturnPrimaryKey="true">
                            <LookupProperties>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Name.PropertyHeader %>" PropertyName="NameLF"
                                    PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_AccountName.PropertyHeader %>" PropertyName="AccountName"
                                    PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_City.PropertyHeader %>" PropertyName="Address.City"
                                    PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_State.PropertyHeader %>" PropertyName="Address.State"
                                    PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_WorkPhone.PropertyHeader %>" PropertyName="WorkPhone"
                                    PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Email.PropertyHeader %>" PropertyName="Email"
                                    PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                                </SalesLogix:LookupProperty>
                            </LookupProperties>
                            <LookupPreFilters></LookupPreFilters>
                        </SalesLogix:LookupControl>
                    </b>
                </div>
            </div>
            <div runat="server" id="divBackRelationToAdd">
                <span>
                    <asp:Label ID="lblBackRelatedTO_OfTo2" AssociatedControlID="lblBackRelationTo_Contact" runat="server" Text="<%$ resources: lblOfTo.Text %>" ></asp:Label>
                    <b>
                        <asp:Label ID="lblBackRelationTo_Contact" runat="server"></asp:Label>
                    </b>
                </span>
            </div>
        </td>
        <td>  
            <div class="textcontrol lookup">
                <asp:Label ID="FowardRelatedTo_OfTo" AssociatedControlID="luFowardRelatedTo" runat="server" Text="of/to" meta:resourcekey="lblOfTo"></asp:Label>
                <b>
                    <SalesLogix:LookupControl runat="server" ID="luFowardRelatedTo" LookupDisplayMode="Text"  Enabled="true" LookupEntityName="Contact" LookupBindingMode="String" ReturnPrimaryKey="true" LookupEntityTypeName="Sage.Entity.Interfaces.IContact, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"  >
                        <LookupProperties>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Name.PropertyHeader %>" PropertyName="NameLF"
                                    PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_AccountName.PropertyHeader %>" PropertyName="AccountName"
                                    PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_City.PropertyHeader %>" PropertyName="Address.City"
                                    PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_State.PropertyHeader %>" PropertyName="Address.State"
                                    PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_WorkPhone.PropertyHeader %>" PropertyName="WorkPhone"
                                    PropertyFormat="None" PropertyType="System.String" UseAsResult="True">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: Lookup_Email.PropertyHeader %>" PropertyName="Email"
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
            <span class="lbltop">
                <asp:Label ID="lblForwardNotes" AssociatedControlID="txtForwardNotes" runat="server" Text="<%$ resources: lblDescription.Text %>"></asp:Label>
            </span>
            <span class="textcontrol" style="width: 90%">
                <asp:TextBox runat="server" ID="txtForwardNotes" Rows="4" TextMode="MultiLine" Columns="40" dojoType="Sage.UI.Controls.SimpleTextarea" />
            </span>
        </td>
        <td>  
            <span class="lbltop">
                <asp:Label ID="lblBackNotes" AssociatedControlID="txtBackNotes" runat="server" Text="<%$ resources: lblDescription.Text %>"></asp:Label>
            </span>
            <span class="textcontrol" style="width: 90%">
                <asp:TextBox runat="server" ID="txtBackNotes" Rows="4" TextMode="MultiLine" Columns="40" dojoType="Sage.UI.Controls.SimpleTextarea" MaxLength="128" />
            </span>
        </td>
    </tr>
</table>
<br/>
<div style="padding-right:20px; text-align:right">
    <asp:Panel runat="server" ID="ctrlstButtons" CssClass="controlslist qfActionContainer">
        <asp:Button runat="server" ID="btnSave" Text="<%$ resources: cmdSave.Caption %>" CssClass="slxbutton" />
        <asp:Button runat="server" ID="btnCancel" Text="<%$ resources: cmdCancel.Caption %>" CssClass="slxbutton" />
    </asp:Panel>
</div>