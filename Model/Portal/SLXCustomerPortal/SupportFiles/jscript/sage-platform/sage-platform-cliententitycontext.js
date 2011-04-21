
Sage.ClientEntityContextService = function() {
	this.emptyContext = { "EntityId" : "", "EntityType" : "", "Description" : "", "EntityTableName" : "" };
}

Sage.ClientEntityContextService.prototype.getContext = function() {
	var dataelem = $get("__EntityContext");
	if (dataelem) {
		if (dataelem.value != "") {
		    var obj = dataelem.value.replace(/\n/g, " ").replace(/\r/g, " ");
		    return eval(obj);
		}
	}
	return this.emptyContext;
}

Sage.Services.addService("ClientEntityContext", new Sage.ClientEntityContextService());