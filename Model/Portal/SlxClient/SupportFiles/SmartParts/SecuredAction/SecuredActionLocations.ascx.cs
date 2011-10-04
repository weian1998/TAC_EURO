using System;
using System.Collections.Generic;
using System.Reflection;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.SecuredAction;

/// <summary>
/// Summary description for SecuredActionLocations
/// </summary>
public partial class SecuredActionLocations : EntityBoundSmartPartInfoProvider
{
    SortDirection _sortDir = SortDirection.Ascending;
    string _sortExpr = "FileName";

    protected void GridPageIndexChanging(object sender, GridViewPageEventArgs e)
    {
        grdSecuredActionLocations.PageIndex = e.NewPageIndex;
        grdSecuredActionLocations.DataBind();
    }

    protected void GridSorting(object sender, GridViewSortEventArgs e)
    {
        _sortDir = e.SortDirection;
        _sortExpr = e.SortExpression;
        grdSecuredActionLocations.CurrentSortExpression = _sortExpr;
        grdSecuredActionLocations.CurrentSortDirection = _sortDir.ToString();

        List<SecuredActionLocation> usage = GetData();

        usage.Sort(DoSort);

        grdSecuredActionLocations.DataBind();
    }

    private int DoSort(SecuredActionLocation location1, SecuredActionLocation location2)
    {
        object val1 = location1.GetType().GetProperty(_sortExpr).GetValue(location1, BindingFlags.Public, null, null, null);
        string sval1 = val1 != null ? val1.ToString() : "";

        object val2 = location2.GetType().GetProperty(_sortExpr).GetValue(location2, BindingFlags.Public, null, null, null);
        string sval2 = val2 != null ? val2.ToString() : "";

        if (_sortDir == SortDirection.Ascending)
            return sval1.CompareTo(sval2);
        else
            return sval2.CompareTo(sval1);
    }

    List<SecuredActionLocation> GetData()
    {
        ISecuredAction entity = (ISecuredAction) BindingSource.Current;
        return Rules.GetSecuredActionUsage(entity.Name, AppDomain.CurrentDomain.BaseDirectory);
    }

    void Page_Load(object sender, EventArgs e)
    {
        grdSecuredActionLocations.CurrentSortDirection = _sortDir.ToString();
        grdSecuredActionLocations.CurrentSortExpression = _sortExpr;

        List<SecuredActionLocation> usage = GetData();

        grdSecuredActionLocations.DataSource = usage;
        grdSecuredActionLocations.DataBind();
    }

    /// <summary>
    /// Override this method to add bindings to the currently bound smart part
    /// </summary>
    protected override void OnAddEntityBindings()
    {
    }

    /// <summary>
    /// Called when the smartpart has been bound.  Derived components should override this method to run code that depends on entity context being set and it not changing.
    /// </summary>
    protected override void OnFormBound()
    {
        if (Page.Visible)
        {
        }
    }

    /// <summary>
    /// Gets the <see cref="T:Sage.Platform.Application.IEntityContextService"/> instance
    /// </summary>
    /// <value></value>
    [ServiceDependency]
    public new IEntityContextService EntityContext { set; get; }

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(ISecuredAction); }
    }

    /// <summary>
    /// Gets or sets the role security service.
    /// </summary>
    /// <value>The role security service.</value>
    [ServiceDependency]
    public IRoleSecurityService RoleSecurityService { get; set; }

    #region ISmartPartInfoProvider Members

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
        foreach (Control c in SecuredActionLocations_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    #endregion
}