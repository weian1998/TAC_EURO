using System;
using System.Globalization;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using Sage.Platform.Application.UI;
using Sage.Platform.Application.UI.Web;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix;
using Sage.SalesLogix.WebUserOptions;
using Sage.Platform.Data;
using System.Collections.Generic;
using Sage.SalesLogix.Security;

// ReSharper disable CheckNamespace
// ReSharper disable ConvertToAutoProperty

//EntityBoundSmartPartInfoProvider
public partial class GeneralSearchOptionsPage : UserControl, ISmartPartInfoProvider
{
    [ServiceDependency]
    public IPageWorkItemLocator Locator { get; set; }

    private const string _optionsMapPath = @"App_Data\LookupValues";  
    private GeneralSearchOptions _options;

    /// <summary>
    /// Handles the PreRender event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_PreRender(object sender, EventArgs e)
    {
        var _UserOptions = ApplicationContext.Current.Services.Get<IUserOptionsService>();
        // set defaults
        Utility.SetSelectedValue(_showOnStartup, GetStartupValFromUrl(_options.ShowOnStartup));
        if (_options.DefaultOwnerTeam != string.Empty)
            _defaultOwnerTeam.LookupResultValue = EntityFactory.GetById<IOwner>(_options.DefaultOwnerTeam);        
        const string falseValues = "F,FALSE,N,NO,0";
        Utility.SetSelectedValue(_logToHistory,
                                 falseValues.IndexOf(_options.LogToHistory.ToUpperInvariant(),
                                                     StringComparison.InvariantCultureIgnoreCase) > -1
                                     ? "F"
                                     : "T");
        //-----------------------------------------------------------------------
        //Defect 1-80914 
        // Please only hide the options for now.  We may re-enable them in Sawgrass depending on the direction we choose to take.
        // These options are hidden; if we do not set them...the options will be overwritten with the default values.
        _promptDuplicateContacts.Checked = _options.PromptForDuplicateContacts;
        _promptContactNotFound.Checked = _options.PromptForContactNotFound;
        _useActiveReporting.Checked = _options.UseActiveReporting;
        _autoLogoff.Checked = _options.AutoLogoff;
        _logoffDuration.Text = _options.LogoffDuration.ToString(CultureInfo.InvariantCulture);
        Utility.SetSelectedValue(_logoffUnits, _options.LogoffUnits);

        txtRecentTemplates.Text = _options.RecentTemplates;
        txtFaxProvider.Value = _options.FaxProvider;
        chkPromptForUnsavedData.Checked = _options.PromptForUnsavedData;

        var systemInfo = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.SalesLogix.Services.ISystemOptionsService>(true);
        if (systemInfo.MultiCurrency)
        {
            bool allowCurrencyChange = !_UserOptions.GetCommonOptionLocked("Currency", "General");
            lblMyCurrency.Visible = true;
            luMyCurrency.Visible = true;
            if (!String.IsNullOrEmpty(_options.MyCurrencyCode) && luMyCurrency.LookupResultValue == null)
            {
                luMyCurrency.LookupResultValue = EntityFactory.GetById<IExchangeRate>(_options.MyCurrencyCode);
            }

            if (!allowCurrencyChange)
            {
                luMyCurrency.ReadOnly = true;
            }
        }
        else
        {
            lblMyCurrency.Visible = false;
            luMyCurrency.Visible = false;
        }
        txtEmailBaseTemplate.Attributes.Add("style", "height:22px; -moz-box-sizing:border-box; box-sizing:border-box; width:100%;");
        txtLetterBaseTemplate.Attributes.Add("style", "height:22px; -moz-box-sizing:border-box; box-sizing:border-box; width:100%;");
        txtFaxBaseTemplate.Attributes.Add("style", "height:22px; -moz-box-sizing:border-box; box-sizing:border-box; width:100%;");
        txtRecentTemplates.Attributes.Add("onchange", "javascript:checkMenuRange()");
        lblFaxProvider.Attributes.Add("style", "display:none");

        var optionSvc = ApplicationContext.Current.Services.Get<Sage.SalesLogix.Services.ISystemOptionsService>(true);
        int dbType = optionSvc.DbType;
        const int dbRemote = 2;
        if (dbType != dbRemote)
        {
            // If this is *not* a remote database then hide the "Use ActiveReporting" option.
            _useActiveReporting.Attributes.Add("style", "display:none");
        }

        string _group = _UserOptions.GetCommonOption("SyncGroup", "Intellisync");
        _defaultOwnerTeam.Enabled = !_UserOptions.GetCommonOptionLocked("InsertSecCodeID", "General");

        if (!string.IsNullOrEmpty(_group))
        {
            Utility.SetSelectedValue(_intellisyncGroup, _group);
            _intellisyncGroup.Enabled = false;
        }
        else
            _intellisyncGroup.Enabled = true;

        string checkboxEnabledValue = _UserOptions.GetCommonOption("GroupCheckboxEnabled", "GroupGridView");
        bool checkboxEnabled = Utility.StringToBool(checkboxEnabledValue);
        cbCheckboxEnabled.Checked = checkboxEnabled;

        bool AllowUserToChange = !_UserOptions.GetCommonOptionLocked("DefaultMemoTemplate", "General");
        txtEmailBaseTemplate.Enabled = AllowUserToChange;
        txtLetterBaseTemplate.Enabled = AllowUserToChange;
        txtFaxBaseTemplate.Enabled = AllowUserToChange;
        if (!AllowUserToChange)
        {
            txtEmailBaseTemplateImg.Attributes.Add("onclick", "");
            txtLetterBaseTemplateImg.Attributes.Add("onclick", "");
            txtFaxBaseTemplateImg.Attributes.Add("onclick", "");
        }
        LoadScript();
        LoadTemplateOptions();
    }

    private void BindShowOnStartup()
    {
        if (_showOnStartup.Items.Count == 0)
        {
            // We don't have a good way to get the possiblities to show on startup; mainviews doesn't match, etc.
            _showOnStartup.Items.Add(new ListItem(string.Empty, string.Empty));
            foreach (ListItem ni in StartupItems())
            {
                var navitem = new ListItem(ni.Text, ni.Text);
                _showOnStartup.Items.Add(navitem);
            }
        }
    }

    private void BindLogoffUnits()
    {
        if (_logoffUnits.Items.Count == 0)
        {
            _logoffUnits.DataSource = _options.LogoffUnitsList;
            _logoffUnits.DataTextField = _options.DataTextField;
            _logoffUnits.DataValueField = _options.DataValueField;            
        }
    }

    private void BindLogToHistory()
    {
        if (_logToHistory.Items.Count == 0)
        {
            _logToHistory.DataSource = _options.LogToHistoryLookupList;
            _logToHistory.DataTextField = _options.DataTextField;
            _logToHistory.DataValueField = _options.DataValueField;            
        }
    }

    private IEnumerable<ListItem> StartupItems()
    {
        var res = new List<ListItem>();
        IWorkspace nb = ((UIWorkItem)Locator).Workspaces["NavBar"];
        if (nb != null)
        {
            foreach (object sp in nb.SmartParts)
            {
                foreach (NavItem ni in ((NavItemCollection)(sp)).Items)
                {
                    var navitem = new ListItem(ni.Text, ni.NavURL);
                    if (!res.Contains(navitem))
                        res.Add(navitem);
                }
            }
        }
        return res;
    }

    private string GetStartupValFromUrl(string url)
    {
        foreach (ListItem item in StartupItems())
        {
            if (item.Value.Equals(url))
                return item.Text;
        }
        return string.Empty;
    }

    private string GetStartupUrl(string val)
    {
        foreach (ListItem item in StartupItems())
        {
            if (item.Text.Equals(val))
                return item.Value;
        }
        return string.Empty;
    }

    /// <summary>
    /// Handles the Load event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Load(object sender, EventArgs e)
    {
        Page.Header.Controls.Add(new LiteralControl("<link rel=\"stylesheet\" type=\"text/css\" href=\"css/SlxOptions.css\" />"));
        try
        {
            _options = GeneralSearchOptions.Load(Server.MapPath(_optionsMapPath));
        }
        catch
        {
            // temporary, as the service throws an exception for options not found
            // the service is not yet complete, but this allows testing of the UI
            _options = GeneralSearchOptions.CreateNew(Server.MapPath(_optionsMapPath));
        }

        LoadIntellisyncOptions();
        BindShowOnStartup();
        BindLogoffUnits();
        BindLogToHistory();
        Page.DataBind();
    }

    private void LoadScript()
    {
        const string script = @"
$(document).ready(function() {
    if (Sage.gears) {
        showSDIIsInstalledMsg();
    } else if (Sage.OnGearsInitialized) {
        Sage.OnGearsInitialized.push(showSDIIsInstalledMsg);
    }
});
function showSDIIsInstalledMsg() {
    if (Sage.gears) {
        $('.areinstalled').css('display','inline');
        $('.notinstalled').css('display','none');
    }
}";
        ScriptManager.RegisterStartupScript(Page, GetType(), "genOptionsStartupScript", script, true);
    }

    /// <summary>
    /// Populates the Intellisync option dropdown with a list
    /// of valid sync groups
    /// </summary>
    private void LoadIntellisyncOptions()
    {
        if (_intellisyncGroup.Items.Count == 0)
        {
            List<ListItem> intellisyncGroups = GetUserSyncGroups();

            // Insert an empty item
            intellisyncGroups.Insert(0, new ListItem("", ""));

            _intellisyncGroup.DataSource = intellisyncGroups;
            _intellisyncGroup.DataTextField = "Text";
            _intellisyncGroup.DataValueField = "Value";
            _intellisyncGroup.DataBind();
        }
    }

    /// <summary>
    /// Gets a list of the Adhoc contact groups for the logged in user
    /// </summary>
    /// <returns></returns>
    private List<ListItem> GetUserSyncGroups()
    {
        var results = new List<ListItem>();
        var userId = string.Empty;

        // Get the associated user
        var userService = ApplicationContext.Current.Services.Get<IUserService>();
        if (userService != null)
            userId = userService.UserId;

        var format = (string)GetLocalResourceObject("adhoc_group_format");

        // Load up all of the adhoc groups
        var dataService = ApplicationContext.Current.Services.Get<IDataService>();

        if (dataService != null && !string.IsNullOrEmpty(userId) && format != null)
        {
            using (var conn = dataService.GetOpenConnection())
            using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText =
                    @"SELECT A1.PLUGINID, A1.NAME, (SELECT COUNT(GROUPID) AS TotalCount
                      FROM ADHOCGROUP WHERE (GROUPID = A1.PLUGINID)) AS ContactCount
                      FROM PLUGIN A1 WHERE (A1.TYPE = 8) AND (A1.PLUGINID IN (
                        SELECT A2.PLUGINID
                        FROM PLUGIN A2
                        WHERE (A2.PLUGINID = A2.DATACODE))) AND (A1.USERID = ?) AND (UPPER(A1.FAMILY) = 'CONTACT')
                      ORDER BY A1.NAME";
                cmd.Parameters.Add(cmd.CreateParameter("USERID", userId));

                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        results.Add(new ListItem(string.Format(format, reader[1], reader[2]), (string) reader[0]));
                    }
                }
            }
        }

        return results;
    }

    /// <summary>
    /// Handles the Click event of the _save control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void _save_Click(object sender, EventArgs e)
    {
        if (txtRecentTemplates.Visible)
        {
            int iCount;
            if (int.TryParse(txtRecentTemplates.Text, out iCount))
            {
                if (iCount < 0 || iCount > 10)
                {
                    throw new ValidationException(htxtMenuRangeMessage.Value);
                }
            }
            else
                throw new ValidationException(htxtMenuRangeMessage.Value);
        }
        // save values
        _options.ShowOnStartup = GetStartupUrl(_showOnStartup.SelectedValue);
        _options.DefaultOwnerTeam = _defaultOwnerTeam.LookupResultValue.ToString();
        _options.LogToHistory = _logToHistory.SelectedValue;
        //-----------------------------------------------------------------------
        //Defect 1-80914 
        //  DThompson - "Please only hide the options for now.  We may re-enable them in Sawgrass depending on the direction we choose to take."
        // These options are hidden; if we do not set them...the options will be overwritten with the default values.
        _options.PromptForDuplicateContacts = _promptDuplicateContacts.Checked;
        _options.PromptForContactNotFound = _promptContactNotFound.Checked;
        //-----------------------------------------------------------------------
        _options.UseActiveReporting = _useActiveReporting.Checked;
        _options.AutoLogoff = _autoLogoff.Checked;
        _options.LogoffDuration = Convert.ToInt32(_logoffDuration.Text);
        _options.LogoffUnits = _logoffUnits.SelectedValue;
        _options.RecentTemplates = txtRecentTemplates.Text;
        _options.PromptForUnsavedData = chkPromptForUnsavedData.Checked;

        _options.FaxProvider = FaxProviderSelectedValue.Value != "undefined" ? FaxProviderSelectedValue.Value : txtFaxProvider.Value;
        if (luMyCurrency.LookupResultValue != null)
        {
            _options.MyCurrencyCode = ((IExchangeRate)(luMyCurrency.LookupResultValue)).Id.ToString();
        }

        // Saves the intellisync group
        var _UserOptions = ApplicationContext.Current.Services.Get<IUserOptionsService>();

        if (_intellisyncGroup.SelectedItem != null)
        {

            _UserOptions.SetCommonOption("SyncGroup", "Intellisync", _intellisyncGroup.SelectedValue, false);
        }

        _UserOptions.SetCommonOption("GroupCheckboxEnabled", "GroupGridView",
                                     cbCheckboxEnabled.Checked.ToString(CultureInfo.InvariantCulture), false);

        SaveTemplateOptions();

        _options.Save();
    }

    /// <summary>
    /// Loads the view.
    /// </summary>
    private void LoadTemplateOptions()
    {
        var userService = ApplicationContext.Current.Services.Get<IUserService>(true) as ISlxUserService;
        if (userService != null)
        {
            var user = userService.GetUser();
            var userId = user.Id.ToString();
            var userOptions = Locator.GetPageWorkItem().BuildTransientItem<UserOptionsService>();            
            userOptions.SetUserId(userId);

            switch (htxtSelectedTemplateType.Value)
            {
                case "LEAD":
                    txtEmailBaseTemplate.Text = userOptions.GetCommonOption("DefaultLeadMemoTemplate", "General");
                    txtEmailBaseTemplateId.Value = userOptions.GetCommonOption("DefaultLeadMemoTemplateID", "General");
                    txtLetterBaseTemplate.Text = userOptions.GetCommonOption("DefaultLeadLetterTemplate", "General");
                    txtLetterBaseTemplateId.Value = userOptions.GetCommonOption("DefaultLeadLetterTemplateID", "General");
                    txtFaxBaseTemplate.Text = userOptions.GetCommonOption("DefaultLeadFaxTemplate", "General");
                    txtFaxBaseTemplateId.Value = userOptions.GetCommonOption("DefaultLeadFaxTemplateID", "General");
                    break;
                default:
                    txtEmailBaseTemplate.Text = userOptions.GetCommonOption("DefaultMemoTemplate", "General");
                    txtEmailBaseTemplateId.Value = userOptions.GetCommonOption("DefaultMemoTemplateID", "General");
                    txtLetterBaseTemplate.Text = userOptions.GetCommonOption("DefaultLetterTemplate", "General");
                    txtLetterBaseTemplateId.Value = userOptions.GetCommonOption("DefaultLetterTemplateID", "General");
                    txtFaxBaseTemplate.Text = userOptions.GetCommonOption("DefaultFaxTemplate", "General");
                    txtFaxBaseTemplateId.Value = userOptions.GetCommonOption("DefaultFaxTemplateID", "General");
                    break;
            }

            if ((user.Type == UserType.WebViewer) || (user.Type == UserType.AddOn))
            {
                txtFaxBaseTemplate.Attributes.Add("DISABLED", "");
                txtFaxBaseTemplate.Attributes["onclick"] = "";

                txtLetterBaseTemplate.Attributes.Add("DISABLED", "");
                txtLetterBaseTemplate.Attributes["onclick"] = "";

                txtEmailBaseTemplate.Attributes.Add("DISABLED", "");
                txtEmailBaseTemplate.Attributes["onclick"] = "";
            }
        }
    }

    private void SaveTemplateOptions()
    {
        var userService = ApplicationContext.Current.Services.Get<IUserService>(true) as ISlxUserService;
        if (userService != null)
        {
            var user = userService.GetUser();
            var userId = user.Id.ToString();
            var userOptions = Locator.GetPageWorkItem().BuildTransientItem<UserOptionsService>();
            userOptions.SetUserId(userId);
            switch (htxtSelectedTemplateType.Value)
            {
                case "LEAD":
                    userOptions.SetCommonOption("DefaultLeadMemoTemplate", "General", txtEmailBaseTemplate.Text, false);
                    userOptions.SetCommonOption("DefaultLeadMemoTemplateID", "General", txtEmailBaseTemplateId.Value,
                                                false);
                    userOptions.SetCommonOption("DefaultLeadLetterTemplate", "General", txtLetterBaseTemplate.Text,
                                                false);
                    userOptions.SetCommonOption("DefaultLeadLetterTemplateID", "General", txtLetterBaseTemplateId.Value,
                                                false);
                    userOptions.SetCommonOption("DefaultLeadFaxTemplate", "General", txtFaxBaseTemplate.Text, false);
                    userOptions.SetCommonOption("DefaultLeadFaxTemplateID", "General", txtFaxBaseTemplateId.Value, false);
                    break;
                default:
                    userOptions.SetCommonOption("DefaultMemoTemplate", "General", txtEmailBaseTemplate.Text, false);
                    userOptions.SetCommonOption("DefaultMemoTemplateID", "General", txtEmailBaseTemplateId.Value, false);
                    userOptions.SetCommonOption("DefaultLetterTemplate", "General", txtLetterBaseTemplate.Text, false);
                    userOptions.SetCommonOption("DefaultLetterTemplateID", "General", txtLetterBaseTemplateId.Value,
                                                false);
                    userOptions.SetCommonOption("DefaultFaxTemplate", "General", txtFaxBaseTemplate.Text, false);
                    userOptions.SetCommonOption("DefaultFaxTemplateID", "General", txtFaxBaseTemplateId.Value, false);
                    break;
            }
        }
    }

    protected void HandleTemplateTypeChanged(Object sender, EventArgs e)
    {
        htxtSelectedTemplateType.Value = cboTemplateType.SelectedValue;
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        var tinfo = new ToolsSmartPartInfo();
        var localResourceObject = GetLocalResourceObject("PageDescription.Text");
        if (localResourceObject != null)
            tinfo.Description = localResourceObject.ToString();
        var resourceObject = GetLocalResourceObject("PageDescription.Title");
        if (resourceObject != null)
            tinfo.Title = resourceObject.ToString();
        foreach (Control c in LitRequest_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    /// <summary>
    /// Handles the Click event of the btnFlushCache control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnFlushCache_Click(object sender, EventArgs e)
    {
        var _UserOptions = ApplicationContext.Current.Services.Get<IUserOptionsService>();
        _UserOptions.ClearCache();
    }
}
