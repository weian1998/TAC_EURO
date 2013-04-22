<%@ Control Language="C#" AutoEventWireup="true" CodeFile="StepProcessRequest.ascx.cs" Inherits="StepProcessRequest" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="Saleslogix" %>
<%@ Register TagPrefix="radU" Namespace="Telerik.Web.UI" Assembly="Telerik.Web.UI" %>

<!-- Provides client side resource items -->
<SalesLogix:ScriptResourceProvider ID="dedupResource" runat="server">
    <Keys>
        <SalesLogix:ResourceKeyName Key="msgCancelDeDupProcess" />
    </Keys>
</SalesLogix:ScriptResourceProvider>
		
<div style="display:none">
    <asp:Panel ID="pnlProcessLeads_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="pnlProcessLeads_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="pnlProcessLeads_RTools" runat="server"></asp:Panel>
    <asp:Button runat="server" ID="cmdCompleted" OnClick="cmdCompleted_OnClick"/>
</div>

<radU:RadProgressManager ID="radProcessProgressMgr" SuppressMissingHttpModuleError="true" runat="server" />
<br />
<div class="wizardArea">
    <table cellpadding="4" style="width:100%">
        <tr>
            <td align="left">
                <div ID="divProcessing" runat="server">     
                   <span class="slxlabel">
                     <asp:Label ID="lblHeader" runat="server" Text=""></asp:Label>
                   </span>
                </div>          
            </td>
        </tr>
        <tr>
            <td align="left">
                <span class="slxlabel">
                    <asp:Label ID="lblHeader2" runat="server" Text=""></asp:Label>
                </span>                  
            </td>
        </tr>
        <tr>
            <td align="left">
                <span class="slxlabel">
                    <asp:Label ID="lblJobNumber" runat="server" Text="<%$ resources: lblJobNumber.Caption %>"></asp:Label>
                </span>
                <span>
                   <asp:LinkButton ID="lnkJobNumber" runat="server" OnClick="lnkJobNumber_OnClick"></asp:LinkButton>
                </span>
            </td>
        </tr>
    </table> 

    <br />
    <radU:radprogressarea ProgressIndicators="TotalProgressBar, TotalProgress" id="radDeDupProcessArea" runat="server" EnableEmbeddedSkins="False"
        OnClientProgressUpdating="DeDup_OnUpdateProgress" Skin="Slx" SkinsPath="~/Libraries/RadControls/upload/skins">
        <progresstemplate >
            <table style="width:100%">
                <tr>
                    <td align="center">
                        <div class="RadUploadProgressArea">
                            <table class="RadUploadProgressTable" style="height:100;width:100%;">
                                <tr>
                                    <td class="RadUploadTotalProgressData"  align="center">
                                        <div>
                                            <asp:Label ID="Primary" runat="server" Text="<%$ resources: lblPrimary_Progress.Caption %>"></asp:Label>&nbsp;
                                        </div>
                                        <div>
                                            <asp:Label ID="PrimaryValue" runat="server"></asp:Label>&nbsp;
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="RadUploadProgressBarHolder">
                                        <!-- Import Leads primary progress bar -->
                                        <asp:Image ID="PrimaryProgressBar" runat="server" ImageUrl="~/images/icons/progress.gif" />
                                    </td>
                                </tr>
                                <tr>
                                    <!-- Total number of records which failed to import -->
                                    <td class="RadUploadFileCountProgressData">
                                        <asp:Label ID="lblDuplicates" runat="server" Text="<%$ resources: lblDuplicateCount.Caption %>"></asp:Label>&nbsp;
                                        <asp:Label ID="SecondaryTotal" runat="server"></asp:Label>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
            </table>
        </progresstemplate>
    </radU:radprogressarea>
    <br />
    <table style="width:100%">
        <tr>
            <td></td>
            <td align="center">
                <asp:Button ID="cmdAbort" runat="server"  Visible="true" CssClass="slxbutton" Text="<%$ resources: cmdAbort.Caption %>" OnClick="cmdAbort_OnClick"
                 OnClientClick="return confirm(dedupResource.msgCancelDeDupProcess)" />
            </td>
        </tr>
    </table>
</div>
