using System;
using System.Web.UI;
using System.Collections.Generic;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.Diagnostics;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Services.PotentialMatch;
using System.Web.UI.WebControls;
using System.Data;
using Sage.Platform.Application.UI.Web;
using System.Text;

public partial class LeadSearchForDuplicates : EntityBoundSmartPartInfoProvider
{
    private LeadDuplicateProvider _duplicateProvider;

    #region Public Methods

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(ILead); }
    }

    /// <summary>
    /// Tries to retrieve smart part information compatible with type
    /// smartPartInfoType.
    /// </summary>
    /// <param name="smartPartInfoType">Type of information to retrieve.</param>
    /// <returns>
    /// The <see cref="T:Sage.Platform.Application.UI.ISmartPartInfo"/> instance or null if none exists in the smart part.
    /// </returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();

        foreach (Control c in LeadMatching_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        tinfo.Title = GetLocalResourceObject("DialogTitle").ToString();
        return tinfo;
    }

    /// <summary>
    /// Gets the duplicate provider.
    /// </summary>
    /// <value>The duplicate provider.</value>
    public LeadDuplicateProvider DuplicateProvider
    {
        get
        {
                if (_duplicateProvider == null)
                {
                    ILead lead = BindingSource.Current as ILead;
                    _duplicateProvider = new LeadDuplicateProvider();
                    _duplicateProvider.EntitySource = new MatchEntitySource(typeof(ILead), lead);

                }
                if (_duplicateProvider.EntitySource.EntityData == null)
                {

                    _duplicateProvider.EntitySource.EntityData = BindingSource.Current;
                }
            return _duplicateProvider;
        }
    }
    
    #endregion

    #region Private Methods

    /// <summary>
    /// Loads the source entity that the de-dup will be performed on.
    /// </summary>
    private void LoadSourceEntity()
    {
        if (DuplicateProvider != null)
        {
            try
            {
                LoadSourceSnapshot();
            }
            catch (Exception ex)
            {              
                string sSlxErrorId = null;
                var sMsg = ErrorHelper.GetClientErrorHtmlMessage(ex, ref sSlxErrorId);
                if (!string.IsNullOrEmpty(sSlxErrorId))
                {
                    log.Error(ErrorHelper.AppendSlxErrorId("The call to LeadSearchForDuplicates.LoadSourceEntity() failed", sSlxErrorId), ex);                    
                }
                DialogService.ShowHtmlMessage(sMsg, ErrorHelper.IsDevelopmentContext() ? 600 : -1,
                                              ErrorHelper.IsDevelopmentContext() ? 800 : -1);
            }
        }
    }

    /// <summary>
    /// Loads the match filters.
    /// </summary>
    /// <see>PotentialMatchConfiguration.xml</see>
    /// <seealso cref="Sage.SalesLogix.Services.PotentialMatch"/>
    private void LoadMatchFilters()
    {
        SetActiveFilters();
        chkListFilters.Items.Clear();
        foreach (MatchPropertyFilterMap propertyFilter in DuplicateProvider.GetFilters())
        {
            ListItem item = new ListItem();
            // Localiztion
            // If resource does not exist then use the xml value. Item is prefixed with "Filter" to better identify resource items
            if (GetLocalResourceObject("Filter." + propertyFilter.PropertyName) != null &&
                GetLocalResourceObject("Filter." + propertyFilter.PropertyName).ToString() != "")
            {
                item.Text = GetLocalResourceObject("Filter." + propertyFilter.PropertyName).ToString();
            }
            else
            {
                item.Text = propertyFilter.DisplayName;
            }

            item.Value = propertyFilter.PropertyName;
            item.Selected = propertyFilter.Enabled;
            chkListFilters.Items.Add(item);
        }
    }

    /// <summary>
    /// Loads the potential matches.
    /// </summary>
    private void LoadPotentialMatches()
    {
        if (Mode.Value == "Load")
        {
            Mode.Value = "View";
            SetActiveFilters();
            if (UpdateIndex.Value == "True")
            {
                DuplicateProvider.RefreshIndexes(false);
                UpdateIndex.Value = "False";
            }
            DuplicateProvider.FindMatches();
            MatchResults matchResults = DuplicateProvider.GetMatchResults();
            if (matchResults != null)
            {
                DataTable dataTable = GetPotentialMatchesLayout();
                DataTable accountTable = GetPotentialAccountMatchesLayout();

                string leadType = GetLocalResourceObject("lblLeads.Caption").ToString();
                string contactType = GetLocalResourceObject("lblContacts.Caption").ToString();

                matchResults.HydrateResults();
                foreach (MatchResultItem resultItem in matchResults.Items)
                {
                    if (resultItem.EntityType == typeof(ILead))
                    {
                        AddLeadEntityToDataSource(dataTable, resultItem, leadType);
                    }
                    else if (resultItem.EntityType == typeof(IContact))
                    {
                        AddContactEntityToDataSource(dataTable, resultItem, contactType);
                    }
                    else if (resultItem.EntityType == typeof(IAccount))
                    {
                        AddAccountEntityToDataSource(accountTable, resultItem);
                    }
                }
                grdMatches.DataSource = dataTable;
                grdAccountMatches.DataSource = accountTable;
            }
            grdMatches.DataBind();
            grdAccountMatches.DataBind();
        }
        else 
        {
            grdMatches.DataBind();
            grdAccountMatches.DataBind();
        }
    }

    /// <summary>
    /// Adds the account entity to data source.
    /// </summary>
    /// <param name="accountTable">The account table.</param>
    private void AddAccountEntityToDataSource(DataTable accountTable, MatchResultItem resultItem)
    {
        try
        {
            IAccount account = resultItem.Data as IAccount;
            accountTable.Rows.Add(account.Id.ToString(), account.AccountName, account.Industry, account.WebAddress,
                account.Address.CityStateZip, account.MainPhone, account.Type);
        }
        catch
        {
        }
    }

    /// <summary>
    /// Adds the contact entity to data source.
    /// </summary>
    /// <param name="dataTable">The data table.</param>
    private void AddContactEntityToDataSource(DataTable dataTable, MatchResultItem resultItem, string type)
    {
        try
        {
            IContact contact = resultItem.Data as IContact;
            dataTable.Rows.Add(contact.Id.ToString(), "Contact", resultItem.Score, type, contact.Account.AccountName,
                contact.FirstName, contact.LastName, contact.Title, contact.Email, contact.Address.CityStateZip,
                contact.WorkPhone);
        }
        catch
        {
        }
    }

    /// <summary>
    /// Adds the lead entity to data source.
    /// </summary>
    private void AddLeadEntityToDataSource(DataTable dataTable, MatchResultItem resultItem, string type)
    {
        try
        {
            ILead lead = resultItem.Data as ILead;
            dataTable.Rows.Add(lead.Id.ToString(), "Lead", resultItem.Score, type, lead.Company, lead.FirstName,
                lead.LastName, lead.Title, lead.Email, lead.Address.LeadCtyStZip, lead.WorkPhone);
        }
        catch
        {
        }
    }

    /// <summary>
    /// Gets the data table.
    /// </summary>
    /// <returns></returns>
    private DataTable GetPotentialMatchesLayout()
    {
        DataTable dataTable = new DataTable("PotentialMatches");

        DataColumn dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "Id";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "EntityType";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "Score";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "EntityName";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "Company";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "FirstName";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "LastName";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "Title";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "Email";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "CityStateZip";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "WorkPhone";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        return dataTable;
    }

    /// <summary>
    /// Gets the potential account matches layout.
    /// </summary>
    /// <returns></returns>
    private DataTable GetPotentialAccountMatchesLayout()
    {
        DataTable dataTable = new DataTable("AccountMatches");

        DataColumn dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "Id";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "AccountName";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "Industry";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "WebAddress";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "CityStateZip";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "MainPhone";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        dataColumn = dataTable.Columns.Add();
        dataColumn.ColumnName = "Type";
        dataColumn.DataType = typeof (string);
        dataColumn.AllowDBNull = true;

        return dataTable;
    }

    /// <summary>
    /// Sets the active filters.
    /// </summary>
    private void SetActiveFilters()
    {
        foreach (ListItem item in chkListFilters.Items)
        {
           DuplicateProvider.SetActiveFilter(item.Value, item.Selected);
        }
        DuplicateProvider.MatchOperator = rdgOptions.SelectedIndex == 0 ? MatchOperator.And : MatchOperator.Or;
        DuplicateProvider.SearchAccount = chkAccounts.Checked;
        DuplicateProvider.SearchContact = (chkContacts.Checked);
        DuplicateProvider.SearchLead = (chkLeads.Checked);
        DuplicateProvider.AdvancedOptions = MatchOptions.GetAdvancedOptions();
    }

    /// <summary>
    /// Registers the client script.
    /// </summary>
    private void RegisterClientScript()
    {
        ScriptManager.RegisterClientScriptInclude(this, GetType(), "LeadSearchForDuplicates", Page.ResolveUrl("~/SmartParts/Lead/LeadSearchForDuplicates.js"));
        var script = new StringBuilder();
        if (Page.IsPostBack)
        {
            script.Append(" Sage.UI.Forms.LeadSearchForDuplicates.init(" + GetWorkSpace() + " );");
        }
        else
        {
            script.Append("dojo.ready(function () {Sage.UI.Forms.LeadSearchForDuplicates.init(" + GetWorkSpace() + ");");
        }
        ScriptManager.RegisterStartupScript(this, GetType(), "initialize_LeadSearchForDuplicates", script.ToString(), true);
    }

    private string GetWorkSpace()
    {
        StringBuilder sb = new StringBuilder();
        sb.Append("{");
        sb.AppendFormat("divFiltersID:'{0}',", divFilters.ClientID);
        sb.AppendFormat("tabFiltersID:'{0}',", tabFilters.ClientID);
        sb.AppendFormat("divOptionsID:'{0}',", divOptions.ClientID);
        sb.AppendFormat("tabOptionsID:'{0}',", tabOptions.ClientID);
        sb.Append("}");
        return sb.ToString();
    }

    /// <summary>
    /// Loads the source snapshot.
    /// </summary>
    private void LoadSourceSnapshot()
    {
        if (BindingSource.Current != null)
        {
            ILead lead = BindingSource.Current as ILead;
            lblLead.Text = !String.IsNullOrEmpty(lead.LastName) ? String.Format("{0}, {1}", lead.LastName, lead.FirstName) : lead.FirstName;
            lblValueCompany.Text = lead.Company;
            if (lead.Address != null)
                lblAddress.Text = lead.Address.FormatFullLeadAddress();
            lblValueEmail.Text = lead.Email;
            lblValueTitle.Text = lead.Title;
            phnWorkPhone.Text = lead.WorkPhone;
            lblValueWeb.Text = lead.WebAddress;
        }
    }

    #endregion

    /// <summary>
    /// Handles the Init event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Init(object sender, EventArgs e)
    {
        if (!Visible) return;
        SmartPart smartPart = MatchOptions;
        if (smartPart != null)
        {
            smartPart.InitSmartPart(ParentWorkItem, PageWorkItem.Services.Get<IPageWorkItemLocator>());
            smartPart.DialogService = DialogService;
            EntityBoundSmartPart entitySmartPart = smartPart as EntityBoundSmartPart;
            if (entitySmartPart != null)
            {
                entitySmartPart.InitEntityBoundSmartPart(PageWorkItem.Services.Get<IEntityContextService>());
            }
        }
        tabFilters.Attributes.Add("onClick", "return Sage.UI.Forms.LeadSearchForDuplicates.onTabFiltersClick();");
        tabOptions.Attributes.Add("onClick", "return Sage.UI.Forms.LeadSearchForDuplicates.onTabOptionsClick();");
    }

    /// <summary>
    /// Raises the <see cref="E:Load"/> event.
    /// </summary>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);

        if (Visible)
        {
            RegisterClientScript();
        }
    }

    /// <summary>
    /// Override this method to add bindings to the currrently bound smart part
    /// </summary>
    protected override void OnAddEntityBindings()
    {
    }

    /// <summary>
    /// Raises the <see cref="E:PreRender"/> event.
    /// </summary>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
            if (Visible && DuplicateProvider != null)
            {
                LoadMatchFilters();
                LoadSourceEntity();
                LoadPotentialMatches();
            }
     }

    /// <summary>
    /// Derived components should override this method to wire up event handlers.
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        cmdCancel.Click += DialogService.CloseEventHappened;
    }

    /// <summary>
    /// Handles the SelectedIndexChanged event of the grdMatches control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void grdMatches_SelectedIndexChanged(object sender, EventArgs e)
    {
    }

    /// <summary>
    /// Adds the contact to account.
    /// </summary>
    /// <param name="sourceLead">The source lead.</param>
    /// <param name="accountID">The account ID.</param>
    private void AddContactToAccount(ILead sourceLead, string accountID)
    {
        if (accountID == null) return;
        IList<IAccount> selectedAccount = EntityFactory.GetRepository<IAccount>().FindByProperty("Id", accountID);
        if (selectedAccount != null)
        {
            foreach (IAccount account in selectedAccount)
            {
                IContact newContact = EntityFactory.Create<IContact>();
                sourceLead.ConvertLeadToContact(newContact, account, "Add Contact to this Account");
                sourceLead.ConvertLeadAddressToContactAddress(newContact);
                sourceLead.ConvertLeadAddressToAccountAddress(account);
                sourceLead.MergeLeadWithAccount(account, "ACCOUNTWINS", newContact);
                account.Contacts.Add(newContact);
                account.Save();
                Response.Redirect(String.Format("Contact.aspx?entityId={0}", (newContact.Id)));
            }
        }
    }

    /// <summary>
    /// Handles the OnRowCommand event of the grdAccountMatches control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewCommandEventArgs"/> instance containing the event data.</param>
    protected void grdAccountMatches_OnRowCommand(object sender, GridViewCommandEventArgs e)
    {
        if (!e.CommandName.Equals("Add Contact")) return;
        int rowIndex = Convert.ToInt32(e.CommandArgument);
        string entityId = grdAccountMatches.DataKeys[rowIndex].Values[0].ToString();

        if (entityId != null)
        {
            if (DuplicateProvider.EntitySource.EntityData != null)
            {
                ILead sourceLead = DuplicateProvider.EntitySource.EntityData as ILead;
                AddContactToAccount(sourceLead, entityId);
            }
        }
    }

    /// <summary>
    /// Handles the SelectedIndexChanged event of the grdMatches control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void grdAccountMatches_SelectedIndexChanged(object sender, EventArgs e)
    {
    }

    /// <summary>
    /// Handles the Click event of the cmdUpdateMatches control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdUpdateMatches_Click(object sender, EventArgs e)
    {
        Mode.Value = "Load";
    }
    
    /// <summary>
    /// Handles the OnRowCommand event of the grdDuplicates control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewCommandEventArgs"/> instance containing the event data.</param>
    protected void grdMatches_OnRowCommand(object sender, GridViewCommandEventArgs e)
    {
        if (e.CommandName.Equals("Open"))
        {
            int rowIndex = Convert.ToInt32(e.CommandArgument);
            string Id = grdMatches.DataKeys[rowIndex].Values[0].ToString();
            string entityName = grdMatches.DataKeys[rowIndex].Values[1].ToString();
            Response.Redirect(string.Format("{0}.aspx?entityId={1}", entityName, Id));
            DialogService.CloseEventHappened(sender, e);
        }
    }

    /// <summary>
    /// Called when [closing].
    /// </summary>
    protected override void OnClosing()
    {
        DialogService.DialogParameters.Remove("duplicateProvider");
        DialogService.DialogParameters.Remove("matchAdvancedOptions");
        base.OnClosing();
    }

    /// <summary>
    /// Sets the options.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void SetOptions(object sender, EventArgs e)
    {
        if (!DialogService.DialogParameters.ContainsKey("matchAdvancedOptions") && Visible)
        {
            DialogService.DialogParameters.Add("matchAdvancedOptions", DuplicateProvider.AdvancedOptions);
        }
    }
}