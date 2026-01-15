/**
 * FrameExtractor.ts
 * 
 * Extracts frames from video for AI analysis.
 * Uses Canvas API to capture frames at specified intervals.
 */

// --- TYPES ---

export interface ExtractedFrame {
    index: number;
    timestamp: number;      // seconds
    dataUrl: string;        // base64 image
    width: number;
    height: number;
}

export interface ExtractionOptions {
    fps?: number;           // frames per second (default: 1)
    maxFrames?: number;     // max frames to extract (default: 15)
    maxWidth?: number;      // resize width (default: 1024)
    maxHeight?: number;     // resize height (default: 768)
    format?: 'jpeg' | 'png'; // output format (default: jpeg)
    quality?: number;       // 0-1 for jpeg (default: 0.8)
}

const DEFAULT_OPTIONS: Required<ExtractionOptions> = {
    fps: 1,
    maxFrames: 15,
    maxWidth: 1024,
    maxHeight: 768,
    format: 'jpeg',
    quality: 0.8,
};

// --- MAIN FUNCTION ---

/**
 * Extracts frames from a video blob at specified FPS.
 */
export const extractFrames = async (
    videoBlob: Blob,
    options: ExtractionOptions = {}
): Promise<ExtractedFrame[]> => {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }

        const frames: ExtractedFrame[] = [];
        const videoUrl = URL.createObjectURL(videoBlob);

        video.src = videoUrl;
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = () => {
            const duration = video.duration;
            const interval = 1 / opts.fps;
            const totalFrames = Math.min(
                Math.floor(duration * opts.fps),
                opts.maxFrames
            );

            // Calculate canvas dimensions maintaining aspect ratio
            let width = video.videoWidth;
            let height = video.videoHeight;

            if (width > opts.maxWidth) {
                height = (height * opts.maxWidth) / width;
                width = opts.maxWidth;
            }
            if (height > opts.maxHeight) {
                width = (width * opts.maxHeight) / height;
                height = opts.maxHeight;
            }

            canvas.width = Math.round(width);
            canvas.height = Math.round(height);

            let currentFrame = 0;

            const captureFrame = () => {
                if (currentFrame >= totalFrames) {
                    URL.revokeObjectURL(videoUrl);
                    resolve(frames);
                    return;
                }

                const timestamp = currentFrame * interval;
                video.currentTime = timestamp;
            };

            video.onseeked = () => {
                // Draw frame to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert to data URL
                const mimeType = opts.format === 'png' ? 'image/png' : 'image/jpeg';
                const dataUrl = canvas.toDataURL(mimeType, opts.quality);

                frames.push({
                    index: currentFrame,
                    timestamp: video.currentTime,
                    dataUrl,
                    width: canvas.width,
                    height: canvas.height,
                });

                currentFrame++;
                captureFrame();
            };

            video.onerror = () => {
                URL.revokeObjectURL(videoUrl);
                reject(new Error('Error loading video'));
            };

            // Start extraction
            captureFrame();
        };

        video.onerror = () => {
            URL.revokeObjectURL(videoUrl);
            reject(new Error('Error loading video'));
        };
    });
};

/**
 * Extracts a single frame at a specific timestamp.
 */
export const extractFrameAt = async (
    videoBlob: Blob,
    timestamp: number,
    options: Omit<ExtractionOptions, 'fps' | 'maxFrames'> = {}
): Promise<ExtractedFrame> => {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }

        const videoUrl = URL.createObjectURL(videoBlob);
        video.src = videoUrl;
        video.muted = true;

        video.onloadedmetadata = () => {
            // Calculate dimensions
            let width = video.videoWidth;
            let height = video.videoHeight;

            if (width > opts.maxWidth) {
                height = (height * opts.maxWidth) / width;
                width = opts.maxWidth;
            }
            if (height > opts.maxHeight) {
                width = (width * opts.maxHeight) / height;
                height = opts.maxHeight;
            }

            canvas.width = Math.round(width);
            canvas.height = Math.round(height);

            video.currentTime = Math.min(timestamp, video.duration);
        };

        video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const mimeType = opts.format === 'png' ? 'image/png' : 'image/jpeg';
            const dataUrl = canvas.toDataURL(mimeType, opts.quality);

            URL.revokeObjectURL(videoUrl);

            resolve({
                index: 0,
                timestamp: video.currentTime,
                dataUrl,
                width: canvas.width,
                height: canvas.height,
            });
        };

        video.onerror = () => {
            URL.revokeObjectURL(videoUrl);
            reject(new Error('Error loading video'));
        };
    });
};

/**
 * Converts data URL to base64 string (without prefix).
 */
export const dataUrlToBase64 = (dataUrl: string): string => {
    return dataUrl.split(',')[1] || '';
};

/**
 * Gets video duration from blob.
 */
export const getVideoDuration = (videoBlob: Blob): Promise<number> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(videoBlob);

        video.src = url;
        video.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            resolve(video.duration);
        };
        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Error getting video duration'));
        };
    });
};

export default {
    extractFrames,
    extractFrameAt,
    dataUrlToBase64,
    getVideoDuration,
};
