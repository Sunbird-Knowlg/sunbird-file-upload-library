import { singleFileUploader } from "./utils/singleFileUpload";

export class OciUploader {

    constructor(url, file, maxFileSizeChunking, emit) {

        this.url = url;
        this.file = file;
        this.emit = emit;
        this.fileUploaderInstance = new singleFileUploader(url, file, this.emit);
    }

}


