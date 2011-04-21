<%@ Control Language="C#" AutoEventWireup="true" CodeFile="MergeRecords.ascx.cs" Inherits="MergeRecords" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="MergeRecords_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkMergeRecordsHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="mergerecordslistview.aspx"
            ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        &nbsp;&nbsp;&nbsp;&nbsp;
        </SalesLogix:PageLink>
    </asp:Panel>
    <input id="txtSelectedTab" runat="server" type="hidden" />
</div>

<asp:Panel runat="server" ID="pnlMergeRecords">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td>
                <asp:Label ID="lblMergeText" runat="server" Text="<%$ resources: lblMergeText.Text %>"></asp:Label>
            </td>
        </tr>
    </table>
    <br />
    <table style="width: 100%;" cellpadding="0" cellspacing="0" border="0">
       <tr>
            <td style="">                   
                <SalesLogix:SlxGridView runat="server" ID="grdMerge" AllowPaging="false" GridLines= "Both" AutoGenerateColumns="False"
                    AlternatingRowStyle-CssClass="rowdk" RowStyle-CssClass="rowlt" CellPadding="4" CssClass="datagrid" PageSize="5"
                    Width = "100%" EnableViewState="false" ExpandableRows="false" ResizableColumns="false" Height="100%"
                    DataKeyNames="PropertyMapId">
                    <Columns>
                        <asp:BoundField DataField="PropertyMapId" Visible="false" />
                        <asp:BoundField DataField="Description" HeaderText="Property"/>
                        <asp:TemplateField ItemStyle-HorizontalAlign="Center" HeaderStyle-HorizontalAlign="Center">
                            <HeaderTemplate>
                                <%# CreateRecordRadioButton("Source") %> 
                            </HeaderTemplate>
                            <ItemTemplate>
                                <%# CreatePropertyRadioButton(Container.DataItem, "Source") %> 
                            </ItemTemplate>                             
                        </asp:TemplateField>
                        <asp:TemplateField>
                            <HeaderTemplate>
                                <asp:Label runat="server" ID="lblSourceRecord" Text="Source"></asp:Label>
                            </HeaderTemplate>
                            <ItemTemplate>
                                <asp:Label runat="server" ID="SourceValue" Text='<%# Eval("SourceValue") %>' />
                            </ItemTemplate>                        
                        </asp:TemplateField>                
                        <asp:TemplateField ItemStyle-HorizontalAlign="Center" HeaderStyle-HorizontalAlign="Center">
                            <HeaderTemplate>
                                <%# CreateRecordRadioButton("Target")%> 
                            </HeaderTemplate>
                            <ItemTemplate>
                                <%# CreatePropertyRadioButton(Container.DataItem, "Target")%> 
                            </ItemTemplate>   
                        </asp:TemplateField>
                        <asp:TemplateField>
                            <HeaderTemplate>
                                <asp:Label runat="server" ID="lblTargetRecord" Text="Target"/>
                            </HeaderTemplate>
                            <ItemTemplate>
                                <asp:Label runat="server" ID="TargetValue" Text='<%# Eval("TargetValue") %>' />
                            </ItemTemplate>                        
                        </asp:TemplateField>
                    </Columns>
                    <HeaderStyle BackColor="#F3F3F3" BorderColor="Transparent" Font-Bold="True" Font-Size="Small" />
                    <RowStyle CssClass="rowlt" />
                    <AlternatingRowStyle CssClass="rowdk" />
                </SalesLogix:SlxGridView>
            </td>  
        </tr>            
    </table>
    <table width="100%">
         <tr>
            <td align="right" style="">
                <asp:Panel runat="server" ID="ctrlstButtons" CssClass="controlslist qfActionContainer">
                    <asp:Button runat="server" ID="btnOK" CssClass="slxbutton" Text="<%$ resources: btnOK.Caption %>" 
                        OnClick="btnOK_Click" />
                    <asp:Button runat="server" ID="btnCancel" CssClass="slxbutton" Text="<%$ resources: cmdCancel.Caption %>" />
                </asp:Panel>
            </td>
        </tr>        
    </table>
</asp:Panel>
