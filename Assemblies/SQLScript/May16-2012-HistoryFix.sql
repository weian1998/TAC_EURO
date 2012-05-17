

Delete from sysdba.EMAILARCHIVE  where CREATEDATE < '20120501'
Delete from sysdba.EMAILARCHIVE where REPROCESSNOTE = 'User Not Found'
Delete from sysdba.EMAILARCHIVE where REPROCESSNOTE = 'Contact Not Found'


Update sysdba.EMAILARCHIVE set ISLINKEDHISTORY = 'F'
