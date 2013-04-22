<%@ Control Language="C#" AutoEventWireup="true" CodeFile="LiteratureRequest.ascx.cs" Inherits="SmartParts_LitRequest_LiteratureRequest" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="Saleslogix" %>

<style type="text/css">
    #LiteratureRequestForm br { clear: both; }
    #LiteratureRequestForm 
    {
        margin: 10px;
    }
    .col2 
    {
        float: left; 
        width: 50%;
    }
    #contactselection div.lbl 
    {
    }
    #contactselection .contacttotal
    {
        font-style: italic;
        margin: 0 0 5px 10px;
    }
    #coverletterselection input[type=radio]
    {
        margin: 0 0 0 10px;
    }
    .treetitle 
    {
        margin-top: 10px;
    }
    .treetitle h3 
    {
        display: inline;
    }
    .treetitle .toolbar 
    {
        display: inline;
    }
    .treetitle .summary 
    {        
        text-align: right;
    }     
    .itemfilter 
    {
        padding: 10px;
    }
    

</style>

<div style="display:none">
    <asp:Panel ID="LitRequest_RTools" runat="server">
        <asp:ImageButton runat="server" ID="btnSave" ToolTip="Schedule Literature Request" 
            ImageUrl="~/images/icons/Save_16x16.gif" meta:resourcekey="btnSaveLitRequest_rsc" />
        <SalesLogix:PageLink ID="lnkLiteratureRequestHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources:Portal, Help_ToolTip %>" Target="Help" NavigateUrl="litreqadd1.aspx"
            ImageUrl="~/ImageResource.axd?scope=global&amp;type=Global_Images&amp;key=Help_16x16"></SalesLogix:PageLink>
    </asp:Panel>
</div>
         
<ul class="error">
</ul>

<div id="LiteratureRequestForm">
        <asp:Label ID="Label6" CssClass="twocollbl" runat="server" meta:resourcekey="Description_label" />
        <div class="twocoltextcontrol">
            <asp:TextBox dojoType="Sage.UI.Controls.TextBox" runat="server" MaxLength="64" id="Description" />
        </div><br />        
        <div class="col2">                      
        <div id="contactselection">                                            
            <asp:Label ID="Label1" runat="server" meta:resourcekey="lblRequestFor" CssClass="lbl" /><br />
            <div class="lbl">
                <asp:RadioButton runat="server" GroupName="rblRequestFor" meta:resourcekey="optRequestForContact" ID="optRequestForContact" Checked="true" />
            </div>
            <div class="textcontrol">
                <span class="lookup" slxcompositecontrol="true">
                    <asp:TextBox autocomplete="off" runat="server" ID="lueContact" />
                    <a href="#">
                        <img id="lueContactImg" src="images/icons/Find_16x16.png" alt="<%= GetLocalResourceObject("FindContact") %>" title="<%= GetLocalResourceObject("FindContact") %>" style="vertical-align:middle;padding-top:2px;cursor:pointer;" />
                    </a>
                    <asp:HiddenField runat="server" ID="lueContactResult" />
                </span>
            </div>            
            <br />
            <div class="lbl">
                <asp:RadioButton runat="server" GroupName="rblRequestFor" meta:resourcekey="optRequestForGroup" ID="optRequestForGroup" />
            </div>
            <div class="textcontrol">
                <asp:DropDownList runat="server" ID="ddlContactGroup" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" />
            </div><br />
            <div class="lbl">
                <asp:RadioButton runat="server" GroupName="rblRequestFor" meta:resourcekey="optRequestForOpportunity" ID="optRequestForOpportunity" />
            </div>                                    
            <div class="textcontrol">
                <span class="lookup" slxcompositecontrol="true">
                    <asp:TextBox autocomplete="off" runat="server" ID="lueOpportunity" />
                    <a href="#">
                        <img id="lueOpportunityImg" src="images/icons/Find_16x16.png" alt="<%= GetLocalResourceObject("FindOpportunity") %>" title="<%= GetLocalResourceObject("FindOpportunity") %>" style="vertical-align:middle;padding-top:2px;cursor:pointer;" />
                    </a>
                    <asp:HiddenField runat="server" ID="lueOpportunityResult" />
                </span>
            </div>                                    
            <br />
            <div class="contacttotal">
                <asp:Literal ID="Literal1" runat="server" Text='<%$ Resources:NoContactSelected %>' />
            </div>
        </div>
    
        <%-- Send options --%>
        <asp:Label CssClass="lbl" runat="server" meta:resourcekey="SendBy_label" />
        <div class="textcontrol datepicker">
            <SalesLogix:DateTimePicker id="dteDeliverBy" runat="server" displaytime="False" AutoPostBack="False" DisplayDate="True" DisplayMode="AsControl" Enable24HourTime="False" IncludeSecondsInTimeFormat="False" ButtonToolTip="<%$ Resources:Calendar %>"></SalesLogix:DateTimePicker>
        </div><br />
        <input type="checkbox" id="FulfillLocally" />
        <label for="FulfillLocally" class="lbl" style="width: auto; float: none"><asp:Literal runat="server" meta:resourcekey="HandleFulfillmentLocally" Text="Handle fulfillment locally" /></label><br />
        <asp:Label  CssClass="lbl" runat="server" meta:resourcekey="SendVia_label" />
        <div class="textcontrol picklist">
            <SalesLogix:PickListControl id="SendVia" picklistname="Delivery Methods"  runat="server" MustExistInList="True" AlphaSort="True" AutoPostBack="False" 
                DefaultPickListItem="" DisplayMode="AsControl" LeftMargin="" MaxLength="0" NoneEditable="True">
            </SalesLogix:PickListControl>
        </div>
        <asp:Label CssClass="lbl" runat="server" meta:resourcekey="Priority_label" />
        <div class="textcontrol picklist">
            <SalesLogix:PickListControl id="Priority" picklistname="Lit. Request Priority" runat="server" MustExistInList="True" AlphaSort="True" AutoPostBack="False" 
                DefaultPickListItem="" DisplayMode="AsControl" LeftMargin="" MaxLength="0" NoneEditable="True">
            </SalesLogix:PickListControl>
        </div>

        <%-- Cover Letter --%>
        <div id="coverletterselection">
        <asp:Label ID="Label3" runat="server" meta:resourcekey="PrintLiteratureList_label"  CssClass="lbl" /><br />        
            <asp:RadioButtonList runat="server" ID="rblPrintLiteratureList">
            <asp:ListItem Selected="True" Text='<%$ Resources:WithCoverLetter.Text %>' Value="0" />
            <asp:ListItem Text='<%$ Resources:SeparatePage.Text %>' Value="1" />
            <asp:ListItem Text='<%$ Resources:AttachmentList.Text %>' Value="2" />
            <asp:ListItem Text='<%$ Resources:OnlyCoverLetter.Text %>' Value="3" />
            </asp:RadioButtonList>          
            <asp:Label runat="server" cssclass="lbl" Text="<%$ Resources:CoverLetter %>" />
            <div class="textcontrol">
                <input id="Cover" type="text" />
            </div>           
        </div>               
        
    </div><%-- End left column --%>
    
    <div class="col2">
        <div class="literatureItems">
            <table class="treetitle" style="width: 100%">
                <tr>
                    <td>
                        <h3><asp:Label ID="Label2" runat="server" Text='<%$ Resources:AvailableItems %>' /></h3>
                        <div class="toolbar">
                            <asp:ImageButton runat="server" ID="btnItemsFilter" ImageUrl="~/images/icons/Filter_16x16.png" meta:resourcekey="btnItemsFilter" />
                        </div>
                    </td>
                    <td class="summary">
                        <span style="display:inline-block; white-space: nowrap">
                            <asp:Label ID="Label4" runat="server" Text='<%$ Resources:ItemsSelected %>' />&nbsp;
                            <label id="lblTotalSelected">0</label>&nbsp;&nbsp;
                            <asp:Label ID="Label5" runat="server" Text='<%$ Resources:TotalCost %>' />&nbsp;
                            <label id="lblTotalCost">0</label>
                        </span>
                    </td>
                </tr>
            </table>
            <div id="itemsFilter" class="itemfilter"></div>
            <%-- Placeholder for items tree --%>
            <div id="itemsTree"></div>                       
        </div>
    </div>
    <br /><br />    
</div><%-- End form --%>


<Saleslogix:ScriptResourceProvider ID="LitrequestResources" runat="server">
    <Keys>
        <SalesLogix:ResourceKeyName Key="Calendar" />  
        <SalesLogix:ResourceKeyName Key="Cost_Header" />
        <SalesLogix:ResourceKeyName Key="DescriptionIsRequired" /> 
        <SalesLogix:ResourceKeyName Key="ErrorSubmittingRequest" />
        <SalesLogix:ResourceKeyName Key="FindContact" />
        <SalesLogix:ResourceKeyName Key="FindOpportunity" />
        <SalesLogix:ResourceKeyName Key="FulfillCanceled" />
        <SalesLogix:ResourceKeyName Key="FulfillFailed" />
        <SalesLogix:ResourceKeyName Key="GroupDataError" />        
        <SalesLogix:ResourceKeyName Key="ItemFamily_Header" />
        <SalesLogix:ResourceKeyName Key="ItemName_Header" />
        <SalesLogix:ResourceKeyName Key="ItemNumber_Header" />
        <SalesLogix:ResourceKeyName Key="LitWarning_SelectTemplate" />        
        <SalesLogix:ResourceKeyName Key="Loading" />
        <SalesLogix:ResourceKeyName Key="Lookup_Account_PropertyHeader" />
        <SalesLogix:ResourceKeyName Key="Lookup_City_PropertyHeader" />
        <SalesLogix:ResourceKeyName Key="Lookup_Description_PropertyHeader" />
        <SalesLogix:ResourceKeyName Key="Lookup_Description_PropertyHeader" />        
        <SalesLogix:ResourceKeyName Key="Lookup_Email_PropertyHeader" />
        <SalesLogix:ResourceKeyName Key="Lookup_LastName_PropertyHeader" />
        <SalesLogix:ResourceKeyName Key="Lookup_NameLF_PropertyHeader" />
        <SalesLogix:ResourceKeyName Key="Lookup_State_PropertyHeader" />     
        <SalesLogix:ResourceKeyName Key="Lookup_Work_PropertyHeader" />   
        <SalesLogix:ResourceKeyName Key="NoContactSelected" />
        <SalesLogix:ResourceKeyName Key="NoItemSelected" />        
        <SalesLogix:ResourceKeyName Key="NoRecordFound" />  
        <SalesLogix:ResourceKeyName Key="Quantity_Header" />
        <SalesLogix:ResourceKeyName Key="QuantityRequested" />
        <SalesLogix:ResourceKeyName Key="SDataRequestFailed" />
        <SalesLogix:ResourceKeyName Key="SearchBy" />        
        <SalesLogix:ResourceKeyName Key="SelectContact" />
        <SalesLogix:ResourceKeyName Key="SelectOpportunity" />
        <SalesLogix:ResourceKeyName Key="SubmissionInProgress" />        
        <SalesLogix:ResourceKeyName Key="TemplateFindIcon_AlternateText" />
        <SalesLogix:ResourceKeyName Key="TotalCost" />
        <SalesLogix:ResourceKeyName Key="XContactsSelected" />       
        <SalesLogix:ResourceKeyName Key="SendByDateUndefined"/>        
    </Keys>
</Saleslogix:ScriptResourceProvider>