<%@ Control Language="C#" AutoEventWireup="true" CodeFile="FulfilmentTemplateStageTask.ascx.cs" Inherits="SmartParts_FulFilmentTemplate_FulfilmentTemplateStageTask" %>
<%@ Register Assembly="Sage.SalesLogix.Client.GroupBuilder" Namespace="Sage.SalesLogix.Client.GroupBuilder" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Timeline" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>


 <SalesLogix:SmartPartToolsContainer runat="server" ID="TESTTemplateStageTasks_RTools" ToolbarLocation="right">
    <asp:ImageButton runat="server" ID="btnAddStage"
 AlternateText="Add Stage" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=plus_16x16"  />
 
 </SalesLogix:SmartPartToolsContainer>



    <SalesLogix:SlxGridView runat="server" ID="grdStages" GridLines="None" AutoGenerateColumns="False"
        CellPadding="4" CssClass="datagrid" AlternatingRowStyle-CssClass="rowdk" RowStyle-CssClass="rowlt"
        ShowEmptyTable="true" EmptyTableRowText="No Task assigned to the stage"
        DataKeyNames="Id" EnableViewState="false"
        ExpandableRows="false" ResizableColumns="true"
        OnRowDataBound="grdStages_RowDataBound"
              OnRowCommand="grdStages_RowCommand" 
              OnRowEditing="grdStages_RowEditing"
              OnRowDeleting="grdStages_RowDeleting">
        <Columns>
            <asp:BoundField DataField="Description" HeaderText="Description" />
            <asp:BoundField DataField="Status" HeaderText="Status" />
            <asp:BoundField DataField="Priority" HeaderText="Priority" />
            <asp:TemplateField HeaderText="DateNeeded">
                <ItemTemplate>
                    <SalesLogix:DateTimePicker runat="server" ID="dtpNeededDate" Enabled="true" DisplayDate="true"
                        DisplayTime="false" Timeless="True" DisplayMode="AsText" AutoPostBack="false">
                    </SalesLogix:DateTimePicker>
                </ItemTemplate>
            </asp:TemplateField>
            <asp:TemplateField HeaderText="Weighted Percentage">
                <ItemTemplate>
                    <asp:Label ID="lblPercent" runat="server"></asp:Label>
                </ItemTemplate>
            </asp:TemplateField>
            <asp:ButtonField CommandName="AddTask" Text="AddTask" />
            <asp:ButtonField CommandName="Edit" Text="Edit Stage" />
            <asp:ButtonField CommandName="Complete" Text="Complete Stage" />
            <asp:ButtonField CommandName="Delete" Text="Delete Stage" />
        </Columns>
    </SalesLogix:SlxGridView>
