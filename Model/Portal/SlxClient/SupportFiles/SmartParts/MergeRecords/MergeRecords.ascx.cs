using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.UI;
using NHibernate;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.Framework;
using Sage.Platform.Orm;
using Sage.Platform.Orm.Interfaces;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.SelectionService;
using Sage.SalesLogix.Services.PotentialMatch;
using Sage.SalesLogix.Web.SelectionService;
using SmartPartInfoProvider=Sage.Platform.WebPortal.SmartParts.SmartPartInfoProvider;

public partial class MergeRecords : SmartPartInfoProvider
{
    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        btnCancel.Click += new EventHandler(DialogService.CloseEventHappened);
    }

    public MergeProvider SessionMergeProvider { get; set; }

    /// <summary>
    /// Gets or sets the entity service.
    /// </summary>
    /// <value>The entity service.</value>
    [ServiceDependency(Type = typeof (IEntityContextService), Required = true)]
    public IEntityContextService EntityService { get; set; }

    protected void Page_Init(object sender, EventArgs e)
    {
        if (DialogService.DialogParameters.ContainsKey("selectionContextKey"))
        {
            if (!DialogService.DialogParameters.ContainsKey("MergeProvider"))
            {
                Type type = EntityService.EntityType;

                string key = DialogService.DialogParameters["selectionContextKey"].ToString();
                ISelectionService srv = SelectionServiceRequest.GetSelectionService();
                ISelectionContext selectionContext = srv.GetSelectionContext(key);
                IList<string> list = selectionContext.GetSelectedIds();
                object source = GetEntity(type, list[0]);
                object target = GetEntity(type, list[1]);

                MergeProvider mergeProvider = new MergeProvider(type, type);
                MatchEntitySource targetEntity = new MatchEntitySource(type, target, list[1]);
                MatchEntitySource sourceEntity = new MatchEntitySource(type, source, list[0]);
                mergeProvider.Source = sourceEntity;
                mergeProvider.Target = targetEntity;
                //Verify the user has read write permissions for every property in the configuration mappings.
                ValidateUserSecurity(mergeProvider);
                SessionMergeProvider = mergeProvider;

                IList<MergeRecordView> mergeView = mergeProvider.GetMergeView();
                grdMerge.DataSource = mergeView;
                grdMerge.DataBind();
                DialogService.DialogParameters.Remove("MergeProvider");
                DialogService.DialogParameters.Add("MergeProvider", mergeProvider);
            }
            else
            {
                SessionMergeProvider = DialogService.DialogParameters["MergeProvider"] as MergeProvider;
            }
        }
    }

    private void ValidateUserSecurity(MergeProvider mergeProvider)
    {
        IFieldLevelSecurityService fieldLevelSecurityService =
            ApplicationContext.Current.Services.Get<IFieldLevelSecurityService>(true);
        if (fieldLevelSecurityService != null)
        {
            IList<string> sourceProperties = new List<string>();
            IList<string> targetProperties = new List<string>();
            foreach (MergePropertyMap mergePropertyMap in mergeProvider.MergeMaps)
            {
                if (mergePropertyMap != null)
                {
                    sourceProperties.Add(mergePropertyMap.SourceProperty);
                    targetProperties.Add(mergePropertyMap.TargetProperty);
                }
            }
            if ((fieldLevelSecurityService.GetAccessForProperties((IPersistentEntity) mergeProvider.Source.EntityData, sourceProperties).
                    Values.Any(value => value < FieldAccess.ReadWrite)) ||
                (fieldLevelSecurityService.GetAccessForProperties((IPersistentEntity) mergeProvider.Target.EntityData, targetProperties).
                    Values.Any(value => value < FieldAccess.ReadWrite)))
            {
                throw new ValidationException(GetLocalResourceObject("error_Security_NoAccess").ToString());
            }
        }
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
            RegisterClientScript();
        }
    }

    /// <summary>
    /// Registers the client script.
    /// </summary>
    private void RegisterClientScript()
    {
        StringBuilder sb = new StringBuilder(GetLocalResourceObject("MergeRecords_ClientScript").ToString());
        ScriptManager.RegisterStartupScript(Page, GetType(), "MergeRecords", sb.ToString(), false);
    }

    private static Object GetEntity(Type type, string entityId)
    {
        ISession session = SessionFactoryHolder.HolderInstance.CreateSession();
        try
        {
            StringBuilder hql = new StringBuilder();
            hql.Append(String.Format("Select a From {0} a Where a.Id = :entityId", GetTableName(type)));
            IQuery query = session.CreateQuery(hql.ToString());
            query.SetAnsiString("entityId", entityId);
            return query.UniqueResult();
        }
        catch (Exception ex)
        {
            log.Error(ex.Message);
        }
        return null;
    }

    /// <summary>
    /// Gets the name of the table.
    /// </summary>
    /// <returns></returns>
    private static String GetTableName(Type entity)
    {
        return entity.Name.Substring(1, entity.Name.Length - 1);
    }

    /// <summary>
    /// Creates the record radio button.
    /// </summary>
    /// <param name="context">The context.</param>
    /// <returns></returns>
    protected string CreateRecordRadioButton(string context)
    {
        string radioButton = String.Empty;
        if (SessionMergeProvider != null)
        {
            if (context.Equals("Source"))
            {
                string strChecked = String.Empty;
                if (SessionMergeProvider.RecordOverwrite == MergeOverwrite.sourceWins)
                    strChecked = "checked";
                radioButton =
                    String.Format(
                        "<input type='radio' onclick='onSourceWins()' id='rdoSourceRecordWins' name='rdoRecordOverwrite' value='SourceWins' {0} />",
                        strChecked);
            }
            if (context.Equals("Target"))
            {
                string strChecked = String.Empty;
                if (SessionMergeProvider.RecordOverwrite == MergeOverwrite.targetWins)
                    strChecked = "checked";
                radioButton =
                    String.Format(
                        "<input type='radio' onclick='onTargetWins()' id='rdoTargetRecordWins' name='rdoRecordOverwrite' value='TargetWins' {0} />",
                        strChecked);
            }
        }
        return radioButton;
    }

    /// <summary>
    /// Creates the radio button for each of the configuration properties.
    /// </summary>
    /// <param name="data">The data.</param>
    /// <param name="context">The context.</param>
    /// <returns></returns>
    protected string CreatePropertyRadioButton(object data, string context)
    {
        string radioButton = String.Empty;
        if (data != null)
        {
            MergeRecordView mergeRecordView = data as MergeRecordView;
            if (mergeRecordView != null)
            {
                if (!mergeRecordView.MergeDataOption.Equals(MergeDataOption.DisplayOnly))
                {
                    if (context.Equals("Source"))
                    {
                        string strChecked = String.Empty;
                        if (mergeRecordView.PropertyOverwrite == MergeOverwrite.sourceWins)
                            strChecked = "checked";
                        radioButton =
                            String.Format(
                                "<input type='radio' class='rdoSourceWins' id='rdoSourceWins_{0}' name='rdoMergeOverwrite_{0}' value='SourceWins' {1} />",
                                mergeRecordView.PropertyMapId, strChecked);
                    }
                    if (context.Equals("Target"))
                    {
                        string strChecked = String.Empty;
                        if (mergeRecordView.PropertyOverwrite == MergeOverwrite.targetWins)
                            strChecked = "checked";
                        radioButton =
                            String.Format(
                                "<input type='radio' class='rdoTargetWins' id='rdoTargetWins_{0}' name='rdoMergeOverwrite_{0}' value='TargetWins' {1} />",
                                mergeRecordView.PropertyMapId, strChecked);
                    }
                }
            }
        }
        return radioButton;
    }

    /// <summary>
    /// Handles the Click event of the btnOK control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnOK_Click(object sender, EventArgs e)
    {
        if (SessionMergeProvider != null)
        {
            bool success = false;
            foreach (MergePropertyMap map in SessionMergeProvider.MergeMaps)
            {
                string overWrite = Request.Form["rdoMergeOverwrite_" + map.Name];
                if (overWrite != null)
                {
                    map.MergeOverwrite = overWrite.Equals("SourceWins") ? MergeOverwrite.sourceWins : MergeOverwrite.targetWins;
                }
            }

            string recordOverWrite = Request.Form["rdoRecordOverwrite"];
            if (recordOverWrite != null)
            {
                SessionMergeProvider.RecordOverwrite = recordOverWrite.Equals("SourceWins")
                                                           ? MergeOverwrite.sourceWins
                                                           : MergeOverwrite.targetWins;
            }

            //object[] objarray = new object[] { SessionMergeProvider.Target.EntityData };
            //Sage.Platform.EntityFactory.Execute<type>("Account.MergeAccount", objarray);
            Type type = SessionMergeProvider.Target.EntityType;
            if (type.Equals(typeof(IAccount)))
            {
                IAccount account = (IAccount)SessionMergeProvider.Target.EntityData;
                success = account.MergeAccount(SessionMergeProvider);
            }
            else if (type.Equals(typeof(IContact)))
            {
                IContact contact = (IContact)SessionMergeProvider.Target.EntityData;
                success = contact.MergeContact(SessionMergeProvider);
            }
            if (success)
            {
                using (var session = new SessionScopeWrapper())
                {
                    session.Merge(SessionMergeProvider.Source.EntityData);
                }

                IPersistentEntity source = (IPersistentEntity)GetEntity(type, SessionMergeProvider.Source.EntityId);
                source.Delete();
                EntityService.RemoveEntityHistory(type, source);
                Response.Redirect(String.Format("{0}.aspx", GetTableName(EntityService.EntityType)));
            }
            DialogService.CloseEventHappened(this, null);
        }
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
        foreach (Control c in MergeRecords_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }
}
