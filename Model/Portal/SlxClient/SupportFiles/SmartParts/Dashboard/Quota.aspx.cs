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
using System.Globalization;

public partial class SmartParts_Dashboard_Quota : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!this.IsPostBack )
        {

            BindGridview();
            //GetChartData for all users
            // Intialize GridView
            if (grdMonthDetail.Columns.Count > 0)
            {
                grdMonthDetail.DataSource = null;
            }
           DataTable dt = Get_TotalSales_DetailChartData();
           grdMonthDetail.DataSource = dt;
        
            //=================================================
            // Format the Data Grid so the currency's look good
            //==================================================
           double  result;

           grdMonthDetail.DataBind();

           for (int i = 0; i < grdMonthDetail.Rows.Count; i++)
           {
               foreach (TableCell c in grdMonthDetail.Rows[i].Cells)
               {
                   if (double.TryParse(c.Text, out result))
                   {
                       c.Text = String.Format("{0:c}", result);
                   }
               }
           }

            //===========================================================
            // Set the Hidden Values for the Chart JavaScript to read
            //===========================================================
           string MonthValues1 = "";
           string MonthValues2 = "";
           string MonthNames = "";
           foreach (DataRow row in dt.Rows)
           {
               MonthValues1 +=Convert.ToInt64 (row[1]).ToString() + ","; //Sales Target
               MonthValues2 += Convert.ToInt64(row[3]).ToString() + ","; //Sales Actual
               MonthNames += Left(row[0].ToString(), 3) + ",";
           }


           hiddenTotalValues1.Value = Left(MonthValues1, MonthValues1.Length - 1); //Remove trailing comma
           hiddenTotalValues2.Value = Left(MonthValues2, MonthValues2.Length - 1); //Remove trailing comma
           hiddenMonthValues.Value = Left(MonthNames, MonthNames.Length - 1); //Remove trailing comma

           hiddenLegendValues1.Value = "Total Sales Target- " + Left(GetformatedStartDate(), 4);
           hiddenLegendValues2.Value = "Total Sales Actual- " + Left(GetformatedEndDate(), 4);
           lblColumnChart.Text = " Totals Sales:         " + GetStartDate().ToString("MMMM dd, yyyy") + " - " + GetEndDate().ToString("MMMM dd, yyyy"); 
        }


       
    }
    public static string Left(string text, int length)
    {
        if (text != null)
        {

            if (length < 0)
                throw new ArgumentOutOfRangeException("length", length, "length must be > 0");
            else if (length == 0 || text.Length == 0)
                return "";
            else if (text.Length <= length)
                return text;
            else
                return text.Substring(0, length);
        }
        else
        {
            //Null String entered
            return string.Empty;
        }
    }
    protected double Get_TotalSales_TotalSalesTarget(string startdate, string enddate)

    {
        double dblReturn = 0;
        //Get Current user
        Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
        Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
        //=====================================================================================
        // Define the SQL Statement note the StartDate and EndDate are typically for 1 Month
        //======================================================================================
        string SQL = @"SELECT     SUM(FLOOR(ISNULL(tmpTargetSales.TargetSales, 0))) AS TotalTargetSales
FROM         sysdba.USERINFO INNER JOIN
                      sysdba.USERSECURITY ON sysdba.USERINFO.USERID = sysdba.USERSECURITY.USERID LEFT OUTER JOIN
                          (SELECT     USERID, SUM(AMOUNT) AS TargetSales
                            FROM          sysdba.EUROQUOTA
                            WHERE      (BEGINDATE >= '" + startdate + @"') AND (ENDDATE <= '" + enddate  + @"') AND (QUOTAACTIVE = 'T') AND 
                                                   (QUOTATYPE = 'Total Sales')
                            GROUP BY USERID) AS tmpTargetSales ON sysdba.USERINFO.USERID = tmpTargetSales.USERID LEFT OUTER JOIN
                          (SELECT     ACCOUNTMANAGERID, SUM(ACTUALAMOUNT) AS TotalSales
                            FROM          sysdba.OPPORTUNITY
                            WHERE      (ACTUALCLOSE >= '" + startdate + @"') AND (ACTUALCLOSE <= '" + enddate + @"') AND (STATUS = 'Closed - Won')
                            GROUP BY ACCOUNTMANAGERID) AS tmpActualSales ON sysdba.USERINFO.USERID = tmpActualSales.ACCOUNTMANAGERID
WHERE     (sysdba.USERINFO.USERID IN
                          (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                            FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON S_AA.ACCESSID = '" +  currentuser.Id.ToString() + @"' AND OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID AND 
                                                   OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL)) AND (sysdba.USERSECURITY.TYPE = 'N')
";
        //=================================================================================================================================
        // Get Additional User Filter information if the Hidden field on the form has data Parse this data and adjust the SQL statement
        //===============================================================================================================================
        if (hdnFldSelectedValues.Value  != "")
        {
            //Parse the
            //Get Ids
            string strSQLFilter = " AND (sysdba.USERINFO.USERID IN (''"; //Intialzie the Filter String
            string[] IDs = hdnFldSelectedValues.Value.Trim().Split('|');

            //Code for deleting items
            foreach (string Item in IDs)
            {
                //Call appropiate method for deletion operation.
                if (Item != string.Empty)
                {
                    strSQLFilter +=  ",'" + Item + "'";
                }
            }
            strSQLFilter += "))"; // Complete the SQL statement with correct syntax

            hdnFldSelectedValues.Value = "";
            SQL += strSQLFilter;
            //=======================================================================
            // ADD SQL Filter to Main SQL Statement
            //========================================================================
        }
        //=======================================================================
        // ADD SQL Filter to Main SQL Statement
        //========================================================================

        using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(GetNativeConnectionString("masterkey")))
        {
            conn.Open();
            using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand(SQL , conn))
            {
                OleDbDataReader reader = cmd.ExecuteReader();
                //loop through the reader
                while (reader.Read())
                {
                    dblReturn = Convert.ToDouble( reader["TotalTargetSales"]);
                    

                }
                reader.Close();
            }
        }

        return dblReturn;
    }
    protected double Get_TotalSales_TotalSalesActual(string startdate, string enddate)
    {
        double dblReturn = 0;
        //Get Current user
        Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
        Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
        //=====================================================================================
        // Define the SQL Statement note the StartDate and EndDate are typically for 1 Month
        //======================================================================================
        string SQL = @"SELECT      SUM(FLOOR(ISNULL(tmpActualSales.TotalSales, 0))) AS TotalActualSales
FROM         sysdba.USERINFO INNER JOIN
                      sysdba.USERSECURITY ON sysdba.USERINFO.USERID = sysdba.USERSECURITY.USERID LEFT OUTER JOIN
                          (SELECT     USERID, SUM(AMOUNT) AS TargetSales
                            FROM          sysdba.EUROQUOTA
                            WHERE      (BEGINDATE >= '" + startdate + @"') AND (ENDDATE <= '" + enddate + @"') AND (QUOTAACTIVE = 'T') AND 
                                                   (QUOTATYPE = 'Total Sales')
                            GROUP BY USERID) AS tmpTargetSales ON sysdba.USERINFO.USERID = tmpTargetSales.USERID LEFT OUTER JOIN
                          (SELECT     ACCOUNTMANAGERID, SUM(ACTUALAMOUNT) AS TotalSales
                            FROM          sysdba.OPPORTUNITY
                            WHERE      (ACTUALCLOSE >= '" + startdate + @"') AND (ACTUALCLOSE <= '" + enddate + @"') AND (STATUS = 'Closed - Won')
                            GROUP BY ACCOUNTMANAGERID) AS tmpActualSales ON sysdba.USERINFO.USERID = tmpActualSales.ACCOUNTMANAGERID
WHERE     (sysdba.USERINFO.USERID IN
                          (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                            FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON S_AA.ACCESSID = '" + currentuser.Id.ToString() + @"' AND OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID AND 
                                                   OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL)) AND (sysdba.USERSECURITY.TYPE = 'N')
";
        //=================================================================================================================================
        // Get Additional User Filter information if the Hidden field on the form has data Parse this data and adjust the SQL statement
        //===============================================================================================================================
        if (hdnFldSelectedValues.Value != "")
        {
            //Parse the
            //Get Ids
            string strSQLFilter = " AND (sysdba.USERINFO.USERID IN (''"; //Intialzie the Filter String
            string[] IDs = hdnFldSelectedValues.Value.Trim().Split('|');

            //Code for deleting items
            foreach (string Item in IDs)
            {
                //Call appropiate method for deletion operation.
                if (Item != string.Empty)
                {
                    strSQLFilter += ",'" + Item + "'";
                }
            }
            strSQLFilter += "))"; // Complete the SQL statement with correct syntax

            hdnFldSelectedValues.Value = "";
            SQL += strSQLFilter;
            //=======================================================================
            // ADD SQL Filter to Main SQL Statement
            //========================================================================
        }
        //=======================================================================
        // ADD SQL Filter to Main SQL Statement
        //========================================================================

        using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(GetNativeConnectionString("masterkey")))
        {
            conn.Open();
            using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand(SQL, conn))
            {
                OleDbDataReader reader = cmd.ExecuteReader();
                //loop through the reader
                while (reader.Read())
                {
                    dblReturn = Convert.ToDouble(reader["TotalActualSales"]);


                }
                reader.Close();
            }
        }

        return dblReturn;
    }
    protected double Get_NumberofMonthsForPeriod(string startdate, string enddate)
    {
        double dblReturn = 0;
        //Get Current user
        Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
        Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
        //=====================================================================================
        // Define the SQL Statement note the StartDate and EndDate are typically for 1 Month
        //======================================================================================
        string SQL = @"Select DATEDIFF (   MONTH , '" + startdate + @"', '" + enddate  + "') + 1 as TotalMonths "  ;   //  --add One as this is zero based 
                            
        using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(GetNativeConnectionString("masterkey")))
        {
            conn.Open();
            using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand(SQL, conn))
            {
                OleDbDataReader reader = cmd.ExecuteReader();
                //loop through the reader
                while (reader.Read())
                {
                    dblReturn = Convert.ToDouble(reader["TotalMonths"]);


                }
                reader.Close();
            }
        }

        return dblReturn;
    }

    protected DataTable  Get_TotalSales_DetailChartData()
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

        //==============================================================
        // Here we create a DataTable with four columns.
        //==============================================================
        DataTable table = new DataTable();
        table.Columns.Add("MonthYear", typeof(string));
        table.Columns.Add("SalesTarget", typeof(double));
        table.Columns.Add("TargetCummulative", typeof(double));
        table.Columns.Add("SalesActual", typeof(double));
        table.Columns.Add("ActualCummulative", typeof(double)); 
        table.Columns.Add("Difference", typeof(double));

        string tmpMonth;
        double tmpSalesTarget = 0;
        double tmpCumulativeTarget = 0 ; //Intialize
        double tmpSalesActual = 0;
        double tmpCummulativeActual = 0;
        double tmpMonthlySalesTarget = 0;
        double tmpDifference = 0;

        string tmpStartdate = "";
        string tmpEnddate = "";
        DateTime dtEnddate;
        string tmpDate = "";

        double tmpTotalSalesTarget = 0;
        double tmpNumMonths = 0;

        //======================================================================================
        // We Need to get the Total Target for the  Period divieded by the number of Months
        //======================================================================================
        if (Get_NumberofMonthsForPeriod(strStartDate, strEndDate ) > 0)
        {
            tmpTotalSalesTarget = Get_TotalSales_TotalSalesTarget(strStartDate, strEndDate );
            tmpNumMonths = Get_NumberofMonthsForPeriod(strStartDate , strEndDate );
            tmpMonthlySalesTarget = tmpTotalSalesTarget / tmpNumMonths    ;
        }
        else
        {
            // To Ensure Divsion by Zero Rules don't cause and Expeption
            tmpMonthlySalesTarget = 0;
        }
        


        for (int i = 0; i < 12; i++) // Maximum 12 Months
        {
            if (StartDate.AddMonths(i) <= EndDate )
            {
                //================================================================
                // format the Date as we will need it for our SQL Statements
                //WHERE      (BEGINDATE >= '20120901 00:00:00') AND (ENDDATE <= '20130831 23:59:59') 
                //======================================================================================
                tmpStartdate = string.Format("{0:yyyy}", StartDate.AddMonths(i)); //Year
                tmpStartdate += StartDate.AddMonths(i).Month.ToString("d2"); // Month digit
                tmpStartdate += "01 00:00:00"; // Day First of the Month

                tmpEnddate = string.Format("{0:yyyy}", StartDate.AddMonths(i)); //Year
                tmpEnddate += StartDate.AddMonths(i).Month.ToString("d2"); // Month digit

                tmpDate = string.Format("{0:yyyy}", StartDate.AddMonths(i+1)) + StartDate.AddMonths(i+1).Month.ToString("d2")+ "01";
                // Get the Next Months first day to Subtract by One day to get the Last day of the current Month
                 DateTime.TryParseExact(tmpDate, "yyyyMMdd", CultureInfo.InvariantCulture,DateTimeStyles.None,out dtEnddate );
                 tmpEnddate += dtEnddate.AddDays(-1).Day.ToString("d2") + " 23:59:59"; // Day First of the Next Month -1

                
                 //======================================   
                 // Get Display Month
                //=======================================
                tmpMonth = String.Format("{0:MMM}", StartDate.AddMonths(i)) + "-" + String.Format("{0:yyyy}", StartDate.AddMonths(i));

                //========================================
                // Get Sales Target 
                //========================================
                tmpSalesTarget = tmpMonthlySalesTarget; 
 
                //=========================================
                // Get Cumulative Target
                //=========================================
                tmpCumulativeTarget += tmpSalesTarget;

                //=========================================
                // Get Sales Actual
                //=========================================
                tmpSalesActual = Get_TotalSales_TotalSalesActual(tmpStartdate, tmpEnddate);

                //=========================================
                // Get Sales Actual Cumulative 
                //=========================================
                tmpCummulativeActual += tmpSalesActual;

                //=========================================
                // Get Difference 
                //=========================================
                tmpDifference = tmpCummulativeActual - tmpCumulativeTarget;

               //Add Row To datatable
               
                table.Rows.Add(tmpMonth, tmpSalesTarget, tmpCumulativeTarget, tmpSalesActual, tmpCummulativeActual, tmpDifference);   
            }
        }
        //================================================================
        // Return the DataTable to the Grid
        //=================================================================
        return table;

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

    protected string GetListofAvailableUsers()
    {
        string strUserList = "''"; // Intialize False
        //Get Current user
        Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
        Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
        // get the DataService to get a connection string to the database
       

        string SQL = "";
        SQL = "SELECT DISTINCT ACCOUNTMANAGERID FROM  OPPORTUNITY";

        Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
        using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
        {
            conn.Open();
            using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand(SQL, conn))
            {
                OleDbDataReader reader = cmd.ExecuteReader();
                //loop through the reader
                while (reader.Read())
                {
                    if (reader["ACCOUNTMANAGERID"].ToString() != string.Empty)
                    {
                        strUserList += strUserList + ",'" + reader["ACCOUNTMANAGERID"].ToString() + "'";
                    }


                }
                reader.Close();
            }
        }
        return strUserList;
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
        //=============================
        // format so it looks Good
        //=============================
        double result;
        for (int i = 0; i < GridView1.Rows.Count; i++)
        {
            foreach (TableCell c in GridView1.Rows[i].Cells)
            {
                if (double.TryParse(c.Text, out result))
                {
                    c.Text = String.Format("{0:c}", result);
                }
            }
        }
        


        
       
    }
    protected string GetSQL()
    {
        //Get Current user
        Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
        Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
        string strReturn = "";
        string strStartDate = GetformatedStartDate();
        string strEndDate = GetformatedEndDate();
        switch (ddlQuotaType.Text) 
        {
            //======================================
            case "Total Sales":
                //======================================
                strReturn = @"SELECT     sysdba.USERINFO.USERID, sysdba.USERINFO.USERNAME, 
Floor(Isnull(tmpActualSales.TotalSales,0)) as TotalSales, 
Floor(isnull(tmpTargetSales.TargetSales,0))as TargetSales,
Floor(Isnull(tmpActualSales.TotalSales,0) - isnull(tmpTargetSales.TargetSales,0)) As TotalDifference
FROM         sysdba.USERINFO INNER JOIN
                      sysdba.USERSECURITY ON sysdba.USERINFO.USERID = sysdba.USERSECURITY.USERID LEFT OUTER JOIN
                          (SELECT     USERID, SUM(AMOUNT) AS TargetSales
                            FROM          sysdba.EUROQUOTA
                            WHERE      (BEGINDATE >= '" + strStartDate + @"') AND (ENDDATE <= '" + strEndDate + @"') AND (QUOTAACTIVE = 'T') AND 
                                                   (QUOTATYPE = 'Total Sales')
                            GROUP BY USERID) AS tmpTargetSales ON sysdba.USERINFO.USERID = tmpTargetSales.USERID LEFT OUTER JOIN
                       (SELECT     ACCOUNTMANAGERID, SUM(ACTUALAMOUNT) AS TotalSales
                            FROM          sysdba.OPPORTUNITY
                            WHERE      (ACTUALCLOSE >= '" + strStartDate + @"') AND (ACTUALCLOSE <= '" + strEndDate + @"') AND (STATUS = 'Closed - Won')
                            GROUP BY ACCOUNTMANAGERID) AS tmpActualSales ON sysdba.USERINFO.USERID = tmpActualSales.ACCOUNTMANAGERID
WHERE     (sysdba.USERINFO.USERID IN
                          (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                            FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON S_AA.ACCESSID = '" + currentuser.Id.ToString() + @"' AND OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID AND 
                                                   OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL)) AND (sysdba.USERSECURITY.TYPE = 'N')
ORDER BY sysdba.USERINFO.USERNAME         
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

    protected DateTime GetStartDate()
    {
        string strStartDate = GetformatedStartDate();
        int iYear;
        int iMonth;
        int iDay;
        iYear = Convert.ToInt16(strStartDate.Substring(0, 4));
        iMonth = Convert.ToInt16(strStartDate.Substring(4, 2));
        iDay = Convert.ToInt16(strStartDate.Substring(6, 2));

        DateTime StartDate = new DateTime(iYear, iMonth, iDay, 0, 0, 0);
        return StartDate;
    }
    protected DateTime GetEndDate()
    {
        string strEndDate = GetformatedEndDate ();
        int iYear;
        int iMonth;
        int iDay;
        iYear = Convert.ToInt16(strEndDate.Substring(0, 4));
        iMonth = Convert.ToInt16(strEndDate.Substring(4, 2));
        iDay = Convert.ToInt16(strEndDate.Substring(6, 2));

        DateTime StartDate = new DateTime(iYear, iMonth, iDay, 23, 59, 59);
        return StartDate;
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
