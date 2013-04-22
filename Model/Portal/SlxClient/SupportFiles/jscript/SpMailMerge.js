function sp_DoMailMerge(xml, contactId, userId, leaderId) {
    var bSuccess = false;
    var oMailMergeInfo = sp_GetMailMergeInfo(xml, contactId, leaderId);
    if (oMailMergeInfo != null) {
        var arrResult = oMailMergeInfo.ExecuteMailMerge();
        sp_ShowMessage(OppSPMessages.MailMergeCompleted);
        var bCanceled = arrResult[EngineResult.erCanceled];
        if (bCanceled) {
            sp_ShowMessage(OppSPMessages.MailMergeFailed);
        }
        bSuccess = arrResult[EngineResult.erSuccess];
        if (bSuccess) {
            sp_ShowMessage(OppSPMessages.MailMergeSuccess);
        }
        else {
            sp_Error(OppSPMessages.MailMergeFailed);
        }
    }
    return bSuccess;
}

function sp_IsStringNullOrEmpty(value) {
    if (typeof value === "undefined") {
        return true;
    }
    if (value == null)
        return true;
    return (value == "");
}

function sp_IsDate(value) {
    if (typeof value === "undefined") {
        return false;
    }
    if (value == null)
        return false;
    return Object.prototype.toString.call(value).indexOf('Date') != -1;
}

function sp_GetMailMergeInfo(xml, contactId, leaderId) {
    var oService = Sage.MailMerge.Helper.GetMailMergeService();
    if (!oService) {
        require(['Sage/UI/Dialogs'], function (Dialogs) {
            Dialogs.showError(OppSPMessages.Error_DesktopIntegration);
        });
        return null;
    }

    var sMoTemplateName;
    var sMoTemplateFamily;
    var sMoDoNotSolicit;
    var sMoMergeWith;
    var sMoEditAfter;
    var oMoNode;

    /* Merge Options Out Put Node */
    var oOpNode;
    var sMoDoLabels;
    var sMoLabelName;
    var sMoLabelFamily;
    var sMoSubject;
    var sMoCoverPage;
    var sMoMessage;
    var sMoFrom;
    var sMoCC;
    var sMoBCC;
    var sMoFormat;
    var sMoSaveCopyInSent;
    var sMoOutPutType;

    /* History Options */
    var oHoNode;
    var sHoPromptUser;
    var sHoAttachToEachContact;
    var sHoAddHistToEachContact;
    var sHoResult;
    var sHoRegarding;
    var sHoCategory;
    var sHoNotes;

    /* Followup Activity */
    var oFaNode;
    var sFaPromptUser;
    var sFaType;
    var sFaCarryOverNotes;
    var sFaScheduleDaysFromToday;
    var sFaTimeless;
    var sFaDuration;
    var sFaRegarding;
    var sFaCategory;
    var sFaHours;
    var sFaMinutes;
    var sFaNotes;

    /* Followup Activity  alarm */
    var oFaAlarmNode;
    var sFaSetAlarm;
    var sFaLeadDuration;
    var sFaLeadUnit;

    /* Other */
    var sContactId;
    var sOpportunityId;
    var sPluginId;
    var sCC = "";
    var sBCC = "";
    var sHasEmailNodes;
    var sFilePath;

    /* Setting the Mail Merger Schedule Followup Options */
    var dtCurDate;
    var dtStartTime;
    var iDuration = 0;
    var iFromToday = 0;
    var iHours = 0;
    var iMinutes = 0;
    var iLeadDuration;
    var dblLeadDurationDay;
    var dtAlarmTime;

    sOpportunityId = sp_GetOpportunity();

    var oXmlReader = new Sage.SimpleXmlReader(xml);

    oMoNode = oXmlReader.selectSingleNode("//MergeAction/MergeOptions");
    sMoTemplateName = oXmlReader.selectSingleNodeText("Template/Name", oMoNode);
    sMoTemplateFamily = oXmlReader.selectSingleNodeText("Template/Family", oMoNode);
    sMoMergeWith = oXmlReader.selectSingleNodeText("MergeWith", oMoNode);
    sMoEditAfter = oXmlReader.selectSingleNodeText("EditAfter", oMoNode);
    sMoDoNotSolicit = oXmlReader.selectSingleNodeText("DoNotSolicit", oMoNode);

    oOpNode = oXmlReader.selectSingleNode("//MergeAction/MergeOptions/Output");
    sMoOutPutType = oOpNode.attributes.getNamedItem("Type").nodeValue;
    switch (sMoOutPutType.toUpperCase()) {
        case "PRINTER":
            sMoDoLabels = oXmlReader.selectSingleNodeText("DoLabels", oOpNode);
            sMoLabelName = oXmlReader.selectSingleNodeText("Label/Name", oOpNode);
            sMoLabelFamily = oXmlReader.selectSingleNodeText("Label/Family", oOpNode);
            break;
        case "EMAIL":
            sMoFrom = oXmlReader.selectSingleNodeText("From", oOpNode);
            sMoCC = oXmlReader.selectSingleNodeText("CC", oOpNode);
            sMoBCC = oXmlReader.selectSingleNodeText("BCC", oOpNode);
            sMoSubject = oXmlReader.selectSingleNodeText("Subject", oOpNode);
            sMoFormat = oXmlReader.selectSingleNodeText("Format", oOpNode);
            sMoSaveCopyInSent = oXmlReader.selectSingleNodeText("SaveCopyInSent", oOpNode);
            break;
        case "FAX":
            sMoSubject = oXmlReader.selectSingleNodeText("Subject", oOpNode);
            sMoCoverPage = oXmlReader.selectSingleNodeText("CoverPage", oOpNode);
            sMoMessage = oXmlReader.selectSingleNodeText("Message", oOpNode);
            break;
    }

    oHoNode = oXmlReader.selectSingleNode("//MergeAction/HistoryOptions");
    sHoPromptUser = oXmlReader.selectSingleNodeText("PromptUser", oHoNode);
    sHoAttachToEachContact = oXmlReader.selectSingleNodeText("AttachToEachContact", oHoNode);
    sHoAddHistToEachContact = oXmlReader.selectSingleNodeText("AddHistToEachContact", oHoNode);
    sHoResult = oXmlReader.selectSingleNodeText("Result", oHoNode);
    sHoRegarding = oXmlReader.selectSingleNodeText("Regarding", oHoNode);
    sHoCategory = oXmlReader.selectSingleNodeText("Category", oHoNode);
    sHoNotes = oXmlReader.selectSingleNodeText("Notes", oHoNode);

    oFaNode = oXmlReader.selectSingleNode("//MergeAction/FollowUpActivity");
    sFaPromptUser = oXmlReader.selectSingleNodeText("PromptUser", oFaNode);
    sFaType = oXmlReader.selectSingleNodeText("Type", oFaNode);
    sFaCarryOverNotes = oXmlReader.selectSingleNodeText("CarryOverNotes", oFaNode);
    sFaScheduleDaysFromToday = oXmlReader.selectSingleNodeText("ScheduleDaysFromToday", oFaNode);
    sFaTimeless = oXmlReader.selectSingleNodeText("Timeless", oFaNode);
    sFaDuration = oXmlReader.selectSingleNodeText("Duration", oFaNode);
    sFaRegarding = oXmlReader.selectSingleNodeText("Regarding", oFaNode);
    sFaCategory = oXmlReader.selectSingleNodeText("Category", oFaNode);
    sFaNotes = oXmlReader.selectSingleNodeText("Notes", oFaNode);
    sFaHours = oXmlReader.selectSingleNodeText("Time/Hours", oFaNode);
    sFaMinutes = oXmlReader.selectSingleNodeText("Time/Minutes", oFaNode);

    oFaAlarmNode = oXmlReader.selectSingleNode("//MergeAction/FollowUpActivity/Alarm");
    sFaSetAlarm = oXmlReader.selectSingleNodeText("SetAlarm", oFaAlarmNode);
    sFaLeadDuration = oXmlReader.selectSingleNodeText("LeadDuration", oFaAlarmNode);
    sFaLeadUnit = oXmlReader.selectSingleNodeText("LeadUnit", oFaAlarmNode);

    var oMailMergeInfo = new oService.MailMergeInformation();
    oMailMergeInfo.RunAs = RunAs.raSalesProcess;

    if (sMoDoNotSolicit == "T") {
        oMailMergeInfo.DoNotSolicit = true;
    } else {
        oMailMergeInfo.DoNotSolicit = false;
    }
    if (sMoEditAfter == "T") {
        oMailMergeInfo.EditAfter = true;
    } else {
        oMailMergeInfo.EditAfter = false;
    }

    sPluginId = sp_Service("GetPluginId", sMoTemplateName + "," + sMoTemplateFamily + ",25");
    if (sPluginId == "") {
        sp_Error(sp_Format(OppSPMessages.WordTemplateNotFound, sMoTemplateName, sMoTemplateFamily));
        return null;
    }
    oMailMergeInfo.EditBefore = false;
    oMailMergeInfo.TemplatePluginId = sPluginId;
    oMailMergeInfo.TemplatePluginName = sMoTemplateName;

    var sXml = "";
    if (sMoOutPutType.toUpperCase() == "EMAIL") {
        switch (sMoMergeWith.toUpperCase()) {
            case "PRIMARYOPPCONTACT":
                sXml = sp_GetOppContactEmail(false, oService);
                oMailMergeInfo.MergeWith = MergeWith.withEntityIds;
                break;
            case "USERSELECTEDCONTACT":
                sXml = sp_GetOppContactEmail(true, oService);
                oMailMergeInfo.MergeWith = MergeWith.withEntityIds;
                break;
            default:
                sXml = sp_GetOppContactEmail(true, oService);
                oMailMergeInfo.MergeWith = MergeWith.withEntityIds;
                break;
        }

        if (sXml == "") {
            return null;
        }

        var oEmailXmlReader = new Sage.SimpleXmlReader(sXml);

        sHasEmailNodes = oEmailXmlReader.selectSingleNodeText("/Email/EmailNodes");
        sContactId = oEmailXmlReader.selectSingleNodeText("/Email/SelectedContactID");
        if (sHasEmailNodes == "T") {
            sCC = oEmailXmlReader.selectSingleNodeText("/Email/CC");
            sBCC = oEmailXmlReader.selectSingleNodeText("/Email/BCC");
        }

        if (!sp_IsStringNullOrEmpty(sCC)) {
            sMoCC = (sp_IsStringNullOrEmpty(sMoCC)) ? sCC : sMoCC + ";" + sCC;
        }
        if (!sp_IsStringNullOrEmpty(sBCC)) {
            sMoBCC = (sp_IsStringNullOrEmpty(sMoBCC)) ? sBCC : sMoBCC + ";" + sBCC;
        }
        if (sContactId == "") {
            sp_Alert(OppSPMessages.CanceledOrContactNotFound);
            return null;
        }
    } else {
        sContactId = contactId;
        oMailMergeInfo.MergeWith = MergeWith.withEntityIds;
        if (sContactId == "") {
            sp_Alert(OppSPMessages.CanceledOrContactNotFound); /* "You have cancled || a contact was ! found selected for this action." */
            return null;
        }
    }
    sp_ShowMessage(OppSPMessages.ProcessingMailMerge); /* "Processing mail merge please wait ..." */

    oMailMergeInfo.EntityIds = sContactId;
    oMailMergeInfo.OpportunityId = sOpportunityId;

    switch (sMoOutPutType.toUpperCase()) {
        case "EMAIL":
            oMailMergeInfo.OutputTo = OutputType.otEmail;
            oMailMergeInfo.EmailFrom = sMoFrom;
            oMailMergeInfo.EmailCC = sMoCC;
            oMailMergeInfo.EmailBCC = sMoBCC;
            oMailMergeInfo.EmailSubject = sMoSubject;
            oMailMergeInfo.OverrideAttachments = false;
            switch (sMoFormat.toUpperCase()) {
                case "HTML":
                    oMailMergeInfo.EmailFormat = EmailFormat.formatHTML;
                    break;
                case "PLAIN TEXT":
                    oMailMergeInfo.EmailFormat = EmailFormat.formatPlainText;
                    break;
                default:
                    oMailMergeInfo.EmailFormat = EmailFormat.formatHTML;
                    break;
            }
            if (sMoSaveCopyInSent == "T") {
                oMailMergeInfo.EmailSaveCopy = true;
            } else {
                oMailMergeInfo.EmailSaveCopy = false;
            }
            break;
        case "PRINTER":
            oMailMergeInfo.OutputTo = OutputType.otPrinter;
            oMailMergeInfo.PromptPrinter = true;
            if (sMoDoLabels == "T") {
                oMailMergeInfo.DoPrintLabels = true;
                sPluginId = sp_Service("GetPluginId", sMoLabelName + "," + sMoLabelFamily + ",19");
                if (sPluginId == "") {
                    sp_Error(sp_Format(OppSPMessages.LabelTemplateNotFound, sMoLabelName, sMoLabelFamily)); /* "The label template " + sMoLabelFamily + ":" + sMoLabelName + " was ! found." */
                    return null;
                }
                oMailMergeInfo.LabelId = sPluginId;
            } else {
                oMailMergeInfo.DoPrintLabels = false;
            }
            break;
        case "FAX":
            oMailMergeInfo.OutputTo = OutputType.otFax;
            oMailMergeInfo.FaxBillingCode = "";
            oMailMergeInfo.FaxClientCode = "";
            oMailMergeInfo.FaxCoverPage = "";
            oMailMergeInfo.FaxDate = new Date();
            oMailMergeInfo.FaxDelivery = FaxDelivery.delivASAP;
            oMailMergeInfo.FaxKeyWords = "";
            oMailMergeInfo.FaxMessage = sMoMessage;
            oMailMergeInfo.FaxPriority = FaxPriority.priNormal;
            oMailMergeInfo.FaxSendBy = "";
            oMailMergeInfo.FaxSendSecure = false;
            oMailMergeInfo.FaxSubject = sMoSubject;
            oMailMergeInfo.PromptFaxCoverPage = (sMoCoverPage == "T");
        case "FILE":
            oMailMergeInfo.OutputTo = OutputType.otFile;
            sFilePath = sp_GetFilePath(oService);
            if (sFilePath == "") {
                sp_Alert(OppSPMessages.SelectFolder); /* "You must select a folder to use for this merge." */
                return null;
            }
            oMailMergeInfo.FileDirectory = sFilePath;
            break;
    }

    if (sHoAddHistToEachContact == "T") {
        oMailMergeInfo.DoHistory = true;
    } else {
        oMailMergeInfo.DoHistory = false;
    }
    if (sHoAttachToEachContact == "T") {
        oMailMergeInfo.DoAttachments = true;
    } else {
        oMailMergeInfo.DoAttachments = false;
    }
    if (sHoPromptUser == "T") {
        oMailMergeInfo.PromptHistory = true;
    } else {
        oMailMergeInfo.PromptHistory = false;
    }

    oMailMergeInfo.HistoryInfoCategory = sHoCategory;
    oMailMergeInfo.HistoryInfoNotes = sHoNotes;
    oMailMergeInfo.HistoryInfoRegarding = sHoRegarding;
    oMailMergeInfo.HistoryInfoResult = sHoResult;

    dtCurDate = new Date();
    if (sFaScheduleDaysFromToday != "") {
        iFromToday = Number(sFaScheduleDaysFromToday);
    } else {
        iFromToday = 0;
    }
    if (sFaDuration != "") {
        iDuration = Number(sFaDuration);
    } else {
        iDuration = 15;
    }

    if (sFaTimeless == "T") {
        dtStartTime = dtCurDate;
        if (iFromToday > 0) {
            dtStartTime.setDate(dtStartTime.getDate() + iFromToday);
        }
        oMailMergeInfo.ScheduleFollowUpTimeless = true;
    } else {
        if (sFaHours == "") {
            iHours = 0;
        } else {
            iHours = Number(sFaHours);
        }
        if (sFaMinutes == "") {
            iMinutes = 0;
        } else {
            iMinutes = Number(sFaHours);
        }
        dtStartTime = dtCurDate;
        if (iFromToday > 0) {
            dtStartTime.setDate(dtStartTime.getDate() + iFromToday);
        }
        if (iHours > 0) {
            dtStartTime.setHours(dtStartTime.getHours() + iHours);
        }
        if (iMinutes > 0) {
            dtStartTime.setMinutes(dtStartTime.getMinutes() + iMinutes);
        }
        oMailMergeInfo.ScheduleFollowUpTimeless = false;
    }

    dtStartTime = sp_SetDateForWeekEnd(dtStartTime);
    oMailMergeInfo.ScheduleFollowUpStartDate = dtStartTime;
    oMailMergeInfo.ScheduleFollowUpDuration = iDuration;

    if (sFaLeadDuration != "") {
        iLeadDuration = Number(sFaLeadDuration);
    } else {
        iLeadDuration = 0;
    }

    switch (sFaLeadUnit.toUpperCase()) {
        case "MINUTES":
            dblLeadDurationDay = iLeadDuration / (24 * 60);
            break;
        case "HOURS":
            dblLeadDurationDay = iLeadDuration / (24);
            break;
        case "DAYS":
            dblLeadDurationDay = iLeadDuration;
            break;
        default:
            dblLeadDurationDay = 0;
            break;
    }
    if (sFaSetAlarm == "T") {
        dtAlarmTime = dtStartTime;
        dtAlarmTime.setDate(dtAlarmTime.getDate(), -dblLeadDurationDay);
        oMailMergeInfo.ScheduleFollowUpSetAlarm = true;
        oMailMergeInfo.ScheduleFollowUpAlarmTime = dtAlarmTime;
    } else {
        oMailMergeInfo.ScheduleFollowUpSetAlarm = false;
    }
    switch (sFaType.toUpperCase()) {
        case "PHONE CALL":
            oMailMergeInfo.ScheduleFollowUpType = FollowUp.fuPhoneCall;
            break;
        case "MEETING":
            oMailMergeInfo.ScheduleFollowUpType = FollowUp.fuMeeting;
            break;
        case "TO-DO":
            oMailMergeInfo.ScheduleFollowUpType = FollowUp.fuToDo;
            break;
        case "NONE":
            oMailMergeInfo.ScheduleFollowUpType = FollowUp.fuNone;
            break;
        default:
            oMailMergeInfo.ScheduleFollowUpType = FollowUp.fuToDo;
            break;
    }
    oMailMergeInfo.DoScheduleFollowUp = (oMailMergeInfo.ScheduleFollowUpType != FollowUp.fuNone);
    if ((sFaPromptUser == "T") && (sFaType.toUpperCase() != "NONE")) {
        oMailMergeInfo.PromptFollowUpActivity = true;
    } else {
        oMailMergeInfo.PromptFollowUpActivity = false;
    }
    if (sFaCarryOverNotes == "T") {
        oMailMergeInfo.ScheduleFollowUpCarryOverNotes = true;
    } else {
        oMailMergeInfo.ScheduleFollowUpCarryOverNotes = false;
    }

    oMailMergeInfo.ScheduleFollowUpCategory = sFaCategory;
    oMailMergeInfo.ScheduleFollowUpNotes = sFaNotes;
    oMailMergeInfo.ScheduleFollowUpRegarding = sFaRegarding;
    oMailMergeInfo.ScheduleFollowUpUserId = leaderId;

    return oMailMergeInfo;
}

function sp_XmlEncode(xml) {
    return !xml ? xml : String(xml).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\'/g, "&apos;").replace(/\"/g, "&quot;").replace(/%/g, "&#37;");
}

function sp_PopEmailAddress(contactId, service) {
    var sXml;
    var sResultXml;
    var sAccountId;
    var sAccountName;
    var sContactId;
    var sEmailAddress;
    var sFirstName;
    var sLastName;
    var sOpportunityId;
    var sOpportunityName;
    var oConNodes;
    var oConNode;
    var sTo = "";
    var sCC = "";
    var sBCC = "";
    var sSelectedContactId = "";

    sOpportunityId = sp_GetOpportunity();
    sOpportunityName = "";

    sXml = sp_Service("GETOPPCONTACTSEMAIL", sOpportunityId);
    if (typeof sXml === "undefined" || !(typeof sXml === "string")) {
        sp_Error(OppSPMessages.ERR_InvalidXmlData);
        return "";
    }
    var oXmlReader = new Sage.SimpleXmlReader(sXml);

    var oSelectEmailInfo = new Sage.SelectEmailInfo();
    oConNodes = oXmlReader.selectChildNodes("/CONTACTS/CONTACT");
    for (var i = 0; i < oConNodes.length; i++) {
        oConNode = oConNodes[i];
        sAccountId = oXmlReader.selectSingleNodeText("ACCOUNTID", oConNode);
        sAccountName = oXmlReader.selectSingleNodeText("ACCOUNT", oConNode);
        sContactId = oXmlReader.selectSingleNodeText("CONTACTID", oConNode);
        sEmailAddress = oXmlReader.selectSingleNodeText("EMAIL", oConNode);
        sFirstName = oXmlReader.selectSingleNodeText("FIRSTNAME", oConNode);
        sLastName = oXmlReader.selectSingleNodeText("LASTNAME", oConNode);

        if (sContactId == contactId) {
            oSelectEmailInfo.AddInfo(sAccountId, sAccountName, sContactId, sEmailAddress, sFirstName, sLastName, sOpportunityId, sOpportunityName, true);
        } else {
            oSelectEmailInfo.AddInfo(sAccountId, sAccountName, sContactId, sEmailAddress, sFirstName, sLastName, sOpportunityId, sOpportunityName, false);
        }
    }

    var bDone = false;
    while (!bDone) {
        var oSelectedInfo = service.SelectEmailNames(oSelectEmailInfo, MaxTo.maxOne);
        if (((oSelectedInfo != null) && (oSelectedInfo.Recipients.length > 0))) {
            for (var i = 0; i < oSelectedInfo.Recipients.length; i++) {
                var oRecipient = oSelectedInfo.Recipients[i];
                switch (oRecipient.Type) {
                    case RecipientType.rtTo:
                        sSelectedContactId = oRecipient.ContactId;
                        sTo += oRecipient.FirstName + " " + oRecipient.LastName + " <" + oRecipient.EmailAddress + ">;";
                        break;
                    case RecipientType.rtCC:
                        sCC += oRecipient.FirstName + " " + oRecipient.LastName + " <" + oRecipient.EmailAddress + ">;";
                        break;
                    case RecipientType.rtBCC:
                        sBCC += oRecipient.FirstName + " " + oRecipient.LastName + " <" + oRecipient.EmailAddress + ">;";
                        break;
                }
            }
            if (sSelectedContactId == "") {
                bDone = false;
                sp_Alert(OppSPMessages.MustBeAtLeastOne); /* "There must be at least one name in the TO box. */
            } else {
                bDone = true;
            }
        } else {
            bDone = true;
        }
    }

    sResultXml = "<Email>";
    sResultXml += "<Cancel>" + bDone + "</Cancel>";
    sResultXml += "<EmailNodes>T</EmailNodes>";
    sResultXml += "<SelectedContactID>" + sSelectedContactId + "</SelectedContactID>";
    sResultXml += "<TO>" + sp_XmlEncode(sTo) + "</TO>";
    sResultXml += "<CC>" + sp_XmlEncode(sCC) + "</CC>";
    sResultXml += "<BCC>" + sp_XmlEncode(sBCC) + "</BCC>";
    sResultXml += "</Email>";

    return sResultXml;
}

function sp_GetOppContactEmail(promptFor, service) {
    var iOppCount;
    var sOppContactId;
    var sXml = "";

    iOppCount = Number(sp_GetOppContactCount());
    sOppContactId = sp_GetPrimaryOppContact();
    sp_ShowMessage(OppSPMessages.SelectEMailAddr); /* "Selecting the contacts to mail to ..." */
    if (iOppCount < 1) {
        sp_Error(OppSPMessages.NoContactAssociated); /* "There are no contacts associated to the opportunity for this step." */
        sXml = "";
    } else {
        if (promptFor) {
            if ((iOppCount > 1)) {
                sXml = sp_PopEmailAddress("", service);
            } else {
                if (sOppContactId == "") {
                    sXml = sp_PopEmailAddress("", service);
                } else {
                    sXml = "<Email>";
                    sXml += "<EmailNodes>F</EmailNodes>";
                    sXml += "<SelectedContactID>" + sOppContactId + "</SelectedContactID>";
                    sXml += "</Email>";
                }
            }
        } else {
            if (sOppContactId == "") {
                sXml = sp_PopEmailAddress("", service);
            } else {
                sXml = "<Email>";
                sXml += "<EmailNodes>F</EmailNodes>";
                sXml += "<SelectedContactID>" + sOppContactId + "</SelectedContactID>";
                sXml += "</Email>";
            }
        }
    }
    return sXml;
}

function sp_SetDateForWeekEnd(aDate) {
    var dtNew;

    if (sp_IsDate(aDate)) {
        dtNew = aDate;
        var iWeekDay = dtNew.getDay();
        switch (iWeekDay) {
            case 0: /* Sunday */
                dtNew.setDate(dtNew.getDate() + 1);
                break;
            case 6: /* Saturday */
                dtNew.setDate(dtNew.getDate() + 2);
                break;
        }
    } else {
        dtNew = new Date();
    }
    return dtNew;
}

function sp_GetFilePath(service) {
    var sCaption = OppSPMessages.SelectFolderCaption; /* "Select Folder To Use For Merge" */
    var sTitle = OppSPMessages.SelectFolderTitle; /* "Folder" */
    var sSelection = service.MailMergeGUI().SalesProcessPath;
    if (sSelection == "") {
        sSelection = service.MailMergeGUI().GetPersonalDataPath();
    }
    var arrSelection = service.SelectFolder(sCaption, sTitle, sSelection);
    var bSelected = arrSelection[SelectFolderResult.srSelected];
    var sPath = "";
    if (bSelected) {
        sPath = arrSelection[SelectFolderResult.srFolder];
        if (sPath != "") {
            service.MailMergeGUI().SalesProcessPath = sPath;
        }
    }
    return sPath;
}
