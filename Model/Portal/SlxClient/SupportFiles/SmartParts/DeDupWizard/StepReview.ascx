<%@ Control Language="C#" AutoEventWireup="true" CodeFile="StepReview.ascx.cs" Inherits="StepReview" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>

<table border="0" cellpadding="1" cellspacing="0" class="formtable" style="width:100%">
    <col width="1%" />
    <col width="35%" />
    <col width="64%" />
    <tr>
        <td colspan="3">
            <span class="slxlabel">
                <asp:Label ID="lblHeader" runat="server" Text="<%$ resources:lblHeader.Caption %>"></asp:Label>
            </span>
            <br />
            <br />
            <br />
        </td>
    </tr>
    <tr>
        <td></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblJobName" runat="server" Text="<%$ resources:lblJobName.Caption %>" AssociatedControlID="lblJobNameValue"></asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:Label ID="lblJobNameValue" runat="server"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblEnitySource" runat="server" Text="<%$ resources:lblEntitySource.Caption %>" AssociatedControlID="lblEntitySourceValue"></asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:Label ID="lblEntitySourceValue" runat="server"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td></td>
        <td>
            <span class="slxlabel">
                <asp:Label ID="lblGroup" runat="server" Text="<%$ resources:lblGroup.Caption %>" AssociatedControlID="lblGroupValue"></asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:Label ID="lblGroupValue" runat="server"></asp:Label>
            </span>
        </td>
    </tr>
</table>