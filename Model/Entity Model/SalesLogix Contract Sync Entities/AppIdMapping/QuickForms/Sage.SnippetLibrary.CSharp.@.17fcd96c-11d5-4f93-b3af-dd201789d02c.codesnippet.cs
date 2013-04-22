/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="17fcd96c-11d5-4f93-b3af-dd201789d02c">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>cmdOK_OnClickStep</name>
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
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
	/// <summary>
    /// This is called on the save action of the Accounting System page.
    /// </summary>
    public static partial class AddEditAccountingSystemEventHandlers
    {
		/// <summary>
    	/// Encrypts the accounting systems end point password.
    	/// </summary>
    	/// <param name="form">The Accounting System details form.</param>
    	/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void cmdOK_OnClickStep(IAddEditAccountingSystem form, EventArgs args)
        {
            IAppIdMapping appIdMapping = form.CurrentEntity as IAppIdMapping;
			if (appIdMapping != null)
			{
				appIdMapping.EncryptAccountingSystemPassword(form.txtPassword.Text);
				appIdMapping.ValidateEndPoint();
				appIdMapping.Save();
			}
        }
    }
}
