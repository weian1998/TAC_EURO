<%@ Control Language="C#" AutoEventWireup="true" CodeFile="StepSelectFile.ascx.cs" Inherits="StepSelectFile" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register TagPrefix="radU" Namespace="Telerik.Web.UI" Assembly="Telerik.Web.UI" %>

<input id="txtImportFile" type="hidden" runat="server" />
<input id="importProcessId" type="hidden" runat="server" enableviewstate="true" />
<input id="txtConfirmUpload" type="hidden" runat="server" />

<div runat="server" id="divMainContent" style="width: 450px">
    <div id="Div1" runat="server" class="Bevel ExtendWidth">
        <table runat="server" id="tblSelectFile" border="0" cellpadding="0" class="formtable" cellspacing="0" >
            <tr>
                <td>
                    <asp:Label ID="lblFileRequired" AssociatedControlID="uplFile" runat="server" Text="*" Visible="False" ForeColor="Red"></asp:Label>
                    <span class="slxlabel">
                        <asp:Label ID="lblFile" AssociatedControlID="uplFile" runat="server" Text="<%$ resources: lblSelectFileHeader.Caption %>"></asp:Label>
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    <radU:RadUpload ID="uplFile" runat="server" InitialFileInputsCount="1" ControlObjectsVisibility="None" InputSize="50" Width="350px" CssClass="ruInputs"
                        EnableFileInputSkinning="False" ToolTip="<%$ resources: uplFile.Tooltip %>" OnClientFileSelected="onUploadImportFile">
                    </radU:RadUpload>
                </td>
            </tr>
            <tr>
                <td>
                    <br />
                </td>
            </tr>
            <tr>
                <td>
                    <span class="slxlabel">
                        <asp:Label ID="lblCurentFile" AssociatedControlID="txtCurrentFile" runat="server" Text="<%$ resources: lblCurrentFile.Caption %>"></asp:Label>
                    </span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="textcontrol">
                        <asp:TextBox ID="txtCurrentFile" runat="server" dojoType="Sage.UI.Controls.TextBox" EnableViewState="true" ReadOnly="true" Enabled="False"></asp:TextBox>
                    </span>
                </td>
            </tr>
         </table>
    </div>
    <br />
    <div class="Bevel ExtendWidth">
        <table border="0" cellpadding="0" class="formtable" cellspacing="0">
            <tr>
                <td align="left">
                   <div class="lbl alignleft">
                        <asp:Label ID="lblDefaultOwner" AssociatedControlID="ownDefaultOwner" runat="server"
                            Text="<%$ resources: ownDefaultOwner.Caption %>">
                        </asp:Label>
                    </div>
                    <div class="textcontrol picklist">
                        <SalesLogix:OwnerControl runat="server" ID="ownDefaultOwner" AutoPostBack="false" EnableViewState="true" Width="100%"
                            OnLookupResultValueChanged="ownDefaultOwner_LookupResultValueChanged" ShouldPublishMarkDirty="false">
                        </SalesLogix:OwnerControl>
                    </div>
                </td>
            </tr>
            <tr>        
                <td>
                    <div class="lbl alignleft">
                        <asp:Label ID="lblDefaultLeadSource" AssociatedControlID="lueLeadSource" runat="server" EnableViewState="true" 
                            Text="<%$ resources: lueLeadSource.Caption %>">
                        </asp:Label>
                    </div>
                    <div class="textcontrol picklist">
                        <SalesLogix:LookupControl runat="server" ID="lueLeadSource" LookupEntityName="LeadSource" AutoPostBack="false" LookupBindingMode="String"
                            LookupEntityTypeName="Sage.Entity.Interfaces.ILeadSource, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                            ReturnPrimaryKey="True" OnLookupResultValueChanged="lueLeadSource_LookupResultValueChanged" >
                            <LookupProperties>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueLeadSource.LookupProperties.Type.PropertyHeader %>" 
                                    PropertyName="Type" PropertyType="System.String" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueLeadSource.LookupProperties.Description.PropertyHeader %>"
                                    PropertyName="Description" PropertyType="System.String" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                                </SalesLogix:LookupProperty>
                                <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueLeadSource.LookupProperties.AbbrevDescription.PropertyHeader %>"
                                    PropertyName="AbbrevDescription" PropertyType="System.String" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                                </SalesLogix:LookupProperty>
                            </LookupProperties>
                            <LookupPreFilters>
                                <SalesLogix:LookupPreFilter PropertyName="Status" PropertyType="System.String" OperatorCode="=" 
                                    FilterValue="<%$ resources: LeadSource.LUPF.Status %>">
                                </SalesLogix:LookupPreFilter>
                            </LookupPreFilters>
                        </SalesLogix:LookupControl>
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
                        <asp:CheckBox ID="chkAddToGroup" runat="server" Text="<%$ resources: chkAddToGroup.Caption %>" EnableViewState="true" />
                    </div>
                    <table runat="server" id="groupOptions" border="0" class="formtable" style="display:none">
                        <tr>
                            <td>
                                <span style="width:200px;">
                                    <asp:RadioButton ID="rdbCreateGroup" runat="server" Text="<%$ resources: rdbCreateAdHocGroup.Caption %>" Checked="true"
                                        GroupName="createGroupOptions" CssClass="radio" />
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span class="slxlabel">
                                    <asp:Label ID="lblCreateGroup" runat="server" AssociatedControlID="txtCreateGroupName"></asp:Label>
                                </span>
                                <span class="textcontrol" style="width:60%">
                                    <asp:TextBox ID="txtCreateGroupName" runat="server" dojoType="Sage.UI.Controls.TextBox" EnableViewState="true"
                                        ShouldPublishMarkDirty="false">
                                    </asp:TextBox>
                                </span>
                            </td>
                         </tr>
                         <tr>
                            <td>
                                <span>
                                    <asp:RadioButton ID="rdbAddToAddHocGroup" runat="server" Text="<%$ resources: rdbAddToAdHocGroup.Caption %>"
                                        GroupName="createGroupOptions" CssClass="radio" />
                                </span>
                                <br />
                                <div class="textcontrol select" style="width:60%">
                                    <asp:ListBox ID="lbxAddHocGroups" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control"     
                                        shouldPublishMarkDirty="false" runat="server" SelectionMode="Single" Rows="1" EnableViewState="true">
                                    </asp:ListBox>
                                </div>
                            </td>
                         </tr>
                     </table>
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