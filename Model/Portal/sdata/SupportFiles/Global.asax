<%@ Application Language="C#" %>
<%@ Import Namespace="System.IO" %>
<%@ Import Namespace="System.Net" %>
<%@ Import Namespace="System.Reflection" %>
<%@ Import Namespace="Sage.Common.Syndication" %>
<%@ Import Namespace="Sage.Platform.Application" %>
<%@ Import Namespace="Sage.Platform.Application.Diagnostics" %>
<%@ Import Namespace="log4net" %>
<%@ Import Namespace="log4net.Config" %>
<%@ Import Namespace="Sage.Integration.Messaging" %>
<%@ Import Namespace="Sage.Platform.Application.UI.Web" %>
<%@ Import Namespace="Sage.Platform.Diagnostics" %>
<%@ Import Namespace="Sage.Platform.Utility" %>

<script runat="server">

    //#define EnableNHibernateProfiler

    private static readonly ILog Log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

    private void Application_Start(object sender, EventArgs e)
    {
        try
        {
            var path = Server.MapPath("~/log4net.config");
            XmlConfigurator.Configure(new FileInfo(path));

#if EnableNHibernateProfiler
        HibernatingRhinos.Profiler.Appender.NHibernate.NHibernateProfiler.Initialize();
#endif

            MessagingService.UnhandledException += MessagingServiceOnUnhandledException;

            HierarchicalRuntime.Instance.Initialize();

            Log.InfoEx("SalesLogix SData Portal started.", EventIds.AdHocEvents.InfoApplicationStart);

        }
        catch (Exception ex)
        {
            Log.ErrorEx("There was an error in Application_Start()", EventIds.AdHocEvents.ErrApplicationStart, ex);
            throw; // Re-throw
        }
    }

    private void Application_End(object sender, EventArgs e)
    {
        try
        {
            MessagingService.UnhandledException -= MessagingServiceOnUnhandledException;
        }
        catch (Exception ex)
        {
            Log.WarnEx("There was an error in Application_End()", EventIds.AdHocEvents.WarnApplicationEnd, ex);
        }

        Log.InfoEx("SalesLogix SData Portal ended.", EventIds.AdHocEvents.InfoApplicationEnd);
    }

    private void Application_Error(object sender, EventArgs e)
    {
        Exception fullException = null;
        var logged = false;
        string sSlxErrorId = null;

        try
        {
            var exception = Server.GetLastError();
            if (exception == null) return;

            fullException = exception;

            var eKind = ErrorHelper.GetTargetedException(fullException, out exception);
            var eMitigationType = ErrorHelper.GetMitigationType(eKind, Request);
            sSlxErrorId = ErrorHelper.GetNewLoggingId();

            // Note: Just the act of accessing the Session object (e.g. Session.*) can throw an
            // HttpException in certain scenarios with the message "Session state is not available in this context."
            // IsAuthenticated() relies on access to the current Session.
            var session = ErrorHelper.GetCurrentHttpSessionState(this);
            if (session != null && IsAuthenticated() == false)
            {
                var eLoginMitigationType = ErrorHelper.LooksLikeAjaxRequest(Request)
                                               ? ErrorHelper.MitigationType.AjaxLoginRedirect
                                               : ErrorHelper.MitigationType.LoginRedirect;
                if (eMitigationType != eLoginMitigationType)
                {
                    Log.WarnFormat(
                        "The current user is not authenticated. Switching from a mitigation of {0} ({1}) to {2} ({3}).",
                        eMitigationType, (int) eMitigationType, eLoginMitigationType, (int) eLoginMitigationType);
                    eMitigationType = eLoginMitigationType;
                }
            }

            var diagnosis = new Diagnosis
                {
                    Severity = Severity.Error,
                    ApplicationCode = string.Empty,
                    Message = exception.Message,
                    PayloadPath = string.Empty,
                    SDataCode = DiagnosisCode.ApplicationDiagnosis,
                    StackTrace = exception.StackTrace
                };
            DiagnosesException diagnosesException;

            // Mitigate the scenario
            switch (eMitigationType)
            {
                case ErrorHelper.MitigationType.LoginRedirect:
                case ErrorHelper.MitigationType.AjaxLoginRedirect:

                    // Abandon the Session
                    if (session != null)
                    {
                        session.Abandon();
                    }

                    diagnosesException = new DiagnosesException(diagnosis, HttpStatusCode.Forbidden, fullException);
                    ErrorHelper.LogDiagnosesException(diagnosesException, Request, Log, sSlxErrorId, "SalesLogix SData Portal unhandled exception");
                    logged = true;
                    Server.ClearError();

                    Response.ClearHeaders();
                    Response.ClearContent();
                    Response.Clear();
                    Response.StatusCode = (int) HttpStatusCode.Forbidden;
                    Response.StatusDescription = exception.Message;
                    Response.TrySkipIisCustomErrors = true;
                    // NOTE: AppendHeader() must be used for IIS6 instead of Response.Headers.Add()
                    Response.AppendHeader(ErrorHelper.ErrorIdHttpHeader, sSlxErrorId);
                    ProcessDiagnosesResponse(diagnosesException.Diagnoses);
                    break;

                default:

                    if (eMitigationType == ErrorHelper.MitigationType.ErrorContent)
                    {
                        var path = Request.AppRelativeCurrentExecutionFilePath;
                        if (!string.IsNullOrEmpty(path) && ((path == "~/" || path.EndsWith("Default.aspx", StringComparison.OrdinalIgnoreCase))))
                        {
                            diagnosesException = new DiagnosesException(diagnosis, HttpStatusCode.InternalServerError, fullException);
                            ErrorHelper.LogDiagnosesException(diagnosesException, Request, Log, sSlxErrorId, "SalesLogix SData Portal unhandled exception");
                            logged = true;
                            Server.ClearError();

                            Response.ClearHeaders();
                            Response.ClearContent();
                            Response.Clear();
                            Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                            Response.StatusDescription = ErrorHelper.InternalServerError;
                            Response.TrySkipIisCustomErrors = true;
                            // NOTE: AppendHeader() must be used for IIS6 instead of Response.Headers.Add()
                            Response.AppendHeader(ErrorHelper.ErrorIdHttpHeader, sSlxErrorId);
                            Response.ContentType = "text/html";                       
                            // This service portal only contains one page: Default.aspx; if the error is from this page then send
                            // back the error to that page, otherwise, send the error as an HTTP response.
                            var oErrorMessage = ErrorHelper.GetErrorMessage(exception, Request, eKind, sSlxErrorId, true, true,
                                                                            null, Request.Url.ToString(),
                                                                            true, ErrorHelper.LogMode.Client, false,
                                                                            null, true);
                            Response.Write(string.Format("<html><body>{0}</body></html>",
                                                         oErrorMessage.ToString(MessageProperty.FormatType.HtmlEncoded)));
                            return;
                        }
                        // else, since this is a service portal we're going to assume that the request is not from a page.
                        // An aspx can be used to expose an HTTP handler, so we cannot make assumptions regarding the path
                        // and we cannot depend on the XMLHttpRequest header always existing for a service portal HTTP request
                        // (the request itself may be coming from the server rather than a client, etc.).
                        eMitigationType = ErrorHelper.MitigationType.ErrorResponse;
                    }

                    diagnosesException = new DiagnosesException(diagnosis, HttpStatusCode.InternalServerError, fullException);
                    ErrorHelper.LogDiagnosesException(diagnosesException, Request, Log, sSlxErrorId, "SalesLogix SData Portal unhandled exception");
                    logged = true;
                    Server.ClearError();

                    Response.ClearHeaders();
                    Response.ClearContent();
                    Response.Clear();
                    Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                    Response.StatusDescription = string.Format("{0} - {1}", ErrorHelper.InternalServerError, eMitigationType);
                    Response.TrySkipIisCustomErrors = true;
                    // NOTE: AppendHeader() must be used for IIS6 instead of Response.Headers.Add()
                    Response.AppendHeader(ErrorHelper.ErrorIdHttpHeader, sSlxErrorId);
                    ProcessDiagnosesResponse(diagnosesException.Diagnoses);
                    break;
            }

            CompleteRequest();
        }
        catch (Exception ex)
        {
            Log.ErrorEx("There was an error in Application_Error()", EventIds.AdHocEvents.ErrApplicationError, ex);

            if (logged || fullException == null) return;

            if (sSlxErrorId == null)
            {
                sSlxErrorId = ErrorHelper.GetNewLoggingId();
            }

            Log.Error(ErrorHelper.AppendSlxErrorId("SalesLogix SData Portal unhandled exception", sSlxErrorId),
                      fullException);
        }
    }

    private void Session_Start(object sender, EventArgs e)
    {
        try
        {
            Session["SessionStartTime"] = DateTime.Now;
            
            if (Log.IsInfoEnabled)
            {
                Log.InfoEx("SalesLogix SData Portal session start.", EventIds.AdHocEvents.InfoSessionStart);
            }

            HierarchicalRuntime.Instance.EnsureSessionWorkItem();
        }
        catch (Exception ex)
        {
            Log.ErrorEx("There was an error in Session_Start()", EventIds.AdHocEvents.ErrSessionStart, ex);
            throw; // Re-throw
        }
    }

    private void Session_End(object sender, EventArgs e)
    {
        try
        {
            HierarchicalRuntime.Instance.TerminateSessionWorkItem(Session);
        }
        catch (Exception ex)
        {
            Log.WarnEx("There was an error in Session_End()", EventIds.AdHocEvents.WarnSessionEnd, ex);
        }

        Log.InfoEx("SalesLogix SData Portal session end.", EventIds.AdHocEvents.InfoSessionEnd);
    }

    /// <summary>
    /// Determines whether the current user is authenticated.
    /// </summary>
    /// <returns>
    ///   <c>true</c> if the current user is authenticated; otherwise, <c>false</c>.
    /// </returns>
    private static bool IsAuthenticated()
    {
        try
        {
            if (ApplicationContext.Current != null && ApplicationContext.Current.Services != null)
            {
                var authProvider = ApplicationContext.Current.Services.Get<IAuthenticationProvider>();
                return authProvider != null && authProvider.IsAuthenticated;
            }
        }
        catch (Exception ex)
        {
            Log.Warn("The call to IsAuthenticated() failed.", ex);
        }
        return false;
    }

    /// <summary>
    /// Handles the MessagingService.UnhandledException event.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="Sage.Integration.Messaging.DiagnosesExceptionEventArgs"/> instance containing the event data.</param>
    private static void MessagingServiceOnUnhandledException(object sender, DiagnosesExceptionEventArgs e)
    {
        if (e == null) return;
        if (e.Exception == null) return;

        try
        {
            ErrorHelper.LogMessagingServiceException(e.Exception, ErrorHelper.GetCurrentHttpRequest(), Log);
        }
        catch (Exception ex)
        {
            Log.Error("There was an error in MessagingServiceOnUnhandledException()", ex);
        }
    }

    /// <summary>
    /// Processes the diagnoses by serializing it and writing it to the Response.
    /// </summary>
    /// <param name="diagnoses">The diagnoses.</param>
    /// <remarks>
    /// If the Request query string includes format=json a JSON formatted response is written to the Response; 
    /// otherwise, an XML formatted response is written to the Response.
    /// </remarks> 
    private void ProcessDiagnosesResponse(Diagnoses diagnoses)
    {
        if (diagnoses == null || diagnoses.Count == 0) return;                

        var mediaType = Request["format"].InvariantEquals("json") ? MediaType.JSON : MediaType.Xml;             

        Response.AppendHeader("Content-Type", MediaTypeNames.GetMediaType(mediaType));

        var serializer = MediaTypeSerializer.CreateInstance(mediaType);         

        switch (mediaType)
        {
            case MediaType.JSON:
                var jsonSerializer = serializer as IJsonSerializer;
                if (jsonSerializer != null)
                {
                    jsonSerializer.SaveToStream(diagnoses, Response.OutputStream, TextEncoding.UTF8);
                }               
                break;
                
            default:
                var xmlSerializer = serializer as IXmlSerializer;
                if (xmlSerializer != null)
                {
                    xmlSerializer.SaveToStream(diagnoses, null, Response.OutputStream, TextEncoding.UTF8);
                }
                break;
        }
    }

</script>
