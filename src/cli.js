import fs from "fs";

import {getDefaultImage} from "./index.js";

const filename = process.argv[2];

const buffer = fs.readFileSync(filename, null).buffer;

const arrayBuf = new Uint8Array(buffer).buffer;

const staticPNG = getDefaultImage(arrayBuf);

process.stdout.write(Buffer.from(staticPNG));