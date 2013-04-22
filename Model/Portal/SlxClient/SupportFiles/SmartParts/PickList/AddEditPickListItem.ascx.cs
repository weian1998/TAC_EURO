using System;
using System.Web.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.Application;
using Sage.Platform;
using Sage.Entity.Interfaces;
using Sage.SalesLogix.PickLists;
using Sage.Platform.WebPortal.Services;

public partial class AddEditPickListItem : EntityBoundSmartPartInfoProvider 
{
    private IPickListView _pickListView;
    private IPickListItemView _pickListItemView;
    private string _mode;

    [ServiceDependency(Type = typeof(IEntityContextService), Required = true)]
    public IEntityContextService EntityService { get; set; }

    public IPickListService PLS
    {
        get
        {
            return ApplicationContext.Current.Services.Get<IPickListService>(true);
        }

    }
    public override Type EntityType
    {
        get { return typeof(IPickListItemView); }
    }

    protected void Page_Init(object sender, EventArgs e)
    {

        txtItemText.MaxLength = 64;
        txtCode.MaxLength = 64;
        txtOrder.MaxLength = 10;        
    }

    protected override void OnAddEntityBindings()
    {
    }

    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        btnOK.Click += btnOK_Click;
        btnOK.Click += DialogService.CloseEventHappened;
        btnCancel.Click += DialogService.CloseEventHappened;
        btnSaveNew.Click += btnSaveNew_Click;
    }

    protected override void OnFormBound()
    {
        base.OnFormBound();
        if (DialogService.DialogParameters.Count > 0)
        {
            object mode;
            hdMode.Value = string.Empty;
            if (DialogService.DialogParameters.TryGetValue("MODE", out mode))
            {
                _mode = mode.ToString();
                hdMode.Value = _mode;
            }
            
            object pickListId;
            hdPickListId.Value = string.Empty;
            if (DialogService.DialogParameters.TryGetValue("PickListId", out pickListId))
            {
                _pickListView = EntityFactory.GetById<IPickListView>(pickListId);
                hdPickListId.Value = pickListId.ToString();
            }
            else 
            {
                _pickListView = GetParentEntity() as IPickListView;
                hdPickListId.Value = _pickListView.Id.ToString();
            }
            object pickListItemId;
            hdPickListItemId.Value = string.Empty;
            if (DialogService.DialogParameters.TryGetValue("PickListItemId", out pickListItemId))
            {

                string[] IdNames = new string[] {"PickListItemId","PickListId"};
                object[] Ids = new object[] { pickListItemId, pickListId};
                _pickListItemView = EntityFactory.GetByCompositeId(typeof(IPickListItemView), IdNames, Ids) as IPickListItemView;
                hdPickListItemId.Value = pickListItemId.ToString();
            }
        }  
        LoadView();
    }

    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();

        if (_mode == "EDIT")
        {
            tinfo.Description = GetLocalResourceObject("DialogTitleEdit").ToString();
            tinfo.Title = GetLocalResourceObject("DialogTitleEdit").ToString(); 
        }
        else
        {
            tinfo.Description = GetLocalResourceObject("DialogTitleAdd").ToString();
            tinfo.Title = GetLocalResourceObject("DialogTitleAdd").ToString(); 
        }

        foreach (Control c in Controls)
        {
            SmartPartToolsContainer cont = c as SmartPartToolsContainer;
            if (cont != null)
            {
                switch (cont.ToolbarLocation)
                {
                    case SmartPartToolsLocation.Right:
                        foreach (Control tool in cont.Controls)
                        {
                            tinfo.RightTools.Add(tool);
                        }
                        break;
                    case SmartPartToolsLocation.Center:
                        foreach (Control tool in cont.Controls)
                        {
                            tinfo.CenterTools.Add(tool);
                        }
                        break;
                    case SmartPartToolsLocation.Left:
                        foreach (Control tool in cont.Controls)
                        {
                            tinfo.LeftTools.Add(tool);
                        }
                        break;
                }
            }
        }
        return tinfo;
    }

    protected void btnOK_Click(object sender, EventArgs e)
    {
        SaveItem();
    }

    protected void btnSaveNew_Click(object sender, EventArgs e)
    {
        SaveItem();
        hdMode.Value = "ADD";
        txtCode.Text = string.Empty;
        txtItemText.Text = string.Empty;
    }

    private void SaveItem()
    {
        if (String.IsNullOrEmpty(txtItemText.Text))
        {
            throw new ValidationException(GetLocalResourceObject("error_InvalidItemName").ToString());
        }
        if ((string.IsNullOrEmpty(hdPickListItemId.Value)) && (hdMode.Value == "ADD"))
        {
            int order = Convert.ToInt32(txtOrder.Text);
            PickList pl = PickList.AddNewPickListItem(hdPickListId.Value, txtItemText.Text, txtCode.Text, order, "");
            if (chkIsDefaultItem.Checked)
            {
                PickList.SetAsDefaultItem(hdPickListId.Value, pl.ItemId);
            }
        }
        else
        {
            PickList pl = PickList.GetPickListItemById(hdPickListId.Value, hdPickListItemId.Value);
            pl.Shorttext = txtCode.Text;
            pl.Text = txtItemText.Text;
            int orderValue = Convert.ToInt32(txtOrder.Text);
            pl.Id = orderValue;
            PickList.SavePickListItem(pl);

            if ((chkIsDefaultItem.Checked) && (string.IsNullOrEmpty(hdIsDefault.Value)))
            {
                PickList.SetAsDefaultItem(hdPickListId.Value, pl.ItemId);
            }
            if ((!chkIsDefaultItem.Checked) && (!string.IsNullOrEmpty(hdIsDefault.Value)))
            {
                PickList.SetAsDefaultItem(hdPickListId.Value, "");
            }
        }
        PLS.ClearPickListCache();
        IPanelRefreshService refresher = PageWorkItem.Services.Get<IPanelRefreshService>();
        refresher.RefreshAll();
    }


    private void LoadView()
    {
        if (_pickListItemView != null)
        {
            txtCode.Text = _pickListItemView.Code;
            txtItemText.Text = _pickListItemView.Text;
			txtOrder.Text = _pickListItemView.OrderSeq.ToString();
            SetDefaultFlag();
        }
        else 
        {
            txtCode.Text = string.Empty;
            txtItemText.Text = string.Empty;;
            txtOrder.Text = Convert.ToString(PickList.GetNextOrderNumber(_pickListView.Id.ToString()));
            chkIsDefaultItem.Checked = false;      
        
        }
        txtItemText.Focus();
    }

    private void SetDefaultFlag()
    {
        chkIsDefaultItem.Checked = false;
        hdIsDefault.Value = string.Empty;
        if (_pickListView != null)
        {
            IPickListItemView defaultItem = GetDefaultItem(_pickListView);
            if (defaultItem != null)
            {
                if (defaultItem.PickListItemId == _pickListItemView.PickListItemId)
                {
                    chkIsDefaultItem.Checked = true;
                    hdIsDefault.Value = "True";
                }
            }
        }    
    }

    private IPickListItemView GetDefaultItem(IPickListView pickListView)
    {
        if ((pickListView.DefaultIndex.HasValue) && (pickListView.DefaultIndex.Value >= 0))
        {
            PickList plItem = PickList.GetDefaultItem(pickListView.Id.ToString());
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
}