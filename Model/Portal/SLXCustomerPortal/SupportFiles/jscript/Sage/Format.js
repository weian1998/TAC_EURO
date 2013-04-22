/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define(['Sage/Utility', 'dojo/string'],
function (utility, dString) {

    Sage.Format = {
        // summary:
        // this class contains common SalesLogix based formatters for formatting data in grids and elsewhere.
        phone: function (val, index) {
            if (!val) return '';
            if (val.length !== 10) return utility.htmlEncode(val);

            return dString.substitute('(${0}) ${1}-${2}',
			[val.substring(0, 3), val.substring(3, 6),
			val.substring(6)]);
        },
        email: function (val, index) {
            if (!val) return '';
            var dispstr = val; ;
            if (this.icon && this.icon !== '') {
                dispstr = (this.icon === true || this.icon === 'true')
                    ? '<img src="images/icons/Send_Write_email_16x16.png" />'
                    : '<img src="' + this.icon + '" />';
            }
            return dojo.string.substitute('<a href="mailto:${0}">${1}</a>', [val, dispstr]);
        },
        stringFromArray: function (formatString, arr) {
            switch (arr.length) {
                case 1:
                    return String.format(formatString, arr[0]);
                case 2:
                    return String.format(formatString, arr[0], arr[1]);
                case 3:
                    return String.format(formatString, arr[0], arr[1], arr[2]);
                case 4:
                    return String.format(formatString, arr[0], arr[1], arr[2], arr[3]);
                case 5:
                    return String.format(formatString, arr[0], arr[1], arr[2], arr[3], arr[4]);
                case 6:
                    return String.format(formatString, arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]);
                case 7:
                    return String.format(formatString, arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6]);
                case 8:
                    return String.format(formatString, arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7]);
                case 9:
                    return String.format(formatString, arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7], arr[8]);
                case 10:
                    return String.format(formatString, arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7], arr[8], arr[9]);
                default:
                    return formatString;

            }
        },

        abbreviationFormatter: function (maxLength) {
            // summary:
            //  Return formatter function to be used to restrict length of a display
            return function (value) {
                if (!value || typeof (value) != "string" || value.length <= maxLength)
                    return value;
                value = value.substring(0, maxLength);
                var ispace = value.lastIndexOf(" ");
                if (ispace > 0 && ispace > value.length * .75) {
                    // pick the last space in the string, but only if it's at least 3/4 of it
                    value = value.substring(0, ispace);
                }
                return value + "...";
            };
        },
        Address: {
            fullAddressFormatStrings: {
                "USA": "${0}\r\n${1}\r\n${2}\r\n${3}, ${4} ${5}\r\n${6}",
                "Japan": "${0}\r\n${1}${2}\r\n${3}, ${4} ${5}\r\n${6}"
            },
            formatDefault: function (address) {
                var addr1F = '', addr2F = '', addr3F = '', cityF = '', stateF = '', postalCodeF = '', countryF = '';
                var lineBreak = '\r\n';
                for (var i = 0; i < address.length; i++) {
                    //Build up the formatted string based on presence of values.
                    switch (address[i].name) {
                        case 'addr1':
                            addr1F = (address[i].value.length > 0) ? address[i].value : '';
                            break;
                        case 'addr2':
                            addr2F = (address[i].value.length > 0) ? [lineBreak, address[i].value].join('') : '';
                            break;
                        case 'addr3':
                            addr3F = (address[i].value.length > 0) ? [lineBreak, address[i].value].join('') : '';
                            break;
                        case 'city':
                            cityF = (address[i].value.length > 0) ? [lineBreak, address[i].value, ','].join('') : '';
                            break;
                        case 'state':
                            var cityTest = (address[i - 1].value.length > 0) ? '' : lineBreak;
                            stateF = (address[i].value.length > 0) ? [cityTest, ' ', address[i].value].join('') : '';
                            break;
                        case 'postalCode':
                            postalCodeF = (address[i].value.length > 0) ? [' ', address[i].value].join('') : '';
                            break;
                        case 'country':
                            countryF = (address[i].value.length > 0) ? [lineBreak, address[i].value].join('') : '';
                            break;
                    }
                }
                return [addr1F, addr2F, addr3F, cityF, stateF, postalCodeF, countryF].join('');
            },
            formatAddress: function (address, byLocal) {
                // summary: 
                // Takes and array of address fields and formats them by local.
                // @param address: Array of addres fields.
                // @param byLocal: Determines whether the country code should determine the formatting.
                var addr1 = '', addr2 = '', addr3 = '', city = '', state = '', postalCode = '', country = '';
                var formattedAddress = '';
                for (var i = 0; i < address.length; i++) {
                    switch (address[i].name) {
                        case 'addr1': addr1 = address[i].value; break;
                        case 'addr2': addr2 = address[i].value; break;
                        case 'addr3': addr3 = address[i].value; break;
                        case 'city': city = address[i].value; break;
                        case 'state': state = address[i].value; break;
                        case 'postalCode': postalCode = address[i].value; break;
                        case 'country': country = address[i].value; break;
                    }
                }

                if (byLocal) {
                    switch (country) {
                        case 'USA':
                            formattedAddress = this.formatDefault(address);
                            break;
                        case 'Japan':
                            formattedAddress = dojo.string.substitute(this.fullAddressFormatStrings['Japan'],
                            [addr1, addr2, addr3, city, state, postalCode, country]);
                            break;
                        default:
                            formattedAddress = this.formatDefault(address);
                    }
                }
                else {
                    formattedAddress = this.formatDefault(address);
                }
                return formattedAddress;
            }
        }
    };
    return Sage.Format;
});