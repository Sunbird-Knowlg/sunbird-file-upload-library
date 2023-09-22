// webpack.config.js
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export default  {
  entry: './lib/index.js',
  output: {
    filename: 'sunbird-file-upload-library.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'SunbirdFileUploadLib',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  mode: 'production'
};
