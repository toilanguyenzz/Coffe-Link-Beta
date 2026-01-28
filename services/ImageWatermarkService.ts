/**
 * ImageWatermarkService.ts
 * Client-side image watermarking using Canvas API
 * Adds Coffee ID logo and hotline to images before upload
 */

// Watermark configuration
const WATERMARK_CONFIG = {
    logoText: 'Coffee ID',
    hotline: 'Hotline: 0359.xxx.xxx',
    opacity: 0.85,
    fontSize: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    textColor: '#ffffff',
    maxImageSize: 1200, // Max width/height in pixels
    quality: 0.85,      // JPEG quality
};

/**
 * Watermark an image with Coffee ID branding
 * @param imageFile - Original image file
 * @returns Promise<Blob> - Watermarked image as blob
 */
export const watermarkImage = async (imageFile: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        reject(new Error('Canvas context not available'));
                        return;
                    }

                    // Calculate dimensions (resize if needed)
                    let { width, height } = img;
                    const maxSize = WATERMARK_CONFIG.maxImageSize;

                    if (width > maxSize || height > maxSize) {
                        if (width > height) {
                            height = (height / width) * maxSize;
                            width = maxSize;
                        } else {
                            width = (width / height) * maxSize;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw original image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Auto-enhance: slight brightness/contrast boost
                    ctx.filter = 'brightness(1.05) contrast(1.02)';
                    ctx.drawImage(canvas, 0, 0);
                    ctx.filter = 'none';

                    // Draw watermark background (bottom-right corner)
                    const padding = WATERMARK_CONFIG.padding;
                    const fontSize = WATERMARK_CONFIG.fontSize;

                    ctx.font = `bold ${fontSize}px Arial`;
                    const logoWidth = ctx.measureText(WATERMARK_CONFIG.logoText).width;

                    ctx.font = `${fontSize - 2}px Arial`;
                    const hotlineWidth = ctx.measureText(WATERMARK_CONFIG.hotline).width;

                    const boxWidth = Math.max(logoWidth, hotlineWidth) + padding * 2;
                    const boxHeight = fontSize * 2.5 + padding * 2;
                    const boxX = width - boxWidth - padding;
                    const boxY = height - boxHeight - padding;

                    // Semi-transparent background
                    ctx.fillStyle = WATERMARK_CONFIG.backgroundColor;
                    ctx.globalAlpha = WATERMARK_CONFIG.opacity;
                    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 8);
                    ctx.fill();
                    ctx.globalAlpha = 1;

                    // Draw text
                    ctx.fillStyle = WATERMARK_CONFIG.textColor;
                    ctx.font = `bold ${fontSize}px Arial`;
                    ctx.fillText(
                        WATERMARK_CONFIG.logoText,
                        boxX + padding,
                        boxY + padding + fontSize
                    );

                    ctx.font = `${fontSize - 2}px Arial`;
                    ctx.fillText(
                        WATERMARK_CONFIG.hotline,
                        boxX + padding,
                        boxY + padding + fontSize * 2
                    );

                    // Add small logo icon (coffee cup emoji as placeholder)
                    ctx.font = `${fontSize + 4}px Arial`;
                    ctx.fillText('☕', boxX + boxWidth - padding - 24, boxY + padding + fontSize);

                    // Convert to blob
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Failed to create image blob'));
                            }
                        },
                        'image/jpeg',
                        WATERMARK_CONFIG.quality
                    );
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(imageFile);
    });
};

/**
 * Helper function to draw rounded rectangle
 */
const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
};

/**
 * Create a thumbnail from an image
 * @param imageFile - Original image file
 * @param maxSize - Max width/height (default 300px)
 * @returns Promise<Blob> - Thumbnail as blob
 */
export const createThumbnail = async (
    imageFile: File,
    maxSize: number = 300
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                let { width, height } = img;

                if (width > height) {
                    height = (height / width) * maxSize;
                    width = maxSize;
                } else {
                    width = (width / height) * maxSize;
                    height = maxSize;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create thumbnail'));
                        }
                    },
                    'image/jpeg',
                    0.7
                );
            };

            img.src = e.target?.result as string;
        };

        reader.readAsDataURL(imageFile);
    });
};

/**
 * Validate image file
 * @param file - File to validate
 * @returns { valid: boolean, error?: string }
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeMB = 10;

    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP' };
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
        return { valid: false, error: `Ảnh phải nhỏ hơn ${maxSizeMB}MB` };
    }

    return { valid: true };
};
