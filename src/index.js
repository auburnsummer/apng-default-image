const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

const APNG_CHUNKS = ["acTL", "fcTL", "fdAT"];

/**
 * Return true if a uint8array is a png.
 * @param {*} u8 
 */
export function isPNG(u8) {
    for (let i = 0; i < 8; i++) {
        if (u8[i] !== PNG_SIGNATURE[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Return the chunks of a png image.
 */
export function getChunks(u8) {
    if (!isPNG(u8)) {
        throw "Not a PNG!";
    }
    let i = 8;
    let chunks = [];

    while (i < u8.byteLength) {
        // length part
        const l = u8.subarray(i, i+4);
        const length = l[0] << 24 | l[1] << 16 | l[2] << 8 | l[3] << 0;
        const chunkName = Array.from(u8.subarray(i+4, i+8).values()).map( x => String.fromCharCode(x) ).join("");

        // 4 byte header, 4 byte name, 4 byte CRC
        const nextOffset = i + 4 + 4 + length + 4;
        chunks.push({
            chunkName,
            length,
            buf : u8.subarray(i, nextOffset),
            data: u8.subarray(i + 4 + 4, nextOffset)
        });
        i = nextOffset;
    }
    return chunks;
}

/**
 * NOTE: Doesn't check for validity, just that it has APNG chunks.
 */
export function isAnimatedPNG(u8) {
    return getChunks(u8).find(chunk => APNG_CHUNKS.includes(chunk.chunkName));
}

/**
 * concatenate an array of uint8arrays
 */
function concat(arr) {
    return Uint8Array.from(arr.reduce((prev, curr) => [...prev, ...curr]))
}

/**
 * Given a APNG image as a buffer, return a buffer of a PNG image which is just the default image.
 */
export function getDefaultImage(buf) {
    const u8 = new Uint8Array(buf);
    const chunks = getChunks(u8);
    const filteredChunks = chunks.filter( (chunk) => !APNG_CHUNKS.includes(chunk.chunkName) );
    const png = Uint8Array.from([...PNG_SIGNATURE, ...concat(filteredChunks.map(c => c.buf))]);
    return png.buffer;
}
