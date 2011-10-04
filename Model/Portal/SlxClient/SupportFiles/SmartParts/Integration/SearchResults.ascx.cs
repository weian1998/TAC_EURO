using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Common.Syndication.Json;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Services;
using Sage.SalesLogix.Services.Integration;
using Sage.SalesLogix.Web.SData;
using SmartPartInfoProvider=Sage.Platform.WebPortal.SmartParts.SmartPartInfoProvider;

public partial class SearchResults : SmartPartInfoProvider, IScriptControl
{
    private static IntegrationManager _integrationManager;
    private SearchResultsScript _searchResultsScript;
    private bool loadSearchResults = true;

    public class SearchResultsScript
    {
        /// <summary>
        /// Gets or sets the page Id.
        /// </summary>
        /// <value>The Id of the page.</value>
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("clientId")]
        public string ClientId { get; set; }

        [JsonProperty("targetAccount")]
        public string TargetAccount { get; set; }

        [JsonProperty("sourceAccountId")]
        public string SourceAccountId { get; set; }

        [JsonProperty("resourceTypeName")]
        public object ResourceTypeName { get; set; }

        [JsonProperty("optionRefineSearchId")]
        public object OptionRefineSearchId { get; set; }

        [JsonProperty("descriptionText")]
        public object DescriptionText { get; set; }

        [JsonProperty("headerText")]
        public object HeaderText { get; set; }

        [JsonProperty("propertyValue")]
        public object PropertyValue { get; set; }

        [JsonProperty("operatorValue")]
        public object OperatorValue { get; set; }

        [JsonProperty("searchValue")]
        public object SearchValue { get; set; }

        [JsonProperty("dialogCaption")]
        public object DialogCaption { get; set; }

        [JsonProperty("errorSaveConfig")]
        public object ErrorSaveConfig { get; set; }

        [JsonProperty("cancelButton")]
        public object CancelButton { get; set; }

        [JsonProperty("OKButton")]
        public object OKButton { get; set; }

        [JsonProperty("refreshGridId")]
        public object RefreshGridId { get; set; }

        [JsonProperty("filtersId")]
        public object FiltersId { get; set; }

        [JsonProperty("rowLinkToId")]
        public object RowLinkToId { get; set; }

        [JsonProperty("rowSearchResultsId")]
        public object RowSearchResultsId { get; set; }

        [JsonProperty("loadingDisplay")]
        public object LoadingDisplay { get; set; }

        [JsonProperty("resultsMsgId")]
        public object ResultsMsgId { get; set; }

        /// <summary>
        /// Froms the specified page.
        /// </summary>
        /// <param name="page">The page.</param>
        /// <returns></returns>
        public static SearchResultsScript Initialize(SearchResults page)
        {
            SearchResultsScript searchResultsScript = new SearchResultsScript();
            searchResultsScript.Id = page.ID;
            searchResultsScript.ClientId = page.ClientID;
            searchResultsScript.TargetAccount = _integrationManager.TargetMapping.Name;
            searchResultsScript.SourceAccountId = _integrationManager.SourceAccount.Id.ToString();
            searchResultsScript.ResourceTypeName = "tradingAccount";
            searchResultsScript.OptionRefineSearchId = page.rdbRefineSearch.ClientID;
            searchResultsScript.DescriptionText = page.GetLocalResourceObject("refineSearch_DescriptionText");
            searchResultsScript.HeaderText = page.GetLocalResourceObject("refineSearch_HeaderText");
            searchResultsScript.PropertyValue = page.GetLocalResourceObject("refineSearch_PropertyValue");
            searchResultsScript.OperatorValue = page.GetLocalResourceObject("refineSearch_OperatorValue");
            searchResultsScript.SearchValue = page.GetLocalResourceObject("refineSearch_SearchValue");
            searchResultsScript.DialogCaption = page.GetLocalResourceObject("refineSearch_DialogCaption");
            searchResultsScript.ErrorSaveConfig = page.GetLocalResourceObject("refineSearch_error_saveConfig");
            searchResultsScript.CancelButton = page.GetLocalResourceObject("refineSearch_CancelButton");
            searchResultsScript.OKButton = page.GetLocalResourceObject("refineSearch_OkButton");
            searchResultsScript.RefreshGridId = page.btnRefreshGrid.ClientID;
            searchResultsScript.FiltersId = page.txtFilters.ClientID;
            searchResultsScript.RowLinkToId = page.rowLinkTo.ClientID;
            searchResultsScript.RowSearchResultsId = page.rowSearchResults.ClientID;
            searchResultsScript.ResultsMsgId = page.lblResultsMsg.ClientID;
            searchResultsScript.LoadingDisplay = page.GetLocalResourceObject("lblLoading.Caption");
            ISessionService sessionService = ApplicationContext.Current.Services.Get<ISessionService>(true);
            ISessionState sessionState = sessionService.GetSessionState();
            sessionState["IntegrationManager"] = _integrationManager;
            return searchResultsScript;
        }
    }

    /// <summary>
    /// Gets the integration manager.
    /// </summary>
    /// <value>The integration manager.</value>
    public IntegrationManager IntegrationManager
    {
        get
        {
            if (DialogService.DialogParameters.ContainsKey("IntegrationManager"))
            {
                _integrationManager = (DialogService.DialogParameters["IntegrationManager"]) as IntegrationManager;
            }
            else
            {
                ISessionService sessionService = ApplicationContext.Current.Services.Get<ISessionService>(true);
                ISessionState sessionState = sessionService.GetSessionState();
                _integrationManager = (IntegrationManager)sessionState["IntegrationManager"];
            }
            return _integrationManager;
        }
    }

    /// <summary>
    /// Gets the index of the selected target.
    /// </summary>
    /// <value>The index of the selected target.</value>
    private int SelectedTargetIndex
    {
        get
        {
            if (String.IsNullOrEmpty(Request.Form["TargetsGroup"]))
            {
                return -1;
            }
            return Convert.ToInt32(Request.Form["TargetsGroup"]);
        }
    }

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"/> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"/> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        if (loadSearchResults)
        {
            grdMatches.DataSource = IntegrationManager.GetMatches();
            grdMatches.DataBind();
        }
        SetViewDisplay();
        InitializeScript();
    }

    private void InitializeScript()
    {
        if (_searchResultsScript == null)
        {
            _searchResultsScript = SearchResultsScript.Initialize(this);
        }
        StringBuilder script = new StringBuilder();
        script.AppendFormat("SmartParts.Integration.SearchResults.create('{0}', {1})", ID,
                            JsonConvert.SerializeObject(_searchResultsScript));

        if (ScriptManager.GetCurrent(Page).IsInAsyncPostBack)
            ScriptManager.RegisterStartupScript(Page, typeof (Page), "SearchResults",
                                                script.ToString(), true);
        if (ScriptManager.GetCurrent(Page) != null)
            ScriptManager.GetCurrent(Page).RegisterScriptControl(this);
    }

    private void SetViewDisplay()
    {
        lblSearchResults.Text = String.Format(GetLocalResourceObject("lblSearchResults.Caption").ToString(),
                          IntegrationManager.TargetMapping.Name);
        if (grdMatches.Rows.Count > 0)
        {
            rowLinkTo.Visible = true;
            rowSearchResults.Visible = true;
            rdbLinkTo.Text = String.Format(GetLocalResourceObject("rdbLinkAccount.Caption").ToString(),
                               IntegrationManager.SourceAccount.AccountName, IntegrationManager.TargetMapping.Name);
            rowCreateAccount.Visible = false;
            rdbCreateNew.Text = GetLocalResourceObject("rdbCreateNew.Caption").ToString();
            rdbLinkTo.Checked = true;
            lblResultsMsg.Text = GetLocalResourceObject("lblResultsMsg.Caption").ToString();
            switch (grdMatches.Rows.Count)
            {
                case 1:
                    grdMatches.Height = 50;
                    break;
                case 2:
                    grdMatches.Height = 70;
                    break;
                case 3:
                    grdMatches.Height = 90;
                    break;
                default:
                    grdMatches.Height = 110;
                    break;
            }
        }
        else
        {
            rowLinkTo.Visible = false;
            rowSearchResults.Visible = false;
            rowCreateAccount.Visible = true;
            lblResultsMsg.Text = GetLocalResourceObject("lblNoMatches.Caption").ToString();
            rdbCreateNew.Text = String.Format(GetLocalResourceObject("lblNoMatchesCreateNew.Caption").ToString(),
                                              IntegrationManager.SourceAccount.AccountName);
            lblCreateAccount.Text = String.Format(GetLocalResourceObject("lblCreateAccount.Caption").ToString(),
                                                  IntegrationManager.TargetMapping.Name);
        }
    }

    /// <summary>
    /// Called when [wire event handlers].
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        btnBack.Click += new EventHandler(btnBack_ClickAction);
        btnNext.Click += new EventHandler(DialogService.CloseEventHappened);
        btnCancel.Click += new EventHandler(DialogService.CloseEventHappened);
    }

    /// <summary>
    /// Handles the RowCreated event of the grdMatches control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewRowEventArgs"/> instance containing the event data.</param>
    protected void grdMatches_RowCreated(object sender, GridViewRowEventArgs e)
    {
        if (e.Row.RowType == DataControlRowType.DataRow)
        {
            Literal radioButton = (Literal)e.Row.FindControl("rdbTarget");
            radioButton.Text =
                String.Format("<input type=\"radio\" onClick='OnMatchSelection(\"{1}\");' name='TargetsGroup' id=\"RowSelector{0}\" value=\"{0}\"",
                              e.Row.RowIndex, rdbLinkTo.ClientID);
            if (SelectedTargetIndex == e.Row.RowIndex)
            {
                radioButton.Text += " checked=\"checked\"";
            }
            radioButton.Text += " />";
        }
    }

    /// <summary>
    /// Handles the ClickAction event of the btnNext control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnNext_ClickAction(object sender, EventArgs e)
    {
        if (rdbLinkTo.Checked)
        {
            if (SelectedTargetIndex <= -1)
            {
                throw new ValidationException(GetLocalResourceObject("error_NoAccountSelected").ToString());
            }
            string aId = grdMatches.DataKeys[SelectedTargetIndex].Values[0].ToString();
            string uuid = grdMatches.DataKeys[SelectedTargetIndex].Values[1].ToString();
            string account;
            if (IntegrationManager.IsTradingAccountLinked(uuid, out account))
            {
                throw new ValidationException(String.Format(GetLocalResourceObject("Error_TradingAccount_Linked").ToString(), account));
            }
            IntegrationManager.TargetId = aId;
            IntegrationManager.SetMergeDataMappings(false);
            if (String.IsNullOrEmpty(IntegrationManager.LinkAccountError))
            {
                string caption = IntegrationManager.DataViewMappings.Count > 0
                                     ? GetLocalResourceObject("MergeRecordsDialog_Differences.Caption").ToString()
                                     : GetLocalResourceObject("MergeRecordsDialog_NoDifferences.Caption").ToString();
                ShowDialog("MergeRecords", caption, 480, 900);
            }
            else
            {
                ShowDialog("LinkResults", GetLocalResourceObject("Dialog.Caption").ToString(), 500, 750);
            }
        }
        else if (rdbCreateNew.Checked)
        {
            IntegrationManager.LinkChildren = false;
            IntegrationManager.LinkTradingAccount(IntegrationManager.SourceAccount.Id.ToString(), true);
            ShowDialog("LinkResults", GetLocalResourceObject("Dialog.Caption").ToString(), 250, 500);
        }
    }

    /// <summary>
    /// Shows a particular dialog setting the caption height and width.
    /// </summary>
    /// <param name="dialog">The name of the dialog to be displayed.</param>
    /// <param name="caption">The caption of the dialog to be displayed.</param>
    /// <param name="height">The height of the dialog to be displayed.</param>
    /// <param name="width">The width of the dialog to be displayed.</param>
    private void ShowDialog(string dialog, string caption, int height, int width)
    {
        DialogService.SetSpecs(200, 200, height, width, dialog, caption, true);
        if (DialogService.DialogParameters.ContainsKey("IntegrationManager"))
        {
            DialogService.DialogParameters.Remove("IntegrationManager");
        }
        DialogService.DialogParameters.Add("IntegrationManager", IntegrationManager);
        _integrationManager = null;
        DialogService.ShowDialog();
    }

    /// <summary>
    /// Handles the ClickAction event of the btnBack control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnBack_ClickAction(object sender, EventArgs e)
    {
        ShowDialog("SelectOperatingAccount", GetLocalResourceObject("Dialog.Caption").ToString(), 230, 600);
    }

    /// <summary>
    /// Called when the dialog is closing.
    /// </summary>
    protected override void OnClosing()
    {
        loadSearchResults = false;
        ISessionService sessionService = ApplicationContext.Current.Services.Get<ISessionService>(true);
        ISessionState sessionState = sessionService.GetSessionState();
        sessionState.Remove("IntegrationManager");
    }

    /// <summary>
    /// Handles the OnClick event of the btnReloadGrid control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnReloadGrid_OnClick(object sender, EventArgs e)
    {
#pragma warning disable 612,618
        var filters = (JavaScriptArray) JavaScriptConvert.DeserializeObject(txtFilters.Text);
        List<MatchingExpression> expressions = (from JavaScriptObject filter in filters
                                                select
                                                    new MatchingExpression(filter["property"].ToString(),
                                                                           (MatchingOperation)
                                                                           Convert.ToInt16(filter["operation"]),
                                                                           filter["searchValue"].ToString())).ToList();
#pragma warning restore 612,618
        grdMatches.DataSource = IntegrationManager.GetMatches(expressions);
        grdMatches.DataBind();
        loadSearchResults = false;
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in SearchResults_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    /// <summary>
    /// Gets a collection of script descriptors that represent ECMAScript (JavaScript) client components.
    /// </summary>
    /// <returns>
    /// An <see cref="T:System.Collections.IEnumerable"/> collection of <see cref="T:System.Web.UI.ScriptDescriptor"/> objects.
    /// </returns>
    public IEnumerable<ScriptDescriptor> GetScriptDescriptors()
    {
        yield break;
    }

    /// <summary>
    /// Gets a collection of <see cref="T:System.Web.UI.ScriptReference"/> objects that define script resources that the control requires.
    /// </summary>
    /// <returns>
    /// An <see cref="T:System.Collections.IEnumerable"/> collection of <see cref="T:System.Web.UI.ScriptReference"/> objects.
    /// </returns>
    public IEnumerable<ScriptReference> GetScriptReferences()
    {
        yield return new ScriptReference("~/SmartParts/Integration/SearchResults.js");
    }
}