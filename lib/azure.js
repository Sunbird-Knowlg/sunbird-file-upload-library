import axios from 'axios'

export class AzureUploader {

    constructor(url, file, maxFileSizeChunking, emit) {

        this.url = url;
        this.file = file;
        this.emit = emit;
        this.reader = new FileReader();
        this.blockIds = [];
        this.failOnBlock = false;
        this.currentFilePointer = 0;
        this.totalBytesRemaining = this.file.size;
        this.percentComplete = 0;
        this.bytesUploaded = 0;
        this.maxBlockSize = 5242880;  
        this.timeStarted;
        this.retryChunkUploadLimit = 10;
        this.delayBetweenRetryCalls = 2000;
        if(maxFileSizeChunking < 6 || !maxFileSizeChunking) {
            maxFileSizeChunking = 6
        }
        if (parseInt(this.file.size / 1e+6) <= maxFileSizeChunking) {
            this.upload()
        } else {
            this.uploadInChunks()
        }

        this.reader.onloadend = (evt) => {
            if (evt.target.readyState == FileReader.DONE) {
                var uri = this.url + '&comp=block&blockid=' + this.blockIds[this.blockIds.length - 1];
                var requestData = new Uint8Array(evt.target.result);
                const fetchPromise = this.fetchRetry(uri, {
                    "headers": {
                        "Content-Type": this.file.type,
                        "x-ms-blob-type": "BlockBlob"
                    },
                    "body": requestData,
                    "method": "PUT",
                }, this.delayBetweenRetryCalls, this.retryChunkUploadLimit);
                
                fetchPromise.then(this.handleErrors)
                    .then( (response) => {
                        if (response.ok) {
                            this.bytesUploaded += requestData.length;
                            this.percentComplete = ((parseFloat(this.bytesUploaded) / parseFloat(this.file.size)) * 100).toFixed(2);
                            const estimated = this.getEstimatedSecondsLeft();
                            this.emit("progress", {
                                "progress": this.percentComplete,
                                estimated
                            })
                            this.uploadInChunks();
                        } else {
                            throw new Error('failed no response from cloud storage'); // no response from cloud storage
                        }
                    }).catch( (error) => {
                        this.blockIds.pop();
                        // $scope.currentBlockProgress = $scope.percentComplete
                        this.currentFilePointer -= this.maxBlockSize;
                        this.totalBytesRemaining += this.maxBlockSize;
                        this.emit("error", error)
                    });
            }
        };

    }

    getEstimatedSecondsLeft() {
        const timeElapsed = (new Date()) - this.timeStarted;
        const uploadSpeed = Math.floor(this.bytesUploaded / (timeElapsed / 1000)); // Upload speed in second
        const estimatedSecondsLeft = Math.round(((this.file.size - this.bytesUploaded) / uploadSpeed));
        return estimatedSecondsLeft;
    }

    retry() {
        this.uploadInChunks()
    }

    fetchRetry(url, fetchOptions = {}, delay, limit) {
        return new Promise((resolve, reject) => {
            function success(response) {
                resolve(response);
            }

            function failure(error) {
                limit--;
                if (limit) {
                    setTimeout(fetchUrl, delay)
                } else {
                    // not able to connect at all lets show retry 
                    reject(error);
                }
            }

            function finalHandler(finalError) {
                throw finalError;
            }

            function fetchUrl() {
                return fetch(url, fetchOptions)
                    .then(success)
                    .catch(failure)
                    .catch(finalHandler);
            }
            fetchUrl();
        });
    }

    handleErrors(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }

    uploadInChunks() {
        this.timeStarted = (!this.timeStarted) ? new Date() : this.timeStarted
        const blockIdPrefix = "block-";
        if (this.totalBytesRemaining > 0) {
            var fileContent = this.file.slice(this.currentFilePointer, this.currentFilePointer + this.maxBlockSize);
            var blockId = blockIdPrefix + this.pad(this.blockIds.length, 6);
            this.blockIds.push(btoa(blockId));
            this.reader.readAsArrayBuffer(fileContent);
            this.currentFilePointer += this.maxBlockSize;
            this.totalBytesRemaining -= this.maxBlockSize;
            if (this.totalBytesRemaining < this.maxBlockSize) {
                this.maxBlockSize = this.totalBytesRemaining;
            }
        } else {
            this.emit("progress", {
                "progress": this.percentComplete
            })
            setTimeout(() => {
                this.commitBlockList();
            }, 4000)
        }
    }
    commitBlockList() {
        var uri = this.url + '&comp=blocklist';
        var requestBody = '<?xml version="1.0" encoding="utf-8"?><BlockList>';
        for (var i = 0; i < this.blockIds.length; i++) {
            requestBody += '<Latest>' +this.blockIds[i] + '</Latest>';
        }
        requestBody += '</BlockList>';
        const blockListPromise = this.fetchRetry(uri, {
            "headers": {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-ms-blob-content-type": this.file.type
            },
            "body": requestBody,
            "method": "PUT",
        }, this.delayBetweenRetryCalls, this.retryChunkUploadLimit);
        
        blockListPromise.then(this.handleErrors)
            .then((response)=> {
                this.emit("progress", {"progress": 100})
                this.emit("completed", {status: response.status })
            }).catch(function () {
                this.failOnBlock = true
            });
    }
    pad(number, length) {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }
    upload = async () => {
        try {
            const formData = await this.file.arrayBuffer();
            const contentType = this.file.type || 'application/octet-stream';
            const options = {
                url: this.url,
                "headers": {
                    "x-ms-blob-type": "BlockBlob",
                    'Content-Type': contentType
                },
                "data": formData,
                "method": "put",
                "onUploadProgress": ({ loaded, total, progress, bytes, estimated, rate, upload = true }) => {
                    this.emit('progress', { progress: parseInt(progress * 100), estimated: parseInt(estimated) });
                }
            }
            const response = await axios(options);
            this.emit('completed', { status: response.status });
        } catch (error) {
            this.emit('error', error);
        }
    }
}


