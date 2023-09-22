
import { AzureUploader } from './azure.js';

class FileUploader {

  constructor() {
    this.listeners = {};
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);
    this.uploaderInstance = undefined
  }
  on(event, callback) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback);
    return this;
  }

  emit(event, ...args) {
    const eventListeners = this.listeners[event] || [];
    eventListeners.forEach((callback) => {
      callback(...args);
    });
  }
  retry() {
    this.uploaderInstance  && this.uploaderInstance.retry()
  }

  upload({url, file, csp, maxFileSizeForChunking}) {
    if (!url) {
      throw "URL is required to upload the file";
    }

    if (!file) {
      throw "file is required to upload";
    }

    if (!csp) {
      throw "Cloud service provider(csp) value required to process to request, support are azure"
    }
    if(maxFileSizeForChunking && parseInt(maxFileSizeForChunking) == NaN) {
      throw "maxFileSizeForChunking option should be valid integer equal to or greater than 5"
    }
    maxFileSizeForChunking = parseInt(maxFileSizeForChunking)

    switch (csp.toLowerCase()) {
      case "azure":
        this.uploaderInstance=  new AzureUploader(url, file, maxFileSizeForChunking, this.emit)
        break;

      case "aws":
        // aws implemetation goes here
        break;

      default:
        break;
    }
    return this;
  }
}
export { FileUploader };
