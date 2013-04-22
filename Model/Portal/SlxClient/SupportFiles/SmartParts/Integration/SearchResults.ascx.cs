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
using Sage.SalesLogix.IntegrationContract.Matching;
using Sage.SalesLogix.Services;
using Sage.SalesLogix.Services.Integration;
using SmartPartInfoProvider=Sage.Platform.WebPortal.SmartParts.SmartPartInfoProvider;

public partial class SearchResults : SmartPartInfoProvider
{
    private static IntegrationManager _integrationManager;
    private bool _loadSearchResults = true;

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
        get {
            return String.IsNullOrEmpty(Request.Form["TargetsGroup"])
                       ? -1
                       : Convert.ToInt32(Request.Form["TargetsGroup"]);
        }
    }

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"/> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"/> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        try
        {
            InitializeScript();
            rdbCreateNew.Attributes.Add("onClick", "return advancedSearchOptions.clearTargetSelection();");
            rdbRefineSearch.Attributes.Add("onClick", "return advancedSearchOptions.clearTargetSelection();");
            string error = String.Empty;
            if (_loadSearchResults)
            {
                grdMatches.DataSource = IntegrationManager.GetMatches(out error);
                grdMatches.DataBind();
            }
            SetViewDisplay(error);
        }
        catch (Exception ex)
        {
            rdbRefineSearch.Visible = false;
            //SetViewDisplay will update UI to display the appropriate error
        }
    }

    private void InitializeScript()
    {
        ISessionService sessionService = ApplicationContext.Current.Services.Get<ISessionService>(true);
        ISessionState sessionState = sessionService.GetSessionState();
        sessionState["IntegrationManager"] = IntegrationManager;
        var script = new StringBuilder();
        script.AppendLine("require(['Sage/MainView/IntegrationContract/AdvancedSearchOptions', 'dojo/ready'],");
        script.AppendLine(" function(advancedSearchOptions, dojoReady) {");
        script.AppendLine("     dojoReady(function() {window.advancedSearchOptions = new Sage.MainView.IntegrationContract.AdvancedSearchOptions();");
        script.AppendLine("         window.advancedSearchOptions.init(" + GetWorkSpace() + ");");
        script.AppendLine("     });");
        script.AppendLine(" });");
        ScriptManager.RegisterStartupScript(Page, GetType(), "AdvancedSearchOptions", script.ToString(), true);
    }

    private string GetWorkSpace()
    {
        StringBuilder sb = new StringBuilder();
        sb.Append("{");
        sb.AppendFormat("Id:'{0}',", ID);
        sb.AppendFormat("clientId:'{0}',", ClientID);
        sb.AppendFormat("targetAccount:'{0}',", IntegrationManager.TargetMapping.Name);
        sb.AppendFormat("resourceKind:'{0}',", Sage.SalesLogix.IntegrationContract.Utility.Constants.TradingAcctResourceKind);
        sb.AppendFormat("optionRefineSearchId:'{0}',", rdbRefineSearch.ClientID);
        sb.AppendFormat("refreshGridId:'{0}',", btnRefreshGrid.ClientID);
        sb.AppendFormat("resultsMsgId:'{0}',", lblResultsMsg.ClientID);
        sb.AppendFormat("filtersId:'{0}',", txtFilters.ClientID);
        sb.AppendFormat("rowLinkToId:'{0}',", rowLinkTo.ClientID);
        sb.AppendFormat("rowSearchResultsId:'{0}',", rowSearchResults.ClientID);
        sb.Append("}");
        return sb.ToString();
    }

    private void SetViewDisplay(string error)
    {
        lblSearchResults.Text = String.Format(GetLocalResourceObject("lblSearchResults.Caption").ToString(),
                                              IntegrationManager.TargetMapping.Name);
        if (grdMatches.Rows.Count > 0)
        {
            rowLinkTo.Visible = true;
            rowSearchResults.Visible = true;
            rdbLinkTo.Text = String.Format(GetLocalResourceObject("rdbLinkAccount.Caption").ToString(),
                                           IntegrationManager.SourceAccount.AccountName,
                                           IntegrationManager.TargetMapping.Name);
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
            rdbCreateNew.Checked = true;
            rowLinkTo.Visible = false;
            rowSearchResults.Visible = false;
            rowCreateAccount.Visible = true;
            lblResultsMsg.Text = !String.IsNullOrEmpty(error)
                                     ? GetLocalResourceObject("Error_SDataRequest").ToString()
                                     : GetLocalResourceObject("lblNoMatches.Caption").ToString();
            rdbCreateNew.Text = String.Format(GetLocalResourceObject("lblNoMatchesCreateNew.Caption").ToString(),
                                              IntegrationManager.SourceAccount.AccountName);
            lblCreateAccount.Text = String.Format(GetLocalResourceObject("lblCreateAccount.Caption").ToString(),
                                                  IntegrationManager.TargetMapping.Name);
        }
        rdbRefineSearch.Visible = !String.IsNullOrEmpty(error) && IntegrationManager.TargetSearchFilters != null && IntegrationManager.TargetSearchFilters.Count > 0;
    }

    /// <summary>
    /// Called when [wire event handlers].
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        btnBack.Click += btnBack_ClickAction;
        btnNext.Click += DialogService.CloseEventHappened;
        btnCancel.Click += DialogService.CloseEventHappened;
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
                String.Format("<input type=\"radio\" onClick='advancedSearchOptions.onMatchSelection(\"{1}\");' name='TargetsGroup' id=\"RowSelector{0}\" value=\"{0}\"",
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
        ShowDialog("SelectOperatingAccount", GetLocalResourceObject("Dialog.Caption").ToString(), 250, 600);
    }

    /// <summary>
    /// Called when the dialog is closing.
    /// </summary>
    protected override void OnClosing()
    {
        _loadSearchResults = false;
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
                                                    new MatchingExpression(filter["fieldName"].ToString(),
                                                                           (MatchingOperation)
                                                                           Convert.ToInt16(filter["operator"]),
                                                                           filter["searchValue"].ToString())).ToList();
#pragma warning restore 612,618
        grdMatches.DataSource = IntegrationManager.GetMatches(expressions);
        grdMatches.DataBind();
        _loadSearchResults = false;
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
}