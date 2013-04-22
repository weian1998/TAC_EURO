<%@ Control Language="C#" AutoEventWireup="true"  CodeFile="MoveContact.ascx.cs" Inherits="SmartParts_Contact_MoveContact" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="MoveContact_LTools" runat="server" meta:resourcekey="MoveContact_LToolsResource1"></asp:Panel>
    <asp:Panel ID="MoveContact_CTools" runat="server" meta:resourcekey="MoveContact_CToolsResource1"></asp:Panel>
    <asp:Panel ID="MoveContact_RTools" runat="server" meta:resourcekey="MoveContact_RToolsResource1">
        <SalesLogix:PageLink ID="MoveContactHelpLink" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help"
            NavigateUrl="contactmove.htm" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<table border="0" cellpadding="1" cellspacing="0">
    <col width="2%" />
    <col width="15%"/>
    <col width="20%"/>
	<col width="30%"/>
    <col width="33%"/>
    <tr>
        <td colspan="5">
            <span class="slxlabel wizardsectiontext">
                <asp:Label ID="lblHeaderText" runat="server" Text="<%$ resources:lblHeader.Text %>" ></asp:Label>
            </span>
        </td>
    </tr>
	<tr>
	    <td></td>
		<td>
            <span class="slxlabel">
                <asp:Label ID="lblMoveSourcelbl" runat="server" Text="<%$ resources:lblMoveSourceLbl.Text %>"></asp:Label>
            </span>
        </td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblSourceContact" runat="server" Text="<%$ resources:lblSourceContact.Text %>"></asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol lookup width90">
                <SalesLogix:LookupControl runat="server" ID="lueSourceContact" Enabled="false" readonly="true" LookupEntityName="Contact" AutoPostBack="true"
                    LookupEntityTypeName="Sage.SalesLogix.Entities.Contact, Sage.SalesLogix.Entities" EnableHyperLinking="false">
                    <LookupProperties>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyAccount.Text %>" PropertyType="System.String" PropertyName="AccountName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyLastName.Text %>" PropertyType="System.String" PropertyName="LastName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyFirstName.Text %>" PropertyType="System.String" PropertyName="FirstName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyWork.Text %>" PropertyType="System.String" PropertyName="WorkPhone"
                            PropertyFormat="Phone" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyMobile.Text %>" PropertyType="System.String" PropertyName="Mobile"
                            PropertyFormat="Phone" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyEmail.Text %>" PropertyType="System.String" PropertyName="Email"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        </LookupProperties>                                    
                        <LookupPreFilters>
                    </LookupPreFilters>
                </SalesLogix:LookupControl>
            </span>
		</td>
        <td></td>
    </tr>
	<tr>
	    <td></td>
		<td>
		    <span class="slxlabel">
                <asp:Label ID="lblMoveFromLbl" runat="server" Text="<%$ resources:lblMoveFromLbl.Text %>"></asp:Label>
            </span>
        </td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblSourceAccount" runat="server" Text="<%$ resources:lblSourceAccount.Text %>"></asp:Label>
            </span>
        </td>
        <td>
			<span class="textcontrol width90">
			    <asp:TextBox ID="txtSourceAccount" runat="server" Enabled="False" dojoType="Sage.UI.Controls.TextBox"></asp:TextBox>
			</span>
		</td>
	</tr>
	<tr>
	    <td></td>
		<td>
            <span class="slxlabel">
                <asp:Label ID="lblMoveToAcctLbl" runat="server" Text="<%$ resources:lblMoveToAcctLbl.Text %>"></asp:Label>
            </span>
         </td>
         <td>
             <span class="slxlabel">
                <asp:Label ID="lblTargetAccount" runat="server" Text="<%$ resources:lblTargetAccount.Text %>"></asp:Label>
            </span>
         </td>
         <td>
             <span class="textcontrol lookup width90">
                 <SalesLogix:LookupControl runat="server" ID="lueTargetAccount" LookupEntityName="Account" EnableHyperLinking="false" AutoPostBack="true"
                    LookupEntityTypeName="Sage.SalesLogix.Entities.Account, Sage.SalesLogix.Entities">
				    <LookupProperties>
				        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyAccount.Text %>" PropertyName="AccountName" PropertyFormat="None"
                            PropertyType="System.String" UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyMainPhone.Text %>" PropertyName="MainPhone" PropertyFormat="Phone"
                            PropertyType="System.String" UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyType.Text %>" PropertyName="Type" PropertyFormat="None"
                            PropertyType="System.String" UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertySubType.Text %>" PropertyName="SubType" PropertyFormat="None"
                            PropertyType="System.String" UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyStatus.Text %>" PropertyName="Status" PropertyFormat="None"
                            PropertyType="System.String" UseAsResult="True">
				        </SalesLogix:LookupProperty>
                    </LookupProperties>
				    <LookupPreFilters>
				    </LookupPreFilters>
                </SalesLogix:LookupControl>
            </span>
            <div runat="server" id="divTargetAccountError" class="errorText" Visible="False">
                *
            </div>
        </td>
    </tr>
    <tr>
        <td colspan="4">
            <span class="slxlabel wizardsectiontext">
                <asp:Label ID="lblMoveOptions" runat="server" Text="<%$ resources:lblMoveOptions.Text %>"></asp:Label>
            </span>
        </td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td colspan="3">
            <span class="slxlabel">
                <asp:Label ID="lblAddressPhone" runat="server" Text="<%$ resources:lblAddressPhone.Text %>"></asp:Label>
            </span>
        </td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td colspan="4">
		    <span class="slxlabel lblright checkbox">
		        <asp:CheckBox ID="chkUseSourceAddressPhn" runat="server" Text="<%$ resources:chkUseSourceAddressPhn.Caption %>" Checked="True" />
			</span>
		</td>
	</tr>
    <tr>
        <td></td>
        <td colspan="4">
            <span class="errorText">
                <asp:Label ID="lblSingleContact" runat="server" Visible="false" />
            </span>
        </td>
    </tr>
    <tr>
        <td colspan="3">
            <span class="slxlabel wizardsectiontext">
                <asp:Label ID="lblReassign" runat="server" Text="<%$ resources:lblReassign.Text %>"></asp:Label>
            </span>  
        </td>
        <td colspan="2"></td>
    </tr>
    <tr>
        <td></td>
        <td colspan="4">
            <span class="slxlabel">
                <asp:Label ID="lblReassignInfo" runat="server" Text="<%$ resources:lblReassignInfo.Text %>"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td><br/></td>
    </tr>
    <tr>
        <td></td>
        <td colspan="4">
            <span class="slxlabel radio">
                <asp:RadioButton runat="server" ID="rdbMoveActivity" Text="<%$ resources: rdgOptionsMoveActivtyInfo.Text %>" GroupName="ActivityGroup"
                    Checked="True" CssClass="radio" AutoPostBack="True" OnCheckedChanged="rdgMoveActivities_OnChanged" />
                </span>
        </td>
    </tr>
    <tr>
        <td></td>
        <td colspan="2">
            <span class="slxlabel radio">
                <asp:RadioButton runat="server" ID="rdbDontMoveActivity" Text="<%$ resources: rdgOptionsDoNotMoveActivtyInfo.Text %>" GroupName="ActivityGroup"
                    Checked="False" CssClass="radio" AutoPostBack="True" OnCheckedChanged="rdgMoveActivities_OnChanged" />
                </span>
        </td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblDontMove" runat="server" Text="<%$ resources: lblReassignToContact.Text %>"></asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol lookup width90">
                <SalesLogix:LookupControl runat="server" ID="lueReassignActivity" LookupEntityName="Contact" SeedProperty="Account.Id" Enabled="False"
                    LookupEntityTypeName="Sage.SalesLogix.Entities.Contact, Sage.SalesLogix.Entities" EnableHyperLinking="false">
				    <LookupProperties>
				        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyAccount.Text %>" PropertyType="System.String" PropertyName="AccountName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyLastName.Text %>" PropertyType="System.String" PropertyName="LastName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyFirstName.Text %>" PropertyType="System.String" PropertyName="FirstName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyWork.Text %>" PropertyType="System.String" PropertyName="WorkPhone"
                            PropertyFormat="Phone" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyMobile.Text %>" PropertyType="System.String" PropertyName="Mobile"
                            PropertyFormat="Phone" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyEmail.Text %>" PropertyType="System.String" PropertyName="Email"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
				    </LookupProperties>                                    
				    <LookupPreFilters>
				    </LookupPreFilters>
				</SalesLogix:LookupControl>
             </span>
             <div runat="server" id="divActivityContactError" class="errorText" Visible="False">
                *
            </div>
		</td>
    </tr>
    <tr>
        <td><br/></td>
    </tr>
    <tr>
        <td></td>
        <td colspan="4">
            <span class="slxlabel radio">
                <asp:RadioButton runat="server" ID="rdbMoveHistory" Text="<%$ resources: rdgOptionsMoveNotesHistory.Text %>" GroupName="HistoryGroup"
                    Checked="True" CssClass="radio" AutoPostBack="True" OnCheckedChanged="rdgMoveNotesHistory_OnChanged" />
            </span>
        </td>
    </tr>
    <tr>
        <td></td>
        <td colspan="2">
            <span class="slxlabel radio">
                <asp:RadioButton runat="server" ID="rdbDontMoveHistory" Text="<%$ resources: rdgOptionsDoNotMoveNotesHistory.Text %>" GroupName="HistoryGroup"
                    Checked="False" AutoPostBack="True" OnCheckedChanged="rdgMoveNotesHistory_OnChanged" CssClass="radio" />
            </span>
        </td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblHistoryReassign" runat="server" Text="<%$ resources: lblReassignToContact.Text %>"></asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol lookup width90">
                <SalesLogix:LookupControl runat="server" ID="lueReassignNotesHistory" LookupEntityName="Contact" SeedProperty="Account.Id"
                    LookupEntityTypeName="Sage.SalesLogix.Entities.Contact, Sage.SalesLogix.Entities" EnableHyperLinking="false">
				    <LookupProperties>
				        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyAccount.Text %>" PropertyType="System.String" PropertyName="AccountName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyLastName.Text %>" PropertyType="System.String" PropertyName="LastName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyFirstName.Text %>" PropertyType="System.String" PropertyName="FirstName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyWork.Text %>" PropertyType="System.String" PropertyName="WorkPhone"
                            PropertyFormat="Phone" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyMobile.Text %>" PropertyType="System.String" PropertyName="Mobile"
                            PropertyFormat="Phone" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyEmail.Text %>" PropertyType="System.String" PropertyName="Email"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
				    </LookupProperties>
				    <LookupPreFilters>
				    </LookupPreFilters>
				</SalesLogix:LookupControl>
             </span>
             <div runat="server" id="divNotesContactError" class="errorText" Visible="False">
                *
            </div>
        </td>
    </tr>
    <tr>
        <td><br/></td>
    </tr>
    <tr>
        <td></td>
        <td colspan="4">
            <span class="slxlabel">
                <asp:Label ID="lblCantMoveItems" runat="server" Text="<%$ resources:lblCantMoveItemsInfo.Text %>"></asp:Label>
            </span>
            <br/>
            <br/>
        </td>
    </tr>
    <tr>
        <td></td>
        <td colspan="4">
            <span class="slxlabel">
                <asp:Label ID="lblCantMoveOpenItems" runat="server" Text="<%$ resources: lblReassignOpenItems.Text %>"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td colspan="3"></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblReassignOpenItems" AssociatedControlID="lueReassignOpenItems" runat="server" Text="<%$ resources: lblReassignToContact.Text %>"></asp:Label>
            </span>
        </td>
        <td>
            <div class="textcontrol lookup width90">
                <SalesLogix:LookupControl runat="server" ID="lueReassignOpenItems" LookupEntityName="Contact" SeedProperty="Account.Id"
                    LookupEntityTypeName="Sage.SalesLogix.Entities.Contact, Sage.SalesLogix.Entities" EnableHyperLinking="false">
				    <LookupProperties>
				        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyAccount.Text %>" PropertyType="System.String" PropertyName="AccountName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyLastName.Text %>" PropertyType="System.String" PropertyName="LastName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyFirstName.Text %>" PropertyType="System.String" PropertyName="FirstName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyWork.Text %>" PropertyType="System.String" PropertyName="WorkPhone"
                            PropertyFormat="Phone" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyMobile.Text %>" PropertyType="System.String" PropertyName="Mobile"
                            PropertyFormat="Phone" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyEmail.Text %>" PropertyType="System.String" PropertyName="Email"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
				    </LookupProperties>                                    
				    <LookupPreFilters>
				    </LookupPreFilters>
				</SalesLogix:LookupControl>
            </div>
            <div runat="server" id="divOpenItemsError" class="errorText" Visible="False">
                *
            </div>
        </td>
    </tr>
    <tr>
        <td></td>
        <td colspan="3">
            <span class="slxlabel">
                <asp:Label ID="lblCantMoveClosedItems" runat="server" Text="<%$ resources: lblReassignClosedItems.Text %>"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td colspan="3"></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblReassignClosedItems" AssociatedControlID="lueReassignClosedItems" runat="server" Text="<%$ resources: lblReassignToContact.Text %>"></asp:Label>
            </span>
        </td>
        <td>
            <div class="textcontrol lookup width90">
                <SalesLogix:LookupControl runat="server" ID="lueReassignClosedItems" LookupEntityName="Contact" SeedProperty="Account.Id" AllowClearingResult="True"
                    LookupEntityTypeName="Sage.SalesLogix.Entities.Contact, Sage.SalesLogix.Entities" EnableHyperLinking="false">
				    <LookupProperties>
				        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyAccount.Text %>" PropertyType="System.String" PropertyName="AccountName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyLastName.Text %>" PropertyType="System.String" PropertyName="LastName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyFirstName.Text %>" PropertyType="System.String" PropertyName="FirstName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyWork.Text %>" PropertyType="System.String" PropertyName="WorkPhone"
                            PropertyFormat="Phone" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyMobile.Text %>" PropertyType="System.String" PropertyName="Mobile"
                            PropertyFormat="Phone" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyEmail.Text %>" PropertyType="System.String" PropertyName="Email"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
				    </LookupProperties>                                    
				    <LookupPreFilters>
				    </LookupPreFilters>
				</SalesLogix:LookupControl>
            </div>
            <div runat="server" id="divClosedItemsError" class="errorText" Visible="False">
                *
            </div>
        </td>
    </tr>
    <tr>
        <td></td>
        <td colspan="3">
            <span class="slxlabel">
                <asp:Label ID="lblReassignSupportItems" runat="server" Text="<%$ resources: lblReassignSupportItems.Text %>"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td colspan="3"></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblReassingSupportItems" AssociatedControlID="lueReassignSupportItems" runat="server" Text="<%$ resources: lblReassignToContact.Text %>"></asp:Label>
            </span>
        </td>
        <td>
            <div class="textcontrol lookup width90">
                <SalesLogix:LookupControl runat="server" ID="lueReassignSupportItems" LookupEntityName="Contact" SeedProperty="Account.Id"
                    LookupEntityTypeName="Sage.SalesLogix.Entities.Contact, Sage.SalesLogix.Entities" EnableHyperLinking="false">
				    <LookupProperties>
				        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyAccount.Text %>" PropertyType="System.String" PropertyName="AccountName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyLastName.Text %>" PropertyType="System.String" PropertyName="LastName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyFirstName.Text %>" PropertyType="System.String" PropertyName="FirstName"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyWork.Text %>" PropertyType="System.String" PropertyName="WorkPhone"
                            PropertyFormat="Phone" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyMobile.Text %>" PropertyType="System.String" PropertyName="Mobile"
                            PropertyFormat="Phone" UseAsResult="True">
                        </SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="<%$ resources:LookupPropertyEmail.Text %>" PropertyType="System.String" PropertyName="Email"
                            PropertyFormat="None" UseAsResult="True">
                        </SalesLogix:LookupProperty>
				    </LookupProperties>                                    
				    <LookupPreFilters>
				    </LookupPreFilters>
				</SalesLogix:LookupControl>
            </div>
            <div runat="server" id="divReassignSupportItems" class="errorText" Visible="False">
                *
            </div>
        </td>
    </tr>
    <tr>
        <td></td>
        <td colspan="3">
            <br/>
            <span class="errorText">
                <asp:Label ID="lblErrorText" runat="server" Visible="false" />
            </span>
        </td>
    </tr>
    <tr>
        <td colspan="4"></td>
        <td align="right">
            <asp:Panel runat="server" ID="pnlButtons" CssClass="controlslist qfActionContainer">
                <asp:Button runat="server" ID="cmdOK" Text="<%$ resources:cmdOK.Text %>" CssClass="slxbutton" />
                <asp:Button runat="server" ID="cmdCancel" Text="<%$ resources: cmdCancel.Text %>" CssClass="slxbutton" />
            </asp:Panel>
        </td>
    </tr>
 </table>