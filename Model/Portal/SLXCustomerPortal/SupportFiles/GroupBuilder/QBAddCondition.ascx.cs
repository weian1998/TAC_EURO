using System;
using System.Text;

namespace Sage.SalesLogix.Client.GroupBuilder
{
	/// <summary>
	/// Summary description for QBAddCondition.
	/// </summary>
    public partial class QBAddCondition : SlxUserControlBase
    {
        protected override void LoadImages()
        {
            // QBAddConditionHeader.Src = Page.ClientScript.GetWebResourceUrl(typeof(SlxUserControlBase), "Sage.SalesLogix.Client.GroupBuilder.images.help.gif");
        }

		protected void Page_Load(object sender, EventArgs e)
        {
            LoadImages();
            RegisterClientScripts();
		}

        protected override void RegisterClientScripts()
        {
            base.RegisterClientScripts();

            //scripts
            if (!Page.ClientScript.IsClientScriptBlockRegistered("QBAddCondition"))
            {
                string vScript = ScriptHelper.UnpackEmbeddedResourceToString("jscript.QBAddCondition.js");
                StringBuilder vJS = new StringBuilder(vScript);

                vJS.Replace("@DateValueClientID", DateValue.ClientID + "_TXT");
                vJS.Replace("@DateValueFormat", DateValue.DateFormat);

                Page.ClientScript.RegisterClientScriptBlock(GetType(), "QBAddCondition", vJS.ToString(), true);
            }
        }
	}
}