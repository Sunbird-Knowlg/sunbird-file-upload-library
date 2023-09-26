import { FileUploader } from "./index.js"


function MockFile() { };

MockFile.prototype.create = function (name, size, mimeType) {
    name = name || "mock.txt";
    size = size || 1024;
    mimeType = mimeType || 'plain/txt';

    function range(count) {
        var output = "";
        for (var i = 0; i < count; i++) {
            output += "a";
        }
        return output;
    }

    var blob = new Blob([range(size)], { type: mimeType });
    blob.lastModifiedDate = new Date();
    blob.name = name;

    return blob;
};

describe("#FileUploader", () => {

    xit("should create the instance", () => {

        // const fileuploader = new FileUploader()
        // expect(fileuploader instanceof FileUploader).toBe(true)

    })

    xit("upload method should work with proper config ", () => {

        // let eventListener = jasmine.createSpy();
        // spyOn(window, "FileReader").and.returnValue({
        //     addEventListener: eventListener
        // })
        // const fileuploader = new FileUploader()
        // const mock = new MockFile()
        // const file = mock.create("test.pdf", 1024, 'application/pdf')
        // expect(fileuploader instanceof FileUploader).toBe(true)
        // fileuploader.upload({ url: "http://test.sas.asa", file, csp: 'azure', maxFileSizeForChunking: 5 })

    })

    // upload method

    // retry method

    // events



})