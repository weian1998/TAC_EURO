Delete from sysdba.Address 
Where entityid Not in (Select userid from sysdba.userinfo)


Truncate Table Sysdba.Account

Truncate Table sysdba.ACCOUNTSUMMARY

Truncate Table sysdba.Contact

Truncate Table sysdba.Activity

Truncate Table sysdba.LEAD

truncate table sysdba.LEAD_ADDRESS

Truncate table sysdba.HISTORY

Truncate Table sysdba.HIST_LEAD

Truncate Table sysdba.LEAD_ADDRESS

Truncate Table sysdba.OPPORTUNITY

Truncate Table sysdba.CFXACCOUNTREQUIREDDOC