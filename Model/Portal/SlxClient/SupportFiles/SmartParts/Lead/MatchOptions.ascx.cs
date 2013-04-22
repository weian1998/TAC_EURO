using System;
using System.Web.UI;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Entity.Interfaces;
using Sage.SalesLogix.Services.Import;
using Sage.SalesLogix.Services.PotentialMatch;
using System.Text;
using Sage.Platform.WebPortal.Services;

public partial class MatchOptions : EntityBoundSmartPartInfoProvider
{    
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
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in MatchOptions_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    /// <summary>
    /// Gets the advanced options.
    /// </summary>
    /// <returns></returns>
    public MatchAdvancedOptions GetAdvancedOptions()
    {
        MatchAdvancedOptions advancedOptions = GetOptions();
        if (advancedOptions != null)
        {
            if (IsDefaultsSet.Value != "False")
            {
                if (!String.IsNullOrEmpty(txtDuplicate_Low.Text))
                    advancedOptions.DuplicateBottomThreshhold = Convert.ToInt32(txtDuplicate_Low.Text);
                if (!String.IsNullOrEmpty(txtPossibleDuplicate_Low.Text))
                    advancedOptions.PossibleDuplicateBottomThreshhold = Convert.ToInt32(txtPossibleDuplicate_Low.Text);
                if (!String.IsNullOrEmpty(lblPossibleDuplicate_High.Text))
                    advancedOptions.PossibleDuplicateTopThreshhold = Convert.ToInt32(lblPossibleDuplicate_High.Text);
                if (!String.IsNullOrEmpty(lblNoDuplicate_High.Text))
                    advancedOptions.NotDuplicateTopThreshhold = Convert.ToInt32(lblNoDuplicate_High.Text);
                advancedOptions.IncludeStemming = chkUseStemming.Checked;
                advancedOptions.IncludePhonic = chkUsePhonic.Checked;
                advancedOptions.IncludeThesaurus = chkUseSynonym.Checked;
                advancedOptions.IncludeFuzzy = chkUseFuzzy.Checked;
                advancedOptions.FuzzyLevel = Convert.ToInt32(lbxFuzzyLevel.SelectedValue);
            }
            else 
            {
                IsDefaultsSet.Value = "True";
                txtDuplicate_Low.Text = Convert.ToString(advancedOptions.DuplicateBottomThreshhold);
                txtPossibleDuplicate_Low.Text = Convert.ToString(advancedOptions.PossibleDuplicateBottomThreshhold);
                lblPossibleDuplicate_High.Text = Convert.ToString(advancedOptions.PossibleDuplicateTopThreshhold);
                lblNoDuplicate_High.Text = Convert.ToString(advancedOptions.NotDuplicateTopThreshhold);
                chkUseStemming.Checked = advancedOptions.IncludeStemming;
                chkUsePhonic.Checked = advancedOptions.IncludePhonic;
                chkUseSynonym.Checked = advancedOptions.IncludeThesaurus;
                chkUseFuzzy.Checked = advancedOptions.IncludeFuzzy;
                lbxFuzzyLevel.SelectedValue = advancedOptions.FuzzyLevel.ToString();
            }
        }
        return advancedOptions;
    }

    #endregion

    #region Private Methods

    /// <summary>
    /// Registers the client script.
    /// </summary>
    private void RegisterClientScript()
    {
        ScriptManager.RegisterClientScriptInclude(this, GetType(), "MatchOptions",
                                                  Page.ResolveUrl("~/SmartParts/Lead/MatchOptions.js"));
        var script = new StringBuilder();
        if (Page.IsPostBack)
        {
            script.Append(" Sage.UI.Forms.MatchOptions.init(" + GetWorkSpace() + " );");
        }
        else
        {
            script.Append("dojo.ready(function () {Sage.UI.Forms.MatchOptions.init(" + GetWorkSpace() + ");");
        }
        ScriptManager.RegisterStartupScript(this, GetType(), "initialize_MatchOptions", script.ToString(), true);
    }

    private string GetWorkSpace()
    {
        StringBuilder sb = new StringBuilder();
        sb.Append("{");
        sb.AppendFormat("chkUseFuzzyId:'{0}',", chkUseFuzzy.ClientID);
        sb.AppendFormat("lbxFuzzyLevelId:'{0}',", lbxFuzzyLevel.ClientID);
        sb.AppendFormat("txtDuplicate_LowId:'{0}',", txtDuplicate_Low.ClientID);
        sb.AppendFormat("txtPossibleDuplicate_LowId:'{0}',", txtPossibleDuplicate_Low.ClientID);
        sb.AppendFormat("lblPossibleDuplicate_HighId:'{0}',", lblPossibleDuplicate_High.ClientID);
        sb.AppendFormat("lblNoDuplicate_HighId:'{0}',", lblNoDuplicate_High.ClientID);
        sb.Append("}");
        return sb.ToString();
    }

    #endregion

    /// <summary>
    /// Override this method to add bindings to the currrently bound smart part
    /// </summary>
    protected override void OnAddEntityBindings()
    {
    }

    /// <summary>
    /// Called when the smartpart has been bound.  Derived components should override this method to run code that depends on entity context being set and it not changing.
    /// </summary>
    protected override void  OnFormBound()
    {
        base.OnFormBound();
        if (Visible)
        {
            LoadForm();
        }
    }

    /// <summary>
    /// Handles the Load event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!Visible) return;
        RegisterClientScript();
        chkUseFuzzy.Attributes.Add("onclick", "return Sage.UI.Forms.MatchOptions.onUseFuzzyCheckedChanged();");
        txtDuplicate_Low.Attributes.Add("onblur", "return Sage.UI.Forms.MatchOptions.onDuplicateScoreChange();");
        txtPossibleDuplicate_Low.Attributes.Add("onblur", "return Sage.UI.Forms.MatchOptions.onDuplicatePossibleChange();");
        if (DialogService.DialogParameters.ContainsKey("IsImportWizard"))
        {
            tblDupScores.Visible = true;
            cmdCancel.Visible = true;
            cmdOK.Visible = true;
            DialogService.DialogParameters.Remove("IsImportWizard");
        }
    }

    /// <summary>
    /// Handles the Click event of the cmdOK control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdOK_Click(object sender, EventArgs e)
    {
        SaveOptions();
        DialogService.CloseEventHappened(sender, e);
        IPanelRefreshService refresher = PageWorkItem.Services.Get<IPanelRefreshService>();
        if (refresher != null)
        {
            refresher.RefreshAll();
        }
    }

    /// <summary>
    /// Handles the Click event of the cmdCancel control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdCancel_Click(object sender, EventArgs e)
    {
        DialogService.CloseEventHappened(sender, e);
    }

    /// <summary>
    /// Handles the CheckedChanged event of the chkUseFuzzy control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void chkUseFuzzy_CheckedChanged(object sender, EventArgs e)
    {
        lbxFuzzyLevel.Enabled = chkUseFuzzy.Checked;
    }

    /// <summary>
    /// Loads the form.
    /// </summary>
    protected void LoadForm()
    {
        MatchAdvancedOptions advancedOptions = GetOptions();
        if (advancedOptions == null) return;
        txtDuplicate_Low.Text = Convert.ToString(advancedOptions.DuplicateBottomThreshhold);
        txtPossibleDuplicate_Low.Text = Convert.ToString(advancedOptions.PossibleDuplicateBottomThreshhold);
        lblPossibleDuplicate_High.Text = Convert.ToString(advancedOptions.PossibleDuplicateTopThreshhold);
        lblNoDuplicate_High.Text = Convert.ToString(advancedOptions.NotDuplicateTopThreshhold);
        chkUseStemming.Checked = advancedOptions.IncludeStemming;
        chkUsePhonic.Checked = advancedOptions.IncludePhonic;
        chkUseSynonym.Checked = advancedOptions.IncludeThesaurus;
        chkUseFuzzy.Checked = advancedOptions.IncludeFuzzy;
        lbxFuzzyLevel.SelectedValue = advancedOptions.FuzzyLevel.ToString();
    }

    /// <summary>
    /// Gets the options.
    /// </summary>
    /// <returns></returns>
    protected MatchAdvancedOptions GetOptions()
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager != null && importManager.DuplicateProvider != null)
        {
            return importManager.DuplicateProvider.AdvancedOptions;
        }
        IMatchDuplicateProvider dupProvider = Page.Session["duplicateProvider"] as IMatchDuplicateProvider;
        if (dupProvider != null)
        {
            return dupProvider.AdvancedOptions;
        }
        return DialogService.DialogParameters.ContainsKey("matchAdvancedOptions")
                   ? DialogService.DialogParameters["matchAdvancedOptions"] as MatchAdvancedOptions
                   : null;
    }

    /// <summary>
    /// Saves the options.
    /// </summary>
    protected void SaveOptions()
    {
        MatchAdvancedOptions advancedOptions = GetOptions();
        if (advancedOptions != null)
        {

            if (!String.IsNullOrEmpty(txtDuplicate_Low.Text))
            {
                advancedOptions.DuplicateBottomThreshhold = Convert.ToInt32(txtDuplicate_Low.Text);
            }
            if (!String.IsNullOrEmpty(txtPossibleDuplicate_Low.Text))
            {
                advancedOptions.PossibleDuplicateBottomThreshhold = Convert.ToInt32(txtPossibleDuplicate_Low.Text);
            }
            if (!String.IsNullOrEmpty(lblPossibleDuplicate_High.Text))
            {
                advancedOptions.PossibleDuplicateTopThreshhold = Convert.ToInt32(lblPossibleDuplicate_High.Text);
            }
            if (!String.IsNullOrEmpty(lblNoDuplicate_High.Text))
            {
                advancedOptions.NotDuplicateTopThreshhold = Convert.ToInt32(lblNoDuplicate_High.Text);
            }
            advancedOptions.IncludeStemming = chkUseStemming.Checked;
            advancedOptions.IncludePhonic = chkUsePhonic.Checked;
            advancedOptions.IncludeThesaurus = chkUseSynonym.Checked;
            advancedOptions.IncludeFuzzy = chkUseFuzzy.Checked;
            advancedOptions.FuzzyLevel = Convert.ToInt32(lbxFuzzyLevel.SelectedValue);
        }    
        
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager != null)
        {
            if (importManager.DuplicateProvider != null)
            {
                importManager.DuplicateProvider.AdvancedOptions = advancedOptions;
            }
            Page.Session["importManager"] = importManager;
        }
        IMatchDuplicateProvider dupProvider = Page.Session["duplicateProvider"] as IMatchDuplicateProvider;
        if (dupProvider != null)
        {
            dupProvider.AdvancedOptions = advancedOptions;
            Page.Session["duplicateProvider"] = dupProvider;
        }
    }
}