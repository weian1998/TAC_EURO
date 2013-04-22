using System;
using System.Collections;
using System.Reflection;
using System.Web.UI;
using System.Collections.Generic;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application.UI;
using Sage.Platform.Repository;
using Sage.Platform.WebPortal.Binding;
using Sage.Platform.WebPortal.SmartParts;

public partial class SmartParts_Lead_MatchingLeadRecords : EntityBoundSmartPartInfoProvider
{
    string accountID = "";

    protected override void InnerPageLoad(object sender, EventArgs e)
    {
        if (Visible)
        {
            LoadingGrids();
        }
    }

    public override Type EntityType
    {
        get { return typeof(ILead); }
    }

    protected override void OnAddEntityBindings()
    {
        dtsLeads.Bindings.Add(new WebEntityListBinding("Leads", grdLeads));
        BindingSource.OnCurrentEntitySet += dtsleads_OnCurrentEntitySet;

        dtsMatchingLeads.Bindings.Add(new WebEntityListBinding("Leads", grdMatchedLeads));
        BindingSource.OnCurrentEntitySet += dtsMatchingleads_OnCurrentEntitySet;

        dtsContacts.Bindings.Add(new WebEntityListBinding("Contacts", grdMatchedContacts));
        BindingSource.OnCurrentEntitySet += dtsContacts_OnCurrentEntitySet;

        dtsAccounts.Bindings.Add(new WebEntityListBinding("Accounts", grdMatchedAccounts));
        BindingSource.OnCurrentEntitySet += dtsAccounts_OnCurrentEntitySet;
    }

    protected override void OnWireEventHandlers()
    {
        chkCompany.CheckedChanged += general_CheckedChanged;
        chkFirstName.CheckedChanged += general_CheckedChanged;
        chkLastName.CheckedChanged += general_CheckedChanged;
        chkTitle.CheckedChanged += general_CheckedChanged;
        chkEmail.CheckedChanged += general_CheckedChanged;
        chkCityStatePostal.CheckedChanged += general_CheckedChanged;
        chkWorkPhone.CheckedChanged += general_CheckedChanged;
        chkTollFreePhone.CheckedChanged += general_CheckedChanged;
        chkWebAddress.CheckedChanged += general_CheckedChanged;
        chkIndustry.CheckedChanged += general_CheckedChanged;
        cmdClose.Click += DialogService.CloseEventHappened;
    }

    protected override void OnFormBound()
    {
        dtsLeads.Bind();
        dtsMatchingLeads.Bind();
        dtsContacts.Bind();
        dtsAccounts.Bind();
        base.OnFormBound();
    }

    void dtsleads_OnCurrentEntitySet(object sender, EventArgs e)
    {
        if (Visible)
        {
            dtsLeads.SourceObject = BindingSource.Current;
        }
    }

    void dtsMatchingleads_OnCurrentEntitySet(object sender, EventArgs e)
    {
        if (Visible)
        {
            dtsMatchingLeads.SourceObject = BindingSource.Current;
        }
    }

    void dtsContacts_OnCurrentEntitySet(object sender, EventArgs e)
    {
        if (Visible)
        {
            dtsContacts.SourceObject = BindingSource.Current;
        }
    }

    void dtsAccounts_OnCurrentEntitySet(object sender, EventArgs e)
    {
        if (Visible)
        {
            dtsAccounts.SourceObject = BindingSource.Current;
        }
    }

    void general_CheckedChanged(object sender, EventArgs e)
    {
        LoadingGrids();
    }

    private WebEntityListBindingSource _dtsLeads;

    public WebEntityListBindingSource dtsLeads
    {
        get
        {
            return _dtsLeads ?? (_dtsLeads = new WebEntityListBindingSource(typeof (ILead), EntityType, "", MemberTypes.Property));
        }
    }

    private WebEntityListBindingSource _dtsMatchingLeads;
    public WebEntityListBindingSource dtsMatchingLeads
    {
        get
        {
            return _dtsMatchingLeads ?? (_dtsMatchingLeads = new WebEntityListBindingSource(typeof (ILead), EntityType, "", MemberTypes.Property));
        }
    }

    private WebEntityListBindingSource _dtsContacts;
    public WebEntityListBindingSource dtsContacts
    {
        get
        {
            return _dtsContacts ?? (_dtsContacts = new WebEntityListBindingSource(typeof (IContact), EntityType, "", MemberTypes.Property));
        }
    }

    private WebEntityListBindingSource _dtsAccounts;
    public WebEntityListBindingSource dtsAccounts
    {
        get
        {
            return _dtsAccounts ?? (_dtsAccounts = new WebEntityListBindingSource(typeof (IAccount), EntityType, "", MemberTypes.Property));
        }
    }

    protected void LoadingGrids()
    {
        LoadLeadGrid();
        LoadMatchedLeadGrid();
        LoadContactGrid();
        LoadAccountGrid();
    }

    protected void LoadLeadGrid()
    {
        ILead curLead = BindingSource.Current as ILead;
        if (curLead != null)
        {
            List<ILead> leadlist = new List<ILead>();
            leadlist.Add(curLead);
            dtsLeads.setCustomData(leadlist);
        }
    }

    private void LoadMatchedLeadGrid()
    {
        bool conditionMet = false;
        string company = String.Empty;
        string firstName = String.Empty;
        string lastName = String.Empty;
        string title = String.Empty;
        string email = String.Empty;
        string cityStatePostal = String.Empty;
        string workPhone = String.Empty;
        string webAddress = String.Empty;

        ILead lead = BindingSource.Current as ILead;
        if (lead != null)
        {
            company = lead.Company;
            firstName = lead.FirstName;
            lastName = lead.LastName;
            title = lead.Title;
            email = lead.Email;
            cityStatePostal = lead.Address.LeadCtyStZip;
            workPhone = lead.WorkPhone;
            webAddress = lead.WebAddress;
        }

        IRepository<ILead> matchingLeadList = EntityFactory.GetRepository<ILead>();
        IQueryable qryContact = (IQueryable)matchingLeadList;
        IExpressionFactory exp = qryContact.GetExpressionFactory();
        ICriteria criteria = qryContact.CreateCriteria();
        criteria.CreateAlias("Address", "ad");
        IList<IExpression> expression = new List<IExpression>();

        if (chkCompany.Checked && company != null)
        {   
            expression.Add(GetExpression(exp, "Company", company));
            conditionMet = true;
        }

        if (chkFirstName.Checked && firstName != null)
        {
            expression.Add(GetExpression(exp, "FirstName", firstName));
            conditionMet = true;
        }

        if (chkLastName.Checked && lastName != null)
        {
            expression.Add(GetExpression(exp, "LastName", lastName));
            conditionMet = true;
        }

        if (chkTitle.Checked && title != null)
        {
            expression.Add(GetExpression(exp, "Title", title));
            conditionMet = true;
        }

        if (chkEmail.Checked && email != null)
        {
            expression.Add(GetExpression(exp, "Email", email));
            conditionMet = true;
        }

        if (chkCityStatePostal.Checked && cityStatePostal != null)
        {
            expression.Add(GetExpression(exp, "ad.LeadCtyStZip", cityStatePostal));
            conditionMet = true;
        }

        if (chkWorkPhone.Checked && workPhone != null)
        {
           expression.Add(GetExpression(exp, "WorkPhone", workPhone));
           conditionMet = true;
        }

        if (chkWebAddress.Checked && webAddress != null)
        {
            expression.Add(GetExpression(exp, "WebAddress", webAddress));
            conditionMet = true;
        }

        IJunction junction = rdbMatchAll.Checked ? exp.Conjunction() : exp.Disjunction();
        foreach (IExpression e in expression)
        {
            junction.Add(e);
        }

        criteria.Add(junction);
        if (conditionMet.Equals(true))
        {
            IList list = criteria.List();
            dtsMatchingLeads.setCustomData(list);
            lblLeadMatches.Text = String.Format(GetLocalResourceObject("PotentialLeadMatches_rsc").ToString(), list.Count);
        }
    }

    private void LoadContactGrid()
    {
        bool conditionMet = false;
        string company = String.Empty;
        string firstName = String.Empty;
        string lastName = String.Empty;
        string title = String.Empty;
        string email = String.Empty;
        string cityStatePostal = String.Empty;
        string workPhone = String.Empty;
        string webAddress = String.Empty;

        ILead lead = BindingSource.Current as ILead;
        if (lead != null)
        {
            company = lead.Company;
            firstName = lead.FirstName;
            lastName = lead.LastName;
            title = lead.Title;
            email = lead.Email;
            cityStatePostal = lead.Address.LeadCtyStZip;
            workPhone = lead.WorkPhone;
            webAddress = lead.WebAddress;
        }

        IRepository<IContact> contactList = EntityFactory.GetRepository<IContact>();
        IQueryable qryContact = (IQueryable) contactList;
        IExpressionFactory exp = qryContact.GetExpressionFactory();
        ICriteria criteria = qryContact.CreateCriteria();
        criteria.CreateAlias("Address", "ad");
        IList<IExpression> expression = new List<IExpression>();

        if (chkCompany.Checked && company != null)
        {
            expression.Add(GetExpression(exp, "AccountName", company));
            conditionMet = true;
        }

        if (chkFirstName.Checked && firstName != null)
        {
            expression.Add(GetExpression(exp, "FirstName", firstName));
            conditionMet = true;
        }

        if (chkLastName.Checked && lastName != null)
        {
            expression.Add(GetExpression(exp, "LastName", lastName));
            conditionMet = true;
        }

        if (chkTitle.Checked && title != null)
        {
            expression.Add(GetExpression(exp, "Title", title));
            conditionMet = true;
        }

        if (chkEmail.Checked && email != null)
        {
            expression.Add(GetExpression(exp, "Email", email));
            conditionMet = true;
        }

        if (chkCityStatePostal.Checked && cityStatePostal != null)
        {
            expression.Add(GetExpression(exp, "ad.CityStateZip", cityStatePostal));
            conditionMet = true;
        }

        if (chkWorkPhone.Checked && workPhone != null)
        {
            expression.Add(GetExpression(exp, "WorkPhone", workPhone));
            conditionMet = true;
        }

        if (chkWebAddress.Checked && webAddress != null)
        {
            expression.Add(GetExpression(exp, "WebAddress", webAddress));
            conditionMet = true;
        }

        IJunction junction = rdbMatchAll.Checked ? exp.Conjunction() : exp.Disjunction();
        foreach (IExpression e in expression)
        {
            junction.Add(e);
        }

        criteria.Add(junction);

        if (conditionMet.Equals(true))
        {
            IList list = criteria.List();
            dtsContacts.setCustomData(list);
            lblContactMatches.Text = String.Format(GetLocalResourceObject("PotentialContactMatches_rsc").ToString(), list.Count);
        }
    }

    private void LoadAccountGrid()
    {
        bool conditionMet = false;
        string company = String.Empty;
        string cityStatePostal = String.Empty;
        string workPhone = String.Empty;
        string tollFree = String.Empty;
        string webAddress = String.Empty;
        string industry = String.Empty;

        ILead lead = BindingSource.Current as ILead;
        if (lead != null)
        {
            company = lead.Company;
            cityStatePostal = lead.Address.LeadCtyStZip;
            workPhone = lead.WorkPhone;
            tollFree = lead.TollFree;
            webAddress = lead.WebAddress;
            industry = lead.Industry;
        }

        IRepository<IAccount> accountList = EntityFactory.GetRepository<IAccount>();
        IQueryable qryAccount = (IQueryable)accountList;
        IExpressionFactory exp = qryAccount.GetExpressionFactory();
        ICriteria criteria = qryAccount.CreateCriteria();
        criteria.CreateAlias("Address", "ad");
        IList<IExpression> expression = new List<IExpression>();

        if (chkCompany.Checked && company != null)
        {
            expression.Add(GetExpression(exp, "AccountName", company));
            conditionMet = true;
        }

        if (chkIndustry.Checked && industry != null)
        {
            expression.Add(GetExpression(exp, "Industry", industry));
            conditionMet = true;
        }

        if (chkWebAddress.Checked && webAddress != null)
        {
            expression.Add(GetExpression(exp, "WebAddress", webAddress));
            conditionMet = true;
        }

        if (chkCityStatePostal.Checked && cityStatePostal != null)
        {
            expression.Add(GetExpression(exp, "ad.CityStateZip", cityStatePostal));
            conditionMet = true;
        }

        if (chkWorkPhone.Checked && workPhone != null)
        {
            expression.Add(GetExpression(exp, "MainPhone", workPhone));
            conditionMet = true;
        }

        if (chkTollFreePhone.Checked && tollFree != null)
        {
            expression.Add(GetExpression(exp, "TollFree", tollFree));
            conditionMet = true;
        }

        IJunction junction = rdbMatchAll.Checked ? exp.Conjunction() : exp.Disjunction();
        foreach (IExpression e in expression)
        {
            junction.Add(e);
        }

        criteria.Add(junction);

        if (conditionMet.Equals(true))
        {
            IList list = criteria.List();
            dtsAccounts.setCustomData(list);
            lblAccountMatches.Text = String.Format(GetLocalResourceObject("PotentialAccountMatches_rsc").ToString(), list.Count);
        }
    }

    private IExpression GetExpression(IExpressionFactory ef, string propName, string value)
    {
        return !chkMatchExactly.Checked ? ef.InsensitiveLike(propName, value, LikeMatchMode.Contains) : ef.Eq(propName, value);
    }

    protected void btnUpdate_Click(object sender, EventArgs e)
    {

    }

    protected void rdbMatchAll_CheckedChanged(object sender, EventArgs e)
    {
        LoadingGrids();
        rdbMatchExactly.Checked = false;
    }

    protected void rdbMatchExactly_CheckedChanged(object sender, EventArgs e)
    {
        LoadingGrids();
        rdbMatchAll.Checked = false;
    }

    protected void chkMatchExactly_CheckedChanged(object sender, EventArgs e)
    {
        LoadingGrids();
    }

    protected void btnConvert_Click(object sender, EventArgs e)
    {
        IContact newContact = EntityFactory.Create<IContact>();
        ILeadHistory newHistory = EntityFactory.Create<ILeadHistory>();
        ILeadAddressHistory newAddressHistory = EntityFactory.Create<ILeadAddressHistory>();
        newAddressHistory.LeadHistory = newHistory;
        newHistory.Addresses.Add(newAddressHistory);
        ILead curLead = BindingSource.Current as ILead;
        if (curLead == null) return;
        accountID = ((IAccount) dtsAccounts.Current).Id.ToString();
        if (accountID != null)
        {
            IList<IAccount> selectedAccount = EntityFactory.GetRepository<IAccount>().FindByProperty("Id", accountID);
            if (selectedAccount == null) return;
            foreach (IAccount account in selectedAccount)
            {
                curLead.ConvertLeadToContact(newContact, account,
                                             GetLocalResourceObject("chkAddContacts.Text").ToString());
                curLead.ConvertLeadAddressToContactAddress(newContact);
                curLead.ConvertLeadAddressToAccountAddress(account);
                curLead.MergeLeadWithAccount(account,
                                             GetLocalResourceObject("ExistingAccountwins.Text").ToString(),
                                             newContact);
                account.Save();
                Response.Redirect(string.Format("Contact.aspx?entityId={0}", (newContact.Id)));
            }
        }
    }

    #region ISmartPartInfoProvider Members

    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();

        foreach (Control c in this.LeadMatching_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    #endregion

    protected void btnOpenLead_Click(object sender, EventArgs e)
    {
        if (dtsMatchingLeads.Current != null)
        {
            string leadID = ((ILead) dtsMatchingLeads.Current).Id.ToString();
            if (leadID != null)
            {
                Response.Redirect(string.Format("Lead.aspx?entityId={0}", leadID));
            }
        }
    }

    protected void btnOpenContact_Click(object sender, EventArgs e)
    {
        if (dtsContacts.Current != null)
        {
            string ContactID = ((IContact) dtsContacts.Current).Id.ToString();
            if (ContactID != null)
            {
                Response.Redirect(string.Format("Contact.aspx?entityId={0}", ContactID));
            }
        }
    }

    protected void grdMatchedAccounts_SelectedIndexChanged(object sender, EventArgs e)
    {

    }

    protected void grdMatchedContacts_SelectedIndexChanged(object sender, EventArgs e)
    {

    }

    protected void grdMatchedLeads_SelectedIndexChanged(object sender, EventArgs e)
    {

    }
}