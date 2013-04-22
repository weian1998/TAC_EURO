using System;
using System.ComponentModel;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using Sage.Platform.Application.UI;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.LegacyBridge;
using Sage.SalesLogix.Activity;
using TimeZone = Sage.Platform.TimeZone;

public partial class SmartParts_NotWhatsNew_NotWhatsNew : UserControl, ISmartPartInfoProvider
{
    private bool _NewNotesLastPageIndex = false;
    private bool _ModifiedNotesLastPageIndex = false;
    private WhatsNewRequest<IHistory> _request = null;
    private WhatsNewSearchOptions _searchOptions = null;

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
    /// Gets the search options.
    /// </summary>
    /// <value>The search options.</value>
    private WhatsNewSearchOptions SearchOptions
    {
        get
        {
            if (_searchOptions == null)
                _searchOptions = new WhatsNewSearchOptions();
            return _searchOptions;
        }
    }

    /// <summary>
    /// Gets the current user id.
    /// </summary>
    /// <value>The current user id.</value>
    private static string CurrentUserId
    {
        get { return ApplicationContext.Current.Services.Get<IUserService>(true).UserId.Trim(); }
    }


    [ContextDependency("TimeZone")]
    public TimeZone TimeZone { get; set; }

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
        if (!Visible) return;

        DateTime fromDate = DateTime.UtcNow;
        IUserOptionsService userOptions = ApplicationContext.Current.Services.Get<IUserOptionsService>();
        if (userOptions != null)
        {
            try
            {
                fromDate = DateTime.Parse(userOptions.GetCommonOption("LastWebUpdate", "Web", false, fromDate.ToString(), "LastWebUpdate"));
            }
            catch
            { }
        }

        SearchOptions.NotesOnly = true;
        SearchOptions.SearchDate = fromDate;
        SearchOptions.UserIds.AddRange(UserCalendar.GetCalendarAccessUserList(CurrentUserId));

        //New History
        SearchOptions.SearchType = WhatsNewSearchOptions.SearchTypeEnum.New;
        if (!String.IsNullOrEmpty(grdNewNotes.SortExpression))
        {
            SearchOptions.OrderBy = grdNewNotes.SortExpression;
            SearchOptions.SortDirection =
                (grdNewNotes.CurrentSortDirection.Equals("Ascending", StringComparison.CurrentCultureIgnoreCase))
                    ? ListSortDirection.Ascending
                    : ListSortDirection.Descending;
        }
        WNRequest.SearchOptions = SearchOptions;
        grdNewNotes.DataSource = NotesNewObjectDataSource;
        grdNewNotes.DataBind();

        //Modified History
        SearchOptions.SearchType = WhatsNewSearchOptions.SearchTypeEnum.Updated;
        if (!String.IsNullOrEmpty(grdModifiedNotes.SortExpression))
        {
            SearchOptions.OrderBy = grdModifiedNotes.SortExpression;
            SearchOptions.SortDirection =
                (grdModifiedNotes.CurrentSortDirection.Equals("Ascending", StringComparison.CurrentCultureIgnoreCase))
                    ? ListSortDirection.Ascending
                    : ListSortDirection.Descending;
        }
        else
        {
            SearchOptions.OrderBy = "ModifyDate";
            SearchOptions.SortDirection = ListSortDirection.Ascending;
        }
        WNRequest.SearchOptions = SearchOptions;
        grdModifiedNotes.DataSource = NotesModifiedObjectDataSource;
        grdModifiedNotes.DataBind();

        base.OnPreRender(e);
    }

    /// <summary>
    /// Gets the image.
    /// </summary>
    /// <param name="type">The type.</param>
    /// <returns></returns>
    protected string GetImage(object type)
    {
        const string meetingURL = "~/images/icons/Meeting_16x16.gif";
        const string phoneURL = "~/images/icons/Call_16x16.gif";
        const string todoURL = "~/images/icons/To_Do_16x16.gif";
        const string personalURL = "~/images/icons/Personal_16x16.gif";
        const string noteURL = "~/images/icons/Note_16x16.gif";

        switch (type.ToString())
        {
            case "atAppointment":
                return meetingURL;
            case "atPhoneCall":
                return phoneURL;
            case "atToDo":
                return todoURL;
            case "atPersonal":
                return personalURL;
            case "atNote":
                return noteURL;
            default:
                return meetingURL;
        }
    }

    /// <summary>
    /// Gets the alt.
    /// </summary>
    /// <param name="type">The type.</param>
    /// <returns></returns>
    protected string GetAlt(object type)
    {
        switch (type.ToString())
        {
            case "atAppointment":
                return GetLocalResourceObject("Meeting_Type").ToString();
            case "atPhoneCall":
                return GetLocalResourceObject("Phone_Type").ToString();
            case "atToDo":
                return GetLocalResourceObject("ToDo_Type").ToString();
            case "atPersonal":
                return GetLocalResourceObject("Personal_Type").ToString();
            case "atNote":
                return GetLocalResourceObject("Note_Type").ToString();
            default:
                return GetLocalResourceObject("Meeting_Type").ToString();
        }
    }

    /// <summary>
    /// Gets the activity link.
    /// </summary>
    /// <param name="Id">The id.</param>
    /// <returns></returns>
    protected string GetActivityLink(object Id)
    {
        return string.Format("javascript:Sage.Link.editHistory('{0}');", Id);
    }

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <param name="contactId">The contact id.</param>
    /// <returns></returns>
    protected string GetContactOrLeadType(object contactId, object leadId, bool localized)
    {
        if (!IsBlankOrNull(contactId))
            return (localized) ? GetLocalResourceObject("Contact").ToString() : "Contact";
        if (!IsBlankOrNull(leadId))
            return (localized) ? GetLocalResourceObject("Lead").ToString() : "Lead";
        return string.Empty;
    }

    protected string GetAccountOrLeadType(object accountId, object leadId)
    {
        if (!IsBlankOrNull(accountId))
            return "Account";
        if (!IsBlankOrNull(leadId))
            return "Lead";
        return string.Empty;
    }

    /// <summary>
    /// Determines whether [is blank or null] [the specified id].
    /// </summary>
    /// <param name="Id">The id.</param>
    /// <returns>
    /// 	<c>true</c> if [is blank or null] [the specified id]; otherwise, <c>false</c>.
    /// </returns>
    protected bool IsBlankOrNull(object Id)
    {
        return (Id == null) || (string.IsNullOrEmpty(Id.ToString().Trim()));
    }

    /// <summary>
    /// Gets the display name.
    /// </summary>
    /// <param name="contact">The contact.</param>
    /// <param name="lead">The lead.</param>
    /// <returns></returns>
    protected string GetDisplayName(object contact, object lead)
    {

        string name = string.Empty;
        if (lead != null)
        {
            name = lead.ToString().Trim();
            if (!string.IsNullOrEmpty(name))
            {
                return name;
            }

        }
        if (contact != null)
        {
            name = contact.ToString().Trim();
            if (!string.IsNullOrEmpty(name))
            {
                return name;
            }
        }
        return name;
    }

    /// <summary>
    /// Gets the entity id.
    /// </summary>
    /// <param name="contactId">The contact id.</param>
    /// <param name="leadId">The lead id.</param>
    /// <returns></returns>
    protected string GetEntityId(object contactId, object leadId)
    {
        if (!IsBlankOrNull(contactId))
        {
            return contactId.ToString();
        }
        if (!IsBlankOrNull(leadId))
        {
            return leadId.ToString();
        }
        return string.Empty;
    }

    /// <summary>
    /// Handles the PageIndexChanging event of the grdNewNotes control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewPageEventArgs"/> instance containing the event data.</param>
    protected void grdNewNotes_PageIndexChanging(Object sender, GridViewPageEventArgs e)
    {
        if (!Visible) return;

        int pageIndex = e.NewPageIndex;
        // if viewstate is off in the GridView then we need to calculate PageCount ourselves
        if (pageIndex > 10000)
        {
            _NewNotesLastPageIndex = true;
            grdNewNotes.PageIndex = 0;
        }
        else
        {
            _NewNotesLastPageIndex = false;
            grdNewNotes.PageIndex = pageIndex;
        }
    }

    /// <summary>
    /// Handles the PageIndexChanging event of the grdModifiedNotes control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewPageEventArgs"/> instance containing the event data.</param>
    protected void grdModifiedNotes_PageIndexChanging(Object sender, GridViewPageEventArgs e)
    {
        int pageIndex = e.NewPageIndex;
        // if viewstate is off in the GridView then we need to calculate PageCount ourselves
        if (pageIndex > 10000)
        {
            _ModifiedNotesLastPageIndex = true;
            grdModifiedNotes.PageIndex = 0;
        }
        else
        {
            _ModifiedNotesLastPageIndex = false;
            grdModifiedNotes.PageIndex = pageIndex;
        }
    }

    /// <summary>
    /// Creates the notes whats new data source.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.ObjectDataSourceEventArgs"/> instance containing the event data.</param>
    protected void CreateNotesWhatsNewDataSource(object sender, ObjectDataSourceEventArgs e)
    {
        if (_NewNotesLastPageIndex)
        {
            int pageIndex = 0;
            int recordCount = WNRequest.GetRecordCount();
            int pageSize = grdNewNotes.PageSize;
            decimal numberOfPages = recordCount / pageSize;
            pageIndex = Convert.ToInt32(Math.Ceiling(numberOfPages));
            grdNewNotes.PageIndex = pageIndex;
        }
        e.ObjectInstance = WNRequest;
    }

    /// <summary>
    /// Creates the notes whats modified data source.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.ObjectDataSourceEventArgs"/> instance containing the event data.</param>
    protected void CreateNotesWhatsModifiedDataSource(object sender, ObjectDataSourceEventArgs e)
    {
        if (_ModifiedNotesLastPageIndex)
        {
            int pageIndex = 0;
            int recordCount = WNRequest.GetRecordCount();
            int pageSize = grdModifiedNotes.PageSize;
            decimal numberOfPages = recordCount / pageSize;
            pageIndex = Convert.ToInt32(Math.Ceiling(numberOfPages));
            grdModifiedNotes.PageIndex = pageIndex;
        }
        e.ObjectInstance = WNRequest;
    }

    /// <summary>
    /// Disposes the notes whats new data source.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.ObjectDataSourceDisposingEventArgs"/> instance containing the event data.</param>
    protected void DisposeNotesWhatsNewDataSource(object sender, ObjectDataSourceDisposingEventArgs e)
    {
        // Get the instance of the business object that the ObjectDataSource is working with.
        WhatsNewRequest<IHistory> dataSource = e.ObjectInstance as WhatsNewRequest<IHistory>;

        // Cancel the event, so that the object will not be Disposed if it implements IDisposable.
        e.Cancel = true;
    }


    protected string GetLocalDateTime(object completedDate)
    {
        var cd = completedDate as DateTime?;
        if (cd.HasValue)
        {
            if (cd.Value.Equals(cd.Value.Date.AddSeconds(5)))
            {
                return cd.Value.ToShortDateString();
            }
            else
            {
                return TimeZone.UTCDateTimeToLocalTime(cd.Value).ToString("g");
            }
        }
        return string.Empty;
    }


    protected void Sorting(Object sender, GridViewSortEventArgs e)
    { }

    #region ISmartPartInfoProvider Members

	public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
	{
		ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();

        Label lbl = new Label();
        lbl.Text = GetLocalResourceObject("Notes_Caption").ToString();

        tinfo.LeftTools.Add(lbl);
        tinfo.ImagePath = Page.ResolveClientUrl("~/images/icons/Note_24x24.gif");

        return tinfo;
    }

    #endregion

}

