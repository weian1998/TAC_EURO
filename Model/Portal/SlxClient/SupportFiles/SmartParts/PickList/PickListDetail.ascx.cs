using System;
using System.Data;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.Application;
using Sage.Platform.Orm;
using Sage.Platform;
using Sage.Entity.Interfaces;
using Sage.Platform.Repository;
using Sage.SalesLogix.PickLists;


public partial class PickListDetail : EntityBoundSmartPartInfoProvider 
{
    private IPickListView _pickListView;

    public IPickListService PLS
    {
        get 
        {
            return ApplicationContext.Current.Services.Get<IPickListService>(true);            
        
        }
            
    }


    private IEntityContextService _EntityService;
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
        get { return typeof(Sage.Entity.Interfaces.IPickListView); }
    }


    protected override void InnerPageLoad(object sender, EventArgs e)
    {
    
    
    }

    protected override void OnAddEntityBindings()
    {
        // txtPicklistName.Text Binding
        Sage.Platform.WebPortal.Binding.WebEntityBinding txtPicklistNameTextBinding = new Sage.Platform.WebPortal.Binding.WebEntityBinding("PicklistName", txtPicklistName, "Text");
        BindingSource.Bindings.Add(txtPicklistNameTextBinding);
        

        //dsPickListItems.Bindings.Add(new Sage.Platform.Mashups.Web.WebMashupBinding(dgPickListItems));

        //BindingSource.OnCurrentEntitySet += new EventHandler(dsPickListItems_OnCurrentEntitySet);

    }
    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        btnSave.Click += new ImageClickEventHandler(btnSave_ClickAction);
        btnDelete.Click += new ImageClickEventHandler(btnDelete_ClickAction);
        btnNew.Click += new ImageClickEventHandler(btnAdd_ClickAction);
        // QFButton.Click += new ImageClickEventHandler(QFButton_ClickAction);
      


    }

    protected override void OnFormBound()
    {
        base.OnFormBound();
        this._pickListView = (IPickListView)this.BindingSource.Current;
        ClientBindingMgr.RegisterSaveButton(btnSave);

        btnDelete.OnClientClick = string.Format("return confirm('{0}');", Sage.Platform.WebPortal.PortalUtil.JavaScriptEncode(GetLocalResourceObject("btnDelete.ActionConfirmationMessage").ToString()));


        LoadView();
    }

    


    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        if (BindingSource != null)
        {
            if (BindingSource.Current != null)
            {
                tinfo.Description = BindingSource.Current.ToString();
                tinfo.Title = BindingSource.Current.ToString();
            }
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


    protected void btnSave_ClickAction(object sender, EventArgs e)
    {
        this._pickListView = (IPickListView)this.BindingSource.Current;
        PickListAttributes att = GetAttributes();
        PickList pl = PickList.GetPickListById(_pickListView.Id.ToString());
        pl.Text = txtPicklistName.Text;
        pl.Shorttext = att.ToString();
        if (chkIsManaged.Checked)
        {
            pl.Id = 1;
        }
        else 
        {
            pl.Id = 0;        
        }


        PickList.SavePickList(pl);
        PLS.ClearPickListCache();

    }

    protected void btnDelete_ClickAction(object sender, EventArgs e)
    {
        this._pickListView = (IPickListView)this.BindingSource.Current;
        PickList pl = PickList.GetPickListById(_pickListView.Id.ToString());
        PickList.DeletePickList(pl);
        Response.Redirect("PickListView.aspx");
    }
    protected void btnAdd_ClickAction(object sender, EventArgs e)
    {
        if (DialogService != null)
        {
            // DialogActionItem
            DialogService.SetSpecs(200, 600, "AddPickList", string.Empty);
            DialogService.ShowDialog();
        }
    }

    private void LoadView()
    {

        PickList pl = PickList.GetPickListById(_pickListView.Id.ToString());
        
        
        PickList defItem  = PickList.GetDefaultItem(_pickListView.Id.ToString());
        if(defItem != null)
        {
            txtDefaultValue.Text = defItem.Text;
        }
        else
        {
            txtDefaultValue.Text =  string.Empty;        
        }
        PickListAttributes att = PickList.GetAttributes(pl.Shorttext);
        SetAttributes(att);
        pklTest.PickListName = pl.Text;// _pickListView.PickListName;
        pklTest.PickListValue = string.Empty;
        pklTest.AllowMultiples = att.AllowMultiples;
        pklTest.AlphaSort = att.AlphaSorted;
        pklTest.CanEditText = !att.NoneEditable;
        pklTest.MustExistInList = att.ValueMustExist; 
      
        if (pl.Id.Value == 1)
        {
            chkIsManaged.Checked = true;
        }
        else 
        {
            chkIsManaged.Checked = false;
        }
        pklTest.Required = false; //We can test required during test. or we then could not save the picklist because of validation.
       
    }

    private PickListAttributes GetAttributes()
    {
        PickListAttributes att = new PickListAttributes(); 
        att.AllowMultiples = chkAllowMulltiple.Checked;
        att.ValueMustExist = chkMustMatch.Checked;
        att.Required = chkRequired.Checked;
        att.AlphaSorted = chkSorted.Checked;
        att.NoneEditable = chkUsersCanEdit.Checked;
        return att;
    
    }

    private void SetAttributes(PickListAttributes att)
    {
        chkAllowMulltiple.Checked = att.AllowMultiples;
        chkMustMatch.Checked = att.ValueMustExist;
        chkRequired.Checked = att.Required;
        chkSorted.Checked = att.AlphaSorted;
        chkUsersCanEdit.Checked = att.NoneEditable;
    }


  
}
