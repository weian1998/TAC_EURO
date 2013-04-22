using System;
using System.Text;
using System.Web.UI;
using Sage.Entity.Interfaces;
using Sage.Platform.Diagnostics;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Contact;
using Sage.SalesLogix.BusinessRules;

public partial class SmartParts_Contact_MoveContact : EntityBoundSmartPartInfoProvider
{
    private IContact _contact;
    private IContact Contact
    {
        get { return _contact ?? (_contact = GetParentEntity() as IContact); }
    }

    private Boolean HasSupportAssociations { get; set; }

    private bool IsClosing { get; set; }

    public override Type EntityType
    {
        get { return typeof(IContact); }
    }

    protected override void OnFormBound()
    {
        if (!IsClosing)
        {
            Sage.SalesLogix.HighLevelTypes.LookupPreFilter targetAcctFilter = new Sage.SalesLogix.HighLevelTypes.LookupPreFilter();
            targetAcctFilter.LookupEntityName = "Sage.Entity.Interfaces.IAccount";
            targetAcctFilter.PropertyName = "Id";
            targetAcctFilter.OperatorCode = "!=";
            targetAcctFilter.FilterValue = Contact.Account.Id.ToString();
            targetAcctFilter.PropertyType = "System.String";
            lueTargetAccount.LookupPreFilters.Add(targetAcctFilter);

            lueSourceContact.LookupResultValue = Contact;
            txtSourceAccount.Text = Contact.AccountName;
            lueReassignActivity.SeedValue = Contact.Account.Id.ToString();
            lueReassignNotesHistory.SeedValue = Contact.Account.Id.ToString();
            lueReassignOpenItems.SeedValue = Contact.Account.Id.ToString();
            lueReassignClosedItems.SeedValue = Contact.Account.Id.ToString();
            lueReassignSupportItems.SeedValue = Contact.Account.Id.ToString();
            lueTargetAccount.Focus();
            ScriptManager.RegisterClientScriptInclude(this, GetType(), "MoveContact", Page.ResolveUrl("~/SmartParts/Contact/MoveContact.js"));
            var script = new StringBuilder();
            if (Page.IsPostBack)
            {
                script.Append(" Sage.UI.Forms.MoveContact.init({workspace: '" + getMyWorkspace() + "'} );");
            }
            else
            {
                script.Append("dojo.ready(function () {Sage.UI.Forms.MoveContact.init({workspace: '" + getMyWorkspace() + "'} ); });");
            }
            ScriptManager.RegisterStartupScript(this, GetType(), "initialize_MoveContact", script.ToString(), true);
        }
        base.OnFormBound();
    }

    protected override void OnMyDialogOpening()
    {
        lueReassignNotesHistory.Enabled = false;
        lueReassignActivity.Enabled = false;
        rdbMoveActivity.Checked = true;
        rdbDontMoveActivity.Checked = false;
        rdbMoveHistory.Checked = true;
        rdbDontMoveHistory.Checked = false;
        String associations;
        HasSupportAssociations = Sage.SalesLogix.Contact.MoveContact.ContactHasAssociations(Contact, out associations);
        if (HasSupportAssociations && Contact.Account.Contacts.Count == 1)
        {
            //can't do anything here
            lblSingleContact.Text = String.Format(GetLocalResourceObject("associationsExist.Text").ToString(), Contact.Name, associations);
            lblSingleContact.Visible = true;
            DisablePage();
            return;
        }
        if (!HasSupportAssociations && Contact.Account.Contacts.Count == 1)
        {
            lblSingleContact.Text = String.Format(GetLocalResourceObject("lblSingleContact.Text").ToString(),
                                                  Contact.Name, Contact.AccountName);
            lblSingleContact.Visible = true;
            DisableMoveOptions();
            return;
        }
        IContact contact = GetAssignToContact();
        if (contact != null)
        {
            lueReassignOpenItems.LookupResultValue = contact;
            lueReassignSupportItems.LookupResultValue = contact;
        }
    }

    protected override void OnAddEntityBindings()
    {
    }

    protected override void OnWireEventHandlers()
    {
        cmdOK.Click += cmdOK_Click;
        cmdCancel.Click += cmdCancel_Click;
        cmdOK.OnClientClick += String.Format("return Sage.UI.Forms.MoveContact.validateRequirements('{0}');",
                                             GetLocalResourceObject("ContactMove_ContactHasChanged"));
        cmdOK.Attributes.Add("onclick", "javascript: return confirm('" + GetLocalResourceObject("ConfirmMove.Text") + "');");
        lueTargetAccount.LookupResultValueChanged += lueTargetAccount_ChangeAction;
        lueReassignNotesHistory.LookupResultValueChanged += LookupResultValueChanged_ChangeAction;
        lueReassignOpenItems.LookupResultValueChanged += LookupResultValueChanged_ChangeAction;
        lueReassignClosedItems.LookupResultValueChanged += LookupResultValueChanged_ChangeAction;
        lueReassignSupportItems.LookupResultValueChanged += LookupResultValueChanged_ChangeAction;
        rdbMoveHistory.CheckedChanged += rdgMoveNotesHistory_OnChanged;
        rdbDontMoveHistory.CheckedChanged += rdgMoveNotesHistory_OnChanged;
        base.OnWireEventHandlers();
    }
    
    protected void DisablePage()
    {
        cmdOK.Enabled = false;
        lueTargetAccount.Enabled = false;
        chkUseSourceAddressPhn.Enabled = false;
        cmdCancel.Text = GetLocalResourceObject("cmdCancel_Close.Text").ToString();
        DisableMoveOptions();
    }

    protected void DisableMoveOptions()
    {
        lueReassignActivity.Enabled = false;
        lueReassignNotesHistory.Enabled = false;
        lueReassignOpenItems.Enabled = false;
        lueReassignClosedItems.Enabled = false;
        lueReassignSupportItems.Enabled = false;
        rdbDontMoveActivity.Enabled = false;
        rdbMoveActivity.Enabled = false;
        rdbMoveHistory.Enabled = false;
        rdbDontMoveHistory.Enabled = false;
    }

    protected void lueTargetAccount_ChangeAction(object sender, EventArgs e)
    {
        ClearErrors();
        lueReassignActivity.SeedValue = Contact.Account.Id.ToString();
        lueReassignNotesHistory.SeedValue = Contact.Account.Id.ToString();
        lueReassignOpenItems.SeedValue = Contact.Account.Id.ToString();
        lueReassignClosedItems.SeedValue = Contact.Account.Id.ToString();
        lueReassignSupportItems.SeedValue = Contact.Account.Id.ToString();
    }

    protected void LookupResultValueChanged_ChangeAction(object sender, EventArgs e)
    {
        ClearErrors();
    }

    protected void rdgMoveActivities_OnChanged(object sender, EventArgs e)
    {
        ClearErrors();
        lueReassignActivity.Enabled = !rdbMoveActivity.Checked;
        if (!rdbMoveActivity.Checked)
        {
            IContact activityContact = GetAssignToContact();
            lueReassignActivity.LookupResultValue = activityContact != null && !activityContact.Equals(Contact)
                                                        ? activityContact
                                                        : null;
        }
        else
        {
            lueReassignActivity.LookupResultValue = null;
        }
    }

    protected void rdgMoveNotesHistory_OnChanged(object sender, EventArgs e)
    {
        ClearErrors();
        lueReassignNotesHistory.Enabled = !rdbMoveHistory.Checked;
        if (!rdbMoveHistory.Checked)
        {
            IContact historyInfoContact = GetAssignToContact();
            lueReassignNotesHistory.LookupResultValue = historyInfoContact != null &&
                                                        !historyInfoContact.Equals(Contact)
                                                            ? historyInfoContact
                                                            : null;
        }
        else
        {
            lueReassignNotesHistory.LookupResultValue = null;
        }
    }

    protected void ClearErrors()
    {
        lblErrorText.Visible = false;
        divTargetAccountError.Visible = false;
        divActivityContactError.Visible = false;
        divNotesContactError.Visible = false;
        divOpenItemsError.Visible = false;
        divClosedItemsError.Visible = false;
        divReassignSupportItems.Visible = false;
    }

    protected void cmdOK_Click(object sender, EventArgs e)
    {
        ClearErrors();
        try
        {
            if (!ValidateUIRequirements()) return;
            MoveArguments arguments = new MoveArguments
                                                 {
                                                     SourceContact = Contact,
                                                     SourceAccount = Contact.Account,
                                                     TargetAccount = (IAccount) lueTargetAccount.LookupResultValue,
                                                     UseSourceContactInfo = chkUseSourceAddressPhn.Checked
                                                 };
            //Add the move/reassign options for each of the items
            //Activity Options
            MoveItemOption moveOption = rdbMoveActivity.Checked
                                            ? new MoveItemOption { Entity = "Activity", MoveToAccount = true, ReassignTo = arguments.TargetAccount.Id }
                                            : new MoveItemOption { Entity = "Activity", ReassignTo = (lueReassignActivity.LookupResultValue as IContact).Id, MoveToAccount = false };
            arguments.Items.Add(moveOption);

            //History/Notes Options
            moveOption = rdbMoveHistory.Checked
                             ? new MoveItemOption { Entity = "History", MoveToAccount = true, ReassignTo = arguments.TargetAccount.Id }
                             : new MoveItemOption { Entity = "History", ReassignTo = (lueReassignNotesHistory.LookupResultValue as IContact).Id, MoveToAccount = false };
            arguments.Items.Add(moveOption);

            object openItemsReassignContact = lueReassignOpenItems.LookupResultValue != null ? (lueReassignOpenItems.LookupResultValue as IContact).Id : null;
            object closedItemsReassignContact = lueReassignClosedItems.LookupResultValue != null ? (lueReassignClosedItems.LookupResultValue as IContact).Id : null;
            object openSupportItemsReassignContact = lueReassignSupportItems.LookupResultValue != null
                                                         ? (lueReassignSupportItems.LookupResultValue as IContact).Id
                                                         : null;
            //Attachment Options
            moveOption = new MoveItemOption
            {
                Entity = "Attachment",
                ReassignTo = openItemsReassignContact,
                MoveToAccount = false
            };
            arguments.Items.Add(moveOption);

            //Literature Requests Options
            moveOption = new MoveItemOption
            {
                Entity = "LitRequest",
                OpenItemsOnly = true,
                ClosedItemsOnly = true,
                ReassignTo = openItemsReassignContact,
                ReassignToClosed = closedItemsReassignContact,
                MoveToAccount = false
            };
            arguments.Items.Add(moveOption);

            //Opportunity Options
            moveOption = new MoveItemOption
                             {
                                 Entity = "OpportunityContact",
                                 OpenItemsOnly = true,
                                 ClosedItemsOnly = true,
                                 ReassignTo = openItemsReassignContact,
                                 ReassignToClosed = closedItemsReassignContact,
                                 MoveToAccount = false
                             };
            arguments.Items.Add(moveOption);

            //Sales Order Options
            moveOption = new MoveItemOption
            {
                Entity = "SalesOrder",
                OpenItemsOnly = true,
                ReassignTo = openItemsReassignContact,
                MoveToAccount = false
            };
            arguments.Items.Add(moveOption);

            //Ticket Options
            moveOption = new MoveItemOption
            {
                Entity = "Ticket",
                ReassignTo = openSupportItemsReassignContact,
                OpenItemsOnly = true,
                MoveToAccount = false
            };
            arguments.Items.Add(moveOption);
            //Return Options
            moveOption = new MoveItemOption
            {
                Entity = "Return",
                ReassignTo = openSupportItemsReassignContact,
                OpenItemsOnly = true,
                MoveToAccount = false
            };
            arguments.Items.Add(moveOption);
            //Contract Options
            moveOption = new MoveItemOption
            {
                Entity = "Contract",
                ReassignTo = openSupportItemsReassignContact,
                OpenItemsOnly = true,
                MoveToAccount = false
            };
            arguments.Items.Add(moveOption);

            Contact.MoveContact(arguments);

            // redirect back to page so new info can be displayed
            if (Contact.Id != null)
            {
                Response.Redirect(string.Format("Contact.aspx?entityId={0}", (Contact.Id)), false);
            }
        }
        catch (Exception ex)
        {
            string sSlxErrorId = null;
            var sMsg = ErrorHelper.GetClientErrorHtmlMessage(ex, ref sSlxErrorId);
            if (!string.IsNullOrEmpty(sSlxErrorId))
            {
                log.Error(ErrorHelper.AppendSlxErrorId("The call to SmartParts_Contact_MoveContact.cmdOK_Click failed", sSlxErrorId),
                          ex);
            }
            DialogService.ShowHtmlMessage(sMsg, ErrorHelper.IsDevelopmentContext() ? 600 : -1,
                                          ErrorHelper.IsDevelopmentContext() ? 800 : -1);
        }
    }

    protected bool ValidateUIRequirements()
    {
        // check to make sure a target account and a contact to reassign any tickets to have been chosen
        if (lueTargetAccount.LookupResultValue == null)
        {
            lblErrorText.Text = GetLocalResourceObject("error_NoTargetAccount.Text").ToString();
            lblErrorText.Visible = true;
            divTargetAccountError.Visible = true;
            return false;
        }

        // check to make sure the contact is not being copied to same account
        if (Contact.Account.Equals(lueTargetAccount.LookupResultValue))
        {
            lblErrorText.Text = GetLocalResourceObject("error_DuplicateTargetAccount.Text").ToString();
            lblErrorText.Visible = true;
            divTargetAccountError.Visible = true;
            return false;
        }

        //if this is the only contact for the account then we can skip the rest of the validation, as it is already determined
        if (Contact.Account.Contacts.Count == 1) return true;

        //check for required reassigned values
        if (rdbDontMoveActivity.Checked && lueReassignActivity.LookupResultValue == null ||
            rdbDontMoveHistory.Checked && lueReassignNotesHistory.LookupResultValue == null ||
            lueReassignOpenItems.LookupResultValue == null || (lueReassignSupportItems.LookupResultValue == null))
        {
            lblErrorText.Text = GetLocalResourceObject("error_ReassignValueNotSpecified.Text").ToString();
            lblErrorText.Visible = true;
            divActivityContactError.Visible = rdbDontMoveActivity.Checked && lueReassignActivity.LookupResultValue == null;
            divNotesContactError.Visible = rdbDontMoveHistory.Checked && lueReassignNotesHistory.LookupResultValue == null;
            divOpenItemsError.Visible = lueReassignOpenItems.LookupResultValue == null;
            divReassignSupportItems.Visible = lueReassignSupportItems.LookupResultValue == null;
            return false;
        }

        //make sure they have not chosen the same reassign value as the contact being moved
        var sourceContact = lueSourceContact.LookupResultValue;
        if (lueReassignActivity.LookupResultValue == sourceContact ||
            lueReassignNotesHistory.LookupResultValue == sourceContact ||
            lueReassignOpenItems.LookupResultValue == sourceContact ||
            lueReassignClosedItems.LookupResultValue == sourceContact ||
            lueReassignSupportItems.LookupResultValue == sourceContact)
        {
            lblErrorText.Text = GetLocalResourceObject("error_ReassignValueDuplicate.Text").ToString();
            lblErrorText.Visible = true;
            divActivityContactError.Visible = rdbDontMoveActivity.Checked && lueReassignActivity.LookupResultValue == sourceContact;
            divNotesContactError.Visible = rdbDontMoveHistory.Checked && lueReassignNotesHistory.LookupResultValue == sourceContact;
            divOpenItemsError.Visible = lueReassignOpenItems.LookupResultValue == sourceContact;
            divClosedItemsError.Visible = lueReassignClosedItems.LookupResultValue == sourceContact;
            divReassignSupportItems.Visible = lueReassignSupportItems.LookupResultValue == sourceContact;
            return false;
        }
        return true;
    }

    protected void cmdCancel_Click(object sender, EventArgs e)
    {
        IsClosing = true;
        DialogService.CloseEventHappened(sender, e);
    }

    protected override void OnMyDialogClosing(object from, Sage.Platform.WebPortal.Services.WebDialogClosingEventArgs e)
    {
        DialogService.DialogParameters.Clear();
        IsClosing = true;
        base.OnMyDialogClosing(from, e);
    }

    protected IContact GetAssignToContact()
    {
        // get the primary contact for the source account - if it is not the current contact
        IContact assignToContact = BusinessRuleHelper.GetPrimaryContact(Contact.Account);
        if (assignToContact != null && !assignToContact.Equals(Contact))
        {
            return assignToContact;
        }
        return null;
    }
   
    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        var tinfo = new ToolsSmartPartInfo();

        foreach (Control c in MoveContact_LTools.Controls)
        {
            tinfo.LeftTools.Add(c);
        }
        foreach (Control c in MoveContact_CTools.Controls)
        {
            tinfo.CenterTools.Add(c);
        }
        foreach (Control c in MoveContact_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }
}