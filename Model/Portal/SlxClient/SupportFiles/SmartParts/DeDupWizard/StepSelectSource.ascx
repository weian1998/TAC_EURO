<%@ Control Language="C#" AutoEventWireup="true" CodeFile="StepSelectSource.ascx.cs" Inherits="StepSelectSource" %>

<input id="jobName" type="hidden" runat="server" />
<input id="jobProcessId" type="hidden" runat="server" enableviewstate="true" />

<div class="Bevel" style="width:300px">
    <table runat="server" id="tblSelectFile" border="0" cellpadding="0" class="formtable" cellspacing="0">
        <tr>
            <td>
                <asp:Label ID="lblFileRequired" AssociatedControlID="ddlJobs" runat="server" Text="*" Visible="False" ForeColor="Red"></asp:Label>
                <div class="slxlabel">
                    <asp:Label ID="lblFile" AssociatedControlID="ddlJobs" runat="server" Text="<%$ resources: lblSelectSourceHeader.Caption %>"></asp:Label>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="textcontrol select" >
                    <asp:DropDownList ID="ddlJobs" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" runat="server" OnSelectedIndexChanged="ddlJobs_SelectedIndexChanged" AutoPostBack="true" EnableViewState="true" ></asp:DropDownList>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <br />
            </td>
        </tr>
        <tr>
            <td>
                <div class="slxlabel">
                    <asp:Label ID="lblGroup" AssociatedControlID="lbxAddHocGroups" runat="server" Text="<%$ resources: lblEntityGroup.Caption %>"></asp:Label>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="textcontrol select">
                    <asp:ListBox ID="lbxAddHocGroups" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" runat="server" SelectionMode="Single" Rows="1" EnableViewState="true"></asp:ListBox>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <br/>
                <span class="slxlabel">
                    <asp:Label ID="lblRequiredMsg" runat="server" Text="<%$ resources:lblRequiredMsg.Caption %>" ForeColor="Red" Visible="False" ></asp:Label>
                </span>
            </td>
        </tr>
    </table>
    <br />

    <div runat="server" id="divError" style="display:none">
        <span class="slxlabel">
            <asp:Label ID="lblError" runat="server"></asp:Label>
        </span>
    </div>
</div>