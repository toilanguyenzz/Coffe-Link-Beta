/**
 * OrderService.ts
 * 
 * Handles order creation and dealer notification
 * Uses Zalo DeepLink for sending orders to dealers
 */

import { Product } from '../data/shopData';
import { Hub } from '../types';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface OrderItem {
    product: Product;
    quantity: number;
}

export interface CustomerInfo {
    name: string;
    phone: string;
    farmAddress?: string;
}

export interface Order {
    id: string;
    items: OrderItem[];
    customer: CustomerInfo;
    hub: Hub;
    totalAmount: number;
    deliveryAddress: string;
    status: 'pending' | 'sent_to_dealer' | 'confirmed' | 'delivering' | 'completed';
    createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// ORDER CREATION
// ═══════════════════════════════════════════════════════════════

/**
 * Generate unique order ID
 */
function generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${random}`.toUpperCase();
}

/**
 * Calculate total order amount
 */
function calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.product.memberPrice * item.quantity, 0);
}

/**
 * Create a new order object
 */
export function createOrder(
    items: OrderItem[],
    customer: CustomerInfo,
    hub: Hub,
    deliveryAddress: string
): Order {
    return {
        id: generateOrderId(),
        items,
        customer,
        hub,
        totalAmount: calculateTotal(items),
        deliveryAddress,
        status: 'pending',
        createdAt: new Date()
    };
}

// ═══════════════════════════════════════════════════════════════
// ZALO DEEPLINK INTEGRATION
// ═══════════════════════════════════════════════════════════════

/**
 * Format order message for Zalo
 */
function formatOrderMessage(order: Order): string {
    const itemLines = order.items.map(item =>
        `• ${item.product.name} x${item.quantity} = ${formatVND(item.product.memberPrice * item.quantity)}`
    ).join('\n');

    const message = `
🌿 ĐƠN HÀNG MỚI - COFFEELINK 🌿
━━━━━━━━━━━━━━━━━━
📋 Mã đơn: ${order.id}
👤 Khách: ${order.customer.name}
📞 SĐT: ${order.customer.phone}
📍 Địa chỉ: ${order.deliveryAddress}
━━━━━━━━━━━━━━━━━━
🛒 SẢN PHẨM:
${itemLines}
━━━━━━━━━━━━━━━━━━
💰 TỔNG: ${formatVND(order.totalAmount)}
━━━━━━━━━━━━━━━━━━
(Đơn từ App CoffeeLink - Bác sĩ cây trồng kê đơn)
`.trim();

    return message;
}

/**
 * Format VND currency
 */
function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/**
 * Build Zalo DeepLink URL
 * Works on mobile devices with Zalo app installed
 */
export function buildZaloDeepLink(order: Order): string {
    const message = formatOrderMessage(order);
    const encodedMessage = encodeURIComponent(message);
    const phone = order.hub.leaderPhone.replace(/\s/g, '');

    // Zalo deeplink format
    // zalo://conversation?phone=PHONE&text=MESSAGE
    return `zalo://conversation?phone=${phone}&text=${encodedMessage}`;
}

/**
 * Build SMS fallback URL for devices without Zalo
 */
export function buildSMSFallback(order: Order): string {
    const message = formatOrderMessage(order);
    const encodedMessage = encodeURIComponent(message);
    const phone = order.hub.leaderPhone.replace(/\s/g, '');

    // SMS URL scheme
    return `sms:${phone}?body=${encodedMessage}`;
}

/**
 * Build phone call fallback
 */
export function buildPhoneCallLink(hub: Hub): string {
    const phone = hub.leaderPhone.replace(/\s/g, '');
    return `tel:${phone}`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN: SEND ORDER TO DEALER
// ═══════════════════════════════════════════════════════════════

export interface SendOrderResult {
    success: boolean;
    method: 'zalo' | 'sms' | 'call' | 'none';
    order: Order;
    deepLinkUrl?: string;
    errorMessage?: string;
}

/**
 * Send order to dealer via Zalo or fallback methods
 * Opens the appropriate app/dialer on the device
 */
export function sendOrderToDealer(order: Order): SendOrderResult {
    try {
        // Update order status
        order.status = 'sent_to_dealer';

        // Build Zalo deeplink (primary method)
        const zaloUrl = buildZaloDeepLink(order);

        // Try to open Zalo
        // On mobile, this will open Zalo app with pre-filled message
        // On desktop, this will likely fail silently or prompt for app
        window.open(zaloUrl, '_blank');

        return {
            success: true,
            method: 'zalo',
            order,
            deepLinkUrl: zaloUrl
        };
    } catch (error) {
        console.error('Failed to send order via Zalo:', error);

        // Fallback to SMS
        try {
            const smsUrl = buildSMSFallback(order);
            window.open(smsUrl, '_blank');

            return {
                success: true,
                method: 'sms',
                order,
                deepLinkUrl: smsUrl
            };
        } catch (smsError) {
            return {
                success: false,
                method: 'none',
                order,
                errorMessage: 'Không thể gửi đơn hàng. Vui lòng gọi điện cho đại lý.'
            };
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// QUICK ORDER (ONE-CLICK)
// ═══════════════════════════════════════════════════════════════

/**
 * Quick order a single product - One-Click Action
 * Creates an order and immediately sends to dealer
 */
export function quickOrderProduct(
    product: Product,
    quantity: number,
    customer: CustomerInfo,
    hub: Hub,
    deliveryAddress: string
): SendOrderResult {
    const order = createOrder(
        [{ product, quantity }],
        customer,
        hub,
        deliveryAddress
    );

    return sendOrderToDealer(order);
}

/**
 * Show order confirmation dialog with dealer info
 * Returns a promise that resolves when user confirms
 */
export function showOrderConfirmation(
    product: Product,
    hub: Hub,
    deliveryTime: string,
    distance: string
): Promise<boolean> {
    const message = `
🛒 Xác nhận đặt hàng

📦 Sản phẩm: ${product.name}
💰 Giá thành viên: ${formatVND(product.memberPrice)}

📍 Đại lý: ${hub.name}
👤 Liên hệ: ${hub.leaderName}
📞 SĐT: ${hub.leaderPhone}
📏 Khoảng cách: ${distance}
🚚 ${deliveryTime}

Bấm OK để gửi đơn qua Zalo
  `.trim();

    return Promise.resolve(window.confirm(message));
}

export default {
    createOrder,
    sendOrderToDealer,
    quickOrderProduct,
    buildZaloDeepLink,
    buildSMSFallback,
    buildPhoneCallLink,
    showOrderConfirmation
};
