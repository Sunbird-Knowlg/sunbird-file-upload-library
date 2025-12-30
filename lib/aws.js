import axios from 'axios'

export class AwsUploader {

    constructor(url, file, maxFileSizeChunking, emit) {

        this.url = url;
        this.file = file;
        this.emit = emit;
        this.reader = new FileReader();
        this.uploadedParts = [];
        this.failOnPart = false;
        this.currentFilePointer = 0;
        this.totalBytesRemaining = this.file.size;
        this.percentComplete = 0;
        this.bytesUploaded = 0;
        this.maxPartSize = 5242880; // 5 MB minimum for S3 multipart (except last part)
        this.timeStarted;
        this.retryPartUploadLimit = 10;
        this.delayBetweenRetryCalls = 2000;
        this.uploadId = null;
        this.partNumber = 1;
        
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
                var requestData = new Uint8Array(evt.target.result);
                const partUrl = this.getPartUrl(this.url, this.partNumber);
                
                const fetchPromise = this.fetchRetry(partUrl, {
                    "headers": {
                        "Content-Type": this.file.type || 'application/octet-stream'
                    },
                    "body": requestData,
                    "method": "PUT",
                }, this.delayBetweenRetryCalls, this.retryPartUploadLimit);
                
                fetchPromise.then(this.handleErrors)
                    .then((response) => {
                        if (response.ok) {
                            // Get ETag from response headers
                            const etag = response.headers.get('ETag');
                            this.uploadedParts.push({
                                PartNumber: this.partNumber,
                                ETag: etag ? etag.replace(/"/g, '') : null
                            });
                            
                            this.bytesUploaded += requestData.length;
                            this.percentComplete = ((parseFloat(this.bytesUploaded) / parseFloat(this.file.size)) * 100).toFixed(2);
                            const estimated = this.getEstimatedSecondsLeft();
                            this.emit("progress", {
                                "progress": this.percentComplete,
                                estimated
                            })
                            this.partNumber++;
                            this.uploadInChunks();
                        } else {
                            throw new Error('failed no response from cloud storage');
                        }
                    }).catch((error) => {
                        // Retry logic - decrement part number and reset pointers
                        this.partNumber--;
                        this.currentFilePointer -= this.maxPartSize;
                        this.totalBytesRemaining += this.maxPartSize;
                        this.emit("error", error)
                    });
            }
        };

    }

    getEstimatedSecondsLeft() {
        const timeElapsed = (new Date()) - this.timeStarted;
        const uploadSpeed = Math.floor(this.bytesUploaded / (timeElapsed / 1000));
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

    getPartUrl(baseUrl, partNumber) {
        // Check if URL already contains query parameters
        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}partNumber=${partNumber}`;
    }

    uploadInChunks() {
        this.timeStarted = (!this.timeStarted) ? new Date() : this.timeStarted
        
        if (this.totalBytesRemaining > 0) {
            var fileContent = this.file.slice(this.currentFilePointer, this.currentFilePointer + this.maxPartSize);
            this.reader.readAsArrayBuffer(fileContent);
            this.currentFilePointer += this.maxPartSize;
            this.totalBytesRemaining -= this.maxPartSize;
            if (this.totalBytesRemaining < this.maxPartSize) {
                this.maxPartSize = this.totalBytesRemaining;
            }
        } else {
            this.emit("progress", {
                "progress": this.percentComplete
            })
            setTimeout(() => {
                this.completeMultipartUpload();
            }, 4000)
        }
    }

    completeMultipartUpload() {
        // For S3 presigned URLs, the completion is typically handled by the server
        // or through a separate completion URL
        // Emit completion event
        this.emit("progress", {"progress": 100})
        this.emit("completed", {status: 200})
    }

    upload = async () => {
        try {
            const formData = await this.file.arrayBuffer();
            const contentType = this.file.type || 'application/octet-stream';
            const options = {
                url: this.url,
                "headers": {
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

