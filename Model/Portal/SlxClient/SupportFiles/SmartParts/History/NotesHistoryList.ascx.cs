using System;
using System.Web.UI;
using Sage.Platform.Application;
using Sage.Platform.Orm.Attributes;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Entity.Interfaces;
using System.ComponentModel;
using System.Text;

public partial class SmartParts_History_NotesHistoryList : SmartPart
{
    [ServiceDependency]
    public IEntityContextService EntityContext { get; set; }

    protected void Page_Load(object sender, EventArgs e)
    {
        var script = new StringBuilder();
        script.AppendLine(@"require([
            'dojo/ready',
            'Sage/UI/NotesHistoryList'        
        ], function (ready, NotesHistoryList) {");

        string baseScript = string.Format(
                  "window.setTimeout( function() {{ var a = new NotesHistoryList({{ 'workspace': '{0}', 'tabId': '{1}', 'placeHolder': '{2}', 'parentRelationshipName': '{3}' }}); a.startup(); }}, 1);",
                  getMyWorkspace(),
                  ID,
                  historyGridPlaceholder.ClientID,
                  GetParentRelationshipName(EntityContext.EntityType));


        if (!Page.IsPostBack)
        {
            script.AppendFormat("ready(function() {{ {0}; }} );", baseScript);
        }
        else
        {
            script.AppendLine(baseScript);
        }

        script.AppendLine("});");// end require
        ScriptManager.RegisterStartupScript(this, GetType(), "NotesHistoryList", script.ToString(), true);
    }

    ///// <summary>
    ///// Parent relationship name to use for context condition
    ///// </summary>
    ///// <returns></returns>
    private string GetParentRelationshipName(Type entity)
    {
        var propertyDescriptor = TypeDescriptor.GetProperties(typeof(IActivity)).Find(string.Concat(GetRealTableName(entity), "Id"), true);
        return propertyDescriptor != null ? propertyDescriptor.Name : string.Empty;
    }
    /// <summary>
    /// Helper method to retrieve the physical table name from the entity metadata
    /// </summary>
    /// <param name="entity"></param>
    /// <returns></returns>
    private static string GetRealTableName(Type entity)
    {
        if (Attribute.IsDefined(entity, typeof(ActiveRecordAttribute)))
        {
            ActiveRecordAttribute attribute = (ActiveRecordAttribute)Attribute.GetCustomAttribute(entity, typeof(ActiveRecordAttribute));
            return attribute.Table;
        }
        return string.Empty;
    }
}