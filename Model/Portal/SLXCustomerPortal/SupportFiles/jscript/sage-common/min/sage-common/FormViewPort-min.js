/*
 * SageSalesLogixCommon
 * Copyright(c) 2009, Sage Software.
 * 
 * 
 */


Ext.FormViewport=Ext.extend(Ext.Container,{initComponent:function(){Ext.FormViewport.superclass.initComponent.call(this);document.getElementsByTagName('html')[0].className+=' x-viewport';this.el=Ext.get(document.forms[0]);this.el.setHeight=Ext.emptyFn;this.el.setWidth=Ext.emptyFn;this.el.setSize=Ext.emptyFn;this.el.dom.scroll='no';this.allowDomMove=false;this.autoWidth=true;this.autoHeight=true;Ext.EventManager.onWindowResize(this.fireResize,this);this.renderTo=this.el;},fireResize:function(w,h){this.fireEvent('resize',this,w,h,w,h);this.doLayout();}});Ext.reg('FormViewport',Ext.FormViewport);