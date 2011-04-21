/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="9587739e-4f75-475b-89c3-9b0a3e1c3454">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>OnLoadCompetitorForm</name>
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
    /// This is called on the load action of the competitor form.
    /// </summary>
    public static partial class CompetitorDetailsEventHandlers
    {
		/// <summary>
    	/// Sets the forms toolbar buttons visibility based on the state of the competitor.
    	/// </summary>
    	/// <param name="form">The competitor details form.</param>
    	/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void OnLoadCompetitorForm(ICompetitorDetails form,  EventArgs args)
        {
			Sage.Platform.WebPortal.SmartParts.EntityBoundSmartPart smartpart = form.NativeForm as Sage.Platform.WebPortal.SmartParts.EntityBoundSmartPart;
            Sage.Platform.WebPortal.EntityPage page = (Sage.Platform.WebPortal.EntityPage)smartpart.Page;
			if (page != null)
			{
                bool bInsertMode = page.ModeId.ToUpper().Equals("INSERT");
                form.btnDelete.Visible = !bInsertMode;
                form.btnSave.Visible = !bInsertMode;
                form.btnInsertSave.Visible = bInsertMode;
			}
        }
    }
}
