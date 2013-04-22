using System;
using System.Data;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.Application;
using Sage.Platform.Orm;
using Sage.Platform;
using Sage.Entity.Interfaces;
using Sage.Platform.Repository;

public partial class SmartParts_AccountReseller : EntityBoundSmartPartInfoProvider
{
    private IAccount _account;

    [ServiceDependency(Type = typeof(IEntityContextService), Required = true)]
    public IEntityContextService EntityService { get; set; }

    public override Type EntityType
    {
        get { return typeof(IAccount); }
    }

    protected override void OnAddEntityBindings()
    {
    }

    protected override void OnWireEventHandlers()
    {
        grdReseller.PageIndexChanging += grdReseller_PageIndexChanging;
        base.OnWireEventHandlers();
    }

    protected override void OnFormBound()
    {
        base.OnFormBound();
        _account = (IAccount)BindingSource.Current;
        LoadView();
    }

    public override Sage.Platform.Application.UI.ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in Reseller_RTools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        return tinfo;
    }

    protected void grdReseller_PageIndexChanging(object sender, GridViewPageEventArgs e)
    {
        grdReseller.PageIndex = e.NewPageIndex;
    }

    private void LoadView()
    {
        LoadStats();
        LoadGrid();
    }

    private void LoadStats()
    {
        DataTable dt = GetResellerStats(_account);
        string statusOpen = GetLocalResourceObject("Status_Open").ToString();
        string statusClosedWon = GetLocalResourceObject("Status_ClosedWon").ToString();
        string statusClosedLost = GetLocalResourceObject("Status_ClosedLost").ToString();
        string statusInactive = GetLocalResourceObject("Status_Inactive").ToString();

        if (string.IsNullOrEmpty(statusOpen))
        {
            statusOpen = "Open";
        }
        if (string.IsNullOrEmpty(statusClosedWon))
        {
            statusClosedWon = "Closed - Won";
        }
        if (string.IsNullOrEmpty(statusClosedLost))
        {
            statusClosedLost = "Closed - Lost";
        }
        if (string.IsNullOrEmpty(statusInactive))
        {
            statusInactive = "Inactive";
        }

        foreach (DataRow row in dt.Rows)
        {
            string status = Convert.ToString(row["STATUS"]);
            string count = Convert.ToString(row["Count"]);
            string total = Convert.ToString(row["Total"]);
            if (status == statusOpen)
            {
                txtOpenCount.Text = count;
                crnOpenTotal.Text = total;
            }
            if (status == statusClosedWon)
            {
                txtClosedWonCount.Text = count;
                crnClosedWonTotal.Text = total;
            }
            if (status == statusClosedLost)
            {
                txtClosedLostCount.Text = count;
                crnClosedLostTotal.Text = total;
            }
            if (status == statusInactive)
            {
                txtInactiveCount.Text = count;
                crnInactiveTotal.Text = total;
            }
        }
    }

    private void LoadGrid()
    {
        grdReseller.DataSource = GetResellerOppList(_account);
        grdReseller.DataBind();
    }

    private IList<IOpportunity> GetResellerOppList(IAccount account)
    {
        IList<IOpportunity> list;
        using (new SessionScopeWrapper())
        {
            IRepository<IOpportunity> rep = EntityFactory.GetRepository<IOpportunity>();
            IQueryable qry = (IQueryable)rep;
            IExpressionFactory ep = qry.GetExpressionFactory();
            ICriteria crt = qry.CreateCriteria();
            crt.Add(ep.Eq("Reseller", account));
            list = crt.List<IOpportunity>();
        }
        return list;
    }

    private DataTable GetResellerStats(IAccount account)
    {
        DataTable dt = new DataTable("OppStats");

        DataColumn dc = dt.Columns.Add();
        dc.ColumnName = "Status";
        dc.DataType = typeof(string);
        dc.AllowDBNull = true;

        dc = dt.Columns.Add();
        dc.ColumnName = "Count";
        dc.DataType = typeof(int);
        dc.AllowDBNull = true;

        dc = dt.Columns.Add();
        dc.ColumnName = "Total";
        dc.DataType = typeof(double);
        dc.AllowDBNull = true;

        DataRow drOpen = dt.NewRow();
        DataRow drClosedWon = dt.NewRow();
        DataRow drClosedLost = dt.NewRow();
        DataRow drInactive = dt.NewRow();

        string statusOpen = GetLocalResourceObject("Status_Open").ToString();
        string statusClosedWon = GetLocalResourceObject("Status_ClosedWon").ToString();
        string statusClosedLost = GetLocalResourceObject("Status_ClosedLost").ToString();
        string statusInactive = GetLocalResourceObject("Status_Inactive").ToString();

        if (string.IsNullOrEmpty(statusOpen))
        {
            statusOpen = "Open";
        }
        if (string.IsNullOrEmpty(statusClosedWon))
        {
            statusClosedWon = "Closed - Won";
        }
        if (string.IsNullOrEmpty(statusClosedLost))
        {
            statusClosedLost = "Closed - Lost";
        }
        if (string.IsNullOrEmpty(statusInactive))
        {
            statusInactive = "Inactive";
        }

        drOpen["Status"] = statusOpen;
        drClosedWon["Status"] = statusClosedWon;
        drClosedLost["Status"] = statusClosedLost;
        drInactive["Status"] = statusInactive;

        int openCount = 0;
        double openTotal = 0.0;
        int closedWonCount = 0;
        double closedWonTotal = 0.0;
        int closedLostCount = 0;
        double closedLostTotal = 0.0;
        int inactiveCount = 0;
        double inactiveTotal = 0.0;

        IList<IOpportunity> list = GetResellerOppList(account);

        foreach (IOpportunity opp in list)
        {
            if (opp.Status == statusOpen)
            {
                openCount++;
                openTotal = openTotal + (double)opp.SalesPotential;
            }
            if (opp.Status == statusClosedWon)
            {
                closedWonCount++;
                closedWonTotal = closedWonTotal + (double)opp.ActualAmount;
            }
            if (opp.Status == statusClosedLost)
            {
                closedLostCount++;
                closedLostTotal = closedLostTotal + (double)opp.SalesPotential;
            }
            if (opp.Status == statusInactive)
            {
                inactiveCount++;
                inactiveTotal = inactiveTotal + (double)opp.SalesPotential;
            }
        }

        drOpen["Count"] = openCount;
        drOpen["Total"] = openTotal;
        drClosedWon["Count"] = closedWonCount;
        drClosedWon["Total"] = closedWonTotal;
        drClosedLost["Count"] = closedLostCount;
        drClosedLost["Total"] = closedLostTotal;
        drInactive["Count"] = inactiveCount;
        drInactive["Total"] = inactiveTotal;

        dt.Rows.Add(drOpen);
        dt.Rows.Add(drClosedLost);
        dt.Rows.Add(drClosedWon);
        dt.Rows.Add(drInactive);

        return dt;
    }

    protected void grdReseller_RowDataBound(object sender, GridViewRowEventArgs e)
    {
        if (e.Row.RowType == DataControlRowType.DataRow)
        {
            IOpportunity opportunity = (IOpportunity)e.Row.DataItem;
            //Sales Potential
            Sage.SalesLogix.Web.Controls.Currency curr = (Sage.SalesLogix.Web.Controls.Currency)e.Row.Cells[2].Controls[1];
            curr.ExchangeRate = opportunity.ExchangeRate.GetValueOrDefault(1);
            curr.CurrentCode = opportunity.ExchangeRateCode;
        }
    }
}