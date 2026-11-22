// Getting a photo into a canvas and back out as a file.

const readableError = () => new Error('Could not read this photo');

// source: { file: File | Blob }  a photo from the device, or one made here, or
//         { url: string }        a photo already uploaded.
//
// Resolves to { img, objectUrl }. Uploaded photos are fetched as a blob first,
// rather than put straight into an <img>, because a canvas that has drawn a
// cross-origin <img> refuses to export. A fetch through CORS does not taint it.
// `cache: 'reload'` skips any copy the browser stored when the same photo was
// shown as a plain thumbnail: that copy has no CORS headers and would make the
// fetch fail.
//
// The browser applies a phone photo's EXIF rotation when it decodes the blob,
// so naturalWidth/Height and drawImage already agree with what the person saw.
export const loadImage = async (source) => {
    let blob = source.file;
    if (!blob) {
        const res = await fetch(source.url, { cache: 'reload', mode: 'cors', credentials: 'omit' });
        if (!res.ok) throw readableError();
        blob = await res.blob();
    }
    const objectUrl = URL.createObjectURL(blob);
    try {
        const img = await new Promise((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(readableError());
            el.src = objectUrl;
        });
        if (!img.naturalWidth || !img.naturalHeight) throw readableError();
        return { img, objectUrl };
    } catch (err) {
        URL.revokeObjectURL(objectUrl);
        throw err;
    }
};

// JPEG, because that is what a photo of people on a mat compresses best as,
// and the server accepts it. JPEG has no transparency, so callers paint a
// backdrop first or a transparent PNG would come out black.
export const canvasToBlob = (canvas, quality = 0.9) =>
    new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Could not create the image'))),
            'image/jpeg',
            quality
        );
    });
