<%@ Control Language="C#" AutoEventWireup="true" CodeFile="GeneralSearchOptionsPage.ascx.cs" Inherits="GeneralSearchOptionsPage" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup" TagPrefix="SalesLogix" %>

<style type="text/css">
    .style1
    {
        height: 23px;
    }
</style>

<div style="display:none">
<asp:Panel ID="LitRequest_RTools" runat="server" meta:resourcekey="LitRequest_RToolsResource1">
    <asp:ImageButton runat="server" ID="cmdSave" ToolTip="Save" OnClick="_save_Click" ImageUrl="~/images/icons/Save_16x16.gif" meta:resourcekey="cmdSave_rsc" OnClientClick="sessionStorage.clear();" />
    <SalesLogix:PageLink ID="GeneralOptionsHelpLink" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources:Portal, Help_ToolTip %>" ImageUrl="~/ImageResource.axd?scope=global&amp;type=Global_Images&amp;key=Help_16x16"
     Target="Help" NavigateUrl="prefsgen.aspx" meta:resourcekey="GeneralOptionsHelpLinkResource2"></SalesLogix:PageLink>
</asp:Panel>
</div>

<asp:HiddenField runat="server" ID="FaxProviderSelectedValue" Value="undefined" />

<%--Used to store resources:msgMenuRangeMessage for use in javascript.--%>
<asp:HiddenField ID="htxtMenuRangeMessage" Value="<%$ resources:msgMenuRangeMessage %>" runat="server" />
<asp:HiddenField ID="htxtMailMergeServiceError" Value="<%$ resources:MailMergeServiceError %>" runat="server" />
<asp:HiddenField ID="htxtSelectedTemplateType" Value="" runat="server" />

<table border="0" cellpadding="1" cellspacing="0" class="formtable optionsTable" style="margin-top:0px">
	<col width="50%" /><col width="50%" />
	<tr>
		<td  class="highlightedCell">
			<asp:Label ID="lblGenOptions" runat="server" Font-Bold="True" Text="General Options" Width="120px" meta:resourcekey="lblGenOptionsResource1"></asp:Label>
		</td>
		<td  class="highlightedCell">
            <asp:Label ID="lblMailMergeTemplateOptions" runat="server" Font-Bold="True" Text="Mail Merge Template Options:" meta:resourcekey="lblMailMergeTemplateOptions"></asp:Label>
        </td>
	</tr>
	<tr>
		<td >
			<span class="lbl">
			    <asp:Label ID="lblShowOnStartup" runat="server" Text="Show on Startup:" Width="123px" meta:resourcekey="lblShowOnStartupResource1"></asp:Label>
			</span>
			<span class="textcontrol">
			    <asp:DropDownList
                    ID="_showOnStartup"
                    data-dojo-type="Sage.UI.Controls.Select"
                    CssClass="select-control"
                    runat="server" 
                    meta:resourcekey="_showOnStartupResource1" />
			</span>
		</td>
		<td >
            <span class="lbl"><asp:Label ID="lblType" runat="server" Text="Type:" 
                meta:resourcekey="lblTypeResource"></asp:Label></span>
            <span class="textcontrol"> 
            <asp:DropDownList ID="cboTemplateType"
                data-dojo-type="Sage.UI.Controls.Select"
                CssClass="select-control"
                runat="server"
                OnSelectedIndexChanged="HandleTemplateTypeChanged"
                AutoPostBack="True">
                <asp:ListItem Selected="True" Value="CONTACT" Text="Contact" meta:resourcekey="listItemContactResource">Contact</asp:ListItem>
                <asp:ListItem Value="LEAD" Text="Lead" meta:resourcekey="listItemLeadResource">Lead</asp:ListItem>
            </asp:DropDownList>
            </span>
        </td>
	</tr>
        <tr>
            <td >
				<span class="lbl"><asp:Label ID="lblDefaultOwner" runat="server" Text="Default Owner/Team:" Width="165px" meta:resourcekey="lblDefaultOwnerResource1"></asp:Label></span>
				<span class="textcontrol">
                <SalesLogix:OwnerControl title="<%$ resources: toolTipFind %>" alt="<%$ resources: toolTipFind %>" runat="server" ID="_defaultOwnerTeam" AutoPostBack="False" DisplayMode="AsControl" meta:resourcekey="_defaultOwnerTeamResource1" >
                    <OwnerDialogStyle BackColor="Control" />
                </SalesLogix:OwnerControl></span>
			</td>
            <td >
                <span class="lbl"><asp:Label ID="lblEmailBaseTemplate" runat="server" Text="E-mail Base Template:" meta:resourcekey="lblEmailBaseTemplateResource1"></asp:Label></span>
                <span class="textcontrol">
                    <span runat="server" id="EmailSpan">
                        <asp:TextBox ID="txtEmailBaseTemplate" runat="server" meta:resourcekey="txtEmailBaseTemplateResource1"></asp:TextBox>
                        <img ID="txtEmailBaseTemplateImg" runat="server" title="<%$ resources: toolTipFind %>" alt="<%$ resources: toolTipFind %>" src="~/images/icons/find_16x16.png" class="optionsImageClass" onclick="getTemplate('Email')"/>
                        <asp:HiddenField ID="txtEmailBaseTemplateId" runat="server"></asp:HiddenField>
                    </span>
                </span>
            </td>
		</tr>
        <tr>
            <td>
                <span class="lbl"><asp:Label ID="lblAutoLogoff" runat="server" Text="Enable Automatic Logoff:" meta:resourcekey="lblAutoLogoffResource1"></asp:Label></span>
                <span class="lbl" style="width:auto; padding-right:10px;">
                    <asp:CheckBox ID="_autoLogoff" runat="server" />
                </span>
                <span class="lbl" style="width:auto;">
                    <asp:Label ID="lblLogOffAfter" runat="server" Text="Log off after" meta:resourcekey="lblLogOffAfterResource1"></asp:Label>
                    <asp:TextBox ID="_logoffDuration" width="30px" runat="server" ></asp:TextBox>
                    <asp:DropDownList
                        ID="_logoffUnits"
                        data-dojo-type="Sage.UI.Controls.Select"
                        CssClass="select-control"
                        runat="server" DataTextField="Key" DataValueField="Value" />
                </span>
            </td>
             <td >
                <span class="lbl"><asp:Label ID="lblLetterBaseTemplate" runat="server" Text="Letter Base Template:" meta:resourcekey="lblLetterBaseTemplateResource1"></asp:Label></span>
                <span class="textcontrol">
                    <span runat="server" id="LetterSpan">
                        <asp:TextBox ID="txtLetterBaseTemplate" runat="server" meta:resourcekey="txtLetterBaseTemplateResource1"></asp:TextBox>
                        <img ID="txtLetterBaseTemplateImg" runat="server" title="<%$ resources: toolTipFind %>" alt="<%$ resources: toolTipFind %>" src="~/images/icons/find_16x16.png" class="optionsImageClass"  onclick="getTemplate('Letter')"/>
                        <asp:HiddenField ID="txtLetterBaseTemplateId" runat="server"></asp:HiddenField>
                    </span>
                </span>
            </td>
        </tr>
		<tr>
		    <td>
		        <span class="lbl"><asp:Label ID="lblPromptForUnsavedData" runat="server" Text="Prompt for unsaved data:" meta:resourcekey="lblPromptForUnsavedData"></asp:Label></span>
		        <span class="lbl" style="width:auto;">
		            <asp:CheckBox ID="chkPromptForUnsavedData" runat="server"/>
		        </span>
		    </td>
            <td>
                <span class="lbl"><asp:Label ID="lblFaxBaseTemplate" runat="server" Text="Fax Base Template:" meta:resourcekey="lblFaxBaseTemplateResource1"></asp:Label></span>
                <span class="textcontrol">
                    <span runat="server" id="FaxSpan">
                        <asp:TextBox ID="txtFaxBaseTemplate" runat="server" meta:resourcekey="txtFaxBaseTemplateResource1"></asp:TextBox>
                        <img ID="txtFaxBaseTemplateImg" runat="server" title="<%$ resources: toolTipFind %>" alt="<%$ resources: toolTipFind %>" src="~/images/icons/find_16x16.png"
                            class="optionsImageClass" onclick="getTemplate('Fax')"/>						
                        <asp:HiddenField ID="txtFaxBaseTemplateId" runat="server"></asp:HiddenField>
                    </span>
               </span>
            </td>
		</tr>
		<tr>
		    <td>
		        <span class="lbl">&nbsp;</span>
                <asp:Button runat="server" ID="btnClearPicklistData" OnClientClick="var x = new Sage.UI.Controls.PickList({});x.clear(x._storageNameSpace);return false;" Text="<%$ resources: clearSavedListData %>" CssClass="slxbutton"/>
		    </td>
            <td >
                <span class="lbl"><asp:Label ID="lblRecentTemplates" runat="server" Text="Write Menu - Recent Templates:" meta:resourcekey="lblRecentTemplatesResource1"></asp:Label></span>
                <span class="textcontrol">
                    <asp:TextBox ID="txtRecentTemplates" runat="server" meta:resourcekey="txtRecentTemplatesResource1"></asp:TextBox>
                </span>
            </td>
		</tr>
        <tr>
            <td >
                <span class="lbl"><asp:Label ID="lblMyCurrency" runat="server" Text="My Currency:" meta:resourcekey="lblMyCurrencyResource1"></asp:Label></span>
                <span class="textcontrol">
                    <SalesLogix:LookupControl AutoPostBack="false" runat="server" ID="luMyCurrency" LookupEntityName="ExchangeRate" LookupEntityTypeName="Sage.Entity.Interfaces.IExchangeRate, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null">
                    <LookupProperties>
                        <SalesLogix:LookupProperty PropertyHeader="Description" PropertyName="Description" PropertyType="System.String" PropertyFormat="None"  UseAsResult="True"></SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="Currency Code" PropertyName="Id" PropertyFormat="None" PropertyType="System.String" UseAsResult="True"></SalesLogix:LookupProperty>
                        <SalesLogix:LookupProperty PropertyHeader="Rate" PropertyName="Rate" PropertyFormat="None" PropertyType="System.Double" UseAsResult="True" ExcludeFromFilters="True" meta:resourceKey="LPRate_rsc"></SalesLogix:LookupProperty>
                    </LookupProperties>
                    <LookupPreFilters>
                    </LookupPreFilters>
                    </SalesLogix:LookupControl>
                </span>
            </td>
            <td >
                <span class="lbl" id="FaxProviderLabel">
                    <asp:Label ID="lblFaxProvider" runat="server" Text="Fax Provider:" meta:resourcekey="lblFaxProviderResource1"></asp:Label>
                </span>
                <span id="FaxProviderOptions" class="textcontrol"></span>
                <input type="hidden" ID="txtFaxProvider" runat="server" />
            </td>
        </tr>
        <tr>
            <td class="highlightedCell">
                <asp:Label ID="lblIntellisyncOptions" runat="server" Font-Bold="True" Text="Intellisync Options:" meta:resourcekey="lblIntellisyncOptions"></asp:Label>
            </td>
            <td  class="highlightedCell">
			    <asp:Label ID="lblEmailOptions" runat="server" Font-Bold="True" Text="E-mail Options:" meta:resourcekey="lblEmailOptionsResource1" ></asp:Label>
            </td>
        </tr>
        <tr>
            <td>
                <span class="lbl"><asp:Label ID="lblIntellisync" runat="server" Text="Intellisync Contact Group:" meta:resourcekey="lblIntellisyncResource1"></asp:Label></span>
                <span class="textcontrol">
                    <asp:DropDownList
                        ID="_intellisyncGroup"
                        data-dojo-type="Sage.UI.Controls.Select"
                        CssClass="select-control"
                        runat="server" />
                </span>
            </td>
            <td >
                <span class="lbl"><asp:Label ID="lblLogToHistory" runat="server" Text="Log To History" meta:resourcekey="lblLogToHistoryResource1" ></asp:Label></span>
                <span class="textcontrol">
                    <asp:DropDownList
                        ID="_logToHistory"
                        data-dojo-type="Sage.UI.Controls.Select"
                        CssClass="select-control"
                        runat="server"
                        meta:resourcekey="_logToHistoryResource1" />
                </span>
            </td>
        </tr>
        <tr>
            <td></td>
        </tr>
        <tr>
            <td></td>
        </tr>
        <tr>
            <td  class="highlightedCell">
                <asp:Label ID="lblAccessibilityOptions" runat="server" Font-Bold="True" Text="Accessibility Options:" meta:resourcekey="lblAccessibilityOptions"></asp:Label>
            </td>
           <td class="highlightedCell">
                <asp:Label ID="SalesLogixEnhancements" runat="server" Font-Bold="True" Text="Sage SalesLogix Enhancements:" meta:resourcekey="lblEnhancements"></asp:Label>
            </td>
        </tr>
        <tr>
            <td >
                <span class="lbl">
                    <asp:Label ID="lblCheckboxEnabled" runat="server" Text="Display List view check boxes:" meta:resourcekey="lblCheckboxEnabledResource"></asp:Label>
                </span>
                <span>
                    <asp:CheckBox runat="server" ID="cbCheckboxEnabled" />
                </span>
		    </td>
            <td></td>
        </tr>
        <tr>
            <td><asp:Button ID="btnFlushCache" runat="server" Text="Clear Cache" visible="false" Enabled="false" OnClick="btnFlushCache_Click" meta:resourcekey="btnFlushCache1" /></td>
        </tr>
        <tr>
            <td></td>
            <td>
                <div style="position:relative;">
                    <div id="enhancementsNotInstalledOptions" onclick="Sage.installDesktopFeatures();">
			            <span class="enhancements">
			                <asp:Label ID="lblInstallEnhancements" runat="server" Text="<%$ resources: lblInstallEnhancements.Text %>"></asp:Label>
			            </span>
			        </div>
                    <div id="enhancementsInstalledOptions" style="display:none;" onclick="Sage.installDesktopFeatures();">
			            <span class="enhancements">
			                <asp:Label ID="EnhancementsInstalled" runat="server" Text="<%$ resources: lblEnhancementsInstalled.Text %>"></asp:Label>
			            </span>
			        </div>
                    <span class="findOutMoreOptions"> <SalesLogix:PageLink runat="server" ID="findoutmorelink" LinkType="HelpFileName" NavigateUrl="desktopintegration" Text="<%$ resources: FindOutMore %>" CssClass="findoutmoretext" Target="MCWebHelp" ></SalesLogix:PageLink></span>
                </div>
            </td>
        </tr>
        <tr>
            <td></td>
            <td></td>
        </tr>   
        <tr>
			<td colspan="2" class="slxlabel checkbox">
                <asp:CheckBox ID="_useActiveReporting" runat="server" Text="Use ActiveReporting (requires ActiveX and Crystal Runtime)" meta:resourcekey="UseActiveReportingResource" />
			</td>
        </tr>
        <tr>
            <%--Render, but do not display; otherwise the user option will get overwritten with the default value--%>
            <td class="slxlabel checkbox" style="visibility:hidden">
                <%--Defect 1-80914 
            DThompson - "Please only hide the options for now.  We may re-enable them in Sawgrass depending on the direction we choose to take."--%>				
            <asp:CheckBox ID="_promptDuplicateContacts" runat="server"
                  Text="<span id='lblPromptForDup'>Prompt for Duplicate Contacts or Leads</span>" meta:resourcekey="_promptDuplicateContactsResource1" />
            </td>
            <td class="style1" style="visibility:hidden">
                    <%--Defect 1-80914 
                DThompson - "Please only hide the options for now.  We may re-enable them in Sawgrass depending on the direction we choose to take."--%>				
                <span class="slxlabel checkbox"><asp:CheckBox ID="_promptContactNotFound" runat="server"
                    Text="<span id='lblPromptConNotFound'>Prompt for Contact or Lead not Found</span>" meta:resourcekey="_promptContactNotFoundResource1" />
                </span>
            </td>
        </tr>
</table>

<script type="text/javascript">
    function checkMenuRange() {
        var oRecentTemplatesControl = dojo.byId("<%= txtRecentTemplates.ClientID %>");
        if (oRecentTemplatesControl != null) {
            var iCount = oRecentTemplatesControl.value;
            if ((iCount == null) || (iCount == "")) {
                oRecentTemplatesControl.value = "0";
            }
            else {
                if (!isNaN(iCount)) {
                    iCount = parseInt(iCount);
                    if ((iCount < 0) || (iCount > 10)) {
                        alert('<%= htxtMenuRangeMessage.Value %>');
                    }
                }
                else {
                    alert('<%= htxtMenuRangeMessage.Value %>');
                }
            }
        }
    }

    // Caches the mail merge template data so the DB does not have to be queried each time the user changes multiple fields.
    var MailMergeTemplates = null;

    function getTemplate(mode) {
        require(['Sage/MailMerge/Helper', 'Sage/MailMerge/Templates', 'Sage/UI/Dialogs'], function(Helper, Templates, Dialogs) {
            var fnOnSelect = function(item) {
                if (dojo.config.isDebug) {
                    console.debug("Template: family=%o; name=%o; id=%o; maintable=%o; template=%o",
                        item.family, item.name, item.id, item.maintable, item.template);
                }
                try {
                    var inputs = document.getElementsByTagName("input");
                    for (var i = 0; i < inputs.length; i++) {
                        if (inputs[i].id.indexOf('txt' + mode + 'BaseTemplateId') > -1) {
                            inputs[i].value = item.id;
                        } else {
                            if (inputs[i].id.indexOf('txt' + mode + 'BaseTemplate') > -1) {
                                inputs[i].value = item.name;
                            }
                        }
                    }
                } catch(err) {
                    var sError = (typeof err.toMessage === "function") ? err.toMessage(Helper.DesktopErrors().UnexpectedError, Helper.MailMergeInfoStore().ShowJavaScriptStack) : err.message;
                    Dialogs.showError(sError);
                }
            };
            var sMainTable = "CONTACT";
            var oTemplateCombo = dijit.byId("<%= cboTemplateType.ClientID %>");
            if (oTemplateCombo) {
                sMainTable = oTemplateCombo.value;
            }
            if (MailMergeTemplates == null) {
                MailMergeTemplates = new Templates();
            }
            MailMergeTemplates.select(sMainTable, { onSelect: fnOnSelect });
        });
    }

    function DoGeneralSearchOptionsPage_init() {
        var faxOptionsSpan = document.getElementById("FaxProviderOptions");
        if (faxOptionsSpan) {
            var txtFaxProviderControl = document.getElementById("<%= txtFaxProvider.ClientID %>");
            if (txtFaxProviderControl) {
                require(['Sage/MailMerge/Helper', 'Sage/MailMerge/Service', 'dojo/ready', 'dojo/parser'], function (Helper, DesktopService, ready, parser) {
                    ready(function () {
                        var oService = Helper.GetMailMergeService(false);
                        if (oService) {
                            var providerOptions = oService.MailMergeGUI().GetFaxProviderOptions(txtFaxProviderControl.value),
                               faxOptions = '<select id="FaxOptions" data-dojo-type="Sage.UI.Controls.Select" class="select-control" onchange="updateFaxProvider()">' + providerOptions + '</select>';

                            faxOptionsSpan.innerHTML = faxOptions;

                            var oFaxProviderLabel = dojo.byId("<%= lblFaxProvider.ClientID %>");
                            if (oFaxProviderLabel) {
                                oFaxProviderLabel.style.display = "inline";
                            }

                            parser.parse(faxOptionsSpan);
                        }
                    });
                });
            }
        }
    }

    function GeneralSearchOptionsPage_init() {
        window.setTimeout('DoGeneralSearchOptionsPage_init()', 0);
    }

    Sys.Application.add_load(GeneralSearchOptionsPage_init);

    function updateFaxProvider() {
        if (dijit.byId("FaxOptions")) {
            var oFaxProviderSelectedValue = dojo.byId("<%= FaxProviderSelectedValue.ClientID %>"),
               faxOptions = dijit.byId('FaxOptions');
            if (oFaxProviderSelectedValue != null
                && faxOptions) {
                oFaxProviderSelectedValue.value = faxOptions.value;
            }
        }
    }

    function showMoreInfo() {
        var address = 'ActivexInfo.aspx';
        var win = window.open(address, 'AlarmMgrWin', 'width=425,height=425,directories=no,location=no,menubar=no,status=yes,scrollbars=yes,resizable=yes,titlebar=no,toolbar=no');
    }
    $(document).ready(function () {
        initGears();
        //DoGeneralSearchOptionsPage_init();
        if (Sage.gears) {
            console.log('Sage.gears is not null');
            //to disable the Enhance SalesLogix button, remove the comments from the following line:
            //$(".enhanceButton").attr('disabled', 'disabled');

            //to hide the whole thing...
            //$('#ExtFeatures').css('visibility','hidden');

            //to hide the "click to download" message:
            //$('.clicktodownload').css('visibility', 'hidden');
            //change the message:
            //$('.clicktodownload').text(LoginStrings.EnhancementsAreInstalled || 'Enhancements have been installed');
            $('#enhancementsNotInstalledOptions').css('display', 'none');
            $('#enhancementsInstalledOptions').css('display', '');
        }
    });
</script>