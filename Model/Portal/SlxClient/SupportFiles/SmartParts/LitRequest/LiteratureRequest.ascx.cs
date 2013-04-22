using System;
using System.Collections.Generic;
using Sage.Platform;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using System.Web.UI;
using Sage.SalesLogix.Client.GroupBuilder;
using Sage.Common.Syndication.Json;
using Sage.Platform.Repository;
using Sage.SalesLogix.Plugins;

// ReSharper disable CheckNamespace
// ReSharper disable InconsistentNaming

/// <summary>
/// Schedule Literature Request screen
/// </summary>
public partial class SmartParts_LitRequest_LiteratureRequest : UserControl, ISmartPartInfoProvider
{
    static readonly log4net.ILog Log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

    protected override void OnPreRender(EventArgs e)
    {
        base.OnPreRender(e);

        var bMultiCurrencyEnabled = Sage.SalesLogix.BusinessRules.BusinessRuleHelper.IsMultiCurrencyEnabled();
        var oSystemInfo =
            Sage.Platform.Application.ApplicationContext.Current.Services.Get
                <Sage.SalesLogix.Services.ISystemOptionsService>(true);
        var sBaseCurrency = oSystemInfo.BaseCurrency;

        ScriptManager.RegisterClientScriptInclude(this, GetType(), "LiteratureRequest_js", "SmartParts/LitRequest/LiteratureRequest.js");
        SelectDefaultContact();
        PopulateGroupList();
        // defaults for new requests
        var options = new { Options = 0, baseCurrency = sBaseCurrency, multiCurrencyEnabled = bMultiCurrencyEnabled };
        ScriptManager.RegisterStartupScript(this, GetType(), "LiteratureRequestInit",
            String.Format(@"dojo.ready(function() {{ setTimeout(function() {{
                new LitRequest.LiteratureRequestForm('{0}_', {1}); 
            }}, 1) }});", ClientID, JsonConvert.SerializeObject(options)),
            true);
    }

    private void PopulateGroupList()
    {
        IList<Plugin> pluginList = PluginManager.GetPluginList(PluginType.ACOGroup, "CONTACT", true, false);
        foreach (var group in pluginList)
        {
            if (!string.IsNullOrEmpty(group.DisplayName))
                group.Name = group.DisplayName;
        }
        ddlContactGroup.DataSource = pluginList;
        ddlContactGroup.DataTextField = "Name";
        ddlContactGroup.DataValueField = "PluginId";
        ddlContactGroup.DataBind();
        GroupContext ctx = GroupContext.GetGroupContext();
        if (ctx != null && !string.IsNullOrEmpty(ctx.CurrentTable) &&
            ctx.CurrentTable.ToUpperInvariant().Equals("CONTACT"))
        {
            try
            {
                ddlContactGroup.SelectedValue = ctx.CurrentGroupID;
            }
            catch (Exception e)
            {              
                Log.WarnFormat("Unable to set Contact group dropdown list to group {0}. {1}", ctx.CurrentGroupID, e);
            }
        }
    }

    private void SelectDefaultContact()
    {
        var history = ApplicationContext.Current.Services.Get<IEntityHistoryService>();
        if (history.Count > 0)
        {
            var histItem = history[0];
            if (histItem.EntityType == typeof(IContact))
            {
                optRequestForContact.Checked = true; // XXX this is not working at the moment
                lueContactResult.Value = (String)histItem.EntityId;
                lueContact.Text = histItem.Description;
            }
            else if (histItem.EntityType == typeof(IOpportunity))
            {
                optRequestForOpportunity.Checked = true;
                lueOpportunity.Text = histItem.Description;
                lueOpportunityResult.Value = (String)histItem.EntityId;
            }
            else if (histItem.EntityType == typeof(IAccount))
            {
                var repo = (IQueryable)EntityFactory.GetRepository<IContact>();
                IExpressionFactory ef = repo.GetExpressionFactory();
                ICriteria crit = repo.CreateCriteria()
                    .Add(ef.Eq("Account.Id", histItem.EntityId))
                    .Add(ef.Eq("IsPrimary", true))
                    .SetMaxResults(1);
                var res = crit.List<IContact>();
                if (res.Count > 0)
                {
                    optRequestForContact.Checked = true;
                    lueContactResult.Value = (String)res[0].Id;
                    lueContact.Text = res[0].FullName;
                }
            }
            else if (histItem.EntityType == typeof(ITicket))
            {
                IContact contact = EntityFactory.GetById<ITicket>(histItem.EntityId).Contact;
                if (contact != null)
                {
                    optRequestForContact.Checked = true;
                    lueContactResult.Value = (String)contact.Id;
                    lueContact.Text = contact.FullName;
                }
            }
        }
    }


    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        var tinfo = new Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo();
        foreach (Control c in LitRequest_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }
}