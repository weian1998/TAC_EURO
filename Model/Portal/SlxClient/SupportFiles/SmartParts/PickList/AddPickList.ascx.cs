using System;
using System.Web.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.PickLists;

public partial class AddPickList : EntityBoundSmartPartInfoProvider 
{
    public override Type EntityType
    {
        get { return typeof(Sage.Entity.Interfaces.IPickListView); }
    }

    protected void Page_Init(object sender, EventArgs e)
    {
        txtPicklistName.MaxLength = 64;
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
    }

    protected override void OnFormBound()
    {
        base.OnFormBound();
        LoadView();
    }

    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        tinfo.Description = GetLocalResourceObject("DialogTitle").ToString();
        tinfo.Title = GetLocalResourceObject("DialogTitle").ToString();

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
    
    private void SaveItem()
    {
        IPickListService pls = new PickListService();
        PickList npl = pls.AddNewPickList(txtPicklistName.Text);
        if (npl != null)
        {
            Response.Redirect(string.Format("~/{0}.aspx?entityId={1}", "PickListView", npl.ItemId), false);
        }
    }

    private void LoadView()
    {
        txtPicklistName.Text = PickList.GetUniqueName("");
    }
}