using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.ComponentModel;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.Application;
using Sage.Platform;
using Sage.Entity.Interfaces;
using ICriteria = Sage.Platform.Repository.ICriteria;
using Sage.Platform.Repository;
using Sage.Platform.WebPortal;
using Sage.Platform.Orm.Interfaces;
using Sage.Platform.WebPortal.Binding;
using Sage.SalesLogix.PickLists;
using NHibernate;
using Sage.Platform.Exceptions;
using Sage.Platform.Orm;
using Sage.Platform.WebPortal.Services;


public partial class SmartPart_PickListItems : EntityBoundSmartPartInfoProvider 
{
    private IEntityContextService _EntityService;
    private IPickListItemView _defaultItem;
    private IPickListView _pickListView;
    private string _sortExpression;
    private string _sortDirection;
    [ServiceDependency(Type = typeof(IEntityContextService), Required = true)]
    public IEntityContextService EntityService
    {
        get
        {
            return _EntityService;
        }
        set
        {
            _EntityService = value;
        }
    }
  
    public override Type EntityType
    {
        get { return typeof(IPickListView); }
    }

   

    protected override void OnAddEntityBindings()
    {
    }
    

    protected override void OnWireEventHandlers()
    {
        btnAdd.Click += new ImageClickEventHandler(btnAdd_ClickAction);
        grdPicklistItems.PageIndexChanging += new GridViewPageEventHandler(grdPicklistItems_PageIndexChanging);
        base.OnWireEventHandlers();
    }

    protected override void OnFormBound()
    {
        base.OnFormBound();

        this._pickListView = GetPickListView(); 
        this._defaultItem = GetDefaultItem(this._pickListView);
        LoadGrid();
        
       
    }
       
    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
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
           
            DialogService.SetSpecs(200,600, "AddEditPickListItem");
            DialogService.DialogParameters.Clear();
            DialogService.DialogParameters.Add("MODE", "ADD");
            //DialogService.DialogParameters.Add("PickListId", _pickListView.Id);
            //DialogService.DialogParameters.Add("PickListItemId", "");
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
                TableCell cell = e.Row.Cells[DeleteColumnIndex];
                foreach (Control c in cell.Controls)
                {
                    LinkButton btn = c as LinkButton;
                    if (btn != null)
                    {
                        btn.Attributes.Add("onclick", "javascript: return confirm('" + PortalUtil.JavaScriptEncode(GetLocalResourceObject("ConfirmMessage").ToString()) + "');");
                        return;
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
                DialogService.SetSpecs(200, 600, "AddEditPickListItem");
                DialogService.DialogParameters.Clear();
                DialogService.DialogParameters.Add("MODE", "EDIT");
                DialogService.DialogParameters.Add("PickListId",  grdPicklistItems.DataKeys[rowIndex].Values[1].ToString());
                DialogService.DialogParameters.Add("PickListItemId",  grdPicklistItems.DataKeys[rowIndex].Values[0].ToString());
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
        //LocalizedBooleanConverter converter = new LocalizedBooleanConverter();
        if ((val != null)&&(this._defaultItem != null))
        {
            string itemId = val.ToString();
            
            if (this._defaultItem.PickListItemId == itemId)
            {
                return true; // converter.ConvertToString(false);
            }            
        }
        return false;// converter.ConvertToString(false);
    }

    protected void grdPicklistItems_RowEditing(object sender, GridViewEditEventArgs e)
    {
        grdPicklistItems.SelectedIndex = e.NewEditIndex;
    }

    protected void grdPicklistItems_RowDeleting(object sender, GridViewDeleteEventArgs e)
    {
    }

    protected void grdPicklistItems_Sorting(object sender, GridViewSortEventArgs e)
    {
        if (e.SortDirection == SortDirection.Ascending)
        {
            _sortDirection = "ASC";
        }
        else 
        {
            _sortDirection = "DESC";
        }
        _sortExpression = e.SortExpression;
    
    }

    protected void grdPicklistItems_PageIndexChanging(object sender, GridViewPageEventArgs e)
    {
        grdPicklistItems.PageIndex = e.NewPageIndex;
    }

    private void LoadGrid()
    {

        //DSItems.Bindings.Add(new Sage.Platform.WebPortal.Binding.WebEntityListBinding("PickListItems", grdPicklistItems));
        ///DSItems.SourceObject = EntityService.GetEntity();
        grdPicklistItems.DataSource = GetItems(_pickListView);
        _sortExpression = grdPicklistItems.CurrentSortExpression;
        SetSortDirection(grdPicklistItems.CurrentSortDirection);
        grdPicklistItems.DataBind();
    }

    private IList<IPickListItemView> GetItems(IPickListView pickList)
    {

        using (ISession session = new SessionScopeWrapper(true))
        {
             
            if(string.IsNullOrEmpty(_sortExpression))
            {
               _sortExpression = "OrderSeq";
            }
            if(string.IsNullOrEmpty(_sortDirection))
            {
              _sortDirection = "Asc";
            }
            
                string hql = string.Format("select P1 from PickListItemView P1 where (P1.UserId =:UserId And P1.PickListId = :PickListId) order by {0} {1} ", _sortExpression, _sortDirection);
                //string hql = string.Format("select P1 from PickListItemView P1 where (P1.PickListId = :PickListId) order by {0} {1} ", _sortExpression, _sortDirection);
                IQuery query = session.CreateQuery(hql);
                query
                    .SetAnsiString("PickListId", pickList.Id.ToString())
                    .SetAnsiString("UserId", "ADMIN")
                    .SetCacheable(false);
                return query.List<IPickListItemView>();
            
        }
    
    
    }

    private IPickListView GetPickListView()
    {
        IPickListView plv =  this.BindingSource.Current as IPickListView;
        using (ISession session = new SessionScopeWrapper(true))
        {
            IQuery query = session.CreateQuery("select p1 from PickListView p1 where p1.Id = :PickListId");
            query
                .SetAnsiString("PickListId", plv.Id.ToString())
                .SetCacheable(false);
            return query.UniqueResult<IPickListView>();
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
        if (sortDir ==  SortDirection.Ascending.ToString())
        {
            _sortDirection = "ASC";
        }
        else
        {
            _sortDirection = "DESC";
        }
    
    
    }
    
}