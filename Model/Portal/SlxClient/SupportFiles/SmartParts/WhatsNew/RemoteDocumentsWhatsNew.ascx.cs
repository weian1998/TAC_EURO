using System;
using System.ComponentModel;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.LegacyBridge;
using Sage.SalesLogix.Web.Controls;
using System.Text;
using Sage.Platform.Configuration;
using Sage.Platform.Application.UI.Web;
using Sage.Platform.WebPortal.Workspaces.Tab;

public partial class RemoteDocumentsWhatsNew : UserControl, ISmartPartInfoProvider
{
    private WhatsNewRequest<ILibraryDocs> _request;

    /// <summary>
    /// Gets the search options.
    /// </summary>
    /// <value>The search options.</value>
    /// <returns>
    /// The <see cref="T:System.Web.HttpRequest"/> object associated with the <see cref="T:System.Web.UI.Page"/> that contains the <see cref="T:System.Web.UI.UserControl"/> instance.
    /// </returns>
    private WhatsNewRequest<ILibraryDocs> WNRequest
    {
        get { return _request ?? (_request = new WhatsNewRequest<ILibraryDocs>()); }
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
                    String searchType;
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
            WNRequest.ActiveTab = WhatsNewRequest<ILibraryDocs>.ActiveTabEnum.Document;
            WNRequest.SearchOptions.SortExpression = grdDocuments.SortExpression;
            WNRequest.SearchOptions.SortDirection = (ListSortDirection)grdDocuments.SortDirection;
            grdDocuments.DataSource = WNRequest.GetRemoteDocumentsWhatsNew();
            grdDocuments.DataBind();
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
    /// Handles the Sorting event of the grdDocuments control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewSortEventArgs"/> instance containing the event data.</param>
    protected void grdDocuments_Sorting(Object sender, GridViewSortEventArgs e)
    {
    }

    private void RegisterClientScripts()
    {
        if (GetActiveTab() != "RemoteDocumentsWhatsNew") return;
        StringBuilder vJS = new StringBuilder();
        vJS.AppendLine("$(document).ready(function () {");
        vJS.AppendLine("    dojo.publish(\"Sage/Events/WhatsNewTabChange\", \"RemoteDocumentsWhatsNew\");");
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
    }
        /// <summary>
    /// Formats the URL.
    /// </summary>
    /// <param name="id">The id.</param>
    /// <param name="fileName">Name of the file.</param>
    /// <param name="dataType">Type of the data.</param>
    /// <param name="description">The description.</param>
    /// <returns></returns>
    public string FormatUrl(object id, object fileName, object dataType, object description)
    {
        string url =
            string.Format(
                "{0}/SmartParts/Attachment/ViewAttachment.aspx?fileId={1}&Filename={2}&DataType={3}&Description={4}",
                Page.Request.ApplicationPath, id, HttpUtility.UrlEncodeUnicode(fileName.ToString()),
                dataType, HttpUtility.UrlEncodeUnicode(description.ToString()));
        return url;
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
        Label lbl = new Label();
        lbl.Text = GetLocalResourceObject("NewDocuments_Title").ToString();
        tinfo.ImagePath = Page.ResolveClientUrl("~/images/icons/Library_3D_32x32.gif");
        tinfo.LeftTools.Add(lbl);
        return tinfo;
    }

    #endregion
}
