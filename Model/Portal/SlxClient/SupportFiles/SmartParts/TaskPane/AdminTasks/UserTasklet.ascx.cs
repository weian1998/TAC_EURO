using System;
using System.Collections.Generic;
using Sage.Entity.Interfaces;
using Sage.Platform;
using System.Web.UI;
using Sage.Platform.Application.UI;
using Sage.Platform.Application;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.SelectionService;
using Sage.SalesLogix.Web.SelectionService;
using Sage.Platform.WebPortal;
using Sage.Platform.Security;

public partial class UserTaskletControl : UserControl, ISmartPartInfoProvider
{
    /// <summary>
    /// Gets or sets the dialog service.
    /// </summary>
    /// <value>The dialog service.</value>
    [ServiceDependency]
    public IWebDialogService DialogService { get; set; }

    protected void tskAddUserToRole_Click(object sender, EventArgs e)
    {
        DialogService.DialogParameters.Clear();
        DialogService.DialogParameters.Add("selectedIds", GetSelectedRecords());
        DialogService.DialogParameters.Add("targetEntityType", typeof(IUser));
        DialogService.EntityType = typeof(IRole);
        DialogService.EntityID = EntityFactory.GetRepository<IRole>().FindAll()[0].Id.ToString();
        DialogService.SetSpecs(180, 350, "SelectRole", GetLocalResourceObject("selectrole_dialogtitle").ToString());
        DialogService.ShowDialog();
    }

    protected void tskResetUsers_Click(object sender, EventArgs e)
    {
        var selected = GetSelectedRecords();
        foreach (var item in selected)
        {
            var user = EntityFactory.GetById<IUser>(item);
            user.LoginAttempts = 0;
            user.Save();
        }
    }

    private List<String> GetSelectedRecords()
    {
        ISelectionService srv = SelectionServiceRequest.GetSelectionService();
        ISelectionContext selectionContext = srv.GetSelectionContext(hfSelections.Value);
        if (selectionContext != null)
        {
            return selectionContext.GetSelectedIds();
        }
        //if none selected, assume it is the current one
        EntityPage page = Page as EntityPage;
        if (page != null && page.EntityContext != null)
        {
            return new List<string> { page.EntityContext.EntityID.ToString() };
        }
        return null;
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        return tinfo;
    }
}