<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ImportActionAddNote.ascx.cs" Inherits="ImportActionAddNote" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="ImportActionAddNote_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="ImportActionAddNote_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="ImportActionAddNote_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkAddActionNoteHelp" runat="server" LinkType="HelpFileName" Target="Help" NavigateUrl="leadimportnote.htm"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<table border="0" cellpadding="1" cellspacing="0" class="formtable">
    <col width="60%" /><col width="40%" />
    <tr>
        <td>
            <div class="lbl alignleft">
                <asp:Label ID="StartDate_lbl" AssociatedControlID="dtpStartDate" runat="server" Text="<%$ resources: StartDate.Caption %>"></asp:Label>
            </div>
            <div class="textcontrol datepicker">
                <SalesLogix:DateTimePicker runat="server" ID="dtpStartDate" />
            </div>
        </td>
        <td rowspan="7">
            <div class="lbltop">
                <asp:Label ID="Notes_lbl" AssociatedControlID="txtNotes" runat="server" Text="<%$ resources: Notes.Caption %>" ></asp:Label>
            </div>   
            <div class="textcontrol" style="width: 100%" >
                <asp:TextBox runat="server" ID="txtNotes" TextMode="MultiLine" Columns="160" Rows="8" />
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <div class="slxlabel alignleft checkboxRight">
                <SalesLogix:SLXCheckBox runat="server" ID="chkTimeless" CssClass="checkboxRight" Text="<%$ resources: Timeless.Caption %>" TextAlign="left"
                    AutoPostBack="true" OnCheckedChanged="chkTimeless_OnChange" />
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
        <td>
            <div class="lbl alignleft">
                <asp:Label ID="Duration_lbl" AssociatedControlID="dpDuration" runat="server" Text="<%$ resources: Duration.Caption %>"></asp:Label>
            </div>
            <div class="duration">
                <SalesLogix:DurationPicker runat="server" ID="dpDuration" Width="55%" />
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
        <td>
            <div class="lbl alignleft">
                <asp:Label ID="Description_lbl" AssociatedControlID="pklDescription" runat="server" Text="<%$ resources: Description.Caption %>"></asp:Label>
            </div>
            <div class="textcontrol picklist">
                <SalesLogix:PickListControl runat="server" ID="pklDescription" PickListID="kSYST0000027" PickListName="Note Regarding" MustExistInList="false"
                    AlphaSort="true" />
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
        <td>
            <div class="lbl alignleft">
                <asp:Label ID="Category_lbl" AssociatedControlID="pklCategory" runat="server" Text="<%$ resources: Category.Caption %>"></asp:Label>
            </div>
            <div class="textcontrol picklist">
                <SalesLogix:PickListControl runat="server" ID="pklCategory" PickListID="kSYST0000015" PickListName="Meeting Category Codes"
                    MustExistInList="false" AlphaSort="true" />
            </div>
        </td>
        <td></td>
    </tr>
</table>
<div style="padding-right:20px; text-align:right" >
   <asp:Panel runat="server" ID="pnlCancel" CssClass="controlslist qfActionContainer">
        <asp:Button runat="server" ID="btnSave" CssClass="slxbutton" Text="<%$ resources: btnSave.Caption %>" />
        <asp:Button runat="server" ID="btnCancel" CssClass="slxbutton" Text="<%$ resources: btnCancel.Caption %>" />
    </asp:Panel>
</div>