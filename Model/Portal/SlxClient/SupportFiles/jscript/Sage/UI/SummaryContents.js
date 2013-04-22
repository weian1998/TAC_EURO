/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define, require */
define([
        'dijit/_Widget',
        'Sage/_Templated',
        'dojo/_base/lang',
        'dojo/_base/declare'
],
function (_Widget, _Templated, lang, declare) {
    var summaryContents = declare('Sage.UI.SummaryContents', [_Widget, _Templated], {
        widgetsInTemplate: true,
        templateLocation: '', // 'SummaryTemplates/Account.html',
        templateString: '', // dojo . cache('Sage', 'SummaryTemplates/Account.html'),
        widgetTemplate: '',
        constructor: function (config) {
            var moduleNameParts = ['Sage'];
            var templateParts = config.templateLocation.split('/');
            for (var i = 0; i < templateParts.length - 1; i++) {
                moduleNameParts.push(templateParts[i]);
            }
            var path = 'dojo/i18n!' + moduleNameParts.join('/') + '/nls/' + templateParts[templateParts.length - 1].replace('.html', '');
            require([path],
                lang.hitch(this, function (nls) {
                    lang.mixin(this, nls);
                })
            );
            //Dynamic caching need to be obscured from the builder by using the dojo['cache'] calling method
            this.templateString = dojo['cache']('Sage', config.templateLocation || this.templateLocation),
            this.widgetTemplate = new Simplate(eval(this.templateString));
        }
    });

    return summaryContents;
});

