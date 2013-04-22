using System;
using System.Collections.Generic;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using NHibernate;
using NHibernate.Criterion;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.Orm;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.PickLists;

public partial class SmartPart_PickListItems : EntityBoundSmartPartInfoProvider
{
    private IPickListItemView _defaultItem;
    private IPickListView _pickListView;
    private string _sortExpression;
    private bool _sortDirection;

    [ServiceDependency(Type = typeof(IEntityContextService), Required = true)]
    public IEntityContextService EntityService { get; set; }

    public override Type EntityType
    {
        get { return typeof(IPickListView); }
    }

    protected override void OnAddEntityBindings()
    {
    }

    protected override void OnWireEventHandlers()
    {
        btnAdd.Click += btnAdd_ClickAction;
        grdPicklistItems.PageIndexChanging += grdPicklistItems_PageIndexChanging;
        base.OnWireEventHandlers();
    }

    protected override void OnFormBound()
    {
        base.OnFormBound();
        _pickListView = GetPickListView();
        _defaultItem = GetDefaultItem(_pickListView);
        LoadGrid();
    }

    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in Items_LTools.Controls)
        {
            tinfo.LeftTools.Add(c);
        }
        foreach (Control c in Items_CTools.Controls)
        {
            tinfo.CenterTools.Add(c);
        }
        foreach (Control c in Items_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    protected void btnAdd_ClickAction(object sender, EventArgs e)
    {
        if (DialogService != null)
        {
            DialogService.SetSpecs(245, 600, "AddEditPickListItem");
            DialogService.DialogParameters.Clear();
            DialogService.DialogParameters.Add("MODE", "ADD");
            DialogService.ShowDialog();
        }
    }

    private int _deleteColumnIndex = -2;
    protected int DeleteColumnIndex
    {
        get
        {
            if (_deleteColumnIndex == -2)
            {
                int bias = (grdPicklistItems.ExpandableRows) ? 1 : 0;
                _deleteColumnIndex = -1;
                int colcount = 0;
                foreach (DataControlField col in grdPicklistItems.Columns)
                {
                    ButtonField btn = col as ButtonField;
                    if (btn != null)
                    {
                        if (btn.CommandName == "Delete")
                        {
                            _deleteColumnIndex = colcount + bias;
                            break;
                        }
                    }
                    colcount++;
                }
            }
            return _deleteColumnIndex;
        }
    }

    protected void grdPicklistItems_RowDataBound(object sender, GridViewRowEventArgs e)
    {
        if (e.Row.RowType == DataControlRowType.DataRow)
        {
            // Get the LinkButton control for the Delete 
            if ((DeleteColumnIndex >= 0) && (DeleteColumnIndex < e.Row.Cells.Count))
            {
                var dialogBody = PortalUtil.JavaScriptEncode(GetLocalResourceObject("ConfirmMessage").ToString());
                TableCell cell = e.Row.Cells[DeleteColumnIndex];
                foreach (Control c in cell.Controls)
                {
                    LinkButton btn = c as LinkButton;
                    if (btn != null)
                    {
                        var script = new StringBuilder();
                        script.AppendLine(" javascript: return confirmation();");
                        script.AppendLine(" function confirmation() { ");
                        script.AppendLine(" var answer = confirm('" + dialogBody + "');");
                        script.AppendLine(" if (answer) {");
                        script.AppendLine(" var x = new Sage.UI.Controls.PickList({});x.clear(x._storageNameSpace);");
                        script.AppendLine(" }");
                        script.AppendLine(" return answer;");
                        script.AppendLine(" }");
                        btn.Attributes.Add("onclick", script.ToString());
                    }
                }
            }
        }
    }

    protected void grdPicklistItems_RowCommand(object sender, GridViewCommandEventArgs e)
    {
        if (e.CommandName.Equals("Edit"))
        {
            int rowIndex = Convert.ToInt32(e.CommandArgument);
            if (DialogService != null)
            {
                DialogService.SetSpecs(245, 600, "AddEditPickListItem");
                DialogService.DialogParameters.Clear();
                DialogService.DialogParameters.Add("MODE", "EDIT");
                DialogService.DialogParameters.Add("PickListId", grdPicklistItems.DataKeys[rowIndex].Values[1].ToString());
                DialogService.DialogParameters.Add("PickListItemId", grdPicklistItems.DataKeys[rowIndex].Values[0].ToString());
                DialogService.ShowDialog();
            }
            return;
        }
        if (e.CommandName.Equals("Delete"))
        {
            int rowIndex = Convert.ToInt32(e.CommandArgument);
            PickList.DeletePickListItem(grdPicklistItems.DataKeys[rowIndex].Values[1].ToString(), grdPicklistItems.DataKeys[rowIndex].Values[0].ToString());
            IPickListService pls = ApplicationContext.Current.Services.Get<IPickListService>();
            if (pls != null)
            {
                pls.ClearPickListCache();
            }
            IPanelRefreshService refresher = PageWorkItem.Services.Get<IPanelRefreshService>();
            refresher.RefreshAll();
        }
    }

    protected bool IsDefault(object val)
    {
        if ((val != null) && (_defaultItem != null))
        {
            string itemId = val.ToString();
            if (_defaultItem.PickListItemId == itemId)
            {
                return true;
            }
        }
        return false;
    }

    protected void grdPicklistItems_RowEditing(object sender, GridViewEditEventArgs e)
    {
        grdPicklistItems.SelectedIndex = e.NewEditIndex;
        e.Cancel = true;
    }

    protected void grdPicklistItems_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {
    }

    protected void grdPicklistItems_Sorting(object sender, GridViewSortEventArgs e)
    {
        _sortDirection = e.SortDirection == SortDirection.Ascending;
        _sortExpression = e.SortExpression;
    }

    protected void grdPicklistItems_PageIndexChanging(object sender, GridViewPageEventArgs e)
    {
        grdPicklistItems.PageIndex = e.NewPageIndex;
    }

    private void LoadGrid()
    {
        grdPicklistItems.DataSource = GetItems(_pickListView);
        _sortExpression = grdPicklistItems.CurrentSortExpression;
        SetSortDirection(grdPicklistItems.CurrentSortDirection);
        grdPicklistItems.DataBind();
    }

    private IList<IPickListItemView> GetItems(IPickListView pickList)
    {
        using (ISession session = new SessionScopeWrapper(true))
        {
            if (string.IsNullOrEmpty(_sortExpression))
            {
                _sortExpression = "OrderSeq";
            }

            var query = session.QueryOver<IPickListItemView>()
                .Where(x => x.UserId == "ADMIN" && x.PickListId == (string) pickList.Id);
            query.UnderlyingCriteria.AddOrder(new Order(_sortExpression, _sortDirection));
            return query.List();
        }
    }

    private IPickListView GetPickListView()
    {
        IPickListView plv = BindingSource.Current as IPickListView;
        using (ISession session = new SessionScopeWrapper(true))
        {
            return session.QueryOver<IPickListView>()
                .Where(x => x.Id == plv.Id)
                .SingleOrDefault();
        }
    }

    private IPickListItemView GetDefaultItem(IPickListView picklistView)
    {
        if ((picklistView.DefaultIndex.HasValue) && (picklistView.DefaultIndex.Value >= 0))
        {
            PickList plItem = PickList.GetDefaultItem(picklistView.Id.ToString());
            if (plItem != null)
            {
                string[] IdNames = new string[] { "PickListId", "PickListItemId" };
                object[] ids = new object[] { plItem.PickListId, plItem.ItemId };
                IPickListItemView piv = EntityFactory.GetByCompositeId(typeof(IPickListItemView), IdNames, ids) as IPickListItemView;
                return piv;
            }
        }
        return null;
    }

    private void SetSortDirection(string sortDir)
    {
        _sortDirection = sortDir == SortDirection.Ascending.ToString();
    }
}