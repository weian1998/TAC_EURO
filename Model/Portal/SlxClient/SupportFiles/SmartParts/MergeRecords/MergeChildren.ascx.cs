using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.ComponentModel;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Services.Integration;
using ApplicationException = Sage.Common.Exceptions.ApplicationException;
using SmartPartInfoProvider = Sage.Platform.WebPortal.SmartParts.SmartPartInfoProvider;

public partial class MergeChildren : SmartPartInfoProvider
{
    private IntegrationManager _integrationManager;
    private Boolean _loadResults = true;
    private MergeContactsStateInfo _mergeContactsStateInfo;

    /// <summary>
    /// Gets the integration manager.
    /// </summary>
    /// <value>The integration manager.</value>
    public IntegrationManager IntegrationManager
    {
        get
        {
            if (_integrationManager == null)
            {
                if (DialogService.DialogParameters.ContainsKey("IntegrationManager"))
                {
                    _integrationManager = (DialogService.DialogParameters["IntegrationManager"]) as IntegrationManager;
                }
            }
            return _integrationManager;
        }
    }

    /// <summary>
    /// Gets or sets the entity service.
    /// </summary>
    /// <value>The entity service.</value>
    [ServiceDependency(Type = typeof(IEntityContextService), Required = true)]
    public IEntityContextService EntityService { get; set; }

    [ServiceDependency(Type = typeof(IContextService), Required = true)]
    public IContextService ContextService { get; set; }

    public class MergeContactsStateInfo
    {
        public String SelectedSourceId = String.Empty;
        public String SelectedTargetId = String.Empty;
        public String FirstName = String.Empty;
        public String LastName = String.Empty;
        public int? SelectedRowSourceIndex;
        public int? SelectedRowTargetIndex;
    }

    /// <summary>
    /// Derived components should override this method to wire up event handlers for buttons and other controls in the form.
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        btnNext.Click += new EventHandler(btnNext_OnClick);
        btnBack.Click += new EventHandler(btnBack_OnClick);
        btnCancel.Click += new EventHandler(DialogService.CloseEventHappened);
    }

    /// <summary>
    /// Raises the <see cref="E:Load"/> event.
    /// </summary>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);
        if (Visible)
        {
            _mergeContactsStateInfo = ContextService.GetContext("MergeContactsStateInfo") as MergeContactsStateInfo ??
                                      new MergeContactsStateInfo();
        }
    }

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"/> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"/> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        if (_loadResults)
        {
            grdLinkedRecords.DataSource = IntegrationManager.MatchedContacts;
            grdLinkedRecords.DataBind();
            grdTargetRecords.DataSource = IntegrationManager.TargetContacts;
            grdTargetRecords.DataBind();
            grdSourceRecords.DataSource = IntegrationManager.SourceContacts;
            grdSourceRecords.DataBind();

            lblSlxRecords.Text = String.Format(GetLocalResourceObject("UnlinkedSlxRecords.Caption").ToString(),
                                               GetLocalResourceObject("lblContacts.Caption"),
                                               IntegrationManager.TargetMapping.Name);
            lblTargetRecords.Text = String.Format(GetLocalResourceObject("UnlinkedErpRecords.Caption").ToString(),
                                                  GetLocalResourceObject("lblContacts.Caption"),
                                                  IntegrationManager.SourceMapping.Name);
        }
    }

    /// <summary>
    /// Handles the Click event of the Link button.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnLink_Click(object sender, EventArgs e)
    {
        if (_mergeContactsStateInfo.SelectedRowTargetIndex != null &&
            _mergeContactsStateInfo.SelectedRowSourceIndex != null)
        {
            IntegrationManager.MatchingInfoAddMatchedChildPair(_mergeContactsStateInfo.SelectedSourceId,
                                                               _mergeContactsStateInfo.SelectedTargetId);
            IList<ComponentView> matchedContacts = IntegrationManager.MatchedContacts;
            string[] propertyNames = new[]
                                         {
                                             "sourceId", "targetId", "firstName", "lastName"
                                         };
            object[] propertyValues = new[]
                                          {
                                              _mergeContactsStateInfo.SelectedSourceId,
                                              _mergeContactsStateInfo.SelectedTargetId,
                                              _mergeContactsStateInfo.FirstName,
                                              _mergeContactsStateInfo.LastName
                                          };
            ComponentView view = new ComponentView(propertyNames, propertyValues);
            matchedContacts.Add(view);
            IntegrationManager.SourceContacts.RemoveAt((int) _mergeContactsStateInfo.SelectedRowSourceIndex);
            IntegrationManager.TargetContacts.RemoveAt((int) _mergeContactsStateInfo.SelectedRowTargetIndex);
        }
        else
        {
            throw new ApplicationException(GetLocalResourceObject("Error_SourceTargetNotSelected").ToString());
        }
    }

    protected void grdLinkedRecords_OnRowCommand(object sender, GridViewCommandEventArgs e)
    {
        int rowIndex = Convert.ToInt32(e.CommandArgument);
        string sourceId = grdLinkedRecords.DataKeys[rowIndex].Values[0].ToString();
        string targetId = grdLinkedRecords.DataKeys[rowIndex].Values[1].ToString();
        switch (e.CommandName.ToUpper())
        {
            case "SELECT":
                grdMatchDetails.DataSource = IntegrationManager.GetExtendedContactDetails(sourceId, targetId);
                grdMatchDetails.DataBind();
                break;
            case "UNLINK":
                IntegrationManager.MatchingInfoRemoveMatchedChildPair(sourceId, targetId);
                IntegrationManager.MatchedContacts.RemoveAt(rowIndex);
                break;
        }
    }

    protected void grdSourceRecords_OnRowCommand(object sender, GridViewCommandEventArgs e)
    {
        int rowIndex = Convert.ToInt32(e.CommandArgument);
        _mergeContactsStateInfo.SelectedRowTargetIndex = rowIndex;
        _mergeContactsStateInfo.SelectedSourceId = grdSourceRecords.DataKeys[rowIndex].Values[0].ToString();
        _mergeContactsStateInfo.FirstName = grdSourceRecords.DataKeys[rowIndex].Values[1].ToString();
        _mergeContactsStateInfo.LastName = grdSourceRecords.DataKeys[rowIndex].Values[2].ToString();
        ContextService.SetContext("MergeContactsStateInfo", _mergeContactsStateInfo);
    }

    protected void grdTargetRecords_OnRowCommand(object sender, GridViewCommandEventArgs e)
    {
        int rowIndex = Convert.ToInt32(e.CommandArgument);
        _mergeContactsStateInfo.SelectedTargetId = grdTargetRecords.DataKeys[rowIndex].Values[0].ToString();
        _mergeContactsStateInfo.SelectedRowSourceIndex = rowIndex;
        ContextService.SetContext("MergeContactsStateInfo", _mergeContactsStateInfo);
    }

    /// <summary>
    /// Handles the OnClick event of the btnNext control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnNext_OnClick(object sender, EventArgs e)
    {
        int height = 250;
        int width = 500;
        if (IntegrationManager.MergeData())
        {
            IntegrationManager.LinkChildren = true;
            IntegrationManager.ExecuteSync();
        }
        if (!String.IsNullOrEmpty(IntegrationManager.LinkAccountError))
        {
            height = 500;
            width = 750;
        }
        ShowDialog("LinkResults", GetLocalResourceObject("LinkToAccounting.Caption").ToString(), height, width);
    }

    /// <summary>
    /// Handles the OnClick event of the btnBack control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnBack_OnClick(object sender, EventArgs e)
    {
        string caption = IntegrationManager.DataViewMappings.Count > 0
                     ? GetLocalResourceObject("MergeRecordsDialog_Differences.Caption").ToString()
                     : GetLocalResourceObject("MergeRecordsDialog_NoDifferences.Caption").ToString();
        ShowDialog("MergeRecords", caption, 480, 900);
    }

    /// <summary>
    /// Shows a particular dialog setting the caption height and width.
    /// </summary>
    /// <param name="dialog">The name of the dialog to be displayed.</param>
    /// <param name="caption">The caption of the dialog to be displayed.</param>
    /// <param name="height">The height of the dialog to be displayed.</param>
    /// <param name="width">The width of the dialog to be displayed.</param>
    private void ShowDialog(string dialog, string caption, int height, int width)
    {
        DialogService.SetSpecs(200, 200, height, width, dialog, caption, true);
        if (DialogService.DialogParameters.ContainsKey("IntegrationManager"))
        {
            DialogService.DialogParameters.Remove("IntegrationManager");
        }
        DialogService.DialogParameters.Add("IntegrationManager", IntegrationManager);
        DialogService.ShowDialog();
    }

    /// <summary>
    /// Called when the dialog is closing.
    /// </summary>
    protected override void OnClosing()
    {
        _loadResults = false;
    }

    /// <summary>
    /// Retrieves smart part information compatible with type smartPartInfoType.
    /// </summary>
    /// <param name="smartPartInfoType">Type of information to retrieve.</param>
    /// <returns>
    /// The <see cref="T:Sage.Platform.Application.UI.ISmartPartInfo"/> instance or null if none exists in the smart part.
    /// </returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in MergeChildren_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }
}