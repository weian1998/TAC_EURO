using System;
using System.Text;
using System.Web.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.Application;
using Sage.Entity.Interfaces;

public partial class SmartParts_Association_AccountAssociations : EntityBoundSmartPartInfoProvider
{
    [ServiceDependency(Type = typeof(IEntityContextService), Required = true)]
    public IEntityContextService EntityService { get; set; }

    public override Type EntityType
    {
        get { return typeof(IAccount); }
    }

    protected override void OnAddEntityBindings()
    {
    }

    protected override void OnWireEventHandlers()
    {
        btnAddAssociation.Click += new ImageClickEventHandler(btnAddAssociation_ClickAction);
        base.OnWireEventHandlers();
    }

    protected override void OnFormBound()
    {
        LoadGrid();
    }

    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in AccountAssociations_LTools.Controls)
        {
            tinfo.LeftTools.Add(c);
        }
        foreach (Control c in AccountAssociations_CTools.Controls)
        {
            tinfo.CenterTools.Add(c);
        }
        foreach (Control c in AccountAssociations_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    protected void btnAddAssociation_ClickAction(object sender, EventArgs e)
    {
        if (DialogService != null)
        {
            DialogService.SetSpecs(300, 200, 320, 600, "AddEditAccountAssociation", "", true);
            DialogService.EntityType = typeof(IAssociation);
            DialogService.ShowDialog();
        }
    }

    private void LoadGrid()
    {
        var script = new StringBuilder();
        script.AppendLine("require(['" + Page.ResolveUrl("~/SmartParts/Association/AccountAssociations.js") + "'], function () {");
        if (Page.IsPostBack)
        {
            script.Append(" Sage.UI.Forms.AccountAssociations.init({workspace: '" + getMyWorkspace() + "'} );");
        }
        else
        {
            script.AppendLine("require(['dojo/ready'], function(ready) {");
            script.Append("ready(function () {Sage.UI.Forms.AccountAssociations.init({workspace: '" + getMyWorkspace() +
                          "'} ); });");
            script.AppendLine("});"); //end ready require
        }

        script.AppendLine("});"); // end require
        ScriptManager.RegisterStartupScript(this, GetType(), "initialize_AccountAssociations", script.ToString(), true);
    }
}
