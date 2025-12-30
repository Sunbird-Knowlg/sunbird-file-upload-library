import { singleFileUploader } from './utils/singleFileUpload.js';

export class AwsUploader {

    constructor(url, file, maxFileSizeChunking, emit) {

        this.url = url;
        this.file = file;
        this.emit = emit;
        
        // AWS S3 with presigned URLs works best with single PUT uploads
        // Unlike Azure Block Blobs, S3 doesn't support client-side chunked uploads with a commit step
        // For S3, we upload the entire file in one request using the presigned URL
        this.fileUploaderInstance = new singleFileUploader(url, file, this.emit);
    }
    
}

