/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="03091632-89e8-4251-abd3-6fb1908b5850">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>SaveButton_OnClickStep</name>
 <references>
  <reference>
   <assemblyName>Sage.Entity.Interfaces.dll</assemblyName>
   <hintPath>%BASEBUILDPATH%\interfaces\bin\Sage.Entity.Interfaces.dll</hintPath>
  </reference>
  <reference>
   <assemblyName>Sage.Form.Interfaces.dll</assemblyName>
   <hintPath>%BASEBUILDPATH%\formInterfaces\bin\Sage.Form.Interfaces.dll</hintPath>
  </reference>
  <reference>
   <assemblyName>Sage.Platform.dll</assemblyName>
   <hintPath>%BASEBUILDPATH%\assemblies\Sage.Platform.dll</hintPath>
  </reference>
  <reference>
   <assemblyName>Sage.SalesLogix.API.dll</assemblyName>
  </reference>
 </references>
</snippetHeader>
*/


#region Usings
using System;
using Sage.Entity.Interfaces;
using Sage.Form.Interfaces;
using Sage.Platform;
using System.Web;
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.Services;
using System.Text.RegularExpressions;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    /// <summary>
    /// Encapsulates methods for the InsertTeam smartpart
    /// </summary>
    public static partial class InsertTeamEventHandlers
    {
        /// <summary>
        /// Saves the new team entity and adds the owner to the team.  Optionally will
        /// add the owner's manager to the team is the add owner's manager checkbox is checked.
        /// </summary>
        /// <param name="form"></param>
        /// <param name="args"></param>
        public static void SaveButton_OnClickStep(IInsertTeam form, EventArgs args)
        {
            IWebDialogService dialogService = form.Services.Get<IWebDialogService>();
            // create the new team
            IOwner ownerTeam = EntityFactory.Create<IOwner>();
			ownerTeam.OwnerDescription = form.OwnerDescription.Text;
            ownerTeam.Type = OwnerType.Team;
			
            if (!ownerTeam.IsValidName(form.OwnerDescription.Text))
            {
                string msg = form.GetResource("InvalidNameMessage").ToString();
                if (dialogService != null && !string.IsNullOrEmpty(msg))
                    dialogService.ShowMessage(msg, form.GetResource("InvalidNameMessageTitle").ToString());

                return;
            }

            if (ownerTeam.OwnerNameExists(form.OwnerDescription.Text))
            {
                string msg = form.GetResource("DuplicateOwnerMessage").ToString();
                if (dialogService != null && !string.IsNullOrEmpty(msg))
                    dialogService.ShowMessage(msg, form.GetResource("DuplicateOwnerTitle").ToString());

                return;
            }

            ownerTeam.Save();

            // set a default profile
            IOwnerSecurityProfile securityProfile = EntityFactory.GetById<IOwnerSecurityProfile>("PROF00000001");
            if (form.securityProfileLookup.LookupResultValue != null)
                securityProfile = form.securityProfileLookup.LookupResultValue as IOwnerSecurityProfile;

            // get a team object.  This is a view of the owner object
            ITeam team = EntityFactory.GetById<ITeam>(ownerTeam.Id);
            // add an ownerJoin record for the new team.  Both the parent and the
            // child ids will point to the team
            team.AddMemberWithSecurityProfile(ownerTeam, securityProfile);


            // get the selected owner of the team.  This will be a user
            IUser teamOwnerUser = form.DefaultOwner.LookupResultValue as IUser;
            if (teamOwnerUser != null)
            {
                // add the team owner as a member of the team
				IOwnerSecurityProfile ownerSecurityProfile = EntityFactory.GetById<IOwnerSecurityProfile>("PROF00000003");
                team.AddMemberWithSecurityProfile(teamOwnerUser.DefaultOwner, ownerSecurityProfile);
            }

            HttpContext.Current.Response.Redirect(string.Format("~/Team.aspx?entityId={0}", ownerTeam.Id.ToString()), false);
        }
    }
}
