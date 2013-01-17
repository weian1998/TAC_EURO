--==============================================================
-- PreGolive Data Migration
-- Remove Accounts that should not be there
--===============================================================
Delete from sysdba.ACCOUNT where EXTERNALACCOUNTNO not in (
Select ACCOUNTNO  from dbo.CONTACT1 )

--Run integrity Checker
--=========================================================================
-- Identify Owner Blank and Accountmanager is Blank what to do with these
SELECT     CONTACT1.ACCOUNTNO, CONTACT1.OWNER, CONTACT1.KEY4, sysdba.SECCODE.SECCODEDESC
FROM         CONTACT1 INNER JOIN
                      sysdba.ACCOUNT ON CONTACT1.ACCOUNTNO = sysdba.ACCOUNT.EXTERNALACCOUNTNO INNER JOIN
                      sysdba.SECCODE ON sysdba.ACCOUNT.SECCODEID = sysdba.SECCODE.SECCODEID
where KEY4 = ''  and OWNER = ''                     


SELECT     distinct OWNER --CONTACT1.ACCOUNTNO, CONTACT1.OWNER, CONTACT1.KEY4, sysdba.SECCODE.SECCODEDESC
FROM         CONTACT1 INNER JOIN
                      sysdba.ACCOUNT ON CONTACT1.ACCOUNTNO = sysdba.ACCOUNT.EXTERNALACCOUNTNO INNER JOIN
                      sysdba.SECCODE ON sysdba.ACCOUNT.SECCODEID = sysdba.SECCODE.SECCODEID
where KEY4 <> ''  and OWNER <> ''   

SELECT DISTINCT CONTACT1.OWNER
FROM         sysdba.ACCOUNT INNER JOIN
                      CONTACT1 ON sysdba.ACCOUNT.EXTERNALACCOUNTNO = CONTACT1.ACCOUNTNO       
order by owner      

-- Opportunity
Select * from dbo.CONTHIST where RECTYPE ='S' 
AND resultcode IN( 'SLD','LST'               )

-- CLEAN OUT HISTORY
DELETE  FROM sysdba.HISTORY
WHERE FULFILMENTTASKID IS NOT NULL OR EMAILARCHIVEID IS NOT NULL 

TRUNCATE TABLE SYSDBA.OPPORTUNITY
truncate table sysdba.OPPORTUNITY_CAMPAIGN
Truncate Table sysdba.OPPORTUNITY_CONTACT
Truncate Table sysdba.OPPORTUNITY_PRODUCT
Truncate Table sysdba.OPPFULFILSTAGE
Truncate Table sysdba.OPPFULFILTASK

Select * from sysdba.V_NewOpps

Update sysdba.OPPORTUNITY 
set ACCOUNTMANAGERID = USERID
FROM         sysdba.OPPORTUNITY INNER JOIN
                      sysdba.USERINFO ON sysdba.OPPORTUNITY.ENGINEERID = sysdba.USERINFO.FIRSTNAME

Update sysdba.OPPORTUNITY  -- sET TO ADMIN WHERE i CAN'T MAP UP A USER
SeT  ACCOUNTMANAGERID = 'ADMIN'
FROM         sysdba.OPPORTUNITY 
where ENGINEERID not in 
                      (Select firstname from sysdba.USERINFO where firstname is not null)
                      and ENGINEERID is not null

update sysdba.OPPORTUNITY                       
SeT     sysdba.OPPORTUNITY.SECCODEID= sysdba.EUROXHISTORYMAPPING.XHISTORYSECCODEID
FROM         sysdba.OPPORTUNITY INNER JOIN
                      sysdba.EUROXHISTORYMAPPING ON sysdba.OPPORTUNITY.SECCODEID = sysdba.EUROXHISTORYMAPPING.MAINACCOUNTSECCODEID                     



           