--Select * from sysdba.EMAILARCHIVE

Update sysdba.EMAILARCHIVE 
set ISLINKEDHISTORY = 'F'

Drop table dbo.CAL
Drop Table dbo.CONTACT1
Drop Table dbo.CONTACT2
Drop Table dbo.CONTHIST
Drop Table dbo.CONTSUPP
Drop Table dbo.CONTUDEF 
Drop Table dbo.NOTES
Drop Table dbo.OPMGR
Drop Table dbo.USERS
-- ReImort the tables
 


--=============================
--  Copy the GoldEmail via SSIS
--==============================
Truncate Table sysdba.GOLDEMAIL

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

--===================================================
-- Account Number of Designers
Update sysdba.ACCOUNT
SeT       NUMDESIGNERS = CONTACT2.UNODESNR, 
          TAXID =CONTACT2.UTAXID, 
          TAXEXEMPT = CONTACT2.UTAXEXEMPT,                     
          SPECIALTY =CONTACT1.KEY3
FROM         sysdba.ACCOUNT INNER JOIN
                      sysdba.CONTACT ON sysdba.ACCOUNT.ACCOUNTID = sysdba.CONTACT.ACCOUNTID INNER JOIN
                      CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN
                      CONTACT2 ON CONTACT1.ACCOUNTNO = CONTACT2.ACCOUNTNO
                      
--=====================================================
-- Contact WebAddress and Type
Update sysdba.Contact
Set Webaddress = sysdba.Account.Webaddress,
	Type = sysdba.Account.type
From sysdba.Contact Inner Join sysdba.Account on sysdba.contact.accountid = sysdba.Account.accountid  

Update sysdba.Contact Set Status = 'Active'   

--=====================================
-- Contact Cell Phone Fix
Update sysdba.Contact set mobile = homephone  

Update sysdba.contact set Homephone = null               



--===========================================================
-- Opportunity SSIS Query
Truncate Table Sysdba.Opportunity
SELECT     sysdba.ACCOUNT.ACCOUNTID, LEFT(CONTHIST.REF, 64) AS DESCRIPTION, 'T' AS CLOSED, NULL AS TYPE, NULL AS STAGE, NULL AS SALESCYCLE, NULL 
                      AS PRODUCTID, CONTHIST.DURATION AS SALESPOTENTIAL, 0 AS CLOSEPROBABILITY, CONTHIST.DURATION AS SALESAMOUNT, 
                      CONTHIST.DURATION AS ACTUALAMOUNT, CONTHIST.ONDATE AS ESTIMATEDCLOSE, CONTHIST.ONDATE AS ACTUALCLOSE, NULL AS SUMMARY, 
                      CONVERT(varchar(MAX), CONVERT(varbinary(MAX), CONTHIST.NOTES)) AS NOTES, ISNULL(AcctMgr.USERID, CONTHIST.USERID) AS ACCOUNTMANAGERID, NULL 
                      AS REGIONALMANAGERID, NULL AS DIVISIONALMANAGERID, 
                      CASE ResultCode WHEN 'SLD' THEN 'Closed Won' WHEN 'LST' THEN 'Closed Lost' ELSE resultcode END AS STATUS, NULL AS FIELDCOMMIT, NULL 
                      AS MGTCOMMIT, NULL AS CORPCOMMIT, NULL AS MANUFCOMMIT, NULL AS KEYEDPOTENTIAL, NULL AS KEYEDPROBABILITY, NULL AS DAYSINPIPELINE, NULL 
                      AS CURRENTSTEP, NULL AS NEXTSTEP, NULL AS PROJCLOSESTEP, NULL AS REASON, NULL AS CURRENTSTEPDATE, NULL AS NEXTSTEPDATE, 
                      CONTHIST.ONDATE AS PROJCLOSEDATE, NULL AS LEADSOURCEID, NULL AS LEADDATE, sysdba.ACCOUNT.SECCODEID, ISNULL(Createuser.USERID, 
                      CONTHIST.CREATEBY) AS CREATEUSER, CONTHIST.CREATEON AS CREATEDATE, ISNULL(Modifyuser.USERID, CONTHIST.USERID) AS MODIFYUSER, 
                      CONTHIST.LASTDATE AS MODIFYDATE, NULL AS WIN, NULL AS CAMPAIGNID, NULL AS SUBTYPE, NULL AS ENGINEERID, NULL AS SALESENGINEERID, NULL 
                      AS ESTCLOSEDATE_PROBABILITY, NULL AS ADDTOFORECAST, CONTHIST.ACTVCODE AS EXCHANGERATECODE, 1 AS EXCHANGERATE, 
                      CONTHIST.CREATEON AS EXCHANGERATEDATE, 'F' AS EXCHANGERATELOCKED, NULL AS LASTHISTORYDATE, NULL AS LASTHISTORYBY, NULL AS RESELLERID, 
                      CONTHIST.CREATEON AS DATEOPENED
FROM         CONTHIST LEFT OUTER JOIN
                      sysdba.USERSECURITY AS Modifyuser ON CONTHIST.USERID = Modifyuser.USERCODE LEFT OUTER JOIN
                      sysdba.USERSECURITY AS Createuser ON CONTHIST.USERID = Createuser.USERCODE LEFT OUTER JOIN
                      sysdba.USERSECURITY AS AcctMgr ON CONTHIST.USERID = AcctMgr.USERCODE LEFT OUTER JOIN
                      sysdba.CONTACT ON sysdba.CONTACT.USERFIELD1 = CONTHIST.ACCOUNTNO LEFT OUTER JOIN
                      sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID
WHERE     (CONTHIST.SRECTYPE LIKE 'S') AND (sysdba.ACCOUNT.ACCOUNTID IS NOT NULL)

--====================================================================
-- Fix Account Security
--====================================================================
Select * from sysdba.Seccode

Update sysdba.Account Set Seccodeid ='SYST00000001'  FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'SHANI   '
Update sysdba.Account Set Seccodeid ='SYST00000001' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = ''
Update sysdba.Account Set Seccodeid ='SYST00000001' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'TIM'
Update sysdba.Account Set Seccodeid ='SYST00000001' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'MICHAELT'
Update sysdba.Account Set Seccodeid ='FEUROA000004' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = '13operat'
Update sysdba.Account Set Seccodeid ='FEUROA000004'  FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'LESLIE  '
Update sysdba.Account Set Seccodeid ='FEUROA000003' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'BRUNO'
Update sysdba.Account Set Seccodeid ='SYST00000001' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'JAMIE   '
Update sysdba.Account Set Seccodeid ='FEUROA000004' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = '14accoun'
Update sysdba.Account Set Seccodeid ='SYST00000001' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'MIA'
Update sysdba.Account Set Seccodeid ='SYST00000001' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'BABITA'
Update sysdba.Account Set Seccodeid ='SYST00000001' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'TARAR   '
Update sysdba.Account Set Seccodeid ='FEUROA000003' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'BRUNO   '
Update sysdba.Account Set Seccodeid ='SYST00000001' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'ROB'
Update sysdba.Account Set Seccodeid ='SYST00000001' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = '12filou'
Update sysdba.Account Set Seccodeid ='SYST00000001' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'PAUL'
Update sysdba.Account Set Seccodeid ='FEUROA000004' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = '14manage'
Update sysdba.Account Set Seccodeid ='FEUROA000004' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = 'LESLIE'
Update sysdba.Account Set Seccodeid ='SYST00000001' FROM         sysdba.CONTACT INNER JOIN CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID where Owner = '15retail'
UPDATE    sysdba.ACCOUNT SET              SECCODEID = 'SYST00000001'
FROM         sysdba.CONTACT INNER JOIN
                      CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO INNER JOIN
                      sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID
WHERE     (CONTACT1.OWNER = 'MARIEJOS')

--===============================================================
-- Contact Security
UPDATE    sysdba.CONTACT
SET              SECCODEID = sysdba.ACCOUNT.SECCODEID
FROM         sysdba.CONTACT INNER JOIN
                      sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID
                      
                      
                      
--=============================================================================
-- Opportunity Security
UPDATE    sysdba.OPPORTUNITY
SET              SECCODEID = sysdba.ACCOUNT.SECCODEID
FROM         sysdba.OPPORTUNITY INNER JOIN
                      sysdba.ACCOUNT ON sysdba.OPPORTUNITY.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID                      
                      

Update sysdba.OPPORTUNITY set STATUS = 'Closed - Won' where STATUS = 'Closed Won'   
Update sysdba.OPPORTUNITY set STATUS = 'Closed - Lost' where STATUS = 'Closed Lost' 

Update sysdba.ACCOUNT 
SET     TYPE= CONTACT1.KEY1
FROM         sysdba.ACCOUNT INNER JOIN
                      sysdba.CONTACT ON sysdba.ACCOUNT.ACCOUNTID = sysdba.CONTACT.ACCOUNTID INNER JOIN
                      CONTACT1 ON sysdba.CONTACT.USERFIELD1 = CONTACT1.ACCOUNTNO 
                      
Update sysdba.CONTACT
SET     TYPE =sysdba.ACCOUNT.TYPE 
FROM         sysdba.CONTACT INNER JOIN
                      sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID
                      
Update sysdba.CONTACT
SET     accountmanagerid =sysdba.ACCOUNT.accountmanagerid 
FROM         sysdba.CONTACT INNER JOIN
                      sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID
                      


Select distinct status from sysdba.OPPORTUNITY 
Select * from CONTACT1 where COMPANY like 'Promotion%'
A5101442434&8.YM.Agn
Select * from dbo.CONTACT2  where ACCOUNTNO ='A5101442434&8.YM.Agn'
Select * from dbo.CONTACT1  where ACCOUNTNO ='A5101442434&8.YM.Agn'
Select * from dbo.CONTsupp  where ACCOUNTNO ='A5101442434&8.YM.Agn'
Select * from dbo.CONTUDEF  where fieldDesc like 'cell%'

Select * from contact1 where accountno ='A6092041286&UW1:^Dom'

Select * from sysdba.EMAILARCHIVE
Order by CREATEDATE desc  

Select * from sysdba.Contact where contactid ='CEUROA000UO0'   

Delete from sysdba.History where Emailarchiveid is not null      
Update sysdba.EmailArchive Set islinkedHistory = 'F'   

Select * from sysdba.EmailArchive where islinkedHistory = 'T'      