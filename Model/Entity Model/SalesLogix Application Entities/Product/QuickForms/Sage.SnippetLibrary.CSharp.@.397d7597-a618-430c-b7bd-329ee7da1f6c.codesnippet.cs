/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="397d7597-a618-430c-b7bd-329ee7da1f6c">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>OnFormLoad</name>
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
    /// This is called on the load action of the product details form.
    /// </summary>
    public static partial class ProductDetailsEventHandlers
    {
		/// <summary>
    	/// Sets the forms toolbar buttons visibility based on the display mode of the product.
    	/// </summary>
    	/// <param name="form">The product details form.</param>
    	/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void OnFormLoad(IProductDetails form, EventArgs args)
        {
            Sage.Platform.WebPortal.SmartParts.EntityBoundSmartPart smartpart = form.NativeForm as Sage.Platform.WebPortal.SmartParts.EntityBoundSmartPart;
            Sage.Platform.WebPortal.EntityPage page = (Sage.Platform.WebPortal.EntityPage)smartpart.Page;
			if (page != null)
			{
				Sage.Platform.SData.IAppIdMappingService mappingService = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.SData.IAppIdMappingService>(true);
				if (mappingService.IsIntegrationEnabled())
				{
					form.clIntegrationContract.Visible = true;
					form.curCost.Enabled = false;					
					form.txtDescription.Enabled = false;
					form.txtName.Enabled = false;
					form.txtSKU.Enabled = false;
					form.pklFamily.Enabled = false;
					form.pklStatus.Enabled = false;
					form.pklType.Enabled = false;
					form.lueUnitOfMeasure.Enabled = false;
					form.btnDelete.Visible = false;
					form.btnSave.Visible = false;
					form.btnInsertSave.Visible = false;
				}
				else
				{
					form.clIntegrationContract.Visible = false;
					bool bInsertMode = page.ModeId.ToUpper().Equals("INSERT");
					form.btnDelete.Visible = !bInsertMode;
					form.btnSave.Visible = !bInsertMode;
					form.btnInsertSave.Visible = bInsertMode;	
				}
			}
        }
    }
}
