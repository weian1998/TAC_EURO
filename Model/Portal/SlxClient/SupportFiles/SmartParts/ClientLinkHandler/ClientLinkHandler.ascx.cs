using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Common.Syndication.Json;
using Sage.Common.Syndication.Json.Linq;
using Sage.Platform.Application;
using Sage.Platform.Application.UI.Web;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.Security;
using Sage.SalesLogix.Client.GroupBuilder;
using Sage.SalesLogix.SelectionService;
using Sage.SalesLogix.Web.Controls;
using Sage.SalesLogix.Web.SelectionService;

public partial class SmartParts_ClientLinkHandler_ClientLinkHandler : UserControl
{
    private HiddenField _state;

    public IWebDialogService Dialog
    {
        get { return ((ApplicationPage)Page).PageWorkItem.Services.Get<IWebDialogService>(true); }
    }

    private LinkHandler _LinkHander;
    private LinkHandler Link
    {
        get
        {
            if (_LinkHander == null)
                _LinkHander = new LinkHandler(Page);
            return _LinkHander;
        }
    }

    public const string WebHelpUrlFmtKey = "WebHelpUrlFmt";
    public const string WebHelpUrlTargetKey = "WebHelpLinkTarget";
    protected void Page_Load(object sender, EventArgs e)
    {
        WebPortalPage p = Page as WebPortalPage;
        if (p != null)
        {
            if (!p.ClientContextService.CurrentContext.ContainsKey(WebHelpUrlFmtKey))
            {
                PageLink linkCtrl = new PageLink
                                        {
                                            LinkType = enumPageLinkType.HelpFileName,
                                            NavigateUrl = "bogustopic",
                                            Target = "help"
                                        };
                var webHelpLink = linkCtrl.GetWebHelpLink();
                p.ClientContextService.CurrentContext.Add(WebHelpUrlFmtKey, webHelpLink.Url.Replace("bogustopic", "{0}"));
                p.ClientContextService.CurrentContext.Add(WebHelpUrlTargetKey, webHelpLink.Target);
            }
        }
    }

    protected override void CreateChildControls()
    {
        _state = new HiddenField();
        _state.ID = ID + "_state";
        _state.ValueChanged += HandleLinkRequest;

        Controls.Add(_state);
    }

    protected override void OnInit(EventArgs e)
    {
        base.OnInit(e);
        EnsureChildControls();
        ScriptManager.RegisterStartupScript(Page, GetType(), "ClientLinkHandler", GetClientScript(), true);
        ScriptManager sm = ScriptManager.GetCurrent(Page);
        if (sm != null)
        {
            sm.RegisterAsyncPostBackControl(_state);
        }
    }

    private void HandleLinkRequest(object sender, EventArgs e)
    {
        if (_state.Value == string.Empty) return;

        var jso = new Dictionary<string, object>();
        JsonConvert.PopulateObject(_state.Value, jso);

        string request = GetValue(jso, "request");
        string kind = GetValue(jso, "kind");
        string type = GetValue(jso, "type");
        string id = GetValue(jso, "id");
        string selectionInfoKey = GetValue(jso, "selectionInfoKey");
        string recurDate = String.Empty;
        DateTime dateTime;
        Dictionary<string, string> args = GetArgs(jso);

        switch (request)
        {
            case "EntityDetail":
                if (kind == "ACTIVITY")
                    Link.EditActivity(id);
                else if (kind == "HISTORY")
                    Link.EditHistory(id);
                else
                    Link.EntityDetail(id, kind);
                break;
            case "Schedule":
                if (type == "PhoneCall")
                    Link.SchedulePhoneCall();
                else if (type == "Meeting")
                    Link.ScheduleMeeting();
                else if (type == "ToDo")
                    Link.ScheduleToDo();
                else if (type == "PersonalActivity")
                    Link.SchedulePersonalActivity();
                else if (type == "CompleteActivity")
                    Link.ScheduleCompleteActivity();
                break;
            case "New":
                if (type == "Note")
                    Link.NewNote();
                break;
            case "EditActivity":
                Link.EditActivity(id);
                break;
            case "EditActivityOccurrence":
                recurDate = GetValue(jso, "recurDate");
                dateTime = Convert.ToDateTime(recurDate);
                Link.EditActivityOccurrencePrompt(id, dateTime);
                break;
            case "EditHistory":
                Link.EditHistory(id, args);
                break;
            case "CompleteActivity":
                Link.CompleteActivity(id);
                break;
            case "CompleteActivityOccurrence":
                recurDate = GetValue(jso, "recurDate");
                dateTime = Convert.ToDateTime(recurDate);
                Link.CompleteActivityOccurrencePrompt(id, dateTime);
                break;
            case "DeleteActivity":
                Link.DeleteActivity(id);
                break;
            case "DeleteActivityOccurrence":
                recurDate = GetValue(jso, "recurDate");
                dateTime = Convert.ToDateTime(recurDate);
                Link.DeleteActivityOccurrencePrompt(id, dateTime);
                break;
            case "ScheduleActivity":
                Link.ScheduleActivity(args);
                break;
            case "ConfirmActivity":
                string toUserId = GetValue(jso, "toUserId");
                Link.ConfirmActivity(id, toUserId);
                break;
            case "DeleteConfirmation":
                string notifyId = GetValue(jso, "notifyId");
                Link.DeleteConfirmation(id, notifyId);
                break;
            case "RemoveDeletedConfirmation":
                Link.RemoveDeletedConfirmation(id);
                break;
            case "MergeRecords":
                Link.MergeRecords(selectionInfoKey);
                break;
            case "ShowDialog":
                //dialog properties
                String smartPart = GetValue(jso, "smartPart");
                String entityId = GetValue(jso, "entityId");
                String title = GetValue(jso, "dialogTitle");
                bool isCentered = Convert.ToBoolean(GetValue(jso, "isCentered"));
                int top = Convert.ToInt16(GetValue(jso, "dialogTop"));
                int left = Convert.ToInt16(GetValue(jso, "dialogLeft"));
                int height = Convert.ToInt16(GetValue(jso, "dialogHeight"));
                int width = Convert.ToInt16(GetValue(jso, "dialogWidth"));                
                
                Link.ShowDialog(type, smartPart, entityId, title, isCentered, top, left, height, width);
                break;
            case "Administration":
                if(type == "AddUsers")
                    Link.NewUsers();
                else if (type == "CopyUser")
                    Link.CopyUser(GetSelectedIds(selectionInfoKey));
                else if (type == "CopyUserProfile")
                    Link.CopyUserProfile(GetSelectedIds(selectionInfoKey));
                else if (type == "DeleteUsers")
                    Link.DeleteUsers(GetSelectedIds(selectionInfoKey));
                else if (type == "AddToTeam")
                    Link.AddToTeam(GetSelectedIds(selectionInfoKey));
                else if (type == "RemoveFromTeam")
                {
                    //Link.RemoveUsersFromTeam(GetSelectedIds(selectionInfoKey));
                }
                else if (type == "AssignRole")
                    Link.AssignRoleToUsers(GetSelectedIds(selectionInfoKey));
                else if (type == "RemoveFromAllTeams")
                    Link.RemoveFromAllTeams(GetSelectedIds(selectionInfoKey));
                else if (type == "ReplaceTeamMember")
                    Link.ReplaceTeamMember(GetSelectedIds(selectionInfoKey));
                else if (type == "RedirectToUser")
                {
                    Sage.Entity.Interfaces.IOwner owner = Sage.Platform.EntityFactory.GetById<Sage.Entity.Interfaces.IOwner>(id);
                    Response.Redirect(string.Format("User.aspx?entityId={0}", owner.User.Id.ToString()), true);
                }
                else if (type == "EditSecurityProfile")
                    Link.ShowEditSecurityProfileDialog(selectionInfoKey);
                else if (type == "DeleteTeam")
                    Link.DeleteTeam(GetSelectedIds(selectionInfoKey));
                else if (type == "DeleteDepartment")
                    Link.DeleteDepartment(GetSelectedIds(selectionInfoKey));
                else if (type == "CopyTeam")
                    Link.CopyTeam(GetSelectedIds(selectionInfoKey));
                else if (type == "CopyDepartment")
                    Link.CopyDepartment(GetSelectedIds(selectionInfoKey));
                else if (type == "SetUsersToStandardRole")
                    Link.SetUsersToStandardRole();
                break;
        }
    }
   
    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    private IList<string> GetSelectedIds(string selectionKey)
    {
        List<string> ids = new List<string>();

        if (selectionKey == "selectAll")
        {
            GroupContextService groupContextService = ApplicationContext.Current.Services.Get<IGroupContextService>() as GroupContextService;
            if (groupContextService != null)
            {
                CachedGroup currentGroup = groupContextService.GetGroupContext().CurrentGroupInfo.CurrentGroup;
                ids = currentGroup.GetIdList();
            }
        }
        else
        {
            ISelectionService srv = SelectionServiceRequest.GetSelectionService();
            ISelectionContext selectionContext = srv.GetSelectionContext(selectionKey);
            ids = selectionContext.GetSelectedIds();
        }

        return ids;
    }

    private static string GetValue(IDictionary<string, object> jso, string key)
    {
        if (jso.ContainsKey(key))
            return jso[key].ToString();
        return null;
    }

    private static Dictionary<string, string> GetArgs(IDictionary<string, object> jso)
    {
        Dictionary<string, string> args = new Dictionary<string, string>();

        if (jso.ContainsKey("args"))
        {
            var jsoArgs = jso["args"] as JObject;
            if (jsoArgs != null)
            {
                foreach (var arg in jsoArgs)
                {
                    args.Add(arg.Key, arg.Value.Value<string>());
                }
            }
        }
        return args;
    }

    private string GetClientScript()
    {
        return @"
if ($get('" + _state.ClientID + @"')) {
    $get('" + _state.ClientID + @"').value = '';
}

var ClientLinkHandler = {
    request: function(request) {
        var value = Sys.Serialization.JavaScriptSerializer.serialize(request);
        var hiddenField = $get('" + _state.ClientID + @"');
        if (hiddenField) {
            hiddenField.value = value;
            __doPostBack('" + _state.ClientID + @"', '');
        }
    }
};

";
    }
}