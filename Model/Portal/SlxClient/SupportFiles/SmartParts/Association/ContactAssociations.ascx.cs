using System;
using System.Web.UI;
using Sage.Platform.Application;
using Sage.Platform.WebPortal.SmartParts;
using System.Text;

public partial class SmartParts_Association_ContactAssociations : EntityBoundSmartPartInfoProvider //System.Web.UI.UserControl
{
    [ServiceDependency(Type = typeof(IEntityContextService), Required = true)]
    public IEntityContextService EntityService { get; set; }

    protected override void OnAddEntityBindings()
    {
    }
    
    public override Type EntityType
    {
        get { return typeof(Sage.Entity.Interfaces.IContact); }
    }
    
    protected override void InnerPageLoad(object sender, EventArgs e)
    {
    }

    protected override void OnWireEventHandlers()
    {
        btnAddAssociation.Click += new ImageClickEventHandler(btnAddAssociation_ClickAction);
        base.OnWireEventHandlers();
    }

    protected override void OnFormBound()
    {
        base.OnFormBound();
        LoadGrid();
    }

    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in ContactAssociations_LTools.Controls)
        {
            tinfo.LeftTools.Add(c);
        }
        foreach (Control c in ContactAssociations_CTools.Controls)
        {
            tinfo.CenterTools.Add(c);
        }
        foreach (Control c in ContactAssociations_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    protected void btnAddAssociation_ClickAction(object sender, EventArgs e)
    {
        if (DialogService != null)
        {
            DialogService.SetSpecs(200, 200, 320, 600, "AddEditContactAssociation", "", true);
            DialogService.EntityType = typeof(Sage.Entity.Interfaces.IAssociation);
            DialogService.ShowDialog();
        }
    }

    private void LoadGrid()
    {
        var script = new StringBuilder();
        script.AppendLine("require(['" + Page.ResolveUrl("~/SmartParts/Association/ContactAssociations.js") + "'], function () {");
        if (Page.IsPostBack)
        {
            script.Append(" Sage.UI.Forms.ContactAssociations.init({workspace: '" + getMyWorkspace() + "'} );");
        }
        else
        {
            script.AppendLine("require(['dojo/ready'], function(ready) {");
            script.Append("ready(function () {Sage.UI.Forms.ContactAssociations.init({workspace: '" + getMyWorkspace() + "'} ); });");
            script.AppendLine("});"); //end ready require
        }

        script.AppendLine("});"); // end require
        ScriptManager.RegisterStartupScript(this, GetType(), "initialize_ContactAssociations", script.ToString(), true);
    }
}