using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data.OleDb;
using System.Data;
using System.Data.SqlClient;
using System.Text.RegularExpressions;

public partial class SmartParts_Dashboard_Quota : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!this.IsPostBack )
        {
            BindGridview();
            //GetChartData for all users
            GetChartDataForAllUser();
        }



       
    }

    protected void GetChartDataForAllUser()
    {
        string strStartDate = GetformatedStartDate();
        string strEndDate = GetformatedEndDate();
        
        int TotalSales = 0;
        int TotalTarget = 0;
        int TotalDifference = 0;
        string strTotalSales = "";
        string strTotalTarget = "";
        int iYear;
        int iMonth;
        int iDay;
        iYear = Convert.ToInt16( strStartDate.Substring(0,4)); 
        iMonth = Convert.ToInt16 (strStartDate.Substring(4,2));
        iDay = Convert.ToInt16 (strStartDate.Substring(6,2));

        DateTime StartDate = new DateTime(iYear, iMonth, iDay, 0, 0, 0);
        // Calculate the EndDate
        iYear = Convert.ToInt16(strEndDate.Substring(0, 4));
        iMonth = Convert.ToInt16(strEndDate.Substring(4, 2));
        iDay = Convert.ToInt16(strEndDate.Substring(6, 2));
        DateTime EndDate = new DateTime(iYear, iMonth, iDay, 23, 59, 59);

        for (int i = 0; i < 12; i++) // Maximum 12 Months
        {
            if (StartDate.AddMonths(i) <= EndDate )
            {
                GetSingleMonthTotalSalesChartDataAllUsers(StartDate.AddMonths(i),out TotalSales);
                strTotalSales += TotalSales.ToString() + ",";
                GetSingleMonthTotalTargetChartDataAllUsers(out TotalTarget);
                strTotalTarget += TotalTarget.ToString() + ",";
            }
        }
    }

    protected void GetSingleMonthTotalSalesChartDataAllUsers(DateTime StartDate, out int TotalSales)
    {
        TotalSales = 0;
       
        string strSQL = "";
            
        //20120901 00:00:00
        string strStartDate = StartDate.Year.ToString()+ StartDate.Month.ToString().PadLeft(2, '0')  + "01 00:00:00"; // First Day of the Month
        string strEndDate = StartDate.AddMonths(1).Year.ToString() + StartDate.AddMonths(1).Month.ToString().PadLeft(2, '0') + "01 00:00:00"; // First Day of the Next Month  
        switch (ddlQuotaType.Text) 
        {
            //======================================
            case "Value of Sales":
                //======================================
                strSQL = @" Select
Sum(Floor(Isnull(tmpActualSales.TotalSales,0))) as TotalSales
FROM         sysdba.USERINFO LEFT OUTER JOIN
                          (SELECT     ACCOUNTMANAGERID, SUM(ACTUALAMOUNT) AS TotalSales
                            FROM          sysdba.OPPORTUNITY
                            WHERE      (ACTUALCLOSE >= '" + strStartDate + @"') AND (ACTUALCLOSE <= '" + strEndDate + @"') AND (STATUS = 'Closed - Won')
                            GROUP BY ACCOUNTMANAGERID) AS tmpActualSales ON sysdba.USERINFO.USERID = tmpActualSales.ACCOUNTMANAGERID
WHERE     (sysdba.USERINFO.USERID IN
                          (SELECT DISTINCT ACCOUNTMANAGERID
                            FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1)) 
AND (sysdba.USERINFO.USERID IN
                          (SELECT     USERID
                            FROM          sysdba.USERSECURITY
                            WHERE      (TYPE = 'N')))                                                       
";
                break;
                //======================================
            case "Number Closed Sales":
                //======================================
                strSQL = "";
                break;
            //======================================
            case "Number Open Opportunties":
                //======================================
                strSQL = "";
                break;
            //======================================
            default:
                //======================================
                
                break;
        }
        //============================================================
        // Get Data Reader and Return the Chart Data
        //=============================================================
        //create the connection
        OleDbConnection conn = new OleDbConnection(GetNativeConnectionString("masterkey"));
        try
        {
            //open connection
            conn.Open();
            //create the command and call ExecuteReader to create the DataReader
            //myString.Replace(System.Environment.NewLine, "replacement text")
            OleDbCommand cmd = new OleDbCommand(strSQL.Replace(System.Environment.NewLine," " ) , conn);
            OleDbDataReader reader = cmd.ExecuteReader();

            //loop through the reader
            while (reader.Read())
            {
                TotalSales = Convert.ToInt16  (reader["Totalsales"]);
              
            }
            reader.Close();
        }
        catch (Exception ex)
        {
            //MessageBox.Show("An error occurred: " + ex.Message, "Error");
        }
        finally
        {
            conn.Dispose();
            conn = null;
        }
    }
    protected void GetSingleMonthTotalTargetChartDataAllUsers( out int TotalTarget)
    {
        TotalTarget = 0;

        string strSQL = "";

        //20120901 00:00:00
        string strStartDate = GetformatedStartDate();
        string strEndDate = GetformatedEndDate();
        switch (ddlQuotaType.Text)
        {
            //======================================
            case "Value of Sales":
                //======================================
                strSQL = @"SELECT    Floor(Sum(Isnull((tmpTargetSales.TargetSales / 12),0))) AS TotalMonthlyTarget
FROM         sysdba.USERINFO LEFT OUTER JOIN
                          (SELECT     USERID, SUM(AMOUNT) AS TargetSales
                            FROM          sysdba.EUROQUOTA
                            WHERE      (BEGINDATE >= '" + strStartDate + @"') AND (ENDDATE <= '" + strEndDate + @"') AND (QUOTAACTIVE = 'T') AND 
                                                   (QUOTATYPE = 'Value of Sales')
                            GROUP BY USERID) AS tmpTargetSales ON sysdba.USERINFO.USERID = tmpTargetSales.USERID
WHERE     (sysdba.USERINFO.USERID IN
                          (SELECT DISTINCT ACCOUNTMANAGERID
                            FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1)) AND (sysdba.USERINFO.USERID IN
                          (SELECT     USERID
                            FROM          sysdba.USERSECURITY
                            WHERE      (TYPE = 'N')))
                                                                               
";
                break;
            //======================================
            case "Number Closed Sales":
                //======================================
                strSQL = "";
                break;
            //======================================
            case "Number Open Opportunties":
                //======================================
                strSQL = "";
                break;
            //======================================
            default:
                //======================================

                break;
        }
        //============================================================
        // Get Data Reader and Return the Chart Data
        //=============================================================
        //create the connection
        OleDbConnection conn = new OleDbConnection(GetNativeConnectionString("masterkey"));
        try
        {
            //open connection
            conn.Open();
            //create the command and call ExecuteReader to create the DataReader
            strSQL = strSQL.Replace(System.Environment.NewLine, " ");
            OleDbCommand cmd = new OleDbCommand(strSQL, conn);
            OleDbDataReader reader = cmd.ExecuteReader();

            //loop through the reader
            while (reader.Read())
            {
                TotalTarget = Convert.ToInt16(reader["TotalMonthlyTarget"]);

            }
            reader.Close();
        }
        catch (Exception ex)
        {
            //MessageBox.Show("An error occurred: " + ex.Message, "Error");
        }
        finally
        {
            conn.Dispose();
            conn = null;
        }
    }


    

    private void BindGridview()
    {
        // Intialize GridView
        if (GridView1.Columns.Count > 0) 
        {
            GridView1.Columns.RemoveAt(0); // Get rid of the Intial Checkbox column
            GridView1.DataSource = null;
        }


        string SQL = GetSQL();
        DataTable tbl = GetDATA(SQL);

        // Add Non databound Selected Column
        TemplateField tf = new TemplateField();
        tf.HeaderText = ""; //Selected
        tf.ItemTemplate = new MyCustomTemplate();

        GridView1.DataSource = tbl;
        GridView1.Columns.Add(tf);
      
        GridView1.DataBind();
        


        
       
    }
    protected string GetSQL()
    {
        string strReturn = "";
        string strStartDate = GetformatedStartDate();
        string strEndDate = GetformatedEndDate();
        switch (ddlQuotaType.Text) 
        {
            //======================================
            case "Value of Sales":
                //======================================
                strReturn = @"SELECT     sysdba.USERINFO.USERID, sysdba.USERINFO.USERNAME, 
Floor(Isnull(tmpActualSales.TotalSales,0)) as TotalSales, 
Floor(isnull(tmpTargetSales.TargetSales,0))as TargetSales,
Floor(Isnull(tmpActualSales.TotalSales,0) - isnull(tmpTargetSales.TargetSales,0)) As TotalDifference
FROM         sysdba.USERINFO LEFT OUTER JOIN
                          (SELECT     USERID, SUM(AMOUNT) AS TargetSales
                            FROM          sysdba.EUROQUOTA
                            WHERE      (BEGINDATE >= '" + strStartDate + @"') AND (ENDDATE <= '" + strEndDate + @"') AND (QUOTAACTIVE = 'T') AND 
                                                   (QUOTATYPE = 'Value of Sales')
                            GROUP BY USERID) AS tmpTargetSales ON sysdba.USERINFO.USERID = tmpTargetSales.USERID LEFT OUTER JOIN
                          (SELECT     ACCOUNTMANAGERID, SUM(ACTUALAMOUNT) AS TotalSales
                            FROM          sysdba.OPPORTUNITY
                            WHERE      (ACTUALCLOSE >= '" + strStartDate + @"') AND (ACTUALCLOSE <= '" + strEndDate + @"') AND (STATUS = 'Closed - Won')
                            GROUP BY ACCOUNTMANAGERID) AS tmpActualSales ON sysdba.USERINFO.USERID = tmpActualSales.ACCOUNTMANAGERID
WHERE     (sysdba.USERINFO.USERID IN
                          (SELECT DISTINCT ACCOUNTMANAGERID
                            FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1)) 
AND (sysdba.USERINFO.USERID IN
                          (SELECT     USERID
                            FROM          sysdba.USERSECURITY
                            WHERE      (TYPE = 'N')))
Order by USERNAME                                                         
";
                break;
                //======================================
            case "Number Closed Sales":
                //======================================
                strReturn = "";
                break;
            //======================================
            case "Number Open Opportunties":
                //======================================
                strReturn = "";
                break;
            //======================================
            default:
                //======================================
                
                break;
        }
        return strReturn;
    }

    protected string GetformatedStartDate()
    {
        string strReturn = "";
        string strYear;
        string strMonth;
        string strDay;
        //Needs to Output this format
        //20120901 00:00:00
        switch (ddlPeriod.Text )
        {
                
            //======================================
            case "Fiscal YTD":
                //======================================
                // Fiscal Year starts Setember 1 2013
                //N
                if (DateTime.Now.Month >= 9)
                {
                    strYear = DateTime.Now.Year.ToString ();  // Use Current Year
                    strMonth = "09"; // September
                    strDay = "01";
                }
                else
                {
                    strYear = (DateTime.Now.Year -1).ToString();  // Use Last Year
                    strMonth = "09"; // September
                    strDay = "01";
                }
                strReturn = strYear+strMonth+strDay + " 00:00:00";//20120901 00:00:00
                break;
            //======================================
            case "Fiscal QTD":
                //======================================
                strReturn = "";
                break;
            //======================================
            case "Fiscal MTD":
                //======================================
                strReturn = "";
                break;
                
                 //======================================
            case "Last 90 Days":
                //======================================
                strReturn = "";
                break;
                 //======================================
            case "Last 60 Days":
                //======================================
                strReturn = "";
                break;
                 //======================================
            case "FLast 30 Days":
                //======================================
                strReturn = "";
                break;
                 //======================================
            case "Custom Dates":
                //======================================
                strReturn = "";
                break;
             
            //======================================
            default:
                //======================================

                break;
        }
        return strReturn;
    }
    protected string GetformatedEndDate()
    {
        string strReturn = "";
        string strYear;
        string strMonth;
        string strDay;
        //Needs to Output this format
        //20120901 00:00:00
        switch (ddlPeriod.Text)
        {

            //======================================
            case "Fiscal YTD":
                //======================================
                // Fiscal Year starts Setember 1 2013
                // Fiscal Year Ends August 31 
                //N
                if (DateTime.Now.Month >= 9)
                {
                    strYear = (DateTime.Now.Year + 1).ToString();  // Use Next Year  
                    strMonth = "08"; // August
                    strDay = "31";
                }
                else
                {
                    strYear = (DateTime.Now.Year).ToString();  // Use Current Year
                    strMonth = "08"; // August
                    strDay = "31";
                }
                strReturn = strYear + strMonth + strDay + " 23:59:59";//20120901 00:00:00
                break;
            //======================================
            case "Fiscal QTD":
                //======================================
                strReturn = "";
                break;
            //======================================
            case "Fiscal MTD":
                //======================================
                strReturn = "";
                break;

            //======================================
            case "Last 90 Days":
                //======================================
                strReturn = "";
                break;
            //======================================
            case "Last 60 Days":
                //======================================
                strReturn = "";
                break;
            //======================================
            case "FLast 30 Days":
                //======================================
                strReturn = "";
                break;
            //======================================
            case "Custom Dates":
                //======================================
                strReturn = "";
                break;

            //======================================
            default:
                //======================================

                break;
        }
        return strReturn;
    }

    public static string GetNativeConnectionString(string sysdbaPassword)
    {
        //dbltmpMargin = GetField<decimal>("Isnull(PctAdj,'0')", "vDefaultPriceGroupMargin", "ProdPriceGroupID = '" + ProdCategoryID + "' AND WhseID = '" + tmpDefaultMasterWhse + "'");
        String SQL = "slx_getNativeConnInfo()";

        string strReturn = "";



        // Generate In SQL statement
        Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
        //using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
        using (OleDbConnection conn = new OleDbConnection(datasvc.GetConnectionString()))
        {
            conn.Open();
            using (OleDbCommand cmd = new OleDbCommand(SQL, conn))
            {
                OleDbDataReader r = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                while (r.Read())
                {
                    strReturn = Convert.ToString (r[0])+ ";password=" + sysdbaPassword ;
                   
                   
                }
                r.Close();
            }
        }

        return strReturn;
    }

    public static DataTable GetDATA(string SQL)
    {
        //dbltmpMargin = GetField<decimal>("Isnull(PctAdj,'0')", "vDefaultPriceGroupMargin", "ProdPriceGroupID = '" + ProdCategoryID + "' AND WhseID = '" + tmpDefaultMasterWhse + "'");
        //String SQL = "Select top 10 Accountid,Account,createdate from sysdba.Account";

        string strReturn = "";

        

        // Generate In SQL statement
        Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
        //using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
        using (OleDbConnection conn = new OleDbConnection(GetNativeConnectionString("masterkey")))
        {
            conn.Open();
            using (OleDbDataAdapter da = new OleDbDataAdapter(SQL, conn))
            {
                //now create the DataSet and use the adapter to fill it
                DataSet ds = new DataSet();
                da.Fill(ds);

                //pull out the created DataTable to work with
                //our table is the first and only one in the tables collection
                DataTable table = ds.Tables[0];

                return table;
                
                //bind the table to a grid
                
                
            }
        }

       
    }

 
    protected void GridView1_RowDataBound(object sender, GridViewRowEventArgs e)
    {
        if (e.Row.RowType == DataControlRowType.DataRow && (e.Row.RowState == DataControlRowState.Normal || e.Row.RowState == DataControlRowState.Alternate))
        {
            CheckBox chkBxSelect = (CheckBox)e.Row.Cells[0].FindControl("chkSelect");
            //System.Web.UI.HtmlControls.HtmlInputCheckBox chkBxHeader = (System.Web.UI.HtmlControls.HtmlInputCheckBox)this.GridView1.HeaderRow.FindControl("chkAll");
            //HiddenField hdnFldId = (HiddenField)e.Row.Cells[0].FindControl("hdnFldId");

            //hdnFldId.Value = e.Row.Cells[1].Text; // SET Correct USID Value for Grid // If None Selected do it for all.

            chkBxSelect.Attributes["onclick"] = string.Format("javascript:ChildClick(this,'{0}');", e.Row.Cells[1].Text);

            //Hide UserId column
            e.Row.Cells[1].Visible = false;
        }
    }
    protected void Button1_Click(object sender, EventArgs e)
    {
        //Get Ids
        string[] IDs = hdnFldSelectedValues.Value.Trim().Split('|');
        BindGridview();
    }
    protected void GridView1_RowCreated(object sender, GridViewRowEventArgs e)
    {
        //Hide the Header Row of Userid

      e.Row.Cells[1].Visible = false;

    }
}
/* Create Template Field by Implementing ITemplate */
public class MyCustomTemplate : ITemplate
{
    public void InstantiateIn(System.Web.UI.Control container)
    {
        CheckBox cb = new CheckBox();
        cb.ID = "chkSelect";
        cb.Text = "";
        container.Controls.Add(cb);
        //HiddenField hf = new HiddenField(); 
        // hf.ID = "hdnFldId";
        // container.Controls.Add(hf);
    }
}
