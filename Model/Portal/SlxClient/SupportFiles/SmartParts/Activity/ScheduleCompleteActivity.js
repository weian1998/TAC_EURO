Sage.namespace("Sage.UI.Forms");
Sage.UI.Forms.ScheduleCompleteActivity = {
    _workSpace: {},
    init: function (workSpace) {
        this._workSpace = workSpace;
        var divResult = dojo.byId(this._workSpace.divResultID);
        var dlg = dijit.byId('DialogWorkspace_window');

        if (!dlg.onShowEvent) {
            dlg.onShowEvent = dojo.connect(dlg, 'onShow', function () {
                this.setSize(500, 405);
            });
        }

        if (!dlg.onHideEvent) {
            dlg.onHideEvent = dojo.connect(dlg, 'onHide', function () {
                dojo.disconnect(dlg.onShowEvent);
                dojo.disconnect(dlg.onHideEvent);
                dlg.onShowEvent = null;
                dlg.onHideEvent = null;
                dlg._closedOnServerSide = false;
                dlg.hide_();
            });
        }

        if (divResult) {
            dlg.setSize(500, 600);
        }
        else {
            dlg.setSize(500, 405);
        }
    },
    completeNew: function () {
        var args = this._getArgs();
        Link.completeNewActivity(args.Type, args);
        this._closeDialog();
    },
    completeActivity: function (activityId) {
        Link.completeActivity(activityId);
        this._closeDialog();
    },
    _closeDialog: function () {
        var activityDlg = dijit.byId('activityEditor');
        var btnCancelID = this._workSpace.btnCancelID;
        if (activityDlg) {
            dojo.connect(activityDlg, 'onHide', function () {
                var dlg = dijit.byId('DialogWorkspace_window');
                dlg._closedOnServerSide = false;
                dlg.hide_();
            });
        }

    },
    _getArgs: function () {
        var rdoContact = dojo.byId(this._workSpace.rdoContactID);
        var rdoType1 = dojo.byId(this._workSpace.rdoTypeID + '_0');
        var rdoType2 = dojo.byId(this._workSpace.rdoTypeID + '_1');
        var rdoType3 = dojo.byId(this._workSpace.rdoTypeID + '_2');
        var activityType = 'atAppointment';

        var accountId = '';
        var accountName = '';
        var contactId = '';
        var contactName = '';
        var opportunityId = '';
        var opportunityName = '';
        var ticketId = '';
        var ticketNumber = '';
        var leadId = '';
        var leadName = '';

        var luAccountText = dojo.byId(this._workSpace.luAccountID + '_LookupText');
        var luAccountResult = dojo.byId(this._workSpace.luAccountID + '_LookupResult');
        var luContactText = dojo.byId(this._workSpace.luContactID + '_LookupText');
        var luContactResult = dojo.byId(this._workSpace.luContactID + '_LookupResult');
        var luOpportunityText = dojo.byId(this._workSpace.luOpportunityID + '_LookupText');
        var luOpportunityResult = dojo.byId(this._workSpace.luOpportunityID + '_LookupResult');
        var luTicketText = dojo.byId(this._workSpace.luTicketID + '_LookupText');
        var luTicketResult = dojo.byId(this._workSpace.luTicketID + '_LookupResult');
        var luLeadText = dojo.byId(this._workSpace.luLeadID + '_LookupText');
        var luLeadResult = dojo.byId(this._workSpace.luLeadID + '_LookupResult');
        var txtCompany = dojo.byId(this._workSpace.txtCompanyID);


        if (rdoType1.checked)
            activityType = rdoType1.value;
        if (rdoType2.checked)
            activityType = rdoType2.value;
        if (rdoType3.checked)
            activityType = rdoType3.value;


        if (luAccountResult) {
            accountId = luAccountResult.value;
            accountName = luAccountText.value;
        }

        if (luContactResult) {
            contactId = luContactResult.value;
            contactName = luContactText.value;
        }

        if (luOpportunityResult) {
            opportunityId = luOpportunityResult.value;
            opportunityName = luOpportunityText.value;
        }

        if (luTicketResult) {
            ticketId = luTicketResult.value;
            ticketNumber = luTicketText.value;
        }

        if (luLeadResult) {
            leadId = luLeadResult.value;
            leadName = luLeadText.value;
            if (txtCompany) {
                accountName = txtCompany.value;
            }
        }

        if (rdoContact) {
            if (!rdoContact.checked) {

                accountId = '';
               // accountName = '';
                contactId = '';
                contactName = '';
                opportunityId = '';
                opprotunityName = '';
                ticketId = '';
                ticketNumber = '';
            }
        }
        var args = {
            Type: activityType,
            AccountId: accountId,
            AccountName: accountName,
            ContactId: contactId,
            ContactName: contactName,
            OpportunityId: opportunityId,
            OpportunityName: opportunityName,
            TicketId: ticketId,
            TicketNumber: ticketNumber,
            LeadId: leadId,
            LeadName: leadName,
            AllowAdd: true,
            AllowEdit: true,
            AllowDelete: true
        };
        return args;
    }
};