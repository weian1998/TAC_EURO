<%@ Application Language="C#" %>
<%@ Import Namespace="System.IO" %>
<%@ Import Namespace="System.Reflection" %>
<%@ Import Namespace="log4net" %>
<%@ Import Namespace="log4net.Config" %>
<%@ Import Namespace="Sage.Platform.Application.UI.Web" %>
<%@ Import Namespace="Sage.Platform.Process" %>

<script runat="server">

    static readonly ILog Log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

    void Application_Start(object sender, EventArgs e)
    {
        string path = Server.MapPath("~/log4net.config");
        XmlConfigurator.Configure(new FileInfo(path));

        ApplicationContextAccessor.Initialize(HttpRuntime.AppDomainAppPath, "application-thread");

        HierarchicalRuntime.Instance.Initialize();
    }

    void Application_End(object sender, EventArgs e)
    {
        WorkflowProcessManagerService.ShutdownProcessHost();
    }

    void Application_Error(object sender, EventArgs e)
    {
        Exception oLastException = Server.GetLastError();
        if (oLastException != null)
        {
            Exception oException = oLastException.GetBaseException();
            Log.Error("Unhandled exception.", oException);
            Server.ClearError();
        }
    }

    void Session_Start(object sender, EventArgs e)
    {
        HierarchicalRuntime.Instance.EnsureSessionWorkItem();
    }

    void Session_End(object sender, EventArgs e)
    {
        HierarchicalRuntime.Instance.TerminateSessionWorkItem(Session);
    }

</script>