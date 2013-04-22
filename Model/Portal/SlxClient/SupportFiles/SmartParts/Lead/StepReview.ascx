<%@ Control Language="C#" AutoEventWireup="true" CodeFile="StepReview.ascx.cs" Inherits="StepReview" %>

<div style="display:none">
    <asp:Button runat="server" ID="cmdStartImportProcess" OnClick="cmdStartProcess_Click" Visible="True" />
</div>
<table border="0" cellpadding="1" cellspacing="0" class="formtable" style="width:100%">
    <col width="1%" /><col width="35%" /><col width="64%" />
    <tr>
        <td colspan="3">
            <span class="slxlabel">
                <asp:Label ID="lblHeader" runat="server" Text="<%$ resources:lblHeader.Caption %>"></asp:Label>
            </span>
        </td>
    </tr>
        <td colspan="3">
            <span class="slxlabel">
                <asp:Label ID="lblImportNumber" runat="server" Text="<%$ resources:lblImportNumber.Caption %>" Visible="False"></asp:Label>
            </span>
            <span>
                <a runat="server" id="lnkImportHistory"><asp:Localize ID="lnkImportHistoryCaption" runat="server" /></a>
            </span>
            <br/>
            <br/>
        </td>
    <tr>
        <td></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblImportFile" runat="server" Text="<%$ resources:lblImportFile.Caption %>" AssociatedControlID="lblImportFileValue"></asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:Label ID="lblImportFileValue" runat="server"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblDefaultOwner" runat="server" Text="<%$ resources:lblDefaultOwnder.Caption %>" AssociatedControlID="lblDefaultOwnerValue"></asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:Label ID="lblDefaultOwnerValue" runat="server"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblLeadSource" runat="server" Text="<%$ resources:lblDefaultLeadSource.Caption %>" AssociatedControlID="lblLeadSourceValue"></asp:Label>
            </span>
        </td>
        <td>      
            <span class="textcontrol">
                <asp:Label ID="lblLeadSourceValue" runat="server"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblAddToGroup" runat="server" Text="<%$ resources:lblAddToGroup.Caption %>" AssociatedControlID="lblAddToGroupValue"></asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:Label ID="lblAddToGroupValue" runat="server"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblLeadsGroup" runat="server" Text="<%$ resources:lblLeadsGroup.Caption %>" AssociatedControlID="lblLeadsGroupValue"></asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:Label ID="lblLeadsGroupValue" runat="server"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblCheckDuplicates" runat="server" Text="<%$ resources:lblCheckDuplicates.Caption %>" AssociatedControlID="lblCheckDuplicatesValue"></asp:Label>
            </span>
        </td>
        <td>
            <asp:Label ID="lblCheckDuplicatesValue" runat="server"></asp:Label>
        </td>
    </tr>
    <tr>
        <td></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblGroupAction" runat="server" Text="<%$ resources:lblGroupAction.Caption %>"></asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
               <asp:BulletedList ID="blActions" runat="server" BulletStyle="Circle" ></asp:BulletedList>
            </span>
        </td>
    </tr>
    <tr>
        <td colspan="2"></td>
        <td style="text-align: right;padding-right: 20px">
            <br/>
            <span>
                <a runat="server" id="lnkImportLeadsWizard" href="..\\..\\ImportLead.aspx">
                    <asp:Localize ID="lblImportLeadsWizard" Text="<%$ resources:lblImportLeadsWizard.Caption %>" runat="server" Visible="False" />
                </a>
            </span>
        </td>
    </tr>
</table>