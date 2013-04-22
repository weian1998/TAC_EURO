<%@ Application Language="C#" %>
<%@ Import Namespace="System.IO" %>
<%@ Import Namespace="System.Reflection" %>
<%@ Import Namespace="log4net" %>

<%-- ReSharper disable SuggestUseVarKeywordEvident --%>

<script runat="server">
    
    private static readonly ILog Log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

    private const string SalesLogixErrorId = "SalesLogix Error Id"; //DNL
    
    #region Application

    void Application_Start(object sender, EventArgs e) 
    {
        string sConfigFile = Server.MapPath("~/log4net.config");
        log4net.Config.XmlConfigurator.Configure(new FileInfo(sConfigFile));
                
        Log.Info("SalesLogix Web Reporting started.");        
    }
    
    void Application_End(object sender, EventArgs e) 
    {
        Log.Info("SalesLogix Web Reporting ended.");
    }
        
    void Application_Error(object sender, EventArgs e) 
    {
        Exception exception = Server.GetLastError();
        if (exception == null) return;
        
        string sSlxErrorId = GetNewLoggingId();                       
                
        Log.Error(AppendSlxErrorId("SalesLogix Web Reporting unhandled exception", sSlxErrorId), exception);

        exception = exception.GetBaseException();

        Server.ClearError();

        StringBuilder builder = new StringBuilder();

        string sUrl = HttpUtility.UrlDecode(Request.Url.ToString());

        if (IsDevelopmentContext())
        {
            builder.AppendLine(exception.Message);
            builder.AppendLine();
            builder.AppendLine(string.Format(Resources.Global.SalesLogixErrorId, sSlxErrorId));
            builder.AppendLine();
            builder.AppendLine(string.Format(Resources.Global.ExceptionURL, sUrl));
            builder.AppendLine();
            builder.AppendLine(string.Format(Resources.Global.ExceptionType, exception.GetType()));
            builder.AppendLine();
            builder.AppendLine(string.Format(Resources.Global.ExceptionSource, GetSource(exception)));
            builder.AppendLine();
            if (!string.IsNullOrEmpty(exception.StackTrace))
            {
                builder.AppendLine(string.Format(Resources.Global.ExceptionStackTrace, exception.StackTrace.Trim()));
                builder.AppendLine();
            }
            if (exception.TargetSite != null)
            {
                builder.AppendLine(string.Format(Resources.Global.ExceptionTargetSite, exception.TargetSite));
            }
        }
        else
        {
            builder.AppendLine(Resources.Global.WereSorryMsg);
            builder.AppendLine();
            builder.AppendLine(string.Format(Resources.Global.SalesLogixErrorId, sSlxErrorId));
            builder.AppendLine();
            builder.AppendLine(string.Format(Resources.Global.ExceptionURL, sUrl));
        }        
   
        if (LooksLikeAjaxRequest())
        {
            Response.ClearHeaders();
            Response.ClearContent();
            Response.Clear();
            Response.StatusCode = 576;
            Response.StatusDescription = "AjaxErrorResponse"; //DNL
            Response.TrySkipIisCustomErrors = true;
            // NOTE: AppendHeader() must be used for IIS6 instead of Response.Headers.Add()
            Response.AppendHeader(SalesLogixErrorId, sSlxErrorId);
            Response.ContentType = "text/plain";                                  
            Response.Write(builder.ToString().Trim());            
        }
        else
        {
            Session[sSlxErrorId] = builder.ToString();
            Response.TrySkipIisCustomErrors = true;
            Response.Redirect(string.Format("ErrorPage.aspx?errorId={0}", sSlxErrorId));         
        }

        HttpApplication application = sender as HttpApplication;        
        if (application != null)
        {
            application.CompleteRequest();
        }
    }

    #endregion

    #region Session

    void Session_Start(object sender, EventArgs e) 
    {
        Log.Info("SalesLogix Web Reporting session start.");
    }

    void Session_End(object sender, EventArgs e) 
    {
        Log.Info("SalesLogix Web Reporting session end.");
    }

    #endregion

    #region Private

    string AppendSlxErrorId(string source, string slxErrorId)
    {
        return source + string.Format(" [{0}={1}]", SalesLogixErrorId, slxErrorId);
    }

    public string GetNewLoggingId()
    {
        byte[] bytes = Guid.NewGuid().ToByteArray();
        return "SLX" + (BitConverter.ToInt64(bytes, 0) ^ BitConverter.ToInt64(bytes, 8)).ToString("X");
    }

    public string GetSource(Exception exception)
    {
        MethodBase targetSite = exception.TargetSite;
        Type type = null;
        if (targetSite != null)
        {
            type = targetSite.DeclaringType;
        }
        return (IsDevelopmentContext())
                   ? type != null
                         ? type.AssemblyQualifiedName
                         : exception.Source
                   : type != null
                         ? type.FullName
                         : exception.Source;
    }

    bool IsDevelopmentContext()
    {
        bool bDebuggingEnabled = HttpContext.Current != null && HttpContext.Current.IsDebuggingEnabled;        
        return (Request.IsLocal || bDebuggingEnabled || System.Diagnostics.Debugger.IsAttached);
    }
    
    bool LooksLikeAjaxRequest()
    {
        string sRequestedWith = Request.Headers["X-Requested-With"];
        return !string.IsNullOrEmpty(sRequestedWith) &&
               string.Compare(sRequestedWith, "XMLHttpRequest", StringComparison.InvariantCultureIgnoreCase) == 0;
    }

    #endregion          

</script>

<%-- ReSharper restore SuggestUseVarKeywordEvident --%>
