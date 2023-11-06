# SunbirdFileUploadLib

SunbirdFileUploadLib is a JavaScript library that simplifies the process of uploading files to various cloud providers, including Azure and AWS. It provides methods to handle both single-file uploads and chunked uploads for larger files. If an upload fails, the library supports retry functionality to resume the upload from where it left off.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Single-File Upload](#single-file-upload)
  - [Chunked Upload](#chunked-upload)
  - [Retry Upload](#retry-upload)
    
## Installation

You can install SunbirdFileUploadLib using npm:

`npm install sunbird-file-upload-lib`


## Usage

To use SunbirdFileUploadLib, you'll need to import the library and create an instance of the `SunbirdFileUploadLib` class. This class exposes methods for uploading files.

### Single-File Upload

Use the `upload` method to upload a single file to a cloud provider. You need to specify the `url`, `file`, and `csp` parameters.

```javascript
const SunbirdFileUploadLib = require('sunbird-file-upload-lib');

const uploader = new SunbirdFileUploadLib();

const url = 'https://example.com/upload'; // Replace with your upload URL
const file = document.getElementById('fileInput').files[0]; // Replace with your file input element
const csp = 'azure'; // Cloud provider (azure, aws, etc.)

uploader.upload(url, file, csp)
  .then(response => {
    console.log('Upload successful:', response);
  })
  .catch(error => {
    console.error('Upload failed:', error);
  });
```

### Default-File Upload

Use the `upload` method to upload the File, In case you have signed URL and file and your Service Provider in unkown then it will go to the defult condition to upload file via signed URL

```javascript

default:
  this. uploaderInstance = new DefaultUploader(url, file, maxFileSizeForChunking, this.emit);
break;

```

### OCI-File Upload

As of now this library supports single file upload for OCI environment in case any one need to add chunk file upload then they need to make changes in oci.js file

### Chunked Upload
The library also supports chunked uploads for larger files. You can specify the maxFileSizeForChunking parameter to determine the file size threshold for chunked uploads. If the file size exceeds this threshold, it will be uploaded in chunks. By default, a threshold of 6 MB is used for Azure, but you can provide a different value.

```javascript
// Chunked upload with a custom threshold (e.g., 10 MB)
const maxFileSizeForChunking = 10 * 1024 * 1024; // 10 MB
uploader.upload(url, file, csp, maxFileSizeForChunking)
  .then(response => {
    console.log('Upload successful:', response);
  })
  .catch(error => {
    console.error('Upload failed:', error);
  });
```
### Retry Upload
In case an upload fails, you can use the retry method to resume the upload. This is especially useful for chunked uploads, as it will reinitiate the upload flow from the point of failure.

```javascript
// Retry upload
uploader.retry()
  .then(response => {
    console.log('Retry successful:', response);
  })
  .catch(error => {
    console.error('Retry failed:', error);
  });
```

Note: Currently this library only supports for the azure cloud provider, to entend the library to support for other cloud providers follow the below steps.

### How to extended to other cloud providers


1. Go to index.js file in lib folder and add your cloud provider name in the switch case
2. Create a file with the cloud provider name which will have a class exported from it.
3. The cloud provider class created in previous steps should have `retry` method as public and follow the same method signature as azure

Example: 

```javascript

  export class SampleCloud {

    upload() {
      // single file upload when the file size is less than or equal to maxFileSizeChunking
    }

    uploadInChunks() {
      // based in maxFileSizeChunking logic this will execute and write logic for same for your cloud provider
    }

    retry() {

      // retry logic
    }

  }

```
4. Inside  index.js create the instance of your cloud class and assign to `this.uploaderInstance` like

  ```javascript
    this.uploaderInstance = new SampleCloud(url, file, maxFileSizeForChunking, this.emit)

  ```
5. Your class methods can emit `error`, `progress`, `completed` events based on the condition of upload status.
6. `error` should emit error object, `completed` should emit the httpstatus `{status: <http-status-code>}` and `progress` will emit the following object
  ```javascript
                        {
                                "progress": <progress-value>,
                                estimated: <estimated-time-in-seconds> // this is optional
                        }
  ```
