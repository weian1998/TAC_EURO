<%@ Control Language="C#" AutoEventWireup="true" CodeFile="DeDupWizard.ascx.cs" Inherits="DeDupWizard" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register TagPrefix="radU" Namespace="Telerik.WebControls" Assembly="RadUpload.NET2" %>
<%@ Register Src="~/SmartParts/DeDupWizard/StepSelectSource.ascx" TagName="StepSelectSource" TagPrefix="DeDupWizard" %>
<%@ Register Src="~/SmartParts/DeDupWizard/StepManageDuplicates.ascx" TagName="StepManageDuplicates" TagPrefix="DeDupWizard" %>
<%@ Register Src="~/SmartParts/DeDupWizard/StepReview.ascx" TagName="StepReview" TagPrefix="DeDupWizard" %>
<%@ Register Src="~/SmartParts/DeDupWizard/StepProcessRequest.ascx" TagName="StepProcessRequest" TagPrefix="DeDupWizard" %>

<style type="text/css">

.lblStepNum
{
    position: relative;
    top: 7px;
    margin-left:12px;
    color: #ffffff;
    font-weight: bold; 
    font-size: 90%;

}

.lblActive
{
	font-weight: bold;
    color: #000000;
    font-size: 90%;
    white-space: nowrap;
    display: block;
    margin: 0 0 0 40px;
    top: -6px;
    position: relative;
}

.lblVisited
{
	font-weight:normal;
    color: #000000;
    font-size: 90%;
    white-space: nowrap;
    display: block;
    margin: 0 0 0 40px;
    top: -6px;
    position: relative;
}

.lblNotVisited
{
    font-weight:normal;
    color: #000000;
    font-size: 90%;
    white-space: nowrap;
    display: block;
    margin: 0 0 0 40px;
    top: -6px;
    position: relative;
}

div.Active
{
    padding-left:0px;
    margin-top:12px;
    padding-top: 0px;
    text-align:left;
    height: 32px;
    background-image: url(images/wizard_step_active.gif);
    background-repeat:no-repeat;
}
  
div.Visited
{
    padding-left:0px;
    margin-top:12px;
    padding-top: 0px;
    text-align:left;
    height: 32px;
    background: url(images/wizard_step_visited.gif);
    background-repeat:no-repeat;
}
  
div.NotVisited
{
    padding-left:0px;
    margin-top:12px;
    padding-top: 0px;
    text-align:left;
    height: 32px;
    background: url(images/wizard_step_notvisited.gif);
    background-repeat:no-repeat;
}

.wizArea
{
   border-style:solid; 
   border-width:1px; 
   border-color:#99BBE8;
   background-color: #D9E7F8;  
   vertical-align:top;
   padding:10px 10px 10px 10px;
}

</style>

<input id="deDupProcessId" type="hidden" runat="server" enableviewstate="true" />
<input id="visitedStep1" type="hidden" runat="server" enableviewstate="true" />
<input id="visitedStep2" type="hidden" runat="server" enableviewstate="true" />
<input id="visitedStep3" type="hidden" runat="server" enableviewstate="true" />
<input id="visitedStep4" type="hidden" runat="server" enableviewstate="true" />

<radU:RadProgressManager ID="radProcessProgressMgr" SuppressMissingHttpModuleError="true" runat="server" />
<SalesLogix:SmartPartToolsContainer runat="server" ID="pnlDeDup_RTools" ToolbarLocation="right">
    <SalesLogix:PageLink ID="lnkDeDupWizardHelp" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" 
        Target="Help" NavigateUrl="DedupWizard.htm" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
    </SalesLogix:PageLink>
</SalesLogix:SmartPartToolsContainer>

<table cellspacing="10">
    <tr>
        <td class="wizArea">
            <div>
                <div ID="divStep1" runat="server" >
                    <asp:Label ID="lblStep1" runat="server" Text="1" class="lblStepNum" ></asp:Label>
                    <asp:Label ID="lblStep1Name"  runat="server" Text="Step1"></asp:Label>
                </div>
                <div ID="divStep2" runat="server" >
                     <asp:Label ID="lblStep2" runat="server" Text="2" class="lblStepNum" ></asp:Label>
                     <asp:Label ID="lblStep2Name"  runat="server" Text="Step2"></asp:Label>
                </div>
                <div ID="divStep3" runat="server" >
                     <asp:Label ID="lblStep3" runat="server" Text="3" class="lblStepNum" ></asp:Label>
                     <asp:Label ID="lblStep3Name"  runat="server" Text="Step3"></asp:Label>
                </div>
                <div ID="divStep4" runat="server" >
                     <asp:Label ID="lblStep4" runat="server" Text="4" class="lblStepNum" ></asp:Label> 
                     <asp:Label ID="lblStep4Name"  runat="server" Text="Step4"></asp:Label>
                </div>
             </div>
               
        </td>
        <td>
        </td>
        <td class="wizArea">
            <asp:Wizard ID="wzdDeDup" runat="server" ActiveStepIndex="0"  BorderWidth="0" width="100%" Height="100%"
                FinishCompleteButtonText="<%$ resources: cmdSubmit.Caption %>"
                FinishPreviousButtonText="<%$ resources: cmdBack.Caption %>" 
                StepPreviousButtonText="<%$ resources: cmdBack.Caption %>"
                StartNextButtonText="<%$ resources: cmdNext.Caption %>" 
                StepNextButtonText="<%$ resources: cmdNext.Caption %>" 
                CancelButtonText="<%$ resources: cmdCancel.Caption %>"                
                OnFinishButtonClick="wzdDeDup_FinishButtonClick" 
                OnActiveStepChanged="wzdDeDup_ActiveStepChanged"
                OnNextButtonClick="wzdDeDup_NextButtonClick" 
                OnCancelButtonClick="wzdDeDup_CancelButtonClick"
                OnPreviousButtonClick="wzdDeDup_PreviousButtonClick"
                CancelButtonStyle-CssClass="slxbutton"
                StartNextButtonStyle-CssClass="slxbutton"
                FinishPreviousButtonStyle-CssClass="slxbutton"
                FinishCompleteButtonStyle-CssClass="slxbutton"
                StepNextButtonStyle-CssClass="slxbutton"
                StepPreviousButtonStyle-CssClass="slxbutton"
                >
                <SideBarTemplate>
                    <div style="display:block; width:0" >
                        <asp:datalist runat="Server" id="SideBarList">
                            <ItemTemplate>
                                <asp:linkbutton Text="SideBarTemplate" runat="server" id="SideBarButton" Visible="false"/>
                            </ItemTemplate>
                            <SelectedItemStyle Font-Bold="true" />
                        </asp:datalist>
                    </div>
                </SideBarTemplate>
                <SideBarStyle BorderStyle= "None" BorderWidth="0" VerticalAlign="Top" Width="0"/>
                <StepStyle Width="100%" />
                <StartNavigationTemplate>
                    <div>
                       <asp:Button ID="cmdStartButton" CssClass="slxbutton" runat="server" CommandName="MoveNext" Text="<%$ resources: cmdNext.Caption %>" OnClick="startButton_Click" />
                    </div>
                </StartNavigationTemplate>    
         
                <WizardSteps>
                    <asp:WizardStep runat="server" Title="<%$ resources: lblSelectSourceStep.Caption %>" ID="cmdSelectSource">
                        <DeDupWizard:StepSelectSource ID="frmSelectSource" runat="server" OnInit="AddDialogServiceToPage" />
                    </asp:WizardStep>
                    <asp:WizardStep runat="server" Title="<%$ resources: lblManageDuplicatesStep.Caption %>" ID="cmdManageDuplicates">
                        <DeDupWizard:StepManageDuplicates runat="server" ID="frmManageDuplicates" OnInit="AddDialogServiceToPage" />
                    </asp:WizardStep>
                   <asp:WizardStep runat="server" StepType="Finish" Title="<%$ resources: lblReviewStep.Caption %>" ID="cmdReview">
                        <DeDupWizard:StepReview runat="server" ID="frmReview" OnInit="AddDialogServiceToPage" />
                    </asp:WizardStep>
                    <asp:WizardStep runat="server" StepType="Complete" Title="<%$ resources: lblProcessStep.Caption %>" ID="cmdProcess">
                        <DeDupWizard:StepProcessRequest runat="server" ID="frmProcessRequest" OnInit="AddDialogServiceToPage" />
                    </asp:WizardStep>                    
                </WizardSteps>              
            </asp:Wizard>
        </td>
    </tr>
    <tr>
       <td>
            <div style="display:none">
               
                <radu:radprogressarea ProgressIndicators="TotalProgressBar, TotalProgress" id="radImportProcessArea2"
                    runat="server" Skin="Slx" SkinsPath="~/Libraries/RadControls/upload/skins">
                </radu:radprogressarea>
               
            </div>
        </td>
     </tr>    
</table>
<br />