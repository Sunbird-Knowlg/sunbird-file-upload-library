import axios from 'axios'

export class AwsUploader {

    constructor(url, file, maxFileSizeChunking, emit) {

        this.url = url;
        this.file = file;
        this.emit = emit;
        
        // AWS S3 with presigned URLs works best with single PUT uploads
        // Unlike Azure Block Blobs, S3 doesn't support client-side chunked uploads with a commit step
        // For S3, we upload the entire file in one request using the presigned URL
        this.upload()
    }

    retry() {
        this.upload()
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

