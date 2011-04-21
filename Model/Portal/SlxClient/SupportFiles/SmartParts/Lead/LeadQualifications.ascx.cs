using System;
using System.Collections.Generic;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Orm;
using Sage.Platform.Repository;
using Sage.Platform.WebPortal.SmartParts;

/// <summary>
/// The SmartParts_Lead_LeadQualifications class is used to display and update LeadQualification entities for the current Lead entity.
/// </summary>
public partial class SmartParts_Lead_LeadQualifications : EntityBoundSmartPart
{
    #region Constants

    const string cDisplayNone = "display:none";
    const string cQualificationId = "QualificationId";

    #endregion

    #region EntityBoundSmartPart Methods

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(ILead); }
    }

    /// <summary>
    /// Called when adding bindings to the currrently bound smart part.
    /// </summary>
    protected override void OnAddEntityBindings()
    {
        /* Not used. */
    }

    /// <summary>
#pragma warning disable 1574
    /// Raises the <see cref="E:PreRender"/> event.
#pragma warning restore 1574
    /// </summary>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        base.OnPreRender(e);
        const string cOnChange = "onchange";
        const string cConfirmChange = "javascript:confirmChange();";
        cboQualifications.Attributes.Add(cOnChange, cConfirmChange);
    }

    /// <summary>
    /// Called after the Page_Load event of the base EntityBoundSmartPart class.
    /// </summary>
    /// <param name="sender">The sender.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected override void InnerPageLoad(object sender, EventArgs e)
    {
        LoadQualificationCategories();
    }

    /// <summary>
    /// Called when the control event handlers are wired up.
    /// </summary>
    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
        /* Is Lead already a customer? Link */
        cmdConvertLeadLink.Click += cmdConvertLeadLink_ClickAction;
        /* Combo */
        cboQualifications.SelectedIndexChanged += cboQualifications_SelectedIndexChanged;
        /* Text Controls */
        txtQualificationDescription1.TextChanged += txtQualificationDescription_TextChanged;
        txtQualificationDescription2.TextChanged += txtQualificationDescription_TextChanged;
        txtQualificationDescription3.TextChanged += txtQualificationDescription_TextChanged;
        txtQualificationDescription4.TextChanged += txtQualificationDescription_TextChanged;
        txtQualificationDescription5.TextChanged += txtQualificationDescription_TextChanged;
        txtQualificationDescription6.TextChanged += txtQualificationDescription_TextChanged;
        txtQualificationDescription7.TextChanged += txtQualificationDescription_TextChanged;
        txtQualificationDescription8.TextChanged += txtQualificationDescription_TextChanged;
        /* CheckBoxes */
        chkQualificationSelected1.CheckedChanged += ChkQualificationSelectedCheckedChanged;
        chkQualificationSelected2.CheckedChanged += ChkQualificationSelectedCheckedChanged;
        chkQualificationSelected3.CheckedChanged += ChkQualificationSelectedCheckedChanged;
        chkQualificationSelected4.CheckedChanged += ChkQualificationSelectedCheckedChanged;
        chkQualificationSelected5.CheckedChanged += ChkQualificationSelectedCheckedChanged;
        chkQualificationSelected6.CheckedChanged += ChkQualificationSelectedCheckedChanged;
        chkQualificationSelected7.CheckedChanged += ChkQualificationSelectedCheckedChanged;
        chkQualificationSelected8.CheckedChanged += ChkQualificationSelectedCheckedChanged;
    }

    /// <summary>
    /// Called when the form is bound to the current entity.
    /// </summary>
    protected override void OnFormBound()
    {
        base.OnFormBound();
        LoadLeadQualifications();
    }

    /// <summary>
    /// Called when client scripts are registered.
    /// </summary>
    protected override void OnRegisterClientScripts()
    {
        const string cConfirmChange = "ConfirmChange";

        base.OnRegisterClientScripts();
        if (!Page.ClientScript.IsClientScriptBlockRegistered(cConfirmChange))
        {
            const string cConfirmationQuestion = "ConfirmationQuestion";
            string strQuestion = GetLocalResourceObject(cConfirmationQuestion).ToString();
            string cboId = cboQualifications.ClientID;
            string chk1Id = chkQualificationSelected1.ClientID;
            string chk2Id = chkQualificationSelected2.ClientID;
            string chk3Id = chkQualificationSelected3.ClientID;
            string chk4Id = chkQualificationSelected4.ClientID;
            string chk5Id = chkQualificationSelected5.ClientID;
            string chk6Id = chkQualificationSelected6.ClientID;
            string chk7Id = chkQualificationSelected7.ClientID;
            string chk8Id = chkQualificationSelected8.ClientID;
            string htxtId = htxtConfirmation.ClientID;
            StringBuilder sb = new StringBuilder();
            sb.Append("function confirmChange() {");
            sb.AppendFormat("var bChk1 = document.getElementById('{0}').checked;", chk1Id);
            sb.AppendFormat("var bChk2 = document.getElementById('{0}').checked;", chk2Id);
            sb.AppendFormat("var bChk3 = document.getElementById('{0}').checked;", chk3Id);
            sb.AppendFormat("var bChk4 = document.getElementById('{0}').checked;", chk4Id);
            sb.AppendFormat("var bChk5 = document.getElementById('{0}').checked;", chk5Id);
            sb.AppendFormat("var bChk6 = document.getElementById('{0}').checked;", chk6Id);
            sb.AppendFormat("var bChk7 = document.getElementById('{0}').checked;", chk7Id);
            sb.AppendFormat("var bChk8 = document.getElementById('{0}').checked;", chk8Id);
            sb.Append("var bChecked = bChk1 || bChk2 || bChk3 || bChk4 || bChk5 || bChk6 || bChk7 || bChk8;");
            sb.Append("if (bChecked)");
            sb.Append("{");
            sb.AppendFormat("var resp = window.confirm ('{0}');", strQuestion);
            sb.AppendFormat("document.getElementById('{0}').value = resp;", htxtId);
            sb.Append("}");
            sb.AppendFormat("if (Sys) Sys.WebForms.PageRequestManager.getInstance()._doPostBack('{0}', null);", cboId);
            sb.Append("}");
            Page.ClientScript.RegisterClientScriptBlock(GetType(), cConfirmChange, sb.ToString(), true);
        }
    }

    #endregion

    #region Helper Methods

    /// <summary>
    /// Adds the QualificationId attribute to the controls at sets the attribute value to the Id. 
    /// </summary>
    /// <param name="checkbox">The checkbox.</param>
    /// <param name="textbox">The textbox.</param>
    /// <param name="Id">The Id.</param>
    protected static void AddQualficationIdAttributeTo(CheckBox checkbox, TextBox textbox, string Id)
    {
        checkbox.Attributes.Add(cQualificationId, Id);
        textbox.Attributes.Add(cQualificationId, Id);
    }

    /// <summary>
    /// Finds the LeadQualification entity within the LeadQualication collection that matches the Qualification.
    /// </summary>
    /// <param name="qualication">The Qualifiation.</param>
    /// <param name="lead_qualifications">The LeadQualifications.</param>
    /// <returns></returns>
    protected static ILeadQualification FindLeadQualification(IQualification qualication, IList<ILeadQualification> lead_qualifications)
    {
        ILeadQualification result = null;
        foreach (ILeadQualification lead_qual in lead_qualifications)
        {
            if (lead_qual.Qualification.Equals(qualication))
            {
                result = lead_qual;
                break;
            }
        }
        return result;
    }

    /// <summary>
    /// Gets the current Lead entity.
    /// </summary>
    /// <returns></returns>
    protected ILead GetCurrentLead()
    {
        ILead lead = null;
        object obj = BindingSource.Current;
        if (obj != null)
        {
            lead = (obj as ILead);
        }
        return lead;
    }

    /// <summary>
    /// Gets the LeadQualification entity based on the parameters.
    /// </summary>
    /// <param name="lead">The Lead.</param>
    /// <param name="qualification">The Qualification.</param>
    /// <returns></returns>
    protected static ILeadQualification GetLeadQualification(ILead lead, IQualification qualification)
    {
        using (new SessionScopeWrapper())
        {
            ILeadQualification result;
            IRepository<ILeadQualification> rep = EntityFactory.GetRepository<ILeadQualification>();
            IQueryable qry = (IQueryable)rep;
            IExpressionFactory ep = qry.GetExpressionFactory();
            ICriteria crt = qry.CreateCriteria();
            IJunction all = ep.Conjunction();
            const string cLead = "Lead";
            all.Add(ep.Eq(cLead, lead));
            const string cQualification = "Qualification";
            all.Add(ep.Eq(cQualification, qualification));
            crt.Add(all);
            result = crt.UniqueResult<ILeadQualification>();
            return result;
        }
    }

    /// <summary>
    /// Gets a collection of LeadQualfication entities based on the parameters.
    /// </summary>
    /// <param name="qualificationCategory">The QualificationCategory.</param>
    /// <param name="qualifications">The Qualifications.</param>
    /// <param name="lead">The Lead.</param>
    /// <returns></returns>
    protected static IList<ILeadQualification> GetLeadQualifications(IQualificationCategory qualificationCategory, IList<IQualification> qualifications, ILead lead)
    {
        using (new SessionScopeWrapper())
        {
            IList<ILeadQualification> list;
            IRepository<ILeadQualification> rep = EntityFactory.GetRepository<ILeadQualification>();
            IQueryable qry = (IQueryable)rep;
            IExpressionFactory ep = qry.GetExpressionFactory();
            ICriteria crt = qry.CreateCriteria();
            IJunction all = ep.Conjunction();
            const string cLead = "Lead";
            all.Add(ep.Eq(cLead, lead));
            const string cQualification = "Qualification";
            all.Add(ep.In(cQualification, (System.Collections.ICollection)qualifications));
            crt.Add(all);
            list = crt.List<ILeadQualification>();
            return list;
        }
    }

    /// <summary>
    /// Gets the collection of QualificationCategory entities.
    /// </summary>
    /// <returns></returns>
    protected static IList<IQualificationCategory> GetQualificationCategories()
    {
        using (new SessionScopeWrapper())
        {
            IList<IQualificationCategory> list;
            IRepository<IQualificationCategory> rep = EntityFactory.GetRepository<IQualificationCategory>();
            IQueryable qry = (IQueryable)rep;
            IExpressionFactory ep = qry.GetExpressionFactory();
            ICriteria crt = qry.CreateCriteria();
            const string cCategoryName = "CategoryName";
            crt.AddOrder(ep.Asc(cCategoryName));
            list = crt.List<IQualificationCategory>();
            return list;
        }
    }

    /// <summary>
    /// Gets the collection of Qualification entities for the QualificationCategory.
    /// </summary>
    /// <param name="qualificationCategory">The QualificationCategory</param>
    /// <returns></returns>
    protected static IList<IQualification> GetQualifications(IQualificationCategory qualificationCategory)
    {
        using (new SessionScopeWrapper())
        {
            IList<IQualification> list;
            IRepository<IQualification> rep = EntityFactory.GetRepository<IQualification>();
            IQueryable qry = (IQueryable)rep;
            IExpressionFactory ep = qry.GetExpressionFactory();
            ICriteria crt = qry.CreateCriteria();
            const string cQualificationCategory = "QualificationCategory";
            crt.Add(ep.Eq(cQualificationCategory, qualificationCategory));
            const string cSortPosition = "SortPosition";
            crt.AddOrder(ep.Asc(cSortPosition));
            list = crt.List<IQualification>();
            return list;
        }
    }

    /// <summary>
    /// Loads the LeadQualification entities and displays the corresponding data for the current Lead.
    /// </summary>
    protected void LoadLeadQualifications()
    {
        ILead lead = GetCurrentLead();
        IQualificationCategory currentCategory = null;
        if (lead != null)
        {
            currentCategory = lead.QualificationCategory;
        }
        if (currentCategory == null)
        {
            /* Set the list to the first category?...or the last selected category? */
            ListItem selected_item = cboQualifications.SelectedItem;
            if (selected_item != null)
            {
                currentCategory = EntityFactory.GetById<IQualificationCategory>(selected_item.Value);
            }
        }
        else
        {
            ListItem item;
            item = cboQualifications.Items.FindByValue(currentCategory.Id.ToString());
            if (item != null)
            {
                cboQualifications.SelectedValue = item.Value;
            }
        }
        ILeadQualification lead_qual;
        IList<IQualification> qualifications = GetQualifications(currentCategory);
        IList<ILeadQualification> lead_qualifications = GetLeadQualifications(currentCategory, qualifications, lead);
        string strChkStyle;
        string strTxtStyle;
        string strNotes;
        bool bChecked;
        bool bShowNotes;
        bool bVisible;
        string qualId;
        int sortPos;
        string desc;

        for(int i = 0; i < 8; i++)
        {
            if (i < qualifications.Count)
            {
                IQualification qual = qualifications[i];

                bVisible = qual.Visible.HasValue ? qual.Visible.Value : false;
                if (bVisible)
                {
                    lead_qual = FindLeadQualification(qual, lead_qualifications);
                    bChecked = (lead_qual != null)
                                   ? (lead_qual.Checked.HasValue ? lead_qual.Checked.Value : false)
                                   : false;
                    strNotes = (lead_qual != null) ? lead_qual.Notes : string.Empty;
                    bShowNotes = qual.ShowNotes.HasValue ? qual.ShowNotes.Value : false;

                    strChkStyle = (bVisible) ? string.Empty : cDisplayNone;
                    strTxtStyle = (bShowNotes) ? string.Empty : cDisplayNone;
                    qualId = qual.Id.ToString();
                    sortPos = qual.SortPosition.Value;
                    desc = qual.Description;
                    System.Web.UI.HtmlControls.HtmlTableRow container = (System.Web.UI.HtmlControls.HtmlTableRow)this.FindControl("container" + (i + 1));
                    container.Style[HtmlTextWriterStyle.Display] = "table-row";
                }
                else
                {
                    System.Web.UI.HtmlControls.HtmlTableRow container = (System.Web.UI.HtmlControls.HtmlTableRow)this.FindControl("container" + (i + 1));
                    container.Style[HtmlTextWriterStyle.Display] = "None";
                    continue;
                }
            }
            else
            {
                System.Web.UI.HtmlControls.HtmlTableRow container = (System.Web.UI.HtmlControls.HtmlTableRow)this.FindControl("container" + (i + 1));
                container.Style[HtmlTextWriterStyle.Display] = "None";
                continue;
            }

            switch (sortPos)
            {
                case 1:
                    chkQualificationSelected1.Style.Value = strChkStyle;
                    chkQualificationSelected1.Checked = bChecked;
                    chkQualificationSelected1_lz.Style.Value = strChkStyle;
                    txtQualificationDescription1.Style.Value = strTxtStyle;
                    txtQualificationDescription1.Text = strNotes;
                    chkQualificationSelected1_lz.Text = desc;
                    AddQualficationIdAttributeTo(chkQualificationSelected1, txtQualificationDescription1, qualId);
                    break;
                case 2:
                    chkQualificationSelected2.Style.Value = strChkStyle;
                    chkQualificationSelected2.Checked = bChecked;
                    chkQualificationSelected2_lz.Style.Value = strChkStyle;
                    txtQualificationDescription2.Style.Value = strTxtStyle;
                    txtQualificationDescription2.Text = strNotes;
                    chkQualificationSelected2_lz.Text = desc;
                    AddQualficationIdAttributeTo(chkQualificationSelected2, txtQualificationDescription2, qualId);
                    break;
                case 3:
                    chkQualificationSelected3.Style.Value = strChkStyle;
                    chkQualificationSelected3.Checked = bChecked;
                    chkQualificationSelected3_lz.Style.Value = strChkStyle;
                    txtQualificationDescription3.Style.Value = strTxtStyle;
                    txtQualificationDescription3.Text = strNotes;
                    chkQualificationSelected3_lz.Text = desc;
                    AddQualficationIdAttributeTo(chkQualificationSelected3, txtQualificationDescription3, qualId);
                    break;
                case 4:
                    chkQualificationSelected4.Style.Value = strChkStyle;
                    chkQualificationSelected4.Checked = bChecked;
                    chkQualificationSelected4_lz.Style.Value = strChkStyle;
                    txtQualificationDescription4.Style.Value = strTxtStyle;
                    txtQualificationDescription4.Text = strNotes;
                    chkQualificationSelected4_lz.Text = desc;
                    AddQualficationIdAttributeTo(chkQualificationSelected4, txtQualificationDescription4, qualId);
                    break;
                case 5:
                    chkQualificationSelected5.Style.Value = strChkStyle;
                    chkQualificationSelected5.Checked = bChecked;
                    chkQualificationSelected5_lz.Style.Value = strChkStyle;
                    txtQualificationDescription5.Style.Value = strTxtStyle;
                    txtQualificationDescription5.Text = strNotes;
                    chkQualificationSelected5_lz.Text = desc;
                    AddQualficationIdAttributeTo(chkQualificationSelected5, txtQualificationDescription5, qualId);
                    break;
                case 6:
                    chkQualificationSelected6.Style.Value = strChkStyle;
                    chkQualificationSelected6.Checked = bChecked;
                    chkQualificationSelected6_lz.Style.Value = strChkStyle;
                    txtQualificationDescription6.Style.Value = strTxtStyle;
                    txtQualificationDescription6.Text = strNotes;
                    chkQualificationSelected6_lz.Text = desc;
                    AddQualficationIdAttributeTo(chkQualificationSelected6, txtQualificationDescription6, qualId);
                    break;
                case 7:
                    chkQualificationSelected7.Style.Value = strChkStyle;
                    chkQualificationSelected7.Checked = bChecked;
                    chkQualificationSelected7_lz.Style.Value = strChkStyle;
                    txtQualificationDescription7.Style.Value = strTxtStyle;
                    txtQualificationDescription7.Text = strNotes;
                    chkQualificationSelected7_lz.Text = desc;
                    AddQualficationIdAttributeTo(chkQualificationSelected7, txtQualificationDescription7, qualId);
                    break;
                case 8:
                    chkQualificationSelected8.Style.Value = strChkStyle;
                    chkQualificationSelected8.Checked = bChecked;
                    chkQualificationSelected8_lz.Style.Value = strChkStyle;
                    txtQualificationDescription8.Style.Value = strTxtStyle;
                    txtQualificationDescription8.Text = strNotes;
                    chkQualificationSelected8_lz.Text = desc;
                    AddQualficationIdAttributeTo(chkQualificationSelected8, txtQualificationDescription8, qualId);
                    break;
                default:
                    System.Web.UI.HtmlControls.HtmlTableRow container = (System.Web.UI.HtmlControls.HtmlTableRow)this.FindControl("container" + i);
                    container.Visible = false;
                    break;
            }
        }
    }

    /// <summary>
    /// Loads the collection of QualificationCategory entities and assigns the collection to the cboQualifications control.
    /// </summary>
    protected void LoadQualificationCategories()
    {
        if (Visible & !IsPostBack)
        {
            if (cboQualifications.DataSource == null)
            {
                IList<IQualificationCategory> list = GetQualificationCategories();
                cboQualifications.DataSource = list;
                const string cCategoryName = "CategoryName";
                cboQualifications.DataTextField = cCategoryName;
                const string cId = "Id";
                cboQualifications.DataValueField = cId;
                cboQualifications.DataBind();
            }
        }
    }

    #endregion

    #region Control Event Handlers

    /// <summary>
    /// Handles the ClickAction event of the cmdConvertLeadLink control, used to display the Convert Lead dialog.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cmdConvertLeadLink_ClickAction(object sender, EventArgs e)
    {
        if (DialogService != null)
        {
            DialogService.SetSpecs(200, 200, 775, 875, "LeadSearchAndConvert", GetLocalResourceObject("DialogTitle").ToString(), true);
            DialogService.EntityType = typeof(ILead);
            DialogService.ShowDialog();
        }
    }

    /// <summary>
    /// Handles the CheckedChanged event of the chkQualificationSelected* controls, used to update the corresponding LeadQualification entity.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void ChkQualificationSelectedCheckedChanged(object sender, EventArgs e)
    {
		CheckBox cb = sender as CheckBox;
        if (cb != null)
        {
            string Id = cb.Attributes[cQualificationId];
            if (!string.IsNullOrEmpty(Id))
            {
                IQualification qualification = EntityFactory.GetById<IQualification>(Id);
                if (qualification != null)
                {
                    ILead lead = GetCurrentLead();
                    if (lead != null)
                    {
                        ILeadQualification lead_qual = GetLeadQualification(lead, qualification);
                        if (lead_qual != null)
                        {
                            lead_qual.Checked = cb.Checked;
                            lead_qual.Save();
                        }
                        else
                        {
                            ILeadQualification new_qual = EntityFactory.Create<ILeadQualification>();
                            new_qual.Lead = lead;
                            new_qual.Qualification = qualification;
                            new_qual.Checked = cb.Checked;
                            new_qual.Save();
                        }
                    }
                }
            }
        }
    }

    /// <summary>
    /// Handles the TextChanged event of the txtQualificationDescription* controls, used to update the corresponding LeadQualification entity.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void txtQualificationDescription_TextChanged(object sender, EventArgs e)
    {
		TextBox tb = sender as TextBox;
        if (tb != null)
        {
            string Id = tb.Attributes[cQualificationId];
            if (!string.IsNullOrEmpty(Id))
            {
                IQualification qualification = EntityFactory.GetById<IQualification>(Id);
                if (qualification != null)
                {
                    ILead lead = GetCurrentLead();
                    if (lead != null)
                    {
                        ILeadQualification lead_qual = GetLeadQualification(lead, qualification);
                        if (lead_qual != null)
                        {
                            lead_qual.Notes = tb.Text;
                            lead_qual.Save();
                        }
                        else
                        {                            
                            ILeadQualification new_qual = EntityFactory.Create<ILeadQualification>();
                            new_qual.Lead = lead;
                            new_qual.Qualification = qualification;
                            new_qual.Notes = tb.Text;
                            new_qual.Save();
                        }
                    }
                }
            }
        }
    }

    /// <summary>
    /// Handles the SelectedIndexChanged event of the cboQualifications control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void cboQualifications_SelectedIndexChanged(object sender, EventArgs e)
    {
        ListItem item = cboQualifications.SelectedItem;
        if (item != null)
        {
            using (NHibernate.ISession session = new SessionScopeWrapper())
            {
                ILead lead = GetCurrentLead();
                if (lead != null)
                {
                    IQualificationCategory currentCategory = lead.QualificationCategory;
                    if (currentCategory != null)
                    {
                        IList<IQualification> qualifications = GetQualifications(currentCategory);
                        if (qualifications != null)
                        {
                            IList<ILeadQualification> lead_qualifications = GetLeadQualifications(currentCategory, qualifications, lead);
                            if (lead_qualifications != null)
                            {
                                if (lead_qualifications.Count > 0)
                                {
                                    string confirmation = htxtConfirmation.Value;
                                    if (!string.IsNullOrEmpty(confirmation))
                                    {
                                        const string cFalse = "false";
                                        if (confirmation.ToLower() == cFalse)
                                        {
                                            cboQualifications.SelectedValue = currentCategory.Id.ToString();
                                            return;
                                        }
                                    }
                                    foreach (ILeadQualification lead_qual in lead_qualifications)
                                    {
                                        lead_qual.Delete();
                                    }
                                    lead_qualifications.Clear();
                                }
                            }
                        }
                    }
                    IQualificationCategory category = EntityFactory.GetById<IQualificationCategory>(item.Value);
                    if (category != null)
                    {
                        lead.QualificationCategory = category;
                        session.Update(lead);
                    }
                }
            }
        }
    }

    #endregion
}
