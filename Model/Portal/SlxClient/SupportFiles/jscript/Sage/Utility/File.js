/*globals Sage, define, FileReader, FormData, window */
define([
    'Sage/UI/Dialogs',
    'dojo/number'
],
function (dialogs, dNumber) {
    Sage.namespace('Utility.File');
    Sage.Utility.File = {
        fileType: {
            ftAttachment: 0,
            ftLibraryDocs: 1
        },
        unableToUploadText: 'Sage SalesLogix Desktop Integration Module must be installed to use this feature.',
        unknownSizeText: 'unknown',
        supportsHTML5File: (window.File && window.FileReader && window.FileList && window.Blob),
        largeFileWarningText: 'Warning: This request exceed the size limit set by your administrator and fail to upload.',
        largeFileWarningTitle: 'Warning',
        fileUploadOptions: { maxFileSize: 4000000 },
        init: function (options) {
            if (options) {
                this.fileUploadOptions = options;
            }
        },
        isFileSizeAllowed: function (files) {
            var l = 0;
            var maxfileSize = Sage.Utility.File.fileUploadOptions.maxFileSize;
            var title = Sage.Utility.File.largeFileWarningTitle;
            var msg = Sage.Utility.File.largeFileWarningText;
            for (var i = 0; i < files.length; i++) {
                if (files[i].size === 0) {
                    // do nothing.
                } else {

                    l += files[i].size || files[i].blob.length;
                }
            }
            if (l > (maxfileSize)) {
                dialogs.showError(msg, title);
                return false;

            }
            return true;
        },
        uploadFile: function (file, url, progress, complete, error, scope, asPut) {
            if (!Sage.Utility.File.isFileSizeAllowed([file])) {
                return;
            }
            if (Sage.gears) {
                this._uploadFileGears(file, url, progress, complete, error, scope, asPut);
            } else if (this.supportsHTML5File) {
                if (window.FileReader.prototype.readAsBinaryString) {
                    this._uploadFileHTML5_asBinary(file, url, progress, complete, error, scope, asPut);
                } else {
                    this._uploadFileHTML5(file, url, progress, complete, error, scope, asPut);
                }
            } else {
                this._showUnableToUploadError();
            }
        },
        uploadFileHTML5: function (file, url, progress, complete, error, scope, asPut) {
            if (!Sage.Utility.File.isFileSizeAllowed([file])) {
                return;
            }
            if (this.supportsHTML5File) {
                if (window.FileReader.prototype.readAsBinaryString) {
                    this._uploadFileHTML5_asBinary(file, url, progress, complete, error, scope, asPut);
                } else {
                    this._uploadFileHTML5(file, url, progress, complete, error, scope, asPut);
                }
            } else {
                this._showUnableToUploadError();
            }
        },
        _uploadFileGears: function (file, url, progress, complete, error, scope, asPut) {
            if (!window.Sage && !Sage.gears) {
                this._showUnableToUploadError();
                return;
            }
            if (!url) {
                //assume Attachment SData url
                url = 'slxdata.ashx/slx/system/-/attachments/file?format=json';
            }
            var request = Sage.gears.factory.create('beta.httprequest');
            request.open((asPut) ? 'PUT' : 'POST', url);

            //var boundary = '------multipartformboundary' + (new Date()).getTime();
            var boundary = "---------------------------" + (new Date()).getTime();
            var dashdash = '--';
            var crlf = '\r\n';

            var builder = Sage.gears.factory.create('beta.blobbuilder');
            //for (var i = 0; i < files.length; i++) {
            /* Write boundary. */
            builder.append(dashdash);
            builder.append(boundary);
            builder.append(crlf);
            //var file = files[i];
            /* Generate headers. */
            //builder.append('Content-Disposition: form-data; name="file_"'); // + i + '"'); // will not work for raw binary
            builder.append('Content-Disposition: attachment; name="file_"'); // + i + '"');

            if (file.name) {
                builder.append('; filename*="' + encodeURI(file.name) + '"');
            }
            builder.append(crlf);

            builder.append('Content-Type: application/octet-stream');
            builder.append(crlf);
            builder.append(crlf);

            /* Append binary data. */
            builder.append(file.blob);
            builder.append(crlf);
            //}
            /* Mark end of the request. */
            builder.append(dashdash);
            builder.append(boundary);
            builder.append(dashdash);
            builder.append(crlf);

            if (typeof (complete) === 'function') {
                request.onreadystatechange = function () {
                    if (request.readyState === 4) {
                        //console.log(JSON.parse(xhr.responseText.replace(/^\{\}&&/, '')));
                        if (Math.floor(request.status / 100) !== 2) {
                            if (typeof (error) === 'function') {
                                error.call(scope || this, request);
                            }
                        } else {
                            complete.call(scope || this, request);
                        }
                    }
                };
            }

            if (typeof (progress) === 'function') {
                request.upload.onprogress = function (prog) {
                    // { total : 500, loaded : 250, lengthComputable : true };  <-- example progress object
                    progress.call(scope || this, prog);
                };
            }
            request.setRequestHeader('Content-Type', 'multipart/attachment; boundary=' + boundary);
            // request.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary); //will not work for raw binary
            var blob = builder.getAsBlob();
            request.send(blob);
        },
        _uploadFileHTML5: function (file, url, progress, complete, error, scope, asPut) {            
            if (!this.supportsHTML5File || !window.FormData) {
                this._showUnableToUploadError();
                return;
            }
            if (!url) {
                //assume Attachment SData url
                url = 'slxdata.ashx/slx/system/-/attachments/file';
            }
            var fd = new FormData();
            //fd.append('filename*', encodeURI(file.name)); //Does not work
            fd.append('file_', file, encodeURI(file.name)); // Does not work
            //fd.name = encodeURI(file.name)
            var request = new XMLHttpRequest();

            request.open((asPut) ? 'PUT' : 'POST', url);
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            if (complete) {
                request.onreadystatechange = function () {
                    if (request.readyState === 4) {
                        //console.log(JSON.parse(xhr.responseText.replace(/^\{\}&&/, '')));
                        if (Math.floor(request.status / 100) !== 2) {
                            if (error) {
                                error.call(scope || this, request);
                            }
                        } else {
                            complete.call(scope || this, request);
                        }
                    }
                };
            }
            if (progress) {
                request.upload.addEventListener('progress', function (e) {
                    progress.call(scope || this, e);
                });
            }
            request.send(fd);
        },
        _uploadFileHTML5_asBinary: function (file, url, progress, complete, error, scope, asPut) {            
            if (!this.supportsHTML5File) {
                this._showUnableToUploadError();
                return;
            }
            if (!url) {
                //assume Attachment SData url
                url = 'slxdata.ashx/slx/system/-/attachments/file';
            }
            var request = new XMLHttpRequest();
            request.open((asPut) ? 'PUT' : 'POST', url);
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            var reader = new FileReader();
            reader.onload = function (evt) {               
                var binary = evt.target.result;
                var boundary = "---------------------------" + (new Date()).getTime();
                var dashdash = '--';
                var crlf = '\r\n';
                var msg = dashdash + boundary + crlf;
                //msg += 'Content-Disposition: form-data; '; //Will not work for raw binary
                msg += 'Content-Disposition: attachment; ';
                msg += 'name="file_"; ';
                msg += 'filename*="' + encodeURI(file.name) + '" ';
                msg += crlf;
                msg += 'Content-Type: ' + file.type;
                msg += crlf + crlf;
                msg += binary;
                msg += crlf;
                msg += dashdash + boundary + dashdash + crlf;

                if (complete) {
                    request.onreadystatechange = function () {
                        if (request.readyState === 4) {

                            //console.log(JSON.parse(xhr.responseText.replace(/^\{\}&&/, '')));
                            console.log('responseText: ' + request.responseText);

                            if (Math.floor(request.status / 100) !== 2) {
                                if (error) {
                                    error.call(scope || this, request);
                                }
                            } else {
                                complete.call(scope || this, request);
                            }
                        }
                    };
                }
                if (progress) {
                    request.upload.addEventListener('progress', function (e) {
                        progress.call(scope || this, e);
                    });
                }
                //request.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary); //Will not work for raw binary
                request.setRequestHeader('Content-Type', 'multipart/attachment; boundary=' + boundary);
                
                if (request.sendAsBinary) {
                    request.sendAsBinary(msg);
                } else {
                    request.send(msg);
                }
                   
            };            
            reader.readAsBinaryString(file);
        },
        _showUnableToUploadError: function () {
            dialogs.showError(this.unableToUploadText);
        },
        formatFileSize: function (size) {
            size = parseInt(size, 10);
            if (size === 0) {
                return '0 KB';
            }
            if (!size || size < 0) {
                return this.unknownSizeText;
            }
            if (size < 1024) {
                return '1 KB';
            }
            return dNumber.format(Math.round(size / 1024)) + ' KB';
        }
    };

    return Sage.Utility.File;
});