/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="50773d47-cf3c-48e6-93bb-db3bc954ac07">
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
using System.Web;
using Sage.Platform;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using System.Text.RegularExpressions;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class InsertDepartmentEventHandlers
    {
        public static void SaveButton_OnClickStep(IInsertDepartment form, EventArgs args)
        {
            IWebDialogService dialogService = form.Services.Get<IWebDialogService>();
            IOwner owner = EntityFactory.Create<IOwner>();
			owner.OwnerDescription = form.OwnerDescription.Text;
            owner.Type = OwnerType.Department;
            if (!owner.IsValidName(form.OwnerDescription.Text))
            {
                string msg = form.GetResource("InvalidNameMessage").ToString();
                if (dialogService != null && !string.IsNullOrEmpty(msg))
                    dialogService.ShowMessage(msg, form.GetResource("InvalidNameMessageTitle").ToString());

                return;
            }

            if (owner.OwnerNameExists(form.OwnerDescription.Text))
            {
                string msg = form.GetResource("DuplicateOwnerMessage").ToString();
                if (dialogService != null && !string.IsNullOrEmpty(msg))
                    dialogService.ShowMessage(msg, form.GetResource("DuplicateOwnerTitle").ToString());

                return;
            }

            owner.Save();

            IOwnerSecurityProfile securityProfile = EntityFactory.GetById<IOwnerSecurityProfile>("PROF00000001");
            if (form.securityProfileLookup.LookupResultValue != null)
                securityProfile = form.securityProfileLookup.LookupResultValue as IOwnerSecurityProfile;

            // get a department object.  This is a view of the owner object
            IDepartment department = EntityFactory.GetById<IDepartment>(owner.Id);
            // add an ownerJoin record for the new team.  Both the parent and the
            // child ids will point to the team
            department.AddMemberWithSecurityProfile(owner, securityProfile);

            HttpContext.Current.Response.Redirect(string.Format("~/Department.aspx?entityId={0}", owner.Id.ToString()), false);
        }
    }
}
