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

### AWS S3 Upload

The library supports AWS S3 uploads using presigned URLs. AWS S3 uploads work by uploading the entire file in a single PUT request to the presigned URL:

```javascript
const SunbirdFileUploadLib = require('sunbird-file-upload-lib');

const uploader = new SunbirdFileUploadLib();

const url = 'https://your-bucket.s3.amazonaws.com/your-file?X-Amz-Algorithm=...'; // S3 presigned URL
const file = document.getElementById('fileInput').files[0];
const csp = 'aws';

uploader.upload(url, file, csp)
  .then(response => {
    console.log('Upload successful:', response);
  })
  .catch(error => {
    console.error('Upload failed:', error);
  });
```

**Note:** AWS S3 uploads use a single presigned URL for the entire file upload. The backend should generate a standard S3 presigned PUT URL. No additional configuration or partNumber parameters are required.

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

Note: Currently this library supports Azure, AWS S3, and OCI cloud providers. To extend the library to support for other cloud providers follow the below steps.

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

## Code Quality

The project maintains code quality through automated checks that run on every pull request:

1. **Dependencies**
   - Uses `npm ci` for deterministic installations
   - GitHub Actions cache for faster builds

2. **Testing**
   - Unit tests using Karma
   - Command: `npm run test`

These checks ensure consistent code style, secure dependency management, and reliable testing.

## Package Publishing

Workflow automatically builds and publishes NPM packages whenever a new tag is pushed to the repository.

### Publish Workflow

The workflow is triggered on:
- push of any tag

Key features of the workflow:
1. Automatically builds the project
2. Creates NPM package
3. Publishes to NPM registry as @project-sunbird/sunbird-collection-editor-web-component, using NPM authentication token (must be provided as GitHub secret `NPM_TOKEN`)