/* formerly was in general.js   */
SparkLine = function (config) {
    this.config = config;
    if (typeof (config.data) !== 'undefined') {
        if (config.data.type.toLowerCase() === 'mashup') {
            var self = this;
            $.get("MashupHandler.ashx", config.data.params, function (result) {
                var datavals = "";
                var first = true;
                var elems = result.documentElement.getElementsByTagName(config.data.datavaluename);
                for (var i = 0; i < elems.length; i++) {
                    if (!first) datavals += ",";
                    datavals += $(elems[i]).text();
                    first = false;
                }
                self.makeImg(config, datavals);
            });
        } else if (config.data.type.toLowerCase() == 'literal') {
            this.makeImg(config, config.data.data.join(','));
        }
    }
};
SparkLine.prototype.makeImg = function (config, datavals) {
    var sparkurl = "Libraries/SparkHandler.ashx?";
    for (var param in config.params) {
        sparkurl += param + "=" + encodeURIComponent(config.params[param]) + "&";
    }
    sparkurl += config.paramdataname + "=" + datavals;
    $('#' + config.renderTo).html(String.format('<img src="{0}" alt="{1}" title="{1}" />', sparkurl, datavals));
};

function RunSummarySparkLine(config) {
    window.setTimeout(function () { var spk = new SparkLine(config); }, 10);
    return '';
}