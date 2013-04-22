<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ImportActionScheduleActivity.ascx.cs" Inherits="ImportActionScheduleActivity" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="ImportActionScheduleActivity_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="ImportActionScheduleActivity_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="ImportActionScheduleActivity_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkScheduleActivityHelp" runat="server" LinkType="HelpFileName" Target="Help" NavigateUrl="leadimportactivity.htm"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<table border="0" cellpadding="1" cellspacing="0" class="formtable">
    <col width="50%" /><col width="50%" />
    <tr>
        <td>  
            <span class="twocollbl">
                <asp:Label ID="StartDate_lz" AssociatedControlID="dtpStartDate" runat="server" Text="<%$ resources: StartDate.Caption %>"></asp:Label>
            </span>
            <span class="textcontrol">
                <SalesLogix:DateTimePicker runat="server" ID="dtpStartDate" AutoPostBack="false" />
            </span> 
        </td>
        <td>
            <div class="slxlabel checkbox">
                <SalesLogix:SLXCheckBox runat="server" ID="chkTimeless" CssClass="checkbox" Text="<%$ resources: Timeless.Caption %>" TextAlign="Right"
                    AutoPostBack="True" OnCheckedChanged="chkTimeless_OnChange" />
            </div>
        </td>
    </tr>
    <tr>
        <td>  
            <span class="twocollbl"><asp:Label ID="Duration_lz" AssociatedControlID="dpDuration" runat="server" Text="<%$ resources: Duration.Caption %>"></asp:Label></span>
            <span>
                <SalesLogix:DurationPicker runat="server" ID="dpDuration" Width="33%" MaxLength="3" />
            </span>
        </td>
        <td>
            <div class="slxlabel checkbox">
                <SalesLogix:SLXCheckBox runat="server" ID="chkRollover" CssClass="checkbox" Text="<%$ resources: Rollover.Caption %>" TextAlign="Right"
                    AutoPostBack="False" />
            </div>
        </td>
    </tr>
    <tr>
        <td></td>
        <td>
            <div class="lbl checkbox" style="display: inline">
                <SalesLogix:SLXCheckBox runat="server" ID="chkAlarm" CssClass="checkbox" Text="<%$ resources: Reminder.Caption %>" TextAlign="Right"
                    AutoPostBack="False" />
            </div>
            <SalesLogix:DurationPicker runat="server" ID="dpReminderDuration" Width="55%" MaxLength="3" />
        </td>
    </tr>
    <tr>
        <td colspan="2">
            <span>
                <hr />
            </span>
        </td>
    </tr>
    <tr>
        <td>  
            <span class="twocollbl">
                <asp:Label ID="Description_lz" AssociatedControlID="pklDescription" runat="server" Text="<%$ resources: Description.Caption %>"></asp:Label>
            </span>
            <span class="twocoltextcontrol">
                <SalesLogix:PickListControl runat="server" ID="pklDescription" PickListId="kSYST0000027" PickListName="Note Regarding"
                    MustExistInList="false" AlphaSort="true" MaxLength="64" />
            </span> 
        </td>
        <td rowspan="4">
            <span class="twocollbl">
                <asp:Label ID="Notes_lz" AssociatedControlID="txtNotes" runat="server" Text="<%$ resources: Notes.Caption %>"></asp:Label>
            </span>
            <span class="twocoltextcontrol">
                <asp:TextBox runat="server" ID="txtNotes" TextMode="MultiLine" Columns="20" Rows="4" />
            </span> 
        </td>
    </tr>
    <tr>
        <td>
            <span class="twocollbl">
                <asp:Label ID="Priority_lz" AssociatedControlID="pklPriority" runat="server" Text="<%$ resources: Priority.Caption %>"></asp:Label>
            </span>
            <span class="twocoltextcontrol">
                <SalesLogix:PickListControl runat="server" ID="pklPriority" PickListId="kSYST0000028" PickListName="Priorities" MustExistInList="false"
                    MaxLength="64" AlphaSort="false" />
            </span>
        </td>
    </tr>
    <tr>
        <td>
            <span class="twocollbl">
                <asp:Label ID="Category_lz" AssociatedControlID="pklCategory" runat="server" Text="<%$ resources: Category.Caption %>"></asp:Label>
            </span>
            <span class="twocoltextcontrol">
                <SalesLogix:PickListControl runat="server" ID="pklCategory" PickListId="kSYST0000015" PickListName="Meeting Category Codes"
                    MustExistInList="false" AlphaSort="true" MaxLength="64" />
            </span>
        </td>
    </tr>
</table>
<div style="padding-right:20px; text-align:right">
    <asp:Panel runat="server" ID="pnlCancel" CssClass="controlslist qfActionContainer">
        <asp:Button runat="server" ID="btnSave" CssClass="slxbutton"  Text="<%$ resources: cmdSave.Caption %>" />
        <asp:Button runat="server" ID="btnCancel" CssClass="slxbutton" Text="<%$ resources: cmdCancel.Caption %>" />
    </asp:Panel>
</div>