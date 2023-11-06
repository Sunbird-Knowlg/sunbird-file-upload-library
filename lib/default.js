import { singleFileUploader } from './utils/singleFileUpload.js';

export class DefaultUploader {

    constructor(url, file, maxFileSizeChunking, emit) {

        this.url = url;
        this.file = file;
        this.emit = emit;
        this.fileUploaderInstance = new singleFileUploader(url, file, this.emit);
    }
    
}


