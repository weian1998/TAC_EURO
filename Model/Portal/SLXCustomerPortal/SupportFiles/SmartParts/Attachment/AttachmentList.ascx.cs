using System;
using System.Web.UI;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.SmartParts;
using System.ComponentModel;
using Sage.Platform.Orm.Attributes;
using System.Text;

public partial class AttachmentList : SmartPart
{

    [ServiceDependency]
    public IEntityContextService EntityContext { get; set; }

    /// <summary>
    /// Handles the Load event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Load(object sender, EventArgs e)
    {
        var script = new StringBuilder();
        script.AppendLine(@"require([
            'dojo/ready',
            'Sage/UI/AttachmentList'
        ], function (ready, AttachmentList) {");

        var baseScript = string.Format(
                "window.setTimeout(function() {{ var a = new AttachmentList({{ 'workspace': '{0}', 'tabId': '{1}', 'placeHolder': '{2}', 'parentRelationshipName': '{3}' }}); a.startup(); }}, 1);",
                getMyWorkspace(),
                ID,
                AttachmentList_Grid.ClientID,
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
        var propertyDescriptor = TypeDescriptor.GetProperties(typeof(IAttachment)).Find(string.Concat(GetRealTableName(entity), "Id"), true) ??
                                 TypeDescriptor.GetProperties(typeof(IAttachment)).Find(string.Concat(entity.Name.Substring(1), "Id"), true);
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
