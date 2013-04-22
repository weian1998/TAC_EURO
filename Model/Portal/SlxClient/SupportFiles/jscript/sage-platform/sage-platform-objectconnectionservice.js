//Manage the instances of dojo object connections
//This service is for non-dojo nodes.  Use this in order to leverage dojo.connect to replace YAHOO.util.Event
Sage.ObjectConnectionService = function () {
    //TODO: Test multiple listeners.  Likely need to convert to an array and update usages.
    this.objectConnections = {};
    this.add = function (conn, id) {
        this.objectConnections[id] = conn;
    };
    this.remove = function (id) {
        delete this.objectConnections[id];
    };
    this.disconnect = function (id) {
        dojo.disconnect(this.objectConnections[id]);
    };
    this.disconnectAll = function () {
        for (var i in this.objectConnections) {
            dojo.disconnect(this.objectConnections[i]);
        }
    };
    this.removeAll = function() {
        for (var i in this.objectConnections) {
            delete this.objectConnections[i];
        }
    };
};

Sage.Services.addService("ObjectConnectionService", new Sage.ObjectConnectionService());