using System;
using System.Web.UI;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.UI;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Services;
using Sage.SalesLogix.Services.Integration;

public partial class LinkResults : EntityBoundSmartPartInfoProvider
{
    private IntegrationManager _integrationManager;
    /// <summary>
    /// Gets the integration manager.
    /// </summary>
    /// <value>The integration manager.</value>
    public IntegrationManager IntegrationManager
    {
        get
        {
            if (_integrationManager == null)
            {
                if (DialogService.DialogParameters.ContainsKey("IntegrationManager"))
                {
                    _integrationManager = (DialogService.DialogParameters["IntegrationManager"]) as IntegrationManager;
                }
                else
                {
                    ISessionService sessionService = ApplicationContext.Current.Services.Get<ISessionService>(true);
                    ISessionState sessionState = sessionService.GetSessionState();
                    _integrationManager = (IntegrationManager)sessionState["IntegrationManager"];
                }
            }
            return _integrationManager;
        }
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        if (String.IsNullOrEmpty(IntegrationManager.LinkAccountError))
        {
            lblLinkResults.Text = GetLocalResourceObject("lblResultsSuccess.Caption").ToString();
            lblResultsMsg.Text = String.Format(GetLocalResourceObject("lblResultsSuccessMsg.Caption").ToString(),
                                                IntegrationManager.SourceAccount.AccountName,
                                                IntegrationManager.TargetMapping.Name);
            rowEmail.Visible = false;
        }
        else
        {
            lblLinkResults.Text = GetLocalResourceObject("lblResultsError.Caption").ToString();
            lblResultsMsg.Text = IntegrationManager.LinkAccountError;
        }
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

    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        btnClose.Click += new EventHandler(DialogService.CloseEventHappened);
    }

    /// <summary>
    /// Sends an email to the system administrator containing the error message.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void SendEmail(object sender, EventArgs e)
    {
        try
        {
            string emailTo = String.Empty;
            var adminUser = EntityFactory.GetById<IUser>("ADMIN      ");
            if (adminUser != null)
            {
                emailTo = adminUser.UserInfo.Email;
            }
            string subject =
                PortalUtil.JavaScriptEncode(String.Format(GetLocalResourceObject("error_LinkingAccount").ToString(),
                                                          IntegrationManager.SourceAccount.AccountName));
            string emailBody =
                PortalUtil.JavaScriptEncode(IntegrationManager.LinkAccountError).Replace(Environment.NewLine, "%0A");
            ScriptManager.RegisterStartupScript(this, GetType(), "emailscript",
                                                string.Format(
                                                    "<script type='text/javascript'>window.location.href='mailto:{0}?subject={1}&body={2}';</script>",
                                                    emailTo, subject, emailBody), false);
        }
        catch (Exception ex)
        {
            log.Error(ex.Message);
        }
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in LinkResults_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }
}