using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Entity.Interfaces;
using Sage.Platform.Application;
using Sage.Platform;
using System.Collections.Generic;
using Sage.Platform.Application.UI;
using Sage.Common.Syndication.Json;
using System.Text;
using System.Linq;

public partial class SmartParts_AddOpportunityProduct : EntityBoundSmartPartInfoProvider, IScriptControl
{
    public class ClientConfiguration
    {
        private string _id;
        private string _clientId;
        private string _selectedNodesClientId;
        private string _productTreeTitle;
        private string _queryState;
        
        /// <summary>
        /// Gets or sets the ID.
        /// </summary>
        /// <value>The ID.</value>
        [JsonProperty("id")]
        public string ID
        {
            get { return _id; }
            set { _id = value; }
        }

        /// <summary>
        /// Gets or sets the client ID.
        /// </summary>
        /// <value>The client ID.</value>
        [JsonProperty("clientId")]
        public string ClientID
        {
            get { return _clientId; }
            set { _clientId = value; }
        }


        /// <summary>
        /// Gets or sets the selected nodes client ID.
        /// </summary>
        /// <value>The selected nodes client ID.</value>
        [JsonProperty("selectedNodesClientId")]
        public string SelectedNodesClientID
        {
            get { return _selectedNodesClientId; }
            set { _selectedNodesClientId = value; }
        }


        /// <summary>
        /// Gets or sets the product tree title.
        /// </summary>
        /// <value>The product tree title.</value>
        [JsonProperty("productTreeTitle")]
        public string ProductTreeTitle
        {
            get { return _productTreeTitle; }
            set { _productTreeTitle = value; }
        }

        [JsonProperty("queryState")]
        public string QueryState
        {
            get { return _queryState; }
            set { _queryState = value; }
        }
        /// <summary>
        /// Froms the specified control.
        /// </summary>
        /// <param name="control">The control.</param>
        /// <returns></returns>
        public static ClientConfiguration From(SmartParts_AddOpportunityProduct control)
        {
            ClientConfiguration configuration = new ClientConfiguration();
            configuration.ID = control.ID;
            configuration.ClientID = control.ClientID;
            configuration.SelectedNodesClientID = control.selectedNodes.ClientID;
            configuration.ProductTreeTitle = control.GetLocalResourceObject("lblAvailableProducts_rsc.Text") as string;
            return configuration;
        }
    }

    public class AddProductStateInfo
    {
        public bool Packages = false;
        public string NameFilter = string.Empty;
        public string DescFilter = string.Empty;
        public string FamilyFilter = string.Empty;
        public string StatusFilter = string.Empty;
        public string SKUFilter = string.Empty;
        public int NameCond = 0;
        public int DescCond = 0;
        public int SKUCond = 0;
    }

    public enum SearchParameter 
    {
        StartingWith, 
        Contains, 
        EqualTo, 
        NotEqualTo, 
        EqualOrLessThan, 
        EqualOrGreaterThan, 
        LessThan, 
        GreaterThan 
    }

    private IContextService _Context;
    private AddProductStateInfo _State;
    private ClientConfiguration treeConfig = null;

    /// <summary>
    /// Gets the <see cref="T:Sage.Platform.Application.IEntityContextService"/> instance
    /// </summary>
    /// <value></value>
    [ServiceDependency]
    public new IEntityContextService EntityContext { set; get; }

    /// <summary>
    /// Gets the type of the entity.
    /// </summary>
    /// <value>The type of the entity.</value>
    public override Type EntityType
    {
        get { return typeof(IOpportunity); }
    }

    /// <summary>
    /// Handles the Init event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Init(object sender, EventArgs e)
    {
        _Context = ApplicationContext.Current.Services.Get<IContextService>();
        _State = _Context.GetContext("AddProductStateInfo") as AddProductStateInfo;
        if (_State == null) {_State = new AddProductStateInfo();}

    }

    private void LoadTreeConfig()
    {
        if (treeConfig == null)
        {
            // we only want to run the script when the content is actually there
            treeConfig = ClientConfiguration.From(this);
        }

        treeConfig.QueryState = BuildQueryFromState();
        btnAdd.Visible = true;

        // ToDo: Place this message elsewhere so that it can be displayed when the sdata returns 0
        lblEnterCriteriaMessage.Visible = false;

        StringBuilder script = new StringBuilder();
        script.AppendFormat("SmartParts.Opportunity.AddOpportunityProduct.create('{0}', {1})", ID,
                            JavaScriptConvert.SerializeObject(treeConfig));

        if (ScriptManager.GetCurrent(Page).IsInAsyncPostBack)
            ScriptManager.RegisterStartupScript(Page, typeof (Page), "add-opportunity-product-init",
                                                script.ToString(), true);
    }

    private string BuildQueryFromState()
    {
        StringBuilder queryStringState = new StringBuilder();
        queryStringState.AppendFormat("&Packages={0}&NameFilter={1}&FamilyFilter={2}&NameCond={3}", 
            _State.Packages,_State.NameFilter,_State.FamilyFilter,_State.NameCond);
        queryStringState.AppendFormat("&StatusFilter={0}&SKUFilter={1}&SKUCond={2}",
            _State.StatusFilter,_State.SKUFilter,_State.SKUCond);
        
        return queryStringState.ToString();
    }

    /// <summary>
    /// Raises the <see cref="E:PreRender"/> event.
    /// </summary>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        base.OnPreRender(e);

        // only load this if there is a postback and the filter has been defined.
        LoadTreeConfig();
        ClientBindingMgr.RegisterDialogCancelButton(cmdCancel);

        if (Visible)
        {
            IOpportunity opportunity = BindingSource.Current as IOpportunity;

            // required to register the .js file used in this page
            if (DesignMode == false)
                if (ScriptManager.GetCurrent(Page) != null)
                    ScriptManager.GetCurrent(Page).RegisterScriptControl(this);

            if (opportunity != null)
            {
                dtsProducts.SelectParameters.Clear();
                string oppId = string.Empty;
                if (!(opportunity.Id == null))
                    oppId = opportunity.Id.ToString();

                dtsProducts.SelectParameters.Add("opportunityId", oppId);
                grdProducts.DataBind();
            }
        }

        if (chkPackage.Checked != _State.Packages)
        {
            chkPackage_CheckedChanged(null, null);
        }
    }

    /// <summary>
    /// Handles the Click event of the btnAdd control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
	protected void btnAdd_Click(object sender, EventArgs e)
	{
		IOpportunity opportunity = BindingSource.Current as IOpportunity;

		IList<IOpportunityProduct> selProducts = new List<IOpportunityProduct>();
		if(_State.Packages)
			selProducts = GetSelectedPackageProducts();
		else
			selProducts = GetSelectedProducts();

		foreach (IOpportunityProduct oppProduct in selProducts)
		{
			bool isInList = ProductIsAssociatedToOpportunity(opportunity, oppProduct.Product);

			if (!isInList) // if this product is not already in the product list, add them
			{
				oppProduct.Sort = Convert.ToInt32(opportunity.Products.Count) + 1;
				oppProduct.Discount = 0;

				if (oppProduct.Product.ProductProgram.Count != 0)
				{
					// find the default programPrice for this product
					foreach (IProductProgram prodProgram in oppProduct.Product.ProductProgram)
					{
						if (prodProgram.DefaultProgram == true)
						{
							oppProduct.CalculatedPrice = prodProgram.Price;
							oppProduct.Program = prodProgram.Program;
							oppProduct.Price = prodProgram.Price;
							break;
						}
					}
				}
				else
				{
					oppProduct.CalculatedPrice = Convert.ToDecimal(oppProduct.Product.Price);
					oppProduct.Price = oppProduct.Product.Price;
				}

				decimal discountedPrice = oppProduct.CalculatedPrice.HasValue ? oppProduct.CalculatedPrice.Value : 0;
				decimal qty = oppProduct.Quantity.HasValue ? Convert.ToDecimal(oppProduct.Quantity.Value) : 0;
				oppProduct.ExtendedPrice = Sage.SalesLogix.OpportunityProduct.Rules.GetLineItemPrice(discountedPrice, qty);
				opportunity.Products.Add(oppProduct);
			}
			else
			{
				IOpportunityProduct op = opportunity.Products.SingleOrDefault(p => p.Product.Id.Equals(oppProduct.Product.Id));
				if (op != null) op.Quantity += oppProduct.Quantity;
			}

		}
	}

	private bool ProductIsAssociatedToOpportunity(IOpportunity opportunity, IProduct product)
	{
		bool isInList = false;

		foreach (IOpportunityProduct op in opportunity.Products)
		{
			if (op.Product.Id.Equals(product.Id))
			{
				isInList = true;
				break;
			}
		}

		return isInList;
	}
	private IList<IOpportunityProduct> GetSelectedPackageProducts()
	{
		IOpportunity opportunity = BindingSource.Current as IOpportunity;
		List<string> selectedProductIDs = new List<string>(selectedNodes.Value.Split(','));
		IList<IOpportunityProduct> products = new List<IOpportunityProduct>();
		foreach (string prodId in selectedProductIDs)
		{
			string pkgId = string.Empty;
			string productId = string.Empty;
			List<string> parentChild = new List<string>(prodId.Split('|'));
			if (parentChild.Count > 1) // we have a package if this is true
			{
				pkgId = parentChild[0];
				productId = parentChild[1];
			}

			IPackage pkg = EntityFactory.GetById<IPackage>(pkgId);
			IPackageProduct pkgProduct = pkg.PackageProducts.SingleOrDefault(p=>p.Package.Id.ToString() == pkgId && p.Product.Id.ToString() == productId);
			if (pkgProduct != null)
			{
				IOpportunityProduct op = EntityFactory.Create<IOpportunityProduct>();
				op.Product = pkgProduct.Product;
				op.Quantity = pkgProduct.Quantity;
				op.Opportunity = opportunity;
				products.Add(op);
			}

		}

		return products;
	}
	private IList<IOpportunityProduct> GetSelectedProducts()
	{
		IOpportunity opportunity = BindingSource.Current as IOpportunity;
        List<string> selectedProductIDs = new List<string>(selectedNodes.Value.Split(',')); // could contain list of products and/or packages

		// first get a list of products to add to the products grid
		IList<IOpportunityProduct> products = new List<IOpportunityProduct>();
        foreach (string prodId in selectedProductIDs)
        {
			IProduct product = EntityFactory.GetById<IProduct>(prodId);
			if (product != null)
			{
				IOpportunityProduct op = EntityFactory.Create<IOpportunityProduct>();
				op.Product = product;
				op.Quantity = 1;
				op.Opportunity = opportunity;
				products.Add(op);
			}

		}
		return products;
	}
    

    /// <summary>
    /// Override this method to add bindings to the currrently bound smart part
    /// </summary>
    protected override void OnAddEntityBindings()
    {
    }

    /// <summary>
    /// Handles the Click event of the Clear control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Clear_Click(object sender, EventArgs e)
    {
        chkName.Checked = false;
        chkSKU.Checked = false;
        ddlName.Text = String.Empty;
        ddlSKU.Text = String.Empty;
        txtName.Text = String.Empty;
        txtSKU.Text = String.Empty;
        chkFamily.Checked = false;
        chkStatus.Checked = false;
        chkPackage.Checked = false;
        _State.Packages = false;
        _State.NameFilter = string.Empty;
        _State.DescFilter = string.Empty;
        _State.FamilyFilter = string.Empty;
        _State.StatusFilter = string.Empty;
        _State.SKUFilter = string.Empty;

        _Context.SetContext("AddProductStateInfo", _State);

        treeConfig = null;
    }

    /// <summary>
    /// Handles the Click event of the btnShowResults control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void btnShowResults_Click(object sender, EventArgs e)
    {
        treeConfig = null;
        _State.NameFilter = string.Empty;
        _State.DescFilter = string.Empty;
        _State.FamilyFilter = string.Empty;
        _State.StatusFilter = string.Empty;
        _State.SKUFilter = string.Empty;
        if (chkName.Checked)
        {
            _State.NameFilter = txtName.Text;
            _State.NameCond = ddlName.SelectedIndex;
        }

        if (chkSKU.Checked)
        {
            _State.SKUFilter = txtSKU.Text;
            _State.SKUCond = ddlSKU.SelectedIndex;
        }

        if (chkFamily.Checked)
        {
            _State.FamilyFilter = pklProductFamily.PickListValue;
        }

        if (chkStatus.Checked)
        {
            _State.StatusFilter = pklProductStatus.PickListValue;
        }
        _Context.SetContext("AddProductStateInfo", _State);

    }

    /// <summary>
    /// Handles the CheckedChanged event of the chkPackage control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void chkPackage_CheckedChanged(object sender, EventArgs e)
    {
        if (_State.Packages == chkPackage.Checked) return;
        _State.Packages = chkPackage.Checked;
        _Context.SetContext("AddProductStateInfo", _State);

        // don't want this to load on the click event of the checkbox, wait until user clicks on Show Results
        //hidIsTreeLoaded.Value = Boolean.FalseString;

        chkSKU.Enabled = !chkPackage.Checked;
        chkFamily.Enabled = !chkPackage.Checked;
        chkStatus.Enabled = !chkPackage.Checked;
        txtSKU.Enabled = !chkPackage.Checked;
        ddlSKU.Enabled = !chkPackage.Checked;
        pklProductFamily.Enabled = !chkPackage.Checked;
        pklProductStatus.Enabled = !chkPackage.Checked;
        chkName.Text = chkPackage.Checked
                           ? GetLocalResourceObject("chkPackageName_rsc").ToString()
                           : GetLocalResourceObject("chkName_rsc").ToString();
    }

    #region ISmartPartInfoProvider Members

    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo tinfo = new Sage.Platform.WebPortal.SmartParts.ToolsSmartPartInfo();

        foreach (Control c in this.AddOpportunityProducts_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    #endregion

    protected void cmdOK_Click(object sender, EventArgs e)
    {
        IOpportunity opportunity = BindingSource.Current as IOpportunity;
        double salesPotential = 0;
        foreach (IOpportunityProduct product in opportunity.Products)
        {
            salesPotential += Convert.ToDouble(product.ExtendedPrice);
        }

        opportunity.SalesPotential = Convert.ToDouble(salesPotential);
        if ((opportunity.PersistentState & Sage.Platform.Orm.Interfaces.PersistentState.New) <= 0)
        {
            opportunity.Save();
        }
        DialogService.CloseEventHappened(sender, e);
        Refresh();
    }

    protected void cmdCancel_Click(object sender, EventArgs e)
    {
        DialogService.CloseEventHappened(sender, e);
    }

    protected static double checkDiscountVal(object value)
    {
        double discount;
        if (value == null)
            discount = 0;
        else
            discount = (double) value;
        return discount;
    }

    protected static string checkFormat(object value)
    {
        return value == null ? "" : "{0:p}";
    }

    protected void dtsProducts_Updating(object sender, ObjectDataSourceMethodEventArgs e)
    {
    }

    protected void pklProductFamily_PickListValueChanged(object sender, EventArgs e)
    {
        IOpportunity opportunity = BindingSource.Current as IOpportunity;
        string productId = ((HiddenField) grdProducts.Rows[grdProducts.EditIndex].FindControl("hidProductId")).Value;
        string program =
            ((Sage.SalesLogix.Web.Controls.PickList.PickListControl)
             grdProducts.Rows[grdProducts.EditIndex].FindControl("txtProgram")).PickListValue;
        
        foreach(IOpportunityProduct op in opportunity.Products)
        {
            if(op.Product.Id.ToString() == productId)
            {
                op.Program = program;
                Sage.SalesLogix.Opportunity.Rules.CalcPriceFromProgramPrice(op);
                break;
            }
        }
    }

    protected void grdProducts_RowUpdating(object sender, GridViewUpdateEventArgs e)
    {
        if (e.NewValues["Discount"] != null &&
            (Convert.ToDouble(e.NewValues["Discount"]) < 0 || Convert.ToDouble(e.NewValues["Discount"]) > 1))
        {
            e.Cancel = true;
            throw new ValidationException(GetLocalResourceObject("Validation_DiscountOutOfRange").ToString());
        }
    }

    #region IScriptControl Members

    public IEnumerable<ScriptDescriptor> GetScriptDescriptors()
    {
        yield break;
    }

    public IEnumerable<ScriptReference> GetScriptReferences()
    {
        yield return new ScriptReference("~/SmartParts/Opportunity/AddOpportunityProduct.js");
    }

    #endregion
}
