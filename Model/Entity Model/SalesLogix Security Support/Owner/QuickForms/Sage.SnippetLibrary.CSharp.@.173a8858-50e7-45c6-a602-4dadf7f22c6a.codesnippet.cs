/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="173a8858-50e7-45c6-a602-4dadf7f22c6a">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>OnLoad1Step</name>
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
using Sage.SalesLogix.API;
using Sage.Platform;
using Sage.Platform.WebPortal.Services;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class EditSecurityProfileEventHandlers
    {
        public static void OnLoad1Step( IEditSecurityProfile form,  EventArgs args)
        {
			// child is the member of a team or department
			// parent is the team or department
			IOwner child = form.CurrentEntity as IOwner;		
			form.HiddenChildId.Value = child.Id.ToString();
            form.NameTextBox.Text = child.OwnerDescription;
			form.OwnerTypeTextBox.Text = child.Type.ToString();
			
			IWebDialogService dialogService = form.Services.Get<IWebDialogService>();
			
			string parentId = dialogService.DialogParameters["parentId"].ToString();
			form.HiddenParentId.Value = parentId;			
			IOwner parent = EntityFactory.GetById<IOwner>(parentId);
			form.ParentTextBox.Text = parent.OwnerDescription;	

			string profileId = dialogService.DialogParameters["profileId"].ToString();
			form.HiddenProfileId.Value = profileId;
			IOwnerSecurityProfile profile = EntityFactory.GetById<IOwnerSecurityProfile>(profileId);
			form.SecurityProfileLookup.LookupResultValue = profile;
        }
    }
}
