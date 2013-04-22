/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([],
    function () {
        Sage.namespace('Utility.SDataLookup');
        dojo.mixin(Sage.Utility.SDataLookup, {
            setFormatType: function (opts) {
                switch (opts.propertyFormat) {
                    case 'Phone':
                        return Sage.UI.Columns.Phone;
                    default:
                        return '';
                }
            },
            childObjectFormatter: function (opts) {
                var feedItem = opts.grid.grid._by_idx[opts.rowIdx].item,
                    res,
                    i;

                if (!feedItem || !feedItem[opts.childentity] || feedItem[opts.childentity].$resources.length === 0) {
                    return dojo.string.substitute('<div style="text-indent:16px">${0}</div>', [opts.value || '&nbsp;']);
                }

                opts.value = opts.value || '&nbsp;';
                res = [];
                if (opts.includeButton) {
                    res.push(dojo.string.substitute([
                        '<input type=button id="SOPshow${1}" style="height:16px;width:14px;border:0;background:transparent;vertical-align:top" onclick="dojo.query(\'.SOProw${1}\').style({display:\'\'});dojo.query(\'#SOPshow${1}\').style({display:\'none\'});dojo.query(\'#SOPhide${1}\').style({display:\'\'})" value="+">',
                        '<input type=button id="SOPhide${1}" style="display:none;height:16px;width:14px;border:0;background:transparent;vertical-align:top" onclick="dojo.query(\'.SOProw${1}\').style({display:\'none\'});dojo.query(\'#SOPshow${1}\').style({display:\'\'});dojo.query(\'#SOPhide${1}\').style({display:\'none\'})" value="-"> '
                        ].join(''), [opts.value, opts.rowIdx]));
                }

                res.push(dojo.string.substitute('${0}<div class=SOProw${1} style="display:none">', [opts.value, opts.rowIdx]));
                for (i = 0; i < feedItem[opts.childentity].$resources.length; i++) {
                    res.push(dojo.string.substitute('<div style="text-indent:2em">${0}</div>', [feedItem[opts.childentity].$resources[i][opts.fieldName] || '&nbsp;']));
                }

                res.push("</div>");
                return res.join('');
            }
        });
    });