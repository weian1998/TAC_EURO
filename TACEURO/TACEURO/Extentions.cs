using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Sage.Entity.Interfaces;
using Sage.Platform;
using System.Data.OleDb;
using System.Text.RegularExpressions;

namespace TACEURO
{
    public class Extentions
       
    {
         // Example of target method signature
        public static void ReProcess(IEmailArchive emailarchive, out String result)
        {
            //====================================
            // Variables
            //====================================
            String EmailArchiveID = String.Empty; 
            String UserID = String.Empty ;
            String UserName = String.Empty ;
            Boolean blnIsUserFoundinFrom = false ;
            Boolean blnIsUserFoundinTo = false;

            String histContactID = String.Empty;
            String histAccountID = String.Empty;
            String histContactName = String.Empty ;
            String histAccountName = String.Empty;
            String histContactType = String.Empty;
            String histCategory = String.Empty;
            String histSeccodeID = String.Empty;
            int i = 0;
            DateTime histArchiveDate = DateTime.Now ;
            String ReProcessNote = String.Empty;

            //Get All Email That do not have an Email Address in the Exclude and are not History Linked
            // get the DataService to get a connection string to the database
            Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();

            
            using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            {
                conn.Open();
                using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand("Select * from EMAILARCHIVE  where ISLINKEDHISTORY = 'F' and TOADDRESS not in (Select EMAILADDRESS  from EMAILEXCLUDELIST )and FROMADDRESS  not in (Select EMAILADDRESS  from EMAILEXCLUDELIST )", conn))
                {
                    OleDbDataReader  reader = cmd.ExecuteReader ();
                    //loop through the reader
                    while (reader.Read())
                    {
                        blnIsUserFoundinTo = false; // Intialize
                        blnIsUserFoundinFrom = false;
                        EmailArchiveID = reader["EMAILARCHIVEID"].ToString();
                        histArchiveDate = (DateTime)reader["CREATEDATE"];
                        //===========================================
                        // Check to See if the User Is Found
                        //===========================================
                        if (IsUserFound(reader["FROMADDRESS"].ToString(), out UserName, out UserID))
                        {
                            blnIsUserFoundinFrom = true;
                            histCategory = "EMail Sent";
                            //==================================================================================
                            // Get Contact Information
                            //==================================================================================
                            if (IsContactFound(reader["TOADDRESS"].ToString(), out histContactID, out histContactName, out histAccountID, out histAccountName, out histContactType))
                            {
                                // Create History Record
                                Sage.Entity.Interfaces.IHistory history = Sage.Platform.EntityFactory.Create<Sage.Entity.Interfaces.IHistory>();
                                history.AccountId = histAccountID;
                                history.AccountName = histAccountName;
                                history.ContactId = histContactID;
                                history.ContactName = histContactName;
                                history.Type = HistoryType.atEMail;
                                history.Category = histCategory;
                                history.UserId = UserID;
                                history.UserName = UserName;
                                history.Duration = 1;
                                history.StartDate = histArchiveDate;
                                history.OriginalDate = histArchiveDate;
                                history.CompletedDate = histArchiveDate;
                                history.CompletedUser = UserID;
                                history.Timeless = false;
                                history.Result = "Complete";
                                history.Description = reader["SUBJECT"].ToString();
                                history.Notes = reader["SHORTNOTES"].ToString();
                                history.LongNotes = reader["MESSAGEBODY"].ToString();

                                history.EMAILARCHIVEID = EmailArchiveID;

                                // Set the SeccodeID
                                if (histContactType == "EMPL")
                                {
                                    //Get User Private Team
                                    histSeccodeID = GetUserPrivateSeccode(UserID);
                                    if (histSeccodeID != String.Empty)
                                    {
                                        history.SeccodeId = histSeccodeID;


                                    }
                                    else
                                    {
                                        histSeccodeID = "SYST00000001";


                                    }
                                }
                                else
                                {
                                    // Not an Employee so Default Everyone
                                    histSeccodeID = "SYST00000001";
                                    history.SeccodeId = histSeccodeID;
                                }
                                try
                                {
                                    history.Save();
                                    UpdateEmailArchiveLinked(EmailArchiveID,String.Empty ,true  );
                                }
                                catch (Exception)
                                {

                                    //Exception But Continue
                                }



                            }
                            else
                            {
                                // Contact Not Found
                                ReProcessNote = "Contact Not Found";
                                UpdateEmailArchiveLinked(EmailArchiveID, ReProcessNote, false);
                            }
                        }
                        else
                        {
                            if (IsUserFound(reader["TOADDRESS"].ToString(), out UserName, out UserID))
                            {
                                blnIsUserFoundinTo = true;
                                histCategory = "EMail History Added";
                                //==================================================================================
                                // Get Contact Information
                                //==================================================================================
                                if (IsContactFound(reader["FROMADDRESS"].ToString(), out histContactID, out histContactName, out histAccountID, out histAccountName, out histContactType))
                                {
                                    // Create History Record
                                    Sage.Entity.Interfaces.IHistory history = Sage.Platform.EntityFactory.Create<Sage.Entity.Interfaces.IHistory>();
                                    history.AccountId = histAccountID;
                                    history.AccountName = histAccountName;
                                    history.ContactId = histContactID;
                                    history.ContactName = histContactName;
                                    history.Type = HistoryType.atEMail;
                                    history.Category = histCategory;
                                    history.UserId = UserID;
                                    history.UserName = UserName;
                                    history.Duration = 1;
                                    history.StartDate = histArchiveDate;
                                    history.OriginalDate = histArchiveDate;
                                    history.CompletedDate = histArchiveDate;
                                    history.CompletedUser = UserID;
                                    history.Timeless = false;
                                    history.Result = "Complete";
                                    history.Description = reader["SUBJECT"].ToString();
                                    history.LongNotes = reader["MESSAGEBODY"].ToString();
                                    history.Notes = reader["SHORTNOTES"].ToString();
                                    history.EMAILARCHIVEID = EmailArchiveID;
                                    // Set the SeccodeID
                                    if (histContactType == "EMPL")
                                    {
                                        //Get User Private Team
                                        histSeccodeID = GetUserPrivateSeccode(UserID);
                                        if (histSeccodeID != String.Empty)
                                        {
                                            history.SeccodeId = histSeccodeID;


                                        }
                                        else
                                        {
                                            histSeccodeID = "SYST00000001";


                                        }
                                    }
                                    else
                                    {
                                        // Not an Employee so Default Everyone
                                        histSeccodeID = "SYST00000001";
                                        history.SeccodeId = histSeccodeID;
                                    }
                                    try
                                    {
                                        history.Save();
                                        UpdateEmailArchiveLinked(EmailArchiveID,String.Empty,true  );
                                    }
                                    catch (Exception)
                                    {

                                        //Exception But Continue
                                    }
                                }
                                else
                                {
                                    // Contact Not Found
                                    ReProcessNote = "Contact Not Found";
                                    UpdateEmailArchiveLinked(EmailArchiveID, ReProcessNote, false);
                                }
                            }
                            else
                            {
                                // User Not Found In FromAddress or ToAddress
                                ReProcessNote = "User Not Found";
                                UpdateEmailArchiveLinked(EmailArchiveID, ReProcessNote,false );
                            }
                        }



                        i++; // Increment the counter
                        
                    }
                    reader.Close();
                    
                    
                }
            }
            result = "Completed Message";
            throw new Exception ("Completed Reprocess " + i + " Records"); 
           

        }
        private static void UpdateEmailArchiveLinked(String EmailArchiveID, String ReProcessNote, Boolean IsLinkedHistory)
        {
            Sage.Entity.Interfaces.IEmailArchive  EmailArchive = Sage.Platform.EntityFactory.GetById<Sage.Entity.Interfaces.IEmailArchive>(EmailArchiveID );
            EmailArchive.IsLinkedHistory = IsLinkedHistory;
            EmailArchive.ReprocessNote = ReProcessNote;
            EmailArchive.Save();
        }

        //public static Boolean IsExcludeEmail(string Emailaddress)
        //{
        //    Boolean returnValue = false; // Initialize
        //    // get the DataService to get a connection string to the database
        //    Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
        //    using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            
        //    {
        //        conn.Open();
        //        using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand("Select * from EMAILEXCLUDELIST where EMAILADDRESS = '" + Emailaddress + "'", conn))
        //        {
        //            object o = cmd.ExecuteScalar () ;
        //            if (o != null) returnValue  = true ; //
        //        }
        //    }

        //    return returnValue;
        //}
        private static Boolean IsUserFound(String Emailaddress, out String UserName, out String UserID)
        {
            Boolean returnValue = false; // Initialize
            UserName = String.Empty;
            UserID = String.Empty;
            // get the DataService to get a connection string to the database
            Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
            using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            {
                conn.Open();
                using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand("Select USERID,USERNAME  from USERINFO where EMAIL = '" + Emailaddress + "'", conn))
                {
                    OleDbDataReader reader = cmd.ExecuteReader();
                    //loop through the reader
                    while (reader.Read())
                    {
                        UserID = reader["USERID"].ToString();
                        UserName = reader["USERNAME"].ToString();
                        returnValue = true;
                    }
                    reader.Close();
                }
            }

            return returnValue;
        }
        public static bool IsValidEmail(string strIn)
        {
            // Return true if strIn is in valid e-mail format.
            return Regex.IsMatch(strIn,
                   @"^(?("")("".+?""@)|(([0-9a-zA-Z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-zA-Z])@))" +
                   @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,6}))$");
        }

        private static Boolean IsContactFound(String Emailaddress, out String ContactID, out String ContactName, out String AccountID, out String Account, out String ContactType)
        {
            Boolean returnValue = false; // Initialize
            ContactID  = String.Empty;
            ContactName  = String.Empty;
            AccountID = String.Empty;
            Account = String.Empty;
            ContactType = String.Empty;
            //================================================
            // Validate the Email Address
            //================================================
            if (IsValidEmail(Emailaddress ) )
            {
                //Valid So Continue
            }
            else 
            {
                // Invalid
                return false; // Failed
            }
            // get the DataService to get a connection string to the database
            Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
            using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            {
                conn.Open();
                using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand("Select TYPE,ACCOUNTID,ACCOUNT,CONTACTID, ISNULL(FIRSTNAME,'') + ', ' + ISNULL(LASTNAME,'') AS CNAME  from CONTACT where EMAIL = '" + Emailaddress + "'", conn))
                {
                    OleDbDataReader reader = cmd.ExecuteReader();
                    //loop through the reader
                    while (reader.Read())
                    {
                        
                        ContactID = reader["CONTACTID"].ToString();
                        ContactName = reader["CNAME"].ToString();
                        AccountID = reader["ACCOUNTID"].ToString();
                        Account = reader["ACCOUNT"].ToString();
                        ContactType = reader["TYPE"].ToString();

                        returnValue = true;
                    }
                    reader.Close();
                }
            }

            return returnValue;
        }
        private static String GetUserPrivateSeccode(String UserID)
        {
            String returnValue = String.Empty;  // Initialize
            // get the DataService to get a connection string to the database
            Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
            using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            {
                conn.Open();
                using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand("Select PRIVATESECCODEID  from EUROUSERPRIVATEMAP Where USERID = '" + UserID +"'", conn))
                {
                    object o = cmd.ExecuteScalar();
                    if (o != null) returnValue = o.ToString(); //
                }
            }

            return returnValue;
        }
    }
}
