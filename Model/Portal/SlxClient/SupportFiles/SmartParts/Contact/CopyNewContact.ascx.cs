using System;
using System.Collections.Generic;
using System.Web.UI;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application.UI;
using Sage.Platform.Diagnostics;
using Sage.Platform.Orm;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.HighLevelTypes;

public partial class SmartParts_Contact_CopyNewContact : EntityBoundSmartPartInfoProvider
{
    private IContact _contact;
    private IContact Contact
    {
        get { return _contact ?? (_contact = GetContact()); }
        set { _contact = value; }
    }

    private bool IsClosing { get; set; }

    public override Type EntityType
    {
        get { return typeof(IContact); }
    }

    protected override void InnerPageLoad(object sender, EventArgs e)
    {
        if (Visible & !IsClosing && Contact == null)
        {
            GetContact();
        }
    }

    private IContact GetContact()
    {
        IContact contact = null;
        if (!DialogService.DialogParameters.ContainsKey("SourceContact"))
        {
            contact = GetParentEntity() as IContact;
            DialogService.DialogParameters.Add("SourceContact", contact);
            DialogService.DialogParameters.Add("TargetAccount", contact.Account);
        }
        else
        {
            IContact tempContact = DialogService.DialogParameters["SourceContact"] as IContact;
            contact = EntityFactory.GetById<IContact>(tempContact.Id.ToString());
        }
        return contact;
    }

    protected override void OnAddEntityBindings()
    {
    }

    protected override void OnFormBound()
    {
        if ((Contact != null) & !IsClosing)
        {
            IContact contact = DialogService.DialogParameters["SourceContact"] as IContact;

            lueSourceContact.LookupResultValue = contact;
            txtSourceAccount.Text = contact.AccountName;

            var targetAcctFilter = new LookupPreFilter();
            targetAcctFilter.LookupEntityName = "Sage.Entity.Interfaces.IAccount";
            targetAcctFilter.PropertyName = "Id";
            targetAcctFilter.OperatorCode = "!=";
            targetAcctFilter.FilterValue = Contact.Account.Id.ToString();
            targetAcctFilter.PropertyType = "System.String";
            lueTargetAccount.LookupPreFilters.Add(targetAcctFilter);

            // set focus on target account lookup
            lueTargetAccount.Focus();
        }
        base.OnFormBound();
    }

    protected override void OnWireEventHandlers()
    {
        cmdOK.Click += cmdOK_Click;
        cmdCancel.Click += cmdCancel_Click;
        cmdOK.Attributes.Add("onclick", String.Format("javascript: return confirm('{0}');", GetLocalResourceObject("confirmCopy.Text")));
        lueTargetAccount.LookupResultValueChanged += lueTargetAccount_ChangeAction;
        base.OnWireEventHandlers();
    }

    protected void lueTargetAccount_ChangeAction(object sender, EventArgs e)
    {
        if (!DialogService.DialogParameters.ContainsKey("TargetAccount"))
        {
            DialogService.DialogParameters.Add("TargetAccount", lueTargetAccount.LookupResultValue);
        }
        else
        {
            DialogService.DialogParameters["TargetAccount"] = lueTargetAccount.LookupResultValue;
        }
        Contact = DialogService.DialogParameters["SourceContact"] as IContact;
    }

    protected void cmdOK_Click(object sender, EventArgs e)
    {
        try
        {
            // if there is no target account selected, return and notify user
            if (lueTargetAccount.LookupResultValue == null)
            {
                lblTargetAccountErr.Visible = true;
                return;
            }

            // check to make sure the contact is not being copied to same account
            if (Contact.Account.Equals(lueTargetAccount.LookupResultValue))
            {
                lblTargetAccountErr.Visible = true;
                return;
            }
            // get the source account
            var theAcct = (IAccount)lueTargetAccount.LookupResultValue;

            // create a dictionary fo key value pairs for all the selected copy options
            var options = new Dictionary<string, bool>
                              {
                                  {"AssociateWithSource", chkAssociateWithSource.Checked},
                                  {"UseTargetAddressPhn", chkUseTargetAddressPhn.Checked},
                                  {"CopyNotes", chkCopyNotes.Checked},
                                  {"CopyActivities", chkCopyActivities.Checked},
                                  {"CopyHistory", chkCopyHistory.Checked}
                              };

            using (var session = new SessionScopeWrapper())
            {
                var copiedContact = Contact.CopyNewContact(theAcct, options, session);

                if (copiedContact.Id != null)
                {
                    Response.Redirect(string.Format("Contact.aspx?entityId={0}", (copiedContact.Id)), false);
                }
            }
        }
        catch (Exception ex)
        {
            string sSlxErrorId = null;
            var sMsg = ErrorHelper.GetClientErrorHtmlMessage(ex, ref sSlxErrorId);
            if (!string.IsNullOrEmpty(sSlxErrorId))
            {
                log.Error(ErrorHelper.AppendSlxErrorId("The call to SmartParts_Contact_CopyNewContact.cmdOK_Click failed", sSlxErrorId),
                          ex);
            }
            DialogService.ShowHtmlMessage(sMsg, ErrorHelper.IsDevelopmentContext() ? 600 : -1,
                                          ErrorHelper.IsDevelopmentContext() ? 800 : -1);
        }
        DialogService.CloseEventHappened(sender, e);
    }

    protected void cmdCancel_Click(object sender, EventArgs e)
    {
        IsClosing = true;
        DialogService.CloseEventHappened(sender, e);
    }

    protected override void OnMyDialogClosing(object from, WebDialogClosingEventArgs e)
    {
        DialogService.DialogParameters.Clear();
        IsClosing = true;
        base.OnMyDialogClosing(from, e);
    }

    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
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