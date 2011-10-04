/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="d2e2ca0c-bd5f-48a6-94e8-8658b80c9b77">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>btnInsert_OnClick</name>
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
	/// <summary>
	/// This method is invoked from the Add button with the toolbar.
	/// </summary>
	public static partial class EndPointsEventHandlers
	{
		public static void btnInsert_OnClick(IAccountingSystems form, EventArgs args)
		{
			Sage.Platform.WebPortal.Services.IWebDialogService DialogService = form.Services.Get<Sage.Platform.WebPortal.Services.IWebDialogService>(true);
			DialogService.SetSpecs(550, 885, "AddEditAccountingSystem", form.GetResource("AddEndPoint_Caption").ToString());
			DialogService.EntityType = typeof(IAppIdMapping);
			DialogService.EntityID = "Insert";
			DialogService.ShowDialog();
		}
	}
}
