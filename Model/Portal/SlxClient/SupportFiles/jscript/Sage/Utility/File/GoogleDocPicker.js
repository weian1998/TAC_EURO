/*globals dojo define google  */
define([
    'dijit/_Widget',
    'dijit/tree/TreeStoreModel',
    'dijit/Dialog',
    'dijit/Tree',
    'dojo/window',
    'dojo/data/ItemFileReadStore',
    'dojo/i18n!./nls/GoogleDocPicker',
    'dojo/_base/declare'
],
function (
    _Widget,
    TreeStoreModel,
    Dialog,
    Tree,
    dojoWindow,
    ItemFileReadStore,
    nlsResources,
    declare
) {

    var googleAuthModule = declare('Sage.Utility.File.GoogleAuthModule', null, {
        couldNotOpenWindowMsg: 'Could not open authentication window - please check your popup blocker settings.',

        scope: '',
        authUrl: '',
        constructor: function (opts) {
            this.scope = opts.authUrl;
            dojo.mixin(this, opts);
            dojo.mixin(this, nlsResources);
        },

        login: function () {
            // summary:
            //  Process login.
            //  When login completes (either because the user is already logged in, or because he successfully logs in)
            // the onLoggedIn function will be called.
            var r = this;
            this._loadGoogleLibrary(function () {
                google.load("gdata", "2.0", { "callback":
			        function () {
			            google.gdata.onLoad();
			            if (google.accounts.user.checkLogin(r.authUrl)) {
			                r.onLoggedIn();
			            } else {
			                window.googleAuthModule = r;
			                var win = window.open("GoogleAuth.aspx", "_blank");
			                setTimeout(function () {
			                    var blocked = false;
			                    if (typeof win == 'undefined')
			                    // safari popup blocker
			                        blocked = true;
			                    else if (win && win.closed)
			                    // happens if user closes the window right away
			                        blocked = false;
			                    else if (win && !win.outerHeight)
			                        blocked = true;
			                    if (blocked) {
			                        alert(r.couldNotOpenWindowMsg);
			                    }
			                }, 3000);
			            }
			        }
                });
            });
        },
        logout: function () {
            if (google.accounts.user.checkLogin(this.authUrl)) {
                google.accounts.user.logout();
            }
        },
        onLoggedIn: function () {

        },
        _loadGoogleLibrary: function (callback) {
            if (typeof google !== 'undefined') {
                callback();
            } else {
                var cbName = "googleCallback_" + String(Math.random()).replace(/^0\./, "");
                window[cbName] = callback;
                var script = document.createElement("script");
                script.src = "https://www.google.com/jsapi?callback=" + cbName;
                script.type = "text/javascript";
                document.getElementsByTagName("head")[0].appendChild(script);
            }
        }

    });

    var googleDocPicker = declare('Sage.Utility.File.GoogleDocPicker', _Widget, {
        id: '',
        googleDocumentsTitle: 'Google Documents',
        pick: function () {
            // summary:
            //	Show picker.  When selection is done, onDocumentSelected will be picked.
            var auth = new googleAuthModule({ authUrl: 'https://docs.google.com/feeds' });
            dojo.connect(auth, 'onLoggedIn', this, this._onLoggedInHandler);
            auth.login();
        },
        _onLoggedInHandler: function () {
            var svc = new google.gdata.client.GoogleService("writely", "mytest");
            svc.getFeed("https://docs.google.com/feeds/documents/private/full?showfolders=true",
				dojo.hitch(this, "_displayFeed"),
				function (e) {
				    alert(localeStrings.errorRetrievingData + "\n" + e.toString());
				}, undefined, true);
        },
        _displayFeed: function (feed) {
            var root = this._parseFeed(feed);
            dojo.ready(dojo.hitch(this, function () {
                var store = new ItemFileReadStore({ data: { items: [{ children: root, title: 'Root', root: true}]} });
                var treeModel = new TreeStoreModel({ store: store, childrenAttrs: ["children"], labelAttr: "title", query: {} });
                var tree = new Tree({
                    model: treeModel, showRoot: false, openOnDblClick: true
                });
                dojo.connect(tree, "onDblClick", dojo.hitch(this, function (item, node, evt) {
                    this.onDocumentSelected(item.title, item.url);
                }));
                dojo.connect(tree, "onLoad", dojo.hitch(this, function () {
                    var dlg = new Dialog({ title: nlsResources.googleDocumentsTitle, content: tree });
                    dlg.startup();
                    dlg.containerNode.style.maxHeight = dojo.window.getBox().h / 3 + "px";
                    dlg.containerNode.style.minWidth = "200px"; // dojo.window.getBox().w / 6 + "px";
                    dlg.containerNode.style.overflow = "auto";
                    dlg.show();
                }));
            }));
        },

        _parseFeed: function (feed) {
            // summary:
            //	Parse the incoming gdata feed and return the array of root items
            var items = [];
            var entries = feed.feed.entry;
            if (entries) {
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    var newItem = { id: entry.id.$t, title: entry.title.$t, feedentry: entry };
                    dojo.some(entry.category, function (x) {
                        if (x.scheme == "http://schemas.google.com/g/2005#kind") {
                            newItem.type = x.label;
                            return true;
                        }
                    });
                    items.push(newItem);
                }
            }
            items.sort(function (a, b) { return a.title > b.title ? 1 : (a.title < b.title ? -1 : 0); });

            // this prepares the tree for the feed
            var root = items.slice(0);
            var removed = 0;
            dojo.forEach(items, function (item, i) {
                var hasParent = false;
                dojo.forEach(item.feedentry.link, function (link) {
                    if (link.rel == "http://schemas.google.com/docs/2007#parent") {
                        dojo.some(items, function (parent) {
                            if (link.href == parent.id) {
                                hasParent = true;
                                if (!parent.children)
                                    parent.children = [];
                                parent.children.push(item);
                            }
                        });
                    }
                    if (link.rel == "alternate") {
                        // this seems to be the most reliable way to obtain the edit URL
                        item.url = link.href;
                    }
                });
                if (hasParent) {
                    root.splice(i - removed, 1);
                    removed++;
                }
            });
            return root;
        },
        onDocumentSelected: function (title, url) {
            // summary:
            //	Function called when the user has picked a document

        }
    });


    return googleDocPicker;

});