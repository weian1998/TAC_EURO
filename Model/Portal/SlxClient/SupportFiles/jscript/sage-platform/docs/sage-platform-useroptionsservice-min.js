/*
 * SagePlatform
 * Copyright(c) 2009, Sage Software.
 */


Sage.UserOptionsService={optionUrlFmt:"slxdata.ashx/slx/crm/-/useroptions/{0}/{1}",getCommonOption:function(name,category,callback){$.ajax({url:String.format(Sage.UserOptionsService.optionUrlFmt,category,name),type:"GET",cache:false,contentType:"application/json",datatype:"json",success:function(resp){callback(Sys.Serialization.JavaScriptSerializer.deserialize(resp));}});}};