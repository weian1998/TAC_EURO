<%@ Control Language="C#" AutoEventWireup="true" CodeFile="OpportunityFulfilment.ascx.cs" Inherits="SmartParts_Opportunity_OpportunityFulfilment" %>
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

<div>
Templates<asp:DropDownList ID="ddlTemplates" runat="server">
    </asp:DropDownList>  
    <asp:Button ID="cmdAddTemplate" runat="server" Text="Add Template Items" 
        onclick="cmdAddTemplate_Click1" />  &nbsp;&nbsp;
        <asp:Button ID="cmdRemoveTemplate" runat="server" Text="Remove Template Items" 
        onclick="cmdRemoveTemplate_Click1" />&nbsp;&nbsp;  Delivery Date:  <SalesLogix:DateTimePicker runat="server" ID="dtDeliveryDate" DisplayDate="true" DisplayTime="false" Timeless="True" Enabled="true"/>        
</div>
<div style="display:none">
<asp:HiddenField ID="stepContext" runat="server" value=""  ></asp:HiddenField>&nbsp;
<asp:HiddenField ID="rowContext" runat="server" value=""  ></asp:HiddenField>&nbsp;
<asp:Button ID="cmdCompleteStep" runat="server" OnClick="cmdCompleteStep_OnClick"  text="CompeleteStep"/>
</div>
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
            <asp:TemplateField HeaderText="Complete">
                <ItemTemplate>                    
                     <asp:CheckBox ID="chkComplete" runat="server" />                                       
                </ItemTemplate>
            </asp:TemplateField>
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
            <asp:TemplateField HeaderText="CompletedDate">
                <ItemTemplate>
                    <SalesLogix:DateTimePicker runat="server" ID="dtpCompleted" Enabled="true" DisplayDate="true"
                        DisplayTime="false" Timeless="True" DisplayMode="AsText" AutoPostBack="false">
                    </SalesLogix:DateTimePicker>
                </ItemTemplate>
            </asp:TemplateField>
            <asp:TemplateField HeaderText="Weighted">
                <ItemTemplate>
                    <asp:Label ID="lblPercent" runat="server"></asp:Label>
                </ItemTemplate>
            </asp:TemplateField>
            <asp:ButtonField CommandName="AddTask" Text="AddTask" />
            <asp:ButtonField CommandName="Edit" Text="Edit Stage" />
            <asp:ButtonField CommandName="Complete" Text="Complete Stage" Visible="false" />        
            <asp:ButtonField CommandName="Delete" Text="Delete Stage" />            
        </Columns>
    </SalesLogix:SlxGridView>

    <script type="text/javascript" language="javascript">

        function onCompleteStep(cmdCompleteCtrlId, stepContextCtrlId, stepContext) {
            var cmdCtrl = document.getElementById(cmdCompleteCtrlId);
            var stepContextCtrl = document.getElementById(stepContextCtrlId);
            stepContextCtrl.value = stepContext;
            sp_InvokeClickEvent(cmdCtrl);
        }

        function onChecked(control, rowIndexControl, rowIndex) {
            var cmdCtrl = document.getElementById(control);
            var rowContextControl = document.getElementById(rowIndexControl);
            rowContextControl.value = rowIndex;             
            sp_InvokeClickEvent(cmdCtrl);
        }

        function sp_InvokeClickEvent(control) {
            if (document.createEvent) {
                // FireFox
                var e = document.createEvent("MouseEvents");
                e.initEvent("click", true, true);
                control.dispatchEvent(e);
            }
            else {
                // IE
                control.click();
            }
        }

</script>