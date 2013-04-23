using System;
using System.Web;
using System.Web.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Entity.Interfaces;
using System.ComponentModel;
using Sage.Platform.Application;
using Sage.Platform.Orm.Attributes;
using System.Text;

public partial class SmartParts_Activity_ActivityList : SmartPart
{
    [ServiceDependency]
    public IEntityContextService EntityContext { get; set; }

    protected void Page_Load(object sender, EventArgs e)
    {
        var script = new StringBuilder();
        script.AppendLine(@"require([
            'dojo/ready',
            'Sage/UI/ActivityList'
        ], function (ready, ActivityList) {");
       
        string baseScript = string.Format(
                  "window.setTimeout( function() {{ var a = new ActivityList({{ 'workspace': '{0}', 'tabId': '{1}', 'placeHolder': '{2}', 'parentRelationshipName': '{3}' }}); a.startup(); }}, 1);",
                  getMyWorkspace(),
                  ID,
                  activityGridPlaceholder.ClientID,
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
        ScriptManager.RegisterStartupScript(this, GetType(), "AttachmentList", script.ToString(), true);
    }


    
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