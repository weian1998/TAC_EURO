using System;
using System.Web.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Entity.Interfaces;
using System.Resources;
using System.Reflection;
using System.ComponentModel;
using System.Text;
using Sage.Platform.WebPortal.Services;
using Sage.SalesLogix.Web.Controls;

public partial class SmartParts_History_NotesHistoryList : EntityBoundSmartPartInfoProvider
{
    public override Type EntityType
    {
        get { return EntityPage.EntityContext.EntityType; }
    }

    protected override void OnAddEntityBindings()
    {
        // nothing to do
    }


    protected override void OnFormBound()
    {
        base.OnFormBound();
        ScriptManager.RegisterClientScriptInclude(this, GetType(), "NotesHistoryList", 
            Page.ResolveUrl("~/SmartParts/History/NotesHistoryList.js"));

        var ccs = PageWorkItem.Services.Get<ClientContextService>();
        if (!ccs.CurrentContext.ContainsKey("HistoryTypeMap"))
        {
            ccs.CurrentContext["HistoryTypeMap"] = Server.HtmlEncode(BuildHistoryTypeMap());
        }


        var script =
            String.Format(
                @"window.setTimeout(function() {{ Sage.UI.Forms.HistoryList.init('{0}', 
                    function() {{ return '{2} eq \'' + Sage.Utility.getCurrentEntityId() + '\''; }}, 
                    {{ workspace: '{1}', tabId: '{3}' }}); }}, 1);",
                placeholder.ClientID, getMyWorkspace(), GetParentField(), ID);
                
        if (!Page.IsPostBack)
        {
            script = string.Format("dojo.ready(function() {{ {0} }});", script);
        }
        ScriptManager.RegisterStartupScript(this, GetType(), "HistoryList_Init", script, true);
    }

    /// <summary>
    /// Parent field to use for context condition, for example, "ContactId"
    /// </summary>
    /// <returns></returns>
    private String GetParentField()
    {
        switch (EntityType.Name)
        {
            case "IAccount":
                return "AccountId";
            case "IContact":
                return "ContactId";
            case "ITicket":
                return "TicketId";
            case "ILead":
                return "LeadId";
            case "IOpportunity":
                return "OpportunityId";
            default:
                throw new NotImplementedException(string.Format("Entity type {0} is not supported", EntityType));
        }
    }

    /// <summary>
    /// Build a string representing a javascript object giving the mapping from the history type 
    /// (as returned by sdata, i.e., atDatabaseChange, etc) to the localized description (e.g. "Database Change").
    /// </summary>
    /// <returns></returns>
    private String BuildHistoryTypeMap_old()
    {
        var rm = new ResourceManager("Sage.Entity.Interfaces.EntityResources", typeof(HistoryType).Assembly);
        StringBuilder buf = new StringBuilder();        

        buf.Append('{');
        foreach (FieldInfo fi in typeof(HistoryType).GetFields(BindingFlags.Public | BindingFlags.Static))
        {
            if(buf.Length != 1)
                buf.Append(',');
            object[] attrs = fi.GetCustomAttributes(typeof(DisplayNameAttribute), false);

            if (attrs != null && attrs.Length == 1)
            {
                String v = rm.GetString(((DisplayNameAttribute)attrs[0]).DisplayName);
                if (v == null)
                    v = ((DisplayNameAttribute)attrs[0]).DisplayName;
                buf.Append(v);
            }
            else
            {
                buf.Append(fi.Name);
            }
            buf.Append('\'');
        }
        buf.Append('}');

        return buf.ToString();
    }
    private string BuildHistoryTypeMap()
    {
        var rm = new ResourceManager("Sage.Entity.Interfaces.EntityResources", typeof (HistoryType).Assembly);
        var buf = new StringBuilder();

        foreach (FieldInfo fi in typeof(HistoryType).GetFields(BindingFlags.Public | BindingFlags.Static))
        {
            if (buf.Length != 0)
            {
                buf.Append(",");
            }
            buf.Append(fi.Name).Append(":");
            object[] attrs = fi.GetCustomAttributes(typeof(DisplayNameAttribute), false);

            if (attrs.Length == 1)
            {
                String v = rm.GetString(((DisplayNameAttribute)attrs[0]).DisplayName) ??
                           ((DisplayNameAttribute)attrs[0]).DisplayName;
                buf.Append(v);
            }
            else
            {
                buf.Append(fi.Name);
            }
        }
        return buf.ToString();
    }

    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        var spi = new ToolsSmartPartInfo();
        var ttobj = GetGlobalResourceObject("Portal", "Help_ToolTip");
        var tt = (ttobj != null) ? ttobj.ToString() : "Help";
        spi.RightTools.Add(new PageLink
                {
                    ID = "NotesHistoryHelp",
                    LinkType = enumPageLinkType.HelpFileName,
                    ToolTip = tt,
                    Target = "MCWebHelp",
                    NavigateUrl = "noteshistory",
                    ImageUrl =
                        ResolveUrl("~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16")
                });
        return spi;
    }
}