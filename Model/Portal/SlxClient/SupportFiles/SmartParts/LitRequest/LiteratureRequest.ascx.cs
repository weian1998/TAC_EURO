using System;
using System.Collections.Generic;
using System.Text;
using Sage.Platform;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.Platform.Security;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.SmartParts;
using Sage.SalesLogix.Security;
using Sage.Platform.Application.UI;
using System.Xml;
using System.Web.UI;
using Sage.Platform.Data;
using Sage.SalesLogix.PickLists;
using Sage.SalesLogix.Activity;
using System.Web.UI.HtmlControls;
using System.Web;

/// <summary>
/// Summary description for SmartParts_LitRequest_LiteratureRequest
/// </summary>
public partial class SmartParts_LitRequest_LiteratureRequest : UserControl, ISmartPartInfoProvider
{
    protected string UserId = "NOTASSIGNED!";
    protected string UserName = "";

    private IEntityHistoryService _EntityHistoryService;
    [ServiceDependency(Type = typeof(IEntityHistoryService), Required = false)]
    public IEntityHistoryService EntityHistoryService
    {
        get
        {
            return _EntityHistoryService;
        }
        set
        {
            _EntityHistoryService = value;
        }
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        // calls the final method when the fulfillment has succeeded
        if (Request.Form["__EVENTTARGET"] != null && Request.Form["__EVENTTARGET"].CompareTo("UpdateFulfillStatus") == 0)
        {
            UpdateFulfillStatus(Request.Form["__EVENTARGUMENT"]);
        }

        if (!IsPostBack)
        {
            // sage-mailmerge.js
            var oMailMergeScript = new HtmlGenericControl("script");
            oMailMergeScript.Attributes.Add("type", "text/javascript");
            string sMailMergeJs = string.Format("jscript/sage-mailmerge/sage-mailmerge{0}.js", (HttpContext.Current.IsDebuggingEnabled) ? "-debug" : "");
            oMailMergeScript.Attributes.Add("src", sMailMergeJs);
            oMailMergeScript.Attributes.Add("id", "sage_mailmerge_script");
            Page.Header.Controls.Add(oMailMergeScript);
        }


        RequestedFor.Required = true;
        try
        {
            SLXUserService slxUserService = ApplicationContext.Current.Services.Get<IUserService>() as SLXUserService;
            if (slxUserService != null)
            {
                UserId = slxUserService.GetUser().Id.ToString().Trim();
                UserName = slxUserService.GetUser().UserInfo.LastName + ", " +
                           slxUserService.GetUser().UserInfo.FirstName; //UserName;
            }
        }
        catch
        {
            UserId = "ERROR";
            UserName = "Error";
        }
        PopulateTree();
        if (!Page.ClientScript.IsClientScriptIncludeRegistered("LitRequest"))
            Page.ClientScript.RegisterClientScriptInclude("LitRequest", "jscript/LitRequest.js");
        if (!Page.ClientScript.IsClientScriptIncludeRegistered("XMLSupport"))
            Page.ClientScript.RegisterClientScriptInclude("XMLSupport", "jscript/XMLSupport.js");
        Page.ClientScript.RegisterClientScriptBlock(GetType(), "LitRequestWarnings", BuildLitRequestWarnings(), true);
        PopulateRequestedFor();
        btnSave.Attributes.Add("onclick", String.Format("return getValues(this, '{0}');", TemplateId.ClientID));
        lblRequestedBy.Text = String.Format(GetLocalResourceObject("RequestedByOn.Text").ToString(), UserName,
                                            DateTime.Now.ToShortDateString());
        TemplateFindIcon.Attributes["onclick"] = String.Format("ShowMailMergeTemplates('{0}', '{1}', '{2}')",
                                                            TemplateName.ClientID,
                                                            TemplateId.ClientID,
                                                            templateXml.ClientID);
        TemplateName.Attributes["onclick"] = String.Format("ShowMailMergeTemplates('{0}', '{1}', '{2}')",
                                                            TemplateName.ClientID,
                                                            TemplateId.ClientID,
                                                            templateXml.ClientID);
        PopulateLitItems();
        if (!IsPostBack)
        {
            SendBy.DateTimeValue = DateTime.Now;
            SetPickListDefault(SendVia);
            SetPickListDefault(Priority);
            //Set focus on the top element in the form
            SetFocus(RequestedFor.ClientID + "_LookupText");  


           
        }
    }

    private void SetFocus(string clientId)
    {
        StringBuilder script = new StringBuilder();
        script.Append(" $(document).ready(function(){\r\n");
        script.AppendFormat(" document.getElementById('{0}').focus();", clientId);
        script.Append("});\r\n");
        Page.ClientScript.RegisterClientScriptBlock(GetType(), "LitSetFocus", script.ToString(), true);
           
    }

    private string BuildLitRequestWarnings()
    {
        StringBuilder script = new StringBuilder();
        script.AppendFormat("LitWarning_SelectTemplate = '{0}';",
                            PortalUtil.JavaScriptEncode(GetLocalResourceObject("LitWarning_SelectTemplate").ToString()));
        script.AppendFormat("LitWarning_UnableToParseQuantity = '{0}';",
                            PortalUtil.JavaScriptEncode(GetLocalResourceObject("LitWarning_UnableToParseQuantity").ToString()));
        script.AppendFormat("LitWarning_QtyGreaterThanZero = '{0}';",
                            PortalUtil.JavaScriptEncode(GetLocalResourceObject("LitWarning_QtyGreaterThanZero").ToString()));
        script.AppendFormat("LitWarning_MaxOneBillion = '{0}';",
                            PortalUtil.JavaScriptEncode(GetLocalResourceObject("LitWarning_MaxOneBillion").ToString()));
        script.AppendFormat("LitWarning_MustSelectTemplate = '{0}';",
                            PortalUtil.JavaScriptEncode(GetLocalResourceObject("LitWarning_MustSelectTemplate").ToString()));
        script.AppendFormat("LitWarning_SendByDate = '{0}';",
                            PortalUtil.JavaScriptEncode(GetLocalResourceObject("LitWarning_SendByDate").ToString()));
        script.AppendFormat("LitWarning_SelectContact = '{0}';",
                            PortalUtil.JavaScriptEncode(GetLocalResourceObject("LitWarning_SelectContact").ToString()));
        script.AppendFormat("LitWarning_DescriptionLessThan64 = '{0}';",
                            PortalUtil.JavaScriptEncode(GetLocalResourceObject("LitWarning_DescriptionLessThan64").ToString()));
        return script.ToString();
    }

    private void SetPickListDefault(Sage.SalesLogix.Web.Controls.PickList.PickListControl plc)
    {
        if (plc.PickListValue == "")
        {
            PickList sv = PickList.GetPickListByName(plc.PickListName);
            if ((sv.Defaultindex ?? -1) >= 0)
            {
                IList<PickList> vals = PickList.GetPickListItemsByName(plc.PickListName);
                plc.PickListValue = vals[sv.Defaultindex.Value].Text;
            }
        }
    }

    private void PopulateRequestedFor()
    {
        if (this.EntityHistoryService != null)
        {
            string conid = ""; //this.EntityHistoryService.GetLastIdForType<IContact>().ToString();
            foreach (EntityHistory eh in this.EntityHistoryService)
            {
                if (eh.EntityType.Name.ToUpper() == "ICONTACT")
                {
                    conid = eh.EntityId.ToString();
                    break;
                }
                if (eh.EntityType.Name.ToUpper() == "ITICKET")
                {
                    conid = EntityFactory.GetById<ITicket>(eh.EntityId).Contact.Id.ToString();
                    break;
                }
                if (eh.EntityType.Name.ToUpper() == "IOPPORTUNITY")
                {
                    IEnumerator<IOpportunityContact> cons = EntityFactory.GetById<IOpportunity>(eh.EntityId).Contacts.GetEnumerator();
                    while (cons.MoveNext())
                    {
                        if (cons.Current.IsPrimary == true)
                            conid = cons.Current.Contact.Id.ToString();
                    }
                    break;
                }
                if (eh.EntityType.Name.ToUpper() == "IACCOUNT")
                {
                    IEnumerator<IContact> cons = EntityFactory.GetById<IAccount>(eh.EntityId).Contacts.GetEnumerator();
                    while (cons.MoveNext())
                    {
                        if (cons.Current.IsPrimary == true)
                            conid = cons.Current.Id.ToString();
                    }
                    break;
                }
            }
            if ((conid != ""))
            {
                RequestedFor.LookupResultValue = EntityFactory.GetById<IContact>(conid);
            }
        }
    }

    private void PopulateLitItems()
    {
        string SQL = "SELECT ITEMNAME, ITEMFAMILY, COST, LITERATUREID, LITERATUREID AS ID FROM LITERATURE";
        using (new SparseQueryScope())
        {
            IDataService service = Sage.Platform.Application.ApplicationContext.Current.Services.Get<IDataService>();
            using (var conn = service.GetOpenConnection())
            using (var cmd = conn.CreateCommand(SQL))
            using (var reader = cmd.ExecuteReader())
            {
                LiteratureItems.DataSource = reader;
                LiteratureItems.DataBind();
            }
        }
    }

    private void PopulateTree()
    {
        //ToDo: Refactor: Use Plugin manager to do this
        XmlDocument xmlTemplates = Sage.SalesLogix.BusinessRules.BusinessRuleHelper.GetMailMergeTemplates(UserId);
        if (xmlTemplates != null)
        {
            //Todo: Refactor: Remove inline storage of template list.
            templateXml.Text = xmlTemplates.OuterXml;
        }
    }

    protected void Save(object sender, EventArgs e)
    {
        if (SendBy.DateTimeValue < DateTime.Now.AddDays(-1))
            return;
        if (RequestedFor.LookupResultValue != null)
        {
            IContextService conserv = ApplicationContext.Current.Services.Get<IContextService>(true);
            Sage.Platform.TimeZone tz = (Sage.Platform.TimeZone)conserv.GetContext("TimeZone");

            ILitRequest lr = EntityFactory.Create<ILitRequest>();
            SLXUserService slxUserService = ApplicationContext.Current.Services.Get<IUserService>() as SLXUserService;
            if (slxUserService != null)
            {
                lr.RequestUser = slxUserService.GetUser();
            }
            String[] arClientData = clientdata.Value.ToString().Split('|');
            lr.RequestDate = DateTime.Now.AddMinutes(tz.BiasForGivenDate(DateTime.Now));
            lr.CoverId = arClientData[0];
            lr.Contact = (IContact)RequestedFor.LookupResultValue;
            lr.ContactName = lr.Contact.LastName + ", " + lr.Contact.FirstName;
            lr.Description = Description.Text;
            lr.SendDate = SendBy.DateTimeValue;
            lr.SendVia = SendVia.PickListValue;
            lr.Priority = Priority.PickListValue;
            lr.Options = PrintLiteratureList.SelectedIndex;

            lr.Save();

            Activity act = new Activity();
            act.Type = ActivityType.atLiterature;
            act.AccountId = lr.Contact.Account.Id.ToString();
            act.AccountName = lr.Contact.Account.AccountName;
            act.ContactId = lr.Contact.Id.ToString();
            act.ContactName = lr.ContactName;
            act.PhoneNumber = lr.Contact.WorkPhone;
            act.StartDate = (DateTime)lr.RequestDate;
            act.Duration = 0;
            act.Description = lr.Description;
            act.Alarm = false;
            act.Timeless = true;
            act.Rollover = false;
            act.UserId = lr.RequestUser.Id.ToString();
            act.OriginalDate = (DateTime)lr.RequestDate;
            act.Save();

            // save litRequest item
            double totalCost = 0.0;
            string coverId = arClientData[0];
            
            // get cover name
            for (int i = 1; i < arClientData.Length; i++)
            {
                string[] clientData = arClientData[i].Split('=');
                string litItemId = clientData[0];
                int qty = Int32.Parse(clientData[1]);

                // get literature item cost
                ILiteratureItem litItem = EntityFactory.GetById<ILiteratureItem>(litItemId);
                totalCost += (double)qty * (litItem.Cost.HasValue ? (double)litItem.Cost.Value : (double)0.0);

                // add the literature request item
                ILitRequestItem lrItem = EntityFactory.Create<ILitRequestItem>();
                lrItem.Qty = qty;
                lrItem.LitRequest = lr;
                lrItem.LiteratureItem = litItem;

                lr.LitRequestItems.Add(lrItem);
            }

            lr.TotalCost = totalCost;

            // get cover name
            string coverName = GetCoverName(coverId);
            lr.CoverName = coverName;

            lr.Save();  //must make ids match, and id prop is read only, so....

            SynchronizeLitRequestId(act.Id, lr.Id.ToString());

            // re-get entity with new activity id
            lr = EntityFactory.GetById<ILitRequest>(act.Id);

            // process the lit request if handle fulfillment locally is checked
            if (chkHandleLocal.Checked)
            {
                // show printer dialog for fulfillment
                FulfillRequestLocally(lr);

                // call business rule to update the entity properties
                lr.FulfillLitRequest();
            }
            else
            {
                Response.Redirect("Contact.aspx?entityId=" + lr.Contact.Id.ToString());
            }

        }
    }
    private void SynchronizeLitRequestId(string activityId, string litRequestId)
    {
        IDataService service = Sage.Platform.Application.ApplicationContext.Current.Services.Get<IDataService>();
        var conn = service.GetOpenConnection();
        try
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = String.Format("UPDATE LITREQUEST SET LITREQID = '{0}' WHERE LITREQID = '{1}'", activityId, litRequestId);
            cmd.Parameters.Clear();
            cmd.ExecuteNonQuery();

            cmd = conn.CreateCommand();
            cmd.CommandText = String.Format("UPDATE LITREQUESTITEM SET LITREQID = '{0}' WHERE LITREQID = '{1}'", activityId, litRequestId);
            cmd.Parameters.Clear();
            cmd.ExecuteNonQuery();
        }
        finally
        {
            conn.Close();
        }

    }

    private string GetCoverName(string coverId)
    {
        string coverName = "";

        using (new SparseQueryScope())
        {
            IDataService service = ApplicationContext.Current.Services.Get<IDataService>();
            using (var conn = service.GetOpenConnection())
            {
                using (var cmd = conn.CreateCommand())
                {
                    var factory = service.GetDbProviderFactory();
                    cmd.CommandText = "SELECT SLXCAT(SLXCAT(FAMILY, ':'), NAME) FROM PLUGIN WHERE PLUGINID = ?";
                    cmd.Parameters.Clear();
                    cmd.Parameters.Add(factory.CreateParameter("@Litid", coverId));
                    object coverNameObj = cmd.ExecuteScalar();
                    if (coverNameObj != null && coverNameObj != DBNull.Value)
                    {
                        coverName = coverNameObj.ToString();
                    }
                }
            }
        }

        return coverName;
    }

    private void FulfillRequestLocally(ILitRequest lr)
    {
        // build client script with values
        StringBuilder sb = new StringBuilder();
        sb.AppendFormat("fulfillLitRequestLocally('{0}');", lr.Id);
        ScriptManager.RegisterClientScriptBlock(this, typeof(SmartParts_LitRequest_LiteratureRequest), "fulfillRequest", sb.ToString(), true);

    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in LitRequest_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    private void UpdateFulfillStatus(string litRequestId)
    {
        // call business rule to update the entity properties
        ILitRequest lr = EntityFactory.GetById<ILitRequest>(litRequestId);
        lr.FulfillLitRequest();

        Response.Redirect(string.Format("Contact.aspx?entityId={0}", lr.Contact.Id));
    }
}