/**
 * QRService.ts
 * Service tạo QR Code cho Campaign
 * Phase 6: Hub Leader Marketing System
 * 
 * Sử dụng thư viện qrcode để generate offline
 */

import QRCode from 'qrcode';

// Deep Link base URLs
const DEEP_LINK_PREFIX = 'agrios://campaign/';
const WEB_FALLBACK = 'https://agri-os.vn/c/';

interface QRData {
    campaignId: string;
    hubId: string;
    referralCode?: string;
}

/**
 * Tạo deep link URL cho Campaign
 */
export function generateCampaignDeepLink(
    campaignId: string,
    hubId: string,
    referralCode?: string
): string {
    let url = `${DEEP_LINK_PREFIX}${campaignId}?hub=${hubId}`;
    if (referralCode) {
        url += `&ref=${referralCode}`;
    }
    return url;
}

/**
 * Tạo web fallback URL (cho khi user chưa cài App)
 */
export function generateWebFallbackUrl(
    deepLinkCode: string,
    referralCode?: string
): string {
    let url = `${WEB_FALLBACK}${deepLinkCode}`;
    if (referralCode) {
        url += `?ref=${referralCode}`;
    }
    return url;
}

/**
 * Generate QR Code image (Base64 Data URL)
 */
export async function generateCampaignQR(
    campaignId: string,
    hubId: string,
    referralCode?: string,
    options?: {
        width?: number;
        margin?: number;
        color?: { dark?: string; light?: string };
    }
): Promise<string> {
    const deepLink = generateCampaignDeepLink(campaignId, hubId, referralCode);

    const qrOptions = {
        width: options?.width || 256,
        margin: options?.margin || 2,
        color: {
            dark: options?.color?.dark || '#16a34a',  // Green
            light: options?.color?.light || '#ffffff'
        },
        errorCorrectionLevel: 'M' as const
    };

    try {
        const dataUrl = await QRCode.toDataURL(deepLink, qrOptions);
        return dataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

/**
 * Generate QR cho canvas element (DOM)
 */
export async function generateQRToCanvas(
    canvas: HTMLCanvasElement,
    campaignId: string,
    hubId: string,
    referralCode?: string
): Promise<void> {
    const deepLink = generateCampaignDeepLink(campaignId, hubId, referralCode);

    const qrOptions = {
        width: 256,
        margin: 2,
        color: {
            dark: '#16a34a',
            light: '#ffffff'
        }
    };

    await QRCode.toCanvas(canvas, deepLink, qrOptions);
}

/**
 * Parse QR data từ scanned string
 */
export function parseQRData(scannedUrl: string): QRData | null {
    try {
        // Parse deep link: agrios://campaign/{campaignId}?hub={hubId}&ref={code}
        if (scannedUrl.startsWith(DEEP_LINK_PREFIX)) {
            const urlParts = scannedUrl.replace(DEEP_LINK_PREFIX, '');
            const [pathAndQuery] = urlParts.split('?');
            const campaignId = pathAndQuery.split('?')[0];

            const params = new URLSearchParams(scannedUrl.split('?')[1] || '');

            return {
                campaignId,
                hubId: params.get('hub') || '',
                referralCode: params.get('ref') || undefined
            };
        }

        // Parse web URL: https://agri-os.vn/c/{code}?ref={code}
        if (scannedUrl.includes('/c/')) {
            const parts = scannedUrl.split('/c/');
            const [deepLinkCode, queryString] = parts[1]?.split('?') || [];
            const params = new URLSearchParams(queryString || '');

            return {
                campaignId: deepLinkCode, // This is deepLinkCode, need to resolve to campaignId
                hubId: '',
                referralCode: params.get('ref') || undefined
            };
        }

        return null;
    } catch (error) {
        console.error('Error parsing QR data:', error);
        return null;
    }
}

/**
 * Generate share text cho copy/paste
 */
export function generateShareText(
    campaignTitle: string,
    savings: number,
    webUrl: string
): string {
    return `🔥 Cơ hội mua ${campaignTitle} rẻ hơn ${savings.toLocaleString()}đ/bao!

👨‍🌾 Bà con ơi, đang có đợt gom đơn phân bón, mua chung để lấy giá sỉ.

📲 Quét QR hoặc bấm link này để tham gia:
${webUrl}

⏰ Nhanh tay kẻo hết slot!`;
}

/**
 * Download QR as image file
 */
export async function downloadQRImage(
    campaignId: string,
    hubId: string,
    referralCode: string,
    fileName: string = 'qr-campaign.png'
): Promise<void> {
    const dataUrl = await generateCampaignQR(campaignId, hubId, referralCode, {
        width: 512  // Kích thước lớn để in ấn
    });

    // Create download link
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
}
