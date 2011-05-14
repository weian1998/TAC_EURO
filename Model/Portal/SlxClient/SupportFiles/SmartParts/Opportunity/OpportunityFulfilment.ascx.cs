using System;
using System.Collections;
using System.Data;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform;
using Sage.Entity.Interfaces;
using Sage.Platform.Application.UI;
using Sage.Platform.Security;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.Data;
using Sage.Platform.Repository;
using log4net;
using Sage.Platform.Application;
using NHibernate;
using Sage.Platform.Framework;
using System.Text;
using System.Data.OleDb;

public partial class SmartParts_Opportunity_OpportunityFulfilment : EntityBoundSmartPartInfoProvider
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }
    #region ISmartPartInfoProvider Members

    /// <summary>
    /// Tries to retrieve smart part information compatible with type
    /// smartPartInfoType.
    /// </summary>
    /// <param name="smartPartInfoType">Type of information to retrieve.</param>
    /// <returns>
    /// The <see cref="T:Sage.Platform.Application.UI.ISmartPartInfo"/> instance or null if none exists in the smart part.
    /// </returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        //foreach (Control c in Responses_RTools.Controls)
        //{
        //    tinfo.RightTools.Add(c);
        //}
        return tinfo;
    }
    public override Type EntityType
    {
        get { return typeof(IOpportunity); }
    }

    protected override void OnAddEntityBindings()
    {
        //throw new NotImplementedException();
    }
    /// <summary>
    /// Derived components should override this method to wire up event handlers.
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        //DialogService.onDialogClosing += new Sage.Platform.WebPortal.Services.dlgClosing(DialogService_onDialogClosing);
    }
    #endregion

}
