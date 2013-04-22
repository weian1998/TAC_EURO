<%@ Control Language="C#" AutoEventWireup="true" CodeFile="CopyNewContact.ascx.cs" Inherits="SmartParts_Contact_CopyNewContact" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register TagPrefix="SalesLogix" Namespace="Sage.SalesLogix.Web.Controls" Assembly="Sage.SalesLogix.Web.Controls" %>
<%@ Register TagPrefix="SalesLogix" Namespace="Sage.SalesLogix.Web.Controls.Lookup" Assembly="Sage.SalesLogix.Web.Controls" %>

<div style="display:none">
    <asp:Panel ID="MoveContact_LTools" runat="server" meta:resourcekey="MoveContact_LToolsResource1"></asp:Panel>
    <asp:Panel ID="MoveContact_CTools" runat="server" meta:resourcekey="MoveContact_CToolsResource1"></asp:Panel>
    <asp:Panel ID="MoveContact_RTools" runat="server" meta:resourcekey="MoveContact_RToolsResource1">
        <SalesLogix:PageLink ID="MoveContactHelpLink" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" 
            Target="Help" NavigateUrl="contactduplicate.htm" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<table border="0" cellpadding="0" cellspacing="0" class="formtable">
    <col width="30%"/>
	<col width="35%"/>
    <col width="35%"/>
    <tr>
        <td>
            <div class="lbl alignleft">
                <asp:Label ID="lblCopy" runat="server" Text="<%$ resources:lblCopy.Text %>" AssociatedControlID="lblSourceContact" />
            </div>
            <div class="lbl">
                <asp:Label ID="lblSourceContact" runat="server" Text="<%$ resources:lblSourceContact.Text %>"></asp:Label>
            </div>
        </td>
  		<td colspan="2">
			<div class="textcontrol lookup">
			    <SalesLogix:LookupControl runat="server" ID="lueSourceContact" readonly="true" Enabled="false" LookupEntityName="Contact" AutoPostBack="true"
                    LookupEntityTypeName="Sage.SalesLogix.Entities.Contact, Sage.SalesLogix.Entities" EnableHyperLinking="false">
				    <LookupProperties>
				        <SalesLogix:LookupProperty PropertyHeader="Account" meta:resourcekey="LookupPropertyAccount" PropertyType="System.String"
                            PropertyName="AccountName" PropertyFormat="None" UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="Last Name" meta:resourcekey="LookupPropertyLastName" PropertyType="System.String"
                            PropertyName="LastName" PropertyFormat="None" UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="First Name" meta:resourcekey="LookupPropertyFirstName" PropertyType="System.String"
                            PropertyName="FirstName" PropertyFormat="None" UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="Work" meta:resourcekey="LookupPropertyWork" PropertyType="System.String"
                            PropertyName="WorkPhone" PropertyFormat="Phone" UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="Mobile" meta:resourcekey="LookupPropertyMobile" PropertyType="System.String"
                            PropertyName="Mobile" PropertyFormat="Phone" UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="E-mail" meta:resourcekey="LookupPropertyEmail" PropertyType="System.String"
                            PropertyName="Email" PropertyFormat="None" UseAsResult="True">
				        </SalesLogix:LookupProperty>
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
                <asp:Label ID="lblFrom" runat="server" Text="<%$ resources:lblFrom.Text %>" AssociatedControlID="lblSourceAccount" />
            </div>
            <div class="lbl">
                <asp:Label ID="lblSourceAccount" runat="server" Text="<%$ resources:lblSourceAccount.Text %>" ></asp:Label>
            </div>
        </td>
        <td colspan="2">
			<div class="textcontrol">
			    <asp:TextBox ID="txtSourceAccount" runat="server" dojoType="Sage.UI.Controls.TextBox" Enabled="False" ></asp:TextBox>
			</div>
		</td>
	</tr>
    <tr>
        <td>
            <div class="lbl alignleft">
                <asp:Label ID="lblTo" runat="server" Text="<%$ resources:lblToAccount.Text %>" AssociatedControlID="lblTargetAccount" />
            </div>
            <div class="lbl">
                <asp:Label ID="lblTargetAccount" runat="server" Text="<%$ resources:lblTargetAccount.Text %>" ></asp:Label>
            </div>
         </td>
         <td colspan="2">
            <div class="textcontrol lookup">
            	<SalesLogix:LookupControl runat="server" ID="lueTargetAccount" LookupEntityName="Account" EnableHyperLinking="false"
                    LookupEntityTypeName="Sage.SalesLogix.Entities.Account, Sage.SalesLogix.Entities" AutoPostBack="true">
				    <LookupProperties>
				        <SalesLogix:LookupProperty PropertyHeader="Account" PropertyName="AccountName" PropertyFormat="None" PropertyType="System.String"
                            UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="Main" PropertyName="MainPhone" PropertyFormat="Phone" PropertyType="System.String"
                            UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="Type" PropertyName="Type" PropertyFormat="None" PropertyType="System.String"
                            UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="Sub-Type" PropertyName="SubType" PropertyFormat="None" PropertyType="System.String"
                            UseAsResult="True">
				        </SalesLogix:LookupProperty>
				        <SalesLogix:LookupProperty PropertyHeader="Status" PropertyName="Status" PropertyFormat="None" PropertyType="System.String"
                            UseAsResult="True">
				        </SalesLogix:LookupProperty>
				    </LookupProperties>
				    <LookupPreFilters>
				    </LookupPreFilters>
			    </SalesLogix:LookupControl>
            </div>
		</td>
	</tr>
    <tr>
        <td colspan="3">
            <br/>
            <br/>
            <asp:Label ID="lblTargetAccountErr" runat="server" ForeColor="Red" Font-Italic="true" Text="<%$ resources:lblTargetAccountErr.Text %>" Visible="false" />
        </td>
    </tr>
    <tr>
	    <td colspan="3">
		    <div class="lblright checkbox" style="padding-left: 10px">
		        <asp:CheckBox ID="chkAssociateWithSource" runat="server" Text="<%$ resources:chkAssociateWithSource.Text %>" />
			</div>
	    </td>
	</tr>
	<tr>
        <td colspan="3">
		    <div class="lblright checkbox" style="padding-left: 10px">
			    <asp:CheckBox ID="chkUseTargetAddressPhn" runat="server" Text="<%$ resources:chkUseTargetAddressPhn.Text %>" Checked="True" />
			</div>
		</td>
	</tr>
    <tr>
        <td colspan="3">
            <br/>
        </td>
    </tr>
    <tr>
        <td colspan="3">
            <div class="lbl alignleft">
                <asp:Label ID="lblCopyFollowing" runat="server" Text="<%$ resources:lblCopyFollowing.Text %>" />
            </div>
        </td>
    </tr>
    <tr>
        <td colspan="3">
            <br/>
        </td>
    </tr>
    <tr>
        <td>
            <div class="lblright checkbox" style="padding-left: 10px">
                <asp:CheckBox ID="chkCopyActivities" runat="server" Text="<% $resources:chkCopyActivities.Text %>" />
            </div>
        </td>
        <td colspan="2">
            <div class="lblright checkbox" style="padding-left: 10px">
                <asp:CheckBox ID="chkCopyNotes" runat="server" Text="<%$ resources:chkCopyNotes.Text %>" />
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <div class="lblright checkbox" style="padding-left: 10px">
                <asp:CheckBox ID="chkCopyHistory" runat="server" Text="<%$ resources:chkCopyHistory.Text %>" />
            </div>
        </td>
    </tr>
</table>

<div style="padding-right:20px; text-align:right" >
   <asp:Panel runat="server" ID="pnlButtons" CssClass="controlslist qfActionContainer">
        <asp:Button ID="cmdOK" runat="server" Text="<%$ resources:cmdOK.Button.Text %>" CssClass="slxbutton" />
        <asp:Button runat="server" ID="cmdCancel" Text="<%$ resources: cmdCancel.Text %>" CssClass="slxbutton" />
    </asp:Panel>
</div>