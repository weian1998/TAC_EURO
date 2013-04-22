<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ActivitiesOptions.ascx.cs" Inherits="ActivityOptionsPage" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup" TagPrefix="SalesLogix" %>

<style type="text/css">
    .chkstyle
    {
        padding-left:5px;
        padding-right:10px;
        wdith:40px;
    }
    .actlbl
    {
        text-align:left;
        font-size:85%;
        font-weight:bold;
        font-family: Tahoma, Arial Unicode MS, Arial, Helvetica, Sans-Serif;
    }
</style>

<div style="display:none">
<asp:Panel ID="LitRequest_RTools" runat="server" meta:resourcekey="LitRequest_RToolsResource1">
    <asp:ImageButton runat="server" ID="btnSave" OnClick="_save_Click" ToolTip="Save" ImageUrl="~/images/icons/Save_16x16.gif" meta:resourcekey="btnSaveResource1" OnClientClick="sessionStorage.clear();" />
    <SalesLogix:PageLink ID="ActivitiesOptsHelpLink" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources:Portal, Help_ToolTip %>" ImageUrl="~/ImageResource.axd?scope=global&amp;type=Global_Images&amp;key=Help_16x16"
     Target="Help" NavigateUrl="prefsactivities.aspx" Text=""></SalesLogix:PageLink>
</asp:Panel>
</div>


<table border="0" cellpadding="1" cellspacing="0" class="formtable" style="margin-top:0px;">
  <tr>
		<td class="highlightedCell" >
			<asp:Label ID="lblActivityOptions" runat="server" Font-Bold="True" Text="<%$ resources:lblActivityOptions.Text %>" ></asp:Label>
		</td>
	</tr>
 </table>

 <table border="0" cellpadding="1" cellspacing="0" class="formtable" style="margin-top:0px">
	<col width="50%" /><col width="50%" />  
    <tr>
		<td>
			<span class="lbl"><asp:Label ID="lblDefaultView" runat="server" Text="<%$ resources:lblDefaultView.Text %>" ></asp:Label></span>
        	<span class="textcontrol">
	            <asp:DropDownList ID="ddlDefaultView" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server" DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDefaultViewResource1">
			    </asp:DropDownList>
			</span>
        </td>
        <td>&nbsp;</td>
    </tr>
    <tr>
 		<td>
			<span class="lbl"><asp:Label ID="lblDefaultFollowupActivity" runat="server" Text="<%$ resources:lblDefaultFollowupActivity.Text %>" ></asp:Label></span>
            	<span class="textcontrol">
				<asp:DropDownList ID="ddlDefaultFollowupActivity" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server" DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDefaultFollowupActivityResource1">
				</asp:DropDownList>
			</span>
        </td>
        <td>&nbsp;		
		</td>
    </tr>
    <tr style="white-space: nowrap">
 		<td>
			<span class="lbl"><asp:Label ID="lblCarryOverNotes" runat="server" Text="<%$ resources:lblCarryOverNotes.Text %>" ></asp:Label></span>
            <span class="textcontrol">
				<asp:DropDownList ID="ddlCarryOverNotes" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server" DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlCarryOverNotes">
				</asp:DropDownList>
			</span>
        </td>
        <td>&nbsp;			
		</td>
    </tr>
    <tr style="white-space: nowrap">
 		<td>
			<span class="lbl"><asp:Label ID="lblCarryOverAttachments" runat="server" Text="<%$ resources:lblCarryOverAttachments.Text %>" ></asp:Label></span>
            <span class="textcontrol">
				<asp:DropDownList ID="ddlCarryOverAttachments" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server" DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlCarryOverAttachments">
				</asp:DropDownList>
			</span>
        </td>
        <td>&nbsp;			
		</td>
    </tr>
    <tr>
        <td>
            <span class="lbl"><asp:Label ID="lblPastDue" runat="server" Text="<%$ resources:lblPastDue.Caption %>" ></asp:Label></span>
            <asp:CheckBox ID="chkPastDue" runat="server" onclick="javascript:Sage.UI.Forms.ActivityOptions.togglePastDue();" />
        </td>
        <td></td>
    </tr>

    </table>

  <table border="0" cellpadding="1" cellspacing="0" style="margin-top:0px; width:60%">
       
    <tr>
        <td colspan="5" style="padding-bottom: 8px; padding-top:10px">
            <asp:Label ID="lblDefaultsPerActivity" runat="server" Font-Bold="True" Text="<%$ resources:lblDefaultsPerActivity.Text %>" ></asp:Label>
        </td>
   </tr>
   <tr>
       <td style="width:15%">
            <span class="actlbl"><asp:Label ID="lblActivityType" runat="server" Text="<%$ resources:lblActivityType.Text %>" /></span> 
        </td>
        <td style="width:20%">
            <span class="actlbl"><asp:Label ID="lblDefaultAlarm" runat="server" Text="<%$ resources:lblDefaultAlarm.Text %>" /></span>
         </td>
        <td style="width:20%">
            <span class="actlbl"><asp:Label ID="lblDefaultDuration" runat="server" Text="<%$ resources:lblDefaultDuration.Text %>" /></span>
        </td>
        <td style="width:17%">
            <span class="actlbl"><asp:Label ID="lblDefaultTimeless" runat="server" Text="<%$ resources:lblDefaultTimeless.Text %>" /></span>
         </td>
        <td style="width:15%"> 
            <span class="actlbl"><asp:Label ID="lblDefaultRollover" runat="server" Text="<%$ resources:lblDefaultRollover.Text %>" /></span> 
         </td>
   </tr>
    <tr>
        <td style="padding-left:10px">
              <asp:Label ID="lblActivityType_Meeting"  Width="120px"  runat="server" Text="<%$ resources:lblActivityType_Meeting.Text%>" />
        </td>
        <td>
           	<span class="textcontrol">  <asp:DropDownList ID="ddlDefaultAlarmValue_Meeting" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server" DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDefaultAlarmValue_MeetingResource1" /></span>
        </td>
        <td>
           	<span class="textcontrol">  <asp:DropDownList ID="ddlDefaultDuration_Meeting" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server" DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDefaultDuration_MeetingResource1" /></span>
        </td>
        <td>
              <asp:CheckBox ID="chkTimelessMeeting"  runat="server" CssClass="chkstyle" onclick="javascript:Sage.UI.Forms.ActivityOptions.toggleAutoRolloverMeeting();"  />
        </td>
        <td>
              <asp:CheckBox ID="chkRolloverMeeting" runat="server" CssClass="chkstyle" onclick="javascript:Sage.UI.Forms.ActivityOptions.toggleAutoRolloverMeeting();"   />
        </td>
    </tr>
    <tr>
        <td style="padding-left:10px;">
            <asp:Label ID="lblActivityType_PhoneCall" runat="server"  Width="120px" Text="<%$ resources:lblActivityType_PhoneCall.Text %>" />
        </td>
        <td>
          	<span class="textcontrol">  <asp:DropDownList ID="ddlDefaultAlarmValue_PhoneCall" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"  DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDefaultAlarmValue_PhoneCallResource1" /></span>
        </td>
        <td>
          	<span class="textcontrol">  <asp:DropDownList ID="ddlDefaultDuration_PhoneCall" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server" DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDefaultDuration_PhoneCallResource1" /></span>
        </td>
        <td>
             <asp:CheckBox ID="chkTimelessPhoneCall" runat="server" CssClass="chkstyle" onclick="javascript:Sage.UI.Forms.ActivityOptions.toggleAutoRolloverPhoneCall();"   />
        </td>
        <td>
             <asp:CheckBox ID="chkRolloverPhoneCall" runat="server" CssClass="chkstyle" onclick="javascript:Sage.UI.Forms.ActivityOptions.toggleAutoRolloverPhoneCall();"    />
        </td>
    </tr>
    <tr>
         <td style="padding-left:10px">
                <asp:Label ID="lblActivityType_ToDo" runat="server"   Width="120px"  Text="<%$ resources:lblActivityType_ToDo.Text %>" />
         </td>
         <td>
              	<span class="textcontrol">  <asp:DropDownList ID="ddlDefaultAlarmValue_ToDo" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"  DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDefaultAlarmValue_ToDoResource1" /></span>
        </td>
         <td>
               	<span class="textcontrol"> <asp:DropDownList ID="ddlDefaultDuration_ToDo" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server" DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDefaultDuration_ToDoResource1" /></span>
        </td>
        <td>
                <asp:CheckBox ID="chkTimelessToDo" runat="server" CssClass="chkstyle"  onclick="javascript:Sage.UI.Forms.ActivityOptions.toggleAutoRolloverToDo();"  />
        </td>
         <td>
                <asp:CheckBox ID="chkRolloverToDo" runat="server" CssClass="chkstyle"  onclick="javascript:Sage.UI.Forms.ActivityOptions.toggleAutoRolloverToDo();"   />
        </td>
    </tr>
    <tr>
        <td style="padding-left:10px">
              <asp:Label ID="lblActivityType_PersonalActivity"   Width="120px" runat="server" Text="<%$ resources:lblActivityType_PersonalActivity.Text %>" />
        </td>
         <td>
            	<span class="textcontrol">  <asp:DropDownList ID="ddlDefaultAlarmValue_PersonalActivity" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control"  runat="server"  DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDefaultAlarmValue_PersonalActivityResource1" /></span>
        </td>
         <td>
             	<span class="textcontrol"> <asp:DropDownList ID="ddlDefaultDuration_PersonalActivity" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" runat="server"  DataTextField="Key" DataValueField="Value" meta:resourcekey="ddlDefaultDuration_PersonalActivityResource1" /></span>
        </td>
        <td>
                <asp:CheckBox ID="chkTimelessPersonalActivity" runat="server" CssClass="chkstyle"  onclick="javascript:Sage.UI.Forms.ActivityOptions.toggleAutoRolloverPersonal();"   />
        </td>
         <td>
                <asp:CheckBox ID="chkRolloverPersonalActivity" runat="server" CssClass="chkstyle"  onclick="javascript:Sage.UI.Forms.ActivityOptions.toggleAutoRolloverPersonal();"    />
        </td>
    </tr>
</table>
