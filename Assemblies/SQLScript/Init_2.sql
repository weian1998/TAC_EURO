Delete from sysdba.ADDRESS where ADDRESSID in (Select ADDRESSID from sysdba.ACCOUNT)
or ADDRESSID in (Select ADDRESSID from sysdba.CONTACT )

Truncate Table sysdba.Account
Truncate Table sysdba.Accountsummary
Truncate table sysdba.Contact
Truncate Table sysdba.History
Truncate Table Sysdba.Activity
truncate table sysdba.Opportunity
Truncate Table sysdba.Opportunity_Contact
Truncate Table sysdba.Opportunity_Product


