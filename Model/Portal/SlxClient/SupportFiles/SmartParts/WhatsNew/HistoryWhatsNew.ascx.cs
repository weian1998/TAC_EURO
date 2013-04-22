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

public partial class SmartParts_HisWhatsNew_HisWhatsNew : UserControl, ISmartPartInfoProvider
{
    private bool _NewHistoryLastPageIndex = false;
    private bool _ModifiedHistoryLastPageIndex = false;
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

        SearchOptions.SearchDate = fromDate;
        SearchOptions.UserIds.AddRange(UserCalendar.GetCalendarAccessUserList(CurrentUserId));
        
        //New History
        SearchOptions.SearchType = WhatsNewSearchOptions.SearchTypeEnum.New;
        if (!String.IsNullOrEmpty(grdNewHistory.SortExpression))
        {
            SearchOptions.OrderBy = grdNewHistory.SortExpression;
            SearchOptions.SortDirection =
                (grdNewHistory.CurrentSortDirection.Equals("Ascending", StringComparison.CurrentCultureIgnoreCase))
                    ? ListSortDirection.Ascending
                    : ListSortDirection.Descending;
        }
        WNRequest.SearchOptions = SearchOptions;
        grdNewHistory.DataSource = HistoryNewObjectDataSource;
        grdNewHistory.DataBind();

        //Modified History
        SearchOptions.SearchType = WhatsNewSearchOptions.SearchTypeEnum.Updated;
        if (!String.IsNullOrEmpty(grdModifiedHistory.SortExpression))
        {
            SearchOptions.OrderBy = grdModifiedHistory.SortExpression;
            SearchOptions.SortDirection =
                (grdModifiedHistory.CurrentSortDirection.Equals("Ascending", StringComparison.CurrentCultureIgnoreCase))
                    ? ListSortDirection.Ascending
                    : ListSortDirection.Descending;            
        } 
        else
        {
            SearchOptions.OrderBy = "ModifyDate";
            SearchOptions.SortDirection = ListSortDirection.Ascending;
        }
        WNRequest.SearchOptions = SearchOptions;
        grdModifiedHistory.DataSource = HistoryModifiedObjectDataSource;
        grdModifiedHistory.DataBind();

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
                return "Meeting";
            case "atPhoneCall":
                return "Phone Call";
            case "atToDo":
                return "To-Do";
            case "atPersonal":
                return "Personal Activity";
            default:
                return "Meeting";
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
    /// <param name="leadId">The lead id.</param>
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
        if (lead != null && !String.IsNullOrEmpty(lead.ToString()))
            return lead.ToString();
        if (contact != null)
            return contact.ToString();
        return String.Empty;
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
    /// Handles the PageIndexChanging event of the grdNewHistory control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewPageEventArgs"/> instance containing the event data.</param>
    protected void grdNewHistory_PageIndexChanging(Object sender, GridViewPageEventArgs e)
    {
        if (!Visible) return;

        int pageIndex = e.NewPageIndex;
        // if viewstate is off in the GridView then we need to calculate PageCount ourselves
        if (pageIndex > 10000)
        {
            _NewHistoryLastPageIndex = true;
            grdNewHistory.PageIndex = 0;
        }
        else
        {
            _NewHistoryLastPageIndex = false;
            grdNewHistory.PageIndex = pageIndex;
        }
    }

    /// <summary>
    /// Handles the PageIndexChanging event of the grdModifiedHistory control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewPageEventArgs"/> instance containing the event data.</param>
    protected void grdModifiedHistory_PageIndexChanging(Object sender, GridViewPageEventArgs e)
    {
        int pageIndex = e.NewPageIndex;
        // if viewstate is off in the GridView then we need to calculate PageCount ourselves
        if (pageIndex > 10000)
        {
            _ModifiedHistoryLastPageIndex = true;
            grdModifiedHistory.PageIndex = 0;
        }
        else
        {
            _ModifiedHistoryLastPageIndex = false;
            grdModifiedHistory.PageIndex = pageIndex;
        }
    }

    /// <summary>
    /// Creates the history whats new data source.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.ObjectDataSourceEventArgs"/> instance containing the event data.</param>
    protected void CreateHistoryWhatsNewDataSource(object sender, ObjectDataSourceEventArgs e)
    {
        if (_NewHistoryLastPageIndex)
        {
            int pageIndex = 0;
            int recordCount = WNRequest.GetRecordCount();
            int pageSize = grdNewHistory.PageSize;
            decimal numberOfPages = recordCount / pageSize;
            pageIndex = Convert.ToInt32(Math.Ceiling(numberOfPages));
            grdNewHistory.PageIndex = pageIndex;
        }
        e.ObjectInstance = WNRequest;
    }

    /// <summary>
    /// Creates the history whats modified data source.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.ObjectDataSourceEventArgs"/> instance containing the event data.</param>
    protected void CreateHistoryWhatsModifiedDataSource(object sender, ObjectDataSourceEventArgs e)
    {
        if (_ModifiedHistoryLastPageIndex)
        {
            int pageIndex = 0;
            int recordCount = WNRequest.GetRecordCount();
            int pageSize = grdModifiedHistory.PageSize;
            decimal numberOfPages = recordCount / pageSize;
            pageIndex = Convert.ToInt32(Math.Ceiling(numberOfPages));
            grdModifiedHistory.PageIndex = pageIndex;
        }
        e.ObjectInstance = WNRequest;
    }

    /// <summary>
    /// Disposes the history whats new data source.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.ObjectDataSourceDisposingEventArgs"/> instance containing the event data.</param>
    protected void DisposeHistoryWhatsNewDataSource(object sender, ObjectDataSourceDisposingEventArgs e)
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

        Label lbl = new Label();
        lbl.Text = GetLocalResourceObject("History_Caption").ToString();

        tinfo.LeftTools.Add(lbl);
        tinfo.ImagePath = Page.ResolveClientUrl("~/images/icons/Note_24x24.gif");

        return tinfo;
    }

    #endregion

}

