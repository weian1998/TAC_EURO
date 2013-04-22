define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/string',
    'dojox/grid/EnhancedGrid',
    './_PropertyEditor',
    'Sage/Services/_ServiceMixin',
    'dojo/i18n!./nls/FormUsagesPropertyEditor'
], function(
    declare,
    lang,
    string,
    EnhancedGrid,
    _PropertyEditor,
    _ServiceMixin,
    localization)
{
    return declare('Sage.QuickForms.Design.Editors.FormUsagesPropertyEditor', [EnhancedGrid, _PropertyEditor, _ServiceMixin], {
        serviceMap: {
            'dataService': { type: 'sdata', name: 'metadata' }
        },

        // Localization
        titleText: 'Usage',

        portalText: 'Portal',
        viewText: 'View',
        modesText: 'Modes',
        descriptionText: 'Description',

        // View Properties
        selectionMode: 'none',
        canSort: function(){
            return false;
        },

        constructor: function() {
            lang.mixin(this, localization);
        },
        setup: function() {
            this.inherited(arguments);

            var name = this._designer.get('name') || '';

            var store = new Sage.Data.SDataStore({
                service: this.dataService,
                resourceKind: 'formUsages',
                select: [
                    'showInMode',
                    'portalPage/portalAlias',
                    'portalPage/pagetitle',
                    'portalPage/description'
                ],
                where: string.substitute('smartPartId eq "${0}"', [name])
            });

            this.setStore(store);
            this.set('structure', [{
                field: 'portalPage.portalAlias',
                name: this.portalText,
                width: 'auto'
            },{
                field: 'portalPage.pagetitle',
                name: this.viewText,
                width: 'auto'
            },{
                field: 'showInMode',
                name: this.modesText,
                formatter: this.formatModes,
                width: 'auto'
            },{
                field: 'portalPage.description',
                name: this.descriptionText,
                width: 'auto'
            }]);
        },
        formatModes: function(modes){
            if(!modes) return '';

            return (lang.isArray(modes)) ? modes.join(', ') : modes;
        }
    });
});