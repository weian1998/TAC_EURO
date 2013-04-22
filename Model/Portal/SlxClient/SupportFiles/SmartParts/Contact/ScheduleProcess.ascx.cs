using System;
using System.Collections.Generic;
using System.Web.UI;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.Platform.Diagnostics;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Plugins;
using Sage.SalesLogix.Security;

public partial class SmartParts_Process_ScheduleProcess : EntityBoundSmartPartInfoProvider
{
    private IContact Contact { get; set; }

    private IList<Plugin> PluginList { get; set; }

    [ServiceDependency(Type = typeof(IEntityHistoryService), Required = true)]
    public IEntityHistoryService EntityHistoryService { get; set; }

    public override Type EntityType
    {
        get { return typeof(IContact); }
    }

    protected override void InnerPageLoad(object sender, EventArgs e)
    {
        if (!Visible) return;
        LoadContactProcessTypes();
    }

    protected override void OnAddEntityBindings()
    {
    }

    protected override void OnWireEventHandlers()
    {
        cmdSchedule.Click += cmdSchedule_Click;
        cmdSchedule.Click += DialogService.CloseEventHappened;
        base.OnWireEventHandlers();
    }

    protected override void OnFormBound()
    {
        if (Contact == null)
        {
            try
            {
                Object parentEntity = GetParentEntity();
                if (parentEntity != null)
                {
                    if (parentEntity is IContact)
                    {
                        IContact contact = (parentEntity as IContact);
                        Contact = contact;
                    }
                }
            }
            catch
            {
                IContact contact = GetLastContact();
                if (contact != null)
                {
                    Contact = contact;
                }
            }
        }
        LoadContact();
        LoadOwner();
        base.OnFormBound();
    }

    private void LoadContactProcessTypes()
    {
        if (PluginList != null) return;
        PluginList = PluginManager.GetPluginList(PluginType.ContactProcess, true, false);
        cboProcessType.DataSource = PluginList;
        cboProcessType.DataTextField = "NAME";
        cboProcessType.DataValueField = "PLUGINID";
        cboProcessType.DataBind();
        if (PluginList.Count > 0)
        {
            cboProcessType.SelectedIndex = 0;
        }
    }

    private void LoadContact()
    {
        if (Contact != null)
        {
            lueContactToScheduleFor.LookupResultValue = Contact;
        }
    }

    private void LoadOwner()
    {
        if (ownProcessOwner.LookupResultValue != null) return;
        IUserService service = ApplicationContext.Current.Services.Get<IUserService>();
        SLXUserService user = (SLXUserService)service;
        if (user == null) return;
        IUser owner = user.GetUser();
        if (owner != null)
        {
            ownProcessOwner.LookupResultValue = owner;
        }
    }

    protected void cmdSchedule_Click(object sender, EventArgs e)
    {
        if (lueContactToScheduleFor.LookupResultValue == null)
        {
            throw new ValidationException(GetLocalResourceObject("error_ScheduleFor.Message").ToString());
        }
        try
        {
            LoadOwner();
            if (cboProcessType.DataSource != null)
            {
                Plugin selectedPlugin = ((IList<Plugin>) cboProcessType.DataSource)[cboProcessType.SelectedIndex];
                object[] objarray = new[]
                                        {
                                            lueContactToScheduleFor.LookupResultValue,
                                            selectedPlugin.PluginId,
                                            selectedPlugin.Family,
                                            selectedPlugin.Name,
                                            ownProcessOwner.LookupResultValue
                                        };
                Sage.Platform.Orm.DynamicMethodLibraryHelper.Instance.Execute("Contact.ScheduleProcess", objarray);
                DialogService.CloseEventHappened(sender, e);
                IPanelRefreshService refresher = PageWorkItem.Services.Get<IPanelRefreshService>(true);
                refresher.RefreshTabWorkspace();
            }
            else
            {
                DialogService.ShowMessage(GetLocalResourceObject("Error_ProcessTypes").ToString(), "SalesLogix");
            }
        }
        catch (Exception ex)
        {
            string sSlxErrorId = null;
            var sMsg = ErrorHelper.GetClientErrorHtmlMessage(ex, ref sSlxErrorId);
            if (!string.IsNullOrEmpty(sSlxErrorId))
            {
                log.Error(
                    ErrorHelper.AppendSlxErrorId(
                        "The call to SmartParts_Process_ScheduleProcess.cmdSchedule_Click failed", sSlxErrorId), ex);
            }
            DialogService.ShowHtmlMessage(sMsg, ErrorHelper.IsDevelopmentContext() ? 600 : -1,
                                          ErrorHelper.IsDevelopmentContext() ? 800 : -1);
        }
    }

    private IContact GetLastContact()
    {
        if (EntityHistoryService != null)
        {
            object contactId = EntityHistoryService.GetLastIdForType<IContact>();
            if (contactId != null)
            {
                IContact contact = Sage.Platform.EntityFactory.GetById<IContact>(contactId);
                if (contact != null)
                {
                    return contact;
                }
            }
        }
        return null;
    }

    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in ScheduleProcess_LTools.Controls)
        {
            tinfo.LeftTools.Add(c);
        }
        foreach (Control c in ScheduleProcess_CTools.Controls)
        {
            tinfo.CenterTools.Add(c);
        }
        foreach (Control c in ScheduleProcess_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }
}