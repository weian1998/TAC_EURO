/*
 * SagePlatform
 * Copyright(c) 2009, Sage Software.
 */


Sage.RoleSecurityService=function(actionList){this._actionList=actionList;this._userID="";this._actionName="";}
Sage.RoleSecurityService.prototype.hasAccess=function(actionName){this._actionName=actionName;this._userID=Sage.Utility.getClientContextByKey('userID');var rval=false;if(dojo.trim(this._userID.toUpperCase())==='ADMIN'){rval=true;}
else{var aLen=this._actionList.length;for(var i=0;i<aLen;i++){if(this._actionList[i].toUpperCase()===this._actionName.toUpperCase()){rval=true;break;}}}
return rval;}