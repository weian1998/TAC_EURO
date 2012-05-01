--Delete from sysdba.EUROUSERPRIVATEMAP
--Where USERID in
--(
--Select userid from sysdba.USERSECURITY
--where TYPE = 'R')

Select Userid from sysdba.USERSECURITY
where type in ('N','C') and USERID not in (
Select userid from sysdba.EUROUSERPRIVATEMAP)