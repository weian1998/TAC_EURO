--Select * from sysdba.EMAILARCHIVE

--Update sysdba.EMAILARCHIVE 
--set ISLINKEDHISTORY = 'F'

--Drop table dbo.CAL
--Drop Table dbo.CONTACT1
--Drop Table dbo.CONTACT2
--Drop Table dbo.CONTHIST
--Drop Table dbo.CONTSUPP
--Drop Table dbo.CONTUDEF 
--Drop Table dbo.NOTES
--Drop Table dbo.OPMGR
--Drop Table dbo.USERS
-- ReImort the tables
Truncate Table sysdba.GOLDEMAIL 

SELECT     COUNT(*) AS Expr1, USERFIELD1
FROM         sysdba.CONTACT
GROUP BY USERFIELD1
Having COUNT(*) >1

--=============================
--  Copy the GoldEmail via ssis
--==============================
SELECT     sysdba.CONTACT.ACCOUNTID AS Accountid, sysdba.CONTACT.CONTACTID AS contactid, CONTSUPP.CONTSUPREF AS Email
FROM         CONTSUPP INNER JOIN
                      sysdba.CONTACT ON CONTSUPP.ACCOUNTNO = sysdba.CONTACT.USERFIELD1
WHERE     (CONTSUPP.CONTACT = 'E-MAIL ADDRESS')

Select * from sysdba.goldEmail

--====================================
-- Update Contact Email Addresses
--====================================
Update sysdba.contact
SET     EMAIL =sysdba.GOLDEMAIL.EMAIL 
FROM         sysdba.CONTACT INNER JOIN
                      sysdba.GOLDEMAIL ON sysdba.CONTACT.CONTACTID = sysdba.GOLDEMAIL.CONTACTID
                      Where sysdba.Contact.email is null
                      
Select * from sysdba.EMAILEXTRA 
Truncate Table sysdba.EmailExtra 
 
 -- =========================================================================================
 -- Clean Up Email Archives after Improt from gold Email and updateing the Contact Record
Delete
from sysdba.EMAILEXTRA 
Where EMAILEXTRAID in (
Select EMAILEXTRAID 
FROM         sysdba.EMAILEXTRA INNER JOIN
                      sysdba.CONTACT ON sysdba.EMAILEXTRA.CONTACTID = sysdba.CONTACT.CONTACTID AND sysdba.EMAILEXTRA.EMAIL = sysdba.CONTACT.EMAIL
)

--=============================================
-- SECONDARY EMAILS

UPDATE sysdba.CONTACT
SET     SECONDARYEMAIL= EMAILEXTRA_1.EMAIL
FROM         sysdba.CONTACT INNER JOIN
                          (SELECT     COUNT(*) AS Expr1, CONTACTID
                            FROM          sysdba.EMAILEXTRA
                            GROUP BY CONTACTID
                            HAVING      (COUNT(*) = 1)) AS TMP ON sysdba.CONTACT.CONTACTID = TMP.CONTACTID INNER JOIN
                      sysdba.EMAILEXTRA AS EMAILEXTRA_1 ON sysdba.CONTACT.CONTACTID = EMAILEXTRA_1.CONTACTID 

 Delete
from sysdba.EMAILEXTRA 
Where EMAILEXTRAID in (
Select EMAILEXTRAID 
FROM         sysdba.EMAILEXTRA INNER JOIN
                      sysdba.CONTACT ON sysdba.EMAILEXTRA.CONTACTID = sysdba.CONTACT.CONTACTID AND sysdba.EMAILEXTRA.EMAIL = sysdba.CONTACT.SECONDARYEMAIL 
)

--=================================================
-- EMAIL3
  
UPDATE sysdba.CONTACT
SET     EMAIL3 = EMAILEXTRA_1.EMAIL
FROM         sysdba.CONTACT INNER JOIN
                          (SELECT     COUNT(*) AS Expr1, CONTACTID
                            FROM          sysdba.EMAILEXTRA
                            GROUP BY CONTACTID
                            HAVING      (COUNT(*) = 1)) AS TMP ON sysdba.CONTACT.CONTACTID = TMP.CONTACTID INNER JOIN
                      sysdba.EMAILEXTRA AS EMAILEXTRA_1 ON sysdba.CONTACT.CONTACTID = EMAILEXTRA_1.CONTACTID 

 Delete
from sysdba.EMAILEXTRA 
Where EMAILEXTRAID in (
Select EMAILEXTRAID 
FROM         sysdba.EMAILEXTRA INNER JOIN
                      sysdba.CONTACT ON sysdba.EMAILEXTRA.CONTACTID = sysdba.CONTACT.CONTACTID AND sysdba.EMAILEXTRA.EMAIL = sysdba.CONTACT.EMAIL3  
)                   

Update sysdba.CONTACT set TYPE = status
---===================================== 
--SELECT     'Update sysdba.Account set accountmanagerid = ''' + 'MYID''' + where distinct CONTACT1.KEY4

Update sysdba.ACCOUNT
Set ACCOUNTMANAGERID  = ISNULL(sysdba.USERSECURITY.USERID, CONTACT1.KEY4) 
FROM         sysdba.ACCOUNT INNER JOIN
                      sysdba.CONTACT ON sysdba.ACCOUNT.ACCOUNTID = sysdba.CONTACT.ACCOUNTID INNER JOIN
                      CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO LEFT OUTER JOIN
                      sysdba.USERSECURITY ON CONTACT1.KEY4 = sysdba.USERSECURITY.USERCODE


SELECT     distinct 'Update sysdba.Account set accountmanagerid = ''' + 'MYID''' + ' where Accountmanagerid =''' +  CONTACT1.KEY4  + ''' '                    
FROM         sysdba.ACCOUNT INNER JOIN
                      sysdba.CONTACT ON sysdba.ACCOUNT.ACCOUNTID = sysdba.CONTACT.ACCOUNTID INNER JOIN
                      CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO LEFT OUTER JOIN
                      sysdba.USERSECURITY ON CONTACT1.KEY4 = sysdba.USERSECURITY.USERCODE
Where sysdba.USERSECURITY.USERID is null   

--select * from sysdba.USERINFO order by username   

Update sysdba.Account set accountmanagerid = 'UEUROA00001O' where Accountmanagerid ='Michael B' 
Update sysdba.Account set accountmanagerid = 'UEUROA00000Z' where Accountmanagerid ='Ashley H' 
Update sysdba.Account set accountmanagerid = 'UEUROA000022' where Accountmanagerid ='' 
Update sysdba.Account set accountmanagerid = 'UEUROA000022' where Accountmanagerid ='Filiform' 

Update sysdba.Account set accountmanagerid = 'UEUROA00000Q' where Accountmanagerid ='Michael T' 
Update sysdba.Account set accountmanagerid = 'UEUROA00001N' where Accountmanagerid ='Tara' 
Update sysdba.Account set accountmanagerid = 'UEUROA00001N' where Accountmanagerid ='Sarah Smith' 
Update sysdba.Account set accountmanagerid = 'UEUROA00000Q' where Accountmanagerid ='MT' 
Update sysdba.Account set accountmanagerid = 'UEUROA000014' where Accountmanagerid ='Marina' 
Update sysdba.Account set accountmanagerid = 'UEUROA000022' where Accountmanagerid ='NA' 
Update sysdba.Account set accountmanagerid = 'UEUROA000022' where Accountmanagerid IS NULL 
Update sysdba.Account set accountmanagerid = 'UEUROA00000Q' where Accountmanagerid ='Michael' 
Update sysdba.Account set accountmanagerid = 'UEUROA000022' where Accountmanagerid ='Filiform2' 
Update sysdba.Account set accountmanagerid = 'UEUROA00000B' where Accountmanagerid ='Shannon' 
Update sysdba.Account set accountmanagerid = 'UEUROA000022' where Accountmanagerid ='Keith' 
Update sysdba.Account set accountmanagerid = 'UEUROA00000Y' where Accountmanagerid ='Carina'   

--===================================
-- Rating   
Update sysdba.ACCOUNT                      
SET     RATING= CONTACT1.KEY5
FROM         sysdba.ACCOUNT INNER JOIN
                      sysdba.CONTACT ON sysdba.ACCOUNT.ACCOUNTID = sysdba.CONTACT.ACCOUNTID INNER JOIN
                      CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO
                      
--===================================
-- LeadSource
-- Used for Import Query   
Truncate table sysdba.LeaSource                   
Select distinct source as Description, source as ABBREVDESC,'Event' as Type, 'Active' as Status , '0' as cost from  CONTACT1 

Update sysdba.Account
SET     LEADSOURCEID=sysdba.LEADSOURCE.LEADSOURCEID 
FROM         sysdba.ACCOUNT INNER JOIN
                      sysdba.CONTACT ON sysdba.ACCOUNT.ACCOUNTID = sysdba.CONTACT.ACCOUNTID INNER JOIN
                      CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO LEFT OUTER JOIN
                      sysdba.LEADSOURCE ON CONTACT1.SOURCE = sysdba.LEADSOURCE.DESCRIPTION
                      
--=============================
-- Account Type
Update sysdba.ACCOUNT 
set TYPE = status

Update sysdba.ACCOUNT 
Set STATUS  = 'Active'


Select * from CONTACT1 where COMPANY like 'Freed%'
A3103152460(BDV-RPDA
Select * from dbo.CONTACT2  where ACCOUNTNO ='A3103152460(BDV-RPDA'

Select * from sysdba.EMAILARCHIVE
Order by CREATEDATE desc                    