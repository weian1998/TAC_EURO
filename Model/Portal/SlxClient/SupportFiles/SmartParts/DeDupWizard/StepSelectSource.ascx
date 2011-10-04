<%@ Control Language="C#" AutoEventWireup="true" CodeFile="StepSelectSource.ascx.cs" Inherits="StepSelectSource" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>


<input id="jobName" type="hidden" runat="server" />
<input id="jobProcessId" type="hidden" runat="server" enableviewstate="true" />

<div runat="server" id="divMainContent">
    <div runat="server" style="text-align:left; border-style:solid; border-color:#99BBE8; border-width:1px; padding:5px; width:400px">
        <table runat="server" id="tblSelectFile" border="0" cellpadding="0" class="formtable" cellspacing="0" >
            <tr>
                <td>
                    <asp:Label ID="lblFileRequired" AssociatedControlID="ddlJobs" runat="server" Text="*" Visible="False" ForeColor="Red"></asp:Label>
                        <span class="slxlabel" style="margin-left:10px;width:95%">
                            <asp:Label ID="lblFile" AssociatedControlID="ddlJobs" runat="server" Text="<%$ resources: lblSelectSourceHeader.Caption %>"></asp:Label>
                        </span>
                        <div class="textcontrol select" style="width:100%">
                            <asp:DropDownList ID="ddlJobs" runat="server" OnSelectedIndexChanged="ddlJobs_SelectedIndexChanged" AutoPostBack="true" EnableViewState="true" ></asp:DropDownList>
                       </div>               
                   
                </td>
             </tr>
         </table>
    </div>
    <br />
    <div style="text-align:left; border-style:solid; border-color:#99BBE8; border-width:1px; padding:5px; width:400px">
        <table border="0" cellpadding="0" class="formtable" cellspacing="0">
             <tr>
                <td style="height: 22px">
                    <span class="slxlabel" style="margin-left:10px;width:95%">
                            <asp:Label ID="lblGroup" AssociatedControlID="lbxAddHocGroups" runat="server" Text="<%$ resources: lblEntityGroup.Caption %>"></asp:Label>
                        </span>
                   <div class="textcontrol select" style="width:100%">
                     <asp:ListBox ID="lbxAddHocGroups" runat="server" SelectionMode="Single" Rows="1" EnableViewState="true"></asp:ListBox>
                   </div>
                 </td>
            </tr>
        </table>        
    </div>   
        <br />
        <span class="slxlabel">
            <asp:Label ID="lblRequiredMsg" runat="server" Text="<%$ resources:lblRequiredMsg.Caption %>" ForeColor="Red" Visible="False" ></asp:Label>
        </span>
</div>
<br />

<div runat="server" id="divError" style="display:none">
    <span class="slxlabel">
        <asp:Label ID="lblError" runat="server"></asp:Label>
    </span>
</div>