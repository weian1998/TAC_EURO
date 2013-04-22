<%@ Control Language="C#" AutoEventWireup="true" CodeFile="CalendarOptionsPage.ascx.cs"
    Inherits="CalendarOptionsPage" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup"
    TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes"
    TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList"
    TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls"
    TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup"
    TagPrefix="SalesLogix" %>
<div style="display: none">
    <asp:Panel ID="LitRequest_RTools" runat="server" meta:resourcekey="LitRequest_RToolsResource1">
        <asp:ImageButton runat="server" ID="btnSave" OnClick="_save_Click" ToolTip="Save"
            ImageUrl="~/images/icons/Save_16x16.gif" meta:resourcekey="btnSaveResource1" OnClientClick="sessionStorage.clear();" />
        <SalesLogix:PageLink ID="CalendarOptsHelpLink" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources:Portal, Help_ToolTip %>" ImageUrl="~/ImageResource.axd?scope=global&amp;type=Global_Images&amp;key=Help_16x16"
            Target="Help" NavigateUrl="prefscalendar.aspx" meta:resourcekey="CalendarOptsHelpLinkResource2"
            Text=""></SalesLogix:PageLink>
    </asp:Panel>
</div>
<table border="0" cellpadding="1" cellspacing="0" class="formtable" style="margin-top: 0px;">
    <tr>
        <td colspan="2" style="height: 14px" valign="top" class="highlightedCell">
            <asp:Label ID="lblCalendarOptions" runat="server" Font-Bold="True" Text="<%$ resources:lblCalendarOptions.Text %>"></asp:Label>
        </td>
    </tr>
    <tr>
        <td>
            <span class="lbl">
                <asp:Label ID="lblDefCalView" runat="server" Text="<%$ resources:lblDefCalView.Text %>"></asp:Label></span>
            <span class="textcontrol">
                <asp:DropDownList ID="ddlDefaultCalendarView" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"
                    DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDefaultCalendarViewResource1">
                </asp:DropDownList>
            </span>
        </td>
        <td>
            <span class="lbl">
                <asp:Label ID="lblDisplayContactAccount" runat="server" Text="<%$ resources:lblDisplayContactAccount.Text %>"></asp:Label></span>
            <span class="textcontrol">
                <asp:DropDownList ID="ddlDisplayContactAccount" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"
                    DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDisplayContactAccountResource1">
                </asp:DropDownList>
            </span>
        </td>
    </tr>
    <tr>
        <td>
            <span class="lbl">
                <asp:Label ID="lblNumberOfEvents" runat="server" Text="<%$ resources:lblNumberOfEvents.Text %>"></asp:Label></span>
            <span class="textcontrol">
                <asp:DropDownList ID="ddlNumberOfEvents" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"
                    DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlNumberOfEventsResource1">
                </asp:DropDownList>
            </span>
        </td>
        <td>
            <span class="lbl">
                <asp:Label ID="lblDayStart" runat="server" Text="<%$resources:lblDayStart.Text %>"></asp:Label></span>
            <span class="textcontrol">
                <asp:DropDownList ID="ddlDayStart" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server" DataTextField="Key"
                    DataValueField="Value" meta:resourcekey="ddlDayStartResource1">
                </asp:DropDownList>
            </span>
        </td>
    </tr>
    <tr>
        <td>
            <span class="lbl">
                <asp:Label ID="lblShowHist" runat="server" Text="Show History on Calendar:" meta:resourcekey="lblShowHistResource1"></asp:Label></span>
            <span class="textcontrol">
                <asp:DropDownList ID="ddlShowHistoryOnDayView" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"
                    DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlShowHistoryOnDayViewResource1">
                    <asp:ListItem Value="T" Text="Yes" meta:resourcekey="lblRememberSelectedUsersYes" />
                    <asp:ListItem Value="F" Text="No" meta:resourcekey="lblRememberSelectedUsersNo" />
                </asp:DropDownList>
            </span>
        </td>
        <td>
            <span class="lbl">
                <asp:Label ID="lblDayEnd" runat="server" Text="<%$resources:lblDayEnd.Text %>"></asp:Label></span>
            <span class="textcontrol">
                <asp:DropDownList ID="ddlDayEnd" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server" DataTextField="Key"
                    DataValueField="Value" meta:resourcekey="ddlDayEndResource1">
                </asp:DropDownList>
            </span>
        </td>
    </tr>
    <tr>
        <td>
            <span class="lbl">
                <asp:Label ID="lblRememberSelectedUsers" runat="server" Text="<%$resources:lblRememberSelectedUsers.Text %>"></asp:Label></span>
            <span class="textcontrol">
                <asp:DropDownList ID="ddlRememberSelectedUsers" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"
                    DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlRememberSelectedUsersResource1">
                    <asp:ListItem Value="T" Text="Yes" meta:resourcekey="lblRememberSelectedUsersYes" />
                    <asp:ListItem Value="F" Text="No" meta:resourcekey="lblRememberSelectedUsersNo" />
                </asp:DropDownList>
            </span>
        </td>
        <td>
            <span class="lbl">
                <asp:Label ID="lblDefInterval" runat="server" Text="<%$resources:lblDefInterval.Text %>"></asp:Label></span>
            <span class="textcontrol">
                <asp:DropDownList ID="ddlDefaultInterval" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"
                    DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDefaultIntervalResource1">
                </asp:DropDownList>
            </span>
        </td>
    </tr>
    <tr>
        <td>
            <span class="lbl">
                <asp:Label ID="lblShowOnActivities" runat="server" Text="<%$resources:lblShowOnActivities.Text %>"></asp:Label></span>
        </td>
        <td>
            <span class="lbl">
                <asp:Label ID="lblDefaultActivityType" runat="server" Text="<%$ resources:lblDefaultActivityType.Text %>"></asp:Label></span>
            <span class="textcontrol">
                <asp:DropDownList ID="ddlDefaultActivityType" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"
                    meta:resourcekey="ddlDefaultActivityTypeResource1">
                </asp:DropDownList>
            </span>
        </td>
    </tr>
    <tr>
        <td>
            <span class="lblright" style="padding-right: 5px">
                <asp:CheckBox ID="chkOpportunity" runat="server" Text="<%$ resources:chkOpportunity.Caption %>" />
            </span><span class="lblright" style="padding-right: 5px">
                <asp:CheckBox ID="chkPhoneNumber" runat="server" Text="<%$ resources:chkPhoneNumber.Caption %>" />
            </span><span class="lblright" style="padding-right: 5px">
                <asp:CheckBox ID="chkRegarding" runat="server" Text="<%$ resources:chkRegarding.Caption %>" />
            </span><span class="lblright" style="padding-right: 5px">
                <asp:CheckBox ID="chkTime" runat="server" Text="<%$ resources:chkTime.Caption %>" />
            </span>
        </td>
    </tr>
    <tr>
        <td>
        </td>
        <td>
        </td>
        <%--        <td>
            <div style="display: none;">
                <span class="lbl">
                    <asp:Label ID="lblWeekBars" runat="server" Text="<%$ resources:lblWeekBars.Text %>"></asp:Label></span>
                <span class="textcontrol">
                    <asp:DropDownList ID="ddlWeekBars" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server" meta:resourcekey="ddlWeekBarsResource1">
                    </asp:DropDownList>
                </span>
            </div>
        </td>--%>
    </tr>
    <tr>
        <td>
            <span class="lbl">
                <asp:Label ID="lblWorkWeek" runat="server" Text="<%$resources:lblWorkWeek.Text %>"></asp:Label></span>
        </td>
        <td>
        </td>
    </tr>
    <tr>
        <td colspan="2">
            <span class="lblright" style="padding-right: 5px">
                <asp:CheckBox ID="chkSun" runat="server" Text="<%$ resources:chkSun.Caption %>" />
            </span><span class="lblright" style="padding-right: 5px">
                <asp:CheckBox ID="chkMon" runat="server" Text="<%$ resources:chkMon.Caption %>" />
            </span><span class="lblright" style="padding-right: 5px">
                <asp:CheckBox ID="chkTue" runat="server" Text="<%$ resources:chkTue.Caption %>" />
            </span><span class="lblright" style="padding-right: 5px">
                <asp:CheckBox ID="chkWed" runat="server" Text="<%$ resources:chkWed.Caption %>" />
            </span><span class="lblright" style="padding-right: 5px">
                <asp:CheckBox ID="chkThu" runat="server" Text="<%$ resources:chkThu.Caption %>" />
            </span><span class="lblright" style="padding-right: 5px">
                <asp:CheckBox ID="chkFri" runat="server" Text="<%$ resources:chkFri.Caption %>" />
            </span><span class="lblright" style="padding-right: 5px">
                <asp:CheckBox ID="chkSat" runat="server" Text="<%$ resources:chkSat.Caption %>" />
            </span>
        </td>
    </tr>
    <tr>
        <td>
            <span class="lbl">
                <asp:Label ID="lblFirstDayOfWeek" runat="server" Text="<%$resources:lblFirstDayOfWeek.Text %>"></asp:Label></span>
            <span class="textcontrol">
                <asp:DropDownList ID="ddlFirstDayOfWeek" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"
                    DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlFirstDayOfWeekResource1">
                </asp:DropDownList>
            </span>
        </td>
        <td>
            <div style="display: none;">
                <span class="lbl">
                    <asp:Label ID="lblFirstWeekOfYear" runat="server" Text="<%$resources:lblFirstWeekOfYear.Text %>"></asp:Label></span>
                <span class="textcontrol">
                    <asp:DropDownList ID="ddlFirstWeekOfYear" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"
                        DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlFirstDayOfWeekResource1">
                    </asp:DropDownList>
                </span>
            </div>
        </td>
    </tr>
</table>