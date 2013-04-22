using System;
using System.Collections.Generic;
using System.Data;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;
using System.Text;
using Sage.Entity.Interfaces;
using Sage.Platform.Application.UI;
using Sage.Platform.Diagnostics;
using Sage.Platform.Security;
using Sage.SalesLogix.Services.Import;
using Sage.SalesLogix.Services.PotentialMatch;
using Sage.Platform.WebPortal.SmartParts;

public partial class ImportHistoryDuplicates : EntityBoundSmartPartInfoProvider 
{
    #region Public Methods

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(IImportHistory); }
    }

    #endregion

    /// <summary>
    /// Called when [add entity bindings].
    /// </summary>
    protected override void OnAddEntityBindings()
    {
    }

    /// <summary>
    /// Called when [form bound].
    /// </summary>
    protected override void OnFormBound()
    {
        base.OnFormBound();
        LoadForm();
    }

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in Controls)
        {
            SmartPartToolsContainer cont = c as SmartPartToolsContainer;
            if (cont != null)
            {
                switch (cont.ToolbarLocation)
                {
                    case SmartPartToolsLocation.Right:
                        foreach (Control tool in cont.Controls)
                        {
                            tinfo.RightTools.Add(tool);
                        }
                        break;
                    case SmartPartToolsLocation.Center:
                        foreach (Control tool in cont.Controls)
                        {
                            tinfo.CenterTools.Add(tool);
                        }
                        break;
                    case SmartPartToolsLocation.Left:
                        foreach (Control tool in cont.Controls)
                        {
                            tinfo.LeftTools.Add(tool);
                        }
                        break;
                }
            }
        }
        return tinfo;
    }

    /// <summary>
    /// Handles the OnPageIndexChanging event of the grdDuplicates control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewPageEventArgs"/> instance containing the event data.</param>
    protected void grdDuplicates_OnPageIndexChanging(object sender, GridViewPageEventArgs e)
    {
        grdDuplicates.PageIndex = e.NewPageIndex;
    }

    /// <summary>
    /// Handles the OnRowCommand event of the grdDuplicates control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewCommandEventArgs"/> instance containing the event data.</param>
    protected void grdDuplicates_OnRowCommand(object sender, GridViewCommandEventArgs e)
    {
        if (e.CommandName.Equals("Resolve"))
        {
            int rowIndex = Convert.ToInt32(e.CommandArgument);
            string itemId = grdDuplicates.DataKeys[rowIndex].Value.ToString();
            ResolveDuplicate(itemId);
        }
    }

    /// <summary>
    /// Handles the OnRowDataBound event of the grdDuplicates control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewRowEventArgs"/> instance containing the event data.</param>
    protected void grdDuplicates_OnRowDataBound(object sender, GridViewRowEventArgs e)
    {
        try
        {
            if (e.Row.Cells.Count > 2)
            {
                e.Row.Cells[2].Visible = false;
            }
        }
        catch (Exception)
        { 
        
        }
    }

    /// <summary>
    /// Handles the OnRowEditing event of the grdDuplicates control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewEditEventArgs"/> instance containing the event data.</param>
    protected void grdDuplicates_OnRowEditing(object sender, GridViewEditEventArgs e)
    {
        grdDuplicates.SelectedIndex = e.NewEditIndex;
    }
   
    #region Private Methods

    /// <summary>
    /// Loads the form.
    /// </summary>
    private void LoadForm()
    {
        try
        {
            if (Page.Visible && chkShowDuplicates.Checked)
            {
                IImportHistory importHistory = BindingSource.Current as IImportHistory;
                if (importHistory != null)
                {
                    ImportTemplateManager templateManager = new ImportTemplateManager(importHistory.Data, Type.GetType(importHistory.EntityType));
                    ImportCSVOptions csvOptions = new ImportCSVOptions();
                    templateManager.LoadImportSourceOptions(csvOptions);
                    IList<IImportHistoryItem> items = Sage.SalesLogix.ImportHistory.Rules.GetHistoryItems(importHistory,"DUPLICATE","CreateDate",true);

                    if (items !=null && items.Count > 0)
                    {
                        IImportHistoryItem fItem = items[0];
                        string sQualifier = string.Empty;
                        if (fItem.Data.Contains(csvOptions.Qualifier.ToString()))
                        {
                             sQualifier = Convert.ToString(csvOptions.Qualifier);
                        }
                        
                        StringBuilder sb = new StringBuilder();
                        if (csvOptions.FirstRowColHeader)
                        {
                            string colheader = string.Empty;
                            colheader = string.Format("{0}{1}{2}{3}", sQualifier, "Id", sQualifier, csvOptions.Delimiter);
                            int lastColIndex = templateManager.SourceProperties.Count;
                            int index = 0;
                            foreach (ImportSourceProperty sp in templateManager.SourceProperties)
                            {
                                index++;
                                colheader = sp.FieldName.Equals("Id", StringComparison.InvariantCultureIgnoreCase)
                                                ? colheader + sQualifier + sp.FieldName + "_" + index + sQualifier
                                                : colheader + sQualifier + sp.FieldName + sQualifier;
                                if (lastColIndex != index)
                                {
                                    colheader = colheader + Convert.ToString(csvOptions.Delimiter);
                                }
                            }
                            sb.AppendLine(colheader);
                        }

                        foreach (IImportHistoryItem item in items)
                        {
                            if (string.Equals("DUPLICATE", item.ItemType) && !Convert.ToBoolean(item.IsResolved))
                            {
                                sb.AppendFormat("{0}{1}{2}{3}{4}\r\n", sQualifier, item.Id, sQualifier, csvOptions.Delimiter, item.Data);
                            }
                        }

                        ImportCSVReader sourceReader = GetCSVReader(sb.ToString());
                        sourceReader.Options = csvOptions;
                        DataTable dtDups = sourceReader.GetAsDataTable(-1);
                        if (dtDups.Columns[0].ColumnName != "Id")
                        {
                            dtDups.Columns[0].ColumnName = "Id";
                        }
                        grdDuplicates.DataSource = dtDups;
                    }
                }
                grdDuplicates.DataBind();
            }
        }
        catch (Exception ex)
        {
            log.Error("The call to ImportHistoryDuplicates.LoadForm() failed", ex);
        }
    }

    /// <summary>
    /// Resolves the duplicate.
    /// </summary>
    /// <param name="itemId">The item id.</param>
    private void ResolveDuplicate(string itemId)
    {
        try
        {
            IMatchDuplicateProvider dupProvider = GetDuplicateProvider(itemId);
            if (DialogService != null && dupProvider != null)
            {
                DialogService.SetSpecs(200, 200, 600, 800, "LeadSearchAndConvert",
                                       GetLocalResourceObject("Title.Resolve.Duplicate.ImportLead").ToString(), true);
                DialogService.DialogParameters.Add("duplicateProvider", dupProvider);
                DialogService.DialogParameters.Add("importHistoryItemId", itemId);
                DialogService.EntityType = typeof (IImportHistory);
                DialogService.EntityID = itemId;
                DialogService.ShowDialog();
                chkShowDuplicates.Checked = false;
            }
        }
        catch (Exception exp)
        {
            var sSlxErrorId = ErrorHelper.GetNewLoggingId();
            log.Error(ErrorHelper.AppendSlxErrorId("The call to ImportHistoryDuplicates.ResolveDuplicate() failed", sSlxErrorId), exp);
            throw new UserObservableApplicationException(String.Format(GetLocalResourceObject("LoadErrorMSG").ToString(), sSlxErrorId), exp);
        }
    }

    /// <summary>
    /// Transforms to target object.
    /// </summary>
    /// <param name="itemId">The item</param>
    /// <returns></returns>
    private IMatchDuplicateProvider GetDuplicateProvider(string itemId)
    {
        IImportHistoryItem item = Sage.Platform.EntityFactory.GetById<IImportHistoryItem>(itemId);
        IImportHistory importHistory = Sage.Platform.EntityFactory.GetById<IImportHistory>(item.ImportHistoryId);
        ImportTemplateManager templateManager = new ImportTemplateManager(importHistory.Data, Type.GetType(importHistory.EntityType));
        ImportCSVOptions csvOptions = new ImportCSVOptions();

        templateManager.LoadImportSourceOptions(csvOptions);
        StringBuilder sb = new StringBuilder();
        if (csvOptions.FirstRowColHeader)
        {
            string colheader = string.Empty;
            int lastColIndex = templateManager.SourceProperties.Count;
            int index = 0;
            foreach (ImportSourceProperty sp in templateManager.SourceProperties)
            {
                index++;
                colheader = colheader + Convert.ToString(csvOptions.Qualifier) + sp.FieldName +
                            Convert.ToString(csvOptions.Qualifier);
                if (lastColIndex != index)
                {
                    colheader = colheader + Convert.ToString(csvOptions.Delimiter);
                }
            }
            sb.AppendLine(colheader);
        }
        sb.AppendLine(item.Data);
        ImportCSVReader sourceReader = GetCSVReader(sb.ToString());
        sourceReader.Options = csvOptions;

        ImportTransformationManager transformationManager =
            new ImportTransformationManager(templateManager.EntityManager.EntityType, templateManager.ImportMaps,
                                            templateManager.TargetPropertyDefaults);

        //Calculated properties?
        transformationManager.TransformationProvider = new ImportTransformationProvider();
        sourceReader.MoveToNext();
        object targetEntityObj = Sage.Platform.EntityFactory.Create(templateManager.EntityManager.EntityType);
        transformationManager.FillEntity(sourceReader.CurrentRecord, targetEntityObj);

        //Need to make this more generic
        IMatchDuplicateProvider dupProvider = new LeadDuplicateProvider();
        dupProvider.AdvancedOptions = templateManager.MatchAdvancedOptions;
        dupProvider.AdvancedOptions.AutoMerge = false;
        foreach (string filter in templateManager.MatchFilters)
        {
            dupProvider.SetActiveFilter(filter, true);
        }
        MatchEntitySource entitySource = new MatchEntitySource(templateManager.EntityManager.EntityType, targetEntityObj);
        dupProvider.EntitySource = entitySource;

        return dupProvider;
    }

    /// <summary>
    /// Gets the CSV reader.
    /// </summary>
    /// <param name="data">The data.</param>
    /// <returns></returns>
    private ImportCSVReader GetCSVReader(string data)
    {  
        MemoryStream stream = new MemoryStream(ASCIIEncoding.ASCII.GetBytes(data));
        byte[] bData = new byte[stream.Length];
        stream.Read(bData, 0, Convert.ToInt32(stream.Length));
        ImportCSVReader reader = new ImportCSVReader(bData);
        stream.Close();
        return reader;
    }

    #endregion
}