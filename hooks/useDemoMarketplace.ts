/**
 * useDemoMarketplace.ts - Demo Marketplace hook
 * Thay thế Firebase với mock deals và LocalStorage
 */

import { useState, useEffect } from 'react';
import { Deal } from '../types';
import { useAuth } from '../contexts/DemoAuthContext';
import * as LocalStorage from '../services/LocalStorageService';

// Mock deals data
const MOCK_DEALS: Deal[] = [
    {
        id: 'deal_1',
        title: 'Phân bón NPK 20-20-15 Đầu Trâu',
        brand: 'Đầu Trâu',
        price: 185000,
        originalPrice: 220000,
        unit: 'bao 50kg',
        currentQuantity: 45,
        maxQuantity: 100,
        isPromoted: true,
        status: 'active',
        ecoTag: 'ORGANIC',
        productImage: 'https://images.unsplash.com/photo-1628155930542-a876881c532c?w=500&auto=format&fit=crop',
        createdAt: new Date().toISOString()
    },
    {
        id: 'deal_2',
        title: 'Thuốc trừ sâu sinh học Neem',
        brand: 'BioViet',
        price: 95000,
        originalPrice: 120000,
        unit: 'chai 1 lít',
        currentQuantity: 28,
        maxQuantity: 50,
        isPromoted: false,
        status: 'active',
        ecoTag: 'BIOLOGICAL',
        productImage: 'https://images.unsplash.com/photo-1563713606733-40f4dc404f85?w=500&auto=format&fit=crop',
        createdAt: new Date().toISOString()
    },
    {
        id: 'deal_3',
        title: 'Hạt giống cà phê Robusta chất lượng',
        brand: 'Gia Lai Seeds',
        price: 450000,
        originalPrice: 580000,
        unit: 'kg',
        currentQuantity: 18,
        maxQuantity: 30,
        isPromoted: true,
        status: 'active',
        ecoTag: null,
        productImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop',
        createdAt: new Date().toISOString()
    },
    {
        id: 'deal_4',
        title: 'Máy cắt cỏ cầm tay Honda',
        brand: 'Honda',
        price: 2800000,
        originalPrice: 3500000,
        unit: 'cái',
        currentQuantity: 8,
        maxQuantity: 10,
        isPromoted: false,
        status: 'active',
        ecoTag: null,
        productImage: 'https://images.unsplash.com/photo-1598282361661-6893e36e81dd?w=500&auto=format&fit=crop',
        createdAt: new Date().toISOString()
    },
    {
        id: 'deal_5',
        title: 'Phân bón NPK 16-16-8 Việt Nhật',
        brand: 'Việt Nhật',
        price: 165000,
        originalPrice: 190000,
        unit: 'bao 25kg',
        currentQuantity: 62,
        maxQuantity: 150,
        isPromoted: true,
        status: 'active',
        ecoTag: null,
        productImage: 'https://plus.unsplash.com/premium_photo-1661962360662-5887201c7068?w=500&auto=format&fit=crop',
        createdAt: new Date().toISOString()
    },
    {
        id: 'deal_6',
        title: 'Kéo cắt cành SK5 Nhật Bản',
        brand: 'SK5',
        price: 120000,
        originalPrice: 250000,
        unit: 'cái',
        currentQuantity: 45,
        maxQuantity: 50,
        isPromoted: true,
        status: 'active',
        ecoTag: null,
        productImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop',
        createdAt: new Date().toISOString()
    },
    {
        id: 'deal_7',
        title: 'Vòi tưới cây đa năng 50m',
        brand: 'Total',
        price: 350000,
        originalPrice: 450000,
        unit: 'cuộn',
        currentQuantity: 12,
        maxQuantity: 30,
        isPromoted: false,
        status: 'active',
        ecoTag: null,
        productImage: 'https://images.unsplash.com/photo-1615485925763-867862880877?w=500&auto=format&fit=crop',
        createdAt: new Date().toISOString()
    },
    {
        id: 'deal_8',
        title: 'Thuốc trừ nấm sinh học Trichoderma',
        brand: 'Nông Lâm',
        price: 55000,
        originalPrice: 80000,
        unit: 'gói 1kg',
        currentQuantity: 88,
        maxQuantity: 200,
        isPromoted: true,
        status: 'active',
        ecoTag: 'BIOLOGICAL',
        productImage: 'https://images.unsplash.com/photo-1587049352851-8d4e8918dcf1?w=500&auto=format&fit=crop',
        createdAt: new Date().toISOString()
    }
];

export const useDemoMarketplace = () => {
    const { currentUser } = useAuth();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load mock deals on mount
    useEffect(() => {
        setLoading(true);

        // Simulate loading delay
        setTimeout(() => {
            // Sort: promoted first
            const sortedDeals = [...MOCK_DEALS].sort((a, b) => {
                const p1 = a.isPromoted ? 1 : 0;
                const p2 = b.isPromoted ? 1 : 0;
                return p2 - p1;
            });

            setDeals(sortedDeals);
            setLoading(false);
        }, 500);
    }, []);

    // Reserve slot (demo version)
    const reserveSlot = async (dealId: string) => {
        if (!currentUser) throw new Error("Vui lòng đăng nhập để giữ suất.");

        // Find the deal
        const dealIndex = deals.findIndex(d => d.id === dealId);
        if (dealIndex === -1) {
            throw new Error("Sản phẩm không tồn tại!");
        }

        const deal = deals[dealIndex];
        if (deal.currentQuantity >= deal.maxQuantity) {
            throw new Error("Rất tiếc, suất gom đơn này đã hết!");
        }

        // Update local state
        const updatedDeals = [...deals];
        updatedDeals[dealIndex] = {
            ...deal,
            currentQuantity: deal.currentQuantity + 1
        };
        setDeals(updatedDeals);

        // Save order to LocalStorage
        const order = {
            id: `order_${Date.now()}`,
            campaignId: dealId,
            userId: currentUser.uid,
            quantity: 1,
            totalAmount: deal.price,
            depositAmount: 0,
            depositPaid: false,
            slidingPrice: deal.price,
            pickupQrCode: `QR-${dealId}-${Date.now().toString(36).toUpperCase()}`,
            createdAt: new Date().toISOString()
        };

        LocalStorage.saveCampaignOrder(order);
        LocalStorage.logUserAction(currentUser.uid, 'DEAL_RESERVE', { dealId, title: deal.title });

        return true;
    };

    return { deals, loading, error, reserveSlot };
};

// Export with same name for drop-in replacement
export const useMarketplace = useDemoMarketplace;
