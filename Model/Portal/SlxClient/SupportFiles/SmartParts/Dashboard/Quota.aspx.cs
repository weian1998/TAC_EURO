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
            RefreshAll();
                     
        }


       
    }


    protected void cmdRefresh_Click(object sender, EventArgs e)
    {
       
        RefreshAll();
       
    }
    protected void ddlQuotaType_SelectedIndexChanged(object sender, EventArgs e)
    {
        RefreshAll();
    }
    protected void RefreshAll()
    {
        DataTable dt = null;
        DataTable dt2 = null;
        switch (ddlQuotaType.Text)
        {
                //======================================
            case "Total Sales":
                //======================================
                // Get MainGrid Data
                 dt = Get_TotalSales_MainGrid_Data();
                // Refresh MainGrid 
                Refresh_TotalSalesMainGridView(dt);
                // Get DetailGrid Data
                 dt2 = Get_TotalSales_Detail_Data();
               
                // Refresh DetailGrid and Chart
                Refresh_TotalSales_DetailsGridandChart(dt2);

                
                break;
            //======================================
            case "Number of Quotes":
                //======================================
                // Get MainGrid Data
                 dt = Get_NumberQuotes_MainGrid_Data();
                // Refresh MainGrid 
                Refresh_NumberQuotesMainGridView(dt);
                // Get DetailGrid Data
                dt2 = Get_NumberQuotes_Detail_Data();

                // Refresh DetailGrid and Chart
                Refresh_NumberQuotes_DetailsGridandChart(dt2);
                break;
            //======================================
            case "Close Ratio":
                //======================================

                break;
            //======================================
            case "Won vs Lost":
                //======================================
                break;
            //======================================
            default:
                //======================================

                break;
        }
    }

    protected void GridView1_RowCreated(object sender, GridViewRowEventArgs e)
    {
        //Hide the Header Row of Userid

      e.Row.Cells[1].Visible = false;

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
            //============================================
            // Check if Data is in Hidden Field
            //============================================
            string[] IDs = hdnFldSelectedValues.Value.Trim().Split('|');
            foreach (string id in IDs)
            {
                if (e.Row.Cells[1].Text == id)
                {
                    chkBxSelect.Checked = true;
                    lblUserContext.Text += e.Row.Cells[2].Text + ", ";  //Add the UserName to the Selected Context menu

                }
            }

            //Hide UserId column
           
            e.Row.Cells[1].Visible = false;
        }
    }


    protected void ddlPeriod_SelectedIndexChanged(object sender, EventArgs e)
    {
        RefreshAll();
    }

    //===============================================
    #region TotalSales
    //===============================================
        protected DataTable Get_TotalSales_MainGrid_Data()
    {
         //Get Current user
        Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
        Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
        string strSQL = "";
        string strStartDate = GetformatedStartDate();
        string strEndDate = GetformatedEndDate();
       //======================================================================
       // Total Sales SQL
       //=====================================================================
        strSQL = @"SELECT     sysdba.USERINFO.USERID, sysdba.USERINFO.UserName, 
Floor(Isnull(tmpActualSales.TotalSales,0)) as [Total Sales], 
Floor(isnull(tmpTargetSales.TargetSales,0))as [Target Sales],
Floor(Isnull(tmpActualSales.TotalSales,0) - isnull(tmpTargetSales.TargetSales,0)) As [Total Difference]
FROM         sysdba.USERINFO INNER JOIN
                      sysdba.USERSECURITY ON sysdba.USERINFO.USERID = sysdba.USERSECURITY.USERID LEFT OUTER JOIN
                          (SELECT     SUM((DATEDIFF(MM, '" + strStartDate + @"', '" + strEndDate  + @"') + 1) * (AMOUNT / (DATEDIFF(MM, BEGINDATE, ENDDATE) + 1))) AS TargetSales, USERID
                            FROM         sysdba.EUROQUOTA
                            WHERE     (QUOTATYPE = 'Total Sales') AND (QUOTAACTIVE = 'T')
                            GROUP BY USERID
                           ) AS tmpTargetSales ON sysdba.USERINFO.USERID = tmpTargetSales.USERID LEFT OUTER JOIN
                       (SELECT     ACCOUNTMANAGERID, SUM(ACTUALAMOUNT) AS TotalSales
                            FROM          sysdba.OPPORTUNITY
                            WHERE      (ACTUALCLOSE >= '" + strStartDate + @"') AND (ACTUALCLOSE <= '" + strEndDate + @"') AND (STATUS = 'Closed - Won')
                            GROUP BY ACCOUNTMANAGERID) AS tmpActualSales ON sysdba.USERINFO.USERID = tmpActualSales.ACCOUNTMANAGERID
WHERE     (sysdba.USERINFO.USERID IN";

            if (currentuser.Id.ToString () == "ADMIN       ")
            {
                // change the Security for Admin user
                strSQL += @" (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                             FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID
                            WHERE      (OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL) ) AND 
                      (sysdba.USERSECURITY.TYPE = 'N'))";
            }
            else
            {
                // Security Applied.
                strSQL += @" (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                             FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID
                            WHERE      (OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL) AND (S_AA.ACCESSID = '" + currentuser.Id.ToString() + @"'))) AND 
                      (sysdba.USERSECURITY.TYPE = 'N')";
            }

                         
strSQL += " ORDER BY sysdba.USERINFO.USERNAME";
       
        // Generate In SQL statement
        Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
        //using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
        using (OleDbConnection conn = new OleDbConnection(GetNativeConnectionString("masterkey")))
        {
            conn.Open();
            using (OleDbDataAdapter da = new OleDbDataAdapter(strSQL, conn))
            {
                //now create the DataSet and use the adapter to fill it
                DataSet ds = new DataSet();
                da.Fill(ds);

                //pull out the created DataTable to work with
                //our table is the first and only one in the tables collection
                DataTable dt = ds.Tables[0];

                return dt;
            }
        }

    }
        protected void Refresh_TotalSalesMainGridView(DataTable dt)
    {
        // Intialize GridView
        lblUserContext.Text = ""; // Intialize Selected Use
        if (GridView1.Columns.Count > 0)
        {
            GridView1.Columns.RemoveAt(0); // Get rid of the Intial Checkbox column
            GridView1.DataSource = null;
        }

        // Add Non databound Selected Column
        TemplateField tf = new TemplateField();
        tf.HeaderText = ""; //Selected
        tf.ItemTemplate = new MyCustomTemplate();

        GridView1.DataSource = dt;
        GridView1.Columns.Add(tf);

        GridView1.DataBind();

        //===========================================================
        // format so it looks Good by Having a currency Symbol
        //============================================================
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

        protected double Get_TotalSales_MonthlyTarget(string startdate, string enddate)
        {
            double dblReturn = 0;
            //Get Current user
            Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
            Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
            //=====================================================================================
            // Define the SQL Statement note the StartDate and EndDate are typically for 1 Month
            //======================================================================================
            string SQL = @"SELECT     SUM(FLOOR(ISNULL(tmpTargetSales.MonthTargetSales, 0))) AS TotalTargetSales
FROM         sysdba.USERINFO INNER JOIN
                      sysdba.USERSECURITY ON sysdba.USERINFO.USERID = sysdba.USERSECURITY.USERID LEFT OUTER JOIN
                          (SELECT    AMOUNT / (DATEDIFF(MM, BEGINDATE, ENDDATE) + 1) AS MonthTargetSales,  USERID
                            FROM         sysdba.EUROQUOTA
                            WHERE     (QUOTATYPE = 'Total Sales') AND (QUOTAACTIVE = 'T')
                           ) AS tmpTargetSales ON sysdba.USERINFO.USERID = tmpTargetSales.USERID 
WHERE     (sysdba.USERINFO.USERID IN ";
            if (currentuser.Id.ToString() == "ADMIN       ")
            {
                // change the Security for Admin user
                SQL += @" (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                             FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID
                            WHERE      (OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL) ) AND 
                      (sysdba.USERSECURITY.TYPE = 'N'))";
            }
            else
            {
                // Security Applied.
                SQL += @" (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                             FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID
                            WHERE      (OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL) AND (S_AA.ACCESSID = '" + currentuser.Id.ToString() + @"'))) AND 
                      (sysdba.USERSECURITY.TYPE = 'N')";
            }


        
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

                SQL += strSQLFilter;
                //=======================================================================
                // ADD SQL Filter to Main SQL Statement
                //========================================================================
            }
            //SQL += ")"; // Add Final Bracket to make sure things work;
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
                        dblReturn = Convert.ToDouble(reader["TotalTargetSales"]);


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
                          (SELECT     ACCOUNTMANAGERID, SUM(ACTUALAMOUNT) AS TotalSales
                            FROM          sysdba.OPPORTUNITY
                            WHERE      (ACTUALCLOSE >= '" + startdate + @"') AND (ACTUALCLOSE <= '" + enddate + @"') AND (STATUS = 'Closed - Won')
                            GROUP BY ACCOUNTMANAGERID) AS tmpActualSales ON sysdba.USERINFO.USERID = tmpActualSales.ACCOUNTMANAGERID
WHERE     (sysdba.USERINFO.USERID IN ";
            if (currentuser.Id.ToString() == "ADMIN       ")
            {
                // change the Security for Admin user
                SQL += @" (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                             FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID
                            WHERE      (OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL) ) AND 
                      (sysdba.USERSECURITY.TYPE = 'N'))";
            }
            else
            {
                // Security Applied.
                SQL += @" (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                             FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID
                            WHERE      (OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL) AND (S_AA.ACCESSID = '" + currentuser.Id.ToString() + @"'))) AND 
                      (sysdba.USERSECURITY.TYPE = 'N')";
            }

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

               
                SQL += strSQLFilter;
                //=======================================================================
                // ADD SQL Filter to Main SQL Statement
                //========================================================================
            }
            //SQL += ")"; // Add Closing Bracket so the SQL works
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

        protected DataTable Get_TotalSales_Detail_Data()
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
            iYear = Convert.ToInt16(strStartDate.Substring(0, 4));
            iMonth = Convert.ToInt16(strStartDate.Substring(4, 2));
            iDay = Convert.ToInt16(strStartDate.Substring(6, 2));

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
            table.Columns.Add("Month Year", typeof(string));
            table.Columns.Add("Sales Target", typeof(double));
            table.Columns.Add("Target Cummulative", typeof(double));
            table.Columns.Add("Sales Actual", typeof(double));
            table.Columns.Add("Actual Cummulative", typeof(double));
            table.Columns.Add("Difference", typeof(double));

            string tmpMonth;
            double tmpSalesTarget = 0;
            double tmpCumulativeTarget = 0; //Intialize
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
            if (Get_NumberofMonthsForPeriod(strStartDate, strEndDate) > 0)
            {
                tmpTotalSalesTarget = Get_TotalSales_MonthlyTarget(strStartDate, strEndDate);
                //tmpNumMonths = Get_NumberofMonthsForPeriod(strStartDate, strEndDate); // this is handled via the SQL Query to get the Monthly total 
                tmpMonthlySalesTarget = tmpTotalSalesTarget;//= tmpTotalSalesTarget / tmpNumMonths;
            }
            else
            {
                // To Ensure Divsion by Zero Rules don't cause and Expeption
                tmpMonthlySalesTarget = 0;
            }



            for (int i = 0; i < 12; i++) // Maximum 12 Months
            {
                if (StartDate.AddMonths(i) <= EndDate)
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

                    tmpDate = string.Format("{0:yyyy}", StartDate.AddMonths(i + 1)) + StartDate.AddMonths(i + 1).Month.ToString("d2") + "01";
                    // Get the Next Months first day to Subtract by One day to get the Last day of the current Month
                    DateTime.TryParseExact(tmpDate, "yyyyMMdd", CultureInfo.InvariantCulture, DateTimeStyles.None, out dtEnddate);
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
        protected void Refresh_TotalSales_DetailsGridandChart(DataTable dt)
        {
            // Intialize GridView
            if (grdMonthDetail.Columns.Count > 0)
            {
                grdMonthDetail.DataSource = null;
            }
            
            grdMonthDetail.DataSource = dt;
            grdMonthDetail.DataBind();
            //=================================================
            // Format the Data Grid so the currency's look good
            //==================================================
            double result;
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
            string MonthValues1 = ""; // Sales Target
            string MonthValues2 = ""; // Sales Actuals
            string MonthNames = "";
            foreach (DataRow row in dt.Rows)
            {
                MonthValues1 += Convert.ToInt64(row[1]).ToString() + ","; //Sales Target
                MonthValues2 += Convert.ToInt64(row[3]).ToString() + ","; //Sales Actual
                MonthNames += Left(row[0].ToString(), 3) + ",";
            }


            hiddenTotalValues1.Value = Left(MonthValues1, MonthValues1.Length - 1); //Remove trailing comma
            hiddenTotalValues2.Value = Left(MonthValues2, MonthValues2.Length - 1); //Remove trailing comma
            hiddenMonthValues.Value = Left(MonthNames, MonthNames.Length - 1); //Remove trailing comma

            hiddenLegendValues1.Value = "Total Sales Target";
            hiddenLegendValues2.Value = "Total Sales Actual" ;
            lblColumnChart.Text = " Totals Sales:         " + GetStartDate().ToString("MMMM dd, yyyy") + " - " + GetEndDate().ToString("MMMM dd, yyyy");
            lblColumnChart.Font.Bold = true;
 
        }
        
    
    #endregion


        //===============================================
        #region NumberQuotes
        //===============================================
        protected DataTable Get_NumberQuotes_MainGrid_Data()
        {
            //Get Current user
            Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
            Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
            string strSQL = "";
            string strStartDate = GetformatedStartDate();
            string strEndDate = GetformatedEndDate();
            //======================================================================
            // Total Sales SQL
            //=====================================================================
            strSQL = @"SELECT     sysdba.USERINFO.USERID, sysdba.USERINFO.USERNAME, FLOOR(ISNULL(tmpActualNumQuotes.NumberQuotes, 0)) AS [Actual Quotes], 
                      FLOOR(ISNULL(tmpTargetNumbQuotes.TargetNumQuotes , 0)) AS [Target Quotes], FLOOR(ISNULL(tmpActualNumQuotes.NumberQuotes, 0) 
                      - ISNULL(tmpTargetNumbQuotes.TargetNumQuotes , 0)) AS [Total Difference]
FROM         sysdba.USERINFO INNER JOIN
                      sysdba.USERSECURITY ON sysdba.USERINFO.USERID = sysdba.USERSECURITY.USERID LEFT OUTER JOIN
                          (SELECT     SUM((DATEDIFF(MM, '" + strStartDate + @"', '" + strEndDate + @"') + 1) * (QUANTITY  / (DATEDIFF(MM, BEGINDATE, ENDDATE) + 1))) 
                                                   AS TargetNumQuotes, USERID
                            FROM          sysdba.EUROQUOTA
                            WHERE      (QUOTATYPE = 'Number of Quotes') AND (QUOTAACTIVE = 'T')
                            GROUP BY USERID) AS tmpTargetNumbQuotes ON sysdba.USERINFO.USERID = tmpTargetNumbQuotes.USERID LEFT OUTER JOIN
                          (SELECT     ACCOUNTMANAGERID, Count(OPPORTUNITYID) AS NumberQuotes
                            FROM          sysdba.OPPORTUNITY
                            WHERE      (CREATEDATE  >= '" + strStartDate + @"') AND (CREATEDATE  <= '" + strEndDate + @"') 
                            GROUP BY ACCOUNTMANAGERID) AS tmpActualNumQuotes ON sysdba.USERINFO.USERID = tmpActualNumQuotes.ACCOUNTMANAGERID
WHERE     (sysdba.USERINFO.USERID IN";

            if (currentuser.Id.ToString() == "ADMIN       ")
            {
                // change the Security for Admin user
                strSQL += @" (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                             FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID
                            WHERE      (OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL) ) AND 
                      (sysdba.USERSECURITY.TYPE = 'N'))";
            }
            else
            {
                // Security Applied.
                strSQL += @" (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                             FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID
                            WHERE      (OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL) AND (S_AA.ACCESSID = '" + currentuser.Id.ToString() + @"'))) AND 
                      (sysdba.USERSECURITY.TYPE = 'N')";
            }


            strSQL += " ORDER BY sysdba.USERINFO.USERNAME";

            // Generate In SQL statement
            Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
            //using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            using (OleDbConnection conn = new OleDbConnection(GetNativeConnectionString("masterkey")))
            {
                conn.Open();
                using (OleDbDataAdapter da = new OleDbDataAdapter(strSQL, conn))
                {
                    //now create the DataSet and use the adapter to fill it
                    DataSet ds = new DataSet();
                    da.Fill(ds);

                    //pull out the created DataTable to work with
                    //our table is the first and only one in the tables collection
                    DataTable dt = ds.Tables[0];

                    return dt;
                }
            }

        }
        protected void Refresh_NumberQuotesMainGridView(DataTable dt)
        {
            // Intialize GridView
            lblUserContext.Text = ""; // Intialize Selected Use
            if (GridView1.Columns.Count > 0)
            {
                GridView1.Columns.RemoveAt(0); // Get rid of the Intial Checkbox column
                GridView1.DataSource = null;
            }

            // Add Non databound Selected Column
            TemplateField tf = new TemplateField();
            tf.HeaderText = ""; //Selected
            tf.ItemTemplate = new MyCustomTemplate();

            GridView1.DataSource = dt;
            GridView1.Columns.Add(tf);

            GridView1.DataBind();

            //===========================================================
            // format so it looks Good by Having a currency Symbol
            //============================================================
            //double result;
            //for (int i = 0; i < GridView1.Rows.Count; i++)
            //{
            //    foreach (TableCell c in GridView1.Rows[i].Cells)
            //    {
            //        if (double.TryParse(c.Text, out result))
            //        {
            //            c.Text = String.Format("{0:c}", result);
            //        }
            //    }
            //}
        }

        protected double Get_NumberQuotes_MonthlyTarget(string startdate, string enddate)
        {
            double dblReturn = 0;
            //Get Current user
            Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
            Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
            //=====================================================================================
            // Define the SQL Statement note the StartDate and EndDate are typically for 1 Month
            //======================================================================================
            string SQL = @"SELECT     SUM(FLOOR(ISNULL(tmpTargetSales.MonthTargetNumQuotes, 0))) AS TotalTargetNumQuotes
FROM         sysdba.USERINFO INNER JOIN
                      sysdba.USERSECURITY ON sysdba.USERINFO.USERID = sysdba.USERSECURITY.USERID LEFT OUTER JOIN
                          (SELECT     QUANTITY  / (DATEDIFF(MM, BEGINDATE, ENDDATE) + 1) AS MonthTargetNumQuotes, USERID
                            FROM          sysdba.EUROQUOTA
                            WHERE      (QUOTATYPE = 'Number of Quotes') AND (QUOTAACTIVE = 'T')) AS tmpTargetSales ON 
                      sysdba.USERINFO.USERID = tmpTargetSales.USERID
WHERE     (sysdba.USERINFO.USERID IN ";
            if (currentuser.Id.ToString() == "ADMIN       ")
            {
                // change the Security for Admin user
                SQL += @" (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                             FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID
                            WHERE      (OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL) ) AND 
                      (sysdba.USERSECURITY.TYPE = 'N'))";
            }
            else
            {
                // Security Applied.
                SQL += @" (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                             FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID
                            WHERE      (OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL) AND (S_AA.ACCESSID = '" + currentuser.Id.ToString() + @"'))) AND 
                      (sysdba.USERSECURITY.TYPE = 'N')";
            }



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

                SQL += strSQLFilter;
                //=======================================================================
                // ADD SQL Filter to Main SQL Statement
                //========================================================================
            }
            //SQL += ")"; // Add Final Bracket to make sure things work;
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
                        dblReturn = Convert.ToDouble(reader["TotalTargetNumQuotes"]);


                    }
                    reader.Close();
                }
            }

            return dblReturn;
        }
        protected double Get_NumberQuotes_NumberQuotesActual(string startdate, string enddate)
        {
            double dblReturn = 0;
            //Get Current user
            Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
            Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
            //=====================================================================================
            // Define the SQL Statement note the StartDate and EndDate are typically for 1 Month
            //======================================================================================
            string SQL = @"SELECT     SUM(FLOOR(ISNULL(tmpActualNumQuotes.NumberQuotes, 0))) AS TotalActualNumQuotes
FROM         sysdba.USERINFO INNER JOIN
                      sysdba.USERSECURITY ON sysdba.USERINFO.USERID = sysdba.USERSECURITY.USERID LEFT OUTER JOIN
                          (SELECT     ACCOUNTMANAGERID, Count(OPPORTUNITYID) AS NumberQuotes
                            FROM          sysdba.OPPORTUNITY
                            WHERE      (CREATEDATE  >= '" + startdate + @"') AND (CREATEDATE  <= '" + enddate + @"') 
                            GROUP BY ACCOUNTMANAGERID) AS tmpActualNumQuotes ON sysdba.USERINFO.USERID = tmpActualNumQuotes.ACCOUNTMANAGERID
WHERE     (sysdba.USERINFO.USERID IN ";
            if (currentuser.Id.ToString() == "ADMIN       ")
            {
                // change the Security for Admin user
                SQL += @" (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                             FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID
                            WHERE      (OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL) ) AND 
                      (sysdba.USERSECURITY.TYPE = 'N'))";
            }
            else
            {
                // Security Applied.
                SQL += @" (SELECT DISTINCT OPPORTUNITY_1.ACCOUNTMANAGERID
                             FROM          sysdba.OPPORTUNITY AS OPPORTUNITY_1 INNER JOIN
                                                   sysdba.SECRIGHTS AS S_AA ON OPPORTUNITY_1.SECCODEID = S_AA.SECCODEID
                            WHERE      (OPPORTUNITY_1.ACCOUNTMANAGERID IS NOT NULL) AND (S_AA.ACCESSID = '" + currentuser.Id.ToString() + @"'))) AND 
                      (sysdba.USERSECURITY.TYPE = 'N')";
            }

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


                SQL += strSQLFilter;
                //=======================================================================
                // ADD SQL Filter to Main SQL Statement
                //========================================================================
            }
            //SQL += ")"; // Add Closing Bracket so the SQL works
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
                        dblReturn = Convert.ToDouble(reader["TotalActualNumQuotes"]);


                    }
                    reader.Close();
                }
            }

            return dblReturn;
        }

        protected DataTable Get_NumberQuotes_Detail_Data()
        {
            string strStartDate = GetformatedStartDate();
            string strEndDate = GetformatedEndDate();

            int NumberQuotes = 0;
            int TotalTarget = 0;
            int TotalDifference = 0;
            string strNumberQuotes = "";
            string strTotalTarget = "";
            int iYear;
            int iMonth;
            int iDay;
            iYear = Convert.ToInt16(strStartDate.Substring(0, 4));
            iMonth = Convert.ToInt16(strStartDate.Substring(4, 2));
            iDay = Convert.ToInt16(strStartDate.Substring(6, 2));

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
            table.Columns.Add("Month Year", typeof(string));
            table.Columns.Add(" Target", typeof(double));
            table.Columns.Add("Target Cummulative", typeof(double));
            table.Columns.Add(" Actual", typeof(double));
            table.Columns.Add("Actual Cummulative", typeof(double));
            table.Columns.Add("Difference", typeof(double));

            string tmpMonth;
            double tmpTarget = 0;
            double tmpCumulativeTarget = 0; //Intialize
            double tmpActual = 0;
            double tmpCummulativeActual = 0;
            double tmpMonthlyTarget = 0;
            double tmpDifference = 0;

            string tmpStartdate = "";
            string tmpEnddate = "";
            DateTime dtEnddate;
            string tmpDate = "";

            double tmpNumberQuotesTarget = 0;
            double tmpNumMonths = 0;

            //======================================================================================
            // We Need to get the Total Target for the  Period divieded by the number of Months
            //======================================================================================
            if (Get_NumberofMonthsForPeriod(strStartDate, strEndDate) > 0)
            {
                tmpNumberQuotesTarget = Get_NumberQuotes_MonthlyTarget(strStartDate, strEndDate);
                //tmpNumMonths = Get_NumberofMonthsForPeriod(strStartDate, strEndDate); // this is handled via the SQL Query to get the Monthly total 
                tmpMonthlyTarget = tmpNumberQuotesTarget;//= tmpNumberQuotesTarget / tmpNumMonths;
            }
            else
            {
                // To Ensure Divsion by Zero Rules don't cause and Expeption
                tmpMonthlyTarget = 0;
            }



            for (int i = 0; i < 12; i++) // Maximum 12 Months
            {
                if (StartDate.AddMonths(i) <= EndDate)
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

                    tmpDate = string.Format("{0:yyyy}", StartDate.AddMonths(i + 1)) + StartDate.AddMonths(i + 1).Month.ToString("d2") + "01";
                    // Get the Next Months first day to Subtract by One day to get the Last day of the current Month
                    DateTime.TryParseExact(tmpDate, "yyyyMMdd", CultureInfo.InvariantCulture, DateTimeStyles.None, out dtEnddate);
                    tmpEnddate += dtEnddate.AddDays(-1).Day.ToString("d2") + " 23:59:59"; // Day First of the Next Month -1


                    //======================================   
                    // Get Display Month
                    //=======================================
                    tmpMonth = String.Format("{0:MMM}", StartDate.AddMonths(i)) + "-" + String.Format("{0:yyyy}", StartDate.AddMonths(i));

                    //========================================
                    // Get Sales Target 
                    //========================================
                    tmpTarget = tmpMonthlyTarget;

                    //=========================================
                    // Get Cumulative Target
                    //=========================================
                    tmpCumulativeTarget += tmpTarget;

                    //=========================================
                    // Get Sales Actual
                    //=========================================
                    tmpActual = Get_NumberQuotes_NumberQuotesActual(tmpStartdate, tmpEnddate);

                    //=========================================
                    // Get Sales Actual Cumulative 
                    //=========================================
                    tmpCummulativeActual += tmpActual;

                    //=========================================
                    // Get Difference 
                    //=========================================
                    tmpDifference = tmpCummulativeActual - tmpCumulativeTarget;

                    //Add Row To datatable

                    table.Rows.Add(tmpMonth, tmpTarget, tmpCumulativeTarget, tmpActual, tmpCummulativeActual, tmpDifference);
                }
            }
            //================================================================
            // Return the DataTable to the Grid
            //=================================================================
            return table;

        }
        protected void Refresh_NumberQuotes_DetailsGridandChart(DataTable dt)
        {
            // Intialize GridView
            if (grdMonthDetail.Columns.Count > 0)
            {
                grdMonthDetail.DataSource = null;
            }

            grdMonthDetail.DataSource = dt;
            grdMonthDetail.DataBind();
            //=================================================
            // Format the Data Grid so the currency's look good
            //==================================================
            //double result;
            //for (int i = 0; i < grdMonthDetail.Rows.Count; i++)
            //{
            //    foreach (TableCell c in grdMonthDetail.Rows[i].Cells)
            //    {
            //        if (double.TryParse(c.Text, out result))
            //        {
            //            c.Text = String.Format("{0:c}", result);
            //        }
            //    }
            //}

            //===========================================================
            // Set the Hidden Values for the Chart JavaScript to read
            //===========================================================
            string MonthValues1 = ""; //  Target
            string MonthValues2 = ""; //  Actuals
            string MonthNames = "";
            foreach (DataRow row in dt.Rows)
            {
                MonthValues1 += Convert.ToInt64(row[1]).ToString() + ","; // Target
                MonthValues2 += Convert.ToInt64(row[3]).ToString() + ","; // Actual
                MonthNames += Left(row[0].ToString(), 3) + ",";
            }


            hiddenTotalValues1.Value = Left(MonthValues1, MonthValues1.Length - 1); //Remove trailing comma
            hiddenTotalValues2.Value = Left(MonthValues2, MonthValues2.Length - 1); //Remove trailing comma
            hiddenMonthValues.Value = Left(MonthNames, MonthNames.Length - 1); //Remove trailing comma

            hiddenLegendValues1.Value = "Number of Quotes Target";
            hiddenLegendValues2.Value = "Number of Quotes Actual";
            lblColumnChart.Text = " Number of Quotes:         " + GetStartDate().ToString("MMMM dd, yyyy") + " - " + GetEndDate().ToString("MMMM dd, yyyy");
            lblColumnChart.Font.Bold = true;

        }


        #endregion



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
        string strEndDate = GetformatedEndDate();
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
        string strYear ="";
        string strMonth = "";
        string strDay = "";
        //Needs to Output this format
        //20120901 00:00:00
        switch (ddlPeriod.Text)
        {

            //======================================
            case "Fiscal YTD":
                //======================================
                // Fiscal Year starts Setember 1 2013
                //N
                if (DateTime.Now.Month >= 9)
                {
                    strYear = DateTime.Now.Year.ToString();  // Use Current Year
                    strMonth = "09"; // September
                    strDay = "01";
                }
                else
                {
                    strYear = (DateTime.Now.Year - 1).ToString();  // Use Last Year
                    strMonth = "09"; // September
                    strDay = "01";
                }
                strReturn = strYear + strMonth + strDay + " 00:00:00";//20120901 00:00:00

                break;
            //======================================
            case "Fiscal QTD":
                //======================================
           if (DateTime.Now.Month >= 9 && DateTime.Now.Month <= 11)
                {
                    // Q1 Sept 1 - November 30
                    strYear = DateTime.Now.Year.ToString();  // Use Current Year
                    strMonth = "09"; // Sept
                    strDay = "01";
                }
                else
                {
                    if (DateTime.Now.Month == 12 ) // If December
                    {
                        //==============================================
                        // Q2 December1 to Last Day of February
                        //==============================================
                        strYear = (DateTime.Now.Year).ToString() ;  // Use the current Yer
                        strMonth = "12"; // Dec
                        strDay = "01";

                    }
                    else
                    {
                        if (DateTime.Now.Month >= 1 && DateTime.Now.Month <= 2)
                        {
                            //==============================================
                            // Q2 December1 to Last Day of February  Continued
                            //==============================================
                            strYear = (DateTime.Now.Year-1).ToString();  // Use the Last
                            strMonth = "12"; // Dec
                            strDay = "01";
                        }
                        else
                        {
                            if (DateTime.Now.Month >= 3 && DateTime.Now.Month <= 5)
                            {
                                //============================
                                // Q3 March May
                                //============================
                                strYear = DateTime.Now.Year.ToString();  // Use Current Year
                                strMonth = "03"; // January
                                strDay = "01";
                            }
                            else
                            {
                                if (DateTime.Now.Month >= 6 && DateTime.Now.Month <= 8)
                                {
                                    // Q4 June 1 - Aug 31
                                    strYear = DateTime.Now.Year.ToString();  // Use Current Year
                                    strMonth = "06"; // April
                                    strDay = "01";

                                }

                            }
                        }

                    }
                   
                }
                 strReturn = strYear + strMonth + strDay + " 00:00:00";//20120901 00:00:00//strReturn = ""; 
                break;
                //======================================
            case "Fiscal MTD":
                //======================================
           
                    strYear = DateTime.Now.Year.ToString();  // Use Current Year
                    strMonth = DateTime.Now.Month.ToString("d2") ; // Current Month
                    strDay = "01";
             
                strReturn = strYear + strMonth + strDay + " 00:00:00";//20120901 00:00:00

                break;

            //======================================
            case "Last 90 Days":
                //======================================

                 strYear = DateTime.Now.AddDays(-90).Year.ToString();  // Use Current Year
                 strMonth = DateTime.Now.AddDays(-90).Month.ToString("d2") ; // Current Month
                 strDay = DateTime.DaysInMonth((DateTime.Now.AddDays(-90).Year),DateTime.Now.AddDays(-90).Month).ToString (); // get How Manydays
             
                strReturn = strYear + strMonth + strDay + " 00:00:00";//20120901 00:00:00
                break;
            //======================================
            case "Last 60 Days":
                //======================================
                strYear = DateTime.Now.AddDays(-60).Year.ToString();  // Use Current Year
                    strMonth = DateTime.Now.AddDays(-60).Month.ToString("d2") ; // Current Month
                    strDay = DateTime.DaysInMonth((DateTime.Now.AddDays(-60).Year),DateTime.Now.AddDays(-60).Month).ToString (); // get How Manydays
             
                strReturn = strYear + strMonth + strDay + " 00:00:00";//20120901 00:00:00
                break;
            //======================================
            case "Last 30 Days":
                //======================================
              strYear = DateTime.Now.AddDays(-30).Year.ToString();  // Use Current Year
                    strMonth = DateTime.Now.AddDays(-30).Month.ToString("d2") ; // Current Month
                    strDay = DateTime.DaysInMonth((DateTime.Now.AddDays(-30).Year),DateTime.Now.AddDays(-30).Month).ToString (); // get How Manydays
             
                strReturn = strYear + strMonth + strDay + " 00:00:00";//20120901 00:00:00
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
        string strYear = "";
        string strMonth = "";
        string strDay = "";
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
                if (DateTime.Now.Month >= 9 && DateTime.Now.Month <= 11)
                {
                    // Q1 Sept 1 - November 30
                    strYear = DateTime.Now.Year.ToString();  // Use Current Year
                    strMonth = "11"; // December
                    strDay = "30";
                }
                else
                {
                    if (DateTime.Now.Month == 12 ) // If December
                    {
                        //==============================================
                        // Q2 December1 to Last Day of February
                        //==============================================
                        strYear = (DateTime.Now.Year +1).ToString() ;  // Use the Next Yer
                        strMonth = "02"; // March
                        strDay = DateTime.DaysInMonth((DateTime.Now.Year+1), 02).ToString(); // get How Manydays

                    }
                    else
                    {
                        if (DateTime.Now.Month >= 1 && DateTime.Now.Month <= 2)
                        {
                            //==============================================
                            // Q2 December1 to Last Day of February  Continued
                            //==============================================
                            strYear = (DateTime.Now.Year).ToString();  // Use the Current
                            strMonth = "02"; // February
                            strDay = DateTime.DaysInMonth((DateTime.Now.Year), 02).ToString (); // get How Manydays
                        }
                        else
                        {
                            if (DateTime.Now.Month >= 3 && DateTime.Now.Month <= 5)
                            {
                                //============================
                                // Q3 March May
                                //============================
                                strYear = DateTime.Now.Year.ToString();  // Use Current Year
                                strMonth = "05"; // January
                                strDay = "31";
                            }
                            else
                            {
                                if (DateTime.Now.Month >= 6 && DateTime.Now.Month <= 8)
                                {
                                    // Q4 June 1 - Aug 31
                                    strYear = DateTime.Now.Year.ToString();  // Use Current Year
                                    strMonth = "08"; // April
                                    strDay = "31";

                                }

                            }
                        }

                    }
                   
                }
                 strReturn = strYear + strMonth + strDay + " 23:59:59";//20120901 00:00:00
                break;
            //======================================
            case "Fiscal MTD":
                //======================================
                  strYear = DateTime.Now.Year.ToString();  // Use Current Year
                    strMonth = DateTime.Now.Month.ToString("d2") ; // Current Month
                    strDay = DateTime.DaysInMonth((DateTime.Now.Year),DateTime.Now.Month).ToString (); // get How Manydays
             
                strReturn = strYear + strMonth + strDay + " 23:59:59";//20120901 00:00:00
                break;

            //======================================
            case "Last 90 Days":
                //======================================
                    strYear = DateTime.Now.Year.ToString();  // Use Current Year
                    strMonth = DateTime.Now.Month.ToString("d2") ; // Current Month
                    strDay = DateTime.Now.Day.ToString ("d2") ;
             
                strReturn = strYear + strMonth + strDay + " 23:59:59";//20120901 00:00:00
                break;
            //======================================
            case "Last 60 Days":
                //======================================
               strYear = DateTime.Now.Year.ToString();  // Use Current Year
                    strMonth = DateTime.Now.Month.ToString("d2") ; // Current Month
                    strDay = DateTime.Now.Day.ToString ("d2") ;
             
                strReturn = strYear + strMonth + strDay + " 23:59:59";//20120901 00:00:00
                break;
            //======================================
            case "Last 30 Days":
                //======================================
                strYear = DateTime.Now.Year.ToString();  // Use Current Year
                    strMonth = DateTime.Now.Month.ToString("d2") ; // Current Month
                    strDay = DateTime.Now.Day.ToString ("d2") ;
             
                strReturn = strYear + strMonth + strDay + " 23:59:59";//20120901 00:00:00
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
    protected double Get_NumberofMonthsForPeriod(string startdate, string enddate)
    {
        double dblReturn = 0;
        //Get Current user
        Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
        Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
        //=====================================================================================
        // Define the SQL Statement note the StartDate and EndDate are typically for 1 Month
        //======================================================================================
        string SQL = @"Select DATEDIFF (   MONTH , '" + startdate + @"', '" + enddate + "') + 1 as TotalMonths ";   //  --add One as this is zero based 

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
                    strReturn = Convert.ToString(r[0]) + ";password=" + sysdbaPassword;


                }
                r.Close();
            }
        }

        return strReturn;
    }
    public static T GetField<T>(string Field, string Table, string Where)
    {
        string sql = string.Format("select {0} from {1} where {2}", Field, Table, (Where.Equals(string.Empty) ? "1=1" : Where));

        //get the DataService to get a connection string to the database
        Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
        using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
        {
            conn.Open();
            using (OleDbCommand cmd = new OleDbCommand(sql, conn))
            {
                object fieldval = cmd.ExecuteScalar();
                return fieldval == DBNull.Value ? default(T) : (T)fieldval;
            }
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
