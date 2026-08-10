/**
 * Resizes and compresses an image file entirely in the browser (canvas),
 * producing a small JPEG data URL — small enough to store directly on the
 * user document in MongoDB without needing a separate file storage service.
 */
export function fileToCompressedDataUrl(file, { maxSize = 256, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.onload = () => {
      img.onerror = () => reject(new Error('Could not read that image'));
      img.onload = () => {
        // Center-crop to a square, then scale down to maxSize.
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
