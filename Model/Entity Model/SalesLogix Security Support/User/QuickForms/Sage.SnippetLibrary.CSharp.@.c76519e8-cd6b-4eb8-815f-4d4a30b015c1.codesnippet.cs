/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="c76519e8-cd6b-4eb8-815f-4d4a30b015c1">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>OnChangePasswordLoad</name>
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
using Sage.Platform.Application;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
	/// <summary>
    /// This is called when the change password form is loaded.
    /// </summary>
    public static partial class UserChangePasswordEventHandlers
    {
		/// <summary>
    	/// Loads the default setting for the change password form.
    	/// </summary>
    	/// <param name="form">The change password form.</param>
    	/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void OnChangePasswordLoad(IUserChangePassword form, EventArgs args)
        {
			IEntityHistoryService entities = ApplicationContext.Current.Services.Get<IEntityHistoryService>(false);
			if (entities != null)
			{
				EntityHistory entity = entities[0];
				if (entity != null && entity.EntityType.Equals(typeof(IUser)))
				{
					//form.usrUser.Enabled = (entity.EntityId.ToString().Trim().Equals("ADMIN"));
					if (form.usrUser.LookupResultValue == null)
					{
						form.usrUser.LookupResultValue = entity.EntityId;
					}
					form.ctrlstButtons.Visible = true;					
				}
				else
				{
					form.ctrlstButtons.Visible = false;
					//form.usrUser.LookupResultValue = Sage.SalesLogix.API.MySlx.Security.CurrentSalesLogixUser;
				}
			}
        }
    }
}
