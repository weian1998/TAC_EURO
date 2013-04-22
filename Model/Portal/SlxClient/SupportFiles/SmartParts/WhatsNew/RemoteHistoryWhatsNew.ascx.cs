using System;
using System.ComponentModel;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.Application.Services;
using Sage.Platform.Application.UI;
using Sage.SalesLogix.Web.Controls;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.LegacyBridge;
using Sage.Platform.Application;
using Sage.Entity.Interfaces;
using System.Text;
using Sage.Platform.Configuration;
using Sage.Platform.Application.UI.Web;
using Sage.Platform.WebPortal.Workspaces.Tab;

/// <summary>
/// 
/// </summary>
public partial class RemoteHistoryWhatsNew : UserControl, ISmartPartInfoProvider
{
    private WhatsNewRequest<IHistory> _request = null;

    /// <summary>
    /// Gets the search options.
    /// </summary>
    /// <value>The search options.</value>
    /// <returns>
    /// The <see cref="T:System.Web.HttpRequest"/> object associated with the <see cref="T:System.Web.UI.Page"/> that contains the <see cref="T:System.Web.UI.UserControl"/> instance.
    /// </returns>
    private WhatsNewRequest<IHistory> WNRequest
    {
        get
        {
            if (_request == null)
                _request = new WhatsNewRequest<IHistory>();
            return _request;
        }
    }

    /// <summary>
    /// Handles the Load event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Load(object sender, EventArgs e)
    {
    }

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"/> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"/> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        if (Page.Visible)
        {
            RegisterClientScripts();
            DateTime searchDate = DateTime.UtcNow;
            WhatsNewSearchOptions.SearchTypeEnum searchTypeEnum = WhatsNewSearchOptions.SearchTypeEnum.New;
            IUserOptionsService userOpts = ApplicationContext.Current.Services.Get<IUserOptionsService>();
            if (userOpts != null)
            {
                try
                {
                    string searchType;
                    searchDate = DateTime.Parse(userOpts.GetCommonOption("LastWebUpdate", "Web", false, searchDate.ToString(), "LastWebUpdate"));
                    searchType = userOpts.GetCommonOption("WhatsNewSearchType", "Web", false, WhatsNewSearchOptions.SearchTypeEnum.New.ToString(), "WhatsNewSearchType");
                    if (Enum.IsDefined(typeof(WhatsNewSearchOptions.SearchTypeEnum), searchType))
                        searchTypeEnum = (WhatsNewSearchOptions.SearchTypeEnum)Enum.Parse(typeof(WhatsNewSearchOptions.SearchTypeEnum), searchType, true);
                }
                catch
                {
                }
            }
            WNRequest.SearchOptions.SearchDate = searchDate;
            WNRequest.SearchOptions.SearchType = searchTypeEnum;
            WNRequest.ActiveTab = WhatsNewRequest<IHistory>.ActiveTabEnum.History;
            SetActiveGridDisplay(searchTypeEnum, WNRequest);
        }
    }

    private void RegisterClientScripts()
    {
        if (GetActiveTab() != "RemoteHistoryWhatsNew") return;
        StringBuilder vJS = new StringBuilder();
        vJS.AppendLine("$(document).ready(function () {");
        vJS.AppendLine("    dojo.publish(\"Sage/Events/WhatsNewTabChange\", \"RemoteHistoryWhatsNew\");");
        vJS.AppendLine("});");

        ScriptManager.RegisterClientScriptBlock(Page, GetType(), this.ClientID, vJS.ToString(), true);

    }

    private string GetActiveTab()
    {
        ConfigurationManager manager = ApplicationContext.Current.Services.Get<ConfigurationManager>(true);
        ApplicationPage page = Page as ApplicationPage;
        string pageAlias = Page.GetType().FullName + (String.IsNullOrEmpty(page.ModeId) ? page.ModeId : String.Empty);

        TabWorkspaceState tabWorkSpace = manager.GetInstance<TabWorkspaceState>(pageAlias, true);
        if (tabWorkSpace != null)
        {
            return tabWorkSpace.ActiveMainTab;
        }
        return string.Empty;
    }    /// <summary>
    /// Sets the active grid display.
    /// </summary>
    /// <param name="searchType">Type of the search.</param>
    /// <param name="whatsNewRequest">The whats new request.</param>
    private void SetActiveGridDisplay(WhatsNewSearchOptions.SearchTypeEnum searchType, WhatsNewRequest<IHistory> whatsNewRequest)
    {
        switch (searchType)
        {
            case WhatsNewSearchOptions.SearchTypeEnum.Updated:
                lblHistoryTitle.Text = GetLocalResourceObject("ModifiedHistory_Title").ToString();
                divNewHistory.Style.Add(HtmlTextWriterStyle.Display, "none");
                divUpdatedHistory.Style.Add(HtmlTextWriterStyle.Display, "inline");
                WNRequest.SearchOptions.SortExpression = grdUpdatedHistory.SortExpression;
                WNRequest.SearchOptions.SortDirection = (ListSortDirection)grdUpdatedHistory.SortDirection;
                grdUpdatedHistory.DataSource = whatsNewRequest.GetRemoteHistoryWhatsNew();
                grdUpdatedHistory.DataBind();
                break;
            default:
                lblHistoryTitle.Text = GetLocalResourceObject("NewHistory_Title").ToString();
                divNewHistory.Style.Add(HtmlTextWriterStyle.Display, "inline");
                divUpdatedHistory.Style.Add(HtmlTextWriterStyle.Display, "none");
                WNRequest.SearchOptions.SortExpression = grdHistory.SortExpression;
                WNRequest.SearchOptions.SortDirection = (ListSortDirection)grdHistory.SortDirection;
                grdHistory.DataSource = whatsNewRequest.GetRemoteHistoryWhatsNew();
                grdHistory.DataBind();
                break;
        }
    }

    /// <summary>
    /// Pages the index changing.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewPageEventArgs"/> instance containing the event data.</param>
    protected void PageIndexChanging(Object sender, GridViewPageEventArgs e)
    {
        if (!Visible) return;

        ((SlxGridView)sender).PageIndex = e.NewPageIndex;
        ((SlxGridView)sender).DataBind();
    }

    /// <summary>
    /// Handles the Sorting event of the grdHistory control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewSortEventArgs"/> instance containing the event data.</param>
    protected void grdHistory_Sorting(Object sender, GridViewSortEventArgs e)
    {
    }

    #region ISmartPartInfoProvider Members

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();

        foreach (Control c in History_LTools.Controls)
        {
            tinfo.LeftTools.Add(c);
        }
        foreach (Control c in History_CTools.Controls)
        {
            tinfo.CenterTools.Add(c);
        }
        foreach (Control c in History_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    #endregion
}
