<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ImportLeadsWizard.ascx.cs" Inherits="ImportLeadsWizard" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>
<%@ Register Src="~/SmartParts/Lead/StepSelectFile.ascx" TagName="StepSelectFile" TagPrefix="ImportWizard" %>
<%@ Register Src="~/SmartParts/Lead/StepDefineDelimiter.ascx" TagName="StepDefineDelimiter" TagPrefix="ImportWizard" %>
<%@ Register Src="~/SmartParts/Lead/StepMapFields.ascx" TagName="StepMapFields" TagPrefix="ImportWizard" %>
<%@ Register Src="~/SmartParts/Lead/StepManageDuplicates.ascx" TagName="StepManageDuplicates" TagPrefix="ImportWizard" %>
<%@ Register Src="~/SmartParts/Lead/StepGroupActions.ascx" TagName="StepGroupActions" TagPrefix="ImportWizard" %>
<%@ Register Src="~/SmartParts/Lead/StepReview.ascx" TagName="StepReview" TagPrefix="ImportWizard" %>

<input id="importProcessId" type="hidden" runat="server" />
<input id="visitedStep1" type="hidden" runat="server" />
<input id="visitedStep2" type="hidden" runat="server" />
<input id="visitedStep3" type="hidden" runat="server" />
<input id="visitedStep4" type="hidden" runat="server" />
<input id="visitedStep5" type="hidden" runat="server" />
<input id="visitedStep6" type="hidden" runat="server" />

<SalesLogix:SmartPartToolsContainer runat="server" ID="pnlImportLead_RTools" ToolbarLocation="right">
    <SalesLogix:PageLink ID="lnkImportWizardHelp" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" 
        Target="Help" NavigateUrl="leadimport.aspx" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
    </SalesLogix:PageLink>
</SalesLogix:SmartPartToolsContainer>

<table cellspacing="10">
    <tr>
        <td class="wizardArea">
            <div>
                <div ID="divStep1" runat="server">
                    <asp:Label ID="lblStep1" runat="server" Text="1" class="lblWizardStepNum" ></asp:Label>
                    <asp:Label ID="lblStep1Name"  runat="server" Text="Step1"></asp:Label>
                </div>
                <div ID="divStep2" runat="server">
                     <asp:Label ID="lblStep2" runat="server" Text="2" class="lblWizardStepNum" ></asp:Label>
                     <asp:Label ID="lblStep2Name" runat="server" Text="Step2"></asp:Label>
                </div>
                <div ID="divStep3" runat="server">
                     <asp:Label ID="lblStep3" runat="server" Text="3" class="lblWizardStepNum" ></asp:Label>
                     <asp:Label ID="lblStep3Name" runat="server" Text="Step3"></asp:Label>
                </div>
                <div ID="divStep4" runat="server">
                     <asp:Label ID="lblStep4" runat="server" Text="4" class="lblWizardStepNum" ></asp:Label> 
                     <asp:Label ID="lblStep4Name" runat="server" Text="Step4"></asp:Label>
                </div>
                <div ID="divStep5" runat="server">
                     <asp:Label ID="lblStep5" runat="server" Text="5" class="lblWizardStepNum" ></asp:Label>
                     <asp:Label ID="lblStep5Name" runat="server" Text="Step5"></asp:Label>
                </div>
                <div ID="divStep6" runat="server">
                     <asp:Label ID="lblStep6" runat="server" Text="6" class="lblWizardStepNum" ></asp:Label>
                     <asp:Label ID="lblStep6Name" runat="server" Text="Step6"></asp:Label>
                </div>
            </div>
        </td>
        <td>
        </td>
        <td class="wizardArea">
            <asp:Wizard runat="server" ID="wzdImportLeads" ActiveStepIndex="0"  BorderWidth="0" width="100%" Height="100%"
                FinishPreviousButtonText = "<%$ resources: cmdBack.Caption %>"
                FinishPreviousButtonStyle-CssClass = "slxbutton"
                StartNextButtonText="<%$ resources: cmdNext.Caption %>"
                StartNextButtonStyle-CssClass = "slxbutton"
                StepPreviousButtonText = "<%$ resources: cmdBack.Caption %>"
                StepPreviousButtonStyle-CssClass = "slxbutton"
                StepNextButtonText="<%$ resources: cmdNext.Caption %>"
                StepNextButtonStyle-CssClass = "slxbutton"
                CancelButtonText="<%$ resources: cmdCancel.Caption %>"
                CancelButtonStyle-CssClass = "slxbutton"
                OnActiveStepChanged="wzdImportLeads_ActiveStepChanged"
                OnNextButtonClick="wzdImportLeads_NextButtonClick"
                OnCancelButtonClick="wzdImportLeads_CancelButtonClick"
                OnPreviousButtonClick="wzdImportLeads_PreviousButtonClick">
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
                    <asp:WizardStep runat="server" Title="<%$ resources: lblSelectFileStep.Caption %>" ID="cmdSelectFile">
                        <ImportWizard:StepSelectFile ID="frmSelectFile" runat="server" OnInit="AddDialogServiceToPage" />
                    </asp:WizardStep>
                    <asp:WizardStep runat="server" Title="<%$ resources: lblDefineDelimiterStep.Caption %>" ID="cmdDefineDelimiter">
                        <ImportWizard:StepDefineDelimiter runat="server" ID="frmDefineDelimiter" OnInit="AddDialogServiceToPage" />
                    </asp:WizardStep>
                    <asp:WizardStep runat="server" Title="<%$ resources: lblMapFieldsStep.Caption %>" ID="cmdMapFields">
                        <ImportWizard:StepMapFields runat="server" ID="frmMapFields" OnInit="AddDialogServiceToPage" />
                    </asp:WizardStep>
                    <asp:WizardStep runat="server" Title="<%$ resources: lblManageDuplicatesStep.Caption %>" ID="cmdManageDuplicates">
                        <ImportWizard:StepManageDuplicates runat="server" ID="frmManageDuplicates" OnInit="AddDialogServiceToPage" />
                    </asp:WizardStep>
                    <asp:WizardStep runat="server" Title="<%$ resources: lblGroupActionsStep.Caption %>" ID="cmdGroupActions">
                        <ImportWizard:StepGroupActions runat="server" ID="frmGroupActions" OnInit="AddDialogServiceToPage" />
                    </asp:WizardStep>
                    <asp:WizardStep runat="server" StepType="Finish" Title="<%$ resources: lblReviewStep.Caption %>" ID="cmdReview">
                        <ImportWizard:StepReview runat="server" ID="frmReview" OnInit="AddDialogServiceToPage" />
                    </asp:WizardStep>
                </WizardSteps>
                <FinishNavigationTemplate>
                    <asp:Button ID="btnBack" CommandName="MovePrevious" runat="server" Text="<%$ resources: cmdBack.Caption %>" CausesValidation="false" CssClass="slxbutton" />
                    <asp:Button ID="cmdStartProcess" runat="server" Text="<%$ resources: cmdSubmit.Caption %>" OnClick="StartImportProcess_Click" CssClass="slxbutton" />
                </FinishNavigationTemplate>
            </asp:Wizard>
        </td>
    </tr>
</table>
<br />