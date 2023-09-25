import { FileUploader } from "./index.js"

describe("#FileUploader", () => {

    it("should create the instance", () => {

        const fileuploader = new FileUploader()
        expect(fileuploader instanceof FileUploader).toBe(true)

    })

    it("upload method should work with proper config ", () => {

        const fileuploader = new FileUploader()
        expect(fileuploader instanceof FileUploader).toBe(true)
        let buffer = Buffer.from([1, 2, 3, 4, 6]);
        let arraybuffer = Uint8Array.from(buffer).buffer;
        fileuploader.upload({ url: "http://test.sas.asa", file: arraybuffer, csp: 'azure', maxFileSizeForChunking: 5 })

    })

    // upload method

    // retry method

    // events



})