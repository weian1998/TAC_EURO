using System;
using System.Web.UI;
using System.Text;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Entity.Interfaces;
using Sage.Platform.WebPortal;

public partial class SmartParts_Association_AddEditContactAssociation : EntityBoundSmartPartInfoProvider, IScriptControl
{
    private IAssociation _assoc = null;
    private const int TEXTAREA_MAXLENGTH = 128;

    public override Type EntityType
    {
        get { return typeof(IAssociation); }
    }

    protected override void OnAddEntityBindings()
    {
        BindingSource.AddBindingProvider(luFromIDDialog as Sage.Platform.EntityBinding.IEntityBindingProvider);
        BindingSource.Bindings.Add(new Sage.Platform.EntityBinding.PropertyBinding("FromId", luFromIDDialog, "LookupResultValue", "", ""));
        BindingSource.AddBindingProvider(luToIDDialog as Sage.Platform.EntityBinding.IEntityBindingProvider);
        BindingSource.Bindings.Add(new Sage.Platform.EntityBinding.PropertyBinding("ToId", luToIDDialog, "LookupResultValue", "", ""));
        BindingSource.AddBindingProvider(luFromIDText as Sage.Platform.EntityBinding.IEntityBindingProvider);
        BindingSource.Bindings.Add(new Sage.Platform.EntityBinding.PropertyBinding("FromId", luFromIDText, "LookupResultValue", "", ""));
        BindingSource.AddBindingProvider(luToIDText as Sage.Platform.EntityBinding.IEntityBindingProvider);
        BindingSource.Bindings.Add(new Sage.Platform.EntityBinding.PropertyBinding("ToId", luToIDText, "LookupResultValue", "", ""));
        BindingSource.AddBindingProvider(pklBackRelation as Sage.Platform.EntityBinding.IEntityBindingProvider);
        BindingSource.Bindings.Add(new Sage.Platform.EntityBinding.PropertyBinding("BackRelation", pklBackRelation, "PickListValue", "", ""));
        BindingSource.AddBindingProvider(pklForwardRelation as Sage.Platform.EntityBinding.IEntityBindingProvider);
        BindingSource.Bindings.Add(new Sage.Platform.EntityBinding.PropertyBinding("ForwardRelation", pklForwardRelation, "PickListValue", "", ""));
        BindingSource.AddBindingProvider(luBackRelatedTo as Sage.Platform.EntityBinding.IEntityBindingProvider);
        BindingSource.Bindings.Add(new Sage.Platform.EntityBinding.PropertyBinding("ToId", luBackRelatedTo, "LookupResultValue", "", ""));
        BindingSource.AddBindingProvider(luFowardRelatedTo as Sage.Platform.EntityBinding.IEntityBindingProvider);
        BindingSource.Bindings.Add(new Sage.Platform.EntityBinding.PropertyBinding("FromId", luFowardRelatedTo, "LookupResultValue", "", ""));
        BindingSource.AddBindingProvider(txtBackNotes as Sage.Platform.EntityBinding.IEntityBindingProvider);
        BindingSource.Bindings.Add(new Sage.Platform.EntityBinding.PropertyBinding("BackNotes", txtBackNotes, "Text", "", ""));
        BindingSource.AddBindingProvider(txtForwardNotes as Sage.Platform.EntityBinding.IEntityBindingProvider);
        BindingSource.Bindings.Add(new Sage.Platform.EntityBinding.PropertyBinding("ForwardNotes", txtForwardNotes, "Text", "", ""));
    }

    protected override void OnWireEventHandlers()
    {
        btnSave.Click += btnSave_ClickAction;
        btnSave.Click += DialogService.CloseEventHappened;
        btnCancel.Click += DialogService.CloseEventHappened;
        cmdClose.Click += new ImageClickEventHandler(DialogService.CloseEventHappened);
        txtBackNotes.Attributes.Add("onkeypress", string.Format("return {0}_obj.limitLength(event, this, {1})", ClientID, TEXTAREA_MAXLENGTH));
        txtBackNotes.Attributes.Add("onblur", string.Format("{0}_obj.clipText(this, {1})", ClientID, TEXTAREA_MAXLENGTH));
        txtForwardNotes.Attributes.Add("onkeypress", string.Format("return {0}_obj.limitLength(event, this, {1})", ClientID, TEXTAREA_MAXLENGTH));
        txtForwardNotes.Attributes.Add("onblur", string.Format("{0}_obj.clipText(this, {1})", ClientID, TEXTAREA_MAXLENGTH));
        base.OnWireEventHandlers();
    }

    protected override void OnFormBound()
    {
        base.OnFormBound();
        ClientBindingMgr.RegisterDialogCancelButton(btnCancel);
    }

    protected void Page_Init(object sender, EventArgs e)
    {
        pklBackRelation.MaxLength = 64;
        pklForwardRelation.MaxLength = 64;
    }

    protected override void OnPreRender(EventArgs e)
    {
        base.OnPreRender(e);

        if (ScriptManager.GetCurrent(Page) != null)
            ScriptManager.GetCurrent(Page).RegisterScriptControl(this);

        IntRegisterClientScripts();
    }

    private void IntRegisterClientScripts()
    {
        StringBuilder script = new StringBuilder();
        script.AppendLine(
            string.Format(
                "   {0}_obj = new AddEditContactAssociation(\"{1}\", \"{2}\", \"{3}\", \"{4}\", \"{5}\", \"{6}\");",
                ClientID, Mode.ClientID, luToIDDialog.ClientID, lblBackRelationTo_Contact.ClientID,
                hdtContactId.ClientID, cmdClose.ClientID,
                PortalUtil.JavaScriptEncode(GetLocalResourceObject("MSGCanNotAssociateToSelf").ToString())));
        script.AppendLine();
        ScriptManager.RegisterClientScriptBlock(Page, GetType(), ClientID, script.ToString(), true);
    }

    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        if (BindingSource != null)
        {
            if (BindingSource.Current != null)
            {
                _assoc = (IAssociation)BindingSource.Current;
                if (_assoc.Id != null)
                {
                    tinfo.Title = GetLocalResourceObject("DialogTitleEdit").ToString();
                    divFromIDDialog.Style.Add("display", "none");
                    divFromIDText.Style.Add("display", "blocked");
                    divToIDDialog.Style.Add("display", "none");
                    divToIDText.Style.Add("display", "blocked");
                    divBackRelationToAdd.Style.Add("display", "none");
                    divBackRelationToEdit.Style.Add("display", "blocked");
                    Mode.Value = "UPDATE";
                }
                else
                {
                    //new association
                    tinfo.Title = GetLocalResourceObject("DialogTitleAdd").ToString();
                    IContact contact = GetParentEntity() as IContact;

                    divFromIDDialog.Style.Add("display", "none");
                    divFromIDText.Style.Add("display", "blocked");
                    divToIDDialog.Style.Add("display", "blocked");
                    divToIDText.Style.Add("display", "none");
                    divBackRelationToAdd.Style.Add("display", "blocked");
                    divBackRelationToEdit.Style.Add("display", "none");
                    luFromIDDialog.LookupResultValue = contact.Id;
                    luFromIDText.LookupResultValue = contact.Id;
                    luFowardRelatedTo.LookupResultValue = contact.Id;
                    hdtContactId.Value = contact != null ? contact.Id.ToString() : String.Empty;
                    Mode.Value = "ADD";
                }
            }
        }
        foreach (Control c in AssociationForm_LTools.Controls)
        {
            tinfo.LeftTools.Add(c);
        }
        foreach (Control c in AssociationForm_CTools.Controls)
        {
            tinfo.CenterTools.Add(c);
        }
        foreach (Control c in AssociationForm_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }
    protected void btnSave_ClickAction(object sender, EventArgs e)
    {
        Sage.Platform.Orm.Interfaces.IPersistentEntity persistentEntity = BindingSource.Current as Sage.Platform.Orm.Interfaces.IPersistentEntity;
        if (persistentEntity != null)
        {
            IAssociation assoc = (IAssociation)this.BindingSource.Current;
            assoc.IsAccountAssociation = false;
            if (assoc.BackNotes != null)
            {
                if (assoc.BackNotes.Length > 128)
                {
                    assoc.BackNotes = assoc.BackNotes.Substring(0, 128);
                }
            }
            if (assoc.ForwardNotes != null)
            {
                if (assoc.ForwardNotes.Length > 128)
                {
                    assoc.ForwardNotes = assoc.ForwardNotes.Substring(0, 128);
                }
            }
            if (string.IsNullOrEmpty(assoc.ToId))
            {
                if (DialogService != null)
                {
                    string msg = GetLocalResourceObject("ContactNullMessage").ToString();
                    DialogService.ShowMessage(msg);
                }
            }
            else
            {
                persistentEntity.Save();
                btnSave_ClickActionBRC(sender, e);
            }
        }
    }

    protected void btnSave_ClickActionBRC(object sender, EventArgs e)
    {
        Sage.Platform.WebPortal.Services.IPanelRefreshService refresher = PageWorkItem.Services.Get<Sage.Platform.WebPortal.Services.IPanelRefreshService>();
        refresher.RefreshTabWorkspace();
    }

    protected void cmdClose_OnClick(object sender, EventArgs e)
    {
    }

    #region IScriptControl Members

    public System.Collections.Generic.IEnumerable<ScriptDescriptor> GetScriptDescriptors()
    {
        yield break;
    }

    public System.Collections.Generic.IEnumerable<ScriptReference> GetScriptReferences()
    {
        yield return new ScriptReference("~/SmartParts/Association/AddEditContactAssociation_ClientScript.js");
    }

    #endregion
}