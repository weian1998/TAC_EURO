using System;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.AppIdMapping;

public partial class Matching : EntityBoundSmartPartInfoProvider
{
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
        var script = new StringBuilder();
        script.AppendLine("require(['Sage/MainView/IntegrationContract/MatchingOptionsConfig', 'dojo/ready'],");
        script.AppendLine(" function(matchingOptionsConfig, dojoReady) {");
        script.AppendLine("     dojoReady(function() {window.matchingOptionsConfig = new Sage.MainView.IntegrationContract.MatchingOptionsConfig();");
        script.AppendLine("         window.matchingOptionsConfig.init(" + GetWorkSpace() + ");");
        script.AppendLine("     });");
        script.AppendLine(" });");
        ScriptManager.RegisterStartupScript(Page, GetType(), "MatchingOptionsConfig", script.ToString(), true);
    }

    private string GetWorkSpace()
    {
        StringBuilder sb = new StringBuilder();
        sb.Append("{");
        sb.AppendFormat("Id:'{0}',", ID);
        sb.AppendFormat("clientId:'{0}',", ClientID);
        sb.Append("}");
        return sb.ToString();
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
}