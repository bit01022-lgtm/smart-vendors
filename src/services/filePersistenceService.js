// No file type restrictions - accept all file types
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB - matches backend limit

export function isAllowedFileType(file) {
  // Accept all file types
  return true;
}

export function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('FILE_READ_FAILED'));
    reader.readAsDataURL(file);
  });
}

function readFileAsImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('FILE_READ_FAILED'));
      image.src = String(reader.result || '');
    };
    reader.onerror = () => reject(new Error('FILE_READ_FAILED'));
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('FILE_COMPRESS_FAILED'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

async function compressImageToMaxSize(file, targetBytes) {
  const image = await readFileAsImage(file);

  let scale = 1;
  let quality = 0.85;
  let bestBlob = null;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(image.width * scale));
    canvas.height = Math.max(1, Math.floor(image.height * scale));

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('FILE_COMPRESS_FAILED');
    }

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, quality);
    bestBlob = blob;

    if (blob.size <= targetBytes) {
      return new File([blob], file.name.replace(/\.(png|jpe?g)$/i, '.jpg'), {
        type: 'image/jpeg',
      });
    }

    quality -= 0.1;
    if (quality < 0.45) {
      quality = 0.85;
      scale -= 0.15;
    }

    if (scale <= 0.4) {
      break;
    }
  }

  if (bestBlob) {
    return new File([bestBlob], file.name.replace(/\.(png|jpe?g)$/i, '.jpg'), {
      type: 'image/jpeg',
    });
  }

  throw new Error('FILE_COMPRESS_FAILED');
}

export function validatePersistedFileSize(file) {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('FILE_TOO_LARGE');
  }
}

export async function normalizeFileForPersistence(file) {
  // Accept all file types without validation
  if (file.size <= MAX_FILE_SIZE_BYTES) {
    return file;
  }

  // File exceeds 100MB limit
  throw new Error('FILE_TOO_LARGE');
}

export async function persistFile(file) {
  const normalizedFile = await normalizeFileForPersistence(file);

  const fileUrl = await readFileAsDataURL(normalizedFile);

  return {
    fileName: normalizedFile.name,
    fileUrl,
    contentType: normalizedFile.type || 'application/octet-stream',
    size: normalizedFile.size || 0,
  };
}

export { MAX_FILE_SIZE_BYTES };
