import { FileUploader } from "./index.js"
import assert from 'assert';

describe("#FileUploader", () => {

    it("should create the instance", () => {

        const fileuploader = new FileUploader()
        assert(fileuploader instanceof FileUploader)

    })

    // it("upload method should work with proper config ", () => {

    //     const fileuploader = new FileUploader()
    //     assert(fileuploader instanceof FileUploader)
    //     let buffer = Buffer.from([1, 2, 3, 4, 6]);
    //     let arraybuffer = Uint8Array.from(buffer).buffer;
    //     fileuploader.upload({ url: "http://test.sas.asa", file: arraybuffer, csp: 'azure', maxFileSizeForChunking: 5 })

    // })

    // upload method

    // retry method

    // events



})