using System;
using System.Collections.Generic;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Common.Syndication.Json;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.AppIdMapping;

public partial class Matching : EntityBoundSmartPartInfoProvider, IScriptControl
{
    private MatchingConfigScript _matchingConfigScript;

    /// <summary>
    /// Gets or sets the role security service.
    /// </summary>
    /// <value>The role security service.</value>
    [ServiceDependency]
    public IRoleSecurityService RoleSecurityService { get; set; }

    public class MatchingConfigScript
    {
        /// <summary>
        /// Gets or sets the page Id.
        /// </summary>
        /// <value>The Id of the page.</value>
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("clientId")]
        public string ClientId { get; set; }

        [JsonProperty("resourceTypeName")]
        public object ResourceTypeName { get; set; }

        [JsonProperty("resourceDisplayName")]
        public object ResourceDisplayName { get; set; }

        /// <summary>
        /// Froms the specified page.
        /// </summary>
        /// <param name="page">The page.</param>
        /// <returns></returns>
        public static MatchingConfigScript Initialize(Matching page)
        {
            MatchingConfigScript matchingConfigScript = new MatchingConfigScript();
            matchingConfigScript.Id = page.ID;
            matchingConfigScript.ClientId = page.ClientID;
            return matchingConfigScript;
        }
    }

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"/> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"/> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        InitializeScript();
        grdMatches.DataSource = Rules.GetResourceConfigurations();
        grdMatches.DataBind();
    }

    private void InitializeScript()
    {
        if (_matchingConfigScript == null)
        {
            _matchingConfigScript = MatchingConfigScript.Initialize(this);
        }

        StringBuilder script = new StringBuilder();
        script.AppendFormat("SmartParts.AppIdMapping.Matching.create('{0}', {1});", ID, JsonConvert.SerializeObject(_matchingConfigScript));

        ScriptManager.RegisterStartupScript(Page, typeof (Page), "Matching", script.ToString(), true);
        ScriptManager.GetCurrent(Page).RegisterScriptControl(this);
    }

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(IAppIdMapping); }
    }

    protected override void OnAddEntityBindings()
    {
    }

    /// <summary>
    /// Handles the RowEditing event of the grdMatches control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewEditEventArgs"/> instance containing the event data.</param>
    protected void grdMatches_RowEditing(object sender, GridViewEditEventArgs e)
    {
        grdMatches.SelectedIndex = e.NewEditIndex;
    }

    #region ISmartPartInfoProvider Members

    /// <summary>
    /// Tries to retrieve smart part information compatible with type smartPartInfoType.
    /// </summary>
    /// <param name="smartPartInfoType">Type of information to retrieve.</param>
    /// <returns>
    /// The <see cref="T:Sage.Platform.Application.UI.ISmartPartInfo"/> instance or null if none exists in the smart part.
    /// </returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in Matching_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    #endregion

    public IEnumerable<ScriptDescriptor> GetScriptDescriptors()
    {
        yield break;
    }

    public IEnumerable<ScriptReference> GetScriptReferences()
    {
        yield return new ScriptReference("~/SmartParts/AppIdMapping/Matching_ClientScript.js");
    }
}