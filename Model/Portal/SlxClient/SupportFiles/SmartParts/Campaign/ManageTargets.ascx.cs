using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.ComponentModel;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Entity.Interfaces;
using Sage.Platform.Application.UI;
using System.Collections.Generic;
using Sage.Platform.Repository;
using System.Text;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.SalesLogix.CampaignTarget;
using System.Collections;
using System.Threading;
using Sage.SalesLogix.Client.GroupBuilder;
using Sage.Scheduling.Client;
using Telerik.Web.UI;
using Enumerable = System.Linq.Enumerable;
using IQueryable = Sage.Platform.Repository.IQueryable;
using System.Configuration;

/// <summary>
/// Summary description for CampaignTargets
/// </summary>
public partial class ManageTargets : EntityBoundSmartPartInfoProvider
{
    #region properties

    private IContextService _context;
    private AddManageFilterStateInfo _state;
    
    #endregion

    #region Public definitions

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get
        {
            return typeof(ICampaignTarget);
        }
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        if (BindingSource != null)
        {
            if (BindingSource.Current != null)
            {
                tinfo.Description = BindingSource.Current.ToString();
                tinfo.Title = BindingSource.Current.ToString();
            }
        }

        foreach (SmartPartToolsContainer cont in Enumerable.Select(Enumerable.OfType<SmartPartToolsContainer>(Controls), c => c as SmartPartToolsContainer))
        {
            switch (cont.ToolbarLocation)
            {
                case SmartPartToolsLocation.Right:
                    foreach (Control tool in cont.Controls)
                    {
                        tinfo.RightTools.Add(tool);
                    }
                    break;
                case SmartPartToolsLocation.Center:
                    foreach (Control tool in cont.Controls)
                    {
                        tinfo.CenterTools.Add(tool);
                    }
                    break;
                case SmartPartToolsLocation.Left:
                    foreach (Control tool in cont.Controls)
                    {
                        tinfo.LeftTools.Add(tool);
                    }
                    break;
            }
        }
        return tinfo;
    }

    /// <summary>
    /// 
    /// </summary>
    public class AddManageFilterStateInfo
    {
        public List<ComponentView> targetList = new List<ComponentView>();
        public string targetType = String.Empty;
        public string groupName = String.Empty;
    }

    public enum SearchParameter
    {
        StartingWith,
        Contains,
        EqualTo,
        NotEqualTo,
        EqualOrLessThan,
        EqualOrGreaterThan,
        LessThan,
        GreaterThan
    }

    #endregion

    #region Private Methods

    /// <summary>
    /// Registers the client script.
    /// </summary>
    private void RegisterClientScript()
    {
        ScriptManager.RegisterClientScriptInclude(this, GetType(), "ManageTargets", Page.ResolveUrl("~/SmartParts/Campaign/ManageTargets.js"));
        var script = new StringBuilder();
        if (Page.IsPostBack)
        {
            script.Append("Sage.UI.Forms.ManageTargets.init(" + GetWorkSpace() + " );");
        }
        else
        {
            script.Append("dojo.ready(function () {Sage.UI.Forms.ManageTargets.init(" + GetWorkSpace() + ");");
        }
        ScriptManager.RegisterStartupScript(this, GetType(), "initialize_ManageTargets", script.ToString(), true);
    }

    private string GetWorkSpace()
    {
        StringBuilder sb = new StringBuilder();
        sb.Append("{");
        sb.AppendFormat("mt_chkCompanyId:'{0}',", chkCompany.ClientID);
        sb.AppendFormat("mt_lbxCompanyId:'{0}',", lbxCompany.ClientID);
        sb.AppendFormat("mt_txtCompanyId:'{0}',", txtCompany.ClientID);
        sb.AppendFormat("mt_chkIndustryId:'{0}',", chkIndustry.ClientID);
        sb.AppendFormat("mt_lbxIndustryId:'{0}',", lbxIndustry.ClientID);
        sb.AppendFormat("mt_pklIndustryId:'{0}',", pklIndustry.ClientID + "_Text");
        sb.AppendFormat("mt_chkSICId:'{0}',", chkSIC.ClientID);
        sb.AppendFormat("mt_lbxSICId:'{0}',", lbxSIC.ClientID);
        sb.AppendFormat("mt_txtSICId:'{0}',", txtSIC.ClientID);
        sb.AppendFormat("mt_chkTitleId:'{0}',", chkTitle.ClientID);
        sb.AppendFormat("mt_lbxTitleId:'{0}',", lbxTitle.ClientID);
        sb.AppendFormat("mt_pklTitleId:'{0}',", pklTitle.ClientID + "_Text");
        sb.AppendFormat("mt_chkProductsId:'{0}',", chkProducts.ClientID);
        sb.AppendFormat("mt_lbxProductsId:'{0}',", lbxProducts.ClientID);
        sb.AppendFormat("mt_lueProductsId:'{0}',", lueProducts.ClientID + "_obj");
        sb.AppendFormat("mt_lueProductsPrimaryId:'{0}',", lueProducts.ClientID);
        sb.AppendFormat("mt_chkStatusId:'{0}',", chkStatus.ClientID);
        sb.AppendFormat("mt_lbxStatusId:'{0}',", lbxStatus.ClientID);
        sb.AppendFormat("mt_pklStatusId:'{0}',", pklStatus.ClientID + "_Text");
        sb.AppendFormat("mt_chkSolicitId:'{0}',", chkSolicit.ClientID);
        sb.AppendFormat("mt_chkEmailId:'{0}',", chkEmail.ClientID);
        sb.AppendFormat("mt_chkCallId:'{0}',", chkCall.ClientID);
        sb.AppendFormat("mt_chkMailId:'{0}',", chkMail.ClientID);
        sb.AppendFormat("mt_chkFaxId:'{0}',", chkFax.ClientID);
        sb.AppendFormat("mt_chkCityId:'{0}',", chkCity.ClientID);
        sb.AppendFormat("mt_lbxCityId:'{0}',", lbxCity.ClientID);
        sb.AppendFormat("mt_txtCityId:'{0}',", txtCity.ClientID);
        sb.AppendFormat("mt_chkStateId:'{0}',", chkState.ClientID);
        sb.AppendFormat("mt_lbxStateId:'{0}',", lbxState.ClientID);
        sb.AppendFormat("mt_txtStateId:'{0}',", txtState.ClientID);
        sb.AppendFormat("mt_chkZipId:'{0}',", chkZip.ClientID);
        sb.AppendFormat("mt_lbxZipId:'{0}',", lbxZip.ClientID);
        sb.AppendFormat("mt_txtZipId:'{0}',", txtZip.ClientID);
        sb.AppendFormat("mt_chkLeadSourceId:'{0}',", chkLeadSource.ClientID);
        sb.AppendFormat("mt_lbxLeadSourceId:'{0}',", lbxLeadSource.ClientID);
        sb.AppendFormat("mt_lueLeadSourceId:'{0}',", lueLeadSource.ClientID + "_obj");
        sb.AppendFormat("mt_lueLeadSourcePrimaryId:'{0}',", lueLeadSource.ClientID);
        sb.AppendFormat("mt_chkImportSourceId:'{0}',", chkImportSource.ClientID);
        sb.AppendFormat("mt_lbxImportSourceId:'{0}',", lbxImportSource.ClientID);
        sb.AppendFormat("mt_pklImportSourceId:'{0}',", pklImportSource.ClientID + "_Text");
        sb.AppendFormat("mt_chkCreateDateId:'{0}',", chkCreateDate.ClientID);
        sb.AppendFormat("mt_dtpFromDateId:'{0}',", dtpCreateFromDate.ClientID);
        sb.AppendFormat("mt_dtpToDateId:'{0}',", dtpCreateToDate.ClientID);
        sb.AppendFormat("mt_divLookupTargetsId:'{0}',", divLookupTargets.ClientID);
        sb.AppendFormat("mt_divAddFromGroupId:'{0}',", divAddFromGroup.ClientID);
        sb.AppendFormat("mt_tabLookupTargetId:'{0}',", tabLookupTarget.ClientID);
        sb.AppendFormat("mt_tabAddFromGroupId:'{0}',", tabAddFromGroup.ClientID);
        sb.AppendFormat("mt_rdgIncludeType:'{0}'", rdgIncludeType.ClientID);
        sb.Append("}");
        return sb.ToString();
    }

    /// <summary>
    /// Called when [add entity bindings].
    /// </summary>
    protected override void OnAddEntityBindings()
    {
    }

    /// <summary>
    /// Called when [wire event handlers].
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        cmdAddTargets.Click += AddTargets_OnClick;
        cmdAddTargets.Click += DialogService.CloseEventHappened;
        cmdCancel.Click += DialogService.CloseEventHappened;
        base.OnWireEventHandlers();
    }

    /// <summary>
    /// Called when [activating].
    /// </summary>
    protected override void OnActivating()
    {
        lblHowMany.Text = String.Empty;
        FilterOptions options = new FilterOptions();
        SetFilterControls(options);
        AddDistinctGroupItemsToList(lbxContactGroups, "Contact");
        AddDistinctGroupItemsToList(lbxLeadGroups, "Lead");
    }

    /// <summary>
    /// Called when the dialog is closing.
    /// </summary>
    protected override void OnClosing()
    {
        _context.RemoveContext("AddManageFilterStateInfo");
        FilterOptions options = new FilterOptions();
        SetFilterOptions(options);
        options.Save();
        base.OnClosing();
        Refresh();
    }

    /// <summary>
    /// Adds the distinct group items to list.
    /// </summary>
    private static void AddDistinctGroupItemsToList(ListBox listBox, String entityName)
    {
        listBox.Items.Clear();
        listBox.Items.Add(String.Empty);

        IList groups = GroupInfo.GetGroupList(entityName);
        if (groups != null)
        {
            foreach (GroupInfo group in groups)
            {
                if (!String.IsNullOrEmpty(group.DisplayName))
                {
                    ListItem item = new ListItem();
                    item.Text = group.DisplayName;
                    item.Value = group.GroupID;
                    listBox.Items.Add(item);
                }
            }
        }
    }

    /// <summary>
    /// Handles the Init event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Init(object sender, EventArgs e)
    {
        if (!Visible) return;
        _context = ApplicationContext.Current.Services.Get<IContextService>();
        if (_context.HasContext("AddManageFilterStateInfo"))
        {
            _state = (AddManageFilterStateInfo) _context.GetContext("AddManageFilterStateInfo");
        }
        if (_state == null)
        {
            _state = new AddManageFilterStateInfo();
        }

        rdgIncludeType.Items[0].Attributes.Add("onClick", "return Sage.UI.Forms.ManageTargets.onSearchTypeChange(0);");
        rdgIncludeType.Items[1].Attributes.Add("onClick", "return Sage.UI.Forms.ManageTargets.onSearchTypeChange(1);");
        rdgIncludeType.Items[2].Attributes.Add("onClick", "return Sage.UI.Forms.ManageTargets.onSearchTypeChange(2);");
        rdgIncludeType.Items[3].Attributes.Add("onClick", "return Sage.UI.Forms.ManageTargets.onSearchTypeChange(3);");
        tabLookupTarget.Attributes.Add("onclick", "return Sage.UI.Forms.ManageTargets.onTabLookupTargetClick();");
        tabAddFromGroup.Attributes.Add("onclick", "return Sage.UI.Forms.ManageTargets.onTabAddFromGroupClick();");
        radProcessProgressMgr.Attributes.Add("OnClientProgressUpdating", "return Sage.UI.Forms.ManageTargets.onUpdateProgress();");
        radInsertProcessArea.Attributes.Add("OnClientProgressUpdating", "return Sage.UI.Forms.ManageTargets.onUpdateProgress();");
        cmdClearAll.Attributes.Add("onclick", "return Sage.UI.Forms.ManageTargets.clearFilters();");
    }

    /// <summary>
    /// Called when the smartpart has been bound.  Derived components should override this method to run code that depends on entity 
    /// context being set and it not changing.
    /// </summary>
    protected override void OnFormBound()
    {
        ClientBindingMgr.RegisterDialogCancelButton(cmdCancel);
        if (_state != null)
        {
            grdTargets.DataSource = _state.targetList;
        }
        grdTargets.DataBind();
        cmdAddTargets.Enabled = grdTargets.Rows.Count > 0;
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
    /// Gets the list of targets based on the filter options.
    /// </summary>
    /// <returns>DataTable </returns>
    private IList<ComponentView> GetTargets()
    {
        IList targets = null;
        List<ComponentView> targetsView = new List<ComponentView>();
        string[] propertyNames = new[]
                                     {
                                         "EntityId", "FirstName", "LastName", "Company", "Email", "City", "State", "Zip", "WorkPhone"
                                     };
        if (EntityContext != null)
        {
            switch (rdgIncludeType.SelectedIndex)
            {
                case 0:
                    targets = GetLeadTargets();
                    break;
                case 1:
                    targets = GetAccountTargets();
                    break;
                case 2:
                    targets = GetAccountTargets();
                    break;
                case 3:
                    targets = GetContactTargets();
                    break;
            }
            if (targets != null)
            {
                targetsView.AddRange(from object[] data in targets
                                     let propertyValues = new object[] {}
                                     select new[]
                                                {
                                                    data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8]
                                                }
                                     into propertyValues
                                     select new ComponentView(propertyNames, propertyValues));
                if (_state != null)
                {
                    _state.targetType = rdgIncludeType.SelectedIndex == 0 ? "Lead" : "Contact";
                    _state.targetList = targetsView;
                    _context.SetContext("AddManageFilterStateInfo", _state);
                }
            }
        }
        return targetsView;
    }

    /// <summary>
    /// Gets a list of the Lead targets.
    /// </summary>
    /// <returns></returns>
    private IList GetLeadTargets()
    {
        IList leadList;
        IQueryable query = (IQueryable) EntityFactory.GetRepository<ILead>();
        IExpressionFactory expressions = query.GetExpressionFactory();
        IProjections projections = query.GetProjectionsFactory();
        ICriteria criteria = query.CreateCriteria("a1")
            .CreateCriteria("Addresses", "address")
            .SetProjection(projections.ProjectionList()
                               .Add(projections.Distinct(projections.Property("Id")))
                               .Add(projections.Property("FirstName"))
                               .Add(projections.Property("LastName"))
                               .Add(projections.Property("Company"))
                               .Add(projections.Property("Email"))
                               .Add(projections.Property("address.City"))
                               .Add(projections.Property("address.State"))
                               .Add(projections.Property("address.PostalCode"))
                               .Add(projections.Property("WorkPhone"))
                             
            );

        AddExpressionsCriteria(criteria, expressions);
        leadList = criteria.List();       
        // NOTE: The generic exception handler was removed since the exception was rethrown; this exception would be logged twice otherwise.
        // We may want to throw a UserObservableApplicationException in the future.
        return leadList;
    }

    /// <summary>
    /// Gets the contact targets via a join through Account.
    /// </summary>
    /// <returns></returns>
    private IList GetAccountTargets()
    {
        IList contactList;
        try
        {
            IQueryable query = (IQueryable)EntityFactory.GetRepository<IContact>();
            IExpressionFactory expressions = query.GetExpressionFactory();
            IProjections projections = query.GetProjectionsFactory();
            ICriteria criteria = query.CreateCriteria("a1")
                .CreateCriteria("Account", "account")
                .CreateCriteria("Addresses", "address")
                    .SetProjection(projections.ProjectionList()
                        .Add(projections.Distinct(projections.Property("Id")))
                        .Add(projections.Property("FirstName"))
                        .Add(projections.Property("LastName"))
                        .Add(projections.Property("AccountName"))
                        .Add(projections.Property("Email"))
                        .Add(projections.Property("address.City"))
                        .Add(projections.Property("address.State"))
                        .Add(projections.Property("address.PostalCode"))
                        .Add(projections.Property("WorkPhone"))                       
                        );
            AddExpressionsCriteria(criteria, expressions);
            contactList = criteria.List();
        }
        catch(NHibernate.QueryException nex)
        {
            log.Error("The call to ManageTargets.GetAccountTargets() failed", nex);
            string message = GetLocalResourceObject("QueryError").ToString();
            if (nex.Message.Contains("could not resolve property"))
                message += "  " + GetLocalResourceObject("QueryErrorInvalidParameter");

            throw new ValidationException(message);
        }
        // NOTE: The generic exception handler was removed since the exception was rethrown; this exception would be logged twice otherwise.
        // We may want to throw a UserObservableApplicationException in the future.
        return contactList;
    }

    /// <summary>
    /// Gets the contact targets.
    /// </summary>
    /// <returns></returns>
    private IList GetContactTargets()
    {
        IList contactList;
        IQueryable query = (IQueryable) EntityFactory.GetRepository<IContact>();
        IExpressionFactory expressions = query.GetExpressionFactory();
        IProjections projections = query.GetProjectionsFactory();
        ICriteria criteria = query.CreateCriteria("a1")
            .CreateCriteria("Account", "account")
            .CreateCriteria("a1.Addresses", "address")
            .SetProjection(projections.ProjectionList()
                               .Add(projections.Distinct(projections.Property("Id")))
                               .Add(projections.Property("FirstName"))
                               .Add(projections.Property("LastName"))
                               .Add(projections.Property("AccountName"))
                               .Add(projections.Property("Email"))
                               .Add(projections.Property("address.City"))
                               .Add(projections.Property("address.State"))
                               .Add(projections.Property("address.PostalCode"))
                               .Add(projections.Property("WorkPhone"))
                            
            );
        AddExpressionsCriteria(criteria, expressions);
        contactList = criteria.List();
        // NOTE: The generic exception handler was removed since the exception was rethrown; this exception would be logged twice otherwise.
        // We may want to throw a UserObservableApplicationException in the future.
        return contactList;
    }

    /// <summary>
    /// Adds the expressions criteria.
    /// </summary>
    /// <param name="criteria">The criteria.</param>
    /// <param name="expressions">The expressions.</param>
    /// <returns></returns>
    private void AddExpressionsCriteria(ICriteria criteria, IExpressionFactory expressions)
    {
        if (criteria != null)
        {
            SearchParameter clause;
            Boolean isLeads = (rdgIncludeType.SelectedIndex == 0);
            Boolean isPrimaryContact = (rdgIncludeType.SelectedIndex == 1);
            Boolean isIndividual = (rdgIncludeType.SelectedIndex == 3);

            criteria.Add(expressions.Eq("address.IsPrimary", true));
            if (isPrimaryContact)
            {
                criteria.Add(expressions.Eq("a1.IsPrimary", true));
            }
            if (chkCompany.Checked)
            {
                clause = (SearchParameter)lbxCompany.SelectedIndex;
                criteria.Add(isLeads
                                 ? GetExpression(expressions, clause, "a1.Company", txtCompany.Text)
                                 : GetExpression(expressions, clause, "account.AccountName", txtCompany.Text));
            }
            if (chkIndustry.Checked)
            {
                clause = (SearchParameter)lbxIndustry.SelectedIndex;
                criteria.Add(isLeads
                                 ? GetExpression(expressions, clause, "a1.Industry", pklIndustry.PickListValue)
                                 : GetExpression(expressions, clause, "account.Industry", pklIndustry.PickListValue));
            }
            if (chkSIC.Checked)
            {
                clause = (SearchParameter)lbxSIC.SelectedIndex;
                criteria.Add(isLeads
                                 ? GetExpression(expressions, clause, "a1.SICCode", txtSIC.Text)
                                 : GetExpression(expressions, clause, "account.SicCode", txtSIC.Text));
            }
            if (chkTitle.Checked)
            {
                clause = (SearchParameter)lbxTitle.SelectedIndex;
                criteria.Add(GetExpression(expressions, clause, "a1.Title", pklTitle.PickListValue));
            }
            if (chkProducts.Checked && !isLeads)
            {
                criteria.CreateCriteria("account.AccountProducts", "product");
                clause = (SearchParameter)lbxProducts.SelectedIndex;
                criteria.Add(GetExpression(expressions, clause, "product.ProductName", lueProducts.Text));
            }
            if (chkStatus.Checked)
            {
                clause = (SearchParameter)lbxStatus.SelectedIndex;
                if (isLeads || isIndividual)
                    criteria.Add(GetExpression(expressions, clause, "a1.Status", pklStatus.PickListValue));
                else
                    criteria.Add(GetExpression(expressions, clause, "account.Status", pklStatus.PickListValue));
            }
            if (!chkSolicit.Checked)
                criteria.Add(expressions.Or(expressions.Eq("a1.DoNotSolicit", false), expressions.IsNull("a1.DoNotSolicit")));
            if (!chkEmail.Checked)
                criteria.Add(expressions.Or(expressions.Eq("a1.DoNotEmail", false), expressions.IsNull("a1.DoNotEmail")));
            if (!chkCall.Checked)
                criteria.Add(expressions.Or(expressions.Eq("a1.DoNotPhone", false), expressions.IsNull("a1.DoNotPhone")));
            if (!chkMail.Checked)
                criteria.Add(expressions.Or(expressions.Eq("a1.DoNotMail", false), expressions.IsNull("a1.DoNotMail")));
            if (!chkFax.Checked)
            {
                criteria.Add(isLeads
                                 ? expressions.Or(expressions.Eq("a1.DoNotFAX", false),
                                                  expressions.IsNull("a1.DoNotFAX"))
                                 : expressions.Or(expressions.Eq("a1.DoNotFax", false),
                                                  expressions.IsNull("a1.DoNotFax")));
            }
            if (chkCity.Checked)
            {
                clause = (SearchParameter)lbxCity.SelectedIndex;
                AddCommaDelimitedStringsToExpression(criteria, expressions, txtCity.Text, "address.City", clause);
            }
            if (chkState.Checked)
            {
                clause = (SearchParameter)lbxState.SelectedIndex;
                AddCommaDelimitedStringsToExpression(criteria, expressions, txtState.Text, "address.State", clause);
            }
            if (chkZip.Checked)
            {
                clause = (SearchParameter)lbxZip.SelectedIndex;
                AddCommaDelimitedStringsToExpression(criteria, expressions, txtZip.Text, "address.PostalCode", clause);
            }
            if (chkLeadSource.Checked && rdgIncludeType.SelectedIndex != 3)
            {             
                switch (rdgIncludeType.SelectedIndex)
                {
                    case 0:
                        criteria.CreateCriteria("a1.LeadSource", "leadsource");
                        break;
                    case 3:
                        criteria.CreateCriteria("a1.LeadSources", "leadsource");
                        break;
                    default:
                        criteria.CreateCriteria("account.LeadSource", "leadsource");
                        break;
                }
                clause = (SearchParameter)lbxLeadSource.SelectedIndex;
                criteria.Add(GetExpression(expressions, clause, "leadsource.Description", lueLeadSource.Text));
            }
            if (chkImportSource.Checked)
            {
                clause = (SearchParameter)lbxImportSource.SelectedIndex;
                if (isLeads || isIndividual)
                    criteria.Add(GetExpression(expressions, clause, "a1.ImportSource", pklImportSource.PickListValue));
                else
                    criteria.Add(GetExpression(expressions, clause, "account.ImportSource", pklImportSource.PickListValue));
            }
            if (!string.IsNullOrEmpty(dtpCreateFromDate.Text))
            {
                if (chkCreateDate.Checked && (isLeads || isIndividual))
                    criteria.Add(expressions.Between("a1.CreateDate", CheckForNullDate(dtpCreateFromDate.DateTimeValue), CheckForNullDate(dtpCreateToDate.DateTimeValue)));
                else if (chkCreateDate.Checked)
                    criteria.Add(expressions.Between("account.CreateDate", CheckForNullDate(dtpCreateFromDate.DateTimeValue), CheckForNullDate(dtpCreateToDate.DateTimeValue)));
            }
        }
    }

    /// <summary>
    /// Gets the expression.
    /// </summary>
    /// <param name="ef">The ef.</param>
    /// <param name="expression">The expression.</param>
    /// <param name="propName">Name of the prop.</param>
    /// <param name="value">The value.</param>
    /// <returns></returns>
    private static IExpression GetExpression(IExpressionFactory ef, SearchParameter expression, string propName, string value)
    {
        switch (expression)
        {
            case SearchParameter.StartingWith:
                return ef.InsensitiveLike(propName, value, LikeMatchMode.BeginsWith);
            case SearchParameter.Contains:
                return ef.InsensitiveLike(propName, value, LikeMatchMode.Contains);
            case SearchParameter.EqualOrGreaterThan:
                return ef.Ge(propName, value);
            case SearchParameter.EqualOrLessThan:
                return ef.Le(propName, value);
            case SearchParameter.EqualTo:
                return ef.Eq(propName, value);
            case SearchParameter.GreaterThan:
                return ef.Gt(propName, value);
            case SearchParameter.LessThan:
                return ef.Lt(propName, value);
            case SearchParameter.NotEqualTo:
                return ef.InsensitiveNe(propName, value);
        }
        return null;
    }

    /// <summary>
    /// Adds the comma delimited strings to the expression factory.
    /// </summary>
    /// <param name="criteria">The criteria.</param>
    /// <param name="expressions">The expressions.</param>
    /// <param name="text">The text.</param>
    /// <param name="propertyName">Name of the property.</param>
    /// <param name="clause">The clause.</param>
    private static void AddCommaDelimitedStringsToExpression(ICriteria criteria, IExpressionFactory expressions, String text,
        String propertyName, SearchParameter clause)
    {
        if (!string.IsNullOrEmpty(text))
        {
            string[] values = text.Split(',');
            IList<IExpression> expression = values.Select(value => GetExpression(expressions, clause, propertyName, value)).ToList();
            IJunction junction = expressions.Disjunction();
            foreach (IExpression e in expression)
            {
                junction.Add(e);
            }
            criteria.Add(junction);
        }
    }

    /// <summary>
    /// Handles the OnClick event of the HowMany control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void HowMany_OnClick(object sender, EventArgs e)
    {
        IList targets = null;
        int count = 0;
        switch (rdgIncludeType.SelectedIndex)
        {
            case 0:
                targets = GetLeadTargets();
                break;
            case 1:
                targets = GetAccountTargets();
                break;
            case 2:
                targets = GetAccountTargets();
                break;
            case 3:
                targets = GetContactTargets();
                break;
        }
        if (targets != null)
            count = targets.Count;
        lblHowMany.Text = String.Format(GetLocalResourceObject("HowManyTargets_Msg").ToString(), count);
    }

    /// <summary>
    /// Handles the OnClick event of the Search control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Search_OnClick(object sender, EventArgs e)
    {
        lblHowMany.Text = String.Empty;
        grdTargets.DataSource = GetTargets();
    }

    /// <summary>
    /// Handles the OnClick event of the AddFromGroup control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void AddFromGroup_OnClick(object sender, EventArgs e)
    {
        string groupId = String.Empty;
        string entityName = String.Empty;
        if (rdgAddFromGroup.SelectedIndex == 0)
        {
            entityName = "Lead";
            groupId = lbxLeadGroups.SelectedValue;
        }
        else
        {
            entityName = "Contact";
            groupId = lbxContactGroups.SelectedValue;
        }

        if (!String.IsNullOrEmpty(groupId))
        {
            List<ComponentView> targetList = Helpers.GetEntityGroupList(entityName, groupId);
            if (_state != null)
            {
                _state.targetList = targetList;
                _state.targetType = entityName;
                _state.groupName = lbxContactGroups.SelectedItem.ToString();
                _context.SetContext("AddManageFilterStateInfo", _state);
            }
        }
        else
        {
            throw new ValidationException(GetLocalResourceObject("error_NoGroupSelected").ToString());
        }
    }

    /// <summary>
    /// Handles the changing event of the grdTargetspage control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="GridViewPageEventArgs"/> instance containing the event data.</param>
    protected void grdTargetspage_changing(object sender, GridViewPageEventArgs e)
    {
    }

    /// <summary>
    /// Handles the Sorting event of the grdTargets control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="GridViewSortEventArgs"/> instance containing the event data.</param>
    protected void grdTargets_Sorting(object sender, GridViewSortEventArgs e)
    {
    }

    /// <summary>
    /// Checks for null date and returns current date/time if null.
    /// </summary>
    /// <param name="dateTime">The date time value.</param>
    /// <returns></returns>
    private DateTime? CheckForNullDate(DateTime? dateTime)
    {
        return dateTime ?? (DateTime.UtcNow);
    }

    /// <summary>
    /// Sets the filter controls.
    /// </summary>
    /// <param name="options">The options.</param>
    private void SetFilterControls(FilterOptions options)
    {
        chkCompany.Checked = options.CompanyEnabled;
        SetListBox(lbxCompany, options.CompanyOperator);
        txtCompany.Text = options.CompanyValue;

        chkTitle.Checked = options.TitleEnabled;
        SetListBox(lbxTitle, options.TitleOperator);
        pklTitle.PickListValue = options.TitleValue;

        chkIndustry.Checked = options.IndustryEnabled;
        SetListBox(lbxIndustry, options.IndustryOperator);
        pklIndustry.PickListValue = options.IndustryValue;

        chkSIC.Checked = options.SICEnabled;
        SetListBox(lbxSIC, options.SICOperator);
        txtSIC.Text = options.SICValue;

        chkProducts.Checked = options.ProdOwnedEnabled;
        SetListBox(lbxProducts, options.ProdOwnedOperator);
        lueProducts.Text = options.ProdOwnedValue;

        chkLeadSource.Checked = options.LeadSourceEnabled;
        SetListBox(lbxLeadSource, options.LeadSourceOperator);
        lueLeadSource.Text = options.LeadSourceValue;

        chkStatus.Checked = options.StatusEnabled;
        SetListBox(lbxStatus, options.StatusOperator);
        pklStatus.PickListValue = options.StatusValue;

        chkState.Checked = options.StateEnabled;
        SetListBox(lbxState, options.StateOperator);
        txtState.Text = options.StateValue;

        chkZip.Checked = options.PostalCodeEnabled;
        SetListBox(lbxZip, options.PostalCodeOperator);
        txtZip.Text = options.PostalCodeValue;

        chkCity.Checked = options.CityEnabled;
        SetListBox(lbxCity, options.CityOperator);
        txtCity.Text = options.CityValue;

        chkImportSource.Checked = options.ImportSourceEnabled;
        SetListBox(lbxImportSource, options.ImportSourceOperator);
        pklImportSource.PickListValue = options.ImportSourceValue;

        chkMail.Checked = options.IncludeDoNotMail;
        chkEmail.Checked = options.IncludeDoNotEmail;
        chkCall.Checked = options.IncludeDoNotPhone;
        chkFax.Checked = options.IncludeDoNotFax;
        chkSolicit.Checked = options.IncludeDoNotSolicit;

        rdgIncludeType.SelectedIndex = (int)options.IncludeType;

        chkCreateDate.Checked = options.CreateDateEnabled = chkCreateDate.Checked;
        dtpCreateFromDate.DateTimeValue = options.CreateDateFromValue;
        dtpCreateToDate.DateTimeValue = options.CreateDateToValue;
    }

    /// <summary>
    /// Sets the filter options.
    /// </summary>
    /// <param name="options">The options.</param>
    private void SetFilterOptions(FilterOptions options)
    {
        options.CompanyEnabled = chkCompany.Checked;
        options.CompanyOperator = (FilterOperator)lbxCompany.SelectedIndex;
        options.CompanyValue = txtCompany.Text;

        options.TitleEnabled = chkTitle.Checked;
        options.TitleOperator = (FilterOperator)lbxTitle.SelectedIndex;
        options.TitleValue = pklTitle.PickListValue;
        
        options.IndustryEnabled = chkIndustry.Checked;
        options.IndustryOperator = (FilterOperator)lbxIndustry.SelectedIndex;
        options.IndustryValue = pklIndustry.PickListValue;

        options.SICEnabled = chkSIC.Checked;
        options.SICOperator = (FilterOperator)lbxSIC.SelectedIndex;
        options.SICValue = txtSIC.Text;

        options.ProdOwnedEnabled = chkProducts.Checked;
        options.ProdOwnedOperator = (FilterOperator)lbxProducts.SelectedIndex;
        string prodOwnerID = lueProducts.ClientID + "_LookupText";
        string prodOwner = Request.Form[prodOwnerID.Replace("_", "$")];
        options.ProdOwnedValue = prodOwner;

        options.LeadSourceEnabled = chkLeadSource.Checked;
        options.LeadSourceOperator = (FilterOperator)lbxLeadSource.SelectedIndex;
        string leadSourceID = lueLeadSource.ClientID + "_LookupText";
        string leadSource = Request.Form[leadSourceID.Replace("_", "$")];
        options.LeadSourceValue = leadSource;

        options.StatusEnabled = chkStatus.Checked;
        options.StatusOperator = (FilterOperator)lbxStatus.SelectedIndex;
        options.StatusValue = pklStatus.PickListValue;

        options.StateEnabled = chkState.Checked;
        options.StateOperator = (FilterOperator)lbxState.SelectedIndex;
        options.StateValue = txtState.Text;

        options.PostalCodeEnabled = chkZip.Checked;
        options.PostalCodeOperator = (FilterOperator)lbxZip.SelectedIndex;
        options.PostalCodeValue = txtZip.Text;

        options.CityEnabled = chkCity.Checked;
        options.CityOperator = (FilterOperator)lbxCity.SelectedIndex;
        options.CityValue = txtCity.Text;

        options.ImportSourceEnabled = chkImportSource.Checked;
        options.ImportSourceOperator = (FilterOperator)lbxImportSource.SelectedIndex;
        options.ImportSourceValue = pklImportSource.PickListValue;

        options.IncludeDoNotMail = chkMail.Checked;
        options.IncludeDoNotEmail = chkEmail.Checked;
        options.IncludeDoNotPhone = chkCall.Checked;
        options.IncludeDoNotFax = chkFax.Checked;
        options.IncludeDoNotSolicit = chkSolicit.Checked;
        options.IncludeType = (FilterIncludeType)rdgIncludeType.SelectedIndex;
        options.CreateDateEnabled = chkCreateDate.Checked;
        options.CreateDateFromValue = dtpCreateFromDate.DateTimeValue;
        options.CreateDateToValue = dtpCreateToDate.DateTimeValue;
    }

    /// <summary>
    /// Sets the list box.
    /// </summary>
    /// <param name="lbx">The LBX.</param>
    /// <param name="filterOperator">The filter operator.</param>
    private void SetListBox(ListBox lbx, FilterOperator filterOperator)
    {
        lbx.SelectedIndex = (int)filterOperator;
    }

    /// <summary>
    /// Handles the OnClick event of the AddTargets control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewSortEventArgs"/> instance containing the event data.</param>
    protected void AddTargets_OnClick(object sender, EventArgs e)
    {
        if (_state != null && _state.targetList.Count > 0)
        {
            List<string> targetIds =
                _state.targetList.Select(
                    componentView => componentView.VirtualComponentProperties.FirstOrDefault().Value.ToString()).ToList();
            var tenantId = ConfigurationManager.AppSettings["sage.platform.scheduling.sdata.tenantId"];
            var scheduler = ApplicationContext.Current.Services.Get<ISchedulerService>(true);
            var authProvider = ApplicationContext.Current.Services.Get<IAuthenticationProvider>(true);
            //scheduler.TriggerJob(
            //    tenantId,
            //    "Sage.SalesLogix.CampaignTarget.InsertJob",
            //    new Dictionary<string, object>
            //        {
            //            {"AuthenticationToken", authProvider.AuthenticationToken},
            //            {"CampaignId", EntityContext.EntityID.ToString()},
            //            {"TargetType", _state.targetType},
            //            {"TargetIds", targetIds.ToArray()},
            //            {"GroupName", _state.groupName}
            //        });

            //SetStartProcessInfo();
            InsertTargetManager insertManager = new InsertTargetManager();
            insertManager.CampaignId = EntityContext.EntityID.ToString();
            insertManager.TargetList = targetIds;
            insertManager.TargetType = _state.targetType;
            insertManager.GroupName = _state.groupName;
            insertManager.StartTargetInsertProcess();
            //SetCompleteProcessInfo();
            Refresh();
        }
        else
        {
            DialogService.ShowMessage(GetLocalResourceObject("error_NoTargetsSelected").ToString());
        }
    }

    /// <summary>
    /// Gets the arguments from the handler to set the progress indicator.
    /// </summary>
    /// <param name="args">The args.</param>
    private void InsertTargetHandler(InsertProgressArgs args)
    {
        RadProgressContext insertProgress = RadProgressContext.Current;
        insertProgress["myProgressInfo"] = "112";
        insertProgress["PrimaryPercent"] = Convert.ToString(Math.Round(Decimal.Divide(args.ProcessedCount, args.RecordCount) * 100));
        insertProgress["PrimaryValue"] = String.Format("({0})", args.ProcessedCount.ToString());
        insertProgress["PrimaryTotal"] = String.Format("({0})", args.RecordCount.ToString());
        insertProgress["SecondaryValue"] = String.Format("({0})", args.InsertedCount.ToString());
        insertProgress["SecondaryTotal"] = String.Format("({0})", args.ErrorCount.ToString());
        insertProgress["ProcessCompleted"] = "False";
        Thread.Sleep(1000);
    }

    /// <summary>
    /// Sets the complete process info.
    /// </summary>
    private void SetCompleteProcessInfo()
    {
        RadProgressContext insertProgress = RadProgressContext.Current;
        insertProgress["ProcessCompleted"] = "True";
        Page.Session["ImportingLeads"] = "True";
        Thread.Sleep(1000);
    }

    /// <summary>
    /// Sets the start process info.
    /// </summary>
    private void SetStartProcessInfo()
    {
        RadProgressContext insertProgress = RadProgressContext.Current;
        insertProgress["PrimaryPercent"] = "0";
        insertProgress["PrimaryValue"] = "0";
        insertProgress["PrimaryTotal"] = "0";
        insertProgress["SecondaryValue"] = "0";
        insertProgress["SecondaryTotal"] = "0";
        insertProgress["ProcessCompleted"] = "False";
    }
    #endregion
}