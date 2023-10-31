import axios from 'axios'

export class OciUploader {

    constructor(url, file, maxFileSizeChunking, emit) {

        this.url = url;
        this.file = file;
        this.emit = emit;
        if (parseInt(this.file.size / 1e+6) <= maxFileSizeChunking) {
            this.upload()
        }
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


