/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="6d52933f-707d-4eaa-a9d4-5c59c45f4269">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>OkButton_OnClickStep</name>
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
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
    public static partial class EditSecurityProfileEventHandlers
    {
        public static void OkButton_OnClickStep( IEditSecurityProfile form,  EventArgs args)
        {
			// child is the member of a team or department
			if(!string.IsNullOrEmpty(form.HiddenChildId.Value))
			{
				IOwner child = EntityFactory.GetById<IOwner>(form.HiddenChildId.Value);
				IOwner parent = EntityFactory.GetById<IOwner>(form.HiddenParentId.Value);
				IOwnerSecurityProfile selProfile = form.SecurityProfileLookup.LookupResultValue as IOwnerSecurityProfile;
				if(selProfile != null && selProfile.Id.ToString() != form.HiddenProfileId.Value)
				{
					parent.UpdateOwnerSecurityProfile(child, selProfile);
					child.Save();
				}
			}
        }
    }
}
