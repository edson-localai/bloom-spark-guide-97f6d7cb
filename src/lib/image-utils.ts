/**
 * Resizes and compresses an image in the browser.
 * Adjusts quality and format based on the original image properties.
 * @param file The image file to process
 * @param maxWidth Max width of the resulting image
 * @param maxHeight Max height of the resulting image
 * @returns A promise that resolves to the compressed Blob and its metadata
 */
export async function compressImage(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
): Promise<{ blob: Blob; contentType: string; extension: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Determine format: preserve PNG if original is PNG, otherwise JPEG
        const isPng = file.type === "image/png";
        const contentType = isPng ? "image/png" : "image/jpeg";
        const extension = isPng ? "png" : "jpg";

        // Determine quality based on dimensions
        // For smaller images, we can afford higher quality
        let quality = 0.7;
        const maxDim = Math.max(img.width, img.height);
        if (maxDim <= 400) {
          quality = 0.9;
        } else if (maxDim <= 1200) {
          quality = 0.8;
        }

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // If JPEG, fill background with white (in case of transparency from original)
        // unless we are keeping it as PNG
        if (!isPng) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, contentType, extension });
            } else {
              reject(new Error("Canvas toBlob failed"));
            }
          },
          contentType,
          isPng ? undefined : quality,
        );
      };
      img.onerror = () => reject(new Error("Image load error"));
    };
    reader.onerror = () => reject(new Error("FileReader error"));
  });
}
